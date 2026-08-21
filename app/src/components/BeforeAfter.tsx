import { useCallback, useEffect, useRef, useState } from 'react';
import { IMAGES } from '../data/images';
import type { Pair } from '../data/pairs';

/**
 * A row of before/after sliders — every job draggable in place.
 *
 * This replaced a switcher-plus-one-big-pane layout. That version spent most of
 * a screen on a single comparison and made the other three jobs look like
 * thumbnails for it, when they are the proof. Four live sliders in a row show
 * every job at once and every one of them is the interaction.
 *
 * --split is set on each pane and read by its children, so it must inherit. It
 * is registered with @property purely so the intro sweep can ease; see index.css.
 */

interface Props {
  pairs: Pair[];
}

export default function BeforeAfter({ pairs }: Props) {
  return (
    <div className="ba-row">
      {pairs.map((p, i) => (
        <Compare key={p.id} pair={p} index={i} />
      ))}
    </div>
  );
}

function Compare({ pair, index }: { pair: Pair; index: number }) {
  const [touched, setTouched] = useState(false);
  const paneRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const demoedRef = useRef(false);

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

  /* One-time sweep when the row first scrolls into view: it opens and closes
     itself, which teaches the interaction without a caption. Staggered by
     index, because four panes sweeping in unison reads as a page transition
     rather than as four things you can grab. Never replays, and never fights a
     visitor who has already taken hold of it. */
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
            window.setTimeout(
              () => {
                if (paneRef.current?.getAttribute('data-touched') === 'true') return;
                paneRef.current?.classList.add('nudging');
                ([[76, 0], [28, 520], [50, 1040]] as const).forEach(([v, delay]) => {
                  timers.push(
                    window.setTimeout(() => {
                      if (paneRef.current?.getAttribute('data-touched') !== 'true') setSplit(v);
                    }, delay),
                  );
                });
                timers.push(
                  window.setTimeout(() => paneRef.current?.classList.remove('nudging'), 1650),
                );
              },
              360 + index * 190,
            ),
          );
        }
      },
      { threshold: 0.4 },
    );
    io.observe(pane);
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [setSplit, index]);

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

  return (
    <figure className="ba-cell">
      <div
        ref={paneRef}
        className="ba-pane"
        role="slider"
        tabIndex={0}
        data-touched={touched ? 'true' : 'false'}
        aria-label={`Before and after: ${pair.vehicle}, ${pair.label}. Use arrow keys to reveal the restored vehicle.`}
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
          className="ba-img"
          src={src(pair.beforeStem)}
          alt={pair.beforeAlt}
          loading="lazy"
          decoding="async"
        />
        <img
          className="ba-img ba-after"
          src={src(pair.afterStem)}
          alt={pair.afterAlt}
          loading="lazy"
          decoding="async"
        />

        <span className="ba-tag ba-tag-before">Before</span>
        <span className="ba-tag ba-tag-after">After</span>

        <div className="ba-handle">
          <span className="ba-knob" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
              <path d="M8.5 6.5 4 11l4.5 4.5V12h7v3.5L20 11l-4.5-4.5V10h-7V6.5Z" />
            </svg>
          </span>
        </div>

        {!touched && <span className="ba-hint">Drag</span>}
      </div>

      <figcaption className="ba-cap">
        <strong>{pair.label}</strong>
        <em>{pair.vehicle}</em>
      </figcaption>
    </figure>
  );
}

/** Widest variant that exists for a stem. Never hardcode a width here: the
    manifest is the only thing that knows which files were actually produced. */
function src(stem: string): string {
  const meta = IMAGES[stem];
  const w = meta ? meta.widths[meta.widths.length - 1] : 640;
  return `/assets/images/${stem}-${w}.webp`;
}
