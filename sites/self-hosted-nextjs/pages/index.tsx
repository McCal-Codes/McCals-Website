import React, { useEffect } from 'react';
import Nav from '../components/Layout/Nav';
import Footer from '../components/Layout/Footer';
import HeroCarousel from '../components/HeroCarousel';

const HomePage = () => {
  useEffect(() => {
    // Remove body padding for homepage hero
    document.body.style.paddingTop = '0';
    return () => {
      document.body.style.paddingTop = '';
    };
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
