import { Link } from 'react-router-dom';
import PageMeta from '../components/PageMeta';

export default function NotFoundPage() {
  return (
    <>
      <PageMeta
        title="Page not found | The Overspray Removalist"
        description="That page does not exist."
        path="/404"
        noindex
      />
      <section className="pbanner">
        <div className="shell">
          <h1 className="display">Page not found</h1>
          <p className="lede">That page does not exist. The links below cover everything we do.</p>
          <div className="hero-actions">
            <Link className="btn btn-primary btn-lg" to="/">
              Back to home
            </Link>
            <Link className="btn btn-ghost btn-lg" to="/services">
              See services
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
