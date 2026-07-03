import { PERIOD_LABEL, type LimitResult } from '../../hooks/useUsageLimits'

/** Small pill showing remaining usage for a feature (or "Unlimited" on Pro). */
export default function UsageBadge({ result }: { result: LimitResult }) {
  if (result.unlimited) {
    return (
      <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-navy-800 dark:text-brand-300">
        Unlimited
      </span>
    )
  }
  const atLimit = result.remaining === 0
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        atLimit
          ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
          : 'bg-slate-100 text-slate-600 dark:bg-navy-800 dark:text-slate-300'
      }`}
    >
      {result.used}/{result.limit} {PERIOD_LABEL[result.period]}
    </span>
  )
}
