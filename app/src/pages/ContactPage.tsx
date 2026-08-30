import { Link } from 'react-router-dom';
import PageMeta from '../components/PageMeta';
import QuoteForm from '../components/QuoteForm';
import ScrollTitle from '../components/ScrollTitle';
import { SITE_ORIGIN, BUSINESS } from '../lib/site';

export default function ContactPage() {
  const { locality, region, postcode } = BUSINESS.address;

  return (
    <>
      <PageMeta
        title={`Contact | Overspray & Fallout Removal, ${locality} ${region} | ${BUSINESS.name}`}
        description={`Call ${BUSINESS.phoneContact} on ${BUSINESS.phone} or ${BUSINESS.phoneAltContact} on ${BUSINESS.phoneAlt}, or email ${BUSINESS.email}. Based in ${locality} ${region}, working on site across Australia.`}
        path="/contact"
        ogImage="workshop"
        ogAlt="The Overspray Removalist workshop"
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
              { '@type': 'ListItem', position: 2, name: 'Contact', item: `${SITE_ORIGIN}/contact` },
            ],
          },
        ]}
      />

      <section className="pbanner">
        <div className="shell">
          <p className="crumb">
            <Link to="/">Home</Link> / <span>Contact</span>
          </p>
          <h1 className="display">Contact</h1>
          <p className="lede">
            Two of us take the calls, both founders, with more than thirty years between us
            servicing Melbourne. If one does not pick up, try the other. Fastest of all is the form
            below: send photos and we come back with a price.
          </p>
        </div>
      </section>

      {/* The form itself, not a button that goes and finds it. This is the
          contact page: making someone travel to another page to make contact
          is the friction the old site was built on. */}
      <section className="home-quote">
        <div className="shell">
          <div className="head" style={{ textAlign: 'center', marginInline: 'auto' }}>
            <p className="eyebrow">Send it through</p>
            <h2 className="display">Photos get you a price fastest</h2>
            <p className="lede" style={{ marginInline: 'auto' }}>
              Five quick questions and a couple of photos. They tell us the contamination type and
              how hard it has bonded, which is usually enough to quote without seeing the vehicle.
            </p>
          </div>
          <div className="home-quote-form">
            <QuoteForm />
          </div>
        </div>
      </section>

      <section>
        <div className="shell">
          <ScrollTitle className="head">
            <p className="eyebrow">Or reach us directly</p>
            <h2 className="display">Two people, both on the tools</h2>
          </ScrollTitle>

          <div className="cx-grid">
            <div className="cx-card beam">
              <ul className="cx-list">
                <li>
                  <span className="cx-k">{BUSINESS.phoneContact}</span>
                  <span className="cx-role">{BUSINESS.phoneContactRole}</span>
                  <a className="cx-v" href={BUSINESS.phoneHref}>
                    {BUSINESS.phone}
                  </a>
                </li>
                <li>
                  <span className="cx-k">{BUSINESS.phoneAltContact}</span>
                  <span className="cx-role">{BUSINESS.phoneAltContactRole}</span>
                  <a className="cx-v" href={BUSINESS.phoneAltHref}>
                    {BUSINESS.phoneAlt}
                  </a>
                </li>
                <li>
                  <span className="cx-k">Email</span>
                  <a className="cx-v" href={`mailto:${BUSINESS.email}`}>
                    {BUSINESS.email}
                  </a>
                </li>
                <li>
                  <span className="cx-k">Workshop</span>
                  <span className="cx-v cx-plain">
                    {locality} {region} {postcode}
                  </span>
                </li>
                <li>
                  <span className="cx-k">Hours</span>
                  <span className="cx-v cx-plain">{BUSINESS.hours}</span>
                </li>
              </ul>
            </div>

            <div className="cx-map">
              <div className="split-media">
                {/* Points at the actual service base. The old embed was centred
                    on the whole of Australia at continent zoom and still carried
                    the original developer's locale parameter. */}
                <iframe
                  title={`Map showing the ${BUSINESS.name} workshop in ${locality} ${region} ${postcode}`}
                  src={`https://www.google.com/maps?q=${locality}+${region}+${postcode}+Australia&output=embed`}
                  width="100%"
                  height="340"
                  style={{ border: 0, display: 'block' }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <p className="cx-note">
                Vehicles are brought to the Epping workshop. Where a whole site or a fleet is
                affected, tell us how many and where, and we will come and assess it.
              </p>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
