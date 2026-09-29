import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      title="Back to top"
      className="fixed z-40 bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] lg:bottom-8 right-4 sm:right-6 lg:right-8 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#07405C] text-white shadow-xl shadow-[#07405C]/30 border border-white/20 transition-all duration-300 hover:bg-[#DF1E26] hover:scale-110 active:scale-95 cursor-pointer animate-in fade-in zoom-in-90 focus:outline-none focus:ring-2 focus:ring-[#DF1E26] focus:ring-offset-2"
    >
      <ArrowUp size={20} className="stroke-[2.5]" />
    </button>
  );
}
