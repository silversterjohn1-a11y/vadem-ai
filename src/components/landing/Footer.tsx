import { Link } from 'react-router-dom'
import { Logo } from '../icons'

const cols = [
  { title: 'Product', links: ['Features', 'Pricing', 'FAQ'] },
  { title: 'Company', links: ['About', 'Blog', 'Careers'] },
  { title: 'Legal', links: ['Privacy', 'Terms', 'Contact'] },
]

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white">
                <Logo width={20} height={20} />
              </span>
              Vadem<span className="text-brand">AI</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-600">
              AI study tools that help medical students learn faster and ace their exams.
            </p>
          </div>

          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="text-sm font-semibold text-slate-900">{c.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-slate-600 hover:text-brand">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-8 sm:flex-row">
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} VademAI. All rights reserved.</p>
          <p className="text-xs text-slate-400">A study aid, not medical advice. Always verify with trusted sources.</p>
        </div>
      </div>
    </footer>
  )
}
