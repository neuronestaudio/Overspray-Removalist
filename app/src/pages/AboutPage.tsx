import { Link } from 'react-router-dom';
import PageMeta from '../components/PageMeta';
import Img from '../components/Img';
import PhotoRail from '../components/PhotoRail';
import { GALLERY } from '../data/gallery';
import { SITE_ORIGIN, BUSINESS } from '../lib/site';

/* Every claim on this page is the client's own, taken from their site: thirty
   years, the only company in Australia specialising solely in this, a unique
   non-abrasive process, the contaminant list, the claims-management service,
   and the two names that answer the phone. Nothing here is invented, and the
   page is deliberately short of the things a stock about-page reaches for
   (founder portraits, staff counts, founding dates, awards) because none of
   those are on record. */

const REMOVES = [
  'Epoxy',
  'Urethane',
  'Polyurethane foam',
  'Soot',
  'Iron filings',
  'Industrial fallout',
  'Graffiti',
  'Cement',
  'Concrete sealers',
  'Concrete splatter',
  'Spray paint',
  'Acid rain etching',
];

const SURFACES = [
  { label: 'Vehicles', note: 'Cars, utes, 4WDs, fleet and dealer stock' },
  { label: 'Trucks', note: 'Prime movers, trailers, livery and plant' },
  { label: 'Boats', note: 'Hulls, superstructure and fittings' },
  { label: 'Aircraft', note: 'Airframes and fuselage panels' },
  { label: 'Buildings', note: 'Glass, cladding and painted surfaces' },
];

const STEPS = [
  { n: '01', h: 'Send photos', p: 'Photos tell us the fallout type and how hard it has bonded. Most jobs are priced from them alone.' },
  { n: '02', h: 'Site assessment', p: 'Heavy or full-coverage damage is sighted and assessed in person before we commit to a price.' },
  { n: '03', h: 'Removal by hand', p: 'Our own non-abrasive process. Duco, glass, trims, lenses, roof racks and every external accessory.' },
  { n: '04', h: 'Sign off', p: 'Vehicle inspected and released. On claim work we handle the authorisation and release forms.' },
];

