import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useDocuments } from '../../context/DocumentsContext'
import { useFlaggedQuestions } from '../../hooks/useFlaggedQuestions'
import PageHeader from '../../components/dashboard/PageHeader'
import UsageMeter from '../../components/dashboard/UsageMeter'
import { FileText, Chat, Cards, Exam, Calendar, Target } from '../../components/icons'

export default function Overview() {
  const { user } = useAuth()
  const { docs } = useDocuments()
  const { count: weakSpots } = useFlaggedQuestions()
  const name = (user?.user_metadata?.full_name as string)?.split(' ')[0] || 'there'

  const stats = [
    { label: 'Documents', value: docs.length, icon: FileText },
    { label: 'Weak spots', value: weakSpots, icon: Target },
    { label: 'Study streak', value: '1 day', icon: Calendar },
  ]

  const tools = [
    { to: '/dashboard/documents', label: 'Upload a document', desc: 'Add lecture PDFs to your library.', icon: FileText },
    { to: '/dashboard/tutor', label: 'Ask the AI tutor', desc: 'Get answers grounded in your notes.', icon: Chat },
    { to: '/dashboard/flashcards', label: 'Generate flashcards', desc: 'Turn any document into a deck.', icon: Cards },
    { to: '/dashboard/exam', label: 'Take a practice exam', desc: 'USMLE-style MCQs with explanations.', icon: Exam },
    { to: '/dashboard/weak-spots', label: 'Review weak spots', desc: 'Re-practice questions you got wrong.', icon: Target },
    { to: '/dashboard/planner', label: 'Plan your revision', desc: 'A schedule built around your exam.', icon: Calendar },
  ]

  return (
    <div>
      <PageHeader title={`Welcome back, ${name} 👋`} subtitle="Here's your study workspace." />

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="card flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand dark:bg-navy-800 dark:text-brand-400">
              <s.icon width={22} height={22} />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{s.value}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <UsageMeter />
      </div>

      <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Quick actions</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((t) => (
          <Link key={t.to} to={t.to} className="card group transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-md dark:hover:border-brand-700">
            <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand transition group-hover:bg-brand group-hover:text-white dark:bg-navy-800 dark:text-brand-400">
              <t.icon width={22} height={22} />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{t.label}</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t.desc}</p>
          </Link>
        ))}
      </div>

      {docs.length === 0 && (
        <div className="mt-8 rounded-2xl border border-brand-200 bg-brand-50 p-6 text-center dark:border-navy-700 dark:bg-navy-850">
          <p className="font-semibold text-slate-900 dark:text-slate-100">Get started in 30 seconds</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Upload your first lecture PDF and let VademAI do the rest.</p>
          <Link to="/dashboard/documents" className="btn-primary mt-4">Upload a PDF</Link>
        </div>
      )}
    </div>
  )
}
