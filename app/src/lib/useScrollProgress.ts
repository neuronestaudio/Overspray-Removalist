import { useEffect, type RefObject } from 'react';

/**
 * Writes an element's travel through the viewport to CSS custom properties.
 *
 *   --p      0 as the element's top reaches the bottom of the viewport,
 *            1 as its bottom leaves the top.
 *   --fade   0 -> 1 over the first `ramp` of that travel, 1 -> 0 over the last.
 *   --shift  a parallax offset in px, `drift` at the start easing to -`drift`.
 *
 * Everything downstream is opacity and transform, so the handler never reads or
 * writes layout. There is no scroll listener at all until an IntersectionObserver
 * says the element is on screen, and reads are batched into one rAF tick.
 *
 * Shared by the word-belt band and the section titles so there is one
 * implementation of this rather than one per component.
 */
export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  { ramp = 0.3, drift = 0 }: { ramp?: number; drift?: number } = {},
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    let visible = false;

    const tick = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const span = r.height + window.innerHeight;
      const p = Math.min(1, Math.max(0, (window.innerHeight - r.top) / span));

      /* Triangular: up over the first `ramp`, flat, down over the last. Done
         here rather than in CSS because abs() is not safe to rely on yet. */
      const fade = Math.min(1, Math.max(0, Math.min(p / ramp, (1 - p) / ramp)));

      el.style.setProperty('--p', p.toFixed(4));
      el.style.setProperty('--fade', fade.toFixed(4));
      if (drift) el.style.setProperty('--shift', `${((0.5 - p) * 2 * drift).toFixed(2)}px`);
    };

    const onScroll = () => {
      if (!visible || frame) return;
      frame = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible) tick();
      },
      { rootMargin: '140px' },
    );
    io.observe(el);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    tick();

    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ref, ramp, drift]);
}
