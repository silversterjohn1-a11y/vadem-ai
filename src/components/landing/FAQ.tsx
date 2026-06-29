import { useState } from 'react'
import { Chevron } from '../icons'

const faqs = [
  {
    q: 'How does VademAI generate flashcards and questions?',
    a: 'You upload a PDF (lecture slides, notes, a textbook chapter) and VademAI reads the content, then uses Anthropic\'s Claude models to generate spaced-repetition flashcards and exam-style MCQs grounded in that material.',
  },
  {
    q: 'Is my study material kept private?',
    a: 'Your documents are processed to power your study tools and tied to your account. We never sell your data, and you can delete any document at any time from your dashboard.',
  },
  {
    q: 'Which exams does VademAI support?',
    a: 'VademAI works from your own material, so it adapts to any curriculum — USMLE, PLAB, MBBS finals, NEET-PG and more. The exam mode mirrors USMLE-style single-best-answer questions by default.',
  },
  {
    q: 'Do I need to pay to try it?',
    a: 'No. The Free plan is genuinely free forever and includes PDF uploads, flashcards, the AI tutor, and basic exam mode. Upgrade to Pro only when you want unlimited usage.',
  },
  {
    q: 'Can I use VademAI on my phone?',
    a: 'Yes. The entire app is mobile responsive, so you can revise flashcards and quiz yourself anywhere.',
  },
  {
    q: 'Is VademAI a replacement for studying?',
    a: 'No — it\'s a tool to make studying faster and more effective. Always verify AI-generated content against trusted sources; it is a study aid, not medical advice.',
  },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Frequently asked questions</h2>
        <p className="mt-4 text-lg text-slate-600">Everything you need to know before getting started.</p>
      </div>

      <div className="mt-12 divide-y divide-slate-100 rounded-2xl border border-slate-200">
        {faqs.map((f, i) => (
          <div key={f.q}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
            >
              <span className="text-base font-semibold text-slate-900">{f.q}</span>
              <Chevron
                className={`shrink-0 text-slate-400 transition-transform ${open === i ? 'rotate-180' : ''}`}
              />
            </button>
            {open === i && <p className="px-5 pb-5 text-sm leading-relaxed text-slate-600">{f.a}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}
