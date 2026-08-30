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
 * Step one: what is on the vehicle.
 *
 * Removal only. Coating and film are not services this business advertises, so
 * they are not offered here either — a form that lists them is advertising them.
 */
export const CONTAMINANTS: Choice[] = [
  {
    value: 'paint_overspray',
    label: 'Paint overspray',
    hint: 'Spray painting, roller work, graffiti, a wind change',
  },
  { value: 'cement_splatter', label: 'Cement or concrete', hint: 'Slab pour splatter, lime staining' },
  {
    value: 'industrial_fallout',
    label: 'Industrial / environmental fallout',
    hint: 'Metal dust, rail dust, soot, chemical or airborne contamination',
  },
  {
    value: 'roadwork',
    label: 'Roadwork contamination',
    hint: 'Road paint, tar, bitumen or asphalt residue',
  },
  {
    value: 'insurance_claim',
    label: 'Insurance claim',
    hint: 'Assessment and paperwork handled with the insurer',
  },
  {
    value: 'commercial_fleet',
    label: 'Commercial fleet',
    hint: 'Several vehicles or a whole site, priced as one job',
  },
  { value: 'not_sure', label: 'Not sure yet', hint: "Send photos and we'll identify the problem" },
];

/**
 * Two of the choices above are not contaminants, they are who is carrying the
 * job — which is the question step five asks. Picking one here answers that
 * question, so it is carried straight across rather than asked twice.
 */
export const HANDLED_BY_FROM_JOB: Record<string, string> = {
  insurance_claim: 'insurance_claim',
  commercial_fleet: 'fleet_dealer',
};

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
/* Timing is step two on purpose. It is the question whose answer decides how
   urgent the job is, and asking it early sets the tone of the rest. */
export const STEPS = ['Job', 'Timing', 'Vehicle', 'Photos', 'Details'] as const;
