import { useState, type FormEvent } from 'react'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { Sparkles, Close, Check } from '../icons'

type Status = 'idle' | 'loading' | 'success' | 'already'

export default function WaitlistModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  function close() {
    // Reset so the modal is fresh next time it opens.
    setEmail('')
    setStatus('idle')
    setError('')
    onClose()
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    const value = email.trim().toLowerCase()
    if (!value) return
    setError('')
    setStatus('loading')

    // No backend configured — acknowledge locally so the UX still works.
    if (!isSupabaseConfigured || !supabase) {
      setStatus('success')
      return
    }

    const { error } = await supabase.from('waitlist').insert({ email: value })
    if (!error) {
      setStatus('success')
    } else if (error.code === '23505') {
      // Unique-violation → email already present.
      setStatus('already')
    } else {
      console.error('Waitlist insert failed:', error)
      setStatus('idle')
      setError('Something went wrong. Please try again.')
    }
  }

  if (!open) return null

  const done = status === 'success' || status === 'already'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={close} />
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-navy-700 dark:bg-navy-900">
        <button
          onClick={close}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800"
          aria-label="Close"
        >
          <Close width={18} height={18} />
        </button>

        {done ? (
          <div className="py-4 text-center">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-green-100 text-green-600 dark:bg-green-950/40">
              <Check width={24} height={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {status === 'already' ? "You're already on the list!" : "🎉 You're on the list!"}
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {status === 'already'
                ? "This email is already signed up. We'll email you when Pro launches."
                : "We'll email you when Pro launches — with your 50% off first month."}
            </p>
            <button onClick={close} className="btn-primary mt-6 w-full py-3">Done</button>
          </div>
        ) : (
          <>
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand dark:bg-navy-800 dark:text-brand-400">
              <Sparkles width={24} height={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Join the VademAI Pro Waitlist</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Be first to know when Pro launches. Early subscribers get{' '}
              <span className="font-semibold text-brand dark:text-brand-400">50% off their first month!</span>
            </p>

            {error && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={submit} className="mt-5 space-y-3">
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@medschool.edu"
                className="input"
              />
              <button type="submit" className="btn-primary w-full py-3" disabled={status === 'loading'}>
                {status === 'loading' ? 'Joining…' : 'Join Waitlist'}
              </button>
            </form>
            <p className="mt-3 text-center text-xs text-slate-400">No spam. We'll only email you about the Pro launch.</p>
          </>
        )}
      </div>
    </div>
  )
}
