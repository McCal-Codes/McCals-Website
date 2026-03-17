import Nav from '@/components/Layout/Nav';
import Footer from '@/components/Layout/Footer';
import HeroCarousel from '@/components/HeroCarousel';

const HomePage = () => {
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
