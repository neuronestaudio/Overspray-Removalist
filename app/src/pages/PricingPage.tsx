import { Link } from 'react-router-dom';
import PageMeta from '../components/PageMeta';
import { BUSINESS } from '../lib/site';

export default function PricingPage() {
  return (
    <>
      <PageMeta
        title={`Overspray Removal Pricing & Estimates | From $600 | ${BUSINESS.name}`}
        description="How overspray, cement splatter and fallout removal is priced. Light overspray from $600. Volume pricing for whole lots. Send photos for a fast, accurate estimate."
        path="/pricing"
        ogImage="workshop"
        ogAlt="Vehicle assessed in the workshop before restoration"
      />

      <section className="pbanner">
        <div className="shell">
          <p className="crumb">
            <Link to="/">Home</Link> / <span>Pricing</span>
          </p>
          <h1 className="display">Pricing</h1>
          <p className="lede">
            The best way to price a problem is to view the vehicle, but we can give estimates over
            the phone. Emailing images gives us a much better understanding of the problem and the
            type of fallout it is.
          </p>
        </div>
      </section>

      <section>
        <div className="shell prose">
          <h2 className="display">Paint overspray</h2>
          <p>
            Quoting an overspray issue depends on many factors that determine the price to repair
            the problem. In some cases the paint is very light and does not cover the entire
            vehicle, and that may cost <strong>from $600</strong>.
          </p>
          <p>
            Different types of paint bond differently to the vehicle, which can change the process
            needed to remove the overspray. Two pack epoxy is a very hard paint, cured through
            adding a hardener. If the car is fully covered, including the moulds, plastics, glass,
            window trims, lenses, roof racks and all external accessories, the vehicle has to be
            sighted and assessed.
          </p>

          <div className="pricing-note">
            <strong>Whole lots.</strong> If a high volume of cars is affected in one place and we
            can work on the entire lot in the one location, we price the lot rather than each
            vehicle. We can also include the authorisation and release forms and handle the public
            relations on your behalf.
          </div>

          <h2 className="display">Cement splatter</h2>
          <p>
            Vehicles affected by cement or concrete splatter depend on many different factors that
            determine the price to repair the problem. If the car is fully covered, including the
            moulds, plastics, glass, window trims, lenses, roof racks and all external accessories,
            and especially if lime staining occurs after the cement is removed off the duco, we can
            deal with the situation. Those vehicles need to be sighted and assessed.
          </p>
          <p>
            Our biggest clients are construction companies pouring their slabs, where concrete
            splatter travels over the edge of the building site onto the vehicles below.
          </p>

          <h2 className="display">Other types of fallout</h2>
          <p>
            The same applies to most types of fallout: acid rain, industrial fallout and chemical
            fallout. All of these problems affect vehicles differently, and those vehicles need to
            be sighted and evaluated.
          </p>

          <h2 className="display">What makes a quote fast</h2>
          <ul>
            <li>Photos of the affected panels, taken in daylight</li>
            <li>What the contamination is, if you know, and roughly when it happened</li>
            <li>Where the vehicle is, and whether it can be worked on where it sits</li>
            <li>How many vehicles are affected in the same location</li>
          </ul>

          <p>
            <Link className="btn btn-primary" to="/quote">
              Send photos and get a price
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
