import { Link } from 'react-router-dom';
import LegalDocument from '@/components/legal/LegalDocument';
import type { LegalGlanceItem, LegalNavSection } from '@/components/legal/LegalDocument';
import { usePageMeta } from '@/hooks/usePageMeta';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');

/**
 * The client agreement. Split out of the combined policies page, where its 24
 * subsections made up roughly half the document and could not be linked to on their
 * own — a client asking for "the terms" had to be sent everything.
 */

const NAV_SECTIONS: LegalNavSection[] = [
  {
    title: 'Terms & Conditions',
    open: true,
    items: [
      { label: 'Overview', href: '#terms' },
      { label: 'Pre-Project Consultation', href: '#consultation' },
      { label: 'Cost', href: '#cost' },
      { label: 'Fees', href: '#fees' },
      { label: 'Late Fees', href: '#late' },
      { label: 'Expenses', href: '#expenses' },
      { label: 'Account Access', href: '#account' },
      { label: 'Confidentiality', href: '#confidentiality' },
      { label: 'Relationships', href: '#relationships' },
      { label: 'Intellectual Property', href: '#ip' },
      { label: 'School & University Graduation Event Use', href: '#graduation-event-use' },
      { label: 'Client Logos & Third-Party Marks', href: '#client-logos' },
      { label: 'Style Release', href: '#style' },
      { label: 'Limit of Liability', href: '#liability' },
      { label: 'Indemnification', href: '#indemnification' },
      { label: 'Assumption of Risk', href: '#risk' },
      { label: 'Non-Disparagement', href: '#non-disparagement' },
      { label: 'Cancellations & Rescheduling', href: '#cancellations' },
      { label: 'Force Majeure', href: '#force' },
      { label: 'No-Shows', href: '#no-shows' },
      { label: 'Governing Law', href: '#law' },
      { label: 'Notice', href: '#notice' },
      { label: 'Severability', href: '#severability' },
      { label: 'Amendments', href: '#amendments' },
      { label: 'Assignments', href: '#assignments' },
    ],
  },
];

const GLANCE_ITEMS: LegalGlanceItem[] = [
  { label: 'Overview', href: '#terms', description: 'Service terms' },
  { label: 'Cost & fees', href: '#cost', description: 'What you pay' },
  { label: 'Intellectual property', href: '#ip', description: 'Who owns what' },
  { label: 'Cancellations', href: '#cancellations', description: 'Rescheduling' },
];

