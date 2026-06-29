import { useState, type FormEvent } from 'react'
import { api, type StudyPlanDay } from '../../lib/api'
import PageHeader from '../../components/dashboard/PageHeader'
import { Calendar, Check } from '../../components/icons'

export default function Planner() {
  const [goal, setGoal] = useState('')
  const [days, setDays] = useState(7)
  const [hours, setHours] = useState(3)
  const [plan, setPlan] = useState<StudyPlanDay[]>([])
  const [done, setDone] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!goal.trim()) return
    setError('')
    setLoading(true)
    setPlan([])
    setDone(new Set())
    try {
      const { plan } = await api.studyPlan(goal, days, hours)
      setPlan(plan)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not build a plan.')
    } finally {
      setLoading(false)
    }
  }

  function toggleTask(key: string) {
    setDone((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  return (
    <div>
      <PageHeader title="AI Study Planner" subtitle="Get a personalized revision schedule built around your exam." />

      <form onSubmit={onSubmit} className="card mb-6 space-y-4">
        <div>
          <label className="label" htmlFor="goal">What are you studying for?</label>
          <input
            id="goal"
            className="input"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g. Cardiology final exam covering ECGs, arrhythmias and heart failure"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="label">Days until exam</span>
            <select className="input" value={days} onChange={(e) => setDays(Number(e.target.value))}>
              {[3, 5, 7, 10, 14, 21, 30].map((n) => <option key={n} value={n}>{n} days</option>)}
            </select>
          </label>
          <label className="block">
            <span className="label">Hours per day</span>
            <select className="input" value={hours} onChange={(e) => setHours(Number(e.target.value))}>
              {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} hours</option>)}
            </select>
          </label>
        </div>
        <button className="btn-primary w-full py-3" disabled={loading}>
          <Calendar width={18} height={18} />
          {loading ? 'Building your plan…' : 'Generate study plan'}
        </button>
      </form>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="space-y-4">
        {plan.map((d, di) => (
          <div key={di} className="card">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">{d.day}</h3>
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">{d.focus}</span>
            </div>
            <ul className="space-y-2">
              {d.tasks.map((t, ti) => {
                const key = `${di}-${ti}`
                const checked = done.has(key)
                return (
                  <li key={ti}>
                    <button
                      onClick={() => toggleTask(key)}
                      className="flex w-full items-start gap-3 text-left text-sm"
                    >
                      <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border ${
                        checked ? 'border-brand bg-brand text-white' : 'border-slate-300'
                      }`}>
                        {checked && <Check width={14} height={14} />}
                      </span>
                      <span className={checked ? 'text-slate-400 line-through' : 'text-slate-700'}>{t}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
