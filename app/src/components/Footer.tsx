import { Link } from 'react-router-dom';
import { BUSINESS } from '../lib/site';
import { SERVICES } from '../data/services';

const COMPANY = [
  { label: 'Services', to: '/services' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'Get a Quote', to: '/quote' },
];

export default function Footer() {
  return (
    <footer className="ftr">
      <div className="shell">
        <div className="ftr-grid">
          <div>
            <img
              className="ftr-logo"
              src="/assets/images/logo.webp"
              alt={BUSINESS.name}
              width={900}
              height={485}
            />
            <p className="ftr-blurb">
              Australia's overspray and industrial fallout specialists. Over 30 years removing
              paint, cement and fallout from vehicles, fleets and property without abrasives.
            </p>
          </div>

          <div>
            <h5>Services</h5>
            <ul>
              {SERVICES.map((s) => (
                <li key={s.path}>
                  <Link to={s.path}>{s.nav}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5>Company</h5>
            <ul>
              {COMPANY.map((c) => (
                <li key={c.to}>
                  <Link to={c.to}>{c.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5>Contact</h5>
            <ul className="ftr-contact">
              <li>
                {BUSINESS.phoneContact}
                <br />
                <a href={BUSINESS.phoneHref}>{BUSINESS.phone}</a>
              </li>
              <li>
                {BUSINESS.phoneAltContact}
                <br />
                <a href={BUSINESS.phoneAltHref}>{BUSINESS.phoneAlt}</a>
              </li>
              <li>
                <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>
              </li>
              <li>
                {BUSINESS.address.locality} {BUSINESS.address.region} {BUSINESS.address.postcode}
                <br />
                Servicing {BUSINESS.areaServed} wide
              </li>
              <li>{BUSINESS.hours}</li>
            </ul>
          </div>
        </div>

        <div className="ftr-bottom">
          {/* No year on purpose. The old site's footer read "Copyright 2021",
              which was the clearest signal on the page that nobody was home. A
              build-time year would go stale the same way the moment a year
              turns over without a deploy, and would also mismatch on hydration. */}
          <span>&copy; {BUSINESS.name}. All rights reserved.</span>
          <Link to="/privacy">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}
