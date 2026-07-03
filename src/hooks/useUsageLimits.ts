import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

/** Features that are metered against plan limits. */
export type Feature = 'tutor' | 'flashcards' | 'exam' | 'documents' | 'transcription'
export type Period = 'daily' | 'weekly' | 'monthly'

interface FeatureConfig {
  label: string
  period: Period
  /** Free-plan allowance. 0 means the feature is Pro-only. */
  freeLimit: number
}

/** Free-plan limits. Pro is unlimited for every feature. */
export const FEATURES: Record<Feature, FeatureConfig> = {
  tutor: { label: 'AI messages', period: 'daily', freeLimit: 5 },
  flashcards: { label: 'Flashcard sets', period: 'monthly', freeLimit: 10 },
  exam: { label: 'Exam sessions', period: 'weekly', freeLimit: 1 },
  documents: { label: 'Documents', period: 'monthly', freeLimit: 2 },
  transcription: { label: 'Transcription', period: 'monthly', freeLimit: 0 },
}

const ALL_FEATURES = Object.keys(FEATURES) as Feature[]

export const PERIOD_LABEL: Record<Period, string> = {
  daily: 'today',
  weekly: 'this week',
  monthly: 'this month',
}

export interface LimitResult {
  allowed: boolean
  used: number
  /** `Infinity` for unlimited (Pro or unmetered). */
  limit: number
  remaining: number
  period: Period
  /** True when the feature is unavailable on the current plan (Pro-only). */
  proOnly: boolean
  unlimited: boolean
}

export interface UsageRow extends LimitResult {
  feature: Feature
  label: string
}

/** Start of the current period (local time) for rollover comparisons. */
function periodStart(period: Period): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  if (period === 'daily') return d
  if (period === 'weekly') {
    const mondayIndex = (d.getDay() + 6) % 7 // 0 = Monday
    d.setDate(d.getDate() - mondayIndex)
    return d
  }
  d.setDate(1) // monthly
  return d
}

type Counts = Record<Feature, number>
const zeroCounts = (): Counts => ALL_FEATURES.reduce((a, f) => ({ ...a, [f]: 0 }), {} as Counts)

// ── Local-storage fallback (demo mode, or before the table is migrated) ───────
interface LocalRec { count: number; periodStart: string }
const localKey = (uid: string) => `vademai.usage.${uid}`

function loadLocal(uid: string): Partial<Record<Feature, LocalRec>> {
  try {
    return JSON.parse(localStorage.getItem(localKey(uid)) || '{}')
  } catch {
    return {}
  }
}
function saveLocal(uid: string, data: Partial<Record<Feature, LocalRec>>) {
  localStorage.setItem(localKey(uid), JSON.stringify(data))
}
function bumpLocal(uid: string, feature: Feature): number {
  const cfg = FEATURES[feature]
  const start = periodStart(cfg.period)
  const data = loadLocal(uid)
  const rec = data[feature]
  const count = rec && new Date(rec.periodStart) >= start ? rec.count + 1 : 1
  data[feature] = { count, periodStart: start.toISOString() }
  saveLocal(uid, data)
  return count
}

/**
 * Plan-aware usage limits. Provides synchronous `checkLimit` (from cached
 * counts) plus async `increment` / reset helpers backed by Supabase, with a
 * localStorage fallback so the app keeps working in demo mode or before the
 * `usage_tracking` table has been created.
 */
