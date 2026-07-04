import express from 'express'
import cors from 'cors'
import multer from 'multer'
import dotenv from 'dotenv'
import Anthropic from '@anthropic-ai/sdk'
import { createRequire } from 'node:module'

dotenv.config()

// pdf-parse's package entry runs a debug routine on import; load the lib directly.
const require = createRequire(import.meta.url)
const pdfParse = require('pdf-parse/lib/pdf-parse.js')

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } })

// ── Anthropic client ──────────────────────────────────────────────────────────
// The key is read from the server-side environment ONLY (never VITE_-prefixed),
// so it is never bundled into or exposed to the browser.
const API_KEY = process.env.ANTHROPIC_API_KEY
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6'

// Built-in retries handle transient rate limits / overload with backoff.
const anthropic = API_KEY ? new Anthropic({ apiKey: API_KEY, maxRetries: 2, timeout: 60_000 }) : null

if (!anthropic) {
  console.warn(
    '[VademAI] ANTHROPIC_API_KEY is not set — AI endpoints will return clearly-labelled sample content. ' +
      'Set the key (locally in .env, or in your host env vars) to enable real Claude responses.',
  )
}

// Keep prompts within a sane token budget.
const MAX_CONTEXT = 16000
const clip = (s = '') => (s.length > MAX_CONTEXT ? s.slice(0, MAX_CONTEXT) + '\n…[truncated]' : s)

/** Call Claude and return the concatenated text output. */
async function ask({ system, messages, maxTokens = 1500 }) {
  const res = await anthropic.messages.create({ model: MODEL, max_tokens: maxTokens, system, messages })
  return res.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim()
}

/** Extract the first JSON value from a model response that may include prose/fences. */
function parseJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const raw = fenced ? fenced[1] : text
  const start = raw.search(/[[{]/)
  if (start === -1) throw new Error('No JSON found in model output')
  return JSON.parse(raw.slice(start, raw.lastIndexOf(raw.includes(']') ? ']' : '}') + 1))
}

/**
 * Map an Anthropic/API error to a clean HTTP response. Handles rate limits,
 * auth failures, overload, and timeouts with actionable messages. The raw error
 * is logged server-side only — never leaked to the client.
 */
function aiError(res, e, label) {
  const status = e?.status ?? e?.statusCode
  console.error(`[VademAI:${label}]`, status ?? '', e?.message ?? e)

  if (status === 429) {
    return res
      .status(429)
      .json({ error: 'The AI is receiving a lot of requests right now. Please wait a few seconds and try again.' })
  }
  if (status === 401 || status === 403) {
    return res.status(500).json({ error: 'AI service authentication failed. Please contact support.' })
  }
  if (status === 529 || status === 503) {
    return res.status(503).json({ error: 'The AI service is temporarily overloaded. Please try again shortly.' })
  }
  if (status === 400 || status === 413) {
    return res.status(400).json({ error: 'That request was too large or malformed — try a shorter document or prompt.' })
  }
  if (e?.name === 'APIConnectionTimeoutError' || /timeout/i.test(e?.message ?? '')) {
    return res.status(504).json({ error: 'The AI took too long to respond. Please try again.' })
  }
  return res.status(502).json({ error: 'The AI service failed to respond. Please try again.' })
}

/** Sample content returned ONLY when no API key is configured. */
const demoNote = 'Sample content — no ANTHROPIC_API_KEY is configured on the server. Set it to get real AI output.'

// ── Health ──────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ ok: true, ai: Boolean(anthropic), model: MODEL }))

// ── PDF upload → text ────────────────────────────────────────────────────────
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' })
    const data = await pdfParse(req.file.buffer)
    res.json({ name: req.file.originalname, text: data.text || '', chars: (data.text || '').length })
  } catch (e) {
    console.error('[VademAI:upload]', e?.message ?? e)
    res.status(422).json({ error: 'Could not read that PDF. It may be corrupted or an unsupported format.' })
  }
})

// ── AI Tutor chat ─────────────────────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  const { messages = [], context = '' } = req.body
  if (!anthropic) {
    return res.json({ reply: `${demoNote}\n\nOnce a key is configured, I'll answer using your uploaded document.` })
  }
  try {
    const system =
      'You are VademAI, a concise, accurate medical-study tutor for medical students. ' +
      'Answer clearly and at exam level. Use the provided study material as your primary source; ' +
      'if the answer is not in it, say so and give general guidance. Always add a one-line reminder ' +
      'that this is a study aid, not medical advice, when giving clinical info.' +
      (context ? `\n\n--- STUDY MATERIAL ---\n${clip(context)}` : '')
    const reply = await ask({ system, messages, maxTokens: 1200 })
    res.json({ reply })
  } catch (e) {
    aiError(res, e, 'chat')
  }
})

