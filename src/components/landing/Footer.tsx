import { Link } from 'react-router-dom'
import logo from '../../assets/logos/vademai-logo.png'

const cols = [
  { title: 'Product', links: ['Features', 'Pricing', 'FAQ'] },
  { title: 'Company', links: ['About', 'Blog', 'Careers'] },
  { title: 'Legal', links: ['Privacy', 'Terms', 'Contact'] },
]

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white dark:border-navy-800 dark:bg-navy-950">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2">
            <Link to="/" className="flex items-center" aria-label="VademAI home">
              <img src={logo} alt="VademAI" className="h-8 w-auto dark:brightness-0 dark:invert" />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              AI study tools that help medical students learn faster and ace their exams.
            </p>
          </div>

          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{c.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-slate-600 hover:text-brand dark:text-slate-400 dark:hover:text-brand-400">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-8 dark:border-navy-800 sm:flex-row">
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} VademAI. All rights reserved.</p>
          <p className="text-xs text-slate-400">A study aid, not medical advice. Always verify with trusted sources.</p>
        </div>
      </div>
    </footer>
  )
}