export function useUsageLimits() {
  const { user, isPro } = useAuth()
  const uid = user?.id ?? 'anon'
  const useDb = isSupabaseConfigured && !!supabase && !!user && !uid.startsWith('demo-')
  const dbOk = useRef(useDb)

  const [counts, setCounts] = useState<Counts>(zeroCounts)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const next = zeroCounts()

    let rows: Array<{ feature: string; count: number; period_start: string }> | null = null
    if (useDb && dbOk.current) {
      try {
        const { data, error } = await supabase!
          .from('usage_tracking')
          .select('feature,count,period_start')
          .eq('user_id', uid)
        if (error) throw error
        rows = data ?? []
      } catch {
        dbOk.current = false
      }
    }

    if (rows) {
      for (const r of rows) {
        const cfg = FEATURES[r.feature as Feature]
        if (cfg && new Date(r.period_start) >= periodStart(cfg.period)) {
          next[r.feature as Feature] = r.count
        }
      }
    } else {
      const local = loadLocal(uid)
      for (const f of ALL_FEATURES) {
        const rec = local[f]
        if (rec && new Date(rec.periodStart) >= periodStart(FEATURES[f].period)) next[f] = rec.count
      }
    }

    setCounts(next)
    setLoading(false)
  }, [uid, useDb])

  useEffect(() => {
    if (user) void load()
    else {
      setCounts(zeroCounts())
      setLoading(false)
    }
  }, [user, load])

  const checkLimit = useCallback(
    (feature: Feature): LimitResult => {
      const cfg = FEATURES[feature]
      const limit = isPro ? Infinity : cfg.freeLimit
      const used = counts[feature] ?? 0
      const unlimited = limit === Infinity
      const proOnly = !isPro && cfg.freeLimit === 0
      return {
        allowed: unlimited ? true : used < limit,
        used,
        limit,
        remaining: unlimited ? Infinity : Math.max(0, limit - used),
        period: cfg.period,
        proOnly,
        unlimited,
      }
    },
    [counts, isPro],
  )

  const increment = useCallback(
    async (feature: Feature) => {
      if (isPro) return // unlimited — nothing to meter
      const cfg = FEATURES[feature]
      const start = periodStart(cfg.period)
      let newCount = (counts[feature] ?? 0) + 1

      if (useDb && dbOk.current) {
        try {
          const { data, error } = await supabase!
            .from('usage_tracking')
            .select('count,period_start')
            .eq('user_id', uid)
            .eq('feature', feature)
            .maybeSingle()
          if (error) throw error
          const rolled = !data || new Date(data.period_start) < start
          newCount = rolled ? 1 : data!.count + 1
          const { error: upErr } = await supabase!.from('usage_tracking').upsert(
            {
              user_id: uid,
              feature,
              count: newCount,
              period_start: rolled ? start.toISOString() : data!.period_start,
              period_type: cfg.period,
            },
            { onConflict: 'user_id,feature' },
          )
          if (upErr) throw upErr
        } catch {
          dbOk.current = false
          newCount = bumpLocal(uid, feature)
        }
      } else {
        newCount = bumpLocal(uid, feature)
      }

      setCounts((prev) => ({ ...prev, [feature]: newCount }))
    },
    [counts, isPro, uid, useDb],
  )

  const resetPeriod = useCallback(
    async (period: Period) => {
      const feats = ALL_FEATURES.filter((f) => FEATURES[f].period === period)
      if (useDb && dbOk.current) {
        try {
          for (const f of feats) {
            await supabase!.from('usage_tracking').upsert(
              { user_id: uid, feature: f, count: 0, period_start: periodStart(period).toISOString(), period_type: period },
              { onConflict: 'user_id,feature' },
            )
          }
        } catch {
          dbOk.current = false
        }
      }
      if (!useDb || !dbOk.current) {
        const data = loadLocal(uid)
        feats.forEach((f) => {
          data[f] = { count: 0, periodStart: periodStart(period).toISOString() }
        })
        saveLocal(uid, data)
      }
      setCounts((prev) => {
        const n = { ...prev }
        feats.forEach((f) => (n[f] = 0))
        return n
      })
    },
    [uid, useDb],
  )

  const resetDaily = useCallback(() => resetPeriod('daily'), [resetPeriod])
  const resetMonthly = useCallback(() => resetPeriod('monthly'), [resetPeriod])

  const usage: UsageRow[] = ALL_FEATURES.map((f) => ({
    feature: f,
    label: FEATURES[f].label,
    ...checkLimit(f),
  }))

  return { usage, loading, isPro, checkLimit, increment, refresh: load, resetDaily, resetMonthly }
}