// ── Explain Simply ────────────────────────────────────────────────────────────
app.post('/api/explain', async (req, res) => {
  const { text = '' } = req.body
  if (!anthropic) return res.json({ reply: `${demoNote}` })
  try {
    const reply = await ask({
      system:
        'You explain medical concepts to a first-year student in plain, simple language with a short analogy. Keep it under 150 words.',
      messages: [{ role: 'user', content: `Explain this simply:\n\n${clip(text)}` }],
      maxTokens: 500,
    })
    res.json({ reply })
  } catch (e) {
    aiError(res, e, 'explain')
  }
})

// ── Flashcards ────────────────────────────────────────────────────────────────
app.post('/api/flashcards', async (req, res) => {
  const { context = '', count = 10 } = req.body
  if (!anthropic) {
    return res.json({
      cards: Array.from({ length: Math.min(count, 3) }, (_, i) => ({
        front: `Sample card ${i + 1}`,
        back: demoNote,
      })),
    })
  }
  try {
    const out = await ask({
      system:
        'You generate high-yield spaced-repetition flashcards for medical students from the supplied material. Respond ONLY with a JSON array of objects: [{"front": "question", "back": "answer"}]. No prose.',
      messages: [{ role: 'user', content: `Create ${count} flashcards from this material:\n\n${clip(context)}` }],
      maxTokens: 2500,
    })
    let cards
    try {
      cards = parseJson(out)
    } catch {
      return res.status(502).json({ error: 'The AI returned flashcards in an unexpected format. Please try again.' })
    }
    res.json({ cards })
  } catch (e) {
    aiError(res, e, 'flashcards')
  }
})

// ── Exam (MCQs) ───────────────────────────────────────────────────────────────
app.post('/api/exam', async (req, res) => {
  const { context = '', count = 5 } = req.body
  if (!anthropic) {
    return res.json({
      questions: Array.from({ length: Math.min(count, 2) }, (_, i) => ({
        question: `Sample MCQ ${i + 1}?`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        answer: 1,
        explanation: demoNote,
      })),
    })
  }
  try {
    const out = await ask({
      system:
        'You write USMLE-style single-best-answer MCQs from the supplied material. ' +
        'Respond ONLY with a JSON array: [{"question": string, "options": [4 strings], "answer": number (0-based index of correct option), "explanation": string}]. No prose.',
      messages: [{ role: 'user', content: `Create ${count} MCQs from this material:\n\n${clip(context)}` }],
      maxTokens: 3000,
    })
    let questions
    try {
      questions = parseJson(out)
    } catch {
      return res.status(502).json({ error: 'The AI returned questions in an unexpected format. Please try again.' })
    }
    res.json({ questions })
  } catch (e) {
    aiError(res, e, 'exam')
  }
})

// ── Study plan ────────────────────────────────────────────────────────────────
app.post('/api/study-plan', async (req, res) => {
  const { goal = '', days = 7, hoursPerDay = 3 } = req.body
  if (!anthropic) {
    return res.json({
      plan: Array.from({ length: Math.min(days, 2) }, (_, i) => ({
        day: `Day ${i + 1}`,
        focus: 'Sample focus',
        tasks: [demoNote, 'Review key concepts'],
      })),
    })
  }
  try {
    const out = await ask({
      system:
        'You are an expert medical-study coach. Build a realistic day-by-day revision plan. ' +
        'Respond ONLY with a JSON array of objects: [{"day": "Day 1", "focus": "short topic", "tasks": [strings]}]. No prose.',
      messages: [
        {
          role: 'user',
          content: `Goal: ${goal}\nDays available: ${days}\nHours per day: ${hoursPerDay}\nBuild a ${days}-day plan.`,
        },
      ],
      maxTokens: 2500,
    })
    let plan
    try {
      plan = parseJson(out)
    } catch {
      return res.status(502).json({ error: 'The AI returned a plan in an unexpected format. Please try again.' })
    }
    res.json({ plan })
  } catch (e) {
    aiError(res, e, 'study-plan')
  }
})

export default app
