import React from 'react';
import Nav from './Nav';
import Footer from './Footer';
import ThemeToggle from '../ThemeToggle';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="site-layout site-layout--standard">
    <a href="#main-content" className="mcc-skip-link">
      Skip to main content
    </a>

    <Nav />

    <main id="main-content" className="site-main">
      <div className="site-container">{children}</div>
    </main>
    <Footer />
    <ThemeToggle />
  </div>
);

export default Layout;
