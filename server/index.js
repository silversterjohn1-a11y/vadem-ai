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

const API_KEY = process.env.ANTHROPIC_API_KEY
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-4-8'
const anthropic = API_KEY ? new Anthropic({ apiKey: API_KEY }) : null

// Keep prompts within a sane token budget.
const MAX_CONTEXT = 16000
const clip = (s = '') => (s.length > MAX_CONTEXT ? s.slice(0, MAX_CONTEXT) + '\n…[truncated]' : s)

/** Call Claude and return the concatenated text output. */
async function ask({ system, messages, maxTokens = 1500 }) {
  const res = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages,
  })
  return res.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim()
}

/** Extract the first JSON value from a model response that may include prose/fences. */
function parseJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const raw = fenced ? fenced[1] : text
  const start = raw.search(/[[{]/)
  if (start === -1) throw new Error('No JSON found in model output')
  return JSON.parse(raw.slice(start, raw.lastIndexOf(raw.includes(']') ? ']' : '}') + 1))
}

const demoNote = 'Demo mode (no ANTHROPIC_API_KEY set) — showing sample content. Add your key to .env for real AI output.'

// ── Health ──────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ ok: true, ai: Boolean(anthropic), model: MODEL }))

// ── PDF upload → text ────────────────────────────────────────────────────────
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send('No file uploaded')
    const data = await pdfParse(req.file.buffer)
    res.json({ name: req.file.originalname, text: data.text || '', chars: (data.text || '').length })
  } catch (e) {
    res.status(500).send('Failed to parse PDF: ' + e.message)
  }
})

// ── AI Tutor chat ─────────────────────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  const { messages = [], context = '' } = req.body
  if (!anthropic) {
    return res.json({ reply: `${demoNote}\n\nGreat question! Once your API key is set, I'll answer using your uploaded document.` })
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
    res.status(500).send(e.message)
  }
})

// ── Explain Simply ────────────────────────────────────────────────────────────
app.post('/api/explain', async (req, res) => {
  const { text = '' } = req.body
  if (!anthropic) return res.json({ reply: `${demoNote}\n\nIn simple terms: ${text.slice(0, 120)}…` })
  try {
    const reply = await ask({
      system: 'You explain medical concepts to a first-year student in plain, simple language with a short analogy. Keep it under 150 words.',
      messages: [{ role: 'user', content: `Explain this simply:\n\n${clip(text)}` }],
      maxTokens: 500,
    })
    res.json({ reply })
  } catch (e) {
    res.status(500).send(e.message)
  }
})

// ── Flashcards ────────────────────────────────────────────────────────────────
app.post('/api/flashcards', async (req, res) => {
  const { context = '', count = 10 } = req.body
  if (!anthropic) {
    return res.json({
      cards: Array.from({ length: Math.min(count, 5) }, (_, i) => ({
        front: `Sample question ${i + 1} (${demoNote})`,
        back: 'Sample answer — set ANTHROPIC_API_KEY for real flashcards generated from your document.',
      })),
    })
  }
  try {
    const out = await ask({
      system: 'You generate high-yield spaced-repetition flashcards for medical students from the supplied material. Respond ONLY with a JSON array of objects: [{"front": "question", "back": "answer"}]. No prose.',
      messages: [{ role: 'user', content: `Create ${count} flashcards from this material:\n\n${clip(context)}` }],
      maxTokens: 2500,
    })
    res.json({ cards: parseJson(out) })
  } catch (e) {
    res.status(500).send(e.message)
  }
})

// ── Exam (MCQs) ───────────────────────────────────────────────────────────────
app.post('/api/exam', async (req, res) => {
  const { context = '', count = 5 } = req.body
  if (!anthropic) {
    return res.json({
      questions: Array.from({ length: Math.min(count, 3) }, (_, i) => ({
        question: `Sample MCQ ${i + 1}? (${demoNote})`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        answer: 1,
        explanation: 'Set ANTHROPIC_API_KEY for real questions generated from your document.',
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
    res.json({ questions: parseJson(out) })
  } catch (e) {
    res.status(500).send(e.message)
  }
})

// ── Study plan ────────────────────────────────────────────────────────────────
app.post('/api/study-plan', async (req, res) => {
  const { goal = '', days = 7, hoursPerDay = 3 } = req.body
  if (!anthropic) {
    return res.json({
      plan: Array.from({ length: Math.min(days, 3) }, (_, i) => ({
        day: `Day ${i + 1}`,
        focus: 'Sample focus',
        tasks: [`${demoNote}`, 'Review key concepts', 'Practice questions'],
      })),
    })
  }
  try {
    const out = await ask({
      system:
        'You are an expert medical-study coach. Build a realistic day-by-day revision plan. ' +
        'Respond ONLY with a JSON array of objects: [{"day": "Day 1", "focus": "short topic", "tasks": [strings]}]. No prose.',
      messages: [{ role: 'user', content: `Goal: ${goal}\nDays available: ${days}\nHours per day: ${hoursPerDay}\nBuild a ${days}-day plan.` }],
      maxTokens: 2500,
    })
    res.json({ plan: parseJson(out) })
  } catch (e) {
    res.status(500).send(e.message)
  }
})

const PORT = process.env.PORT || 8787
app.listen(PORT, () => console.log(`VademAI API on http://localhost:${PORT} (AI: ${anthropic ? 'on' : 'demo'})`))
