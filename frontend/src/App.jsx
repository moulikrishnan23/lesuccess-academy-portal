import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import OfferHeader from "./components/OfferHeader";
import PublicLayout from "./components/layout/PublicLayout.jsx";
import PageTransition from "./components/layout/PageTransition.jsx";
import Footer from "./components/Footer.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import { AnimatePresence } from "framer-motion";

import Home from "./pages/Home";
import AboutPage from "./pages/About/AboutPage.jsx";
import TeamPage from "./pages/Team/TeamPage.jsx";
import Contact from "./pages/Contact";
import CourseCatalogPage from "./pages/Courses/CourseCatalogPage.jsx";
import CourseDetailPage from "./pages/CourseDetail/[slug]/CourseDetailPage.jsx";
import ServicePage from "./pages/Services/ServicePage.jsx";
import CourseEnquiryModal from "./components/forms/CourseEnquiryModal.jsx";
import GalleryPage from "./pages/Gallery/GalleryPage.jsx";
import LoginPage from "./pages/Auth/LoginPage.jsx";
import AdminDashboard from "./pages/Admin/AdminDashboard.jsx";
import TrainerDashboard from "./pages/Trainer/TrainerDashboard.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { AppDataProvider } from "./context/AppDataContext.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import useAdminShortcut from "./hooks/useAdminShortcut.js";

const AppContent = () => {
  const location = useLocation();

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
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true
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

    const height =
      offerHeaderRef.current.getBoundingClientRect().height;

    setOfferHeaderHeight(height);
  }, []);

  /*
   * =========================================================
   * UPDATE NAVBAR HEIGHT
   * =========================================================
   */

  const updateNavbarHeight = useCallback(() => {
    if (!navbarRef.current) return;

    const height =
      navbarRef.current.getBoundingClientRect().height;

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

  useEffect(() => {
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

    window.addEventListener(
      "resize",
      updateOfferHeaderHeight
    );

    window.addEventListener(
      "resize",
      updateNavbarHeight
    );

    return () => {
      resizeObserver.disconnect();

      window.removeEventListener(
        "resize",
        updateOfferHeaderHeight
      );

      window.removeEventListener(
        "resize",
        updateNavbarHeight
      );
    };
  }, [
    updateOfferHeaderHeight,
    updateNavbarHeight,
  ]);

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
        }

        /*
         * Scrolling DOWN
         */

        else if (
          currentScrollY >
          lastScrollY.current + 5
        ) {
          setNavbarVisible(false);
        }

        /*
         * Scrolling UP
         */

        else if (
          currentScrollY <
          lastScrollY.current - 5
        ) {
          setNavbarVisible(true);
        }

        lastScrollY.current = currentScrollY;
        ticking.current = false;
      });
    };

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
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

  const totalHeaderHeight =
    offerHeaderHeight + navbarHeight;

  /*
   * =========================================================
   * PUBLISH HEADER HEIGHTS TO CSS
   * =========================================================
   */
  useEffect(() => {
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
      `${offerHeaderHeight + (isDesktop ? navbarHeight : 0)}px`
    );
  }, [offerHeaderHeight, navbarHeight, navbarVisible, isDesktop]);

  return (
    <div className="min-h-screen bg-surface text-ink transition-colors duration-200">

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

      <main className="flex-1 pb-4 lg:pb-0">
        <ScrollToTop />
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>

            {/* Home */}
            <Route
              path="/"
              element={
                <PageTransition>
                  <Home />
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
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Protected Trainer Dashboard */}
            <Route
              path="/trainer/dashboard"
              element={
                <ProtectedRoute allowedRole="TRAINER">
                  <TrainerDashboard />
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
          <Footer/>
        </div>
      )}

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