import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import PageMeta from '../components/PageMeta';
import Img from '../components/Img';
import Coverflow from '../components/Coverflow';
import ScrubHero from '../components/ScrubHero';
import BeforeAfter from '../components/BeforeAfter';
import PhotoRail from '../components/PhotoRail';
import { SERVICES } from '../data/services';
import { GALLERY } from '../data/gallery';
import { HERO_PAIR, PAIRS } from '../data/pairs';
import { BUSINESS } from '../lib/site';
import { pushGtmEvent } from '../lib/gtm';

/* All five jobs ride the hero deck: the visitor picks their own problem off it
   before reading a word. */
const DECK = [HERO_PAIR, ...PAIRS];

export default function HomePage() {
  /* Wiping the panel clean is the strongest engagement signal on the page and
     costs nothing to measure. An interaction, not a conversion. */
  const onScrubbed = useCallback(() => {
    pushGtmEvent('service_wipe_complete', { page_path: '/' });
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

      {/* Hero: five real jobs on an infinite deck. Find yours, then read on. */}
      <section className="hero-deck">
        <div className="shell">
          <div className="hero-deck-copy">
            <p className="eyebrow">Overspray &amp; industrial fallout specialists</p>
            <h1 className="display">
              We take the paint off.
              <br />
              <span className="hl">Not your paint.</span>
            </h1>
            <p className="lede">
              Thirty years, no abrasives, no respray. Whatever landed on yours, one of these is
              close enough.
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

          <Coverflow items={DECK} />
        </div>
      </section>

      {/* Services, demonstrated. The claim is made by hand before it is made in
          prose: wipe the panel and the service explains itself. */}
      <section className="band">
        <div className="shell">
          <div className="head">
            <p className="eyebrow">What we take off</p>
            <h2 className="display">Wipe it off yourself.</h2>
            <p className="lede">
              Epoxy, urethane, polyurethane foam, soot, iron filings, cement, concrete sealers and
              spray paint. Off vehicles, trucks, boats, aircraft and buildings, by hand, with no
              abrasives touching the duco.
            </p>
          </div>

          <div className="wipe-frame">
            <ScrubHero pair={HERO_PAIR} onComplete={onScrubbed} />
          </div>
          <p className="wipe-caption">{HERO_PAIR.caption}</p>

          <div className="bento" style={{ marginTop: 'clamp(2rem,4vw,3rem)' }}>
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

      {/* Browsing the deck shows the damage. This shows the transformation. */}
      <section>
        <div className="shell">
          <div className="head">
            <h2 className="display">Pick a car. Drag the handle.</h2>
            <p className="lede">
              Every pair is the same vehicle photographed before and after, with no respray and no
              panel work in between.
            </p>
          </div>
          <BeforeAfter pairs={PAIRS} />
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
