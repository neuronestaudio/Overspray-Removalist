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

/* Inline rather than an icon font or sprite: four glyphs, used once each, on a
   component that renders on every route. A request for them would cost more
   than the bytes they occupy. */
function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .57 3.6 1 1 0 0 1-.25 1z" />
    </svg>
  );
}
function IconMail() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2m0 4-8 5-8-5V6l8 5 8-5z" />
    </svg>
  );
}
function IconPin() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7m0 9.5A2.5 2.5 0 1 1 14.5 9 2.5 2.5 0 0 1 12 11.5" />
    </svg>
  );
}
function IconClock() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2m1 10.6-3.9 2.3-.9-1.5 3.3-2V6.5h1.5z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="ftr">
      <div className="shell">
        {/* The footer used to end the page on a wall of links. Every route now
            terminates on the same two actions the header opens with. */}
        <div className="ftr-cta">
          <div>
            <p className="ftr-cta-kicker">Thirty years, Australia wide</p>
            <h4 className="ftr-cta-title">Send us a photo. We&rsquo;ll tell you if it comes off.</h4>
          </div>
          <div className="ftr-cta-actions">
            <Link className="btn btn-primary" to="/quote">
              Get a quote
            </Link>
            <a className="btn btn-ghost" href={BUSINESS.phoneHref}>
              Call {BUSINESS.phone}
            </a>
          </div>
        </div>

        <div className="ftr-grid">
          <div className="ftr-brand">
            <img
              className="ftr-logo"
              src="/assets/images/logo.webp"
              alt={BUSINESS.name}
              width={900}
              height={485}
            />
            <p className="ftr-blurb">
              Australia&rsquo;s overspray and industrial fallout specialists. Over 30 years removing
              paint, cement and fallout from vehicles, fleets and property without abrasives.
            </p>
          </div>

          <div>
            <h5>Services</h5>
            {/* Nine services in a single column ran taller than the other three
                put together. Two columns keep the row heights honest. */}
            <ul className="ftr-links ftr-links-2">
              {SERVICES.map((s) => (
                <li key={s.path}>
                  <Link to={s.path}>{s.nav}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5>Company</h5>
            <ul className="ftr-links">
              {COMPANY.map((c) => (
                <li key={c.to}>
                  <Link to={c.to}>{c.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="ftr-contact-col">
            <h5>Contact</h5>
            <ul className="ftr-contact">
              <li>
                <IconPhone />
                <span>
                  <a href={BUSINESS.phoneHref}>{BUSINESS.phone}</a>
                  <em>{BUSINESS.phoneContact}</em>
                </span>
              </li>
              <li>
                <IconPhone />
                <span>
                  <a href={BUSINESS.phoneAltHref}>{BUSINESS.phoneAlt}</a>
                  <em>{BUSINESS.phoneAltContact}</em>
                </span>
              </li>
              <li>
                <IconMail />
                <span>
                  <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>
                </span>
              </li>
              <li>
                <IconPin />
                <span>
                  {BUSINESS.address.locality} {BUSINESS.address.region}{' '}
                  {BUSINESS.address.postcode}
                  <em>Servicing {BUSINESS.areaServed} wide</em>
                </span>
              </li>
              <li>
                <IconClock />
                <span>{BUSINESS.hours}</span>
              </li>
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
