// src/components/layout/Layout_COPY.tsx

import React from 'react';
import Nav from './Nav';
import Footer from './Footer';
import ThemeToggle from '../ThemeToggle';
import { Analytics } from '@vercel/analytics/react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="site-layout site-layout--standard">
    <Nav />

    <main className="site-main">
      <div className="site-container">{children}</div>
    </main>

    <Footer />
    <ThemeToggle />

    <Analytics />
  </div>
);

export default Layout;