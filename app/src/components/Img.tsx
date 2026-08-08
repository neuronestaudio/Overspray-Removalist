import { IMAGES } from '../data/images';

interface ImgProps {
  /** Image stem, e.g. "job-tarago-before". No width, no extension. */
  stem: string;
  alt: string;
  /** Passed straight to sizes. Default assumes a full-width block. */
  sizes?: string;
  className?: string;
  /** Set on the LCP image only. Everything else stays lazy. */
  priority?: boolean;
}

/**
 * Responsive image bound to the generated manifest.
 *
 * Components name a stem, never a file. The widths come from what the asset
 * pipeline actually produced, so a component cannot request a variant that was
 * never generated: the old approach hardcoded `-1200.webp` in JSX and quietly
 * 404'd on every source narrower than 1200px.
 *
 * width/height are always emitted so the browser can reserve the box before the
 * bytes arrive, which is what keeps layout shift at zero.
 */
export default function Img({ stem, alt, sizes = '100vw', className, priority }: ImgProps) {
  const meta = IMAGES[stem];

  if (!meta) {
    /* Loud in development, harmless in production. A missing stem is a typo or
       a deleted source, and silently rendering nothing hides both. */
    if (import.meta.env?.DEV) {
      throw new Error(`<Img stem="${stem}"> is not in the image manifest. Run build/assets.py.`);
    }
    return null;
  }

  const largest = meta.widths[meta.widths.length - 1];
  const srcSet = meta.widths.map((w) => `/assets/images/${stem}-${w}.webp ${w}w`).join(', ');

  return (
    <img
      src={`/assets/images/${stem}-${largest}.webp`}
      srcSet={srcSet}
      sizes={sizes}
      width={meta.width}
      height={meta.height}
      alt={alt}
      className={className}
      decoding="async"
      {...(priority ? { fetchPriority: 'high' as const } : { loading: 'lazy' as const })}
    />
  );
}

/** Absolute URL for a stem, for og:image and other meta tags. */
export function imageUrl(origin: string, stem: string): string {
  const meta = IMAGES[stem];
  if (!meta) return '';
  const largest = meta.widths[meta.widths.length - 1];
  return `${origin}/assets/images/${stem}-${largest}.webp`;
}
