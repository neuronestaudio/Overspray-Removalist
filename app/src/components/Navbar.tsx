import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { BUSINESS } from '../lib/site';

/* Pricing is deliberately absent. It still has a route and a footer link, but
   it was the one item in the bar over the hero that invited a visitor to price
   a job before seeing what the job looks like. */
const NAV = [
  { label: 'Services', to: '/services' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Service Areas', to: '/service-areas' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .57 3.6 1 1 0 0 1-.25 1z" />
    </svg>
  );
}

export default function Navbar() {
  /* The drawer and its trigger were styled in index.css but never existed in
     the markup, so on a phone this header rendered the logo and nothing else:
     no menu, no call, no quote. */
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  /* Close on navigation, or the drawer stays over the page it just opened. */
  useEffect(() => setOpen(false), [pathname]);

  /* Escape closes it, and the page behind must not scroll while it is over the
     top of it. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    /* The drawer is a SIBLING of the header, not a child. .hdr carries a
       backdrop-filter, which makes it the containing block for any fixed
       descendant — so inside it the drawer's `inset: 0` resolved to the 72px
       header box and it painted a dark band with the menu spilling out
       transparent beneath it. */
    <>
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
            <IconPhone />
          </a>
          <Link className="btn btn-primary" to="/quote">
            Get a Quote
          </Link>
        </div>

        {/* Phone only. Call sits beside the trigger rather than inside the
            drawer, because ringing is the highest-intent thing on the page and
            should never be two taps away. */}
        <div className="hdr-mob">
          <a
            className="hdr-call"
            href={BUSINESS.phoneHref}
            aria-label={`Call ${BUSINESS.phone}`}
          >
            <IconPhone />
          </a>
          <button
            className="burger"
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="mobile-drawer"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </button>
        </div>
        </div>
      </header>

      <div
        className={`drawer${open ? ' open' : ''}`}
        id="mobile-drawer"
        /* inert, not just pointer-events:none: without it every link in here is
           still tabbable while the drawer is invisible. React 19 types this as
           a boolean and serialises it to the empty attribute itself. */
        inert={!open}
      >
        <div className="drawer-top">
          <Link className="hdr-logo" to="/" aria-label={`${BUSINESS.name} home`}>
            <img src="/assets/images/logo-mark.webp" alt="" width={900} height={432} />
          </Link>
          <button
            className="burger"
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </button>
        </div>

        <nav aria-label="Mobile">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to}>
              {item.label}
            </NavLink>
          ))}
          <NavLink to="/pricing">Pricing</NavLink>
        </nav>

        <Link className="btn btn-primary btn-lg" to="/quote">
          Get a quote
        </Link>
        <a className="btn btn-ghost btn-lg drawer-call" href={BUSINESS.phoneHref}>
          Call {BUSINESS.phone}
        </a>
      </div>
    </>
  );
}
