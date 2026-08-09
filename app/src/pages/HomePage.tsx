import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import PageMeta from '../components/PageMeta';
import Img from '../components/Img';
import ScrubHero from '../components/ScrubHero';
import BeforeAfter from '../components/BeforeAfter';
import PhotoRail from '../components/PhotoRail';
import { SERVICES } from '../data/services';
import { GALLERY } from '../data/gallery';
import { HERO_PAIR, PAIRS } from '../data/pairs';
import { BUSINESS } from '../lib/site';
import { pushGtmEvent } from '../lib/gtm';

export default function HomePage() {
  /* Wiping the hero clean is the strongest engagement signal on the page and
     costs nothing to measure. Not a conversion, just an interaction. */
  const onScrubbed = useCallback(() => {
    pushGtmEvent('hero_scrub_complete', { page_path: '/' });
  }, []);

  return (
    <>
      <PageMeta
        title={`Overspray Removal Australia | Paint, Cement & Fallout | ${BUSINESS.name}`}
        description={`Specialist paint overspray, cement splatter, graffiti and industrial fallout removal from vehicles, fleets and property. Over 30 years, non-abrasive, Australia wide. Call ${BUSINESS.phone}.`}
        path="/"
        ogImage="job-tarago-before"
        ogAlt="Vehicle covered in paint overspray, restored without respraying"
      />

      {/* The claim is made by hand before it is made in words. */}
      <section className="scrub-hero">
        <ScrubHero pair={HERO_PAIR} onComplete={onScrubbed} />

        <div className="shell hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">Overspray &amp; industrial fallout specialists</p>
            <h1 className="display">
              We take the paint off.
              <br />
              <span className="hl">Not your paint.</span>
            </h1>
            <p className="lede">
              Thirty years, no abrasives, no respray. Wipe the panel above and see what comes back.
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

      {/* Four more vehicles, four different contaminants. The point is breadth:
          whatever landed on yours, one of these is close enough. */}
      <section className="band">
        <div className="shell">
          <div className="proof-head">
            <div className="head" style={{ marginBottom: 0 }}>
              <p className="eyebrow">Real jobs, real vehicles</p>
              <h2 className="display">Pick a car. Drag the handle.</h2>
              <p className="lede">
                Paint, industrial fallout, graffiti. Every pair is the same vehicle photographed
                before and after, with no respray and no panel work in between.
              </p>
            </div>
          </div>

          <BeforeAfter pairs={PAIRS} />
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

      <section style={{ paddingBottom: 'clamp(3rem,6vw,5rem)' }}>
        <div className="shell">
          <div className="head">
            <h2 className="display">Off the tools</h2>
            <p className="lede">
              Vehicles restored and released.{' '}
              <Link to="/gallery" style={{ color: 'var(--accent-hot)', fontWeight: 700 }}>
                See the full gallery
              </Link>
            </p>
          </div>
        </div>
        <PhotoRail items={GALLERY.slice(0, 13)} duration={70} />
        <div style={{ height: '1rem' }} />
        <PhotoRail items={GALLERY.slice(13)} duration={84} reverse />
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
