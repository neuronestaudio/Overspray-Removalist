import { Link } from 'react-router-dom';
import PageMeta from '../components/PageMeta';
import { BUSINESS } from '../lib/site';

/**
 * Deliberately reachable by direct URL.
 *
 * The template redirects away unless navigation carried state.fromSubmit, which
 * also blocks a refresh and, more importantly, makes the page useless as a GTM
 * conversion destination. Conversions here are fired from the form on a 2xx
 * from the CRM, so this page does not need to defend itself.
 */
export default function ThankYouPage() {
  return (
    <>
      <PageMeta
        title={`Quote request received | ${BUSINESS.name}`}
        description="Your quote request has been received. We will respond with a price or an assessment time."
        path="/thank-you"
        noindex
      />
      <section className="pbanner">
        <div className="shell">
          <p className="eyebrow">Request received</p>
          <h1 className="display">Thanks. We have got it.</h1>
          <p className="lede">
            We will come back to you with a price or a time to come and look. If it is urgent, call{' '}
            {BUSINESS.phoneContact} on <a href={BUSINESS.phoneHref}>{BUSINESS.phone}</a>.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary btn-lg" to="/gallery">
              See recent jobs
            </Link>
            <Link className="btn btn-ghost btn-lg" to="/">
              Back to home
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
