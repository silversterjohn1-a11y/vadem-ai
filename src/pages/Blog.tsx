import { Link } from 'react-router-dom'
import PageLayout from '../components/layout/PageLayout'

interface Post {
  title: string
  excerpt: string
  category: string
  author: string
  date: string
  readTime: string
  gradient: string
}

const posts: Post[] = [
  {
    title: 'How to turn lecture PDFs into high-yield flashcards',
    excerpt:
      'Active recall beats re-reading every time. Here\'s a simple workflow for converting dense slide decks into spaced-repetition flashcards you\'ll actually review.',
    category: 'Study tips',
    author: 'Priya Nair',
    date: 'Jun 24, 2026',
    readTime: '6 min read',
    gradient: 'from-brand-400 to-brand-600',
  },
  {
    title: 'The science of spaced repetition for medical exams',
    excerpt:
      'Why cramming fails and spacing works — a look at the forgetting curve and how to schedule reviews so knowledge sticks through finals and beyond.',
    category: 'Learning science',
    author: 'Dr. Amara Okafor',
    date: 'Jun 10, 2026',
    readTime: '8 min read',
    gradient: 'from-indigo-400 to-brand-600',
  },
  {
    title: 'Building an exam-week revision plan that actually works',
    excerpt:
      'A realistic, day-by-day framework for the final two weeks before an exam — how to prioritise weak topics without burning out.',
    category: 'Productivity',
    author: 'Tom Bergström',
    date: 'May 28, 2026',
    readTime: '5 min read',
    gradient: 'from-sky-400 to-brand-500',
  },
]

export default function Blog() {
  return (
    <PageLayout
      title="The VademAI Blog"
      subtitle="Study strategies, learning science, and product updates for medical students."
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {posts.map((p) => (
          <article
            key={p.title}
            className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-navy-800 dark:bg-navy-900"
          >
            <div className={`h-36 w-full bg-gradient-to-tr ${p.gradient}`} />
            <div className="flex flex-1 flex-col p-5">
              <span className="inline-flex w-fit rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 dark:bg-navy-800 dark:text-brand-300">
                {p.category}
              </span>
              <h2 className="mt-3 text-lg font-semibold leading-snug text-slate-900 group-hover:text-brand dark:text-slate-100 dark:group-hover:text-brand-400">
                {p.title}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{p.excerpt}</p>
              <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-navy-800 dark:text-slate-400">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-[11px] font-bold text-brand-700 dark:bg-navy-800 dark:text-brand-300">
                  {p.author.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div className="font-medium text-slate-700 dark:text-slate-300">{p.author}</div>
                  <div>{p.date} · {p.readTime}</div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center dark:border-navy-800 dark:bg-navy-900">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Want more study tips?</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          New articles are on the way. In the meantime, try VademAI free.
        </p>
        <Link to="/register" className="btn-primary mt-5">Get Started Free</Link>
      </div>
    </PageLayout>
  )
}
