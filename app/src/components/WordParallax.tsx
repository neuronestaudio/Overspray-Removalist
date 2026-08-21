import { useEffect, useRef } from 'react';
import Img from './Img';

/**
 * Full-bleed parallax band of oversized type.
 *
 * Three belts of condensed display words drift across a job photograph at
 * different speeds and directions, driven by how far the band has travelled
 * through the viewport. The photo itself lags the scroll, so the type and the
 * plate it sits on separate as you pass.
 *
 * Scroll position is read inside a rAF tick and written straight to a custom
 * property, so the handler never touches layout. Everything downstream is a
 * transform, which the compositor handles without a repaint.
 */

/* The contaminants, in the client's own vocabulary. Repeated words are fine —
   the belts are long and a word should reappear before the belt loops. */
const BELTS: string[][] = [
  ['OVERSPRAY', 'CEMENT', 'FALLOUT', 'GRAFFITI'],
  ['RAIL DUST', 'ACID RAIN', 'SOOT', 'EPOXY'],
  ['CONCRETE', 'URETHANE', 'IRON FILINGS', 'TAR'],
];

export default function WordParallax({ stem }: { stem: string }) {
  const bandRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const band = bandRef.current;
    if (!band) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    let visible = false;

    const tick = () => {
      frame = 0;
      const r = band.getBoundingClientRect();
      /* 0 as the band's top edge reaches the bottom of the viewport, 1 as its
         bottom edge leaves the top. Clamped so the belts settle rather than
         running away when the band is taller than the screen. */
      const span = r.height + window.innerHeight;
      const p = Math.min(1, Math.max(0, (window.innerHeight - r.top) / span));
      band.style.setProperty('--p', p.toFixed(4));
    };

    const onScroll = () => {
      if (!visible || frame) return;
      frame = requestAnimationFrame(tick);
    };

    /* No listener at all until the band is actually on screen. */
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible) tick();
      },
      { rootMargin: '120px' },
    );
    io.observe(band);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    tick();

    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="wpx" ref={bandRef} aria-labelledby="wpx-title">
      <div className="wpx-plate" aria-hidden="true">
        <Img stem={stem} alt="" sizes="100vw" />
      </div>

      <div className="wpx-belts" aria-hidden="true">
        {BELTS.map((words, row) => (
          <div className="wpx-belt" key={row} data-row={row}>
            {/* Twice through, so the belt still covers the viewport at the
                extremes of its travel. */}
            <span className="wpx-run">
              {[...words, ...words].map((w, i) => (
                <span className="wpx-word" key={i}>
                  {w}
                  <i aria-hidden="true">/</i>
                </span>
              ))}
            </span>
          </div>
        ))}
      </div>

      <div className="wpx-copy">
        <p className="eyebrow">What we take off</p>
        <h2 className="display" id="wpx-title">
          If it landed on the paint, it comes off the paint.
        </h2>
      </div>
    </section>
  );
}
