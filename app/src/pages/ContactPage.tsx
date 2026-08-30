import { Link } from 'react-router-dom';
import PageMeta from '../components/PageMeta';
import QuoteForm from '../components/QuoteForm';
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
            Two of us take the calls. If one does not pick up, try the other, or send photos through
            the quote form and we will come back to you.
          </p>
        </div>
      </section>

      <section>
        <div className="shell split">
          <div>
            <ul className="who">
              <li>
                <h2>{BUSINESS.phoneContact}</h2>
                <p>
                  <a href={BUSINESS.phoneHref}>{BUSINESS.phone}</a>
                </p>
              </li>
              <li>
                <h2>{BUSINESS.phoneAltContact}</h2>
                <p>
                  <a href={BUSINESS.phoneAltHref}>{BUSINESS.phoneAlt}</a>
                </p>
              </li>
              <li>
                <h2>Email</h2>
                <p>
                  <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>
                </p>
              </li>
              <li>
                <h2>Based in</h2>
                <p>
                  {locality} {region} {postcode}. We work on site across all suburbs and Australia
                  wide.
                </p>
              </li>
              <li>
                <h2>Hours</h2>
                <p>{BUSINESS.hours}</p>
              </li>
            </ul>
          </div>

          <div>
            <div className="split-media">
              {/* Points at the actual service base. The old embed was centred on
                  the whole of Australia at continent zoom and still carried the
                  original developer's locale parameter. */}
              <iframe
                title={`Map showing the ${BUSINESS.name} service base in ${locality} ${region} ${postcode}`}
                src={`https://www.google.com/maps?q=${locality}+${region}+${postcode}+Australia&output=embed`}
                width="100%"
                height="340"
                style={{ border: 0, display: 'block' }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <p className="form-note">
              We are a mobile operation, so the workshop is a base rather than a showroom. For a
              job, tell us where the vehicles are and we come to them.
            </p>
          </div>
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
    </>
  );
}
