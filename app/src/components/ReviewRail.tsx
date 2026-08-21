import { REVIEWS } from '../data/reviews';
import { PROOF } from '../data/proof';

/**
 * Marquee of social proof, on the same seamless-loop pattern as the photo
 * rails: the track holds the set twice and translates exactly -50%, so the loop
 * point lands on an identical frame. The clone is hidden from assistive tech so
 * each card is announced once.
 *
 * Hovering pauses it, because chasing a moving paragraph to finish reading it
 * is a bad way to treat the only social proof on the page.
 *
 * Two modes, chosen by the data rather than by a flag:
 *   REVIEWS non-empty -> real customer reviews, with stars.
 *   REVIEWS empty     -> proof points from proof.ts.
 * The client has no reviews anywhere yet (see reviews.ts). Pasting real ones in
 * flips this over with no change here.
 */
export default function ReviewRail() {
  const showReviews = REVIEWS.length > 0;
  const count = showReviews ? REVIEWS.length : PROOF.length;
  if (!count) return null;

  /* Duration scales with the number of cards so the belt moves at the same
     speed whatever is on it, instead of sprinting when the set is small. */
  const duration = `${count * 11}s`;

  const reviewCard = (r: (typeof REVIEWS)[number], i: number, clone: boolean) => (
    <figure className="rev" key={`r${i}${clone ? '-c' : ''}`}>
      <div className="rev-stars" aria-hidden="true">
        {'★'.repeat(r.stars)}
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
    <div className="rail rev-rail">
      <div className="rail-track" style={{ ['--rail-duration' as string]: duration }}>
        {set(false)}
        <span className="rail-clone" aria-hidden="true">
          {set(true)}
        </span>
      </div>
    </div>
  );
}
