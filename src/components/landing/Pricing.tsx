import { Link } from 'react-router-dom'
import { Check } from '../icons'

interface Plan {
  name: string
  price: string
  period?: string
  desc: string
  features: string[]
  cta: string
  to: string
  featured?: boolean
}

const plans: Plan[] = [
  {
    name: 'Free',
    price: '$0',
    period: '/forever',
    desc: 'Everything you need to get started.',
    features: ['5 PDF uploads / month', '50 AI flashcards / month', 'AI tutor (20 messages/day)', 'Basic exam mode', 'Community support'],
    cta: 'Start for Free',
    to: '/register',
  },
  {
    name: 'Pro',
    price: '$12',
    period: '/month',
    desc: 'For students who are serious about results.',
    features: ['Unlimited PDF uploads', 'Unlimited flashcards', 'Unlimited AI tutor', 'Full exam mode + analytics', 'Lecture transcription', 'AI study planner', 'Priority support'],
    cta: 'Go Pro',
    to: '/register',
    featured: true,
  },
  {
    name: 'Team',
    price: 'TBD',
    desc: 'For study groups, societies & institutions.',
    features: ['Everything in Pro', 'Shared decks & documents', 'Group analytics dashboard', 'Admin controls & seats', 'Onboarding & SSO', 'Dedicated support'],
    cta: 'Contact Sales',
    to: '/register',
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="border-y border-slate-100 bg-slate-50/60">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Simple, student-friendly pricing</h2>
          <p className="mt-4 text-lg text-slate-600">Start free. Upgrade when you're ready. Cancel anytime.</p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative flex flex-col rounded-2xl border bg-white p-7 shadow-sm ${
                p.featured ? 'border-brand ring-1 ring-brand' : 'border-slate-200'
              }`}
            >
              {p.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">
                  Most Popular
                </span>
              )}
              <h3 className="text-lg font-semibold text-slate-900">{p.name}</h3>
              <p className="mt-1 text-sm text-slate-600">{p.desc}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-900">{p.price}</span>
                {p.period && <span className="text-sm text-slate-500">{p.period}</span>}
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <Check width={18} height={18} className="mt-0.5 shrink-0 text-brand" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to={p.to}
                className={`mt-7 w-full ${p.featured ? 'btn-primary' : 'btn-outline'}`}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
