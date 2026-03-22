import Head from 'next/head';
import React, { useMemo } from 'react';

// McCal Footer Widget v1.2.0 — React/Next port (mcc-cal.com parity)
const WIDGET_VERSION = '1.2.0';
const NEWSLETTER_ENDPOINT = process.env.NEXT_PUBLIC_NEWSLETTER_ENDPOINT
  || 'https://mcc-cal.us14.list-manage.com/subscribe/post?u=da029ed85760894c33e8b119d&id=fb992a38c8&f_id=00cf8ae0f0';
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');
const LOGO_PATH = '/brand/logo-mark.svg';

const Footer: React.FC = () => {
  const year = useMemo(() => new Date().getFullYear(), []);
  const organizationSchema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}#organization`,
    name: 'Caleb McCartney',
    url: SITE_URL,
    logo: `${SITE_URL}${LOGO_PATH}`,
    sameAs: [
      'https://www.instagram.com/mcc_cal',
      'https://www.facebook.com/mccalphotography'
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'contact@mcc-cal.com',
        url: `${SITE_URL}/contact-us`
      }
    ]
  }), []);
  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </Head>
      <div className="mcc-footer-widget" data-widget-version={WIDGET_VERSION}>
      <footer className="mcc-footer" role="contentinfo" aria-label="Site footer">
        <div className="mcc-footer__inner">
          <section className="mcc-footer__section" aria-labelledby="footer-about">
            <h4 id="footer-about">About</h4>
            <ul className="mcc-footer__list">
              <li><a href="/about">About Me</a></li>
            </ul>
          </section>

          <section className="mcc-footer__section" aria-labelledby="footer-contact">
            <h4 id="footer-contact">Contact</h4>
            <ul className="mcc-footer__list">
              <li><a href="mailto:contact@mcc-cal.com">Email</a></li>
            </ul>
          </section>

          <section className="mcc-footer__section" aria-labelledby="footer-portfolio">
            <h4 id="footer-portfolio">Portfolio</h4>
            <ul className="mcc-footer__list">
              <li><a href="/featured-work">Portfolio</a></li>
              <li><a href="/blog">Blog</a></li>
            </ul>
          </section>

          <section className="mcc-footer__section" aria-labelledby="footer-follow">
            <h4 id="footer-follow">Follow</h4>
            <div className="mcc-footer__social">
              <a
                href="https://www.facebook.com/mccalphotography"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Facebook"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5.01 3.66 9.16 8.44 9.94v-7.03H7.9V12.1h2.54V9.96c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.62.77-1.62 1.56v1.81h2.76l-.44 2.87h-2.32V22c4.78-.78 8.44-4.93 8.44-9.94Z"/>
                </svg>
              </a>
              <a
                href="https://www.instagram.com/mcc_cal"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Instagram"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5A5.5 5.5 0 1 1 6.5 13 5.51 5.51 0 0 1 12 7.5Zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5Zm6.75-2.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"/>
                </svg>
              </a>
            </div>

            <div className="mcc-footer__newsletter">
              <form
                action={NEWSLETTER_ENDPOINT}
                method="post"
                target="_blank"
                aria-label="Newsletter signup"
                noValidate
              >
                <label className="mcc-footer__sr-only" htmlFor="mcc-footer-email">Email address</label>
                <input
                  id="mcc-footer-email"
                  name="EMAIL"
                  type="email"
                  placeholder="Your email address"
                  required
                  aria-describedby="newsletter-desc"
                />
                <div style={{ position: 'absolute', left: '-5000px' }} aria-hidden="true">
                  <input type="text" name="b_da029ed85760894c33e8b119d_fb992a38c8" tabIndex={-1} defaultValue="" />
                </div>
                <button type="submit">Subscribe</button>
                <div id="newsletter-desc" className="mcc-footer__sr-only">
                  Subscribe to our newsletter for updates
                </div>
              </form>
            </div>
          </section>
        </div>

        <div className="mcc-footer__legal">
          <div>&copy; <span>{year}</span> Caleb McCartney. All rights reserved.</div>
          <div className="mcc-footer__version">v{WIDGET_VERSION}</div>
          <div className="mcc-footer__links">
            <a href="mailto:contact@mcc-cal.com">Contact</a>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
};

export default Footer;
