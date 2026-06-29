import { Link } from 'react-router-dom'
import { Sparkles, Check } from '../icons'

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu blur-3xl">
        <div className="mx-auto aspect-[1155/678] w-[72rem] bg-gradient-to-tr from-brand-200 to-brand-50 opacity-40" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700">
          <Sparkles width={16} height={16} />
          AI study tools built for medical students
        </div>

        <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
          Study Medicine Smarter.{' '}
          <span className="text-brand">Ace Your Exams.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
          Turn dense lecture PDFs into flashcards, mock exams, and clear explanations in seconds.
          VademAI is your AI tutor, study planner, and revision partner — all in one place.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/register" className="btn-primary px-7 py-3 text-base">Get Started Free</Link>
          <a href="#features" className="btn-outline px-7 py-3 text-base">See Features</a>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
          {['No credit card required', 'Free plan forever', 'Cancel anytime'].map((t) => (
            <span key={t} className="inline-flex items-center gap-1.5">
              <Check width={16} height={16} className="text-brand" />
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
