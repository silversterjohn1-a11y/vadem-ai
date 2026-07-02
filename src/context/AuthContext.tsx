import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  /** True when no Supabase project is wired up — auth is mocked locally. */
  demoMode: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<{ error?: string; needsConfirmation?: boolean }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const DEMO_KEY = 'vademai.demo.user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      // Demo mode: restore any locally persisted mock user.
      const raw = localStorage.getItem(DEMO_KEY)
      if (raw) setUser(JSON.parse(raw) as User)
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user ?? null)
      if (data.session?.user) void ensureProfile(data.session.user)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s)
      setUser(s?.user ?? null)
      // Guarantee a profile row exists once the user is authenticated
      // (covers the email-confirmation flow, where the row is created on
      // first sign-in). Idempotent and best-effort.
      if (s?.user && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        void ensureProfile(s.user)
      }
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  /** Upsert the signed-in user's profile row. Best-effort — never throws. */
  async function ensureProfile(u: User) {
    if (!supabase) return
    try {
      await supabase.from('user_profiles').upsert(
        {
          id: u.id,
          email: u.email,
          full_name: (u.user_metadata?.full_name as string | undefined) ?? null,
        },
        { onConflict: 'id' },
      )
    } catch {
      // The DB trigger also creates the row, so ignore client-side failures
      // (e.g. table not yet migrated).
    }
  }

  function mockUser(email: string, fullName?: string): User {
    return {
      id: 'demo-' + email,
      email,
      user_metadata: { full_name: fullName ?? email.split('@')[0] },
      app_metadata: {},
      aud: 'demo',
      created_at: new Date().toISOString(),
    } as unknown as User
  }

  async function signIn(email: string, password: string) {
    if (!isSupabaseConfigured || !supabase) {
      if (!email || !password) return { error: 'Email and password are required.' }
      const u = mockUser(email)
      localStorage.setItem(DEMO_KEY, JSON.stringify(u))
      setUser(u)
      return {}
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error ? { error: error.message } : {}
  }

  async function signUp(email: string, password: string, fullName: string) {
    if (!isSupabaseConfigured || !supabase) {
      if (!email || !password) return { error: 'Email and password are required.' }
      const u = mockUser(email, fullName)
      localStorage.setItem(DEMO_KEY, JSON.stringify(u))
      setUser(u)
      return {}
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    })
    if (error) return { error: error.message }

    // Supabase returns a user with an empty identities array when the email is
    // already registered (and confirmations are on), without an error.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      return { error: 'An account with this email already exists. Try logging in instead.' }
    }

    // If a session came back, email confirmation is disabled — the user is
    // signed in immediately, so save the profile now.
    if (data.session && data.user) {
      await ensureProfile(data.user)
      return { needsConfirmation: false }
    }

    // Otherwise the user must confirm via email; the DB trigger creates the
    // profile row, and ensureProfile runs on their first sign-in.
    return { needsConfirmation: true }
  }

  async function signOut() {
    if (!isSupabaseConfigured || !supabase) {
      localStorage.removeItem(DEMO_KEY)
      setUser(null)
      return
    }
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider
      value={{ user, session, loading, demoMode: !isSupabaseConfigured, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
