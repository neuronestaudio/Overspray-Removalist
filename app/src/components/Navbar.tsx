import { Link, NavLink } from 'react-router-dom';
import { BUSINESS } from '../lib/site';

/* Pricing is deliberately absent. It still has a route and a footer link, but
   it was the one item in the bar over the hero that invited a visitor to price
   a job before seeing what the job looks like. */
const NAV = [
  { label: 'Services', to: '/services' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export default function Navbar() {
  return (
    <header className="hdr">
      <div className="shell hdr-row">
        <Link className="hdr-logo" to="/" aria-label={`${BUSINESS.name} home`}>
          {/* Monogram, not the full lockup: at header height the tagline under
              the letters is unreadable. The wordmark runs in the footer. */}
          <img src="/assets/images/logo-mark.webp" alt={BUSINESS.name} width={900} height={432} />
        </Link>

        <nav className="nav" aria-label="Primary">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hdr-cta">
          {/* Icon, not the number: it said the same thing in 130px of header
              and competed with the quote button for the same glance. The
              number stays in the drawer, the footer and the closing CTA. */}
          <a
            className="hdr-call"
            href={BUSINESS.phoneHref}
            aria-label={`Call ${BUSINESS.phone}`}
            title={`Call ${BUSINESS.phone}`}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .57 3.6 1 1 0 0 1-.25 1z" />
            </svg>
          </a>
          <Link className="btn btn-primary" to="/quote">
            Get a Quote
          </Link>
        </div>
      </div>
    </header>
  );
}
