import { REVIEWS, averageStars, type Review } from '../data/reviews';
import { PROOF } from '../data/proof';

/**
 * Social proof section, on the Premier booking-site pattern: an aggregate badge
 * over a seamless carousel of Google-style cards — avatar initial, name,
 * timeframe, stars, the quote, and the Google mark on each card.
 *
 * The track holds the set twice and translates exactly -50%, so the loop point
 * lands on an identical frame. The clone is hidden from assistive tech so each
 * card is announced once. Hovering pauses it, because chasing a moving
 * paragraph to finish reading it is a bad way to treat social proof.
 *
 * Two modes, chosen by the data rather than by a flag:
 *   REVIEWS non-empty -> the full treatment above.
 *   REVIEWS empty     -> proof points from proof.ts, same card chrome.
 *
 * The client has no reviews anywhere yet (see reviews.ts), so the second mode
 * is what ships today. Everything in the badge is computed from the array, so
 * there is no path by which this renders a rating the reviews do not support.
 */

function GoogleMark() {
  return (
    <svg className="rev-g" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4285F4" d="M45 24.5c0-1.6-.1-2.8-.4-4H24v7.3h12c-.2 2-1.5 5-4.4 7l6.7 5.2c4-3.7 6.7-9.1 6.7-15.5" />
      <path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.3l-6.9-5.4c-1.8 1.3-4.3 2.2-7.6 2.2-5.8 0-10.7-3.8-12.5-9.1l-7.1 5.5C8.1 41.1 15.5 46 24 46" />
      <path fill="#FBBC05" d="M11.5 28.4a13.5 13.5 0 0 1 0-8.7l-7.1-5.6a22 22 0 0 0 0 19.9z" />
      <path fill="#EA4335" d="M24 9.5c4.1 0 6.9 1.8 8.5 3.3l6.2-6C34.9 3.3 29.9 1 24 1 15.5 1 8.1 5.9 4.4 13l7.1 5.6C13.3 13.3 18.2 9.5 24 9.5" />
    </svg>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <span className="rev-stars" aria-label={`${n} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} data-on={i <= n ? 'true' : 'false'} aria-hidden="true">
          ★
        </span>
      ))}
    </span>
  );
}

export default function ReviewRail() {
  const showReviews = REVIEWS.length > 0;
  const count = showReviews ? REVIEWS.length : PROOF.length;
  if (!count) return null;

  const avg = averageStars();

  /* Duration scales with the number of cards so the belt moves at the same
     speed whatever is on it, instead of sprinting when the set is small. */
  const duration = `${count * 11}s`;

  const reviewCard = (r: Review, i: number, clone: boolean) => (
    <figure className="rev" key={`r${i}${clone ? '-c' : ''}`}>
      <div className="rev-head">
        <span className="rev-avatar" aria-hidden="true">
          {r.name.trim().charAt(0).toUpperCase()}
        </span>
        <span className="rev-who">
          <strong>{r.name}</strong>
          <span>{r.context ? `${r.context} · ${r.when}` : r.when}</span>
        </span>
        <GoogleMark />
      </div>
      <Stars n={r.stars} />
      <blockquote>
        <p>{r.quote}</p>
      </blockquote>
    </figure>
  );

  const proofCard = (p: (typeof PROOF)[number], i: number, clone: boolean) => (
    <figure className="rev rev-proof" key={`p${i}${clone ? '-c' : ''}`}>
      <div className="rev-kicker">{p.kicker}</div>
      <blockquote>
        <p>{p.body}</p>
      </blockquote>
      <figcaption>
        <span className="rev-source">{p.source}</span>
      </figcaption>
    </figure>
  );

  const set = (clone: boolean) =>
    showReviews
      ? REVIEWS.map((r, i) => reviewCard(r, i, clone))
      : PROOF.map((p, i) => proofCard(p, i, clone));

  return (
    <>
      {showReviews && avg !== null && (
        <div className="shell">
          <div className="rev-badge">
            <GoogleMark />
            <span className="rev-badge-score">{avg.toFixed(1)}</span>
            <Stars n={Math.round(avg)} />
            <span className="rev-badge-count">
              Based on {REVIEWS.length} {REVIEWS.length === 1 ? 'review' : 'reviews'}
            </span>
          </div>
        </div>
      )}

      <div className="rail rev-rail">
        <div className="rail-track" style={{ ['--rail-duration' as string]: duration }}>
          {set(false)}
          <span className="rail-clone" aria-hidden="true">
            {set(true)}
          </span>
        </div>
      </div>
    </>
  );
}
