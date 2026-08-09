import { Link } from 'react-router-dom';
import PageMeta from '../components/PageMeta';
import QuoteForm from '../components/QuoteForm';
import { BUSINESS } from '../lib/site';

export default function QuotePage() {
  return (
    <>
      <PageMeta
        title={`Get a Quote | Send Photos for a Fast Estimate | ${BUSINESS.name}`}
        description="Request an overspray, cement splatter, graffiti or fallout removal quote. Attach photos of the damage for a fast, accurate estimate. Australia wide, volume pricing available."
        path="/quote"
        ogImage="job-splatter-2"
        ogAlt="Overspray being removed from a black sedan"
      />

      <section className="pbanner">
        <div className="shell">
          <p className="crumb">
            <Link to="/">Home</Link> / <span>Get a quote</span>
          </p>
          <h1 className="display">Get a quote</h1>
          <p className="lede">
            Five quick questions and a couple of photos. We come back with a number, or a time to
            come and look.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="shell quote-layout">
          <QuoteForm />

          <aside className="quote-aside">
            <div className="pricing-note">
              <strong>Whole lot affected?</strong>
              <p className="body-muted">
                Tell us how many vehicles and where they are. If we can work through the lot in one
                location we price the lot, not each car, and we can handle the authorisation and
                release forms.
              </p>
            </div>

            <ul className="quote-points">
              <li>
                <strong>No abrasives</strong>
                <span>Removal by hand. The factory finish stays on the car.</span>
              </li>
              <li>
                <strong>We come to you</strong>
                <span>On site, all suburbs, Australia wide.</span>
              </li>
              <li>
                <strong>Thirty years</strong>
                <span>Overspray and fallout only. It is the whole business.</span>
              </li>
            </ul>

            <p className="form-note">
              Prefer to talk? Call {BUSINESS.phoneContact} on{' '}
              <a href={BUSINESS.phoneHref}>{BUSINESS.phone}</a>.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
