import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';

const regexMatch = (pattern: string, path: string) => {
  try { return new RegExp(pattern).test(path); } catch { return false; }
};

const Nav: React.FC = () => {
  const pathname = usePathname() || '/';
  const navRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Compute aria-current for anchors with data-match
  const isHome = useMemo(() => regexMatch('^/$', pathname), [pathname]);
  const isPodcast = useMemo(() => regexMatch('^/podcast', pathname), [pathname]);
  const isAbout = useMemo(() => regexMatch('^/about', pathname), [pathname]);

  useEffect(() => {
    // Scroll state
    const onScroll = () => {
      const h = navRef.current?.getBoundingClientRect().height || 0;
      const threshold = h * 0.35;
      setIsScrolled(window.scrollY > threshold);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    // Update CSS var for spacer
    const updateHeight = () => {
      const h = navRef.current?.getBoundingClientRect().height || 0;
      document.documentElement.style.setProperty('--mcc-nav-height', `${h}px`);
    };
    updateHeight();
    window.addEventListener('load', updateHeight);
    window.addEventListener('resize', updateHeight);
    return () => {
      window.removeEventListener('load', updateHeight);
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  // Theme is handled by a floating ThemeToggle component in Layout; Nav no longer manages theme state.

  useEffect(() => {
    // Close menus on route change
    setMenuOpen(false);
    setSubmenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    // Outside click to close (mobile)
    const onDocClick = (e: MouseEvent) => {
      if (window.innerWidth > 768) return;
      if (!menuOpen) return;
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setSubmenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false); setSubmenuOpen(false);
      }
    };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  return (
    <div className="mcc-nav-shell" role="group" aria-label="Global navigation">
      <nav
        ref={navRef}
        className={`mcc-nav ${isHome ? 'is-home' : ''} ${isScrolled ? 'is-scrolled' : ''} ${menuOpen ? 'mcc-nav--menu-open' : ''}`}
        aria-label="Primary navigation"
      >
        <div className="mcc-nav__inner">
        <div className="mcc-nav__brand"><Link href="/" data-match="^/">Caleb McCartney</Link></div>

        <button
          className="mcc-nav__toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="mcc-nav-links"
          aria-haspopup="true"
          onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v); }}
        >
          <span className="sr-only">Toggle navigation</span>
          <span className="mcc-nav__toggle-box" aria-hidden="true">
            <span className="mcc-nav__toggle-line"/>
            <span className="mcc-nav__toggle-line"/>
            <span className="mcc-nav__toggle-line"/>
          </span>
        </button>

        {/* theme toggle removed from nav — using floating ThemeToggle component in Layout */}

        <div className="mcc-nav__menu">
          <ul className="mcc-nav__links" id="mcc-nav-links" role="list">
            <li className="mcc-nav__link mcc-nav__link--has-submenu">
              <Link href="/" data-match="^/" aria-current={isHome ? 'page' : undefined}>Work</Link>
              <button
                className="mcc-nav__submenu-toggle"
                type="button"
                aria-expanded={submenuOpen}
                aria-controls="submenu-work"
                onClick={(e) => { e.stopPropagation(); setSubmenuOpen(v => !v); }}
              >
                <span className="sr-only">Toggle Work submenu</span>
              </button>
              <ul className="mcc-nav__submenu" id="submenu-work" role="menu" aria-label="Work submenu" aria-hidden={!submenuOpen}>
                <li><Link href="/journalism" role="menuitem">Photojournalism</Link></li>
                <li><Link href="/concerts" role="menuitem">Concert</Link></li>
                <li><Link href="/events" role="menuitem">Event</Link></li>
                <li><Link href="/nature" role="menuitem">Nature</Link></li>
              </ul>
            </li>
            <li className="mcc-nav__link"><Link href="/podcast" data-match="^/podcast" aria-current={isPodcast ? 'page' : undefined}>Podcast</Link></li>
            <li className="mcc-nav__link"><Link href="/about" data-match="^/about" aria-current={isAbout ? 'page' : undefined}>About</Link></li>
          </ul>
        </div>
        </div>
      </nav>
    </div>
  );
};

export default Nav;
