import { Link, NavLink } from 'react-router-dom';
import { BUSINESS } from '../lib/site';

const NAV = [
  { label: 'Services', to: '/services' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Pricing', to: '/pricing' },
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
          <a className="hdr-call" href={BUSINESS.phoneHref}>
            {BUSINESS.phone}
          </a>
          <Link className="btn btn-primary" to="/quote">
            Get a Quote
          </Link>
        </div>
      </div>
    </header>
  );
}
