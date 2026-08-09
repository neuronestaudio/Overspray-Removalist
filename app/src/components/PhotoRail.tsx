import { useEffect, useRef } from 'react';
import { IMAGES } from '../data/images';
import type { GalleryItem } from '../data/gallery';

/**
 * Infinite photo rail.
 *
 * The track holds two copies of the set and translates by exactly -50%, so the
 * loop point lands on an identical frame and there is no visible jump. The
 * clone is aria-hidden, so each photo is announced once rather than twice.
 *
 * Drag-to-scrub is layered on top of the CSS animation rather than replacing
 * it: the animation is paused while the pointer is down and an offset is
 * applied, then it resumes from where the visitor left it. A JS-driven rail
 * would run on the main thread for the whole time it is on screen, which is
 * exactly the kind of thing that makes a phone drop frames while scrolling.
 */

interface Props {
  items: GalleryItem[];
  /** Seconds for one full pass. Longer reads calmer. */
  duration?: number;
  reverse?: boolean;
}

export default function PhotoRail({ items, duration = 64, reverse = false }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const startX = useRef(0);
  const offset = useRef(0);
  const startOffset = useRef(0);

  /* Pause the CSS animation on drag and translate manually, then hand it back.
     Reading the computed transform is what lets the animation resume from the
     dragged position instead of snapping back to its own timeline. */
  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const onDown = (e: PointerEvent) => {
      dragging.current = true;
      startX.current = e.clientX;
      startOffset.current = offset.current;
      track.style.animationPlayState = 'paused';
      viewport.classList.add('rail-dragging');
      try {
        viewport.setPointerCapture(e.pointerId);
      } catch {
        /* capture unsupported */
      }
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      offset.current = startOffset.current + (e.clientX - startX.current);
      track.style.setProperty('--drag', `${offset.current}px`);
    };
    const onUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      viewport.classList.remove('rail-dragging');
      track.style.animationPlayState = '';
    };

    viewport.addEventListener('pointerdown', onDown);
    viewport.addEventListener('pointermove', onMove);
    viewport.addEventListener('pointerup', onUp);
    viewport.addEventListener('pointercancel', onUp);
    viewport.addEventListener('pointerleave', onUp);
    return () => {
      viewport.removeEventListener('pointerdown', onDown);
      viewport.removeEventListener('pointermove', onMove);
      viewport.removeEventListener('pointerup', onUp);
      viewport.removeEventListener('pointercancel', onUp);
      viewport.removeEventListener('pointerleave', onUp);
    };
  }, []);

  const card = (item: GalleryItem, clone: boolean) => {
    const meta = IMAGES[item.stem];
    if (!meta) return null;
    const widest = meta.widths[meta.widths.length - 1];
    return (
      <figure className="rail-card" key={`${item.stem}${clone ? '-c' : ''}`}>
        <img
          src={`/assets/images/${item.stem}-${Math.min(640, widest)}.webp`}
          alt={clone ? '' : item.alt}
          width={meta.width}
          height={meta.height}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
        <span className="rail-glass" aria-hidden="true" />
      </figure>
    );
  };

  return (
    <div className="rail" ref={viewportRef} data-reverse={reverse ? 'true' : 'false'}>
      <div
        className="rail-track"
        ref={trackRef}
        style={{ ['--rail-duration' as string]: `${duration}s` }}
      >
        {items.map((i) => card(i, false))}
        <span className="rail-clone" aria-hidden="true">
          {items.map((i) => card(i, true))}
        </span>
      </div>
    </div>
  );
}
