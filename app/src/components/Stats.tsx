import { useEffect, useRef, useState } from 'react';
import { useScrollProgress } from '../lib/useScrollProgress';

/**
 * The metric band.
 *
 * Numbers count up the first time the band is reached, then stay put. Only the
 * numeric metrics animate — two of the four are words, and a word cannot count.
 * Those render immediately so the row never sits half empty waiting for
 * something that will not happen.
 *
 * The whole row drifts against the scroll, using the same progress hook the
 * section titles and the word band use.
 */
interface Metric {
  /** Number to count to, or null for a word. */
  to: number | null;
  /** Rendered before the number. */
  prefix?: string;
  /** Rendered after the number, or the whole value when `to` is null. */
  suffix?: string;
  label: string;
}

const METRICS: Metric[] = [
  { to: 30, suffix: '+', label: 'Years removing overspray' },
  { to: null, suffix: 'Melbourne', label: 'Wide, all suburbs, on site' },
  { to: 100, suffix: '%', label: 'Original paint kept. No sanding, no respray' },
  { to: null, suffix: 'Fleet', label: 'Commercial HV and LV, priced by the lot' },
];

const DURATION = 1400;

function useCountUp(target: number | null, start: boolean) {
  const [value, setValue] = useState(target === null ? 0 : 0);
  const done = useRef(false);

  useEffect(() => {
    if (target === null || !start || done.current) return;
    done.current = true;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return;
    }

    let frame = 0;
    let t0 = 0;
    const step = (now: number) => {
      if (!t0) t0 = now;
      const p = Math.min(1, (now - t0) / DURATION);
      /* Ease out: fast off the mark, settling onto the number rather than
         stopping dead on it. */
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, start]);

  return value;
}

function Stat({ metric, live }: { metric: Metric; live: boolean }) {
  const n = useCountUp(metric.to, live);
  return (
    <div className="stat">
      <div className="stat-n">
        {metric.to === null ? (
          metric.suffix
        ) : (
          <>
            {metric.prefix}
            {/* tabular figures, or the row jostles sideways on every frame as
                the digits change width mid-count. */}
            <span className="stat-num">{n}</span>
            {metric.suffix}
          </>
        )}
      </div>
      <div className="stat-l">{metric.label}</div>
    </div>
  );
}

export default function Stats() {
  const ref = useRef<HTMLElement>(null);
  const [live, setLive] = useState(false);
  useScrollProgress(ref, { ramp: 0.4, drift: 18 });

  /* Counting starts when the band is genuinely on screen, not when it is merely
     approaching — the point is that it happens in front of the visitor. */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setLive(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="stats" ref={ref}>
      <div className="shell stats-row">
        {METRICS.map((m) => (
          <Stat key={m.label} metric={m} live={live} />
        ))}
      </div>
    </section>
  );
}
