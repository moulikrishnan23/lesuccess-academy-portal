import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import ConnectWithUs from '../home/ConnectWithUs.jsx';

const STORAGE_KEY = 'lesuccess_connect_submitted';

export default function ConnectWithUsPopupTrigger() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isPermanentlyDisabled, setIsPermanentlyDisabled] = useState(() => {
    try {
      return (
        localStorage.getItem(STORAGE_KEY) === 'true' ||
        sessionStorage.getItem(STORAGE_KEY) === 'true'
      );
    } catch {
      return false;
    }
  });

  const lastDismissedScrollRef = useRef(null);
  const triggeredThisPageRef = useRef(false);

  // Reset per-page trigger flag when navigating to a new route
  useEffect(() => {
    triggeredThisPageRef.current = false;
    lastDismissedScrollRef.current = null;
  }, [location.pathname]);

  // Close popup if chatbot window opens so they don't overlap
  useEffect(() => {
    const handleChatToggle = (e) => {
      if (e.detail?.open) {
        setIsOpen(false);
      }
    };
    window.addEventListener('lesuccess-chat-toggle', handleChatToggle);
    return () => window.removeEventListener('lesuccess-chat-toggle', handleChatToggle);
  }, []);

  // Scroll & timer detection
  useEffect(() => {
    if (isPermanentlyDisabled) return undefined;

    const checkTrigger = () => {
      if (isOpen || triggeredThisPageRef.current) return;

      try {
        if (
          localStorage.getItem(STORAGE_KEY) === 'true' ||
          sessionStorage.getItem(STORAGE_KEY) === 'true'
        ) {
          setIsPermanentlyDisabled(true);
          return;
        }
      } catch {
        /* ignore storage access error */
      }

      const threshold = Math.min(800, Math.max(450, (window.innerHeight || 800) * 0.7));
      const currentScroll = window.scrollY || window.pageYOffset || 0;

      if (currentScroll >= threshold) {
        if (
          lastDismissedScrollRef.current !== null &&
          Math.abs(currentScroll - lastDismissedScrollRef.current) < 800
        ) {
          return;
        }

        triggeredThisPageRef.current = true;
        setIsOpen(true);
      }
    };

    const handleScroll = () => {
      checkTrigger();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Check initial scroll in case user reloaded midway down the page
    handleScroll();

    // Timer fallback: prompt after 10s of page visit if not already triggered
    const timer = setTimeout(() => {
      if (!isOpen && !triggeredThisPageRef.current) {
        try {
          if (
            localStorage.getItem(STORAGE_KEY) === 'true' ||
            sessionStorage.getItem(STORAGE_KEY) === 'true'
          ) {
            setIsPermanentlyDisabled(true);
            return;
          }
        } catch {
          /* ignore storage access error */
        }
        triggeredThisPageRef.current = true;
        setIsOpen(true);
      }
    }, 10000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, [isOpen, isPermanentlyDisabled]);

  const handleClose = () => {
    setIsOpen(false);
    lastDismissedScrollRef.current = window.scrollY || window.pageYOffset || 0;
  };

  const handleSuccess = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
      sessionStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      /* ignore storage error */
    }
    setIsPermanentlyDisabled(true);
  };

  if (isPermanentlyDisabled || !isOpen) {
    return null;
  }

  return (
    <ConnectWithUs
      isModal={true}
      onClose={handleClose}
      onSuccess={handleSuccess}
    />
  );
}
