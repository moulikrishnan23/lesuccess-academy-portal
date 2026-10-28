import useDocumentMeta from "./hooks/useDocumentMeta.js";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  lazy,
  Suspense,
} from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import Navbar from "./components/layout/Navbar.jsx";
import OfferHeader from "./components/layout/OfferHeader.jsx";
import PublicLayout from "./components/layout/PublicLayout.jsx";
import PageTransition from "./components/layout/PageTransition.jsx";
import Footer from "./components/layout/Footer.jsx";
import ScrollToTop from "./components/layout/ScrollToTop.jsx";
import BackToTop from "./components/common/BackToTop.jsx";
import BasicChatbot from "./components/chatbot/BasicChatbot.jsx";
import ChatWidget from "./components/chatbot/ChatWidget.jsx";
import useSiteSettings from "./hooks/useSiteSettings.js";
import { AnimatePresence } from "framer-motion";
import ScrollProgressBar from "./components/ui/ScrollProgressBar.jsx";
import FloatingActionHub from "./components/ui/FloatingActionHub.jsx";

import Home from "./pages/Home/HomePage.jsx";
import CourseEnquiryModal from "./components/forms/CourseEnquiryModal.jsx";
import ConnectWithUsPopupTrigger from "./components/common/ConnectWithUsPopupTrigger.jsx";
import BrandSplash from "./components/common/BrandSplash.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { AppDataProvider } from "./context/AppDataContext.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import useAdminShortcut from "./hooks/useAdminShortcut.js";

// Home is the landing page and stays in the main bundle; every other public page
// is split into its own chunk and fetched on first visit. The Suspense boundary
// for these lives in PageTransition, which wraps every public route.
const AboutPage = lazy(() => import("./pages/About/AboutPage.jsx"));
const TeamPage = lazy(() => import("./pages/Team/TeamPage.jsx"));
const Contact = lazy(() => import("./pages/Contact/ContactPage.jsx"));
const CourseCatalogPage = lazy(() => import("./pages/Courses/CourseCatalogPage.jsx"));
const CourseDetailPage = lazy(() => import("./pages/CourseDetail/[slug]/CourseDetailPage.jsx"));
const ServicePage = lazy(() => import("./pages/Services/ServicePage.jsx"));
const GalleryPage = lazy(() => import("./pages/Gallery/GalleryPage.jsx"));
const SuccessStoriesPage = lazy(() => import("./pages/SuccessStories/SuccessStoriesPage.jsx"));
const LoginPage = lazy(() => import("./pages/Auth/LoginPage.jsx"));

const AdminDashboard = lazy(() => import("./pages/Admin/AdminDashboard.jsx"));
const TrainerDashboard = lazy(
  () => import("./pages/Trainer/TrainerDashboard.jsx"),
);

function HomeRoute({ initialEntry, onIntroComplete }) {
  useDocumentMeta({ title: "Technology Training in Coimbatore" });
  const [showIntro, setShowIntro] = useState(() => {
    if (!initialEntry) return false;
    try { return sessionStorage.getItem("lesuccess_initial_entry_done") !== "true"; }
    catch { return true; }
  });
  const finishIntro = useCallback(() => {
    try { sessionStorage.setItem("lesuccess_initial_entry_done", "true"); } catch { /* Storage may be unavailable. */ }
    setShowIntro(false);
    onIntroComplete();
  }, [onIntroComplete]);
  return <><Home />{showIntro && <BrandSplash onComplete={finishIntro} />}</>;
}

