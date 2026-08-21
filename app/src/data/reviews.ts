/**
 * Reviews.
 *
 * Deliberately empty.
 *
 * This business has no Google Business Profile and no published review on any
 * platform — checked against Google, Google Maps, Yellow Pages, ProductReview
 * and social. Rather than ship invented quotes attributed to customers who do
 * not exist, the rail falls back to verifiable proof points (see proof.ts).
 *
 * TO TURN REVIEWS ON: paste real ones into REVIEWS below. The section switches
 * from proof points to the full Google-style treatment on its own — cards with
 * avatar, name, timeframe and stars, plus the aggregate badge above them. No
 * component or CSS change needed.
 *
 * The aggregate is COMPUTED from this array. There is no hardcoded rating or
 * review count anywhere, so the badge can never claim a score the reviews below
 * do not add up to.
 *
 * Standing up a Google Business Profile is the first thing worth doing for this
 * client regardless. Thirty years of work with no profile means every search
 * for them lands on a competitor who has one.
 */
export interface Review {
  /** The review body, as written. */
  quote: string;
  /** Reviewer's display name. The avatar initial is derived from it. */
  name: string;
  /** Relative time, as Google shows it: "3 weeks ago", "2 months ago". */
  when: string;
  /** 1-5. */
  stars: number;
  /** What the job was. Optional; shown under the name when present. */
  context?: string;
}

export const REVIEWS: Review[] = [];

/** Average rating to one decimal, or null when there is nothing to average. */
export function averageStars(list: Review[] = REVIEWS): number | null {
  if (!list.length) return null;
  return Math.round((list.reduce((n, r) => n + r.stars, 0) / list.length) * 10) / 10;
}
