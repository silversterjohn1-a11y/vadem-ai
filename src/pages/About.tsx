import { Link } from 'react-router-dom'
import PageLayout from '../components/layout/PageLayout'

const values = [
  { title: 'Students first', desc: 'Every feature is judged by one question: does it help a student learn faster and remember longer?' },
  { title: 'Trustworthy by design', desc: 'AI is a study aid, not a shortcut around understanding. We surface sources and never pretend to give medical advice.' },
  { title: 'Accessible to all', desc: 'A generous free plan and student-friendly pricing so cost is never the reason someone falls behind.' },
]

const team = [
  { name: 'Dr. Amara Okafor', role: 'Co-founder & CEO', initials: 'AO' },
  { name: 'Julian Reyes', role: 'Co-founder & CTO', initials: 'JR' },
  { name: 'Priya Nair', role: 'Head of Learning Science', initials: 'PN' },
  { name: 'Tom Bergström', role: 'Head of Product', initials: 'TB' },
]

const stats = [
  { value: '120+', label: 'Active students' },
  { value: '10,000+', label: 'Flashcards generated' },
  { value: '4.9★', label: 'Average rating' },
]

export default function About() {
  return (
    <PageLayout
      title="About VademAI"
      subtitle="We're on a mission to make high-quality, exam-ready studying accessible to every medical student."
    >
      <div className="space-y-16">
        {/* Mission */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Our mission</h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
            Medical school buries students in more information than any human can memorise by brute force.
            VademAI turns that mountain of PDFs, slides and lecture notes into active, personalised study
            tools — flashcards, mock exams, plain-language explanations and revision plans — so students
            spend less time organising material and more time actually learning it.
          </p>
        </section>

        {/* Story */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Our story</h2>
          <div className="mt-4 space-y-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
            <p>
              VademAI started in a library at 2am. Our founders — a junior doctor and a machine-learning
              engineer — were frustrated that studying meant endless manual note-making and re-reading,
              with no easy way to test what had actually stuck.
            </p>
            <p>
              They built a small tool that turned a lecture PDF into a set of flashcards and practice
              questions. Friends asked for access, then classmates, then students at other universities.
              Today VademAI is used by medical students around the world to study smarter and walk into
              exams with confidence.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="card text-center">
              <div className="text-3xl font-extrabold text-brand dark:text-brand-400">{s.value}</div>
              <div className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">{s.label}</div>
            </div>
          ))}
        </section>

        {/* Values */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">What we value</h2>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {values.map((v) => (
              <div key={v.title} className="card">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">The team</h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
            A small team of clinicians, engineers and learning scientists.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-4">
            {team.map((m) => (
              <div key={m.name} className="card text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-100 text-lg font-bold text-brand-700 dark:bg-navy-800 dark:text-brand-300">
                  {m.initials}
                </div>
                <div className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">{m.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{m.role}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl border border-brand-200 bg-brand-50 p-8 text-center dark:border-navy-700 dark:bg-navy-850">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Ready to study smarter?</h2>
          <p className="mt-2 text-base text-slate-600 dark:text-slate-300">Join VademAI free — no credit card required.</p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/register" className="btn-primary px-7 py-3 text-base">Get Started Free</Link>
            <Link to="/contact" className="btn-outline px-7 py-3 text-base">Contact us</Link>
          </div>
        </section>
      </div>
    </PageLayout>
  )
}
