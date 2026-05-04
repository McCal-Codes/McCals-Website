import React, { useMemo } from 'react';

const NEWSLETTER_ENDPOINT =
  import.meta.env.VITE_NEWSLETTER_ENDPOINT ||
  'https://mcc-cal.us14.list-manage.com/subscribe/post?u=da029ed85760894c33e8b119d&id=fb992a38c8&f_id=00cf8ae0f0';
const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');
const LOGO_PATH = '/brand/logo-mark.svg';

const Footer: React.FC = () => {
  const year = useMemo(() => new Date().getFullYear(), []);
  const organizationSchema = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: 'Caleb McCartney',
      url: SITE_URL,
      logo: `${SITE_URL}${LOGO_PATH}`,
      sameAs: [
        'https://www.instagram.com/mcc_cal',
        'https://www.facebook.com/mccalphotography',
      ],
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          email: 'contact@mcc-cal.com',
          url: `mailto:contact@mcc-cal.com`,
        },
      ],
    }),
    [],
  );

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <div className="mcc-footer-widget">
        <footer className="mcc-footer" role="contentinfo" aria-label="Site footer">
          <div className="mcc-footer__inner">
            <section className="mcc-footer__section" aria-labelledby="footer-about">
              <h4 id="footer-about">About</h4>
              <ul className="mcc-footer__list">
                <li><a href="/faq">FAQs</a></li>
                <li><a href="/about">About Me</a></li>
                <li><a href="/policies-legal">Policies &amp; Legal</a></li>
              </ul>
            </section>
            <section className="mcc-footer__section" aria-labelledby="footer-contact">
              <h4 id="footer-contact">Contact</h4>
              <ul className="mcc-footer__list">
                <li><a href="mailto:contact@mcc-cal.com">Email</a></li>
                <li><a href="/contact-us">Contact Form</a></li>
              </ul>
            </section>
            <section className="mcc-footer__section" aria-labelledby="footer-projects">
              <h4 id="footer-projects">Projects</h4>
              <ul className="mcc-footer__list">
                <li><a href="/projects">Overview</a></li>
                <li><a href="/letting-me-go">One Nation Divided</a></li>
                <li><a href="/roadmap">Roadmap</a></li>
              </ul>
            </section>
            <section className="mcc-footer__section" aria-labelledby="footer-portfolio">
              <h4 id="footer-portfolio">Portfolio</h4>
              <ul className="mcc-footer__list">
                <li><a href="/featured-work">Portfolio</a></li>
                <li><a href="/blog">Blog</a></li>
                <li><a href="/authors">Authors</a></li>
              </ul>
            </section>
            <section className="mcc-footer__section" aria-labelledby="footer-follow">
              <h4 id="footer-follow">Follow</h4>
              <div className="mcc-footer__social">
                <a href="https://www.facebook.com/mccalphotography" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Facebook">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5.01 3.66 9.16 8.44 9.94v-7.03H7.9V12.1h2.54V9.96c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.62.77-1.62 1.56v1.81h2.76l-.44 2.87h-2.32V22c4.78-.78 8.44-4.93 8.44-9.94Z"/></svg>
                </a>
                <a href="https://www.instagram.com/mcc_cal" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Instagram">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5A5.5 5.5 0 1 1 6.5 13 5.51 5.51 0 0 1 12 7.5Zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5Zm6.75-2.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"/></svg>
                </a>
                <a href="https://www.linkedin.com/in/caleb-mccartney/" target="_blank" rel="noopener noreferrer" aria-label="Connect on LinkedIn">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              </div>
              <div className="mcc-footer__newsletter">
                <form action={NEWSLETTER_ENDPOINT} method="post" target="_blank" aria-label="Newsletter signup" noValidate>
                  <label className="mcc-footer__sr-only" htmlFor="mcc-footer-email">Email address</label>
                  <input id="mcc-footer-email" name="EMAIL" type="email" placeholder="Your email address" required aria-describedby="newsletter-desc" />
                  <div style={{ position: 'absolute', left: '-5000px' }} aria-hidden="true">
                    <input type="text" name="b_da029ed85760894c33e8b119d_fb992a38c8" tabIndex={-1} defaultValue="" />
                  </div>
                  <button type="submit">Subscribe</button>
                  <div id="newsletter-desc" className="mcc-footer__sr-only">Subscribe to our newsletter for updates</div>
                </form>
              </div>
            </section>
          </div>
          <div className="mcc-footer__legal">
            <div>&copy; <span>{year}</span> Caleb McCartney. All rights reserved.</div>
            <div className="mcc-footer__links">
              <a href="/accessibility">Accessibility & Cookies</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Footer;
