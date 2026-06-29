/**
 * Thin client for the VademAI backend (Express server in /server).
 * The backend proxies all Anthropic Claude calls so the API key stays
 * server-side and never touches the browser bundle.
 */

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface Flashcard {
  front: string
  back: string
}

export interface MCQ {
  question: string
  options: string[]
  /** index into `options` */
  answer: number
  explanation: string
}

export interface StudyPlanDay {
  day: string
  focus: string
  tasks: string[]
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Request failed (${res.status})`)
  }
  return res.json() as Promise<T>
}

export const api = {
  /** Upload a PDF and get back extracted text. */
  async uploadPdf(file: File): Promise<{ name: string; text: string; chars: number }> {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: form })
    if (!res.ok) throw new Error((await res.text()) || 'Upload failed')
    return res.json()
  },

  chat(messages: ChatMessage[], context: string) {
    return post<{ reply: string }>('/chat', { messages, context })
  },

  explainSimply(text: string) {
    return post<{ reply: string }>('/explain', { text })
  },

  flashcards(context: string, count = 10) {
    return post<{ cards: Flashcard[] }>('/flashcards', { context, count })
  },

  exam(context: string, count = 5) {
    return post<{ questions: MCQ[] }>('/exam', { context, count })
  },

  studyPlan(goal: string, days: number, hoursPerDay: number) {
    return post<{ plan: StudyPlanDay[] }>('/study-plan', { goal, days, hoursPerDay })
  },
}
