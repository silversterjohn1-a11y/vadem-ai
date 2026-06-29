import { FileText, Chat, Cards, Exam, Mic, Chart, Calendar, Sparkles } from '../icons'
import type { ComponentType, SVGProps } from 'react'

interface Feature {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  title: string
  desc: string
}

const features: Feature[] = [
  { icon: FileText, title: 'AI PDF Analysis', desc: 'Upload lecture slides and textbooks. VademAI reads, summarizes, and pulls out the high-yield points.' },
  { icon: Chat, title: 'AI Medical Tutor', desc: 'Ask anything about your material and get clear, source-grounded answers in plain language.' },
  { icon: Cards, title: 'Smart Flashcards', desc: 'Auto-generate spaced-repetition flashcards from any document in one click.' },
  { icon: Exam, title: 'Exam Mode', desc: 'Practice with USMLE-style MCQs generated from your own notes, with instant explanations.' },
  { icon: Mic, title: 'Lecture Transcription', desc: 'Record or upload lectures and turn them into searchable, structured study notes.' },
  { icon: Chart, title: 'Study Analytics', desc: 'Track mastery by topic, spot weak areas, and see your progress over time.' },
  { icon: Calendar, title: 'AI Study Planner', desc: 'Get a personalized revision schedule built around your exam date and goals.' },
  { icon: Sparkles, title: '"Explain Simply" Button', desc: 'Highlight any concept and get an ELI5-style explanation that finally makes it click.' },
]

export default function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Everything you need to learn faster
        </h2>
        <p className="mt-4 text-lg text-slate-600">
          Eight AI-powered tools that turn passive reading into active, exam-ready learning.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <div key={f.title} className="card group transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-md">
            <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand transition group-hover:bg-brand group-hover:text-white">
              <f.icon width={22} height={22} />
            </div>
            <h3 className="text-base font-semibold text-slate-900">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
