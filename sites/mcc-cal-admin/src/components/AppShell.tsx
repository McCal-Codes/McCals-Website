import { NavLink } from 'react-router-dom';
import { ADMIN_NAV_ITEMS, DOC_PATHS, runtimeConfig } from '@/lib/runtime';
import { useAuthSession } from '@/lib/auth';
import type { ReactNode } from 'react';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const auth = useAuthSession();

  return (
    <div className="admin-shell">
      <aside className="admin-shell__sidebar">
        <div className="brand-lockup">
          <p className="brand-lockup__eyebrow">McCal Media</p>
          <h1 className="brand-lockup__title">Admin Console</h1>
          <p className="brand-lockup__copy">
            Separate internal Vercel project for scheduling, operations, and future editorial tooling.
          </p>
        </div>

        <nav className="admin-nav" aria-label="Admin sections">
          {ADMIN_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `admin-nav__link${isActive ? ' is-active' : ''}`}
            >
              <span className="admin-nav__label">{item.label}</span>
              <span className="admin-nav__hint">{item.hint}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-card">
          <p className="sidebar-card__label">Project guardrail</p>
          <p className="sidebar-card__copy">
            Protect this app with allowlisted Vercel sign-in and keep write-capable workflows out of the public site.
          </p>
        </div>

        <div className="sidebar-card sidebar-card--muted">
          <p className="sidebar-card__label">Reference docs</p>
          <ul className="sidebar-list">
            {DOC_PATHS.map((path) => (
              <li key={path}>{path}</li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="admin-shell__content">
        <header className="topbar">
          <div>
            <p className="topbar__label">Environment</p>
            <div className="topbar__chips">
              <span className="chip">{runtimeConfig.environment}</span>
              <span className="chip chip--ghost">{auth.authModel}</span>
            </div>
          </div>

          <div className="topbar__meta">
            <div>
              <p className="topbar__label">Public site</p>
              <p className="topbar__value">{auth.publicSiteUrl || 'Not configured'}</p>
            </div>
            <div>
              <p className="topbar__label">Public API</p>
              <p className="topbar__value">{auth.publicApiUrl || 'Not configured'}</p>
            </div>
            <div className="topbar__user">
              <div>
                <p className="topbar__label">Signed in as</p>
                <p className="topbar__value">{auth.user?.name || auth.user?.email || 'Unknown user'}</p>
                {auth.user?.email ? <p className="topbar__subvalue">{auth.user.email}</p> : null}
              </div>
              <a className="button-link button-link--ghost" href={auth.logoutPath}>
                Sign out
              </a>
            </div>
          </div>
        </header>

        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}