export default function AboutPage() {
  return (
    <>
      <PageMeta
        title={`About | Australia's Overspray Removal Specialists | ${BUSINESS.name}`}
        description="Over 30 years specialising solely in overspray and industrial fallout removal. A unique non-abrasive process, plus full overspray claims management. Based in Epping VIC, working Australia wide."
        path="/about"
        ogImage="workshop"
        ogAlt="The Overspray Removalist workshop"
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            name: `About ${BUSINESS.name}`,
            url: `${SITE_ORIGIN}/about`,
            mainEntity: { '@id': `${SITE_ORIGIN}/#business` },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
              { '@type': 'ListItem', position: 2, name: 'About', item: `${SITE_ORIGIN}/about` },
            ],
          },
        ]}
      />

      <section className="pbanner carbon">
        <div className="shell">
          <p className="crumb">
            <Link to="/">Home</Link> / <span>About</span>
          </p>
          <h1 className="display">
            One trade.
            <br />
            <span className="hl">Done properly, for thirty years.</span>
          </h1>
          <p className="lede">
            The Overspray Removalist is Australia's overspray removal and claims management
            specialist. Not detailing with overspray on the side. Not panel work. This, and only
            this.
          </p>
        </div>
      </section>

      <section className="stats">
        <div className="shell">
          <div className="stat">
            <div className="stat-n">30+</div>
            <div className="stat-l">Years on overspray alone</div>
          </div>
          <div className="stat">
            <div className="stat-n">Only</div>
            <div className="stat-l">Australian firm specialising solely in it</div>
          </div>
          <div className="stat">
            <div className="stat-n">Zero</div>
            <div className="stat-l">Abrasives, sanding or respray</div>
          </div>
          <div className="stat">
            <div className="stat-n">5</div>
            <div className="stat-l">Surface types, from duco to airframes</div>
          </div>
        </div>
      </section>

      <section>
        <div className="shell split">
          <div className="prose">
            <h2 className="display">A process no one else has</h2>
            <p>
              We have developed a unique overspray removal process that no other company provides.
              Our non-abrasive methods, used by hand, are the safest way to remove overspray debris
              from vehicles, trucks, boats, aircraft and affected buildings.
            </p>
            <p>
              Nothing cuts, sands or polishes the surface underneath. That is the whole point: the
              contamination comes off and the factory finish stays on, which is what separates a
              restoration from a respray, and what keeps a late-model vehicle free of a repair
              history.
            </p>

            <h2 className="display">Why not just respray it</h2>
            <p>
              A respray means colour matching, blend panels and a permanent mark on the vehicle's
              record. On a late-model car, a fleet livery or anything heading back to a lease, that
              difference carries real money at resale or return. Removal keeps the original paint,
              and it keeps an insurance claim smaller than a repaint would.
            </p>
          </div>

          <div className="split-media">
            <Img
              stem="workshop"
              alt="The Overspray Removalist workshop with a vehicle under assessment"
              sizes="(max-width:860px) 100vw, 560px"
            />
          </div>
        </div>
      </section>

      <section className="band">
        <div className="shell">
          <div className="head">
            <h2 className="display">What comes off</h2>
            <p className="lede">
              Airborne emissions can travel up to five hundred metres in windy conditions. Whatever
              landed on yours, it is almost certainly on this list.
            </p>
          </div>

          <ul className="chip-grid">
            {REMOVES.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>

          <div className="head" style={{ marginTop: 'clamp(2.5rem,5vw,4rem)' }}>
            <h2 className="display">And what it comes off</h2>
          </div>
          <ul className="who">
            {SURFACES.map((s) => (
              <li key={s.label}>
                <div>
                  <h3>{s.label}</h3>
                  <p>{s.note}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <div className="shell">
          <div className="head">
            <h2 className="display">How a job runs</h2>
          </div>
          <div className="steprail">
            {STEPS.map((s) => (
              <div className="step" key={s.n}>
                <div className="step-dot">{s.n}</div>
                <h3>{s.h}</h3>
                <p>{s.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="band">
        <div className="shell split flip">
          <div className="split-media">
            <Img
              stem="job-splatter-3"
              alt="Technician rinsing overspray from the side of a black sedan"
              sizes="(max-width:860px) 100vw, 560px"
            />
          </div>
          <div className="prose">
            <h2 className="display">Claims, sites and whole lots</h2>
            <p>
              Most of our work arrives from the people who caused the damage or who carry the claim,
              not from the vehicle owner. Our biggest clients are construction companies pouring
              their slabs, where concrete splatter travels over the edge of the site onto the
              vehicles below.
            </p>
            <p>
              Alongside the removal we offer a service which includes the authorisation and release
              forms, and we handle the public relations on your behalf. On a street full of affected
              owners that part is often harder than the work itself.
            </p>
            <p>
              Where a high volume of cars is affected in one place and we can work through the lot in
              a single location, we price the lot rather than each vehicle.
            </p>
            <p>
              <Link className="btn btn-primary" to="/fleet-and-construction">
                Fleet and site work
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="shell">
          <div className="head">
            <h2 className="display">Who you will be speaking to</h2>
            <p className="lede">
              Two of us take the calls. There is no call centre and no account manager in between.
            </p>
          </div>
          <div className="people">
            <div className="person">
              <h3 className="display">{BUSINESS.phoneContact}</h3>
              <p className="body-muted">Quotes, site assessments and claim paperwork.</p>
              <a className="btn btn-ghost" href={BUSINESS.phoneHref}>
                {BUSINESS.phone}
              </a>
            </div>
            <div className="person">
              <h3 className="display">{BUSINESS.phoneAltContact}</h3>
              <p className="body-muted">Scheduling, on-site work and vehicle sign off.</p>
              <a className="btn btn-ghost" href={BUSINESS.phoneAltHref}>
                {BUSINESS.phoneAlt}
              </a>
            </div>
            <div className="person">
              <h3 className="display">Where we work</h3>
              <p className="body-muted">
                Based in {BUSINESS.address.locality} {BUSINESS.address.region}{' '}
                {BUSINESS.address.postcode}. On site across all suburbs and Australia wide, because
                the vehicles usually belong to people who did not ask to be involved.
              </p>
              <a className="btn btn-ghost" href={`mailto:${BUSINESS.email}`}>
                {BUSINESS.email}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingBottom: 'clamp(3rem,6vw,5rem)' }}>
        <div className="shell">
          <div className="head">
            <h2 className="display">Thirty years of it</h2>
            <p className="lede">
              Vehicles restored and released.{' '}
              <Link to="/gallery" style={{ color: 'var(--accent-hot)', fontWeight: 700 }}>
                See the full gallery
              </Link>
            </p>
          </div>
        </div>
        <PhotoRail items={GALLERY.slice(0, 13)} duration={72} />
      </section>

      <section>
        <div className="shell cta-panel">
          <div>
            <h2 className="display">Send photos, get a real number</h2>
            <p className="body-muted">
              Photos tell us the fallout type and how hard it has bonded. That is usually enough to
              quote, and heavy or full-coverage jobs get sighted first.
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
