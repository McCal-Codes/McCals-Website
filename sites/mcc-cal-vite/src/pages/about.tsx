import Layout from '@/components/Layout/Layout';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '@/styles/about.css';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');
const ABOUT_IMAGE = '/about/caleb-mccartney-photo.jpg';

const stats = [
  { value: '30+', label: 'Happy clients' },
  { value: '65+', label: 'Projects' },
  { value: '6+', label: 'Years experience' },
];

const testimonials = [
  {
    source: 'LinkedIn',
    quote:
      'Caleb is great to work with, always prompt and professional. His work speaks for itself.',
    name: 'Logan Spiker',
    role: 'Former Argo AI, business owner',
  },
  {
    source: 'Google',
    quote:
      "Caleb is an incredibly talented photographer. I'm always blown away by the quality of his work.",
    name: 'Ben Orr',
    role: 'Concert photography client',
    rating: '5-star feedback',
  },
];

const clientLogos = [
  { src: '/about/clients/new-york-post-logo.svg', alt: 'New York Post' },
  { src: '/about/clients/pittsburgh-magazine-logo.svg', alt: 'Pittsburgh Magazine' },
  { src: '/about/clients/point-park-university-real-logo.jpg', alt: 'Point Park University' },
  { src: '/about/clients/the-globe-logo.svg', alt: 'The Globe' },
  { src: '/about/clients/bc3-logo.svg', alt: 'Butler County Community College' },
  { src: '/about/clients/nppa-logo.svg', alt: 'National Press Photographers Association' },
  { src: '/about/clients/osh360-logo.png', alt: 'OSH360' },
  { src: '/about/clients/covalent-logo.png', alt: 'Covalent' },
  { src: '/about/clients/associated-press-logo.svg', alt: 'Associated Press' },
  { src: '/about/clients/reuters-logo.svg', alt: 'Reuters' },
  { src: '/about/clients/carnegie-mellon-university-logo.svg', alt: 'Carnegie Mellon University' },
  { src: '/about/clients/university-of-pittsburgh-logo.svg', alt: 'University of Pittsburgh' },
  { src: '/about/clients/penn-state-fayette-logo.svg', alt: 'Penn State Fayette' },
  { src: '/about/clients/iup-logo.png', alt: 'Indiana University of Pennsylvania' },
  { src: '/about/clients/wvu-logo.png', alt: 'West Virginia University' },
  { src: '/about/clients/osu-logo.jpg', alt: 'Ohio State University' },
  { src: '/about/clients/pennsylvania-news-media-logo.svg', alt: 'Pennsylvania News Media Association' },
  { src: '/about/clients/next-generation-news-logo.svg', alt: 'Next Generation News' },
  { src: '/about/clients/pittsburgh-union-progress-logo.svg', alt: 'Pittsburgh Union Progress' },
  { src: '/about/clients/center-for-media-innovation-logo.svg', alt: 'Center for Media Innovation' },
  { src: '/about/clients/western-pa-press-club-logo.svg', alt: 'Western PA Press Club' },
  { src: '/about/clients/jagoff-media-logo.svg', alt: 'Jagoff Media' },
  { src: '/about/clients/haven-pittsburgh-logo.svg', alt: 'Haven Pittsburgh' },
  { src: '/about/clients/ghostlight-theatre-company-logo.svg', alt: 'Ghostlight Theatre Company' },
  { src: '/about/clients/the-space-upstairs-logo.svg', alt: 'The Space Upstairs' },
  { src: '/about/clients/the-watchful-shepherd-logo.svg', alt: 'The Watchful Shepherd' },
  { src: '/about/clients/terrible-tailgate-logo.svg', alt: 'Terrible Tailgate' },
  { src: '/about/clients/upward-consulting-logo.svg', alt: 'Upward Consulting' },
  { src: '/about/clients/voyage-visuals-logo.svg', alt: 'Voyage Visuals' },
  { src: '/about/clients/yinzers-meet-logo.svg', alt: 'Yinzers Meet' },
];

const carouselLogos = [...clientLogos, ...clientLogos, ...clientLogos];

