import { useTheme } from '../context/ThemeContext'
import { Sun, Moon } from './icons'

/** Sun/moon button that toggles light/dark mode (persisted to localStorage). */
export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`grid h-10 w-10 place-items-center rounded-lg text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-navy-800 ${className}`}
    >
      {isDark ? <Sun width={20} height={20} /> : <Moon width={20} height={20} />}
    </button>
  )
}
