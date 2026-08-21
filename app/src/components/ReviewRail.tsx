import { REVIEWS } from '../data/reviews';

/**
 * Review marquee, on the same seamless-loop pattern as the photo rails: the
 * track holds the set twice and translates exactly -50%, so the loop point
 * lands on an identical frame. The clone is hidden from assistive tech so each
 * review is announced once.
 *
 * Hovering pauses it, because chasing a moving paragraph to finish reading it
 * is a bad way to treat the only social proof on the page.
 */
export default function ReviewRail() {
  if (!REVIEWS.length) return null;
  const anyPlaceholder = REVIEWS.some((r) => r.placeholder);

  const card = (r: (typeof REVIEWS)[number], i: number, clone: boolean) => (
    <figure className="rev" key={`${i}${clone ? '-c' : ''}`}>
      <div className="rev-stars" aria-hidden="true">
        {'\u2605'.repeat(r.stars)}
      </div>
      <blockquote>
        <p>{r.quote}</p>
      </blockquote>
      <figcaption>
        <strong>{r.name}</strong>
        <span>{r.context}</span>
      </figcaption>
    </figure>
  );

  return (
    <>
      {anyPlaceholder && (
        <p className="rev-warning" role="note">
          Placeholder reviews for demonstration. Replace with real Google reviews before launch.
        </p>
      )}
      <div className="rail rev-rail">
        <div className="rail-track" style={{ ['--rail-duration' as string]: '68s' }}>
          {REVIEWS.map((r, i) => card(r, i, false))}
          <span className="rail-clone" aria-hidden="true">
            {REVIEWS.map((r, i) => card(r, i, true))}
          </span>
        </div>
      </div>
    </>
  );
}
