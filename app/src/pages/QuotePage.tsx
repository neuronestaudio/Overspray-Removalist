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
            Photos are the fastest path to an accurate price. Attach them below and we will come
            back with a number or a time to come and look.
          </p>
        </div>
      </section>
      <section>
        <div className="shell split">
          <QuoteForm />
          <aside>
            <div className="pricing-note">
              <strong>Whole lot affected?</strong>
              <p className="body-muted">
                Tell us how many vehicles and where they are. If we can work through the lot in one
                location we price the lot, not each car, and we can handle the authorisation and
                release forms.
              </p>
            </div>
            <p className="form-note">
              Prefer to talk? Call <a href={BUSINESS.phoneHref}>{BUSINESS.phone}</a>.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
