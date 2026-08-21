/**
 * The ceramic coating process, in four stages.
 *
 * PROVENANCE
 *
 * The four background clips are Dion's own footage, reused from the Formula
 * build. They are unbranded process shots — foam, machine correction, a
 * corrected panel, an applicator — with no logo and no identifiable vehicle,
 * and they are greyscale in the source rather than by CSS filter.
 *
 * The stage names and the order are the standard coating process and are not
 * anyone's intellectual property. What has deliberately NOT been carried over
 * is the other site's stage three copy, which names specific products and
 * specifications — a particular graphene coating at 1000nm and 10H, a quartz
 * coating at 800nm and grade 3 chemical resistance.
 *
 * Those are that business's products. This client has not signed off a coating
 * range, so stage three below describes what a coating does rather than naming
 * one. If he confirms he runs the same products, the specifics belong here and
 * nowhere else.
 */
export interface CoatingStage {
  /** Big ghost word behind the card. */
  word: string;
  /** Short label for the pip's accessible name. */
  label: string;
  heading: string;
  body: string;
  /** 1-4, matching /assets/video/stage-N.mp4 */
  n: number;
}

export const COATING_STAGES: CoatingStage[] = [
  {
    n: 1,
    word: 'Decontaminate',
    label: 'Decontaminate',
    heading: 'The surface has to be genuinely clean first',
    body:
      'Pressure wash to lift loose dirt, hand wash, rinse, then clay to pull bonded contamination out of the paint. A coating bonds to whatever it is laid on. Sealing fallout or overspray under it locks the damage in permanently — which is the failure we get called to undo.',
  },
  {
    n: 2,
    word: 'Correct',
    label: 'Correct',
    heading: 'Swirls, scratches and dullness, gone',
    body:
      'Machine cut takes out scratches, spider webbing and oxidation, then a machine glaze de-swirls the finish and brings the gloss back. Whatever the paint looks like at this point is what the coating locks in, so correction is not an upsell — it is the step that decides the result.',
  },
  {
    n: 3,
    word: 'Coat',
    label: 'Coat',
    heading: 'Chemically bonded to the clear coat',
    body:
      'A liquid polymer is laid over the corrected finish and chemically bonds to the duco, curing into a hard, semi-permanent layer rather than sitting on top like a wax. Glass, wheels and interior surfaces take their own coatings, matched to what each one has to survive.',
  },
  {
    n: 4,
    word: 'Protect',
    label: 'Protect',
    heading: 'A barrier between your paint and the road',
    body:
      'The cured layer is hydrophobic: water beads and carries dirt off with it. The car stays cleaner longer, washes and dries far more easily, holds a deeper gloss, and resists wash marks, bird droppings, road film and UV. Maintenance from there is minimal.',
  },
];
