import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import ConnectWithUs from '../home/ConnectWithUs.jsx';

const STORAGE_KEY = 'lesuccess_connect_submitted';

export default function ConnectWithUsPopupTrigger() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
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
        if (!userDismissedRef.current && !isSubmittedThisSession) {
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
      // Manual click always allowed
      userDismissedRef.current = false;
      setIsOpen(true);
    };

    window.addEventListener('lesuccess-chat-toggle', handleChatToggle);
    window.addEventListener('lesuccess-open-connect', handleManualOpen);
    return () => {
      window.removeEventListener('lesuccess-chat-toggle', handleChatToggle);
      window.removeEventListener('lesuccess-open-connect', handleManualOpen);
    };
  }, [isSubmittedThisSession]);

  // Scroll & timer detection for automatic trigger
  useEffect(() => {
    if (isSubmittedThisSession) return undefined;

    const checkScroll = () => {
      if (userDismissedRef.current || isSubmittedThisSession) return;

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
      if (userDismissedRef.current || isSubmittedThisSession) return;
      autoTriggerMetRef.current = true;
      if (!isChatOpenRef.current) {
        setIsOpen(true);
      }
    }, 6000);

    return () => {
      window.removeEventListener('scroll', checkScroll);
      clearTimeout(timer);
    };
  }, [isSubmittedThisSession]);

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

  if (isSubmittedThisSession || !isOpen) {
    return null;
  }

  return (
    <ConnectWithUs
      isModal={true}
      isChatOpen={isChatOpen}
      onClose={handleClose}
      onSuccess={handleSuccess}
    />
  );
}
