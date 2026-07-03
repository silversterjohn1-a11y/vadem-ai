import { Link } from 'react-router-dom'
import { Sparkles, Close, Check } from '../icons'
import { PERIOD_LABEL, type Period } from '../../hooks/useUsageLimits'

const perks = ['Unlimited AI tutor', 'Unlimited flashcards & exams', 'Lecture transcription', 'Study analytics & planner']

const PERIOD_ADJ: Record<Period, string> = { daily: 'daily', weekly: 'weekly', monthly: 'monthly' }

export default function UpgradeModal({
  open,
  onClose,
  feature,
  period,
  proOnly = false,
}: {
  open: boolean
  onClose: () => void
  /** Human label of the feature that hit the wall, e.g. "AI messages". */
  feature: string
  period: Period
  /** True when the feature is entirely Pro-only (not just rate-limited). */
  proOnly?: boolean
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-navy-700 dark:bg-navy-900">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800"
          aria-label="Close"
        >
          <Close width={18} height={18} />
        </button>

        <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand dark:bg-navy-800 dark:text-brand-400">
          <Sparkles width={24} height={24} />
        </div>

        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {proOnly ? `${feature} is a Pro feature` : `You've reached your ${PERIOD_ADJ[period]} limit`}
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {proOnly
            ? `${feature} is available on the Pro plan. Upgrade to unlock it and everything else.`
            : `You've used all your free ${feature} for ${PERIOD_LABEL[period]}. Upgrade to Pro for unlimited access.`}
        </p>

        <ul className="mt-5 space-y-2.5">
          {perks.map((p) => (
            <li key={p} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
              <Check width={18} height={18} className="shrink-0 text-brand dark:text-brand-400" />
              {p}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link to="/pricing" onClick={onClose} className="btn-primary flex-1 py-3">Upgrade Now</Link>
          <button onClick={onClose} className="btn-outline flex-1 py-3">Maybe later</button>
        </div>
      </div>
    </div>
  )
}
