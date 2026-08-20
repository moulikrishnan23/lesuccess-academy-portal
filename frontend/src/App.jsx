import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import OfferHeader from './components/OfferHeader'
import PublicLayout from './components/layout/PublicLayout.jsx'
import Home from './pages/Home'
import Contact from './pages/Contact'
import CourseCatalogPage from './pages/Courses/CourseCatalogPage.jsx'
import CourseDetailPage from './pages/CourseDetail/[slug]/CourseDetailPage.jsx'

/**
 * Only the course detail route is owned by this task. The home, catalog and
 * admin routes belong to other work — add them alongside, don't restructure.
 *
 * Merge note (dev_ns <- origin/dev): OfferHeader and Navbar come from dev and
 * render above every route, as they did there. BrowserRouter used to live in
 * this file on dev and in main.jsx here; two nested routers throw, so there is
 * now exactly one, in main.jsx.
 */
export default function App() {
  return (
    <>
      <OfferHeader />
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />

        <Route element={<PublicLayout />}>
          <Route path="/courses" element={<CourseCatalogPage />} />
          <Route path="/courses/:slug" element={<CourseDetailPage />} />
        </Route>
      </Routes>
    </>
  )
}
