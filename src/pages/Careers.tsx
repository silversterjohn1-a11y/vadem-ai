import { Link } from 'react-router-dom'
import PageLayout from '../components/layout/PageLayout'

const perks = [
  { title: 'Remote-first', desc: 'Work from anywhere. We care about impact, not hours at a desk.' },
  { title: 'Real ownership', desc: 'Small team, big surface area. Your work ships to students every week.' },
  { title: 'Learning budget', desc: 'An annual stipend for courses, books and conferences.' },
  { title: 'Meaningful mission', desc: 'Help the next generation of doctors learn better.' },
]

interface Job {
  title: string
  department: string
  location: string
  type: string
  desc: string
}

const jobs: Job[] = [
  {
    title: 'Senior Full-Stack Engineer',
    department: 'Engineering',
    location: 'Remote (EU / UK)',
    type: 'Full-time',
    desc: 'Build core product features across React, TypeScript and Node. You care about clean UX and shipping fast.',
  },
  {
    title: 'Learning Scientist',
    department: 'Learning',
    location: 'Remote',
    type: 'Full-time',
    desc: 'Shape how our AI generates flashcards, questions and study plans grounded in evidence-based learning.',
  },
  {
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote (EU / UK)',
    type: 'Contract → Full-time',
    desc: 'Own the end-to-end design of study tools used by thousands of medical students.',
  },
]

export default function Careers() {
  return (
    <PageLayout
      title="Careers at VademAI"
      subtitle="We're hiring! Help us build the tools that help medical students everywhere learn faster."
    >
      <div className="space-y-14">
        {/* Perks */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Why work with us</h2>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {perks.map((p) => (
              <div key={p.title} className="card">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Open roles */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Open roles</h2>
          <div className="mt-6 space-y-4">
            {jobs.map((j) => (
              <div
                key={j.title}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-navy-800 dark:bg-navy-900 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{j.title}</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{j.desc}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[j.department, j.location, j.type].map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-navy-800 dark:text-slate-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <Link to="/contact" className="btn-primary shrink-0 self-start sm:self-center">Apply now</Link>
              </div>
            ))}
          </div>
        </section>

        {/* No-fit CTA */}
        <section className="rounded-2xl border border-brand-200 bg-brand-50 p-8 text-center dark:border-navy-700 dark:bg-navy-850">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Don't see your role?</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            We're always keen to meet talented people. Tell us how you'd help.
          </p>
          <Link to="/contact" className="btn-primary mt-5">Get in touch</Link>
        </section>
      </div>
    </PageLayout>
  )
}
