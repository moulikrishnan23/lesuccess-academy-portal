import { useRef, useEffect } from 'react';

/**
 * Custom hook to enable click-and-drag (grab-to-scroll) horizontal scrolling
 * on a scrollable container element.
 *
 * Interaction features:
 * - Default cursor: 'grab', when dragging: 'grabbing'
 * - Smooth pointer/mouse drag for horizontal scrolling
 * - Allows normal vertical scrolling without interference
 * - Prevents text selection while actively dragging
 * - Safely releases on mouseup, pointerup, or mouseleave
 * - Preserves native scrollbars and scrollwheel interactions
 */
export default function useGrabScroll() {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let hasMoved = false;

    // Apply grab cursor styling
    el.style.cursor = 'grab';
    el.style.userSelect = 'auto';

    const onMouseDown = (e) => {
      // Only respond to left click (button 0)
      if (e.button !== 0) return;

      // Don't drag if clicking interactive form controls
      const target = e.target;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('select') ||
        target.closest('input')
      ) {
        return;
      }

      isDown = true;
      hasMoved = false;
      el.style.cursor = 'grabbing';
      el.style.userSelect = 'none';
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
    };

    const onMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();

      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.5; // Drag sensitivity multiplier
      if (Math.abs(walk) > 3) {
        hasMoved = true;
      }
      el.scrollLeft = scrollLeft - walk;
    };

    const onMouseUp = () => {
      if (!isDown) return;
      isDown = false;
      el.style.cursor = 'grab';
      el.style.userSelect = 'auto';
    };

    const onMouseLeave = () => {
      if (!isDown) return;
      isDown = false;
      el.style.cursor = 'grab';
      el.style.userSelect = 'auto';
    };

    // Prevent accidental click triggers if the user was dragging
    const onClickCapture = (e) => {
      if (hasMoved) {
        e.stopPropagation();
        hasMoved = false;
      }
    };

    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    el.addEventListener('mouseleave', onMouseLeave);
    el.addEventListener('click', onClickCapture, true);

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('mouseleave', onMouseLeave);
      el.removeEventListener('click', onClickCapture, true);
      el.style.cursor = '';
      el.style.userSelect = '';
    };
  }, []);

  return containerRef;
}
