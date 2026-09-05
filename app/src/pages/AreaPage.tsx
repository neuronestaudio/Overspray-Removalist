import { Link } from 'react-router-dom';
import PageMeta from '../components/PageMeta';
import Img from '../components/Img';
import BeforeAfter from '../components/BeforeAfter';
import { areaBySlug, AREAS, areaPath, type Area } from '../data/areas';
import { serviceBySlug } from '../data/services';
import { PAIRS } from '../data/pairs';
import { GALLERY } from '../data/gallery';
import { SITE_ORIGIN, BUSINESS } from '../lib/site';

/** Same region first, then nearest by road. Six is enough to link sideways. */
function nearby(area: Area): Area[] {
  return AREAS.filter((a) => a.slug !== area.slug)
    .sort((a, b) => {
      const sameA = a.region === area.region ? 0 : 1;
      const sameB = b.region === area.region ? 0 : 1;
      if (sameA !== sameB) return sameA - sameB;
      return Math.abs(a.kmFromBase - area.kmFromBase) - Math.abs(b.kmFromBase - area.kmFromBase);
    })
    .slice(0, 6);
}

/**
 * A different job photo per suburb.
 *
 * Every one of these pages used to carry the same shot of the white Tarago —
 * one van, sixty-one pages. There are sixty-one gallery photos, so indexing by
 * the suburb's own position gives each page its own vehicle with no repeats.
 *
 * Deterministic on purpose: these pages are pre-rendered, so anything random
 * would change between the build and a re-build and churn the diff for nothing.
 */
function photoFor(slug: string) {
  const i = AREAS.findIndex((a) => a.slug === slug);
  return GALLERY[(i < 0 ? 0 : i) % GALLERY.length];
}

export default function AreaPage({ slug }: { slug: string }) {
  const area = areaBySlug(slug);
  const leads = area.leads.map(serviceBySlug);
  const others = nearby(area);
  const isBase = area.kmFromBase === 0;
  const photo = photoFor(slug);

  const title = `Overspray Removal ${area.name} | Paint, Cement & Fallout | ${BUSINESS.name}`;
  const description =
    `Overspray, cement splatter and industrial fallout removal in ${area.name} ${area.postcode}. ` +
    `Removed by hand without abrasives or respraying. Workshop in Epping, serving ${area.name} and greater Melbourne.`;

  return (
    <>
      <PageMeta
        title={title}
        description={description}
        path={areaPath(area)}
        ogImage={photo.stem}
        ogAlt={photo.alt}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: `Overspray removal in ${area.name}`,
            description,
            url: `${SITE_ORIGIN}${areaPath(area)}`,
            provider: { '@id': `${SITE_ORIGIN}/#business` },
            areaServed: {
              '@type': 'Place',
              name: `${area.name} VIC ${area.postcode}`,
              address: {
                '@type': 'PostalAddress',
                addressLocality: area.name,
                addressRegion: 'VIC',
                postalCode: area.postcode,
                addressCountry: 'AU',
              },
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Paint Overspray Removal',
                item: `${SITE_ORIGIN}/overspray-removal`,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: area.name,
                item: `${SITE_ORIGIN}${areaPath(area)}`,
              },
            ],
          },
        ]}
      />

      <section className="pbanner carbon">
        <div className="shell">
          <p className="crumb">
            <Link to="/">Home</Link> / <Link to="/overspray-removal">Paint Overspray Removal</Link> /{' '}
            <span>{area.name}</span>
          </p>
          <h1 className="display">Overspray removal in {area.name}</h1>
          <p className="lede">
            Paint overspray, cement splatter and industrial fallout taken off vehicles in{' '}
            {area.name} {area.postcode} — by hand, without abrasives, without respraying.
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

      {/* The local paragraph is the reason this page exists rather than being a
          find-and-replace of the suburb name. */}
      <section>
        <div className="shell split">
          <div>
            <p className="eyebrow">Why it happens here</p>
            <h2 className="display">What causes it in {area.name}</h2>
            <p>{area.local}</p>
            <p className="body-muted">
              {isBase
                ? `Our workshop is in ${area.name}, so we can usually get to a ${area.name} job the same week — often sooner if a whole site is affected.`
                : `${area.name} is about ${area.kmFromBase}km from our Epping workshop. Bring the vehicle to us, or if a whole car park or yard is affected, tell us how many and we will come and assess it.`}
            </p>
          </div>
          <div className="split-media">
            <Img
              stem={photo.stem}
              alt={photo.alt}
              sizes="(max-width:860px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      <section className="band">
        <div className="shell">
          <div className="head">
            <p className="eyebrow">In {area.name}</p>
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

      <section>
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
                <Link to={areaPath(o)}>{o.name}</Link>
              </li>
            ))}
          </ul>
          <p className="body-muted" style={{ marginTop: '1rem' }}>
            <Link to="/service-areas">See every suburb we service</Link>
          </p>
        </div>
      </section>

      <section className="band">
        <div className="shell cta-panel">
          <div>
            <h2 className="display">Something on your paint in {area.name}?</h2>
            <p className="body-muted">
              Send photos. They tell us the contamination type and how hard it has bonded, which is
              usually enough to quote without seeing the car.
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
