import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import ConnectWithUs from '../home/ConnectWithUs.jsx';

const STORAGE_KEY = 'lesuccess_connect_submitted';

export default function ConnectWithUsPopupTrigger() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSuppressedByForm, setIsSuppressedByForm] = useState(false);
  const [isSubmittedThisSession, setIsSubmittedThisSession] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const isChatOpenRef = useRef(false);
  const userDismissedRef = useRef(false);
  const autoTriggerMetRef = useRef(false);
  const lastDismissedScrollRef = useRef(null);

  // Contact Us page: popup must NOT appear under any circumstances
  const isContactPage = location.pathname === '/contact' || location.pathname.startsWith('/contact');

  // Reset per-page dismissal when navigating to a new route
  useEffect(() => {
    userDismissedRef.current = false;
    autoTriggerMetRef.current = false;
    lastDismissedScrollRef.current = null;
  }, [location.pathname]);

  // Synchronize with chatbot open/closed status
  useEffect(() => {
    const handleChatToggle = (e) => {
      const open = Boolean(e.detail?.open);
      isChatOpenRef.current = open;
      setIsChatOpen(open);

      if (open) {
        // STATE 2: Chatbot opens -> Connect With Us closes, chatbot remains open
        setIsOpen(false);
      } else {
        // STATE 3: Chatbot closes -> Connect With Us automatic-popup behavior becomes active again
        if (!userDismissedRef.current && !isSubmittedThisSession && !isContactPage) {
          if (autoTriggerMetRef.current) {
            setIsOpen(true);
          } else {
            const threshold = Math.min(600, Math.max(300, (window.innerHeight || 800) * 0.5));
            const currentScroll = window.scrollY || window.pageYOffset || 0;
            if (currentScroll >= threshold) {
              autoTriggerMetRef.current = true;
              setIsOpen(true);
            }
          }
        }
      }
    };

    const handleManualOpen = () => {
      // Manual click always allowed unless on contact page
      if (isContactPage) return;
      userDismissedRef.current = false;
      setIsOpen(true);
    };

    window.addEventListener('lesuccess-chat-toggle', handleChatToggle);
    window.addEventListener('lesuccess-open-connect', handleManualOpen);
    return () => {
      window.removeEventListener('lesuccess-chat-toggle', handleChatToggle);
      window.removeEventListener('lesuccess-open-connect', handleManualOpen);
    };
  }, [isSubmittedThisSession, isContactPage]);

  // Detect whether another relevant form is currently visible in viewport
  const checkCompetingForms = useCallback(() => {
    if (isContactPage) return true;

    const selectors = [
      '#demo-class',
      '#connect-with-us-section',
      '#course-enroll-section',
      '[data-competing-form="true"]',
      'form:not(.connect-popup form):not([data-chatbot] form):not(.chatbot-window form)',
    ];

    const elements = document.querySelectorAll(selectors.join(', '));
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;

    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      if (
        el.closest('.connect-popup') ||
        el.closest('[data-chatbot]') ||
        el.closest('.chatbot-window')
      ) {
        continue;
      }

      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) continue;

      // Element is visible in viewport
      const isInVerticalView = rect.top < windowHeight - 40 && rect.bottom > 40;
      const isInHorizontalView = rect.left < windowWidth && rect.right > 0;

      if (isInVerticalView && isInHorizontalView) {
        const style = window.getComputedStyle(el);
        if (
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          style.opacity !== '0'
        ) {
          return true;
        }
      }
    }

    return false;
  }, [isContactPage]);

  // Evaluate competing form visibility on scroll, resize, route changes & DOM mutations
  useEffect(() => {
    if (isContactPage || isSubmittedThisSession) {
      setIsSuppressedByForm(true);
      return undefined;
    }

    let ticking = false;
    const evaluateVisibility = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const suppressed = checkCompetingForms();
          setIsSuppressedByForm(suppressed);
          ticking = false;
        });
        ticking = true;
      }
    };

    evaluateVisibility();
    const timer1 = setTimeout(evaluateVisibility, 150);
    const timer2 = setTimeout(evaluateVisibility, 500);

    window.addEventListener('scroll', evaluateVisibility, { passive: true });
    window.addEventListener('resize', evaluateVisibility, { passive: true });

    const observer = new MutationObserver(evaluateVisibility);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });

    return () => {
      window.removeEventListener('scroll', evaluateVisibility);
      window.removeEventListener('resize', evaluateVisibility);
      observer.disconnect();
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [location.pathname, isContactPage, isSubmittedThisSession, checkCompetingForms]);

  // Scroll & timer detection for automatic trigger
  useEffect(() => {
    if (isSubmittedThisSession || isContactPage) return undefined;

    const checkScroll = () => {
      if (userDismissedRef.current || isSubmittedThisSession || isContactPage) return;

      const threshold = Math.min(600, Math.max(300, (window.innerHeight || 800) * 0.5));
      const currentScroll = window.scrollY || window.pageYOffset || 0;

      if (currentScroll >= threshold) {
        if (
          lastDismissedScrollRef.current !== null &&
          Math.abs(currentScroll - lastDismissedScrollRef.current) < 800
        ) {
          return;
        }

        autoTriggerMetRef.current = true;
        // STATE 1: If Chatbot is CLOSED, auto-open immediately
        // STATE 2: If Chatbot is OPEN, suppress auto-open
        if (!isChatOpenRef.current) {
          setIsOpen(true);
        }
      }
    };

    window.addEventListener('scroll', checkScroll, { passive: true });
    // Check initial scroll position on load/reload
    checkScroll();

    // Timer fallback: prompt after 6s of page visit if not already triggered
    const timer = setTimeout(() => {
      if (userDismissedRef.current || isSubmittedThisSession || isContactPage) return;
      autoTriggerMetRef.current = true;
      if (!isChatOpenRef.current) {
        setIsOpen(true);
      }
    }, 6000);

    return () => {
      window.removeEventListener('scroll', checkScroll);
      clearTimeout(timer);
    };
  }, [isSubmittedThisSession, isContactPage]);

  // User manually closes Connect With Us popup by clicking 'X'
  const handleClose = () => {
    userDismissedRef.current = true;
    lastDismissedScrollRef.current = window.scrollY || window.pageYOffset || 0;
    setIsOpen(false);
  };

  const handleSuccess = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      /* ignore storage error */
    }
    setIsSubmittedThisSession(true);
    setIsOpen(false);
  };

  if (isContactPage || isSubmittedThisSession || !isOpen) {
    return null;
  }

  return (
    <ConnectWithUs
      isModal={true}
      isChatOpen={isChatOpen}
      isHidden={isSuppressedByForm}
      onClose={handleClose}
      onSuccess={handleSuccess}
    />
  );
}
