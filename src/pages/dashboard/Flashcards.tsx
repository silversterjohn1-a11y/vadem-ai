import { useState } from 'react'
import { useDocuments } from '../../context/DocumentsContext'
import { api, type Flashcard } from '../../lib/api'
import PageHeader from '../../components/dashboard/PageHeader'
import DocPicker from '../../components/dashboard/DocPicker'
import ExplainButton from '../../components/dashboard/ExplainButton'
import { Cards, Sparkles } from '../../components/icons'

export default function Flashcards() {
  const { active } = useDocuments()
  const [count, setCount] = useState(10)
  const [cards, setCards] = useState<Flashcard[]>([])
  const [flipped, setFlipped] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function generate() {
    if (!active) return
    setError('')
    setLoading(true)
    setCards([])
    setFlipped(new Set())
    try {
      const { cards } = await api.flashcards(active.text, count)
      setCards(cards)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed.')
    } finally {
      setLoading(false)
    }
  }

  function toggle(i: number) {
    setFlipped((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  return (
    <div>
      <PageHeader title="Smart Flashcards" subtitle="Auto-generate flashcards from your active document.">
        <DocPicker />
      </PageHeader>

      <div className="card mb-6 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <span className="font-medium text-slate-600">Cards:</span>
          <select className="input w-24 py-2" value={count} onChange={(e) => setCount(Number(e.target.value))}>
            {[5, 10, 15, 20].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <button className="btn-primary" onClick={generate} disabled={loading || !active}>
          <Sparkles width={18} height={18} />
          {loading ? 'Generating…' : 'Generate flashcards'}
        </button>
        {!active && <span className="text-sm text-slate-500">Select a document first.</span>}
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {cards.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center dark:border-navy-700 dark:bg-navy-900">
          <div className="mb-3 grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand dark:bg-navy-800 dark:text-brand-400">
            <Cards width={24} height={24} />
          </div>
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">No flashcards yet</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Generate a deck from your document to start revising.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c, i) => (
          <div
            key={i}
            role="button"
            tabIndex={0}
            onClick={() => toggle(i)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(i) } }}
            className="group flex min-h-[160px] cursor-pointer flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-brand-200 hover:shadow-md dark:border-navy-800 dark:bg-navy-900 dark:hover:border-brand-700"
          >
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand dark:text-brand-400">
              {flipped.has(i) ? 'Answer' : 'Question'} · #{i + 1}
            </div>
            <p className="flex-1 text-sm leading-relaxed text-slate-800 dark:text-slate-200">
              {flipped.has(i) ? c.back : c.front}
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-slate-400">Click to {flipped.has(i) ? 'see question' : 'reveal answer'}</span>
              {flipped.has(i) && <ExplainButton text={`${c.front}\n${c.back}`} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
