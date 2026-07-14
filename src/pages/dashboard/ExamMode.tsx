import { useState } from 'react'
import { useDocuments } from '../../context/DocumentsContext'
import { api, type MCQ } from '../../lib/api'
import { useUsageLimits } from '../../hooks/useUsageLimits'
import { useFlaggedQuestions } from '../../hooks/useFlaggedQuestions'
import PageHeader from '../../components/dashboard/PageHeader'
import DocPicker from '../../components/dashboard/DocPicker'
import UpgradeModal from '../../components/dashboard/UpgradeModal'
import UsageBadge from '../../components/dashboard/UsageBadge'
import { Exam, Check, Close, Bookmark } from '../../components/icons'

export default function ExamMode() {
  const { active } = useDocuments()
  const { checkLimit, increment } = useUsageLimits()
  const { flag, unflagByQuestion } = useFlaggedQuestions()
  const [count, setCount] = useState(5)
  const [questions, setQuestions] = useState<MCQ[]>([])
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [flagged, setFlagged] = useState<Set<string>>(new Set())

  const limit = checkLimit('exam')
  const topic = active?.name ?? 'General'

  function payloadFor(q: MCQ, qi: number) {
    const picked = answers[qi]
    return {
      question: q.question,
      correct_answer: q.options[q.answer],
      user_answer: picked != null ? q.options[picked] : 'Not answered',
      topic,
    }
  }

  function toggleFlag(q: MCQ, qi: number) {
    setFlagged((prev) => {
      const next = new Set(prev)
      if (next.has(q.question)) {
        next.delete(q.question)
        void unflagByQuestion(q.question)
      } else {
        next.add(q.question)
        void flag(payloadFor(q, qi))
      }
      return next
    })
  }

  function submit() {
    setSubmitted(true)
    // Auto-flag every question answered incorrectly.
    const wrong = new Set(flagged)
    questions.forEach((q, qi) => {
      if (answers[qi] !== q.answer && !wrong.has(q.question)) {
        wrong.add(q.question)
        void flag(payloadFor(q, qi))
      }
    })
    setFlagged(wrong)
  }

  async function generate() {
    if (!active) return
    if (!checkLimit('exam').allowed) {
      setShowUpgrade(true)
      return
    }
    setError('')
    setLoading(true)
    setQuestions([])
    setAnswers({})
    setSubmitted(false)
    setFlagged(new Set())
    try {
      const { questions } = await api.exam(active.text, count)
      setQuestions(questions)
      void increment('exam')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed.')
    } finally {
      setLoading(false)
    }
  }

  const score = questions.reduce((acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0), 0)
  const allAnswered = questions.length > 0 && Object.keys(answers).length === questions.length

  return (
    <div>
      <PageHeader title="Exam Mode" subtitle="Practice USMLE-style MCQs generated from your material.">
        <UsageBadge result={limit} />
        <DocPicker />
      </PageHeader>

      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} feature="Exam sessions" period="weekly" />

      <div className="card mb-6 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <span className="font-medium text-slate-600">Questions:</span>
          <select className="input w-24 py-2" value={count} onChange={(e) => setCount(Number(e.target.value))}>
            {[3, 5, 10, 15].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <button className="btn-primary" onClick={generate} disabled={loading || !active}>
          <Exam width={18} height={18} />
          {loading ? 'Generating…' : 'Start exam'}
        </button>
        {!active && <span className="text-sm text-slate-500">Select a document first.</span>}
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {submitted && (
        <div className="mb-6 rounded-2xl border border-brand-200 bg-brand-50 p-5 text-center dark:border-navy-700 dark:bg-navy-850">
          <div className="text-3xl font-extrabold text-brand dark:text-brand-400">{score} / {questions.length}</div>
          <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {Math.round((score / questions.length) * 100)}% correct — {score === questions.length ? 'perfect!' : 'review the explanations below.'}
          </div>
        </div>
      )}

      <div className="space-y-5">
        {questions.map((q, qi) => {
          const picked = answers[qi]
          return (
            <div key={qi} className="card">
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold text-slate-900 dark:text-slate-100">{qi + 1}. {q.question}</p>
                <button
                  type="button"
                  onClick={() => toggleFlag(q, qi)}
                  aria-pressed={flagged.has(q.question)}
                  title={flagged.has(q.question) ? 'Remove from weak spots' : 'Flag for review'}
                  className={`shrink-0 rounded-lg p-1.5 transition ${
                    flagged.has(q.question)
                      ? 'text-brand dark:text-brand-400'
                      : 'text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400'
                  }`}
                >
                  <Bookmark width={20} height={20} fill={flagged.has(q.question) ? 'currentColor' : 'none'} />
                </button>
              </div>
              <div className="mt-4 space-y-2">
                {q.options.map((opt, oi) => {
                  const isPicked = picked === oi
                  const isCorrect = q.answer === oi
                  let cls = 'border-slate-200 hover:border-brand-300 dark:border-navy-700 dark:hover:border-brand-500'
                  if (submitted) {
                    if (isCorrect) cls = 'border-green-400 bg-green-50 dark:border-green-600 dark:bg-green-950/40'
                    else if (isPicked) cls = 'border-red-400 bg-red-50 dark:border-red-600 dark:bg-red-950/40'
                    else cls = 'border-slate-200 dark:border-navy-700'
                  } else if (isPicked) {
                    cls = 'border-brand bg-brand-50 dark:border-brand-500 dark:bg-navy-800'
                  }
                  return (
                    <button
                      key={oi}
                      disabled={submitted}
                      onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                      className={`flex w-full items-center justify-between gap-3 rounded-lg border px-4 py-2.5 text-left text-sm transition ${cls}`}
                    >
                      <span><span className="font-semibold">{String.fromCharCode(65 + oi)}.</span> {opt}</span>
                      {submitted && isCorrect && <Check width={18} height={18} className="text-green-600" />}
                      {submitted && isPicked && !isCorrect && <Close width={18} height={18} className="text-red-600" />}
                    </button>
                  )
                })}
              </div>
              {submitted && (
                <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:bg-navy-850 dark:text-slate-300">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">Explanation: </span>{q.explanation}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {questions.length > 0 && !submitted && (
        <button
          className="btn-primary mt-6 w-full py-3"
          disabled={!allAnswered}
          onClick={submit}
        >
          {allAnswered ? 'Submit exam' : `Answer all questions (${Object.keys(answers).length}/${questions.length})`}
        </button>
      )}
    </div>
  )
}
