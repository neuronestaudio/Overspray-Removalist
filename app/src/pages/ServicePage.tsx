import { Link } from 'react-router-dom';
import PageMeta from '../components/PageMeta';
import Img from '../components/Img';
import { serviceBySlug, SERVICES } from '../data/services';
import { SITE_ORIGIN, BUSINESS } from '../lib/site';

export default function ServicePage({ slug }: { slug: string }) {
  const s = serviceBySlug(slug);
  const others = SERVICES.filter((o) => o.slug !== slug);

  return (
    <>
      <PageMeta
        title={`${s.title} | ${BUSINESS.name}`}
        description={s.description}
        path={s.path}
        ogImage={s.hero}
        ogAlt={s.heroAlt}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: s.nav,
            description: s.description,
            url: `${SITE_ORIGIN}${s.path}`,
            provider: { '@id': `${SITE_ORIGIN}/#business` },
            areaServed: { '@type': 'Country', name: 'Australia' },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
              { '@type': 'ListItem', position: 2, name: 'Services', item: `${SITE_ORIGIN}/services` },
              { '@type': 'ListItem', position: 3, name: s.nav, item: `${SITE_ORIGIN}${s.path}` },
            ],
          },
        ]}
      />

      <section className="pbanner">
        <div className="shell">
          <p className="crumb">
            <Link to="/">Home</Link> / <Link to="/services">Services</Link> / <span>{s.nav}</span>
          </p>
          <h1 className="display">{s.h1}</h1>
          <p className="lede">{s.lede}</p>
        </div>
      </section>

      <section>
        <div className="shell split">
          <div className="prose">
            {s.blocks.map((b) => (
              <div key={b.heading}>
                <h2 className="display">{b.heading}</h2>
                {b.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
                {b.bullets && (
                  <ul>
                    {b.bullets.map((li) => (
                      <li key={li}>{li}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
          <div className="split-media">
            <Img stem={s.hero} alt={s.heroAlt} sizes="(max-width:860px) 100vw, 560px" />
          </div>
        </div>
      </section>

      {s.pair && (
        <section className="band">
          <div className="shell">
            <h2 className="display">Same vehicle, both frames</h2>
            <div className="pair">
              <figure>
                <Img stem={s.pair.before} alt={s.pair.altBefore} sizes="(max-width:860px) 100vw, 50vw" />
                <figcaption>Before</figcaption>
              </figure>
              <figure>
                <Img stem={s.pair.after} alt={s.pair.altAfter} sizes="(max-width:860px) 100vw, 50vw" />
                <figcaption>After</figcaption>
              </figure>
            </div>
            <p className="body-muted">{s.pair.caption}</p>
          </div>
        </section>
      )}

      <section>
        <div className="shell">
          <h2 className="display">Other services</h2>
          <ul className="who">
            {others.map((o) => (
              <li key={o.path}>
                <Link to={o.path}>{o.nav}</Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="band">
        <div className="shell cta-panel">
          <div>
            <h2 className="display">Send photos, get a price</h2>
            <p className="body-muted">
              Photos tell us the fallout type and how hard it has bonded. That is usually enough to
              quote. Heavy or full-coverage jobs get sighted first.
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
