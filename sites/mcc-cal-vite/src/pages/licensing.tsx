import { Link } from 'react-router-dom';
import LegalDocument from '@/components/legal/LegalDocument';
import type { LegalGlanceItem, LegalNavSection } from '@/components/legal/LegalDocument';
import { usePageMeta } from '@/hooks/usePageMeta';
import { IMAGE_RIGHTS } from '@/utils/jsonLd';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');

/**
 * The canonical statement of usage rights.
 *
 * This page is the target of two machine-readable claims made about every
 * photograph on the site: the schema.org `license` property in each `ImageObject`,
 * and the IPTC Web Statement of Rights embedded in the image files themselves.
 * Google requires that URL to describe the licensing terms, which is why this is a
 * page of its own rather than an anchor inside the combined policies document —
 * that anchor was not present in the server-rendered HTML at all.
 *
 * Changing this route means re-stamping every image. See
 * scripts/metadata/embed-image-rights.js.
 */

const NAV_SECTIONS: LegalNavSection[] = [
  {
    title: 'Usage Rights',
    open: true,
    items: [
      { label: 'What a licence covers', href: '#what-a-licence-covers' },
      { label: 'How a licence is defined', href: '#scope' },
      { label: 'Editorial vs commercial', href: '#editorial-commercial' },
      { label: 'Credit requirements', href: '#credit' },
    ],
  },
  {
    title: 'Before You Publish',
    open: true,
    items: [
      { label: 'Releases', href: '#releases' },
      { label: 'What is not permitted', href: '#restrictions' },
      { label: 'Already published an image?', href: '#unlicensed-use' },
      { label: 'Request a licence', href: '#request' },
    ],
  },
];

const GLANCE_ITEMS: LegalGlanceItem[] = [
  { label: 'Licensed, not sold', href: '#what-a-licence-covers', description: 'Copyright retained' },
  { label: 'Scope', href: '#scope', description: 'Duration, territory, media' },
  { label: 'Credit', href: '#credit', description: 'How to attribute' },
  { label: 'Request', href: '#request', description: 'Licence an image' },
];

