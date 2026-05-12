import { useEffect, useRef } from 'react';

interface UseFocusManagementOptions {
  restoreFocus?: boolean;
  trapFocus?: boolean;
}

export function useFocusManagement(options: UseFocusManagementOptions = {}) {
  const { restoreFocus = true, trapFocus = false } = options;
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  // Store the currently focused element when the component mounts
  useEffect(() => {
    if (restoreFocus) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }
  }, [restoreFocus]);

  // Restore focus when the component unmounts
  useEffect(() => {
    return () => {
      if (restoreFocus && previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    };
  }, [restoreFocus]);

  // Trap focus within a container (for modals, lightboxes, etc.)
  useEffect(() => {
    if (!trapFocus || !containerRef.current) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = containerRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as NodeListOf<HTMLElement>;

      if (!focusableElements.length) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    const container = containerRef.current;
    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [trapFocus]);

  return {
    containerRef,
    setFocus: (element: HTMLElement | null) => {
      if (element && typeof element.focus === 'function') {
        element.focus();
      }
    }
  };
}
