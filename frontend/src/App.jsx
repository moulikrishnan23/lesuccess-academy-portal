import { Route, Routes } from 'react-router-dom'
import PublicLayout from './components/layout/PublicLayout.jsx'
import CourseDetailPage from './pages/CourseDetail/[slug]/CourseDetailPage.jsx'
import DevIndex from './pages/DevIndex.jsx'

/**
 * Only the course detail route is owned by this task. The home, catalog and
 * admin routes belong to other work — add them alongside, don't restructure.
 */
export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/courses/:slug" element={<CourseDetailPage />} />
        {/* PLACEHOLDER — remove once the real home page lands. */}
        <Route path="*" element={<DevIndex />} />
      </Route>
    </Routes>
  )
}