export default function LicensingPage() {
  usePageMeta({
    title: 'Image Licensing | McCal Media',
    description:
      'Usage rights for photography by Caleb McCartney. How licences are scoped, editorial and commercial use, credit requirements, and how to license an image.',
    canonical: IMAGE_RIGHTS.license,
    og: {
      type: 'website',
      title: 'Image Licensing | McCal Media',
      description:
        'How to license photography by Caleb McCartney — scope, credit requirements, and editorial versus commercial use.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
    twitter: {
      card: 'summary',
      title: 'Image Licensing | McCal Media',
      description: 'Usage rights and licensing terms for McCal Media photography.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Image Licensing',
      description:
        'Usage rights and licensing terms for photography by Caleb McCartney / McCal Media.',
      url: IMAGE_RIGHTS.license,
      publisher: { '@type': 'Organization', name: 'McCal Media', url: SITE_URL },
      inLanguage: 'en-US',
      isPartOf: { '@type': 'WebSite', name: 'McCal Media', url: SITE_URL },
    },
  });

  return (
    <LegalDocument
      title="Image Licensing"
      intro="Usage rights for photography by Caleb McCartney. What a licence covers, how it is scoped, and how to request one."
      effectiveDate="2026-08-11"
      navLabel="Image Licensing"
      navSections={NAV_SECTIONS}
      glanceItems={GLANCE_ITEMS}
      actions={[
        {
          label: 'License PDF',
          href: 'mailto:business@mcc-cal.com?subject=Request%20for%20Usage%20License%20PDF',
          title: 'Contact us for a copy of the Usage License (PDF)',
        },
      ]}
    >
      <section id="what-a-licence-covers" aria-labelledby="what-a-licence-covers-heading">
        <h2 id="what-a-licence-covers-heading">
          <a href="#what-a-licence-covers" className="anchor" aria-hidden="true">
            §
          </a>
          What a licence covers
        </h2>
        <p>
          Photography delivered by McCal Media is <strong>licensed, not sold</strong>. Copyright in
          every photograph remains with Caleb McCartney. A licence grants permission to use a
          specific image in specific ways for a specific period; it does not transfer ownership,
          and it does not exhaust the photographer&rsquo;s right to license the same image to others
          unless the agreement says so in writing.
        </p>
        <p>
          The usage granted is the usage described on your invoice or contract. All rights not
          expressly granted are reserved.
        </p>
      </section>

      <hr aria-hidden="true" />

      <section id="scope" aria-labelledby="scope-heading">
        <h2 id="scope-heading">
          <a href="#scope" className="anchor" aria-hidden="true">
            §
          </a>
          How a licence is defined
        </h2>
        <p>Four things define what a licence permits. A quote will state each of them.</p>
        <ul>
          <li>
            <strong>Duration</strong> — how long the image may be used. Licences may be for a fixed
            term or perpetual.
          </li>
          <li>
            <strong>Territory</strong> — where it may be published, from a single market to worldwide.
          </li>
          <li>
            <strong>Media</strong> — where it may appear: a specific publication, a website, social
            media, print advertising, packaging, out-of-home. A licence for one does not imply the
            others.
          </li>
          <li>
            <strong>Exclusivity</strong> — whether the same image may be licensed to anyone else
            during the term. Licences are non-exclusive unless agreed otherwise.
          </li>
        </ul>
        <p>
          Changing any of these after delivery — extending a term, adding a market, moving from web
          to print — is a new licence rather than an extension of the original. Get in touch and it
          can usually be handled quickly.
        </p>
      </section>

      <hr aria-hidden="true" />

      <section id="editorial-commercial" aria-labelledby="editorial-commercial-heading">
        <h2 id="editorial-commercial-heading">
          <a href="#editorial-commercial" className="anchor" aria-hidden="true">
            §
          </a>
          Editorial and commercial use
        </h2>
        <p>
          <strong>Editorial use</strong> means using an image to illustrate a news story, article, or
          other work of journalism, commentary, or education. Much of the photojournalism on this
          site was made on assignment and is licensed for editorial use.
        </p>
        <p>
          <strong>Commercial use</strong> means using an image to promote, advertise, or sell a
          product, service, or organisation. Commercial use requires a separate licence and, where
          recognisable people or private property appear, the appropriate releases.
        </p>
        <p>
          An image licensed for editorial use may not be repurposed for advertising, and the
          distinction matters legally, not just contractually. If you are unsure which applies to
          what you are planning, ask before publishing.
        </p>
      </section>

      <hr aria-hidden="true" />

      <section id="credit" aria-labelledby="credit-heading">
        <h2 id="credit-heading">
          <a href="#credit" className="anchor" aria-hidden="true">
            §
          </a>
          Credit requirements
        </h2>
        <p>
          Unless your agreement states otherwise, published images must carry a visible credit in the
          form:
        </p>
        <p>
          <code>{IMAGE_RIGHTS.creditText}</code>
        </p>
        <p>
          In caption text, the Associated Press convention{' '}
          <code>(Photo by Caleb McCartney)</code> at the end of the caption is also acceptable and is
          the form used throughout this site.
        </p>
        <p>
          Every photograph published here carries its creator, credit, copyright notice and a link to
          this page embedded in the file itself, as IPTC and XMP metadata. Stripping that metadata is
          not permitted, and in a number of jurisdictions removing rights management information is a
          separate legal matter from the underlying copyright.
        </p>
      </section>

      <hr aria-hidden="true" />

      <section id="releases" aria-labelledby="releases-heading">
        <h2 id="releases-heading">
          <a href="#releases" className="anchor" aria-hidden="true">
            §
          </a>
          Model and property releases
        </h2>
        <p>
          A licence from the photographer covers copyright. It does not, by itself, cover the rights
          of people or property depicted.
        </p>
        <p>
          Commercial use of an image containing a recognisable person generally requires a signed
          model release, and some private property and artwork requires a property release. Editorial
          use generally does not. Releases are not held for all archive images; where one is needed
          and does not exist, that will be stated before a licence is issued.
        </p>
      </section>

      <hr aria-hidden="true" />

      <section id="restrictions" aria-labelledby="restrictions-heading">
        <h2 id="restrictions-heading">
          <a href="#restrictions" className="anchor" aria-hidden="true">
            §
          </a>
          What is not permitted
        </h2>
        <ul>
          <li>Redistributing, reselling, or sublicensing images to a third party.</li>
          <li>Removing or altering embedded copyright, credit, or rights metadata.</li>
          <li>
            Materially altering the content of a photojournalism image. Cropping and standard
            colour correction are acceptable; adding, removing, or moving elements is not.
          </li>
          <li>Using an image in a way that implies endorsement by a person depicted.</li>
          <li>Using images to train machine learning models, absent a written agreement.</li>
        </ul>
      </section>

      <hr aria-hidden="true" />

      <section id="unlicensed-use" aria-labelledby="unlicensed-use-heading">
        <h2 id="unlicensed-use-heading">
          <a href="#unlicensed-use" className="anchor" aria-hidden="true">
            §
          </a>
          Already published an image without a licence?
        </h2>
        <p>
          It happens, often without intent — an image is passed along internally, or found without
          its credit attached. Get in touch and it can usually be resolved by issuing a licence that
          covers the use retroactively.
        </p>
        <p>
          Reaching out first is materially better for everyone than being contacted about it
          afterwards.
        </p>
      </section>

      <hr aria-hidden="true" />

      <section id="request" aria-labelledby="request-heading">
        <h2 id="request-heading">
          <a href="#request" className="anchor" aria-hidden="true">
            §
          </a>
          Request a licence
        </h2>
        <p>
          Tell me which image you need, where it will appear, for how long, and in which markets —
          the four things under <a href="#scope">how a licence is defined</a>. A quote follows from
          those.
        </p>
        <p>
          <Link to="/request-a-quote">Request a licence or quote</Link>, or email{' '}
          <a href="mailto:business@mcc-cal.com">business@mcc-cal.com</a>.
        </p>
        <p>
          For broader service terms, see <Link to="/terms">Terms &amp; Conditions</Link>. For how
          personal data is handled, see <Link to="/privacy">Privacy</Link>.
        </p>
      </section>
    </LegalDocument>
  );
}
