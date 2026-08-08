import { Link } from 'react-router-dom';
import PageMeta from '../components/PageMeta';
import Img from '../components/Img';
import { SERVICES } from '../data/services';
import { SITE_ORIGIN, BUSINESS } from '../lib/site';

export default function ServicesPage() {
  return (
    <>
      <PageMeta
        title={`Services | Overspray, Cement, Graffiti & Fallout Removal | ${BUSINESS.name}`}
        description="Paint overspray, cement splatter, graffiti, industrial fallout, fleet and construction site remediation, and insurance claims management. Australia wide, over 30 years."
        path="/services"
        ogImage="svc-overspray"
        ogAlt="Technician removing paint overspray by hand"
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
              { '@type': 'ListItem', position: 2, name: 'Services', item: `${SITE_ORIGIN}/services` },
            ],
          },
        ]}
      />
      <section className="pbanner">
        <div className="shell">
          <p className="crumb">
            <Link to="/">Home</Link> / <span>Services</span>
          </p>
          <h1 className="display">Services</h1>
          <p className="lede">
            One trade, done properly: taking contamination off a finish without damaging what is
            underneath. We are the only company in Australia that focuses solely on overspray and
            fallout removal.
          </p>
        </div>
      </section>
      <section>
        <div className="shell bento">
          {SERVICES.map((s) => (
            <Link className="cell" key={s.path} to={s.path}>
              <div className="cell-img">
                <Img stem={s.hero} alt={s.heroAlt} sizes="(max-width:620px) 100vw, 50vw" />
              </div>
              <h2 className="display">{s.nav}</h2>
              <p>{s.lede}</p>
              <span className="cell-link">Read more</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
