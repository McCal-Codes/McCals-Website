import Layout from '@/components/Layout/Layout';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Link } from 'react-router-dom';
import '@/styles/about.css';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');
const ABOUT_IMAGE = '/about/caleb-mccartney-photo.jpg';

const stats = [
  { value: '6+', label: 'Years in the field' },
  { value: '65+', label: 'Assignments and campaigns' },
  { value: '30+', label: 'Clients and collaborators' },
];

const serviceCards = [
  {
    title: 'Photojournalism',
    copy:
      'Reporting-first coverage shaped by patience, context, and a commitment to what the moment is actually saying.',
  },
  {
    title: 'Concert + Event',
    copy:
      'Fast-moving live work built around timing, atmosphere, and clean client delivery without flattening the energy of the room.',
  },
  {
    title: 'Commercial Storytelling',
    copy:
      'Brand, nonprofit, and campaign visuals that stay grounded in people instead of generic production gloss.',
  },
];

const timeline = [
  {
    year: 'Point Park University',
    detail: 'BFA training in photography with a foundation in documentary practice and editorial thinking.',
  },
  {
    year: 'The Globe',
    detail: 'Led visual coverage as Photo Editor while sharpening a reporting workflow built for fast deadlines.',
  },
  {
    year: 'McCal Media',
    detail: 'Expanded into client work, podcast conversations, and longer-form stories spanning politics, culture, and community.',
  },
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
  },
];

const clientLogos = [
  { src: '/about/clients/new-york-post-logo.png', alt: 'New York Post' },
  { src: '/about/clients/pittsburgh-magazine-real-logo.png', alt: 'Pittsburgh Magazine' },
  { src: '/about/clients/point-park-university-real-logo.jpg', alt: 'Point Park University' },
  { src: '/about/clients/covalent-logo.png', alt: 'Covalent' },
  { src: '/about/clients/nppa-real-logo.png', alt: 'National Press Photographers Association' },
  { src: '/about/clients/bc3-logo-new.png', alt: 'Butler County Community College' },
  { src: '/about/clients/osh360-logo.png', alt: 'OSH360' },
  { src: '/about/clients/the-globe-real-logo.jpg', alt: 'The Globe' },
];

export default function AboutPage() {
  usePageMeta({
    title: 'About Caleb McCartney | Photojournalism, Events, and Visual Storytelling',
    description:
      'Learn more about Caleb McCartney, a Pittsburgh-based photojournalist and commercial photographer working across reporting, events, concerts, and brand storytelling.',
    canonical: `${SITE_URL}/about`,
    og: {
      type: 'profile',
      title: 'About Caleb McCartney',
      description:
        'Pittsburgh-based photojournalist and commercial photographer working across reporting, events, concerts, and brand storytelling.',
      image: `${SITE_URL}${ABOUT_IMAGE}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'About Caleb McCartney',
      description:
        'Pittsburgh-based photojournalist and commercial photographer working across reporting, events, concerts, and brand storytelling.',
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
          jobTitle: 'Photojournalist and Photographer',
          homeLocation: {
            '@type': 'Place',
            name: 'Pittsburgh, Pennsylvania',
          },
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
          logo: `${SITE_URL}/brand/logo-mark.svg`,
        },
      ],
    },
  });

  return (
    <Layout>
      <div className="about-page">
        <section className="about-hero">
          <div className="about-hero__copy">
            <p className="about-hero__kicker">About Caleb McCartney</p>
            <h1 className="about-hero__title">
              Reporting-minded images, whether the room is a rally, a concert, or a client event.
            </h1>
            <p className="about-hero__lede">
              Caleb McCartney is a Pittsburgh-based photojournalist, commercial photographer, and
              writer working across politics, culture, live performance, and brand storytelling.
            </p>
            <p className="about-hero__body">
              His approach starts from the same place every time: pay attention, stay close to the
              people in front of you, and let the scene keep its own texture. That shows up in
              campaign coverage, community reporting, concert photography, and commercial work that
              still feels human.
            </p>
            <p className="about-hero__body">
              Alongside client assignments, Caleb builds longer editorial projects, writes essays
              and field notes, and hosts the <Link to="/podcast">Caffeinated Connections</Link>{' '}
              podcast as a way of tracing how creative work, labor, and public life overlap.
            </p>

            <div className="about-hero__actions">
              <Link to="/contact-us" className="about-pill about-pill--primary">
                Get in touch
              </Link>
              <Link to="/featured-work" className="about-pill">
                View portfolio
              </Link>
              <a href="/downloads/caleb-mccartney-resume.pdf" className="about-pill" download>
                Download resume
              </a>
              <Link to="/podcast" className="about-pill">
                Listen to the podcast
              </Link>
            </div>

            <div className="about-stats" aria-label="Career highlights">
              {stats.map((item) => (
                <div key={item.label} className="about-stats__item">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <figure className="about-hero__media">
            <img
              src={ABOUT_IMAGE}
              alt="Black-and-white portrait of Caleb McCartney."
              className="about-hero__image"
              loading="eager"
              fetchPriority="high"
            />
            <figcaption>
              Pittsburgh-based photojournalist, commercial photographer, and writer.
            </figcaption>
          </figure>
        </section>

        <section className="about-services" aria-labelledby="about-services-heading">
          <div className="about-section-heading">
            <p>What the work centers on</p>
            <h2 id="about-services-heading">Three lanes, one editorial backbone.</h2>
          </div>

          <div className="about-services__grid">
            {serviceCards.map((card) => (
              <article key={card.title} className="about-service-card">
                <h3>{card.title}</h3>
                <p>{card.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-story" aria-labelledby="about-story-heading">
          <div className="about-section-heading">
            <p>How it developed</p>
            <h2 id="about-story-heading">A practice built between assignments and long-form work.</h2>
          </div>

          <div className="about-timeline">
            {timeline.map((item) => (
              <article key={item.year} className="about-timeline__item">
                <p className="about-timeline__year">{item.year}</p>
                <p className="about-timeline__detail">{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-testimonials" aria-labelledby="about-testimonials-heading">
          <div className="about-section-heading">
            <p>Client feedback</p>
            <h2 id="about-testimonials-heading">Work that people trust when the assignment matters.</h2>
          </div>

          <div className="about-testimonials__grid">
            {testimonials.map((item) => (
              <blockquote key={item.name} className="about-testimonial-card">
                <p className="about-testimonial-card__source">{item.source}</p>
                <p className="about-testimonial-card__quote">"{item.quote}"</p>
                <footer>
                  <strong>{item.name}</strong>
                  <span>{item.role}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </section>

        <section className="about-clients" aria-labelledby="about-clients-heading">
          <div className="about-section-heading">
            <p>Selected collaborators</p>
            <h2 id="about-clients-heading">Editorial, academic, nonprofit, and brand partners.</h2>
          </div>

          <div className="about-clients__grid">
            {clientLogos.map((logo) => (
              <div key={logo.alt} className="about-client-logo">
                <img src={logo.src} alt={logo.alt} loading="lazy" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}
