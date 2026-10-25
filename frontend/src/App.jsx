import {
  useCallback,
  useEffect,
  useRef,
  useState,
  lazy,
  Suspense,
} from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { useAppData } from "./context/AppDataContext.jsx";

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

import Home from "./pages/Home/HomePage.jsx";
import AboutPage from "./pages/About/AboutPage.jsx";
import TeamPage from "./pages/Team/TeamPage.jsx";
import Contact from "./pages/Contact/ContactPage.jsx";
import CourseCatalogPage from "./pages/Courses/CourseCatalogPage.jsx";
import CourseDetailPage from "./pages/CourseDetail/[slug]/CourseDetailPage.jsx";
import ServicePage from "./pages/Services/ServicePage.jsx";
import CourseEnquiryModal from "./components/forms/CourseEnquiryModal.jsx";
import ConnectWithUsPopupTrigger from "./components/common/ConnectWithUsPopupTrigger.jsx";
import GalleryPage from "./pages/Gallery/GalleryPage.jsx";
import SuccessStoriesPage from './pages/SuccessStories/SuccessStoriesPage.jsx';
import LoginPage from "./pages/Auth/LoginPage.jsx";
import InitialReelExperience from "./components/common/InitialReelExperience.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { AppDataProvider } from "./context/AppDataContext.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import useAdminShortcut from "./hooks/useAdminShortcut.js";

const AdminDashboard = lazy(() => import("./pages/Admin/AdminDashboard.jsx"));
const TrainerDashboard = lazy(() => import("./pages/Trainer/TrainerDashboard.jsx"));

function HomeRoute() {
  const { successStories } = useAppData();
  const [userDismissed, setUserDismissed] = useState(false);

  const isSessionDone = () => {
    try {
      return sessionStorage.getItem("lesuccess_initial_entry_done") === "true";
    } catch {
      return false;
    }
  };

  const isItemActive = (item) => Boolean(item?.isActive ?? item?.active ?? false);
  const activeReels = (successStories.data?.reels || [])
    .filter(isItemActive)
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  const handleContinue = useCallback(() => {
    try {
      sessionStorage.setItem("lesuccess_initial_entry_done", "true");
    } catch {
      /* ignore storage access error */
    }
    setUserDismissed(true);
  }, []);

  // If already dismissed in this session, render Home normally
  if (userDismissed || isSessionDone()) {
    return <Home />;
  }

  // If success stories data is still loading, show a subtle brand loader — do NOT show Home page first!
  if (successStories.status === "loading" || successStories.status === "idle") {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#07405C] text-white">
        <div className="h-10 w-10 rounded-full border-4 border-white/20 border-t-[#DF1E26] animate-spin mb-3" />
        <p className="text-xs font-semibold tracking-wider uppercase text-slate-300">Loading LeSuccess Academy...</p>
      </div>
    );
  }

  // If there are active reels, show the Success Stories popup first! (Home is covered by popup)
  if (activeReels.length > 0) {
    return (
      <>
        <Home />
        <InitialReelExperience
          activeReels={activeReels}
          onContinue={handleContinue}
        />
      </>
    );
  }

  // Requirement 8: If no active reels, do not show popup, show Home normally
  return <Home />;
}

const AppContent = () => {
  const location = useLocation();
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

  const [isCompactHeader, setIsCompactHeader] = useState(
    typeof window !== "undefined" ? window.innerWidth < 1024 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsCompactHeader(window.innerWidth < 1024);
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
   * PUBLISH HEADER HEIGHTS TO CSS
   * =========================================================
   */
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--offer-header-h", `${offerHeaderHeight}px`);
    root.style.setProperty("--navbar-h", `${navbarHeight}px`);

    // On compact layouts, socials wrap beneath the offer. At lg and wider they
    // share the offer row. Include the floating nav's gap and top inset.
    const topInset = offerHeaderRef.current?.getBoundingClientRect().top ?? (isCompactHeader ? 8 : 10);
    const navbarGap = isCompactHeader ? 8 : 10;
    if (offerHeaderHeight > 0) {
      root.style.setProperty(
        "--navbar-top",
        `${topInset + offerHeaderHeight + navbarGap}px`
      );
    }
    const currentHeader =
      topInset + offerHeaderHeight + (!isCompactHeader && navbarVisible ? navbarGap + navbarHeight : 0);

    root.style.setProperty("--app-header", `${currentHeader}px`);
    root.style.setProperty(
      "--app-header-max",
      `${topInset + offerHeaderHeight + (isCompactHeader ? 0 : navbarGap + navbarHeight)}px`
    );
  }, [offerHeaderHeight, navbarHeight, navbarVisible, isCompactHeader]);

  return (
    <div className="min-h-screen bg-surface text-ink transition-colors duration-200">
      {/* =====================================================
          OFFER STRIP AND SOCIAL LINKS
          - The offer strip stays visible while scrolling.
          - Social links stay visible independently of the scroll-responsive navbar.
      ===================================================== */}
      {!isDashboard && (
        <OfferHeader
          offerHeaderRef={offerHeaderRef}
        />
      )}

      {/* =====================================================
          RESPONSIVE NAVBAR:
          - Source desktop navbar sits beneath the preserved offer strip.
          - Desktop hides on scroll down; compact navigation stays at the bottom.
      ===================================================== */}
      {!isDashboard && (
        <div
          ref={navbarRef}
          className={`fixed inset-x-0 z-40 transition-[transform,opacity] duration-300 ease-in-out ${
            isCompactHeader || navbarVisible
              ? "translate-y-0 opacity-100 pointer-events-auto"
              : "-translate-y-28 opacity-0 pointer-events-none"
          }`}
          style={{ top: isCompactHeader ? "auto" : "var(--navbar-top, 4rem)", bottom: isCompactHeader ? 0 : "auto" }}
        >
          <Navbar onOpenEnquiry={() => setIsEnquiryOpen(true)} />
        </div>
      )}

      {/* =====================================================
          TOP HEADER SPACE:
          - Reserve the measured top header height for the source hero layout.
          - Compact layouts exclude the bottom navbar from this top spacer.
      ===================================================== */}
      {!isDashboard && (
        <div aria-hidden="true" className="w-full" style={{ height: "var(--app-header-max, 148px)" }} />
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
                  <HomeRoute />
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
          <Footer/>
        </div>
      )}

      {/* Global Back to Top Button for Public Pages */}
      {!isDashboard && <BackToTop />}

      {/* =====================================================
          CHATBOT (Admin Switchable: API Chatbot vs Normal Chatbot)
          Only ONE chatbot is active and rendered at a time.
      ===================================================== */}
      {!isDashboard && !isLoginPage && settings?.chatbot_enabled !== 'false' && (
        settings?.chatbot_mode?.toUpperCase() === 'API' ? (
          <ChatWidget onOpenEnquiry={() => setIsEnquiryOpen(true)} />
        ) : (
          <BasicChatbot onOpenEnquiry={() => setIsEnquiryOpen(true)} />
        )
      )}


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
