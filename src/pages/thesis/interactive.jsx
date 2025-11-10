import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';

// Tiny utility: respects reduce motion preference
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mql.matches);
    const handler = (e) => setReduced(e.matches);
    mql.addEventListener?.('change', handler);
    return () => mql.removeEventListener?.('change', handler);
  }, []);
  return reduced;
}

// Intersection observer reveal
function useReveal(selector = '[data-reveal]') {
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll(selector));
    if (reduced) {
      elements.forEach((el) => el.classList.add('opacity-100', 'translate-y-0'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

    elements.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [reduced, selector]);
}

// Accessible drawer with focus trap
function StoryDrawer({ open, onClose, title, children }) {
  const panelRef = useRef(null);
  const lastFocus = useRef(null);

  // focus trap
  useEffect(() => {
    const panel = panelRef.current;
    function handleKey(e) {
      if (e.key === 'Escape') onClose?.();
      if (e.key === 'Tab' && panel) {
        const focusables = panel.querySelectorAll('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])');
        const list = Array.from(focusables).filter(el => !el.hasAttribute('disabled'));
        if (!list.length) return;
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    }

    function handleClickAway(e) {
      if (panel && !panel.contains(e.target)) onClose?.();
    }

    if (open) {
      lastFocus.current = document.activeElement;
      document.addEventListener('keydown', handleKey);
      document.addEventListener('mousedown', handleClickAway);
      // set initial focus
      setTimeout(() => {
        const el = panel?.querySelector('[data-autofocus]') || panel?.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        el?.focus();
      }, 0);
      document.documentElement.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClickAway);
      document.documentElement.style.overflow = '';
      if (lastFocus.current && typeof lastFocus.current.focus === 'function') {
        lastFocus.current.focus();
      }
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label={title}
      className="fixed inset-0 z-[2147483647] flex items-end md:items-center justify-center bg-black/60">
      <div ref={panelRef}
        className="w-full md:max-w-3xl max-h-[90vh] overflow-auto rounded-t-2xl md:rounded-2xl bg-white shadow-xl outline-none"
        tabIndex={-1}
      >
        <div className="sticky top-0 flex items-center justify-between gap-2 px-4 py-3 border-b border-edge bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
          <button onClick={onClose} className="px-3 py-1.5 rounded-md border border-edge hover:bg-paper focus:outline-none focus:shadow-focus" aria-label="Close">
            Close
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}

function ImageCard({ src, alt, onOpen }) {
  return (
    <figure data-reveal className="opacity-0 translate-y-6 transition-all duration-700 ease-out will-change-transform">
      <img src={src} alt={alt} loading="lazy" decoding="async" className="w-full h-auto rounded-lg shadow-sm" />
      <figcaption className="mt-2 text-sm text-gray-600 flex items-center justify-between">
        <span>{alt}</span>
        <button
          className="text-accent hover:underline focus:outline-none focus:shadow-focus rounded px-2 py-1"
          onClick={onOpen}
        >
          Read story
        </button>
      </figcaption>
    </figure>
  );
}

function InteractiveThesisPage() {
  useReveal();
  const [open, setOpen] = useState(false);

  const images = [
    {
      src: '/src/images/Portfolios/Journalism/Politics/Obama Speaks at Pitt/101024_Obama Speaks at Pittsburgh_CAL3038.jpg',
      alt: 'President Obama speaks at the University of Pittsburgh rally.'
    },
    {
      src: '/src/images/Portfolios/Journalism/Politics/Kamala Speaks at Erie/241014_Kamala Speaks at Erie_CAL3741.jpg',
      alt: 'Vice President Harris greets supporters in Erie.'
    },
    {
      src: '/src/images/Portfolios/Journalism/Politics/Obama Speaks at Pitt/101024_Obama Speaks at Pittsburgh_CAL3399.jpg',
      alt: 'Supporters cheer during the rally.'
    }
  ];

  return (
    <main className="min-h-screen bg-paper text-ink font-body">
      <header className="px-4 md:px-8 py-6 md:py-10 border-b border-edge bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50">
        <div className="max-w-5xl mx-auto">
          <h1 className="font-display text-3xl md:text-4xl font-bold">Interactive Thesis Preview</h1>
          <p className="mt-2 text-gray-700 max-w-2xl">A scrolling, audio-augmented narrative prototype. Images load lazily and reveal as you scroll. Open a story to see transcript and audio.</p>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-4 md:px-8 py-8 grid gap-8 md:grid-cols-2">
        {images.map((img, i) => (
          <ImageCard key={i} src={img.src} alt={img.alt} onOpen={() => setOpen(true)} />
        ))}
      </section>

      <StoryDrawer open={open} onClose={() => setOpen(false)} title="Rally Day — Field Notes">
        <audio controls preload="none" className="w-full" src="/audio/sample-clip.mp3">
          Your browser does not support the audio element.
        </audio>
        <div className="mt-4 space-y-3 text-gray-800">
          <p><strong>Transcript (excerpt):</strong></p>
          <p>
            Ambient crowd noise fades in. The chant begins to swell as the speaker approaches the
            podium. Commentary captures the arc of anticipation and release as the first lines carry
            across the arena.
          </p>
        </div>
      </StoryDrawer>

      <footer className="mt-12 px-4 md:px-8 py-10 border-t border-edge">
        <div className="max-w-5xl mx-auto text-sm text-gray-600">
          v0.1-minimal · Built with React + Tailwind · Images lazy-loaded
        </div>
      </footer>
    </main>
  );
}

function mount() {
  const rootEl = document.getElementById('app');
  if (!rootEl) return;
  const root = createRoot(rootEl);
  root.render(<InteractiveThesisPage />);
}

if (typeof document !== 'undefined') {
  mount();
}

export default InteractiveThesisPage;