export default function AboutPage() {
  const [contactMenuOpen, setContactMenuOpen] = useState(false);
  const [documentsMenuOpen, setDocumentsMenuOpen] = useState(false);
  const contactMenuRef = useRef<HTMLDivElement>(null);
  const documentsMenuRef = useRef<HTMLDivElement>(null);

  usePageMeta({
    title: 'Caleb McCartney | Pittsburgh Photojournalist and Event Photographer',
    description:
      'Caleb McCartney is a Pittsburgh-based photojournalist and photographer specializing in concert, corporate, event, and brand storytelling.',
    canonical: `${SITE_URL}/about`,
    og: {
      type: 'profile',
      title: 'Caleb McCartney | Pittsburgh Photojournalist and Event Photographer',
      description:
        'Pittsburgh-based photojournalist and photographer specializing in concerts, events, and brand storytelling.',
      image: `${SITE_URL}${ABOUT_IMAGE}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Caleb McCartney | Pittsburgh Photojournalist and Event Photographer',
      description:
        'Pittsburgh-based photojournalist and photographer specializing in concerts, events, and brand storytelling.',
      image: `${SITE_URL}${ABOUT_IMAGE}`,
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Person',
          name: 'Caleb McCartney',
          image: `${SITE_URL}${ABOUT_IMAGE}`,
          url: `${SITE_URL}/about`,
          description:
            'Pittsburgh-based photojournalist and photographer specializing in concert, corporate, event, and brand storytelling.',
          jobTitle: 'Photojournalist and Event Photographer',
          homeLocation: {
            '@type': 'Place',
            name: 'Pittsburgh, Pennsylvania',
          },
          knowsAbout: [
            'Photojournalism',
            'Concert Photography',
            'Event Photography',
            'Corporate Photography',
            'Brand Storytelling',
          ],
          worksFor: {
            '@type': 'Organization',
            name: 'McCal Media',
            url: SITE_URL,
          },
          sameAs: [
            'https://www.instagram.com/mcc_cal',
            'https://www.linkedin.com/in/calebmccartney',
          ],
        },
        {
          '@type': 'Organization',
          name: 'McCal Media',
          url: SITE_URL,
          description:
            'Photojournalism, event coverage, and visual storytelling led by Caleb McCartney.',
          logo: `${SITE_URL}/brand/logo-mark.svg`,
        },
      ],
    },
  });

  useEffect(() => {
    const closeMenus = (event: MouseEvent) => {
      const target = event.target as Node;

      if (contactMenuRef.current && !contactMenuRef.current.contains(target)) {
        setContactMenuOpen(false);
      }

      if (documentsMenuRef.current && !documentsMenuRef.current.contains(target)) {
        setDocumentsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', closeMenus);

    return () => {
      document.removeEventListener('mousedown', closeMenus);
    };
  }, []);

  return (
    <Layout>
      <div className="about-page">
        <div className="about-shell">
          <section className="about-panel about-bio" aria-labelledby="about-heading">
            <div className="about-bio__grid">
              <figure className="about-bio__photo">
                <img
                  src={ABOUT_IMAGE}
                  alt="Black-and-white portrait of Caleb McCartney."
                  loading="eager"
                  fetchPriority="high"
                />
                <figcaption className="about-sr-only">Portrait of Caleb McCartney.</figcaption>
              </figure>

              <div className="about-bio__content">
                <p className="about-eyebrow">About Caleb McCartney</p>
                <h1 id="about-heading">
                  Photojournalism instincts, polished delivery, and event coverage that still feels
                  human.
                </h1>

                <p>
                  Caleb McCartney is a Pittsburgh-based <strong>photojournalist</strong> and
                  freelance storyteller specializing in news-driven narratives, high-energy concert
                  coverage, and authentic brand visuals.
                </p>
                <p>
                  His approach is rooted in the decisive moment: stay close to the people in front
                  of you, pay attention to the room, and make images that still hold onto their
                  atmosphere after the assignment is over. That mindset carries from editorial work
                  into live events, commercial commissions, and client storytelling.
                </p>
                <p>
                  Alongside client work, Caleb writes field notes and hosts the{' '}
                  <Link to="/podcast">Caffeinated Connections</Link> podcast, where creative work,
                  labor, and public life all collide.
                </p>

                <div className="about-actions">
                  <div className="about-menu" ref={contactMenuRef}>
                    <button
                      type="button"
                      className="about-action about-action--secondary"
                      aria-expanded={contactMenuOpen}
                      onClick={() => {
                        setContactMenuOpen((open) => !open);
                        setDocumentsMenuOpen(false);
                      }}
                    >
                      Get in touch
                    </button>
                    <div className={`about-menu__panel${contactMenuOpen ? ' is-open' : ''}`}>
                      <Link to="/contact-us" className="about-menu__item">
                        Contact page
                      </Link>
                      <a
                        href="https://calendly.com/cjmccar-mcc-cal/30min"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="about-menu__item"
                      >
                        Grab a coffee
                      </a>
                    </div>
                  </div>

                  <div className="about-menu" ref={documentsMenuRef}>
                    <button
                      type="button"
                      className="about-action about-action--secondary"
                      aria-expanded={documentsMenuOpen}
                      onClick={() => {
                        setDocumentsMenuOpen((open) => !open);
                        setContactMenuOpen(false);
                      }}
                    >
                      Documents
                    </button>
                    <div className={`about-menu__panel${documentsMenuOpen ? ' is-open' : ''}`}>
                      <a
                        href="/downloads/caleb-mccartney-resume.pdf"
                        download
                        className="about-menu__item"
                      >
                        Resume
                      </a>
                      <Link to="/roadmap" className="about-menu__item">
                        Roadmap
                      </Link>
                    </div>
                  </div>

                  <Link to="/featured-work" className="about-action about-action--secondary">
                    View portfolio
                  </Link>
                  <Link to="/request-a-quote" className="about-action about-action--primary">
                    Request a quote
                  </Link>
                </div>

                <div className="about-stats" aria-label="Career highlights">
                  {stats.map((item) => (
                    <div key={item.label} className="about-stat">
                      <strong>{item.value}</strong>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="about-panel about-reviews" aria-labelledby="about-reviews-heading">
            <div className="about-section-heading">
              <p className="about-eyebrow">Client testimonials</p>
              <h2 id="about-reviews-heading">Trusted when the assignment matters.</h2>
            </div>

            <div className="about-reviews__grid">
              {testimonials.map((item) => (
                <blockquote key={item.name} className="about-review-card">
                  <div
                    className={`about-review-card__badge about-review-card__badge--${item.source.toLowerCase()}`}
                  >
                    {item.source}
                  </div>
                  {item.rating ? (
                    <p className="about-review-card__stars" aria-label="5 star rating">
                      ★★★★★
                    </p>
                  ) : null}
                  <p className="about-review-card__quote">&quot;{item.quote}&quot;</p>
                  <footer className="about-review-card__footer">
                    <strong>{item.name}</strong>
                    <span>{item.role}</span>
                  </footer>
                </blockquote>
              ))}
            </div>

            <div className="about-reviews__footer">
              <p>5-star client feedback across editorial, concert, and event work.</p>
              <a
                href="https://maps.app.goo.gl/CKztLDxynn6mwSwS8"
                target="_blank"
                rel="noopener noreferrer"
                className="about-action about-action--secondary"
              >
                View all reviews
              </a>
            </div>
          </section>

          <section className="about-panel about-clients" aria-labelledby="about-clients-heading">
            <div className="about-section-heading about-section-heading--center">
              <p className="about-eyebrow">Trusted by leading brands</p>
              <h2 id="about-clients-heading">Editorial, academic, nonprofit, and brand partners.</h2>
              <p className="about-clients__subtitle">Collaborating with these clients.</p>
            </div>

            <div className="about-client-carousel" aria-label="Selected client logos">
              <ul className="about-client-track">
                {carouselLogos.map((logo, index) => {
                  const isDuplicate = index >= clientLogos.length;

                  return (
                    <li
                      key={`${logo.alt}-${index}`}
                      className="about-client-card"
                      aria-hidden={isDuplicate || undefined}
                      title={logo.alt}
                    >
                      <img
                        src={logo.src}
                        alt={isDuplicate ? '' : logo.alt}
                        className={undefined}
                        loading="lazy"
                        decoding="async"
                      />
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="about-stats about-stats--clients" aria-label="Business stats">
              {stats.map((item) => (
                <div key={item.label} className="about-stat">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>

            <div className="about-clients__footer">
              <Link to="/request-a-quote" className="about-action about-action--primary">
                Start a project
              </Link>
              <Link to="/featured-work" className="about-action about-action--secondary">
                Explore featured work
              </Link>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
