import { useState } from 'react'
import { api } from '../../lib/api'
import { Sparkles, Close } from '../icons'

/**
 * "Explain Simply" button — sends the given text to the backend and shows a
 * plain-language explanation in an inline popover. Used anywhere a concept
 * might need an ELI5 (flashcards, exam explanations, etc.).
 */
export default function ExplainButton({ text, label = 'Explain simply' }: { text: string; label?: string }) {
  const [open, setOpen] = useState(false)
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function explain() {
    setOpen(true)
    if (reply || loading) return
    setLoading(true)
    setError('')
    try {
      const res = await api.explainSimply(text)
      setReply(res.reply)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not explain that.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); explain() }}
        className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:text-brand-600"
      >
        <Sparkles width={14} height={14} /> {label}
      </button>

      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute left-0 top-7 z-20 w-72 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-lg dark:border-navy-700 dark:bg-navy-850"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-brand dark:text-brand-400">In simple terms</span>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <Close width={16} height={16} />
            </button>
          </div>
          {loading && <p className="text-sm text-slate-500 dark:text-slate-400">Thinking…</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {reply && <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">{reply}</p>}
        </div>
      )}
    </div>
  )
}
