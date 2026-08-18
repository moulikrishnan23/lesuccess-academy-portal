import { useCallback, useMemo, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import CourseHero from '../../../components/sections/CourseHero.jsx'
import CourseTabs from '../../../components/sections/CourseTabs.jsx'
import { DEFAULT_TABS } from '../../../components/sections/courseTabs.constants.js'
import WhyLearnSection from '../../../components/sections/WhyLearnSection.jsx'
import WhatYoullLearnToDoSection from '../../../components/sections/WhatYoullLearnToDoSection.jsx'
import TechStackSection from '../../../components/sections/TechStackSection.jsx'
import ModulesAccordion from '../../../components/sections/ModulesAccordion.jsx'
import CertificateSection from '../../../components/sections/CertificateSection.jsx'
import TestimonialCarousel from '../../../components/carousel/TestimonialCarousel.jsx'
import MobileEnrollBar from '../../../components/forms/MobileEnrollBar.jsx'
import ErrorState from '../../../components/ui/ErrorState.jsx'
import Skeleton, { SkeletonText } from '../../../components/ui/Skeleton.jsx'
import useCourseDetail from '../../../hooks/useCourseDetail.js'
import useCourseTestimonials from '../../../hooks/useCourseTestimonials.js'
import useSiteSettings from '../../../hooks/useSiteSettings.js'
import useDocumentMeta from '../../../hooks/useDocumentMeta.js'
import useReducedMotion from '../../../hooks/useReducedMotion.js'
import { toPlainText } from '../../../utils/sanitize.js'

/** Full-page loading state, shaped like the real page so nothing jumps. */
function CourseDetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading course">
      <div className="bg-navy-900 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <Skeleton className="mx-auto h-9 w-full max-w-xl opacity-20" />
          <Skeleton className="mx-auto mt-3 h-9 w-3/5 max-w-sm opacity-20" />
          <div className="mt-7 flex flex-wrap justify-center gap-6">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-4 w-32 opacity-20" />
            ))}
          </div>
          <div className="mt-9 flex justify-center gap-4">
            <Skeleton className="h-12 w-32 opacity-20" rounded="rounded-lg" />
            <Skeleton className="h-12 w-32 opacity-20" rounded="rounded-lg" />
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <Skeleton className="h-3 w-28" />
          <Skeleton className="mt-4 h-9 w-full max-w-md" />
          <SkeletonText lines={8} className="mt-8" />
        </div>
        <Skeleton className="h-96 w-full" rounded="rounded-card" />
      </div>
    </div>
  )
}

function CenteredPanel({ children }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl items-center px-5 py-20 sm:px-8">
      <div className="w-full">{children}</div>
    </div>
  )
}

/**
 * Course detail page — /courses/:slug
 *
 * Owns the data for the whole route and passes it down; every section below is
 * presentational. Nothing on this page is specific to any one course: a course
 * created in the admin dashboard tomorrow renders here with no code change.
 */
export default function CourseDetailPage() {
  const { slug } = useParams()
  const reduced = useReducedMotion()

  const { course, modules, techStack, isLoading, error, notFound, refetch } =
    useCourseDetail(slug)

  // Testimonials are fetched here, not in the carousel, so the carousel stays
  // presentational and reusable. They wait for the course id.
  const {
    testimonials,
    isLoading: isLoadingTestimonials,
    error: testimonialsError,
    refetch: refetchTestimonials,
  } = useCourseTestimonials(course?.id ?? null)

  const { settings } = useSiteSettings()

  useDocumentMeta({
    title: course?.title,
    description:
      toPlainText(course?.shortDescription) || toPlainText(course?.description),
  })

  const enrollFormRef = useRef(null)

  /**
   * Every CTA on the page routes through here. It scrolls to the enroll card
   * and puts the caret in the first field, so keyboard users land *in* the form
   * rather than somewhere near it.
   */
  const scrollToEnroll = useCallback(() => {
    const node = enrollFormRef.current
    if (!node) return

    node.scrollIntoView({
      behavior: reduced ? 'auto' : 'smooth',
      block: 'center',
    })

    // Focus after the scroll starts; focusing first would make the browser jump.
    window.setTimeout(() => {
      node.querySelector('input')?.focus({ preventScroll: true })
    }, reduced ? 0 : 400)
  }, [reduced])

  // Drop the testimonials tab when that section hides itself, so no tab points
  // at a section that isn't in the document.
  const hasTestimonials =
    isLoadingTestimonials || Boolean(testimonialsError) || testimonials.length > 0

  const tabs = useMemo(
    () =>
      hasTestimonials
        ? DEFAULT_TABS
        : DEFAULT_TABS.filter((tab) => tab.id !== 'testimonials'),
    [hasTestimonials],
  )

  if (isLoading) return <CourseDetailSkeleton />

  if (notFound) {
    return (
      <CenteredPanel>
        <p className="text-xs font-semibold tracking-[0.12em] text-brand uppercase">
          Error 404
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-navy-800">
          We don't have a course at this address
        </h1>
        <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink-soft">
          The link may be out of date, or the course may have been renamed. Browse
          the full list to find what you're after.
        </p>
        {/* The catalog route is owned by other work — link to it rather than
            leaving the visitor at a dead end. */}
        <Link
          to="/"
          className="bg-brand-gradient mt-8 inline-flex h-12 items-center justify-center rounded-lg px-8 text-[0.9375rem] font-medium text-white"
        >
          See all courses
        </Link>
      </CenteredPanel>
    )
  }

  if (error || !course) {
    return (
      <CenteredPanel>
        <ErrorState
          title="This course didn't load"
          message={error?.message ?? 'The server did not respond. Try again in a moment.'}
          onRetry={refetch}
        />
      </CenteredPanel>
    )
  }

  return (
    <>
      <CourseHero
        course={course}
        onEnrollClick={scrollToEnroll}
        onFreeDemoClick={scrollToEnroll}
      />

      <CourseTabs tabs={tabs} />

      {/* The role section is nested so the sticky enroll card floats alongside
          both it and the course description, as it does in the reference. */}
      <WhyLearnSection
        course={course}
        isLoading={isLoading}
        enrollFormRef={enrollFormRef}
      >
        <WhatYoullLearnToDoSection course={course} />
      </WhyLearnSection>

      <TechStackSection course={course} techStack={techStack} isLoading={isLoading} />

      <ModulesAccordion modules={modules} isLoading={isLoading} />

      <CertificateSection />

      <TestimonialCarousel
        testimonials={testimonials}
        isLoading={isLoadingTestimonials}
        error={testimonialsError}
        onRetry={refetchTestimonials}
        rating={settings.google_rating}
        reviewCount={settings.google_review_count}
      />

      <MobileEnrollBar
        course={course}
        onEnrollClick={scrollToEnroll}
        formRef={enrollFormRef}
      />
    </>
  )
}
