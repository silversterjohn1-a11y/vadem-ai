import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Global scroll behaviour for client-side navigation:
 *  - navigating to a new page (no hash) jumps to the top
 *  - navigating to a `/#section` link scrolls smoothly to that element,
 *    retrying briefly so it also works when the target page is still mounting
 *    (e.g. clicking "Features" from /about).
 */
export default function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const id = hash.slice(1)
      let tries = 0
      const tryScroll = () => {
        const el = document.getElementById(id)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' })
        } else if (tries++ < 10) {
          setTimeout(tryScroll, 60)
        }
      }
      tryScroll()
    } else {
      window.scrollTo({ top: 0, left: 0 })
    }
  }, [pathname, hash])

  return null
}
