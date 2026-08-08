import { Link } from 'react-router-dom';
import PageMeta from '../components/PageMeta';
import { BUSINESS } from '../lib/site';

export default function PrivacyPage() {
  return (
    <>
      <PageMeta
        title={`Privacy | ${BUSINESS.name}`}
        description="How The Overspray Removalist collects, uses and stores the information you send us."
        path="/privacy"
        noindex
      />

      <section className="pbanner">
        <div className="shell">
          <p className="crumb">
            <Link to="/">Home</Link> / <span>Privacy</span>
          </p>
          <h1 className="display">Privacy</h1>
          <p className="lede">How we handle the information you send us.</p>
        </div>
      </section>

      <section>
        <div className="shell prose">
          <h2 className="display">What we collect</h2>
          <p>
            When you submit the quote form we collect your name, contact number, email, the location
            of the vehicle, the details you give us about the damage, and any photos you attach. We
            also record which campaign or search brought you to the site, so we know which of our
            own advertising is working.
          </p>

          <h2 className="display">What we do with it</h2>
          <p>
            We use it to quote and carry out the work you have asked about, and to contact you
            regarding that job. Where a job forms part of an insurance claim, the relevant details
            may be shared with the insurer or assessor handling that claim.
          </p>

          <h2 className="display">What we do not do with it</h2>
          <p>
            We do not sell your information, and we do not pass it to third parties for marketing.
          </p>

          <h2 className="display">Photos</h2>
          <p>
            Photos you send are used to quote and complete the job. We may use before and after
            photographs of completed work in our gallery. If you would prefer we did not, tell us
            and we will not.
          </p>

          <h2 className="display">Getting in touch</h2>
          <p>
            To ask what we hold, or to have it removed, email{' '}
            <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a> or call {BUSINESS.phone}.
          </p>
        </div>
      </section>
    </>
  );
}
