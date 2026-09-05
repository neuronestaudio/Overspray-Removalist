import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { IMAGES } from '../data/images';
import type { Pair } from '../data/pairs';

/**
 * Infinite game-style coverflow, ported from the Formula build.
 *
 * Infinite without cloning any DOM. For each card we take the SIGNED SHORTEST
 * distance to the active index, wrapped around the ring:
 *
 *     d = ((i - current + n/2 + n) % n) - n/2
 *
 * so with five cards, card 0 sits at d = -1 when current is 1 and at d = +2
 * when current is 3: it always takes the short way round. Cards are then placed
 * purely by transform from that d. Nothing is reordered, nothing is duplicated,
 * and there is no seam to jump at because there is no seam.
 *
 * The backdrop is the active card's photo, blurred hard and crossfaded on
 * opacity alone. That is deliberate on two counts: glass needs a soft colourful
 * backdrop to refract against (a sharp photo fights it), and it makes source
 * resolution irrelevant, so the 540px job photos hold up full-bleed while the
 * crisp copy inside the card runs at a size it can actually carry.
 *
 * The wheel is NOT captured here. This sits in the hero, and a visitor has to
 * be able to scroll past it; hijacking that is how a hero becomes a trap.
 */

interface Props {
  items: Pair[];
  /** ms between auto-advances. Stops for good on first interaction. */
  autoMs?: number;
}

export default function Coverflow({ items, autoMs = 4600 }: Props) {
  const n = items.length;
  const rootRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [touched, setTouched] = useState(false);
  const touchedRef = useRef(false);
  const dragX = useRef<number | null>(null);
  const movedRef = useRef(false);

  const go = useCallback((delta: number) => setCurrent((c) => ((c + delta) % n + n) % n), [n]);
  const goTo = useCallback((i: number) => setCurrent(((i % n) + n) % n), [n]);

  const markTouched = useCallback(() => {
    if (touchedRef.current) return;
    touchedRef.current = true;
    setTouched(true);
  }, []);

  /* Autoplay. Without it the carousel sits dead until someone happens to try
     dragging it. Stops permanently on the first real interaction, and pauses
     while off-screen or backgrounded so it is not animating in a hidden tab. */
  useEffect(() => {
    if (touched || n < 2) return;
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let onScreen = true;
    const id = window.setInterval(() => {
      if (onScreen && !document.hidden) go(1);
    }, autoMs);

    let io: IntersectionObserver | undefined;
    if ('IntersectionObserver' in window && rootRef.current) {
      io = new IntersectionObserver((e) => (onScreen = e[0].isIntersecting), { threshold: 0.25 });
      io.observe(rootRef.current);
    }
    return () => {
      clearInterval(id);
      io?.disconnect();
    };
  }, [touched, autoMs, go, n]);

  /* Arrow keys only once the carousel has been engaged with, so they do not
     fight a visitor who is using the keyboard to scroll the page. */
  useEffect(() => {
    if (!touched) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') { go(1); e.preventDefault(); }
      else if (e.key === 'ArrowLeft') { go(-1); e.preventDefault(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [touched, go]);

  function dist(i: number) {
    const half = Math.floor(n / 2);
    return (((i - current) % n) + n + half) % n - half;
  }

  function onPointerDown(e: React.PointerEvent) {
    if ((e.target as Element).closest('a,button')) return;
    dragX.current = e.clientX;
    movedRef.current = false;
  }
  function onPointerMove(e: React.PointerEvent) {
    if (dragX.current === null) return;
    const dx = e.clientX - dragX.current;
    if (Math.abs(dx) > 60) {
      markTouched();
      go(dx < 0 ? 1 : -1);
      dragX.current = e.clientX;
      movedRef.current = true;
    }
  }
  const endDrag = () => (dragX.current = null);

  return (
    <div className="cf" ref={rootRef} data-touched={touched ? 'true' : 'false'}>
      {/* No backdrop layer. The deck used to sit on a blurred, drifting copy of
          the active photo behind a gradient veil; together they read as a
          cloudy rectangle pasted over the carbon. Dropping it also drops a
          second full-size load of every job photo. */}
      <div
        className="cf-stage"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
      >
        <div className="cf-track">
          {items.map((p, i) => {
            const d = dist(i);
            const ad = Math.abs(d);
            const active = d === 0;
            const visible = ad <= 2;
            return (
              <article
                key={p.id}
                className="cf-card"
                data-active={active ? 'true' : 'false'}
                aria-hidden={active ? 'false' : 'true'}
                style={{
                  ['--d' as string]: d,
                  ['--ad' as string]: ad,
                  ['--s' as string]: active ? 1 : Math.max(0.66, 1 - ad * 0.13),
                  ['--o' as string]: visible ? (active ? 1 : Math.max(0, 0.62 - (ad - 1) * 0.24)) : 0,
                  ['--z' as string]: 20 - ad,
                  pointerEvents: visible ? 'auto' : 'none',
                }}
                onClick={(e) => {
                  if (movedRef.current) { e.preventDefault(); return; }
                  if (!active) { e.preventDefault(); markTouched(); goTo(i); }
                }}
              >
                <span className="cf-reticle" aria-hidden="true">
                  <i /><i /><i /><i />
                </span>

                <div className="cf-art">
                  <img src={src(p.beforeStem)} alt={active ? p.beforeAlt : ''} loading="lazy" draggable={false} />
                </div>

                <div className="cf-body">
                  <span className="cf-idx">
                    {String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
                  </span>
                  <h2 className="cf-name">{p.label}</h2>
                  <p className="cf-blurb">
                    <strong>{p.vehicle}.</strong> {p.caption}
                  </p>
                  <Link className="cf-go" to={p.href} tabIndex={active ? 0 : -1}>
                    See the process
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
                      <path d="M13.2 5.3 11.8 6.7 16.1 11H4v2h12.1l-4.3 4.3 1.4 1.4L20 12z" />
                    </svg>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <button
        className="cf-arrow cf-prev"
        type="button"
        aria-label="Previous job"
        onClick={() => { markTouched(); go(-1); }}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
          <path d="m10.8 18.7 1.4-1.4L7.9 13H20v-2H7.9l4.3-4.3-1.4-1.4L4 12z" />
        </svg>
      </button>
      <button
        className="cf-arrow cf-next"
        type="button"
        aria-label="Next job"
        onClick={() => { markTouched(); go(1); }}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
          <path d="M13.2 5.3 11.8 6.7 16.1 11H4v2h12.1l-4.3 4.3 1.4 1.4L20 12z" />
        </svg>
      </button>

      <div className="cf-hud">
        <p className="cf-counter">
          <b>{String(current + 1).padStart(2, '0')}</b> / {String(n).padStart(2, '0')}
        </p>
        <div className="cf-pips" role="tablist" aria-label="Choose a job">
          {items.map((p, i) => (
            <button
              key={p.id}
              className="cf-pip"
              role="tab"
              aria-selected={i === current}
              aria-label={`${p.label}, ${p.vehicle}`}
              onClick={() => { markTouched(); goTo(i); }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Widest variant that exists for a stem. */
function src(stem: string): string {
  const meta = IMAGES[stem];
  if (!meta) return '';
  return `/assets/images/${stem}-${meta.widths[meta.widths.length - 1]}.webp`;
}
