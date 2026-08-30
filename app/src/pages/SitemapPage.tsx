import { Link } from 'react-router-dom';
import PageMeta from '../components/PageMeta';
import { SERVICES } from '../data/services';
import { AREAS, AREAS_BY_REGION, areaPath } from '../data/areas';
import { SITE_ORIGIN, BUSINESS } from '../lib/site';

/**
 * HTML sitemap.
 *
 * Distinct from /sitemap.xml, which the build writes for crawlers. This one is
 * for people and for internal linking: every page on the site reachable in one
 * click, grouped, with the suburb pages carrying the keyword that suburb
 * actually gets searched with.
 *
 * Every link here points at a route that exists. The route table is the source
 * of truth for both this page and the pre-renderer, and the build fails if a
 * rendered canonical does not match its own path — so a link on this page
 * cannot silently become a 404.
 */

const MAIN = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/service-areas', label: 'Service Areas' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/about', label: 'About' },
  { to: '/quote', label: 'Get a Quote' },
  { to: '/contact', label: 'Contact' },
  { to: '/privacy', label: 'Privacy' },
];

export default function SitemapPage() {
  const total = MAIN.length + SERVICES.length + AREAS.length + 1;

  return (
    <>
      <PageMeta
        title={`Sitemap | Every Service & Suburb | ${BUSINESS.name}`}
        description={`Every page on ${BUSINESS.name}: overspray, cement splatter, graffiti, industrial fallout and roadwork contamination removal, plus every Melbourne suburb we service.`}
        path="/sitemap"
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Sitemap',
            url: `${SITE_ORIGIN}/sitemap`,
            isPartOf: { '@id': `${SITE_ORIGIN}/#business` },
          },
        ]}
      />

      <section className="pbanner carbon">
        <div className="shell">
          <p className="crumb">
            <Link to="/">Home</Link> / <span>Sitemap</span>
          </p>
          <h1 className="display">Sitemap</h1>
          <p className="lede">
            Every page on the site — {total} in total. Services, and the Melbourne suburbs we
            service, each with what actually causes the damage there.
          </p>
        </div>
      </section>

      <section>
        <div className="shell smap">
          <div className="smap-group">
            <h2 className="display">Main pages</h2>
            <ul className="smap-list">
              {MAIN.map((m) => (
                <li key={m.to}>
                  <Link to={m.to}>{m.label}</Link>
                </li>
              ))}
              <li>
                <Link to="/sitemap">Sitemap</Link>
              </li>
            </ul>
          </div>

          <div className="smap-group">
            <h2 className="display">Services</h2>
            <ul className="smap-list">
              {SERVICES.map((s) => (
                <li key={s.path}>
                  <Link to={s.path}>{s.nav}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="shell">
          <div className="head">
            <p className="eyebrow">Service areas</p>
            <h2 className="display">Overspray removal by suburb</h2>
            <p className="body-muted">
              {AREAS.length} suburbs across Melbourne. Each page covers the local source of the
              work — the freight terminal, refinery, quarry, rail corridor or estate mid-build that
              puts contamination on cars in that postcode.
            </p>
          </div>

          <div className="smap-areas">
            {AREAS_BY_REGION.map(({ region, areas }) => (
              <div className="smap-group" key={region}>
                <h3 className="smap-region">
                  {region}
                  <span>{areas.length}</span>
                </h3>
                <ul className="smap-list">
                  {areas.map((a) => (
                    <li key={a.slug}>
                      <Link to={areaPath(a)}>
                        Overspray Removal {a.name}
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

      <section>
        <div className="shell cta-panel">
          <div>
            <h2 className="display">Not on the list?</h2>
            <p className="body-muted">
              These are the suburbs we are called to most. We work Australia wide — if your suburb
              is not here, it does not mean we do not come to it.
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
