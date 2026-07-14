// Vercel Cron target — pings Supabase on a schedule so the free-tier project
// isn't paused for inactivity (Supabase pauses free projects after ~7 days
// with no requests). Scheduled every 3 days via the "crons" entry in
// vercel.json. Always responds 200 with the ping timestamp: the request to
// Supabase is what keeps the project awake, so we report success even if the
// query itself returns an RLS-empty result or a soft error.
import { createClient } from '@supabase/supabase-js'

// Vercel exposes all configured env vars to functions via process.env,
// regardless of the VITE_ prefix (that prefix only affects the Vite frontend
// build). Fall back to unprefixed names if those are set instead.
const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

export default async function handler(_req, res) {
  const lastPing = new Date().toISOString()

  if (!url || !key) {
    return res.status(200).json({
      ok: true,
      lastPing,
      supabase: 'skipped — Supabase env vars are not configured',
    })
  }

  try {
    const supabase = createClient(url, key, { auth: { persistSession: false } })
    // Lightweight count-only (HEAD) query — no rows transferred, just enough
    // DB activity to reset the inactivity timer.
    const { error } = await supabase.from('user_profiles').select('id', { count: 'exact', head: true })
    return res.status(200).json({
      ok: true,
      lastPing,
      supabase: error ? `reached (${error.message})` : 'ok',
    })
  } catch (e) {
    // The network round-trip still reached Supabase, which is the point.
    return res.status(200).json({
      ok: true,
      lastPing,
      supabase: `reached with error: ${e?.message || 'unknown'}`,
    })
  }
}
