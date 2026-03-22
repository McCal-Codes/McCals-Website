import React, { useEffect } from 'react';
import Head from 'next/head';
import Nav from '../components/Layout/Nav';
import Footer from '../components/Layout/Footer';
import HeroCarousel from '../components/HeroCarousel';

const HomePage = () => {
  useEffect(() => {
    // no-op: keep body padding set by Nav via --mcc-nav-height so the hero aligns correctly under the nav
  }, []);

  return (
    <div className="site-layout" style={{ paddingTop: 0 }}>
      <Head>
        <title>McCal Media | Photography &amp; Photojournalism</title>
        <meta name="description" content="McCal Media — professional photography, photojournalism, concert, event, and nature portfolios by Caleb McCartney." />
        <link rel="canonical" href="https://mcc-cal.com/" />
        <meta property="og:title" content="McCal Media | Photography & Photojournalism" />
        <meta property="og:description" content="McCal Media — professional photography, photojournalism, concert, event, and nature portfolios by Caleb McCartney." />
        <meta property="og:url" content="https://mcc-cal.com/" />
        <meta name="twitter:title" content="McCal Media | Photography & Photojournalism" />
        <meta name="twitter:description" content="McCal Media — professional photography, photojournalism, concert, event, and nature portfolios by Caleb McCartney." />
      </Head>
      <Nav />
      <main className="site-main" style={{ marginTop: 0 }}>
        <HeroCarousel />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
