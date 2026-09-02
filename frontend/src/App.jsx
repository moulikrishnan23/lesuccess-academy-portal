import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar";
import OfferHeader from "./components/OfferHeader";
import PublicLayout from "./components/layout/PublicLayout.jsx";
import Footer from "./components/Footer.jsx";

import Home from "./pages/Home";
import Contact from "./pages/Contact";
import CourseCatalogPage from "./pages/Courses/CourseCatalogPage.jsx";
import CourseDetailPage from "./pages/CourseDetail/[slug]/CourseDetailPage.jsx";
import ServicePage from "./pages/Services/ServicePage.jsx";


const App = () => {
  /*
   * =========================================================
   * HEADER STATES
   * =========================================================
   */

  // Navbar visibility while scrolling
  const [navbarVisible, setNavbarVisible] = useState(true);

  // Hide both headers when footer is visible
  const [footerVisible, setFooterVisible] = useState(false);

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
   * FOOTER OBSERVER
   * =========================================================
   *
   * Footer visible:
   *     OfferHeader hides
   *     Navbar hides
   *
   * Footer not visible:
   *     Normal scroll behaviour resumes
   */

  useEffect(() => {
    const footer = document.querySelector("footer");

    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setFooterVisible(entry.isIntersecting);
      },
      {
        threshold: 0.01,
      }
    );

    observer.observe(footer);

    return () => {
      observer.disconnect();
    };
  }, []);

  /*
   * =========================================================
   * NAVBAR POSITION
   * =========================================================
   *
   * Navbar always stays below OfferHeader.
   */

  const navbarTop = offerHeaderHeight;

  /*
   * =========================================================
   * TOTAL HEADER HEIGHT
   * =========================================================
   *
   * This reserves space in the page so the fixed
   * headers don't cover the page content.
   */

  const totalHeaderHeight =
    offerHeaderHeight + navbarHeight;

  /*
   * =========================================================
   * FINAL VISIBILITY
   * =========================================================
   */

  const showOfferHeader = !footerVisible;

  const showNavbar =
    navbarVisible && !footerVisible;

  return (
    <div className="min-h-screen">

      {/* =====================================================
          OFFER HEADER
      ===================================================== */}

      <div
        ref={offerHeaderRef}
        className={`
          fixed
          left-0
          top-0
          z-60
          w-full
          transition-transform
          duration-300
          ease-in-out
          ${
            showOfferHeader
              ? "translate-y-0"
              : "-translate-y-full"
          }
        `}
      >
        <OfferHeader />
      </div>

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <div
        ref={navbarRef}
        className={`
          fixed
          left-0
          z-50
          w-full
          transition-transform
          duration-300
          ease-in-out
          ${
            showNavbar
              ? "translate-y-0"
              : "-translate-y-full"
          }
        `}
        style={{
          top: `${navbarTop}px`,
        }}
      >
        <Navbar />
      </div>

      {/* =====================================================
          HEADER SPACE
      =====================================================
      
      Keeps the page content from jumping underneath the
      fixed OfferHeader + Navbar.
      
      Height is calculated dynamically.
      
      ===================================================== */}

      <div
        aria-hidden="true"
        style={{
          height: `${totalHeaderHeight}px`,
        }}
      />

      {/* =====================================================
          PAGE ROUTES
      ===================================================== */}

      <main>
        <Routes>

          {/* Home */}

          <Route
            path="/"
            element={<Home />}
          />

          {/* Contact */}

          <Route
            path="/contact"
            element={<Contact />}
          />

          {/* Public Layout */}

          <Route element={<PublicLayout />}>

            {/* Courses */}

            <Route
              path="/courses"
              element={<CourseCatalogPage />}
            />

            {/* Course Detail */}

            <Route
              path="/courses/:slug"
              element={<CourseDetailPage />}
            />

            {/* Service */}

            <Route
              path="/service"
              element={<ServicePage />}
            />

          </Route>

        </Routes>
      </main>


      <div>
        <Footer/>
      </div>
    </div>
  );
};

export default App;