import Layout from '@/components/Layout/Layout';

const RequestAQuotePage = () => (
  <Layout>
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '80px 24px 40px' }}>
      <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 600, marginBottom: '0.5em' }}>
        Request a Quote
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem', marginBottom: '2rem' }}>
        Coming soon. To get started, email{' '}
        <a href="mailto:contact@mcc-cal.com" style={{ color: 'inherit' }}>contact@mcc-cal.com</a>.
      </p>
    </div>
  </Layout>
);

export default RequestAQuotePage;
