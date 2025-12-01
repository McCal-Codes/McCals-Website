import React, { useEffect } from 'react';
import Nav from '../components/Layout/Nav';
import Footer from '../components/Layout/Footer';
import HeroCarousel from '../components/HeroCarousel';

const HomePage = () => {
  useEffect(() => {
    // no-op: keep body padding set by Nav via --mcc-nav-height so the hero aligns correctly under the nav
  }, []);

  return (
    <div className="site-layout" style={{ paddingTop: 0 }}>
      <Nav />
      <main className="site-main" style={{ marginTop: 0 }}>
        <HeroCarousel />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
