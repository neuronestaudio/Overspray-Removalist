import { Link } from 'react-router-dom';
import PageMeta from '../components/PageMeta';
import ScrollTitle from '../components/ScrollTitle';
import AustraliaMap from '../components/AustraliaMap';
import { AREAS, AREAS_BY_REGION, areaPath } from '../data/areas';
import { CITIES, CITIES_BY_STATE, cityPath } from '../data/cities';
import { SITE_ORIGIN, BUSINESS } from '../lib/site';

/**
 * Where we work. The hub.
 *
 * Distinct from /sitemap, which lists every page on the site for completeness.
 * This one is a landing page in its own right: it ranks for the "do you cover
 * me" search, and it is the page to link from an ad or an email rather than
 * sending someone to a sitemap.
 *
 * The country comes first and Melbourne second, on purpose. A visitor from
 * another state who finds the site through its Australia-wide titles should
 * see their city before they see sixty-one suburbs of somewhere else.
 */
export default function ServiceAreasPage() {
  return (
    <>
      <PageMeta
        title={`Where We Work | Australia Wide, Workshop in Epping VIC | ${BUSINESS.name}`}
        description={`Overspray, cement splatter and industrial fallout removal Australia wide: ${CITIES.length} cities across every state, plus ${AREAS.length} Melbourne suburbs around the ${BUSINESS.address.locality} workshop. Fleet, site and insurance work assessed on location.`}
        path="/service-areas"
        ogImage="job-tarago-before"
        ogAlt="Vehicle covered in paint overspray before restoration"
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Where we work',
            url: `${SITE_ORIGIN}/service-areas`,
            isPartOf: { '@id': `${SITE_ORIGIN}/#business` },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Where we work',
                item: `${SITE_ORIGIN}/service-areas`,
              },
            ],
          },
        ]}
      />

      <section className="pbanner carbon">
        <div className="shell">
          <p className="crumb">
            <Link to="/">Home</Link> / <span>Where we work</span>
          </p>
          <h1 className="display">Where we work</h1>
          <p className="lede">
            Australia wide, from a workshop in {BUSINESS.address.locality} VIC. {CITIES.length} cities
            across every state, each with its own page on what actually causes the damage there, and{' '}
            {AREAS.length} Melbourne suburbs on home ground.
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

      <section>
        <div className="shell split">
          <div>
            <ScrollTitle className="head">
              <p className="eyebrow">How it works</p>
              <h2 className="display">
                Single vehicles come to us.
                <br />
                <span className="hl">Whole sites, we come to you.</span>
              </h2>
              <p className="lede">
                When a fallout event hits a car park, a compound or a dealer yard, every vehicle in
                it is affected at once. We assess the lot where it sits and price it as one job, in
                any state, travel included. A single vehicle comes to the {BUSINESS.address.locality}{' '}
                workshop.
              </p>
            </ScrollTitle>
          </div>
          <div className="wwm-map">
            <AustraliaMap />
          </div>
        </div>
      </section>

      <section className="band">
        <div className="shell">
          <ScrollTitle className="head">
            <p className="eyebrow">Australia wide</p>
            <h2 className="display">By state</h2>
            <p className="lede">
              Capitals first, then the industrial towns where fallout is the weather and the fleets
              live.
            </p>
          </ScrollTitle>

          <div className="sa-regions">
            {CITIES_BY_STATE.map(({ state, label, cities }) => (
              <div className="sa-region beam" key={state}>
                <span className="beam-rim" aria-hidden="true" />
                <h3 className="sa-h">
                  {label}
                  <span>{cities.length}</span>
                </h3>
                <ul className="sa-list">
                  {cities.map((c) => (
                    <li key={c.slug}>
                      <Link to={cityPath(c)}>
                        <strong>{c.name}</strong>
                        <em>{c.capital ? 'Capital' : c.state}</em>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="shell">
          <ScrollTitle className="head">
            <p className="eyebrow">Home ground</p>
            <h2 className="display">Melbourne, by region</h2>
            <p className="lede">
              The workshop is in {BUSINESS.address.locality}. These are the suburbs we are called to
              most, each with its own page on the freight terminal, refinery, quarry, rail corridor
              or estate mid-build that puts contamination on cars there.
            </p>
          </ScrollTitle>

          <div className="sa-regions">
            {AREAS_BY_REGION.map(({ region, areas }) => (
              <div className="sa-region beam" key={region}>
                <span className="beam-rim" aria-hidden="true" />
                <h3 className="sa-h">
                  {region}
                  <span>{areas.length}</span>
                </h3>
                <ul className="sa-list">
                  {areas.map((a) => (
                    <li key={a.slug}>
                      <Link to={areaPath(a)}>
                        <strong>{a.name}</strong>
                        <em>{a.postcode}</em>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="band">
        <div className="shell cta-panel">
          <div>
            <h2 className="display">Not on the list?</h2>
            <p className="body-muted">
              These are the places we are called to most. If yours is not here it does not mean we
              cannot help &mdash; send photos and the postcode and we will tell you either way.
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
