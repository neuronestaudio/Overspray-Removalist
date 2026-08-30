/**
 * Service areas.
 *
 * WHY EACH ENTRY CARRIES REAL LOCAL DETAIL
 *
 * A suburb page whose only local content is the suburb name is a doorway page.
 * Google has treated those as spam since 2015, and forty of them would put this
 * domain at more risk than having no suburb pages at all.
 *
 * So every entry below names the thing in that suburb that actually produces
 * the work: a freight terminal, a refinery, a quarry, a rail corridor, a tower
 * crane, a housing estate mid-build. Those are real and they differ, which is
 * what makes each page worth indexing. `cause` is the specific contamination
 * that source throws, and it drives which service the page leads with.
 *
 * If you add a suburb and cannot name a genuine local source, do not add it.
 */
export type Region = 'North' | 'West' | 'Inner' | 'East' | 'South-East';

export interface Area {
  slug: string;
  /** Suburb name as people write it. */
  name: string;
  postcode: string;
  region: Region;
  /** Roughly, by road from the Epping workshop. Used in the travel line. */
  kmFromBase: number;
  /** The local source of the work. One or two sentences, specific, true. */
  local: string;
  /** Slugs of the services this area leads with, most relevant first. */
  leads: string[];
}

export const AREAS: Area[] = [
  /* ---------------- North: home ground ---------------- */
  {
    slug: 'epping',
    name: 'Epping',
    postcode: '3076',
    region: 'North',
    kmFromBase: 0,
    local:
      'The workshop is here. Cooper Street runs one of the largest industrial precincts in the northern suburbs, and between the fabrication yards, the spray shops and the constant slab pours on the estates behind it, most of the fallout work we see starts within a few kilometres of the door.',
    leads: ['overspray-removal', 'cement-splatter-removal', 'industrial-fallout'],
  },
  {
    slug: 'thomastown',
    name: 'Thomastown',
    postcode: '3074',
    region: 'North',
    kmFromBase: 6,
    local:
      'Thomastown is dense with light industry — panel shops, powder coaters and fabricators packed tight against residential streets. Overspray here rarely travels far; it usually comes from a roller door two doors down that was left open on a windy afternoon.',
    leads: ['overspray-removal', 'industrial-fallout'],
  },
  {
    slug: 'campbellfield',
    name: 'Campbellfield',
    postcode: '3061',
    region: 'North',
    kmFromBase: 9,
    local:
      'Heavy industry along the Hume Highway corridor, with truck yards, spray booths and metal fabrication running side by side. Iron filings and weld spatter off open yards are as common here as paint.',
    leads: ['industrial-fallout', 'overspray-removal'],
  },
  {
    slug: 'somerton',
    name: 'Somerton',
    postcode: '3062',
    region: 'North',
    kmFromBase: 11,
    local:
      'The Somerton freight terminal moves containers between rail and road all day. Rail dust — fine iron particles thrown off wheels and brakes — settles on everything parked near an active line, and it rusts into clear coat rather than sitting on it.',
    leads: ['industrial-fallout', 'overspray-removal'],
  },
  {
    slug: 'broadmeadows',
    name: 'Broadmeadows',
    postcode: '3047',
    region: 'North',
    kmFromBase: 12,
    local:
      'Decades of manufacturing have left Broadmeadows with large industrial sites in constant redevelopment. Demolition dust, concrete cutting and render overspray off the new builds are the usual causes here.',
    leads: ['cement-splatter-removal', 'industrial-fallout'],
  },
  {
    slug: 'craigieburn',
    name: 'Craigieburn',
    postcode: '3064',
    region: 'North',
    kmFromBase: 12,
    local:
      'Estates are still going up across Craigieburn, which means slab pours, rendering and kerb-and-channel work on streets where people park on the road. Cement splatter down one side of a car is the single most common job we take here.',
    leads: ['cement-splatter-removal', 'overspray-removal'],
  },
  {
    slug: 'kalkallo',
    name: 'Kalkallo',
    postcode: '3064',
    region: 'North',
    kmFromBase: 10,
    local:
      'The Merrifield business park is being built out across open ground, which means tilt-slab pours, line marking and render on land with nothing between the work and the road. Distribution warehouses go up here faster than the landscaping does.',
    leads: ['cement-splatter-removal', 'fleet-and-construction'],
  },
  {
    slug: 'roxburgh-park',
    name: 'Roxburgh Park',
    postcode: '3064',
    region: 'North',
    kmFromBase: 11,
    local:
      'Housing estates hard against the Hume Highway freight corridor. Trucks throw road film and brake dust off the highway, and the estates behind it are still finishing, so both causes run at once.',
    leads: ['industrial-fallout', 'cement-splatter-removal'],
  },
  {
    slug: 'wollert',
    name: 'Wollert',
    postcode: '3750',
    region: 'North',
    kmFromBase: 7,
    local:
      'Wollert is one of the fastest-growing estates in the state, and almost every street has a build on it. Render and texture coat carry a long way off a spray gun in an open paddock with nothing to stop the wind.',
    leads: ['cement-splatter-removal', 'overspray-removal'],
  },
  {
    slug: 'mernda',
    name: 'Mernda',
    postcode: '3754',
    region: 'North',
    kmFromBase: 12,
    local:
      'New housing on one side and the end of the Mernda rail line on the other. Fresh concrete work and rail dust are both live causes here, and they need completely different treatment.',
    leads: ['cement-splatter-removal', 'industrial-fallout'],
  },
  {
    slug: 'south-morang',
    name: 'South Morang',
    postcode: '3752',
    region: 'North',
    kmFromBase: 6,
    local:
      'Established streets sitting next to land still being developed. Most South Morang jobs come from a neighbouring build — a render crew, a driveway pour, or a fence being sprayed on a windy day.',
    leads: ['cement-splatter-removal', 'overspray-removal'],
  },
  {
    slug: 'lalor',
    name: 'Lalor',
    postcode: '3075',
    region: 'North',
    kmFromBase: 3,
    local:
      'Lalor sits directly against the Epping industrial precinct, so it catches the drift from whatever is being sprayed or cut on the other side of the boundary. It is also the closest suburb to our workshop, which usually means same-week turnaround.',
    leads: ['overspray-removal', 'industrial-fallout'],
  },
  {
    slug: 'mill-park',
    name: 'Mill Park',
    postcode: '3082',
    region: 'North',
    kmFromBase: 5,
    local:
      'Largely built out, so the work here is renovation rather than construction: re-roofing, repainting and driveway replacement, all of it happening in driveways with cars parked either side.',
    leads: ['overspray-removal', 'cement-splatter-removal'],
  },
  {
    slug: 'bundoora',
    name: 'Bundoora',
    postcode: '3083',
    region: 'North',
    kmFromBase: 8,
    local:
      'Campus car parks and apartment developments along Plenty Road. Cars left in one spot all day are the ones that cop a full coat of whatever is being sprayed or cut nearby.',
    leads: ['overspray-removal', 'cement-splatter-removal'],
  },
  {
    slug: 'reservoir',
    name: 'Reservoir',
    postcode: '3073',
    region: 'North',
    kmFromBase: 10,
    local:
      'Older housing being knocked down for townhouses street by street, with the Mernda line running through the middle of it. Concrete slurry and rail dust both turn up here regularly.',
    leads: ['cement-splatter-removal', 'industrial-fallout'],
  },
  {
    slug: 'preston',
    name: 'Preston',
    postcode: '3072',
    region: 'North',
    kmFromBase: 13,
    local:
      'Infill development on narrow streets where there is nowhere to park except beside the build. Rendering and spray painting on a two-storey townhouse puts a fine mist over everything within twenty metres.',
    leads: ['overspray-removal', 'cement-splatter-removal'],
  },
  {
    slug: 'coburg',
    name: 'Coburg',
    postcode: '3058',
    region: 'North',
    kmFromBase: 16,
    local:
      'The Upfield line and the level crossing works along it generate steel dust and concrete cutting residue. Cars parked near the corridor pick up both.',
    leads: ['industrial-fallout', 'cement-splatter-removal'],
  },
  {
    slug: 'fawkner',
    name: 'Fawkner',
    postcode: '3060',
    region: 'North',
    kmFromBase: 15,
    local:
      'The industrial pocket along Sydney Road runs fabrication and coating work a street away from housing, and the Upfield line runs through the middle of it. Overspray and rail dust are both regular here.',
    leads: ['overspray-removal', 'industrial-fallout'],
  },
  {
    slug: 'glenroy',
    name: 'Glenroy',
    postcode: '3046',
    region: 'North',
    kmFromBase: 17,
    local:
      'Level crossing removal work along the Upfield line means concrete cutting, steel dust and constant heavy plant in residential streets. Cars parked near the works pick up all three.',
    leads: ['cement-splatter-removal', 'industrial-fallout'],
  },
  {
    slug: 'greensborough',
    name: 'Greensborough',
    postcode: '3088',
    region: 'North',
    kmFromBase: 14,
    local:
      'Steep blocks and constant retaining wall and driveway work, most of it poured on site. Concrete splatter on a car parked at the kerb below a pour is close to unavoidable.',
    leads: ['cement-splatter-removal', 'overspray-removal'],
  },
  {
    slug: 'heidelberg',
    name: 'Heidelberg',
    postcode: '3084',
    region: 'North',
    kmFromBase: 15,
    local:
      'Hospital precinct car parks and long-stay parking beside ongoing construction. A car parked for a twelve-hour shift under a working facade collects far more than one parked for an hour.',
    leads: ['cement-splatter-removal', 'overspray-removal'],
  },
  {
    slug: 'whittlesea',
    name: 'Whittlesea',
    postcode: '3757',
    region: 'North',
    kmFromBase: 22,
    local:
      'Semi-rural, with shed builds, farm equipment spraying and unsealed roads. Agricultural overspray and airborne grit behave differently to industrial fallout and are worth identifying before anything touches the paint.',
    leads: ['overspray-removal', 'industrial-fallout'],
  },

  /* ---------------- West ---------------- */
  {
    slug: 'tullamarine',
    name: 'Tullamarine',
    postcode: '3043',
    region: 'West',
    kmFromBase: 18,
    local:
      'Airport freight and long-term car parks. Vehicles sit for days or weeks under a flight path and beside constant ground works, which is enough time for fallout to bond properly rather than sit loose.',
    leads: ['industrial-fallout', 'overspray-removal'],
  },
  {
    slug: 'laverton-north',
    name: 'Laverton North',
    postcode: '3026',
    region: 'West',
    kmFromBase: 40,
    local:
      'One of the heaviest industrial pockets in Melbourne — metal processing, chemical storage and constant freight movement. Industrial fallout here is coarse and it bonds fast.',
    leads: ['industrial-fallout', 'overspray-removal'],
  },
  {
    slug: 'altona',
    name: 'Altona',
    postcode: '3018',
    region: 'West',
    kmFromBase: 38,
    local:
      'Refinery and petrochemical operations sit right against residential streets. Chemical fallout and acid rain etching are the specific risks here, and they attack clear coat rather than sitting on top of it.',
    leads: ['industrial-fallout', 'overspray-removal'],
  },
  {
    slug: 'altona-north',
    name: 'Altona North',
    postcode: '3025',
    region: 'West',
    kmFromBase: 36,
    local:
      'Millers Road carries freight between the refinery precinct and the port all day, and the industrial estates either side of it run coating and metal work. What settles here is a mix of road film, chemical fallout and iron.',
    leads: ['industrial-fallout', 'overspray-removal'],
  },
  {
    slug: 'brooklyn',
    name: 'Brooklyn',
    postcode: '3012',
    region: 'West',
    kmFromBase: 34,
    local:
      'Quarries, recycling yards and truck routes converge here, and Brooklyn has been measured among the dustiest pockets in Melbourne. What settles is abrasive, which is exactly why it must not be wiped off dry.',
    leads: ['industrial-fallout', 'overspray-removal'],
  },
  {
    slug: 'sunshine',
    name: 'Sunshine',
    postcode: '3020',
    region: 'West',
    kmFromBase: 30,
    local:
      'Rail junction and heavy freight lines running through a suburb mid-redevelopment. Rail dust off the corridor and concrete work on the new builds are both live.',
    leads: ['industrial-fallout', 'cement-splatter-removal'],
  },
  {
    slug: 'deer-park',
    name: 'Deer Park',
    postcode: '3023',
    region: 'West',
    kmFromBase: 32,
    local:
      'Quarries, the Ravenhall logistics estates and the freight line all sit within a few kilometres. The dust here is mineral and abrasive, which is exactly the kind that must not be wiped off dry.',
    leads: ['industrial-fallout', 'cement-splatter-removal'],
  },
  {
    slug: 'footscray',
    name: 'Footscray',
    postcode: '3011',
    region: 'West',
    kmFromBase: 28,
    local:
      'Grain terminals, the port rail corridor and apartment towers going up on every second block. Cars parked on the street here collect grain dust, rail dust and render in the same week.',
    leads: ['industrial-fallout', 'overspray-removal'],
  },
  {
    slug: 'yarraville',
    name: 'Yarraville',
    postcode: '3013',
    region: 'West',
    kmFromBase: 29,
    local:
      'Grain terminals, the port rail corridor and the West Gate approach all meet here. Grain dust, rail dust and brake dust settle on streets where most parking is on the kerb.',
    leads: ['industrial-fallout', 'overspray-removal'],
  },
  {
    slug: 'williamstown',
    name: 'Williamstown',
    postcode: '3016',
    region: 'West',
    kmFromBase: 32,
    local:
      'Working docks and shipyards, with blasting and marine coating going on beside a residential foreshore. Salt air then accelerates whatever has landed, so contamination left here does more damage than the same contamination inland.',
    leads: ['industrial-fallout', 'overspray-removal'],
  },
  {
    slug: 'truganina',
    name: 'Truganina',
    postcode: '3029',
    region: 'West',
    kmFromBase: 45,
    local:
      'Warehouse estates still being built out, with tilt-slab panels being poured and craned into place daily. Concrete slurry and line-marking overspray dominate here.',
    leads: ['cement-splatter-removal', 'overspray-removal'],
  },
  {
    slug: 'tarneit',
    name: 'Tarneit',
    postcode: '3029',
    region: 'West',
    kmFromBase: 40,
    local:
      'One of the fastest-building corridors in the country, with whole streets under construction at once. When a render crew works an open estate it is rarely one car that cops it.',
    leads: ['cement-splatter-removal', 'fleet-and-construction'],
  },
  {
    slug: 'derrimut',
    name: 'Derrimut',
    postcode: '3026',
    region: 'West',
    kmFromBase: 38,
    local:
      'Distribution centres and transport yards, with a constant cycle of new sheds going up beside operating ones. Fleet vehicles parked in the yard are usually all hit at once.',
    leads: ['fleet-and-construction', 'cement-splatter-removal'],
  },
  {
    slug: 'point-cook',
    name: 'Point Cook',
    postcode: '3030',
    region: 'West',
    kmFromBase: 48,
    local:
      'Large estates, exposed streets and salt air off the bay. Render overspray carries a long way here because there is very little between a build and the road.',
    leads: ['cement-splatter-removal', 'overspray-removal'],
  },
  {
    slug: 'werribee',
    name: 'Werribee',
    postcode: '3030',
    region: 'West',
    kmFromBase: 52,
    local:
      'Growth-corridor construction alongside established industry and agriculture. Both crop spraying and building render turn up on cars here, and they come off differently.',
    leads: ['overspray-removal', 'cement-splatter-removal'],
  },
  {
    slug: 'melton',
    name: 'Melton',
    postcode: '3337',
    region: 'West',
    kmFromBase: 50,
    local:
      'One of the fastest-growing corridors in Australia, which means whole streets under construction at once. When a render crew works an open estate, it is rarely one car affected.',
    leads: ['cement-splatter-removal', 'fleet-and-construction'],
  },

  /* ---------------- Inner ---------------- */
  {
    slug: 'melbourne-cbd',
    name: 'Melbourne CBD',
    postcode: '3000',
    region: 'Inner',
    kmFromBase: 22,
    local:
      'Tower cranes and facade work above streets where cars park directly below. Concrete slurry, sealant and render falling from height hit horizontal surfaces hardest — roofs, bonnets and boot lids.',
    leads: ['cement-splatter-removal', 'overspray-removal'],
  },
  {
    slug: 'port-melbourne',
    name: 'Port Melbourne',
    postcode: '3207',
    region: 'Inner',
    kmFromBase: 26,
    local:
      'Bulk handling at the port throws iron ore and mineral dust, and the prevailing wind carries it inland. It looks like orange speckling and it rusts into the clear coat if it is left.',
    leads: ['industrial-fallout', 'overspray-removal'],
  },
  {
    slug: 'docklands',
    name: 'Docklands',
    postcode: '3008',
    region: 'Inner',
    kmFromBase: 25,
    local:
      'Towers going up over streets where parking sits directly beneath the facade. Slurry, sealant and render falling from height land on roofs, bonnets and boot lids first.',
    leads: ['cement-splatter-removal', 'overspray-removal'],
  },
  {
    slug: 'richmond',
    name: 'Richmond',
    postcode: '3121',
    region: 'Inner',
    kmFromBase: 22,
    local:
      'Warehouse conversions and apartment builds on tight streets with no off-street parking. Spray work on a facade puts overspray on both sides of the road.',
    leads: ['overspray-removal', 'cement-splatter-removal'],
  },
  {
    slug: 'collingwood',
    name: 'Collingwood',
    postcode: '3066',
    region: 'Inner',
    kmFromBase: 20,
    local:
      'Constant infill development and, separately, one of the highest rates of aerosol tagging in Melbourne. Graffiti on a parked car is a different job again and needs a different chemistry.',
    leads: ['graffiti-removal', 'overspray-removal'],
  },
  {
    slug: 'brunswick',
    name: 'Brunswick',
    postcode: '3056',
    region: 'Inner',
    kmFromBase: 17,
    local:
      'The Upfield corridor, level crossing works and townhouse development all in the same few blocks. Steel dust and render are both regular causes.',
    leads: ['industrial-fallout', 'overspray-removal'],
  },

  /* ---------------- East ---------------- */
  {
    slug: 'box-hill',
    name: 'Box Hill',
    postcode: '3128',
    region: 'East',
    kmFromBase: 26,
    local:
      'High-rise construction concentrated in a small centre, with parking directly beneath active facades. Slurry and sealant from height are the usual cause.',
    leads: ['cement-splatter-removal', 'overspray-removal'],
  },
  {
    slug: 'doncaster',
    name: 'Doncaster',
    postcode: '3108',
    region: 'East',
    kmFromBase: 24,
    local:
      'Knock-down rebuilds on large blocks, with rendering and spray painting happening over fence lines onto neighbouring driveways.',
    leads: ['overspray-removal', 'cement-splatter-removal'],
  },
  {
    slug: 'ringwood',
    name: 'Ringwood',
    postcode: '3134',
    region: 'East',
    kmFromBase: 33,
    local:
      'Commercial redevelopment around the transport interchange, with long-stay commuter parking beside it. A car left all day next to a working site collects a full day of whatever is in the air.',
    leads: ['cement-splatter-removal', 'industrial-fallout'],
  },
  {
    slug: 'bayswater',
    name: 'Bayswater',
    postcode: '3153',
    region: 'East',
    kmFromBase: 36,
    local:
      'A long-established industrial estate with spray booths, engineering shops and powder coaters. Overspray here is usually industrial rather than architectural, and it is often harder.',
    leads: ['overspray-removal', 'industrial-fallout'],
  },
  {
    slug: 'kilsyth',
    name: 'Kilsyth',
    postcode: '3137',
    region: 'East',
    kmFromBase: 40,
    local:
      'A long-established industrial estate of engineering shops, powder coaters and spray booths backing onto residential streets. Overspray here is industrial rather than architectural, and it is usually harder.',
    leads: ['overspray-removal', 'industrial-fallout'],
  },
  {
    slug: 'scoresby',
    name: 'Scoresby',
    postcode: '3179',
    region: 'East',
    kmFromBase: 38,
    local:
      'Business parks and fleet yards where vehicles are parked in rows. When something drifts across a yard, it is a whole-lot job rather than a single car.',
    leads: ['fleet-and-construction', 'overspray-removal'],
  },

  /* ---------------- South-East ---------------- */
  {
    slug: 'dandenong-south',
    name: 'Dandenong South',
    postcode: '3175',
    region: 'South-East',
    kmFromBase: 45,
    local:
      'The largest industrial precinct in Melbourne: foundries, plastics, chemical plants and freight, all in one place. Nearly every category of fallout we treat occurs somewhere in this postcode.',
    leads: ['industrial-fallout', 'fleet-and-construction'],
  },
  {
    slug: 'braeside',
    name: 'Braeside',
    postcode: '3195',
    region: 'South-East',
    kmFromBase: 48,
    local:
      'Industrial estates backing onto residential streets, with metal processing and coating operations running through the day.',
    leads: ['industrial-fallout', 'overspray-removal'],
  },
  {
    slug: 'moorabbin',
    name: 'Moorabbin',
    postcode: '3189',
    region: 'South-East',
    kmFromBase: 44,
    local:
      'Airfield operations and a dense industrial pocket beside them. Fine particulate settles on cars parked in the open for long periods.',
    leads: ['industrial-fallout', 'overspray-removal'],
  },
  {
    slug: 'cheltenham',
    name: 'Cheltenham',
    postcode: '3192',
    region: 'South-East',
    kmFromBase: 46,
    local:
      'The edge of the Moorabbin industrial belt, where trade premises meet shopping strips. Fine particulate settles on cars parked in the open for a full working day.',
    leads: ['industrial-fallout', 'overspray-removal'],
  },
  {
    slug: 'clayton',
    name: 'Clayton',
    postcode: '3168',
    region: 'South-East',
    kmFromBase: 40,
    local:
      'Research and manufacturing campuses with large open car parks and continuous construction. Cars sit still for a full working day, which is what lets contamination bond.',
    leads: ['cement-splatter-removal', 'industrial-fallout'],
  },
  {
    slug: 'springvale',
    name: 'Springvale',
    postcode: '3171',
    region: 'South-East',
    kmFromBase: 42,
    local:
      'Panel shops, mechanical trades and light industry mixed straight into shopping strips, so overspray tends to land on customer cars rather than the workshop that made it.',
    leads: ['overspray-removal', 'industrial-fallout'],
  },
  {
    slug: 'noble-park',
    name: 'Noble Park',
    postcode: '3174',
    region: 'South-East',
    kmFromBase: 43,
    local:
      'Light industry packed against the rail line, with level crossing works along it. Steel dust off the corridor and cutting residue off the works turn up together.',
    leads: ['industrial-fallout', 'cement-splatter-removal'],
  },
  {
    slug: 'keysborough',
    name: 'Keysborough',
    postcode: '3173',
    region: 'South-East',
    kmFromBase: 46,
    local:
      'Logistics warehouses and new estates going up beside each other. Tilt-slab pours and line marking are the usual sources.',
    leads: ['cement-splatter-removal', 'fleet-and-construction'],
  },
  {
    slug: 'carrum-downs',
    name: 'Carrum Downs',
    postcode: '3201',
    region: 'South-East',
    kmFromBase: 55,
    local:
      'An industrial estate wrapped in residential streets, with fabrication and coating work close to housing.',
    leads: ['industrial-fallout', 'overspray-removal'],
  },
  {
    slug: 'frankston',
    name: 'Frankston',
    postcode: '3199',
    region: 'South-East',
    kmFromBase: 58,
    local:
      'Coastal air, a rail terminus and ongoing town-centre construction. Salt accelerates anything already sitting on the paint, so fallout left here does more damage than the same fallout inland.',
    leads: ['industrial-fallout', 'cement-splatter-removal'],
  },
  {
    slug: 'pakenham',
    name: 'Pakenham',
    postcode: '3810',
    region: 'South-East',
    kmFromBase: 62,
    local:
      'The far end of the south-east growth corridor: estates, kerb-and-channel work and slab pours on streets where there is nowhere to park but the road. Cement splatter down one flank is the usual call.',
    leads: ['cement-splatter-removal', 'overspray-removal'],
  },
];

export function areaBySlug(slug: string): Area {
  const a = AREAS.find((x) => x.slug === slug);
  if (!a) throw new Error(`Unknown area slug: ${slug}`);
  return a;
}

/** Areas grouped by region, in the order the regions are declared. */
export const AREAS_BY_REGION: { region: Region; areas: Area[] }[] = (
  ['North', 'West', 'Inner', 'East', 'South-East'] as Region[]
).map((region) => ({ region, areas: AREAS.filter((a) => a.region === region) }));

export const AREA_BASE = '/overspray-removal';
export const areaPath = (a: Area) => `${AREA_BASE}/${a.slug}`;
