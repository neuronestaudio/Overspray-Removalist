/**
 * The five genuine before/after pairs.
 *
 * Every one of these is the same vehicle in both frames, checked against the
 * original site's gallery before being used. They are real job photos, not
 * locked-off studio shots, so the framing shifts between before and after.
 * That is why the components label the two states explicitly rather than
 * pretending the two photos are the same frame.
 *
 * Order matters: `hero` is the pair driving the scrub interaction and is the
 * only pair where both images exist at 1080px, which is what a full-bleed
 * background needs. The rest run in the switcher below the hero.
 */

export interface Pair {
  id: string;
  /** Short label for the switcher. */
  label: string;
  /** What the vehicle is, for the caption. */
  vehicle: string;
  beforeStem: string;
  afterStem: string;
  beforeAlt: string;
  afterAlt: string;
  caption: string;
  /** Service page this job belongs to. */
  href: string;
}

export const HERO_PAIR: Pair = {
  id: 'tarago',
  label: 'Paint overspray',
  vehicle: 'Toyota Tarago',
  beforeStem: 'job-tarago-before',
  afterStem: 'job-tarago-after',
  beforeAlt: 'Toyota van covered in dark paint overspray along the driver side',
  afterAlt: 'The same Toyota van after overspray removal, paint clean and undamaged',
  caption: 'Paint overspray across the full driver side. Removed by hand, no abrasives, factory paint untouched.',
  href: '/overspray-removal',
};

export const PAIRS: Pair[] = [
  {
    id: 'splatter',
    label: 'Paint splatter',
    vehicle: 'Holden Caprice',
    beforeStem: 'job-splatter-2',
    afterStem: 'job-splatter-after',
    beforeAlt: 'Black sedan covered in orange paint overspray across the roof and boot',
    afterAlt: 'The same black sedan after full overspray removal, back to gloss',
    caption: 'Industrial orange paint across the roof, glass and boot. No respray, no panel work.',
    href: '/overspray-removal',
  },
  {
    id: 'ute',
    label: 'Industrial fallout',
    vehicle: 'Holden ute',
    beforeStem: 'job-ute-1',
    afterStem: 'job-ute-after-1',
    beforeAlt: 'Blue Holden ute covered in industrial fallout speckling',
    afterAlt: 'The same blue Holden ute after fallout removal, paint restored to gloss',
    caption: 'Industrial fallout bonded into a blue duco. Decontaminated panel by panel.',
    href: '/industrial-fallout',
  },
  {
    id: 'merc',
    label: 'Fallout on white',
    vehicle: 'Mercedes A-Class',
    beforeStem: 'job-merc-1',
    afterStem: 'job-merc-after',
    beforeAlt: 'White Mercedes A-Class showing heavy fallout contamination on the rear quarter',
    afterAlt: 'The same white Mercedes A-Class after restoration, paint clean',
    caption: 'Fallout on white duco, where contamination shows worst. Restored without respraying.',
    href: '/industrial-fallout',
  },
  {
    id: 'audi',
    label: 'Graffiti',
    vehicle: 'Audi A6',
    beforeStem: 'job-audi-2',
    afterStem: 'job-audi-after',
    beforeAlt: 'Silver Audi sprayed with red graffiti paint across the doors and boot',
    afterAlt: 'The same silver Audi after graffiti removal, original paint intact',
    caption: 'Red aerosol over a silver Audi. Removed without touching the clear coat.',
    href: '/graffiti-removal',
  },
];


/**
 * Hero deck.
 *
 * Ceramic coating leads, because that is the market this business is moving
 * into and the deck is the first thing a visitor reads. The proof jobs follow
 * it: the coating card makes the offer, the four behind it are the evidence
 * that the paint underneath any coating will actually be clean.
 *
 * The deck cards only ever render `beforeStem`, so a service card sets both
 * stems to the same photo rather than the type needing a second shape.
 */
export const CERAMIC_CARD: Pair = {
  id: 'ceramic',
  label: 'Ceramic coating',
  vehicle: 'Paint protection',
  beforeStem: 'suv-black',
  afterStem: 'suv-black',
  beforeAlt: 'Black SUV finished to a deep gloss',
  afterAlt: 'Black SUV finished to a deep gloss',
  caption:
    'A coating is only as good as the paint under it. Thirty years of taking contamination off duco is exactly the preparation one needs.',
  href: '/ceramic-coating',
};

/* No ceramic card. The deck is the first thing a visitor touches, and the
   business does not advertise coating work — it takes it when asked. CERAMIC_CARD
   is kept above for whenever that changes. */
export const DECK: Pair[] = [HERO_PAIR, ...PAIRS];
