import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../landing/Navbar'
import Footer from '../landing/Footer'

/**
 * Shared shell for all static/marketing pages: same navbar + footer as the
 * landing page, a consistent page header with a "Back to home" link, and full
 * light/dark support.
 */
export default function PageLayout({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-navy-950">
      <Navbar />
      <main>
        <section className="border-b border-slate-100 bg-slate-50/60 dark:border-navy-800 dark:bg-navy-900/40">
          <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-600 dark:text-brand-400"
            >
              <span aria-hidden>←</span> Back to home
            </Link>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {title}
            </h1>
            {subtitle && <p className="mt-3 max-w-2xl text-lg text-slate-600 dark:text-slate-300">{subtitle}</p>}
          </div>
        </section>
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">{children}</div>
      </main>
      <Footer />
    </div>
  )
}
