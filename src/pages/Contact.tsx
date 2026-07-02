import { useState, type FormEvent } from 'react'
import PageLayout from '../components/layout/PageLayout'
import { Chat, FileText, Check } from '../components/icons'

const channels = [
  { icon: Chat, title: 'General enquiries', value: 'hello@vademai.com' },
  { icon: FileText, title: 'Support', value: 'support@vademai.com' },
  { icon: Chat, title: 'Careers', value: 'careers@vademai.com' },
]

export default function Contact() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    // Demo: no backend wired up — acknowledge locally.
    setSent(true)
  }

  return (
    <PageLayout
      title="Contact us"
      subtitle="Questions, feedback, or partnership ideas? We'd love to hear from you."
    >
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* Channels */}
        <div className="space-y-4 lg:col-span-1">
          {channels.map((c) => (
            <div key={c.title} className="card flex items-center gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand dark:bg-navy-800 dark:text-brand-400">
                <c.icon width={20} height={20} />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{c.title}</div>
                <a href={`mailto:${c.value}`} className="text-sm text-brand hover:text-brand-600 dark:text-brand-400">{c.value}</a>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <div className="card">
            {sent ? (
              <div className="flex flex-col items-center py-10 text-center">
                <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-green-100 text-green-600 dark:bg-green-950/40">
                  <Check width={24} height={24} />
                </div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Message sent!</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Thanks, {form.name || 'there'} — we'll get back to you at {form.email || 'your email'} soon.
                </p>
                <button className="btn-outline mt-5" onClick={() => { setSent(false); setForm({ name: '', email: '', message: '' }) }}>
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor="name">Name</label>
                    <input id="name" className="input" value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" required />
                  </div>
                  <div>
                    <label className="label" htmlFor="email">Email</label>
                    <input id="email" type="email" className="input" value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@medschool.edu" required />
                  </div>
                </div>
                <div>
                  <label className="label" htmlFor="message">Message</label>
                  <textarea id="message" rows={5} className="input resize-none" value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="How can we help?" required />
                </div>
                <button type="submit" className="btn-primary w-full py-3 sm:w-auto">Send message</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
