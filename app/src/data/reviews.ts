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
 * TO TURN REVIEWS ON: paste real ones into REVIEWS below. The rail switches
 * from proof points to reviews automatically the moment the array is non-empty
 * — no component or CSS change needed.
 *
 * Standing up a Google Business Profile is the first thing worth doing for this
 * client regardless. Thirty years of work with no profile means every search
 * for them lands on competitors who have one.
 */
export interface Review {
  quote: string;
  name: string;
  context: string;
  /** 1-5. Rendered as filled stars. */
  stars: number;
}

export const REVIEWS: Review[] = [];
