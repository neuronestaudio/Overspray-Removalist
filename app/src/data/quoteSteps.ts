/**
 * Quote wizard options.
 *
 * Adapted from the Premier booking flow. The shape is the same (pick a card,
 * step forward), but the questions are the ones that actually price an
 * overspray job: what landed on it, how much of the vehicle it covers, how
 * many vehicles, and who is carrying the cost.
 *
 * That last one is the reason this form exists in five steps rather than one.
 * The audit found the three highest-value propositions in this business are
 * construction remediation, insurance claims and fleet volume work, and none
 * of them were visible anywhere. Asking who is handling it qualifies a
 * whole-lot job on the way in instead of after a phone call.
 *
 * Every `value` is what reaches the CRM. Keep them stable: they have to match
 * the dropdown values configured in GoHighLevel exactly, or the custom field
 * saves blank without complaining.
 */

export interface Choice {
  value: string;
  label: string;
  hint: string;
}

/**
 * Step one. Not "what landed on it" any more: the business now sells
 * protection work as well as removal, and a contaminant list has nowhere to put
 * a customer who wants their new car coated.
 *
 * The two protection entries change the shape of the rest of the form — see
 * isProtectionJob — because "how much of it is covered" and "when did it
 * happen" are removal questions that mean nothing on a coating job.
 */
export const CONTAMINANTS: Choice[] = [
  { value: 'paint_overspray', label: 'Paint overspray', hint: 'Spray painting, roller work, a wind change' },
  { value: 'cement_splatter', label: 'Cement or concrete', hint: 'Slab pour splatter, lime staining' },
  { value: 'graffiti', label: 'Graffiti', hint: 'Aerosol on a vehicle, plant or property' },
  { value: 'industrial_fallout', label: 'Industrial fallout', hint: 'Iron filings, rail dust, soot' },
  { value: 'acid_rain', label: 'Acid rain or chemical', hint: 'Etching, chemical fallout' },
  { value: 'ceramic_coating', label: 'Ceramic coating', hint: 'Protect the paint on a clean or corrected car' },
  { value: 'paint_protection', label: 'Paint protection film', hint: 'Clear film over the panels that cop the damage' },
  { value: 'not_sure', label: 'Not sure yet', hint: 'Send photos and we will identify it' },
];

/** Jobs where nothing has to come off, so the removal questions do not apply. */
export function isProtectionJob(value: string): boolean {
  return value === 'ceramic_coating' || value === 'paint_protection';
}

/**
 * What the customer wants covered.
 *
 * Deliberately scope, not named product tiers. This business has not signed off
 * a coating range, a film brand or a price list, and a quote form is not the
 * place to invent one — asking what they want covered is honest, and it is the
 * answer that actually moves the number.
 */
export const CERAMIC_SCOPE: Choice[] = [
  { value: 'exterior', label: 'Exterior paint', hint: 'Every painted panel' },
  { value: 'exterior_wheels', label: 'Exterior and wheels', hint: 'Panels, wheels and calipers' },
  { value: 'exterior_glass_trim', label: 'Exterior, glass and trim', hint: 'Panels plus glass and plastics' },
  { value: 'not_sure', label: 'Not sure yet', hint: 'Recommend what suits the car' },
];

export const PPF_SCOPE: Choice[] = [
  { value: 'front_partial', label: 'Front end', hint: 'Bonnet leading edge, bumper, mirrors' },
  { value: 'front_full', label: 'Full front', hint: 'Full bonnet, guards, bumper, mirrors' },
  { value: 'full_body', label: 'Full body', hint: 'Every painted panel' },
  { value: 'not_sure', label: 'Not sure yet', hint: 'Recommend what suits the car' },
];

/** Coatings and film both sit on whatever is under them, so this drives price. */
export const PAINT_CONDITION: Choice[] = [
  { value: 'new', label: 'New or near new', hint: 'Delivery miles, nothing to correct' },
  { value: 'good', label: 'Good', hint: 'Light swirls, no real defects' },
  { value: 'needs_work', label: 'Needs correction first', hint: 'Swirls, scratches or oxidation' },
  { value: 'not_sure', label: 'Not sure', hint: 'Photos will show it' },
];

export const LOCATION_TYPES: Choice[] = [
  { value: 'on_site', label: 'Come to us', hint: 'We work on site, all suburbs, Australia wide' },
  { value: 'drop_off', label: 'I can bring it in', hint: 'Drop off at Epping VIC 3076' },
];

export const COVERAGE: Choice[] = [
  { value: 'light', label: 'Light', hint: 'A dusting, or one or two panels' },
  { value: 'partial', label: 'Partial', hint: 'One side, or the top surfaces' },
  { value: 'full', label: 'Full coverage', hint: 'Whole vehicle, including glass and trims' },
  { value: 'not_sure', label: 'Not sure', hint: 'Hard to tell, photos will show it' },
];

export const WHEN_HAPPENED: Choice[] = [
  { value: 'days', label: 'In the last few days', hint: 'Still fresh' },
  { value: 'weeks', label: 'A few weeks ago', hint: 'Starting to bond' },
  { value: 'months', label: 'Months ago or longer', hint: 'Fully cured' },
  { value: 'unknown', label: 'I do not know', hint: 'Found it like that' },
];

export const HANDLED_BY: Choice[] = [
  { value: 'vehicle_owner', label: 'I own the vehicle', hint: 'Paying for it myself' },
  { value: 'insurance_claim', label: 'Insurance claim', hint: 'We handle the forms and the assessor' },
  { value: 'construction', label: 'Construction or concreting', hint: 'Our site caused it' },
  { value: 'fleet_dealer', label: 'Fleet or dealership', hint: 'Multiple vehicles, one owner' },
];

/* "Job", not "Damage": step one now covers protection work, where nothing is
   damaged. */
export const STEPS = ['Job', 'Location', 'Vehicle', 'Photos', 'Details'] as const;
