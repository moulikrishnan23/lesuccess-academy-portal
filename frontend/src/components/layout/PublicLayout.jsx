import { Outlet } from 'react-router-dom'

/**
 * PLACEHOLDER — this file belongs to whoever owns src/components/layout/.
 *
 * The course detail page needs *something* to render into, so this is the
 * smallest possible shell: a <main> and an <Outlet>. Navbar, MobileDrawer,
 * Footer and PromoBanner are deliberately absent.
 *
 * Replace this wholesale with the real PublicLayout. The only contract the
 * course page depends on is that its content sits inside <main>, and that any
 * sticky header is no taller than the `scroll-padding-top` set in index.css.
 */
export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-white">
      <main>
        <Outlet />
      </main>
    </div>
  )
}
