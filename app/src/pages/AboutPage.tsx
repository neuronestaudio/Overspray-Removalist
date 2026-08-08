import { Link } from 'react-router-dom';
import PageMeta from '../components/PageMeta';
import Img from '../components/Img';
import { BUSINESS } from '../lib/site';

export default function AboutPage() {
  return (
    <>
      <PageMeta
        title={`About | Australia's Overspray Removal Specialists | ${BUSINESS.name}`}
        description="Over 30 years specialising solely in overspray and industrial fallout removal. A unique non-abrasive process, plus full overspray claims management. Based in Epping VIC."
        path="/about"
        ogImage="workshop"
        ogAlt="The Overspray Removalist workshop"
      />

      <section className="pbanner">
        <div className="shell">
          <p className="crumb">
            <Link to="/">Home</Link> / <span>About</span>
          </p>
          <h1 className="display">About us</h1>
          <p className="lede">
            For over thirty years, The Overspray Removalist has been Australia's overspray removal
            and claims management specialist.
          </p>
        </div>
      </section>

      <section>
        <div className="shell split">
          <div className="prose">
            <h2 className="display">One trade, done properly</h2>
            <p>
              We are the only company in Australia that focuses and specialises solely on overspray
              and fallout removal. Not detailing with overspray on the side. Not panel work. This,
              and only this, for over thirty years.
            </p>
            <p>
              We have developed a unique overspray removal process that no other company provides.
              Our non-abrasive methods, used by hand, are the safest way to remove overspray debris
              from vehicles, trucks, boats, aircraft and affected buildings.
            </p>

            <h2 className="display">What we have taken off</h2>
            <p>
              Epoxy, urethane, polyurethane foam, soot, iron filings, industrial fallout, graffiti,
              cement, concrete sealers, cement and concrete splatters, and spray paint, to name a
              few. We remove all of these without causing damage to your property.
            </p>

            <h2 className="display">Claims and incidents</h2>
            <p>
              Alongside the removal itself we handle overspray claims management, including
              authorisation and release forms and the public relations on your behalf. When one
              incident affects a whole street or a whole lot, that side of the job matters as much
              as the process.
            </p>

            <h2 className="display">Where we work</h2>
            <p>
              Based in {BUSINESS.address.locality} {BUSINESS.address.region}{' '}
              {BUSINESS.address.postcode}, working across all suburbs and Australia wide. We come to
              the vehicles, which matters when they belong to residents, staff or customers who did
              not ask to be involved.
            </p>
          </div>

          <div className="split-media">
            <Img stem="workshop" alt="The Overspray Removalist workshop with a vehicle under assessment" sizes="(max-width:860px) 100vw, 560px" />
          </div>
        </div>
      </section>
    </>
  );
}
