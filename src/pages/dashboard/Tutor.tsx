import { useRef, useState, type FormEvent } from 'react'
import { useDocuments } from '../../context/DocumentsContext'
import { api, type ChatMessage } from '../../lib/api'
import PageHeader from '../../components/dashboard/PageHeader'
import DocPicker from '../../components/dashboard/DocPicker'
import { Send, Sparkles } from '../../components/icons'

const suggestions = [
  'Summarize the key points of this document.',
  'What are the most high-yield facts for an exam?',
  'Quiz me with 3 quick questions.',
]

export default function Tutor() {
  const { active } = useDocuments()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  async function send(text: string) {
    if (!text.trim() || loading) return
    setError('')
    const next: ChatMessage[] = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setInput('')
    setLoading(true)
    try {
      const { reply } = await api.chat(next, active?.text ?? '')
      setMessages([...next, { role: 'assistant', content: reply }])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setLoading(false)
      requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: 1e9, behavior: 'smooth' }))
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    send(input)
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col lg:h-[calc(100vh-5rem)]">
      <PageHeader title="AI Medical Tutor" subtitle="Ask questions grounded in your uploaded material.">
        <DocPicker />
      </PageHeader>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-3 grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand">
              <Sparkles width={24} height={24} />
            </div>
            <p className="text-sm font-medium text-slate-900">Ask your AI tutor anything</p>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {active ? `Answers will be grounded in "${active.name}".` : 'Tip: set an active document for grounded answers.'}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {suggestions.map((s) => (
                <button key={s} onClick={() => send(s)} className="btn-outline px-3 py-1.5 text-xs">{s}</button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === 'user' ? 'bg-brand text-white' : 'bg-slate-100 text-slate-800'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-slate-100 px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
              </div>
            </div>
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <form onSubmit={onSubmit} className="mt-3 flex items-end gap-2">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              send(input)
            }
          }}
          placeholder="Ask about your material…"
          className="input max-h-40 resize-none"
        />
        <button type="submit" className="btn-primary h-11 px-4" disabled={loading || !input.trim()}>
          <Send width={18} height={18} />
        </button>
      </form>
    </div>
  )
}
