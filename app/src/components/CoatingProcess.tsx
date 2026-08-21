import { useCallback, useEffect, useRef, useState } from 'react';
import { COATING_STAGES } from '../data/coatingStages';

/**
 * The ceramic coating process as a four-stage carousel, each stage backed by
 * its own looping clip.
 *
 * Video handling is the whole trick here. Four clips is 3MB, which is not
 * something to hand a phone on a landing page. So:
 *   - every <video> starts with no src at all and preload="none"
 *   - the poster still paints, so the section looks finished before any of it
 *     loads and never shows an empty box
 *   - an IntersectionObserver attaches sources only when the section is
 *     actually approached, and only for the active clip plus the next one
 *   - only the visible clip plays; the rest are paused, so a phone decodes one
 *     stream rather than four
 *
 * Under prefers-reduced-motion nothing loads or plays and the posters carry it,
 * which is also the fallback when autoplay is refused.
 */

const AUTO_MS = 7000;

export default function CoatingProcess() {
  const [active, setActive] = useState(0);
  const [engaged, setEngaged] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const timer = useRef<number | undefined>(undefined);
  const interacted = useRef(false);

  const last = COATING_STAGES.length - 1;

  const go = useCallback(
    (i: number, byUser = false) => {
      if (byUser) interacted.current = true;
      setActive(((i % COATING_STAGES.length) + COATING_STAGES.length) % COATING_STAGES.length);
    },
    [],
  );

  /* Load nothing until the section is approached. */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setEngaged(true);
          io.disconnect();
        }
      },
      { rootMargin: '300px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* Attach sources for the active clip and the one after it, never all four. */
  useEffect(() => {
    if (!engaged) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    [active, (active + 1) % COATING_STAGES.length].forEach((i) => {
      const v = videoRefs.current[i];
      if (!v) return;
      const want = `/assets/video/stage-${COATING_STAGES[i].n}.mp4`;
      if (!v.getAttribute('src')) {
        v.setAttribute('src', want);
        v.load();
      }
    });

    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === active) {
        /* Autoplay can be refused; the poster is already showing, so a rejected
           promise needs no handling beyond not throwing. */
        void v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }, [active, engaged]);

  /* Auto-advance until someone takes control, then stop for good. */
  useEffect(() => {
    if (!engaged || interacted.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    timer.current = window.setTimeout(() => go((active + 1) % COATING_STAGES.length), AUTO_MS);
    return () => window.clearTimeout(timer.current);
  }, [active, engaged, go]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(active - 1, true);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(active + 1, true);
    }
  }

  const stage = COATING_STAGES[active];

  return (
    <section className="coat" ref={sectionRef} aria-labelledby="coat-title">
      <div className="coat-media" aria-hidden="true">
        {COATING_STAGES.map((s, i) => (
          <video
            key={s.n}
            ref={(el) => {
              videoRefs.current[i] = el;
            }}
            className="coat-vid"
            data-on={i === active ? 'true' : 'false'}
            poster={`/assets/video/stage-${s.n}.jpg`}
            muted
            playsInline
            loop
            preload="none"
          />
        ))}
        <span className="coat-scrim" />
        <span className="coat-word">{stage.word}</span>
      </div>

      <div className="shell coat-inner">
        <div className="coat-head">
          <p className="eyebrow">Ceramic coating</p>
          <h2 className="display" id="coat-title">
            Four stages, <span className="hl">one finish</span>
          </h2>
          <p className="lede">
            A coating is only as good as what goes under it. Thirty years of taking contamination
            off duco is exactly the preparation a coating needs.
          </p>
        </div>

        <div
          className="coat-panel"
          role="group"
          aria-label="Coating process stages"
          tabIndex={0}
          onKeyDown={onKeyDown}
        >
          <div className="coat-card" key={stage.n}>
            <span className="coat-n">{String(stage.n).padStart(2, '0')}</span>
            <div className="coat-txt">
              <h3>{stage.heading}</h3>
              <p>{stage.body}</p>
            </div>
          </div>

          <div className="coat-controls">
            <button
              type="button"
              className="coat-arrow"
              onClick={() => go(active - 1, true)}
              aria-label="Previous stage"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>

            <div className="coat-pips" role="tablist" aria-label="Coating stages">
              {COATING_STAGES.map((s, i) => (
                <button
                  key={s.n}
                  type="button"
                  role="tab"
                  className="coat-pip"
                  aria-selected={i === active}
                  aria-label={s.label}
                  onClick={() => go(i, true)}
                >
                  <span aria-hidden="true">{s.label}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              className="coat-arrow"
              onClick={() => go(active + 1, true)}
              aria-label="Next stage"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
          </div>

          <p className="coat-count" aria-live="polite">
            Stage {active + 1} of {last + 1} &mdash; {stage.label}
          </p>
        </div>
      </div>
    </section>
  );
}
