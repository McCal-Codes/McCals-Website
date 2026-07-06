import { Link as RouterLink, useLocation } from 'react-router-dom';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  PROJECT_NAV_ITEMS,
  WORK_NAV_ITEMS,
  isActiveNavItem,
  isProjectsNavPath,
} from '@/config/site-navigation';

const Link = React.forwardRef<HTMLAnchorElement, React.ComponentProps<typeof RouterLink>>(
  (props, ref) => <RouterLink ref={ref} viewTransition {...props} />,
);
Link.displayName = 'ViewTransitionLink';

const Nav: React.FC = () => {
  const { pathname } = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [workSubmenuOpen, setWorkSubmenuOpen] = useState(false);
  const [projectsSubmenuOpen, setProjectsSubmenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const isWorkNavPath = WORK_NAV_ITEMS.some((item) => isActiveNavItem(pathname, item));

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useLayoutEffect(() => {
    const updateHeight = () => {
      const h = navRef.current?.getBoundingClientRect().height || 0;
      if (h > 0) {
        document.documentElement.style.setProperty('--mcc-nav-height', `${h}px`);
      }
    };
    updateHeight();
    window.addEventListener('load', updateHeight, { passive: true });
    window.addEventListener('resize', updateHeight, { passive: true });
    return () => {
      window.removeEventListener('load', updateHeight);
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  useEffect(() => {
    const closeTimer = window.setTimeout(() => {
      setMenuOpen(false);
      setWorkSubmenuOpen(false);
      setProjectsSubmenuOpen(false);
    }, 0);

    return () => window.clearTimeout(closeTimer);
  }, [pathname]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setWorkSubmenuOpen(false);
        setProjectsSubmenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setWorkSubmenuOpen(false);
        setProjectsSubmenuOpen(false);
      }
    };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 768) {
        setMenuOpen(false);
        setWorkSubmenuOpen(false);
        setProjectsSubmenuOpen(false);
      }
    };
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="mcc-nav-shell" role="group" aria-label="Global navigation">
      <nav
        ref={navRef}
        className={`mcc-nav ${isScrolled ? 'is-scrolled' : ''} ${menuOpen ? 'mcc-nav--menu-open' : ''}`}
        aria-label="Primary navigation"
      >
        <div className="mcc-nav__brand">
          <Link to="/" title="Home — Caleb McCartney" aria-label="Home — Caleb McCartney">
            Caleb McCartney
          </Link>
        </div>

        <button
          className="mcc-nav__toggle"
          type="button"
          aria-label="Menu"
          aria-expanded={menuOpen}
          aria-controls="mcc-nav-menu"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((v) => !v);
          }}
        >
          <div className="mcc-nav__burger" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </button>

        <div className="mcc-nav__menu" id="mcc-nav-menu">
          <ul className="mcc-nav__links" role="list">
            {/* Work */}
            <li className="mcc-nav__link mcc-nav__link--has-submenu">
              <div className="mcc-nav__submenu-btn-container">
                <Link
                  to="/featured-work"
                  aria-current={isWorkNavPath ? 'page' : undefined}
                  onClick={(e) => {
                    if (isMobile && !workSubmenuOpen) {
                      e.preventDefault();
                      setWorkSubmenuOpen(true);
                    }
                  }}
                >
                  Work
                </Link>
                <button
                  className="mcc-nav__submenu-toggle"
                  type="button"
                  aria-label="Toggle Work submenu"
                  aria-expanded={workSubmenuOpen}
                  aria-controls="mcc-nav-submenu-work"
                  style={{ transform: workSubmenuOpen ? 'rotate(180deg)' : '' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setWorkSubmenuOpen((v) => !v);
                  }}
                >
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
                    <path
                      d="M1 1L5 5L9 1"
                      stroke="#ffffff"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
              <ul
                className="mcc-nav__submenu"
                id="mcc-nav-submenu-work"
                aria-label="Work submenu"
                style={isMobile ? { display: workSubmenuOpen ? 'flex' : 'none' } : undefined}
              >
                {WORK_NAV_ITEMS.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      aria-current={isActiveNavItem(pathname, item) ? 'page' : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>

            {/* Projects */}
            <li className="mcc-nav__link mcc-nav__link--has-submenu">
              <div className="mcc-nav__submenu-btn-container">
                <Link
                  to="/projects"
                  aria-current={isProjectsNavPath(pathname) ? 'page' : undefined}
                  onClick={(e) => {
                    if (isMobile && !projectsSubmenuOpen) {
                      e.preventDefault();
                      setProjectsSubmenuOpen(true);
                    }
                  }}
                >
                  Projects
                </Link>
                <button
                  className="mcc-nav__submenu-toggle"
                  type="button"
                  aria-label="Toggle Projects submenu"
                  aria-expanded={projectsSubmenuOpen}
                  aria-controls="mcc-nav-submenu-projects"
                  style={{ transform: projectsSubmenuOpen ? 'rotate(180deg)' : '' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setProjectsSubmenuOpen((v) => !v);
                  }}
                >
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
                    <path
                      d="M1 1L5 5L9 1"
                      stroke="#ffffff"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
              <ul
                className="mcc-nav__submenu"
                id="mcc-nav-submenu-projects"
                aria-label="Projects submenu"
                style={isMobile ? { display: projectsSubmenuOpen ? 'flex' : 'none' } : undefined}
              >
                {PROJECT_NAV_ITEMS.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      aria-current={isActiveNavItem(pathname, item) ? 'page' : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>

            <li className="mcc-nav__link">
              <Link
                to="/podcast"
                aria-current={pathname.startsWith('/podcast') ? 'page' : undefined}
              >
                Podcast
              </Link>
            </li>
            <li className="mcc-nav__link">
              <Link to="/blog" aria-current={pathname.startsWith('/blog') ? 'page' : undefined}>
                Blog
              </Link>
            </li>
            <li className="mcc-nav__link">
              <Link to="/about" aria-current={pathname.startsWith('/about') ? 'page' : undefined}>
                About
              </Link>
            </li>
            <li className="mcc-nav__cta">
              <Link to="/request-a-quote" className="mcc-nav__cta-btn">
                Request a Quote
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default Nav;
