import { Link } from 'react-router-dom';
import PageMeta from '../components/PageMeta';
import Img from '../components/Img';
import { SERVICES } from '../data/services';
import { BUSINESS } from '../lib/site';

export default function HomePage() {
  return (
    <>
      <PageMeta
        title={`Overspray Removal Australia | Paint, Cement & Fallout | ${BUSINESS.name}`}
        description={`Specialist paint overspray, cement splatter, graffiti and industrial fallout removal from vehicles, fleets and property. Over 30 years, non-abrasive, Australia wide. Call ${BUSINESS.phone}.`}
        path="/"
        ogImage="job-splatter-2"
        ogAlt="Black sedan covered in orange paint overspray being restored"
      />

      <section className="hero">
        <div className="hero-media">
          <Img stem="job-splatter-2" alt="Black sedan covered in orange paint overspray being pressure rinsed by a technician" sizes="100vw" priority />
        </div>
        <div className="shell hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">Overspray &amp; industrial fallout specialists</p>
            <h1 className="display">
              We take the paint off.
              <br />
              <span className="hl">Not your paint.</span>
            </h1>
            <p className="lede">
              Australia's only specialist in overspray and fallout removal. Thirty years, no
              abrasives, no respray, factory finish intact.
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
        </div>
      </section>

      <section className="stats">
        <div className="shell">
          <div className="stat">
            <div className="stat-n">30+</div>
            <div className="stat-l">Years removing overspray</div>
          </div>
          <div className="stat">
            <div className="stat-n">Australia</div>
            <div className="stat-l">Wide, all suburbs, on site</div>
          </div>
          <div className="stat">
            <div className="stat-n">Zero</div>
            <div className="stat-l">Abrasives, sanding or respray</div>
          </div>
          <div className="stat">
            <div className="stat-n">Fleet</div>
            <div className="stat-l">Volume pricing for whole lots</div>
          </div>
        </div>
      </section>

      <section>
        <div className="shell">
          <div className="head">
            <h2 className="display">What we take off</h2>
            <p className="lede">
              Epoxy, urethane, polyurethane foam, soot, iron filings, cement, concrete sealers and
              spray paint. Off vehicles, trucks, boats, aircraft and buildings.
            </p>
          </div>
          <div className="bento">
            {SERVICES.map((s) => (
              <Link className="cell" key={s.path} to={s.path}>
                <div className="cell-img">
                  <Img stem={s.hero} alt={s.heroAlt} sizes="(max-width:620px) 100vw, 33vw" />
                </div>
                <h3 className="display">{s.nav}</h3>
                <p>{s.lede}</p>
                <span className="cell-link">Read more</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="band">
        <div className="shell cta-panel">
          <div>
            <h2 className="display">Got a car covered in something that should not be there?</h2>
            <p className="body-muted">
              Send us photos and the location. If a whole lot of vehicles is affected in one place,
              tell us how many and we will price the lot.
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
