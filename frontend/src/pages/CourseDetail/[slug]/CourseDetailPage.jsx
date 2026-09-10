import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import CourseHero from '../../../components/sections/CourseHero.jsx'
import CourseTabs from '../../../components/sections/CourseTabs.jsx'
import { DEFAULT_TABS } from '../../../components/sections/courseTabs.constants.js'
import WhyLearnSection from '../../../components/sections/WhyLearnSection.jsx'
import WhatYoullLearnToDoSection from '../../../components/sections/WhatYoullLearnToDoSection.jsx'
import EnrollCourseForm from '../../../components/forms/EnrollCourseForm.jsx'
import TechStackSection from '../../../components/sections/TechStackSection.jsx'
import ModulesAccordion from '../../../components/sections/ModulesAccordion.jsx'
import CertificateSection from '../../../components/sections/CertificateSection.jsx'
import TestimonialCarousel from '../../../components/carousel/TestimonialCarousel.jsx'
import MobileEnrollBar from '../../../components/forms/MobileEnrollBar.jsx'
import { fadeUp, motionSafe, ONCE_IN_VIEW } from '../../../animations/variants.js'
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
  const location = useLocation()
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

  // Automatically scroll to the Enroll Form if the URL contains #enroll
  useEffect(() => {
    if (location.hash === '#enroll' && !isLoading && course) {
      const timer = window.setTimeout(() => {
        scrollToEnroll()
      }, 150)
      return () => window.clearTimeout(timer)
    }
  }, [location.hash, isLoading, course, scrollToEnroll])

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

      {/*
        One grid, one sticky column, everything up to the testimonials.

        A sticky element can only travel inside its own container, so the span
        of the enroll card is decided entirely by what lives in this left
        column. It runs from the course description down to the certificate and
        releases as the testimonials begin — the reader is weighing the course
        for all of it, and that is exactly when the form should be in reach.

        The reviews are in the column too, and they are the reason the card
        survives the certificate. A sticky element unpins once its container's
        bottom reaches it, so it stops travelling one card-height before the
        column ends. With the column ending at the certificate the card went
        static half way through it; with the reviews below, the certificate is
        no longer the end of the runway.
      */}
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        {/*
          The card widens only once there is room to spare. At exactly lg the
          container is barely wider than the card plus the certificate's
          side-by-side layout, and a 400px track squeezes the benefits list to
          four wrapped lines; from xl there is room for the full width.
        */}
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_400px]">
          {/*
            min-w-0 so a wide child cannot push the grid past its track.

            No bottom padding here, deliberately. A sticky element unpins once
            its container's bottom reaches it, so padding the column is the only
            way to keep the card fixed for longer — and it buys that time with
            an equal amount of empty column. 542px of blank space beside a
            floating card looks broken; the card releasing as the reviews
            arrive does not. See the comment on the grid above.
          */}
          <div className="min-w-0">
            <WhyLearnSection course={course} isLoading={isLoading} />
            <WhatYoullLearnToDoSection course={course} />
            <TechStackSection
              course={course}
              techStack={techStack}
              isLoading={isLoading}
            />
            <ModulesAccordion modules={modules} isLoading={isLoading} />
            <CertificateSection course={course} />
            <TestimonialCarousel
              testimonials={testimonials}
              isLoading={isLoadingTestimonials}
              error={testimonialsError}
              onRetry={refetchTestimonials}
              rating={settings.google_rating}
              reviewCount={settings.google_review_count}
            />
          </div>

          <motion.div
            variants={motionSafe(fadeUp, reduced)}
            initial="hidden"
            whileInView="visible"
            viewport={ONCE_IN_VIEW}
            /*
              Pinned below both the site header and the course tab bar, using
              the heights they publish rather than a fixed guess — top-24 was
              96px against a header that measures 134, so the card sat partly
              behind it. --app-header-max, not --app-header: the card should
              not shuffle up and down as the navbar hides on scroll.

              Below lg the card drops into the flow beneath the content and
              MobileEnrollBar carries the CTA.
            */
            className="lg:sticky lg:self-start"
            style={{
              top: 'calc(var(--app-header-max, 0px) + var(--course-tabs-h, 0px) + 1rem)',
            }}
          >
            <EnrollCourseForm
              ref={enrollFormRef}
              courseId={course?.id}
              discountLabel={course?.discountLabel}
            />
          </motion.div>
        </div>
      </div>

      <MobileEnrollBar
        course={course}
        onEnrollClick={scrollToEnroll}
        formRef={enrollFormRef}
      />
    </>
  )
}
