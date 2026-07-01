import { useState } from 'react'
import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { DocumentsProvider } from '../context/DocumentsContext'
import { FileText, Chat, Cards, Exam, Calendar, Chart, Logout, Menu, Close } from '../components/icons'
import ThemeToggle from '../components/ThemeToggle'
import logo from '../assets/logos/vademai-logo.png'

import Overview from './dashboard/Overview'
import Documents from './dashboard/Documents'
import Tutor from './dashboard/Tutor'
import Flashcards from './dashboard/Flashcards'
import ExamMode from './dashboard/ExamMode'
import Planner from './dashboard/Planner'

const nav = [
  { to: '/dashboard', label: 'Overview', icon: Chart, end: true },
  { to: '/dashboard/documents', label: 'Documents', icon: FileText },
  { to: '/dashboard/tutor', label: 'AI Tutor', icon: Chat },
  { to: '/dashboard/flashcards', label: 'Flashcards', icon: Cards },
  { to: '/dashboard/exam', label: 'Exam Mode', icon: Exam },
  { to: '/dashboard/planner', label: 'Study Planner', icon: Calendar },
]

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const name = (user?.user_metadata?.full_name as string) || user?.email?.split('@')[0] || 'Student'

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-5">
        <img src={logo} alt="VademAI" className="h-8 w-auto dark:brightness-0 dark:invert" />
        <ThemeToggle />
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {nav.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-navy-800 dark:text-brand-300'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-navy-800 dark:hover:text-white'
              }`
            }
          >
            <n.icon width={19} height={19} />
            {n.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-3 dark:border-navy-800">
        <div className="mb-2 flex items-center gap-3 px-2 py-1">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-navy-800 dark:text-brand-300">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{name}</div>
            <div className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.email}</div>
          </div>
        </div>
        <button onClick={handleSignOut} className="btn-ghost w-full justify-start text-slate-600">
          <Logout width={18} height={18} /> Sign out
        </button>
      </div>
    </div>
  )

  return (
    <DocumentsProvider>
      <div className="flex min-h-screen bg-slate-50 dark:bg-navy-950">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white dark:border-navy-800 dark:bg-navy-900 lg:block">
          {sidebar}
        </aside>

        {/* Mobile sidebar */}
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-slate-900/40" onClick={() => setOpen(false)} />
            <aside className="absolute left-0 top-0 h-full w-64 border-r border-slate-200 bg-white dark:border-navy-800 dark:bg-navy-900">{sidebar}</aside>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-navy-800 dark:bg-navy-900 lg:hidden">
            <button className="btn-ghost" onClick={() => setOpen(true)} aria-label="Open menu">
              {open ? <Close /> : <Menu />}
            </button>
            <img src={logo} alt="VademAI" className="h-7 w-auto dark:brightness-0 dark:invert" />
          </header>

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <Routes>
              <Route index element={<Overview />} />
              <Route path="documents" element={<Documents />} />
              <Route path="tutor" element={<Tutor />} />
              <Route path="flashcards" element={<Flashcards />} />
              <Route path="exam" element={<ExamMode />} />
              <Route path="planner" element={<Planner />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </DocumentsProvider>
  )
}
