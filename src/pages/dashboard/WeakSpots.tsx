import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useFlaggedQuestions } from '../../hooks/useFlaggedQuestions'
import PageHeader from '../../components/dashboard/PageHeader'
import { Target, Repeat, Check, Trash, Exam } from '../../components/icons'

export default function WeakSpots() {
  const { items, loading, unflag } = useFlaggedQuestions()
  const [reviewing, setReviewing] = useState(false)
  const [idx, setIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)

  function startReview() {
    setIdx(0)
    setRevealed(false)
    setReviewing(true)
  }

  function next() {
    setRevealed(false)
    if (idx + 1 >= items.length) setReviewing(false)
    else setIdx(idx + 1)
  }

  async function master(id: string) {
    await unflag(id)
    // items shrinks by one; keep idx in range (staying at idx shows the next item)
    setRevealed(false)
    if (items.length - 1 <= idx) setReviewing(false)
  }

  // ── Review (mini practice session) ──────────────────────────────────────────
  if (reviewing && items.length > 0) {
    const q = items[Math.min(idx, items.length - 1)]
    return (
      <div>
        <PageHeader title="Practice weak spots" subtitle={`Question ${Math.min(idx + 1, items.length)} of ${items.length}`}>
          <button className="btn-ghost text-slate-600 dark:text-slate-300" onClick={() => setReviewing(false)}>
            Exit review
          </button>
        </PageHeader>

        <div className="mx-auto max-w-2xl">
          <div className="card">
            {q.topic && (
              <span className="inline-flex rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 dark:bg-navy-800 dark:text-brand-300">
                {q.topic.replace(/\.pdf$/i, '')}
              </span>
            )}
            <p className="mt-3 text-lg font-semibold text-slate-900 dark:text-slate-100">{q.question}</p>

            {revealed ? (
              <div className="mt-4 space-y-3">
                <div className="rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm dark:border-green-700 dark:bg-green-950/40">
                  <span className="font-semibold text-green-700 dark:text-green-300">Correct answer: </span>
                  <span className="text-slate-800 dark:text-slate-200">{q.correct_answer || '—'}</span>
                </div>
                {q.user_answer && q.user_answer !== q.correct_answer && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-navy-700 dark:bg-navy-850">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Your earlier answer: </span>
                    <span className="text-slate-700 dark:text-slate-300">{q.user_answer}</span>
                  </div>
                )}
              </div>
            ) : (
              <button className="btn-outline mt-5" onClick={() => setRevealed(true)}>Show answer</button>
            )}
          </div>

          {revealed && (
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button className="btn-primary flex-1 py-3" onClick={() => master(q.id)}>
                <Check width={18} height={18} /> Mastered — remove
              </button>
              <button className="btn-outline flex-1 py-3" onClick={next}>Keep practicing</button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── List of weak spots ──────────────────────────────────────────────────────
  return (
    <div>
      <PageHeader title="Review Weak Spots" subtitle="Questions you flagged or answered incorrectly.">
        {items.length > 0 && (
          <button className="btn-primary" onClick={startReview}>
            <Repeat width={18} height={18} /> Practice Again
          </button>
        )}
      </PageHeader>

      {loading ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading weak spots…</p>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center dark:border-navy-700 dark:bg-navy-900">
          <div className="mb-3 grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand dark:bg-navy-800 dark:text-brand-400">
            <Target width={24} height={24} />
          </div>
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">No weak spots yet</p>
          <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            Flag tricky questions in Exam Mode, or get one wrong, and they'll show up here for focused review.
          </p>
          <Link to="/dashboard/exam" className="btn-outline mt-4">
            <Exam width={18} height={18} /> Go to Exam Mode
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((q) => (
            <div key={q.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {q.topic && (
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-navy-800 dark:text-slate-300">
                      {q.topic.replace(/\.pdf$/i, '')}
                    </span>
                  )}
                  <p className="mt-2 font-semibold text-slate-900 dark:text-slate-100">{q.question}</p>
                </div>
                <button
                  onClick={() => unflag(q.id)}
                  title="Remove from weak spots"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                >
                  <Trash width={18} height={18} />
                </button>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg bg-green-50 px-3 py-2 text-sm dark:bg-green-950/30">
                  <span className="font-semibold text-green-700 dark:text-green-300">Correct: </span>
                  <span className="text-slate-700 dark:text-slate-300">{q.correct_answer || '—'}</span>
                </div>
                {q.user_answer && q.user_answer !== q.correct_answer && (
                  <div className="rounded-lg bg-red-50 px-3 py-2 text-sm dark:bg-red-950/30">
                    <span className="font-semibold text-red-700 dark:text-red-300">You answered: </span>
                    <span className="text-slate-700 dark:text-slate-300">{q.user_answer}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
