import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Logo } from '../components/icons'

export default function Register() {
  const { signUp, demoMode } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setNotice('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    const { error } = await signUp(email, password, fullName)
    setLoading(false)
    if (error) {
      setError(error)
    } else if (demoMode) {
      navigate('/dashboard')
    } else {
      // Supabase may require email confirmation depending on project settings.
      setNotice('Account created! Check your email to confirm, then log in.')
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center justify-center gap-2 text-xl font-extrabold tracking-tight">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-white">
              <Logo width={22} height={22} />
            </span>
            Vadem<span className="text-brand">AI</span>
          </Link>

          <div className="card">
            <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
            <p className="mt-1 text-sm text-slate-600">Start studying smarter — it's free.</p>

            {demoMode && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Demo mode: Supabase isn't configured, so your account is stored locally in this browser.
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            )}
            {notice && (
              <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{notice}</div>
            )}

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <label className="label" htmlFor="name">Full name</label>
                <input id="name" type="text" className="input" value={fullName}
                  onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" required />
              </div>
              <div>
                <label className="label" htmlFor="email">Email</label>
                <input id="email" type="email" className="input" value={email}
                  onChange={(e) => setEmail(e.target.value)} placeholder="you@medschool.edu" required />
              </div>
              <div>
                <label className="label" htmlFor="password">Password</label>
                <input id="password" type="password" className="input" value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" required />
              </div>
              <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-brand hover:text-brand-600">Log in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
