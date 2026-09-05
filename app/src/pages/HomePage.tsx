import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import PageMeta from '../components/PageMeta';
import Coverflow from '../components/Coverflow';
import ScrubHero from '../components/ScrubHero';
import WipeVehicle from '../components/WipeVehicle';
import BeforeAfter from '../components/BeforeAfter';
import PhotoRail from '../components/PhotoRail';
import ReviewRail from '../components/ReviewRail';
import WordParallax from '../components/WordParallax';
import ScrollTitle from '../components/ScrollTitle';
import Stats from '../components/Stats';
import QuoteForm from '../components/QuoteForm';
import { GALLERY } from '../data/gallery';
import { HERO_PAIR, PAIRS, DECK } from '../data/pairs';
import { BUSINESS } from '../lib/site';
import { pushGtmEvent } from '../lib/gtm';

export default function HomePage() {
  /* Wiping the panel clean is the strongest engagement signal on the page and
     costs nothing to measure. An interaction, not a conversion. */
  const onScrubbed = useCallback(() => {
    pushGtmEvent('service_wipe_complete', { page_path: '/' });
  }, []);

  /* The 3D panel is an upgrade, not a dependency. It reports whether it managed
     to start, and the 2D photo wipe underneath stays mounted until it does, so
     no WebGL, reduced motion or a model that never arrives all still leave a
     working demonstration rather than a hole in the page. */
  const [threeUp, setThreeUp] = useState(false);

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
            {/* Tenure and territory above the name; the script line below it
                carries the positioning. Small caps here and a heavier caps
                statement under the script, with the script between them so the
                two capitalised lines never sit against each other. */}
            {/* Name first, then tenure, then the script line. Three items,
                each a different weight and treatment, so nothing competes. */}
            <h1 className="display hero-shine">The Overspray Removalists</h1>
            <p className="hero-eyebrow">Servicing Melbourne for 30+ years</p>
            {/* Removal is the pitch. Coating and film are done on request, not
                advertised, so the hero says what the business is known for and
                nothing else. */}
            <p className="hero-claim">We&rsquo;ll take anything off your paint.</p>
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

      {/* Straight under the hero. The deck shows damage; this names what the
          damage is before the page asks anyone to read anything. */}
      <WordParallax stem="texture-wide" />

      {/* Then the transformation. */}
      <section>
        <div className="shell">
          <ScrollTitle className="head beam">
            <h2 className="display">
              Let the results
              <br />
              <span className="hl">speak for itself.</span>
            </h2>
            <p className="lede">
              Pick any job and drag the handle. Every pair is the same vehicle photographed before
              and after, with no respray and no panel work in between.
            </p>
          </ScrollTitle>
          <BeforeAfter pairs={PAIRS} />
        </div>
      </section>

      <Stats />

      <section className="mesh-band" style={{ paddingBottom: 'clamp(3rem,6vw,5rem)' }}>
        <div className="shell">
          <ScrollTitle className="head">
            <h2 className="display">Our gallery</h2>
            <p className="gal-sub">Servicing Melbourne for over 30 years</p>
            <p className="lede">
              Vehicles restored and released.{' '}
              <Link to="/gallery" style={{ color: 'var(--accent-hot)', fontWeight: 700 }}>
                See the full gallery
              </Link>
            </p>
          </ScrollTitle>
        </div>
        <PhotoRail items={GALLERY.slice(0, 13)} duration={70} />
        <div style={{ height: '1rem' }} />
        <PhotoRail items={GALLERY.slice(13)} duration={84} reverse />
      </section>

      <section>
        <div className="shell">
          <ScrollTitle className="head">
            {/* Not "what people say". There are no reviews to show — the rail
                carries sourced capability claims until real ones exist. */}
            <p className="eyebrow">The record</p>
            <h2 className="display">Thirty years. Nothing resprayed.</h2>
          </ScrollTitle>
        </div>
        <ReviewRail />
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
            {!threeUp && <ScrubHero pair={HERO_PAIR} onComplete={onScrubbed} />}
            <WipeVehicle onClean={onScrubbed} onReady={setThreeUp} />
          </div>
          <p className="wipe-caption">
            {threeUp
              ? 'A Hilux under industrial fallout. Wipe it down and watch the duco come back.'
              : HERO_PAIR.caption}
          </p>

        </div>
      </section>

      {/* The real wizard, not a button that goes and finds it. Every other
          section on this page ends by asking someone to travel to /quote;
          this one just is /quote. */}
      <section className="home-quote">
        <div className="shell">
          <ScrollTitle className="head">
            <p className="eyebrow">Get a quote</p>
            <h2 className="display">
              Got a car covered in something
              <br />
              <span className="hl">that should not be there?</span>
            </h2>
            <p className="lede">
              Five quick questions and a couple of photos. If a whole lot of vehicles is affected in
              one place, tell us how many and we will price the lot. Prefer to talk?{' '}
              <a href={BUSINESS.phoneHref} style={{ color: 'var(--accent-hot)', fontWeight: 700 }}>
                Call {BUSINESS.phone}
              </a>
            </p>
          </ScrollTitle>

          <div className="home-quote-form">
            <QuoteForm />
          </div>
        </div>
      </section>
    </>
  );
}
