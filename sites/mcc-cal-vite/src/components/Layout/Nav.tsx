import { Link, useLocation } from 'react-router-dom';
import React, { useEffect, useRef, useState } from 'react';

const Nav: React.FC = () => {
  const { pathname } = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [workSubmenuOpen, setWorkSubmenuOpen] = useState(false);
  const [projectsSubmenuOpen, setProjectsSubmenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
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

  useEffect(() => {
    setMenuOpen(false);
    setWorkSubmenuOpen(false);
    setProjectsSubmenuOpen(false);
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
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isMobile = () => window.innerWidth <= 768;

  return (
    <div className="mcc-nav-shell" role="group" aria-label="Global navigation">
      <nav
        ref={navRef}
        className={`mcc-nav ${isScrolled ? 'is-scrolled' : ''} ${menuOpen ? 'mcc-nav--menu-open' : ''}`}
        aria-label="Primary navigation"
      >
        <div className="mcc-nav__inner">
          <div className="mcc-nav__brand">
            <Link to="/">Caleb McCartney</Link>
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
                    aria-current={pathname === '/featured-work' ? 'page' : undefined}
                    onClick={(e) => { if (isMobile()) { e.preventDefault(); setWorkSubmenuOpen((v) => !v); } }}
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
                      <path d="M1 1L5 5L9 1" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                <ul
                  className="mcc-nav__submenu"
                  id="mcc-nav-submenu-work"
                  role="menu"
                  aria-label="Work submenu"
                  style={isMobile() ? { display: workSubmenuOpen ? 'flex' : 'none' } : undefined}
                >
                  <li><Link to="/featured-work" role="menuitem">Featured</Link></li>
                  <li><Link to="/journalism" role="menuitem">Photojournalism</Link></li>
                  <li><Link to="/concerts" role="menuitem">Concert</Link></li>
                  <li><Link to="/events" role="menuitem">Event</Link></li>
                  <li><Link to="/nature" role="menuitem">Nature</Link></li>
                  <li><Link to="/portraits" role="menuitem">Portraits</Link></li>
                </ul>
              </li>

              {/* Projects */}
              <li className="mcc-nav__link mcc-nav__link--has-submenu">
                <div className="mcc-nav__submenu-btn-container">
                  <Link
                    to="/projects"
                    aria-current={pathname.startsWith('/projects') ? 'page' : undefined}
                    onClick={(e) => { if (isMobile()) { e.preventDefault(); setProjectsSubmenuOpen((v) => !v); } }}
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
                      <path d="M1 1L5 5L9 1" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                <ul
                  className="mcc-nav__submenu"
                  id="mcc-nav-submenu-projects"
                  role="menu"
                  aria-label="Projects submenu"
                  style={isMobile() ? { display: projectsSubmenuOpen ? 'flex' : 'none' } : undefined}
                >
                  <li><Link to="/projects" role="menuitem">Overview</Link></li>
                  <li><Link to="/design-systems" role="menuitem">Design Systems</Link></li>
                  <li><Link to="/abridged" role="menuitem">Abridged App</Link></li>
                  <li><Link to="/roadmap" role="menuitem">Roadmap</Link></li>
                </ul>
              </li>

              <li className="mcc-nav__link">
                <Link to="/podcast" aria-current={pathname.startsWith('/podcast') ? 'page' : undefined}>
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
                <a href="mailto:contact@mcc-cal.com" className="mcc-nav__cta-btn">
                  Request a Quote
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Nav;
