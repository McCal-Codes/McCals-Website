import React from 'react';
import Nav from './Nav';
import Footer from './Footer';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="site-layout">
    <Nav />
    <main className="site-main">
      <div className="site-container">{children}</div>
    </main>
    <Footer />
  </div>
);

export default Layout;
