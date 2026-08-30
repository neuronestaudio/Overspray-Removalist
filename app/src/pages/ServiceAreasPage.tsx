import { Link } from 'react-router-dom';
import PageMeta from '../components/PageMeta';
import ScrollTitle from '../components/ScrollTitle';
import { AREAS, AREAS_BY_REGION, areaPath } from '../data/areas';
import { SITE_ORIGIN, BUSINESS } from '../lib/site';

/**
 * The service-area hub.
 *
 * Distinct from /sitemap, which lists every page on the site for completeness.
 * This one is a landing page in its own right: it ranks for the "do you cover
 * my suburb" search, and it is the page to link from an ad or an email rather
 * than sending someone to a sitemap.
 */
export default function ServiceAreasPage() {
  return (
    <>
      <PageMeta
        title={`Service Areas | ${AREAS.length} Melbourne Suburbs | ${BUSINESS.name}`}
        description={`Overspray, cement splatter and industrial fallout removal across ${AREAS.length} Melbourne suburbs, north to south-east. Workshop in ${BUSINESS.address.locality}.`}
        path="/service-areas"
        ogImage="job-tarago-before"
        ogAlt="Vehicle covered in paint overspray before restoration"
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Service areas',
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
                name: 'Service areas',
                item: `${SITE_ORIGIN}/service-areas`,
              },
            ],
          },
        ]}
      />

      <section className="pbanner carbon">
        <div className="shell">
          <p className="crumb">
            <Link to="/">Home</Link> / <span>Service areas</span>
          </p>
          <h1 className="display">Service areas</h1>
          <p className="lede">
            {AREAS.length} Melbourne suburbs, north to south-east. Every one has its own page
            covering what actually causes the damage there &mdash; the freight terminal, the
            refinery, the quarry, the rail corridor or the estate mid-build.
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
        <div className="shell">
          <ScrollTitle className="head">
            <p className="eyebrow">Where the work comes from</p>
            <h2 className="display">Melbourne, by region</h2>
            <p className="lede">
              The workshop is in {BUSINESS.address.locality}. Single vehicles are brought to us.
              Where a fallout event hits a whole car park, compound or dealer yard, we come and
              assess the lot on location.
            </p>
          </ScrollTitle>

          <div className="sa-regions">
            {AREAS_BY_REGION.map(({ region, areas }) => (
              <div className="sa-region beam" key={region}>
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
              These are the suburbs we are called to most. If yours is not here it does not mean we
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
