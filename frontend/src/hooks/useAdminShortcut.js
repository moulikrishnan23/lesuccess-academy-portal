import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

/**
 * Ctrl+Shift+Alt+1 opens the admin area from anywhere on the site.
 *
 * /login is deliberately unlinked from the UI, so staff reach it by typing the
 * URL. This is a second way through that same door and grants nothing on its
 * own — ProtectedRoute and the JWT still decide what actually opens.
 *
 * Matched on `event.code`, not `event.key`: with Alt held, `key` reports a
 * composed character on several keyboard layouts, while `code` stays "Digit1"
 * everywhere. Numpad1 is accepted too, so numpad users aren't silently left out.
 *
 * Ctrl+Alt is AltGr on Windows, where AltGr+digit types a real character on
 * layouts like UK, German and Turkish. The handler therefore stands down while
 * focus is in a field — which is the only place that character would be wanted.
 */
const TRIGGER_CODES = ['Digit1', 'Numpad1']

function isTypingTarget(target) {
  if (!target || typeof target !== 'object') return false
  if (target.isContentEditable) return true
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

export default function useAdminShortcut() {
  const navigate = useNavigate()
  const { user, isAuthenticated, loading } = useAuth()

  useEffect(() => {
    function handleKeyDown(event) {
      if (!event.ctrlKey || !event.shiftKey || !event.altKey || event.metaKey) return
      if (!TRIGGER_CODES.includes(event.code)) return
      if (isTypingTarget(event.target)) return

      // Only claimed once the chord is a definite match, so no other keystroke
      // is ever swallowed.
      event.preventDefault()

      /*
        Destination mirrors ProtectedRoute's rules rather than restating them,
        so the two can't drift apart. While auth is still resolving there is no
        role to route on, so /login takes it from there.
      */
      if (loading || !isAuthenticated) {
        navigate('/login')
        return
      }
      if (user?.role === 'ADMIN') {
        navigate('/admin/dashboard')
        return
      }
      if (user?.role === 'TRAINER') {
        navigate('/trainer/dashboard')
        return
      }
      navigate('/')
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate, user, isAuthenticated, loading])
}
