import { Link } from 'react-router-dom'
import { useUsageLimits, PERIOD_LABEL } from '../../hooks/useUsageLimits'

export default function UsageMeter() {
  const { usage, isPro, loading } = useUsageLimits()

  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Your usage</h2>
        {isPro ? (
          <span className="rounded-full bg-brand px-2.5 py-1 text-xs font-semibold text-white">Pro · Unlimited</span>
        ) : (
          <Link to="/pricing" className="text-xs font-semibold text-brand hover:text-brand-600 dark:text-brand-400">
            Upgrade →
          </Link>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading usage…</p>
      ) : (
        <div className="space-y-4">
          {usage.map((u) => {
            const pct = u.unlimited ? 0 : u.limit === 0 ? 100 : Math.min(100, Math.round((u.used / u.limit) * 100))
            const atLimit = !u.unlimited && u.remaining === 0
            return (
              <div key={u.feature}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{u.label}</span>
                  {u.unlimited ? (
                    <span className="text-xs font-semibold text-brand dark:text-brand-400">Unlimited</span>
                  ) : u.proOnly ? (
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Pro only</span>
                  ) : (
                    <span className={`text-xs font-medium ${atLimit ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
                      {u.used}/{u.limit} {PERIOD_LABEL[u.period]}
                    </span>
                  )}
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-navy-800">
                  <div
                    className={`h-full rounded-full transition-all ${
                      u.unlimited ? 'bg-brand/30' : u.proOnly ? 'bg-slate-300 dark:bg-navy-700' : atLimit ? 'bg-red-500' : 'bg-brand'
                    }`}
                    style={{ width: u.unlimited ? '100%' : `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
