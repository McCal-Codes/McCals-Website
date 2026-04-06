import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="hero-panel hero-panel--compact">
      <div>
        <p className="hero-panel__eyebrow">404</p>
        <h2 className="hero-panel__title">That admin route does not exist.</h2>
        <p className="hero-panel__copy">
          Use the main navigation to return to a supported internal page.
        </p>
      </div>
      <Link className="text-link" to="/">
        Return to dashboard
      </Link>
    </section>
  );
}
