import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export interface FlaggedQuestion {
  id: string
  question: string
  correct_answer: string | null
  user_answer: string | null
  topic: string | null
  flagged_at: string
}

export interface FlagInput {
  question: string
  correct_answer?: string | null
  user_answer?: string | null
  topic?: string | null
}

const localKey = (uid: string) => `vademai.weakspots.${uid}`

function loadLocal(uid: string): FlaggedQuestion[] {
  try {
    return JSON.parse(localStorage.getItem(localKey(uid)) || '[]')
  } catch {
    return []
  }
}
function saveLocal(uid: string, list: FlaggedQuestion[]) {
  localStorage.setItem(localKey(uid), JSON.stringify(list))
}

/**
 * "Weak spots" — exam questions the user flagged or got wrong. Backed by the
 * Supabase `flagged_questions` table, with a localStorage fallback so it works
 * in demo mode or before the table has been migrated.
 */
export function useFlaggedQuestions() {
  const { user } = useAuth()
  const uid = user?.id ?? 'anon'
  const useDb = isSupabaseConfigured && !!supabase && !!user && !uid.startsWith('demo-')
  const dbOk = useRef(useDb)

  const [items, setItems] = useState<FlaggedQuestion[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    let rows: FlaggedQuestion[] | null = null
    if (useDb && dbOk.current) {
      try {
        const { data, error } = await supabase!
          .from('flagged_questions')
          .select('*')
          .eq('user_id', uid)
          .order('flagged_at', { ascending: false })
        if (error) throw error
        rows = (data ?? []) as FlaggedQuestion[]
      } catch {
        dbOk.current = false
      }
    }
    setItems(rows ?? loadLocal(uid))
    setLoading(false)
  }, [uid, useDb])

  useEffect(() => {
    if (user) void load()
    else {
      setItems([])
      setLoading(false)
    }
  }, [user, load])

  const flag = useCallback(
    async (p: FlagInput) => {
      const row = {
        question: p.question,
        correct_answer: p.correct_answer ?? null,
        user_answer: p.user_answer ?? null,
        topic: p.topic ?? null,
      }
      let created: FlaggedQuestion | null = null

      if (useDb && dbOk.current) {
        try {
          const { data, error } = await supabase!
            .from('flagged_questions')
            .insert({ user_id: uid, ...row })
            .select('*')
            .single()
          if (error) {
            if (error.code === '23505') return // already flagged — unique violation
            throw error
          }
          created = data as FlaggedQuestion
        } catch {
          dbOk.current = false
        }
      }

      if (!created && (!useDb || !dbOk.current)) {
        const list = loadLocal(uid)
        if (list.some((i) => i.question === row.question)) return
        created = { id: crypto.randomUUID(), ...row, flagged_at: new Date().toISOString() }
        saveLocal(uid, [created, ...list])
      }

      if (created) {
        setItems((prev) => (prev.some((i) => i.question === row.question) ? prev : [created!, ...prev]))
      }
    },
    [uid, useDb],
  )

  const unflag = useCallback(
    async (id: string) => {
      if (useDb && dbOk.current) {
        try {
          const { error } = await supabase!.from('flagged_questions').delete().eq('user_id', uid).eq('id', id)
          if (error) throw error
        } catch {
          dbOk.current = false
        }
      }
      if (!useDb || !dbOk.current) saveLocal(uid, loadLocal(uid).filter((i) => i.id !== id))
      setItems((prev) => prev.filter((i) => i.id !== id))
    },
    [uid, useDb],
  )

  const unflagByQuestion = useCallback(
    async (question: string) => {
      if (useDb && dbOk.current) {
        try {
          await supabase!.from('flagged_questions').delete().eq('user_id', uid).eq('question', question)
        } catch {
          dbOk.current = false
        }
      }
      if (!useDb || !dbOk.current) saveLocal(uid, loadLocal(uid).filter((i) => i.question !== question))
      setItems((prev) => prev.filter((i) => i.question !== question))
    },
    [uid, useDb],
  )

  return { items, count: items.length, loading, flag, unflag, unflagByQuestion, refresh: load }
}
