import { Link } from 'react-router-dom';
import PageMeta from '../components/PageMeta';
import Img from '../components/Img';
import BeforeAfter from '../components/BeforeAfter';
import { cityBySlug, CITIES, CAPITALS, cityPath, STATE_NAMES, type City } from '../data/cities';
import { AREAS } from '../data/areas';
import { serviceBySlug } from '../data/services';
import { PAIRS } from '../data/pairs';
import { GALLERY } from '../data/gallery';
import { SITE_ORIGIN, BUSINESS } from '../lib/site';

/**
 * One city, one page. The national counterpart of AreaPage.
 *
 * The page never claims a local workshop. It says how the work actually
 * reaches a city: fleet, site and insurance jobs are assessed where they sit,
 * and a single vehicle is told straight whether the trip to Epping is worth it.
 */

/* The same four steps on every city page. The order is the order a job runs. */
const INTERSTATE_STEPS = [
  { n: '01', h: 'Send photos and the postcode', p: 'The photos tell us the contamination type and how hard it has bonded. Most jobs are priced from them alone.' },
  { n: '02', h: 'We price the lot', p: 'One number for the site, travel included. A car park, a compound or a dealer yard is one job, not a car-by-car quote.' },
  { n: '03', h: 'We come to the site', p: 'Whole sites are worked where they sit. A single vehicle: we tell you straight whether it is worth bringing to the Epping workshop.' },
  { n: '04', h: 'Claims paperwork handled', p: 'Assessment, authorisation and release forms, direct with the insurer or the party responsible.' },
];

/** Same state first, then the other capitals. Six is enough to link sideways. */
function nearby(city: City): City[] {
  const sameState = CITIES.filter((c) => c.slug !== city.slug && c.state === city.state);
  const capitals = CAPITALS.filter((c) => c.slug !== city.slug && c.state !== city.state);
  return [...sameState, ...capitals].slice(0, 6);
}

/* A different job photo per city, after the suburbs have taken theirs. Deterministic
   on purpose: these pages are pre-rendered. */
function photoFor(slug: string) {
  const i = CITIES.findIndex((c) => c.slug === slug);
  return GALLERY[(AREAS.length + (i < 0 ? 0 : i)) % GALLERY.length];
}

export default function CityPage({ slug }: { slug: string }) {
  const city = cityBySlug(slug);
  const leads = city.leads.map(serviceBySlug);
  const others = nearby(city);
  const photo = photoFor(slug);
  const stateName = STATE_NAMES[city.state];

  const title = `Overspray Removal ${city.name} | Fleet, Site & Claims | ${BUSINESS.name}`;
  const description =
    `Paint overspray, cement splatter and industrial fallout removal in ${city.name}, ${city.state}. ` +
    `Australia's overspray specialists for 30 years. Fleet, site and insurance work assessed on location; workshop in Epping VIC.`;

  return (
    <>
      <PageMeta
        title={title}
        description={description}
        path={cityPath(city)}
        ogImage={photo.stem}
        ogAlt={photo.alt}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: `Overspray removal in ${city.name}`,
            description,
            url: `${SITE_ORIGIN}${cityPath(city)}`,
            provider: { '@id': `${SITE_ORIGIN}/#business` },
            areaServed: {
              '@type': 'City',
              name: `${city.name}, ${stateName}`,
              address: {
                '@type': 'PostalAddress',
                addressLocality: city.name,
                addressRegion: city.state,
                addressCountry: 'AU',
              },
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
              { '@type': 'ListItem', position: 2, name: 'Where we work', item: `${SITE_ORIGIN}/service-areas` },
              { '@type': 'ListItem', position: 3, name: city.name, item: `${SITE_ORIGIN}${cityPath(city)}` },
            ],
          },
        ]}
      />

      <section className="pbanner carbon">
        <div className="shell">
          <p className="crumb">
            <Link to="/">Home</Link> / <Link to="/service-areas">Where we work</Link> /{' '}
            <span>{city.name}</span>
          </p>
          <h1 className="display">Overspray removal in {city.name}</h1>
          <p className="lede">
            Paint overspray, cement splatter and industrial fallout taken off vehicles in {city.name}{' '}
            and across {stateName} &mdash; by hand, without abrasives, without respraying.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary btn-lg" to="/quote">
              Get a quote
            </Link>
            <a className="btn btn-ghost btn-lg" href={BUSINESS.phoneHref}>
              Call {BUSINESS.phone}
            </a>
          </div>
        </div>
      </section>

      {/* The local paragraph is the reason this page exists. */}
      <section>
        <div className="shell split">
          <div>
            <p className="eyebrow">Why it happens here</p>
            <h2 className="display">What causes it in {city.name}</h2>
            <p>{city.local}</p>
            <p className="body-muted">
              {city.state === 'VIC'
                ? `Bring a single vehicle to our Epping workshop, or if a whole car park or yard in ${city.name} is affected, tell us how many and we will come and assess it.`
                : `Fleet, site and insurance work in ${city.name} is assessed where it sits. Send the photos and the postcode, we price the lot with travel included, and we come to the site. A single vehicle: send the photos anyway and we will tell you straight whether it is worth the trip to our Epping workshop.`}
            </p>
          </div>
          <div className="split-media">
            <Img stem={photo.stem} alt={photo.alt} sizes="(max-width:860px) 100vw, 50vw" />
          </div>
        </div>
      </section>

      <section className="band">
        <div className="shell">
          <div className="head">
            <p className="eyebrow">Interstate</p>
            <h2 className="display">How a {city.name} job runs</h2>
          </div>
          <div className="steprail">
            {INTERSTATE_STEPS.map((s) => (
              <div className="step" key={s.n}>
                <div className="step-dot">{s.n}</div>
                <h3>{s.h}</h3>
                <p>{s.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="shell">
          <div className="head">
            <p className="eyebrow">In {city.name}</p>
            <h2 className="display">What we are usually called out for</h2>
          </div>
          <div className="bento">
            {leads.map((s) => (
              <Link className="cell" key={s.path} to={s.path}>
                <div className="cell-img">
                  <Img stem={s.hero} alt={s.heroAlt} sizes="(max-width:620px) 100vw, 33vw" />
                </div>
                <h3 className="display">{s.nav}</h3>
                <p>{s.lede}</p>
                <span className="cell-link">
                  Read more<span aria-hidden="true"> →</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="band">
        <div className="shell">
          <div className="head">
            <p className="eyebrow">Real jobs</p>
            <h2 className="display">Drag the handle</h2>
          </div>
          <BeforeAfter pairs={PAIRS} />
        </div>
      </section>

      <section>
        <div className="shell">
          <h2 className="display">Also servicing</h2>
          <ul className="who">
            {others.map((o) => (
              <li key={o.slug}>
                <Link to={cityPath(o)}>
                  {o.name} <span className="muted-inline">{o.state}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="body-muted" style={{ marginTop: '1rem' }}>
            <Link to="/service-areas">See everywhere we work</Link>
          </p>
        </div>
      </section>

      <section className="band">
        <div className="shell cta-panel">
          <div>
            <h2 className="display">Something on your paint in {city.name}?</h2>
            <p className="body-muted">
              Send photos and the postcode. They tell us the contamination type and how hard it has
              bonded, which is usually enough to price the job without seeing it.
            </p>
          </div>
          <div className="cta-side">
            <Link className="btn btn-primary btn-lg" to="/quote">
              Get a quote
            </Link>
            <a className="btn btn-ghost btn-lg" href={BUSINESS.phoneHref}>
              Call {BUSINESS.phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
