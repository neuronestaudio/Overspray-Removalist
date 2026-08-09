import { useCallback, useEffect, useRef, useState } from 'react';
import { IMAGES } from '../data/images';
import type { Pair } from '../data/pairs';

/**
 * Before/after comparison with a vehicle switcher.
 *
 * The switcher tiles are themselves miniature before/afters, split by the same
 * orange line as the main slider. Text pills showed neither what you were
 * switching to nor that the big image was draggable at all; this way the whole
 * set of jobs is legible at a glance and each tile rhymes with the control it
 * operates.
 *
 * --split is set on the pane and read by children, so it must inherit. It is
 * registered with @property purely so the intro sweep can ease; see index.css.
 */

interface Props {
  pairs: Pair[];
}

export default function BeforeAfter({ pairs }: Props) {
  const [index, setIndex] = useState(0);
  const [touched, setTouched] = useState(false);
  const paneRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const demoedRef = useRef(false);

  const pair = pairs[index];

  const setSplit = useCallback((pct: number) => {
    const pane = paneRef.current;
    if (!pane) return;
    const clamped = Math.max(0, Math.min(100, pct));
    pane.style.setProperty('--split', `${clamped}%`);
    pane.setAttribute('aria-valuenow', String(Math.round(clamped)));
  }, []);

  const markTouched = useCallback(() => {
    setTouched(true);
    paneRef.current?.classList.remove('nudging');
  }, []);

  const fromClientX = useCallback(
    (clientX: number) => {
      const pane = paneRef.current;
      if (!pane) return;
      const rect = pane.getBoundingClientRect();
      setSplit(((clientX - rect.left) / rect.width) * 100);
    },
    [setSplit],
  );

  /* One-time demonstration when the slider first scrolls into view: it sweeps
     itself open and back, which teaches the interaction without a caption. It
     never replays and never fights a visitor who has already grabbed it. */
  useEffect(() => {
    const pane = paneRef.current;
    if (!pane || demoedRef.current) return;
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const timers: number[] = [];
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || demoedRef.current) continue;
          demoedRef.current = true;
          io.disconnect();
          timers.push(
            window.setTimeout(() => {
              if (paneRef.current?.getAttribute('data-touched') === 'true') return;
              paneRef.current?.classList.add('nudging');
              ([[74, 0], [30, 620], [50, 1240]] as const).forEach(([v, delay]) => {
                timers.push(
                  window.setTimeout(() => {
                    if (paneRef.current?.getAttribute('data-touched') !== 'true') setSplit(v);
                  }, delay),
                );
              });
              timers.push(
                window.setTimeout(() => paneRef.current?.classList.remove('nudging'), 1900),
              );
            }, 420),
          );
        }
      },
      { threshold: 0.45 },
    );
    io.observe(pane);
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [setSplit]);

  function onPointerDown(e: React.PointerEvent) {
    e.preventDefault(); // stops the native image drag cancelling the pointer stream
    draggingRef.current = true;
    markTouched();
    try {
      paneRef.current?.setPointerCapture(e.pointerId);
    } catch {
      /* capture unsupported; dragging still works */
    }
    fromClientX(e.clientX);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const current = Number(paneRef.current?.getAttribute('aria-valuenow') ?? 50);
    let next: number | null = null;
    if (e.key === 'ArrowLeft') next = current - 4;
    else if (e.key === 'ArrowRight') next = current + 4;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = 100;
    if (next === null) return;
    e.preventDefault();
    markTouched();
    setSplit(next);
  }

  function choose(i: number) {
    setIndex(i);
    markTouched();
    setSplit(50);
  }

  return (
    <div className="ba">
      <div className="ba-switch" role="group" aria-label="Choose a job to compare">
        {pairs.map((p, i) => (
          <button
            key={p.id}
            type="button"
            aria-pressed={i === index}
            onClick={() => choose(i)}
            className="ba-tile"
          >
            <span className="ba-tile-media">
              <img src={`/assets/images/${p.beforeStem}-${lastWidth(p.beforeStem)}.webp`} alt="" loading="lazy" />
              <img
                className="ba-tile-after"
                src={`/assets/images/${p.afterStem}-${lastWidth(p.afterStem)}.webp`}
                alt=""
                loading="lazy"
              />
            </span>
            <span className="ba-tile-label">
              <strong>{p.label}</strong>
              <em>{p.vehicle}</em>
            </span>
          </button>
        ))}
      </div>

      <div
        ref={paneRef}
        className="ba-pane"
        role="slider"
        tabIndex={0}
        data-touched={touched ? 'true' : 'false'}
        aria-label={`Before and after: ${pair.vehicle}. Use arrow keys to reveal the restored vehicle.`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={50}
        style={{ ['--split' as string]: '50%' }}
        onPointerDown={onPointerDown}
        onPointerMove={(e) => draggingRef.current && fromClientX(e.clientX)}
        onPointerUp={() => (draggingRef.current = false)}
        onPointerCancel={() => (draggingRef.current = false)}
        onPointerEnter={markTouched}
        onFocus={markTouched}
        onKeyDown={onKeyDown}
        onDragStart={(e) => e.preventDefault()}
      >
        <img
          key={`${pair.id}-b`}
          className="ba-img"
          src={`/assets/images/${pair.beforeStem}-${lastWidth(pair.beforeStem)}.webp`}
          alt={pair.beforeAlt}
          loading="lazy"
          decoding="async"
        />
        <img
          key={`${pair.id}-a`}
          className="ba-img ba-after"
          src={`/assets/images/${pair.afterStem}-${lastWidth(pair.afterStem)}.webp`}
          alt={pair.afterAlt}
          loading="lazy"
          decoding="async"
        />

        <span className="ba-tag ba-tag-before">Before</span>
        <span className="ba-tag ba-tag-after">After</span>

        <div className="ba-handle">
          <span className="ba-knob" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
              <path d="M8.5 6.5 4 11l4.5 4.5V12h7v3.5L20 11l-4.5-4.5V10h-7V6.5Z" />
            </svg>
          </span>
        </div>

        {!touched && <span className="ba-hint">Drag</span>}
      </div>

      <p className="ba-caption">{pair.caption}</p>
    </div>
  );
}

/** Widest variant that exists for a stem. */
function lastWidth(stem: string): number {
  const meta = IMAGES[stem];
  if (!meta) return 640;
  return meta.widths[meta.widths.length - 1];
}