const AppContent = () => {
  const location = useLocation();
  const [initialPath] = useState(location.pathname);
  const [introDone, setIntroDone] = useState(false);
  const markIntroDone = useCallback(() => setIntroDone(true), []);
  const { settings } = useSiteSettings();

  // Ctrl+Shift+Alt+1 jumps to the admin area. Mounted here because this is the
  // one component inside both BrowserRouter and AuthProvider.
  useAdminShortcut();
  const isDashboard =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/trainer");
  const isLoginPage = location.pathname === "/login";

  // Enquiry popup modal visibility (starts closed on open, interactive launcher available)
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  /*
   * =========================================================
   * HEADER STATES
   * =========================================================
   */

  // Navbar visibility while scrolling
  const [navbarVisible, setNavbarVisible] = useState(true);

  // Desktop vs mobile viewport tracking (breakpoint >= 1024px / lg)
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true,
  );

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /*
   * =========================================================
   * HEADER HEIGHTS
   * =========================================================
   */

  const [offerHeaderHeight, setOfferHeaderHeight] = useState(0);
  const [navbarHeight, setNavbarHeight] = useState(0);

  /*
   * =========================================================
   * REFS
   * =========================================================
   */

  const offerHeaderRef = useRef(null);
  const navbarRef = useRef(null);

  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  /*
   * =========================================================
   * UPDATE OFFER HEADER HEIGHT
   * =========================================================
   */

  const updateOfferHeaderHeight = useCallback(() => {
    if (!offerHeaderRef.current) return;
    const height = offerHeaderRef.current.getBoundingClientRect().height;
    setOfferHeaderHeight(height);
  }, []);

  /*
   * =========================================================
   * UPDATE NAVBAR HEIGHT
   * =========================================================
   */

  const updateNavbarHeight = useCallback(() => {
    if (!navbarRef.current) return;
    const height = navbarRef.current.getBoundingClientRect().height;
    setNavbarHeight(height);
  }, []);

  /*
   * =========================================================
   * DYNAMIC HEIGHT OBSERVER
   * =========================================================
   *
   * Automatically recalculates the heights when:
   *
   * - Browser is resized
   * - Offer text wraps
   * - Mobile menu opens
   * - Navbar changes height
   */

  // Reserve measured header space before the first paint to avoid shifting main.
  useLayoutEffect(() => {
    updateOfferHeaderHeight();
    updateNavbarHeight();

    const resizeObserver = new ResizeObserver(() => {
      updateOfferHeaderHeight();
      updateNavbarHeight();
    });

    if (offerHeaderRef.current) {
      resizeObserver.observe(offerHeaderRef.current);
    }

    if (navbarRef.current) {
      resizeObserver.observe(navbarRef.current);
    }

    const handleResize = () => {
      updateOfferHeaderHeight();
      updateNavbarHeight();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [updateOfferHeaderHeight, updateNavbarHeight]);

  /*
   * =========================================================
   * SCROLL DIRECTION
   * =========================================================
   *
   * At top:
   *     Navbar visible
   *
   * Scroll down:
   *     Navbar hides
   *     OfferHeader stays visible
   *
   * Scroll up:
   *     Navbar appears
   */

  useEffect(() => {
    const handleScroll = () => {
      if (ticking.current) return;

      ticking.current = true;

      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;

        /*
         * Always show navbar at the very top
         */

        if (currentScrollY <= 20) {
          setNavbarVisible(true);
        } else if (currentScrollY > lastScrollY.current + 5) {
          setNavbarVisible(false);
        } else if (currentScrollY < lastScrollY.current - 5) {
          setNavbarVisible(true);
        }

        lastScrollY.current = currentScrollY;
        ticking.current = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /*
   * =========================================================
   * NAVBAR POSITION
   * =========================================================
   *
   * Navbar always stays below OfferHeader on desktop.
   */

  const navbarTop = offerHeaderHeight;

  /*
   * =========================================================
   * TOTAL HEADER HEIGHT (DESKTOP)
   * =========================================================
   *
   * Reserves space in the page so the fixed desktop
   * headers don't cover the page content.
   */

  const totalHeaderHeight = offerHeaderHeight + navbarHeight;

  /*
   * =========================================================
   * PUBLISH HEADER HEIGHTS TO CSS
   * =========================================================
   */
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--offer-header-h", `${offerHeaderHeight}px`);
    root.style.setProperty("--navbar-h", `${navbarHeight}px`);

    // On mobile (< 1024px), navbar is fixed at the BOTTOM of the viewport.
    // The only fixed element at the top of the mobile viewport is OfferHeader.
    // On desktop (>= 1024px), navbar is fixed at the TOP below OfferHeader.
    // When desktop navbar hides on scroll down (navbarVisible === false),
    // the only visible top element is OfferHeader.
    const currentHeader =
      offerHeaderHeight + (isDesktop && navbarVisible ? navbarHeight : 0);

    root.style.setProperty("--app-header", `${currentHeader}px`);
    root.style.setProperty(
      "--app-header-max",
      `${offerHeaderHeight + (isDesktop ? navbarHeight : 0)}px`,
    );
  }, [offerHeaderHeight, navbarHeight, navbarVisible, isDesktop]);

  return (
    <div className="min-h-screen bg-surface text-ink transition-colors duration-200">
      {/* Creative Agency Custom Cursor System */}

      {/* Global Top Scroll Progress Bar */}
      <ScrollProgressBar />

      {/* =====================================================
          OFFER HEADER (ALWAYS FIXED & VISIBLE)
      ===================================================== */}

      {!isDashboard && (
        <div
          ref={offerHeaderRef}
          className="fixed left-0 top-0 z-60 w-full shadow-xs"
        >
          <OfferHeader />
        </div>
      )}

      {/* =====================================================
          NAVBAR:
          - On mobile (< 1024px): Fixed at BOTTOM of viewport,
            always visible.
          - On desktop (>= 1024px): Fixed at TOP below OfferHeader,
            scroll-responsive (hides on scroll down, shows on scroll up).
      ===================================================== */}

      {!isDashboard && (
        <div
          ref={navbarRef}
          className={`fixed left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
            isDesktop
              ? navbarVisible
                ? "translate-y-0 opacity-100 shadow-xs"
                : "-translate-y-full opacity-0 pointer-events-none"
              : "translate-y-0 opacity-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
          }`}
          style={{
            top: isDesktop ? `${navbarTop}px` : "auto",
            bottom: isDesktop ? "auto" : "0px",
            willChange: "transform",
          }}
        >
          <Navbar onOpenEnquiry={() => setIsEnquiryOpen(true)} />
        </div>
      )}

      {/* =====================================================
          TOP HEADER SPACE:
          - On mobile (< 1024px): Spacer height is ONLY offerHeaderHeight,
            so Hero / page content starts IMMEDIATELY below OfferHeader!
          - On desktop (>= 1024px): Spacer height is totalHeaderHeight
            (offerHeaderHeight + navbarHeight), so content starts below Navbar.
      ===================================================== */}

      {!isDashboard && (
        <>
          <div
            aria-hidden="true"
            className="block lg:hidden"
            style={{
              height: `${offerHeaderHeight}px`,
            }}
          />
          <div
            aria-hidden="true"
            className="hidden lg:block"
            style={{
              height: `${totalHeaderHeight}px`,
            }}
          />
        </>
      )}

      {/* =====================================================
          PAGE ROUTES
      ===================================================== */}

      <main className="flex-1 pb-4 lg:pb-0 [overflow-x:clip] w-full max-w-full">
        <ScrollToTop />
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            {/* Home */}
            <Route
              path="/"
              element={
                <PageTransition>
                  <HomeRoute initialEntry={initialPath === "/" && !introDone} onIntroComplete={markIntroDone} />
                </PageTransition>
              }
            />

            {/* Success Stories */}
            <Route
              path="/success-stories"
              element={
                <PageTransition>
                  <SuccessStoriesPage />
                </PageTransition>
              }
            />

            {/* Gallery */}
            <Route
              path="/gallery"
              element={
                <PageTransition>
                  <GalleryPage />
                </PageTransition>
              }
            />

            {/* Login */}
            <Route
              path="/login"
              element={
                <PageTransition>
                  <LoginPage />
                </PageTransition>
              }
            />

            {/* About */}
            <Route
              path="/about"
              element={
                <PageTransition>
                  <AboutPage />
                </PageTransition>
              }
            />

            {/* Our Team */}
            <Route
              path="/our-team"
              element={
                <PageTransition>
                  <TeamPage />
                </PageTransition>
              }
            />
            <Route
              path="/team"
              element={
                <PageTransition>
                  <TeamPage />
                </PageTransition>
              }
            />

            {/* Contact */}
            <Route
              path="/contact"
              element={
                <PageTransition>
                  <Contact />
                </PageTransition>
              }
            />

            {/* Protected Admin Dashboard */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRole="ADMIN">
                  <Suspense
                    fallback={
                      <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-[#DF1E26]" />
                      </div>
                    }
                  >
                    <AdminDashboard />
                  </Suspense>
                </ProtectedRoute>
              }
            />

            {/* Protected Trainer Dashboard */}
            <Route
              path="/trainer/dashboard"
              element={
                <ProtectedRoute allowedRole="TRAINER">
                  <Suspense
                    fallback={
                      <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-[#DF1E26]" />
                      </div>
                    }
                  >
                    <TrainerDashboard />
                  </Suspense>
                </ProtectedRoute>
              }
            />

            {/* Public Layout */}
            <Route element={<PublicLayout />}>
              <Route
                path="/courses"
                element={
                  <PageTransition>
                    <CourseCatalogPage />
                  </PageTransition>
                }
              />
              <Route
                path="/courses/:slug"
                element={
                  <PageTransition>
                    <CourseDetailPage />
                  </PageTransition>
                }
              />
              <Route
                path="/services"
                element={
                  <PageTransition>
                    <ServicePage />
                  </PageTransition>
                }
              />
              <Route
                path="/service"
                element={
                  <PageTransition>
                    <ServicePage />
                  </PageTransition>
                }
              />
            </Route>
          </Routes>
        </AnimatePresence>
      </main>

      {!isDashboard && (
        <div className="pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] lg:pb-0">
          <Footer />
        </div>
      )}

      {/* Global Back to Top Button for Public Pages */}
      {!isDashboard && <BackToTop />}

      {/* Floating Action Hub (Career Counseling, WhatsApp & Free Live Demo) */}
      {!isDashboard && !isLoginPage && (
        <FloatingActionHub onOpenDemo={() => setIsEnquiryOpen(true)} />
      )}

      {/* =====================================================
          CHATBOT (Admin Switchable: API Chatbot vs Normal Chatbot)
          Only ONE chatbot is active and rendered at a time.
      ===================================================== */}
      {!isDashboard &&
        !isLoginPage &&
        settings?.chatbot_enabled !== "false" &&
        (settings?.chatbot_mode?.toUpperCase() === "API" ? (
          <ChatWidget onOpenEnquiry={() => setIsEnquiryOpen(true)} />
        ) : (
          <BasicChatbot onOpenEnquiry={() => setIsEnquiryOpen(true)} />
        ))}

      {/* =====================================================
          CONNECT WITH US POPUP (Triggered after ~3 sections)
      ===================================================== */}
      {!isDashboard && !isLoginPage && <ConnectWithUsPopupTrigger />}

      {/* =====================================================
          COURSE ENQUIRY POPUP MODAL (Triggered by Navbar/CTAs)
      ===================================================== */}
      {!isDashboard && !isLoginPage && (
        <CourseEnquiryModal
          isOpen={isEnquiryOpen}
          onClose={() => setIsEnquiryOpen(false)}
        />
      )}
    </div>
  );
};

const App = () => {
  return (
    <AppDataProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </AppDataProvider>
  );
};

export default App;
