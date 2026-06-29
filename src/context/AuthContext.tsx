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
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>
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
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      setUser(s?.user ?? null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

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
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    return error ? { error: error.message } : {}
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
