import { useRef, type ReactNode } from 'react';
import { useScrollProgress } from '../lib/useScrollProgress';

/**
 * A section heading that arrives and leaves with the scroll.
 *
 * NOT called .scrub: that class is the ScrubHero canvas overlay, which is
 * position:absolute inset:0. Reusing it pinned every heading to the top of the
 * document and painted them over the hero.
 *
 * Fades up as it enters from the bottom, holds while it is the thing you are
 * looking at, then fades and lifts away as it goes off the top — driven by the
 * same scroll progress the word-belt band uses, so the two read as one system
 * rather than two effects that happen to be on the same page.
 */
export default function ScrollTitle({
  children,
  className = '',
  drift = 34,
}: {
  children: ReactNode;
  className?: string;
  /** Parallax travel in px, half above centre and half below. */
  drift?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollProgress(ref, { ramp: 0.34, drift });

  return (
    <div ref={ref} className={`scrolltitle ${className}`.trim()}>
      {children}
    </div>
  );
}
