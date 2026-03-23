import { Link } from 'react-router-dom';
import Layout from '../components/Layout/Layout';

const NotFoundPage = () => (
  <Layout>
    <section style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <h1>404 — Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/">Return home</Link>
    </section>
  </Layout>
);

export default NotFoundPage;
