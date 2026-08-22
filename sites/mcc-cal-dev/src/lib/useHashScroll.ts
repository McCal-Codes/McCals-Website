import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scrolls to the element named by the URL hash.
 *
 * React Router intercepts `<Link to="/#index">` and updates history without the
 * browser's native fragment scroll, so hash navigation silently does nothing:
 * the URL changes and the page stays put. This restores the expected behaviour
 * for the header's Projects and Websites links.
 */
export function useHashScroll() {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    // Only the hash case is ours. <ScrollRestoration> owns everything else,
    // including restoring position on back and forward, and fighting it here
    // would break that.
    if (!hash) return;

    const id = decodeURIComponent(hash.slice(1));

    // Deferred rather than run inline, for two reasons: on a cross-route jump the
    // target is not mounted until the new page commits, and <ScrollRestoration>
    // resets scroll for a new location key during that same commit. Running after
    // both is the only way the position sticks.
    const timer = setTimeout(() => {
      const target = document.getElementById(id);
      if (!target) return;

      // Focus first, scroll second. A smooth scroll is asynchronous, and calling
      // focus() while one is in flight aborts it — even with preventScroll set —
      // which leaves the page sitting exactly where it started.
      //
      // tabindex -1 makes a non-interactive section focusable without adding it
      // to the tab order, so keyboard and screen-reader users land where sighted
      // users do.
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({
        behavior: reduced ? 'instant' : 'smooth',
        block: 'start',
      });
    }, 80);

    return () => clearTimeout(timer);
    // `key` changes even when the same hash is clicked twice, so a repeat click
    // re-scrolls instead of doing nothing.
  }, [pathname, hash, key]);
}
