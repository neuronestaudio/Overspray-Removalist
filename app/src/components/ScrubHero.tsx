import { useCallback, useEffect, useRef, useState } from 'react';
import { IMAGES } from '../data/images';
import type { Pair } from '../data/pairs';

/**
 * The hero interaction: the damaged vehicle sits on a canvas over the restored
 * one, and the visitor wipes it off with a pointer or a finger.
 *
 * The argument this site has to make is "if they can get concrete off a car,
 * they can fix mine", and that argument is far better made by hand than in a
 * sentence. So the headline claim is a physical demonstration.
 *
 * Notes that matter:
 * - touch-action is pan-y, not none. A full-height hero that swallows vertical
 *   drags traps mobile visitors above the fold; vertical still scrolls the page
 *   and horizontal-ish drags scrub, which is the natural wiping gesture anyway.
 * - Both photos are real <img> elements underneath, so the pre-rendered HTML
 *   carries them and a crawler or a no-JS visitor still sees the before/after.
 *   The canvas is layered on top and only ever activated client-side.
 * - Coverage is tracked on a coarse grid rather than by reading pixels back.
 *   getImageData on every pointer move is a main-thread stall on mobile.
 */

const GRID_X = 28;
const GRID_Y = 16;
/* Fraction of the grid that must be wiped before it finishes itself.
   Tuned by measurement rather than feel: a single straight pass across the hero
   clears about 12% of the canvas, and two full sweeps land near 35% of cells.
   0.34 therefore completes on the second deliberate pass. High enough that it
   is clearly the visitor doing the work, low enough that nobody has to colour
   in the whole panel to get the payoff. */
const COMPLETE_AT = 0.34;
const BRUSH_RATIO = 0.09; // of the smaller edge

interface Props {
  pair: Pair;
  onComplete?: () => void;
}

export default function ScrubHero({ pair, onComplete }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const beforeImgRef = useRef<HTMLImageElement>(null);

  const cells = useRef<Uint8Array>(new Uint8Array(GRID_X * GRID_Y));
  const painted = useRef(false);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const doneRef = useRef(false);

  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);

  const beforeMeta = IMAGES[pair.beforeStem];

  /** Paint the damaged photo across the canvas, object-fit: cover style. */
  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const img = beforeImgRef.current;
    if (!canvas || !wrap || !img || !img.complete || img.naturalWidth === 0) return;

    const rect = wrap.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);

    // cover maths
    const ir = img.naturalWidth / img.naturalHeight;
    const cr = rect.width / rect.height;
    let dw = rect.width;
    let dh = rect.height;
    if (ir > cr) dw = rect.height * ir;
    else dh = rect.width / ir;
    ctx.drawImage(img, (rect.width - dw) / 2, (rect.height - dh) / 2, dw, dh);

    painted.current = true;
  }, []);

  /* Paint once the image has decoded, and repaint on resize. A resize resets the
     wipe, which is the honest trade: preserving a mask across a re-layout costs
     an offscreen buffer and nobody rotates their phone mid-wipe on purpose. */
  useEffect(() => {
    const img = beforeImgRef.current;
    if (!img) return;

    let cancelled = false;
    const start = () => {
      if (cancelled) return;
      cells.current = new Uint8Array(GRID_X * GRID_Y);
      doneRef.current = false;
      setDone(false);
      setStarted(false);
      paint();
      setReady(true);
    };

    if (img.complete && img.naturalWidth > 0) start();
    else img.addEventListener('load', start, { once: true });

    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(start);
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      img.removeEventListener('load', start);
    };
  }, [paint, pair.beforeStem]);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setDone(true);
    onComplete?.();
  }, [onComplete]);

  const erase = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      const wrap = wrapRef.current;
      if (!canvas || !wrap || !painted.current || doneRef.current) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = wrap.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const r = Math.min(rect.width, rect.height) * BRUSH_RATIO;

      ctx.globalCompositeOperation = 'destination-out';

      /* Join to the previous point so a fast drag leaves a stroke rather than a
         dotted trail at the pointer's sample rate. */
      const prev = last.current;
      if (prev) {
        ctx.lineWidth = r * 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      last.current = { x, y };

      // coarse coverage
      const cx = Math.floor((x / rect.width) * GRID_X);
      const cy = Math.floor((y / rect.height) * GRID_Y);
      const spanX = Math.max(1, Math.round((r / rect.width) * GRID_X));
      const spanY = Math.max(1, Math.round((r / rect.height) * GRID_Y));
      for (let j = cy - spanY; j <= cy + spanY; j++) {
        for (let i = cx - spanX; i <= cx + spanX; i++) {
          if (i < 0 || j < 0 || i >= GRID_X || j >= GRID_Y) continue;
          cells.current[j * GRID_X + i] = 1;
        }
      }

      let hit = 0;
      for (let i = 0; i < cells.current.length; i++) hit += cells.current[i];
      if (hit / cells.current.length >= COMPLETE_AT) finish();
    },
    [finish],
  );

  function onPointerDown(e: React.PointerEvent) {
    if (doneRef.current) return;
    drawing.current = true;
    last.current = null;
    setStarted(true);
    erase(e.clientX, e.clientY);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (doneRef.current) return;
    // Hovering with a mouse wipes too; a finger has to be down.
    if (e.pointerType === 'mouse' || drawing.current) {
      if (!started) setStarted(true);
      erase(e.clientX, e.clientY);
    }
  }
  function endStroke() {
    drawing.current = false;
    last.current = null;
  }

  function reset() {
    cells.current = new Uint8Array(GRID_X * GRID_Y);
    doneRef.current = false;
    setDone(false);
    setStarted(false);
    paint();
  }

  return (
    <div className="scrub" ref={wrapRef}>
      {/* Restored vehicle: the layer being revealed. */}
      <img
        className="scrub-layer scrub-after"
        src={`/assets/images/${pair.afterStem}-1080.webp`}
        alt={pair.afterAlt}
        width={IMAGES[pair.afterStem]?.width}
        height={IMAGES[pair.afterStem]?.height}
        fetchPriority="high"
        decoding="async"
      />

      {/* Damaged vehicle: real markup for crawlers and no-JS, hidden once the
          canvas has taken over so the two are never both visible. */}
      <img
        ref={beforeImgRef}
        className="scrub-layer scrub-before"
        src={`/assets/images/${pair.beforeStem}-1080.webp`}
        alt={pair.beforeAlt}
        width={beforeMeta?.width}
        height={beforeMeta?.height}
        fetchPriority="high"
        decoding="async"
        data-hidden={ready ? 'true' : 'false'}
      />

      <canvas
        ref={canvasRef}
        className="scrub-canvas"
        data-done={done ? 'true' : 'false'}
        aria-hidden="true"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endStroke}
        onPointerLeave={endStroke}
        onPointerCancel={endStroke}
      />

      <div className="scrub-tags" aria-hidden="true">
        <span className="tag-before" data-off={done ? 'true' : 'false'}>
          Overspray
        </span>
        <span className="tag-after" data-on={done ? 'true' : 'false'}>
          Restored
        </span>
      </div>

      {!started && !done && (
        <div className="scrub-hint" aria-hidden="true">
          <span className="scrub-hint-dot" />
          Drag to clean the paint off
        </div>
      )}

      {done && (
        <button className="scrub-reset" type="button" onClick={reset}>
          Put it back
        </button>
      )}
    </div>
  );
}
