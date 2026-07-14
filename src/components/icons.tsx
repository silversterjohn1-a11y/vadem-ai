import type { SVGProps } from 'react'

/**
 * Lightweight inline icon set (stroke-based, inherits currentColor) so the app
 * has no icon-library dependency. Each icon accepts standard SVG props.
 */

type IconProps = SVGProps<SVGSVGElement>

function Base({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={20}
      height={20}
      {...props}
    >
      {children}
    </svg>
  )
}

export const Logo = (props: IconProps) => (
  <Base {...props}>
    <path d="M12 3c-1 2.5-2.8 4-5 4.5V13c0 4 2.2 6.5 5 8 2.8-1.5 5-4 5-8V7.5C14.8 7 13 5.5 12 3Z" />
    <path d="M12 9v6M9 12h6" />
  </Base>
)
export const FileText = (p: IconProps) => (
  <Base {...p}><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" /><path d="M9 9h1M9 13h6M9 17h6" /></Base>
)
export const Chat = (p: IconProps) => (
  <Base {...p}><path d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2Z" /></Base>
)
export const Cards = (p: IconProps) => (
  <Base {...p}><rect x="3" y="5" width="13" height="13" rx="2" /><path d="M8 5V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-1" /></Base>
)
export const Exam = (p: IconProps) => (
  <Base {...p}><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></Base>
)
export const Mic = (p: IconProps) => (
  <Base {...p}><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10a7 7 0 0 0 14 0M12 19v3" /></Base>
)
export const Chart = (p: IconProps) => (
  <Base {...p}><path d="M3 3v18h18" /><path d="M7 14l3-3 3 3 5-6" /></Base>
)
export const Calendar = (p: IconProps) => (
  <Base {...p}><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></Base>
)
export const Sparkles = (p: IconProps) => (
  <Base {...p}><path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3Z" /><path d="M19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14Z" /></Base>
)
export const Upload = (p: IconProps) => (
  <Base {...p}><path d="M12 16V4M7 9l5-5 5 5" /><path d="M5 21h14" /></Base>
)
export const Send = (p: IconProps) => (
  <Base {...p}><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" /></Base>
)
export const Menu = (p: IconProps) => (
  <Base {...p}><path d="M4 6h16M4 12h16M4 18h16" /></Base>
)
export const Close = (p: IconProps) => (
  <Base {...p}><path d="M18 6 6 18M6 6l12 12" /></Base>
)
export const Chevron = (p: IconProps) => (
  <Base {...p}><path d="m6 9 6 6 6-6" /></Base>
)
export const Logout = (p: IconProps) => (
  <Base {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></Base>
)
export const Check = (p: IconProps) => (
  <Base {...p}><path d="M20 6 9 17l-5-5" /></Base>
)
export const Trash = (p: IconProps) => (
  <Base {...p}><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></Base>
)
export const Sun = (p: IconProps) => (
  <Base {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M5 5l1.5 1.5M17.5 17.5 19 19M2 12h2M20 12h2M5 19l1.5-1.5M17.5 6.5 19 5" /></Base>
)
export const Moon = (p: IconProps) => (
  <Base {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></Base>
)
export const Download = (p: IconProps) => (
  <Base {...p}><path d="M12 4v12M8 12l4 4 4-4" /><path d="M4 20h16" /></Base>
)
export const Bookmark = (p: IconProps) => (
  <Base {...p}><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" /></Base>
)
export const Target = (p: IconProps) => (
  <Base {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" /></Base>
)
export const Repeat = (p: IconProps) => (
  <Base {...p}><path d="M17 2l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><path d="M7 22l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></Base>
)