export default function TermsPage() {
  usePageMeta({
    title: 'Terms & Conditions | McCal Media',
    description:
      'Service terms for McCal Media photography: consultation, cost and fees, intellectual property, cancellations, liability, and governing law.',
    canonical: `${SITE_URL}/terms`,
    og: {
      type: 'website',
      title: 'Terms & Conditions | McCal Media',
      description: 'Service terms and client agreement for McCal Media photography.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
    twitter: {
      card: 'summary',
      title: 'Terms & Conditions | McCal Media',
      description: 'Service terms and client agreement for McCal Media photography.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Terms & Conditions',
      description: "McCal Media's terms of service and client agreement.",
      url: `${SITE_URL}/terms`,
      publisher: { '@type': 'Organization', name: 'McCal Media', url: SITE_URL },
      inLanguage: 'en-US',
      isPartOf: { '@type': 'WebSite', name: 'McCal Media', url: SITE_URL },
    },
  });

  return (
    <LegalDocument
      title="Terms & Conditions"
      intro="The client agreement covering consultation, cost, intellectual property, cancellations, and liability for McCal Media photography and creative services."
      effectiveDate="2026-08-11"
      navLabel="Terms & Conditions"
      navSections={NAV_SECTIONS}
      glanceItems={GLANCE_ITEMS}
      actions={[
        {
          label: 'Terms PDF',
          href: 'mailto:business@mcc-cal.com?subject=Request%20for%20Terms%20%26%20Conditions%20PDF',
          title: 'Contact us for a copy of the full Terms & Conditions (PDF)',
        },
      ]}
    >
      <section id="terms" aria-labelledby="terms-heading">
        {/* "Overview", not "Terms & Conditions": on the combined policies page this
            heading distinguished one document from three, but on a page whose h1 is
            already "Terms & Conditions" it only duplicated it. The table of contents
            has always labelled this section Overview. */}
        <h2 id="terms-heading">
          <a href="#terms" className="anchor" aria-hidden="true">
            §
          </a>
          Overview
        </h2>
        <p id="terms-overview">
          <strong>Overview:</strong> These Terms & Conditions govern the relationship between McCal
          Media (the &quot;Contractor&quot;) and its Clients. By booking, commissioning, or using services,
          you agree to these terms and the responsibilities they outline.
        </p>

        <section id="consultation" aria-labelledby="consultation-heading">
          <h3 id="consultation-heading">
            <a href="#consultation" className="anchor" aria-hidden="true">
              §
            </a>
            Pre-Project Consultation
          </h3>
          <p>
            The Contractor shall provide the Client with one thirty to sixty-minute pre-service
            consultation. The Parties shall agree on an acceptable date and time for conducting the
            pre-service consultation. Still, the manner by which the consultation shall be conducted
            shall be at the Contractor&apos;s discretion. This consultation is usually conducted via
            phone, video chat, or in person. This consultation may be scheduled no later than a week
            or more before the event.
          </p>
        </section>

        <section id="cost" aria-labelledby="cost-heading">
          <h3 id="cost-heading">
            <a href="#cost" className="anchor" aria-hidden="true">
              §
            </a>
            Cost
          </h3>
          <p>
            The total cost of all Services the Contractor agrees to provide to the Client is on an
            agreed basis in addition to (the &quot;Total Cost&quot;). The total cost includes contractor&apos;s
            services, setup time, travel and out-of-pocket expenses, software licenses,
            administrative fees, assistance, subcontractor costs, and additional costs during an
            ongoing project.
          </p>
        </section>

        <section id="fees" aria-labelledby="fees-heading">
          <h3 id="fees-heading">
            <a href="#fees" className="anchor" aria-hidden="true">
              §
            </a>
            Fees
          </h3>
          <p>
            The contractor&apos;s compensation is determined on a per-project basis, as outlined in the
            estimate provided to the Client.
          </p>
        </section>

        <section id="late" aria-labelledby="late-heading">
          <h3 id="late-heading">
            <a href="#late" className="anchor" aria-hidden="true">
              §
            </a>
            Late Fees
          </h3>
          <p>
            If the Contractor does not receive payment from the Client within fourteen calendar days
            of any payment date, the Client will be charged a late fee equal to 1.5% of the original
            outstanding amount for each day that the Contractor does not receive it. This fee does
            not compound &mdash; it is calculated only on the original amount owed, not on
            previously accrued late fees.
          </p>
          <ul>
            <li>
              <strong>For example:</strong> The Client owes the Contractor $1000 due on April 1 and
              fails to pay by April 14th. On April 15th, the Client owes the Contractor $1015. On
              April 16th, the Client owes the Contractor $1030. On April 17th, the Client owes
              the Contractor $1045, and so on.
            </li>
          </ul>
        </section>

        <section id="expenses" aria-labelledby="expenses-heading">
          <h3 id="expenses-heading">
            <a href="#expenses" className="anchor" aria-hidden="true">
              §
            </a>
            Expenses
          </h3>
          <p>
            Any expenses incurred by the Contractor while providing the Client with Services will be
            invoiced to the Client promptly. The Client is responsible for paying for and delivering
            any third-party software licenses or products the Contractor wishes to utilize. At the
            Contractor&apos;s discretion, the Contractor will make reasonable efforts to integrate the
            Client&apos;s suggested software or products.
          </p>
        </section>

        <section id="account" aria-labelledby="account-heading">
          <h3 id="account-heading">
            <a href="#account" className="anchor" aria-hidden="true">
              §
            </a>
            Account Access
          </h3>
          <p>
            The Client shall provide the Contractor access to the accounts no later than 48 hours
            before the day after the day of service.
          </p>
        </section>

        <section id="confidentiality" aria-labelledby="confidentiality-heading">
          <h3 id="confidentiality-heading">
            <a href="#confidentiality" className="anchor" aria-hidden="true">
              §
            </a>
            Confidentiality
          </h3>
          <p>
            Parties will treat and hold all information about this Agreement and the Services
            provided. The Parties&apos; businesses in strict confidence and will not use any of this
            information except in connection with fulfilling the terms of this Agreement, and, if
            this Agreement is terminated for whatever reason, Parties will return all such
            information, including account access information, and any and all copies to the
            original Party. They will remain bound to the Confidentiality provision of this
            Agreement.
          </p>
          <p>
            Confidential information (herein &quot;Confidential Information&quot;) means information that is
            of value to its owner and is treated as proprietary or confidential, including, but not
            limited to, intellectual property, inventions, trade secrets or information, financial
            data or information, speculation, knowledge, general Company data or reports, future
            business plans, strategies, customer lists and information, client acquisition
            strategies, advertising campaigns, information regarding executives and employees, and
            the terms and provisions of this Agreement.
          </p>
          <p>
            Further, at all times, neither Party shall use or disclose any Confidential Information
            relating in any way to the past, present, or future business affairs, conditions,
            clients, customers, efforts, employees, financial data, operations, practices, products,
            processes, properties, sales, or services of or relating in any way to the Company in
            whatever form to any parties outside of this Agreement.
          </p>
          <p>
            This Agreement imposes no obligation upon the Parties concerning any Confidential
            Information that was possessed before initial business interactions commenced between
            the Parties; is or becomes a matter of public knowledge through no fault of receiving
            Party; is rightfully obtained from a third party not owing a duty of confidentiality; is
            disclosed without a duty of confidentiality to a third party by, or with the
            authorization of the disclosing Party; or is independently developed by either Party
            without prior knowledge of privileged or confidential information.
          </p>
        </section>

        <section id="relationships" aria-labelledby="relationships-heading">
          <h3 id="relationships-heading">
            <a href="#relationships" className="anchor" aria-hidden="true">
              §
            </a>
            Relationships of the Parties
          </h3>
          <p>
            The Contractor and any related sub-contractors are not employees, partners, or members
            of the Client&apos;s company or organization. The Contractor has the sole right to control
            and direct the means, manner, and method by which the services in this Agreement are
            performed. The Contractor can hire assistants, subcontractors, or employees to provide
            the Client with its Services. Parties are individually and separately responsible for
            their business operation and expenses, including securing or paying licensing fees,
            insurance, taxes (including FICA), registrations, or permits. The Client is not
            responsible for paying the Contractor for any benefits, Worker&apos;s Compensation,
            insurance, or unemployment fees.
          </p>
        </section>

        <section id="ip" aria-labelledby="ip-heading">
          <h3 id="ip-heading">
            <a href="#ip" className="anchor" aria-hidden="true">
              §
            </a>
            Intellectual Property
          </h3>
          <p>
            The Contractor retains its copyright ownership in any and all designs pursuant to
            federal copyright law (Chapter 17, Section 201-02 of the United States Code.) Any and
            all work produced in connection with, or in the process of fulfilling this Agreement,
            are expressly and solely owned by the Contractor. The Contractor grants Client a
            nontransferable, non-exclusive, royalty-free license of photos produced with and for
            Client for the specific purpose agreed to in the licensing agreement. Any unauthorized
            use of the design, such as using the design for purposes other than those specified
            herein, will result in additional fees and/or royalty payments to the Contractor.
          </p>
          <p>
            Parties own their respective trademarks and intellectual property used in the standard
            and separate course of their business and agree not to infringe upon or otherwise use
            each other&apos;s respective intellectual property except when providing Client with its
            Services.
          </p>
        </section>

        <section id="graduation-event-use" aria-labelledby="graduation-event-use-heading">
          <h3 id="graduation-event-use-heading">
            <a href="#graduation-event-use" className="anchor" aria-hidden="true">
              §
            </a>
            School &amp; University Graduation Event Use
          </h3>
          <p>
            Some school and university graduation event photographs displayed on this site were
            created by Caleb McCartney while working on assignment with GradImages or related
            commencement photography coverage. Those images are displayed with permission and
            are included only to show Caleb&apos;s photographic work, event coverage experience,
            and portfolio history.
          </p>
          <p>
            McCal Media does not claim ownership of third-party graduation photography rights,
            does not sell or license these images, does not provide prints or downloads, and does
            not represent that it is any school&apos;s official graduation photography vendor unless
            separately stated in writing. Copyrights, trademarks, school names, graduate likenesses,
            and related rights remain with their respective owners, clients, vendors, schools, or
            subjects as applicable.
          </p>
          <p>
            If you are a graduate, family member, school representative, vendor, or rights holder
            with a question about a displayed graduation image, contact{' '}
            <a href="mailto:business@mcc-cal.com">business@mcc-cal.com</a> so the image can be
            reviewed promptly.
          </p>
        </section>

        <section id="client-logos" aria-labelledby="client-logos-heading">
          <h3 id="client-logos-heading">
            <a href="#client-logos" className="anchor" aria-hidden="true">
              §
            </a>
            Client Logos &amp; Third-Party Marks
          </h3>
          <p>
            Client, publication, school, university, nonprofit, venue, and brand logos shown on
            this site are used to identify organizations Caleb McCartney or McCal Media has
            worked with, contributed to, photographed for, collaborated with, or been published by.
            All logos, names, trademarks, and service marks remain the property of their respective
            owners.
          </p>
          <p>
            Displaying a logo does not imply sponsorship, endorsement, exclusive partnership, or
            official vendor status unless that relationship is separately stated in writing.
          </p>
        </section>

        <section id="style" aria-labelledby="style-heading">
          <h3 id="style-heading">
            <a href="#style" className="anchor" aria-hidden="true">
              §
            </a>
            Style Release
          </h3>
          <p>
            The Client has spent satisfactory time reviewing the Contractor&apos;s work and reasonably
            expects that the Contractor&apos;s Services will produce a similar outcome and result for the
            Client. The Contractor will use reasonable efforts to ensure the Client&apos;s services are
            carried out in a style and manner consistent with the Contractor&apos;s current portfolio and
            services. The Contractor will try to incorporate any suggestions the Client makes.
            However, the Client understands and agrees that:
          </p>
          <ul>
            <li>
              Every client and final delivery is different, with different tastes, budgets, and
              needs;
            </li>
            <li>
              Photography is a subjective service, and the Contractor is a provider with a unique
              vision and an ever-evolving style and technique;
            </li>
            <li>
              Contractor will use his judgment to create favorable results for Client, which may not
              include strict adherence to Client&apos;s suggestions;
            </li>
            <li>
              Dissatisfaction with the Contractor&apos;s independent judgment or individual management
              style is not a valid reason for terminating this Agreement or requesting any monies
              returned.
            </li>
          </ul>
        </section>

        <section id="liability" aria-labelledby="liability-heading">
          <h3 id="liability-heading">
            <a href="#liability" className="anchor" aria-hidden="true">
              §
            </a>
            Limit of Liability
          </h3>
          <p>
            Client agrees that the maximum amount of damages he/she/they are entitled to in any
            claim of or relating to this Agreement or Services provided herein are not to exceed
            Contractor&apos;s total cost as outlined in this Agreement.
          </p>
        </section>

        <section id="indemnification" aria-labelledby="indemnification-heading">
          <h3 id="indemnification-heading">
            <a href="#indemnification" className="anchor" aria-hidden="true">
              §
            </a>
            Indemnification
          </h3>
          <p>
            Client agrees to indemnify and hold harmless Contractor and its employees, agents, and
            independent contractors for any injury, property damage, liability, claim, or other
            cause of action arising from or related to Services provided herein.
          </p>
        </section>

        <section id="risk" aria-labelledby="risk-heading">
          <h3 id="risk-heading">
            <a href="#risk" className="anchor" aria-hidden="true">
              §
            </a>
            Assumption of Risk
          </h3>
          <p>
            Client and related parties/participants expressly assume any risk of photography and
            related activities as described herein.
          </p>
        </section>

        <section id="non-disparagement" aria-labelledby="non-disparagement-heading">
          <h3 id="non-disparagement-heading">
            <a href="#non-disparagement" className="anchor" aria-hidden="true">
              §
            </a>
            Non-Disparagement
          </h3>
          <p>
            The Parties mutually agree not to make public defamatory statements that would
            materially harm the reputation or business activities of any Parties to this Agreement.
          </p>
        </section>

        <section id="cancellations" aria-labelledby="cancellations-heading">
          <h3 id="cancellations-heading">
            <a href="#cancellations" className="anchor" aria-hidden="true">
              §
            </a>
            Cancellations & Rescheduling
          </h3>
          <p>
            If the Client desires to cancel or reschedule Services, the following policies apply:
          </p>
          <ul>
            <li>
              <strong>More than 30 days before service:</strong> Full refund minus 10%
              administrative fee
            </li>
            <li>
              <strong>15-30 days before service:</strong> 50% refund of deposit
            </li>
            <li>
              <strong>Less than 15 days before service:</strong> No refund; deposit forfeited
            </li>
            <li>
              <strong>Rescheduling:</strong> First reschedule free if more than 30 days notice;
              subsequent reschedules subject to availability and $100 fee
            </li>
          </ul>
          <p>
            The Contractor reserves the right to cancel services due to equipment failure, illness,
            or force majeure with full refund and assistance finding alternative providers.
          </p>
        </section>

        <section id="force" aria-labelledby="force-heading">
          <h3 id="force-heading">
            <a href="#force" className="anchor" aria-hidden="true">
              §
            </a>
            Force Majeure
          </h3>
          <p>
            Either party may choose to be excused from further performance obligations in the event
            of a disastrous occurrence beyond their control including but not limited to: natural
            disasters, pandemics, government orders, acts of war, terrorism, extreme weather, venue
            closures, or transportation failures. In such cases, deposits may be applied to
            rescheduled dates or refunded at the Contractor&apos;s discretion.
          </p>
        </section>

        <section id="no-shows" aria-labelledby="no-shows-heading">
          <h3 id="no-shows-heading">
            <a href="#no-shows" className="anchor" aria-hidden="true">
              §
            </a>
            No-Shows
          </h3>
          <p>
            Suppose it becomes impossible for the Contractor to render Services due to the fault of
            the Client or related parties (failure to appear, denial of venue access, inadequate
            preparation, intoxication, or safety concerns). In that case, the Contractor may elect
            to leave the service location without rendering Services, and no refund will be issued.
            The Client remains responsible for full payment as outlined in the contract.
          </p>
        </section>

        <section id="law" aria-labelledby="law-heading">
          <h3 id="law-heading">
            <a href="#law" className="anchor" aria-hidden="true">
              §
            </a>
            Governing Law
          </h3>
          <p>
            The laws of the United States and the jurisdiction of Pennsylvania govern all matters
            arising under this Agreement. Any disputes shall be resolved through mediation or
            binding arbitration in Allegheny County, Pennsylvania, before resorting to litigation.
            Each party is responsible for their own legal fees unless otherwise awarded by a court
            or arbitrator.
          </p>
        </section>

        <section id="notice" aria-labelledby="notice-heading">
          <h3 id="notice-heading">
            <a href="#notice" className="anchor" aria-hidden="true">
              §
            </a>
            Notice
          </h3>
          <p>
            Parties shall provide adequate notice (&quot;Notice&quot;) to each other, including any payments,
            invoices, contract amendments, or formal communications, via email to the addresses
            specified in the project agreement. Notice is considered delivered when sent via email
            with read receipt or 3 business days after mailing via certified mail. Emergency
            communications may be made via phone with follow-up written confirmation.
          </p>
        </section>

        <section id="severability" aria-labelledby="severability-heading">
          <h3 id="severability-heading">
            <a href="#severability" className="anchor" aria-hidden="true">
              §
            </a>
            Severability
          </h3>
          <p>
            If any portion of this Agreement is deemed illegal, invalid, or unenforceable by a court
            of competent jurisdiction, the remaining provisions shall remain in full force and
            effect. The parties agree to replace any invalid provision with a valid provision that
            most closely approximates the original intent.
          </p>
        </section>

        <section id="amendments" aria-labelledby="amendments-heading">
          <h3 id="amendments-heading">
            <a href="#amendments" className="anchor" aria-hidden="true">
              §
            </a>
            Amendments
          </h3>
          <p>
            The parties may amend this Agreement only by written agreement signed by both parties
            with proper Notice. Verbal agreements or email discussions do not constitute amendments
            unless formalized in writing. Project-specific addendums may be created for individual
            engagements while maintaining these general terms.
          </p>
        </section>

        <section id="assignments" aria-labelledby="assignments-heading">
          <h3 id="assignments-heading">
            <a href="#assignments" className="anchor" aria-hidden="true">
              §
            </a>
            Assignments
          </h3>
          <p>
            Unless otherwise provided herein, neither party may assign or subcontract any rights or
            obligations under this Agreement without proper Notice and written consent from the
            other party. The Contractor may use assistant photographers or subcontractors as needed
            to fulfill services, maintaining quality standards and confidentiality. Clients may not
            transfer service agreements to third parties without Contractor approval.
          </p>
        </section>
      </section>

      <hr aria-hidden="true" />

      <section id="terms-related" aria-labelledby="terms-related-heading">
        <h2 id="terms-related-heading">
          <a href="#terms-related" className="anchor" aria-hidden="true">
            §
          </a>
          Related policies
        </h2>
        <p>
          For usage rights covering delivered photography, see{' '}
          <Link to="/licensing">Image Licensing</Link>. For how personal data is handled, see{' '}
          <Link to="/privacy">Privacy &amp; Cookies</Link>.
        </p>
      </section>
    </LegalDocument>
  );
}
