import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export interface StudyDoc {
  id: string
  name: string
  text: string
  chars: number
  addedAt: number
}

interface DocumentsContextValue {
  docs: StudyDoc[]
  activeId: string | null
  active: StudyDoc | null
  setActiveId: (id: string | null) => void
  addDoc: (doc: Omit<StudyDoc, 'id' | 'addedAt'>) => StudyDoc
  removeDoc: (id: string) => void
}

const DocumentsContext = createContext<DocumentsContextValue | undefined>(undefined)

const STORE_KEY = 'vademai.docs'

export function DocumentsProvider({ children }: { children: ReactNode }) {
  const [docs, setDocs] = useState<StudyDoc[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY) || '[]') as StudyDoc[]
    } catch {
      return []
    }
  })
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify(docs))
    if (activeId && !docs.some((d) => d.id === activeId)) setActiveId(null)
    if (!activeId && docs.length) setActiveId(docs[0].id)
  }, [docs, activeId])

  function addDoc(doc: Omit<StudyDoc, 'id' | 'addedAt'>) {
    const full: StudyDoc = { ...doc, id: crypto.randomUUID(), addedAt: Date.now() }
    setDocs((prev) => [full, ...prev])
    setActiveId(full.id)
    return full
  }

  function removeDoc(id: string) {
    setDocs((prev) => prev.filter((d) => d.id !== id))
  }

  const active = docs.find((d) => d.id === activeId) ?? null

  return (
    <DocumentsContext.Provider value={{ docs, activeId, active, setActiveId, addDoc, removeDoc }}>
      {children}
    </DocumentsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDocuments() {
  const ctx = useContext(DocumentsContext)
  if (!ctx) throw new Error('useDocuments must be used within DocumentsProvider')
  return ctx
}
