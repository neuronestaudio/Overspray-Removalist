/**
 * Proof points.
 *
 * This section exists because the review rail has nothing real to show yet.
 *
 * Searched for this business on Google, Google Maps, Yellow Pages,
 * ProductReview, DuckDuckGo and social: there is no Google Business Profile and
 * no published review anywhere. The only testimonial-shaped text in existence
 * is one unattributed sentence on their own site.
 *
 * So the rail carries claims the business already makes about itself, each
 * traceable to a page of the site being replaced, rather than quotes attributed
 * to customers who do not exist. Every `source` below names where the claim
 * comes from, so the client can confirm each one in the demo.
 *
 * When real Google reviews arrive they go in `reviews.ts` and the rail switches
 * to them on its own — see ReviewRail.
 */
export interface ProofPoint {
  /** Short brand-red kicker. */
  kicker: string;
  /** The claim, in the client's own terms. */
  body: string;
  /** Where the claim comes from, shown as the card's footer tag. */
  source: string;
}

export const PROOF: ProofPoint[] = [
  {
    kicker: 'Thirty years',
    body: 'Overspray removal and claims management since the early nineties. It is not a sideline of a detailing business, it is the whole business.',
    source: 'Company profile',
  },
  {
    kicker: 'No abrasives',
    body: 'Contamination comes off by hand using chemical and mechanical process, not cutting or polishing. The factory paint stays on the car.',
    source: 'Method',
  },
  {
    kicker: 'No respray',
    body: 'Nothing is repainted, so there is no colour match, no blend panels, and nothing to declare on the vehicle history.',
    source: 'Method',
  },
  {
    kicker: 'Claims managed',
    body: 'Assessment, quoting and the authorisation and release paperwork are handled end to end, direct with the insurer or the responsible party.',
    source: 'Insurance claims',
  },
  {
    kicker: 'Melbourne wide',
    body: 'Single vehicles come to the Epping workshop. Where an event hits a car park, a compound or a dealer yard, the lot is assessed where it sits.',
    source: 'Service area',
  },
  {
    kicker: 'Whole sites',
    body: 'Fallout events hit every car in the vicinity, not one. A multi-vehicle site is priced and worked as one job rather than car by car.',
    source: 'Fleet and construction',
  },
  {
    kicker: 'Eight contaminants',
    body: 'Paint overspray, cement and concrete splatter, iron filings and rail dust, soot, epoxy, urethane, polyurethane foam and graffiti.',
    source: 'Services',
  },
  {
    kicker: 'Not just cars',
    body: 'Trucks, boats, aircraft, plant, windows and building facades. Anything with a finish that something has landed on.',
    source: 'Services',
  },
];
