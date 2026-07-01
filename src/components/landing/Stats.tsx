const stats = [
  { value: '120+', label: 'Students' },
  { value: '10,000+', label: 'Flashcards Generated' },
  { value: '4.9★', label: 'Average Rating' },
  { value: '3x', label: 'Faster Learning' },
]

export default function Stats() {
  return (
    <section className="border-y border-slate-100 bg-slate-50/60 dark:border-navy-800 dark:bg-navy-900/40">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-3xl font-extrabold text-brand dark:text-brand-400 sm:text-4xl">{s.value}</div>
            <div className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
