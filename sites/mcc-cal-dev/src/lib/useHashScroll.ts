import { useLayoutEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Owns scroll position for the whole app.
 *
 * Two problems this solves together. React Router intercepts `<Link to="/#index">`
 * and updates history without the browser's native fragment scroll, so hash
 * navigation silently does nothing. And `<ScrollRestoration>` resets scroll for a
 * new location key on its own schedule, which raced this hook and made hash jumps
 * land at the top, at the target, or somewhere in between depending on timing.
 *
 * Rather than compete, `<ScrollRestoration>` was removed and both cases live here:
 * a hash scrolls to its element, anything else goes to the top. Deterministic, at
 * the cost of not restoring position on back and forward.
 */
export function useHashScroll() {
  const { pathname, hash, key } = useLocation();
  const navigationType = useNavigationType();

  // Layout effect, not effect: this runs before paint, so the page never shows a
  // frame at the wrong position.
  useLayoutEffect(() => {
    if (!hash) {
      // POP is back/forward. Leave it to the browser's own restoration rather
      // than yanking the reader to the top of a page they are returning to.
      if (navigationType !== 'POP') {
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      }
      return;
    }

    const id = decodeURIComponent(hash.slice(1));
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const jump = (behavior: ScrollBehavior) => {
      const target = document.getElementById(id);
      if (!target) return;

      // Focus first, scroll second. A smooth scroll is asynchronous, and calling
      // focus() while one is in flight aborts it — even with preventScroll set.
      //
      // tabindex -1 makes a non-interactive section focusable without adding it
      // to the tab order, so keyboard and screen-reader users land where sighted
      // users do.
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });

      target.scrollIntoView({ behavior, block: 'start' });
    };

    jump(reduced ? 'instant' : 'smooth');

    // On a cold load the page is still settling — web fonts swap in and images
    // resolve — which moves the target out from under the scroll we just did.
    // Correct once everything has loaded. Same-session navigations are already
    // settled and skip this entirely.
    if (document.readyState === 'complete') return;

    const correct = () => jump('instant');
    window.addEventListener('load', correct, { once: true });
    return () => window.removeEventListener('load', correct);
    // `key` changes even when the same hash is clicked twice, so a repeat click
    // re-scrolls instead of doing nothing.
  }, [pathname, hash, key, navigationType]);
}
