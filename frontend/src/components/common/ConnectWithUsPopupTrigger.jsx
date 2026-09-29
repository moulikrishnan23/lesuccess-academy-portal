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

  // Scroll detection
  useEffect(() => {
    if (isPermanentlyDisabled) return undefined;

    const handleScroll = () => {
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

      // Approximately 3 major sections of content (around 1200px - 1400px or ~1.8 viewport heights)
      const threshold = Math.max(1100, (window.innerHeight || 800) * 1.6);
      const currentScroll = window.scrollY || window.pageYOffset || 0;

      if (currentScroll >= threshold) {
        // If user recently dismissed it, avoid re-opening until they have scrolled further
        if (
          lastDismissedScrollRef.current !== null &&
          Math.abs(currentScroll - lastDismissedScrollRef.current) < 1000
        ) {
          return;
        }

        triggeredThisPageRef.current = true;
        setIsOpen(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Check initial scroll in case user reloaded midway down the page
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
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
