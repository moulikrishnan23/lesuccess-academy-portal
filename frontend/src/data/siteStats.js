import { GOOGLE_REVIEWS_META } from './googleReviews.js'

/**
 * Headline figures shown as animated counters on the Home page.
 *
 * Each value is one the site already states elsewhere; keep them in step with
 * those sources rather than editing a number here on its own:
 *  - hiringCompanies: "150+ actively hiring tech companies" (WhyChooseUs) and
 *    "150+ Hiring Partners" (HeroVideo).
 *  - courses: "View All 20+ Courses" (Footer), "20+ Tech Specializations"
 *    (CourseCatalogPage).
 *  - Google rating and review count come from GOOGLE_REVIEWS_META, the same
 *    record the Testimonials header reads. Reviews are shown as the "250+" floor
 *    the site already uses, not the exact running total.
 */
export const SITE_STATS = {
  hiringCompanies: 150,
  courses: 20,
  googleReviews: 250,
  googleRating: GOOGLE_REVIEWS_META.rating,
}
