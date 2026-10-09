/**
 * Cities: the national layer above the Melbourne suburbs.
 *
 * SAME RULE AS areas.ts
 *
 * A city page whose only local content is the city's name is a doorway page.
 * Every entry below names the thing in that city that actually produces the
 * work: a port, a refinery, a shipyard, a rail project, a growth corridor. If
 * you add a city and cannot name a genuine local source, do not add it.
 *
 * HOW THESE DIFFER FROM SUBURBS
 *
 * There is no workshop in any of these cities and the pages never pretend
 * there is. The business is in Epping VIC. What travels is the fleet, site and
 * insurance work: a car park, a compound or a dealer yard that was hit in one
 * event is assessed and worked where it sits, in any state. That is the line
 * every city page carries, and it is the same line the rest of the site uses.
 *
 * `lon`/`lat` place the city on the drawn map (components/AustraliaMap.tsx).
 */
export type StateCode = 'NSW' | 'QLD' | 'WA' | 'SA' | 'ACT' | 'TAS' | 'NT' | 'VIC';

export interface City {
  slug: string;
  name: string;
  state: StateCode;
  /** Capitals carry a label on the map and sit first in every list. */
  capital: boolean;
  lon: number;
  lat: number;
  /** The local source of the work. Specific, true, two or three sentences. */
  local: string;
  /** Slugs of the services this city leads with, most relevant first. */
  leads: string[];
}

export const STATE_NAMES: Record<StateCode, string> = {
  NSW: 'New South Wales',
  QLD: 'Queensland',
  WA: 'Western Australia',
  SA: 'South Australia',
  ACT: 'Australian Capital Territory',
  TAS: 'Tasmania',
  NT: 'Northern Territory',
  VIC: 'Victoria',
};

export const CITIES: City[] = [
  /* ---------------- Capitals ---------------- */
  {
    slug: 'sydney',
    name: 'Sydney',
    state: 'NSW',
    capital: true,
    lon: 151.21,
    lat: -33.87,
    local:
      'Port Botany and the freight corridors behind it, the Western Sydney Airport precinct still under construction around Badgerys Creek, and metro and motorway tunnelling that puts slurry on kerbside parking for years at a time. Behind that sits the Wetherill Park and Smithfield belt of fabrication and coating shops, which is where most of the overspray comes from.',
    leads: ['cement-splatter-removal', 'overspray-removal', 'fleet-and-construction'],
  },
  {
    slug: 'brisbane',
    name: 'Brisbane',
    state: 'QLD',
    capital: true,
    lon: 153.03,
    lat: -27.47,
    local:
      'The Port of Brisbane at Fisherman Islands, Cross River Rail, the 2032 Games venue programme and the Lytton refinery, with the Rocklea, Acacia Ridge and Yatala estates spread between them. Tower cranes over the CBD and the Valley do the rest: concrete from height onto whatever is parked below.',
    leads: ['cement-splatter-removal', 'industrial-fallout', 'fleet-and-construction'],
  },
  {
    slug: 'perth',
    name: 'Perth',
    state: 'WA',
    capital: true,
    lon: 115.86,
    lat: -31.95,
    local:
      'The Kwinana industrial strip, refining, alumina and lithium, with housing right on its edge, and the Australian Marine Complex at Henderson where hulls are blasted and coated in the open air. Add Fremantle Port, the Metronet rail works and the mining fleets staged in the city between swings, and Perth produces every category of fallout we treat.',
    leads: ['industrial-fallout', 'overspray-removal', 'fleet-and-construction'],
  },
  {
    slug: 'adelaide',
    name: 'Adelaide',
    state: 'SA',
    capital: true,
    lon: 138.6,
    lat: -34.93,
    local:
      'The Osborne naval shipyard, where frigates and submarines are blasted and coated a few hundred metres from car parks, and the working port beside it. Inland, the Wingfield and Lonsdale estates and the Torrens to Darlington tunnel works put cement and metal dust on vehicles along the whole corridor.',
    leads: ['overspray-removal', 'industrial-fallout'],
  },
  {
    slug: 'canberra',
    name: 'Canberra',
    state: 'ACT',
    capital: true,
    lon: 149.13,
    lat: -35.28,
    local:
      'Light rail stage 2 along Commonwealth Avenue, the Molonglo Valley and Ginninderry estates mid-build, and the Hume and Fyshwick estates where the painting and fabrication happens. Canberra also runs some of the largest government fleets in the country, the kind that get hit all at once in one car park and need to be priced and released as one job.',
    leads: ['cement-splatter-removal', 'fleet-and-construction', 'overspray-removal'],
  },
  {
    slug: 'hobart',
    name: 'Hobart',
    state: 'TAS',
    capital: true,
    lon: 147.33,
    lat: -42.88,
    local:
      'The Incat shipyard at Prince of Wales Bay, where very large hulls are coated, the Nyrstar zinc works at Lutana, and the Derwent Park and Glenorchy industrial strip between them. Salt air off the river accelerates whatever is already sitting on the paint, so fallout left here does more damage than the same fallout inland.',
    leads: ['industrial-fallout', 'overspray-removal'],
  },
  {
    slug: 'darwin',
    name: 'Darwin',
    state: 'NT',
    capital: true,
    lon: 130.84,
    lat: -12.46,
    local:
      'East Arm Port and the Middle Arm precinct, the LNG plants at Wickham Point and Bladin Point, and RAAF Darwin and Robertson Barracks with the vehicle fleets that go with them. The dry season adds a fine dust that sits on everything for months and bonds the moment the first rain hits it.',
    leads: ['industrial-fallout', 'fleet-and-construction'],
  },
  {
    slug: 'gold-coast',
    name: 'Gold Coast',
    state: 'QLD',
    capital: true,
    lon: 153.4,
    lat: -28.02,
    local:
      'High-rise construction along the Surfers Paradise to Broadbeach strip with cars parked directly underneath it, the Yatala and Molendinar estates behind the highway, and the Coomera growth corridor where whole streets are under slab at once. Concrete splatter down one flank is the usual call.',
    leads: ['cement-splatter-removal', 'overspray-removal'],
  },

  /* ---------------- Industrial hubs ---------------- */
  {
    slug: 'newcastle',
    name: 'Newcastle',
    state: 'NSW',
    capital: false,
    lon: 151.78,
    lat: -32.93,
    local:
      'The Port of Newcastle coal loaders, the Tomago aluminium smelter and Kooragang Island, with the Mayfield and Carrington industrial frontage running right up against housing. RAAF Williamtown sits to the north. Iron and coal fallout here is coarse, and it etches if it is left.',
    leads: ['industrial-fallout', 'fleet-and-construction'],
  },
  {
    slug: 'wollongong',
    name: 'Wollongong',
    state: 'NSW',
    capital: false,
    lon: 150.89,
    lat: -34.42,
    local:
      'The Port Kembla steelworks and the coal terminal beside it. The fallout across Port Kembla, Warrawong and Cringila is iron-rich: it shows as orange specks on light paint, and it rusts into the clear coat if nobody takes it off.',
    leads: ['industrial-fallout'],
  },
  {
    slug: 'geelong',
    name: 'Geelong',
    state: 'VIC',
    capital: false,
    lon: 144.36,
    lat: -38.15,
    local:
      'The Viva Energy refinery at Corio, the Port of Geelong, Avalon Airport and the Lara and North Geelong estates. Geelong is close enough to the Epping workshop that single vehicles come to us the same way Melbourne ones do, and a yard or a car park is assessed on site.',
    leads: ['industrial-fallout', 'overspray-removal'],
  },
  {
    slug: 'gladstone',
    name: 'Gladstone',
    state: 'QLD',
    capital: false,
    lon: 151.26,
    lat: -23.84,
    local:
      'The Boyne aluminium smelter, the QAL and Yarwun alumina refineries, LNG on Curtis Island and the coal terminal, all in one harbour. Few towns in Australia put more industrial fallout on more vehicles per head than this one, and most of them are fleet vehicles.',
    leads: ['industrial-fallout', 'fleet-and-construction'],
  },
  {
    slug: 'townsville',
    name: 'Townsville',
    state: 'QLD',
    capital: false,
    lon: 146.82,
    lat: -19.26,
    local:
      'The Port of Townsville, the Sun Metals zinc refinery and the copper refinery at Stuart, with Lavarack Barracks and RAAF Townsville running large fleets in the same air. Metal fallout in the wet season bonds fast.',
    leads: ['industrial-fallout', 'fleet-and-construction'],
  },
  {
    slug: 'mackay',
    name: 'Mackay',
    state: 'QLD',
    capital: false,
    lon: 149.19,
    lat: -21.14,
    local:
      'Paget, the mining-services precinct for the Bowen Basin: heavy fabrication, blasting and coating in one estate, with the fleets that service the mines parked beside it. The Hay Point coal terminal sits to the south. Overspray from a coating shed next door is the most common call.',
    leads: ['overspray-removal', 'industrial-fallout'],
  },
  {
    slug: 'port-hedland',
    name: 'Port Hedland',
    state: 'WA',
    capital: false,
    lon: 118.6,
    lat: -20.31,
    local:
      'The iron ore export port, and the red ore dust that settles over the whole town and every vehicle in it. The Pilbara fleets that work out of here carry it as a permanent layer, and it is iron, so it bonds and it etches.',
    leads: ['industrial-fallout', 'fleet-and-construction'],
  },
  {
    slug: 'whyalla',
    name: 'Whyalla',
    state: 'SA',
    capital: false,
    lon: 137.58,
    lat: -33.03,
    local:
      'The steelworks and the port. Iron fallout across the town is the ordinary condition of a car here, and on a fleet it is a fleet-wide job rather than a car-by-car one.',
    leads: ['industrial-fallout'],
  },
];

export function cityBySlug(slug: string): City {
  const c = CITIES.find((x) => x.slug === slug);
  if (!c) throw new Error(`Unknown city slug: ${slug}`);
  return c;
}

/** Capitals in the order they are declared. */
export const CAPITALS: City[] = CITIES.filter((c) => c.capital);

/** States in the order the hub lists them; regional Victoria last, as home ground. */
export const STATE_ORDER: StateCode[] = ['NSW', 'QLD', 'WA', 'SA', 'ACT', 'TAS', 'NT', 'VIC'];

/** Cities grouped by state, capitals first within each state. */
export const CITIES_BY_STATE: { state: StateCode; label: string; cities: City[] }[] = STATE_ORDER.map(
  (state) => ({
    state,
    label: STATE_NAMES[state],
    cities: CITIES.filter((c) => c.state === state).sort((a, b) => Number(b.capital) - Number(a.capital)),
  }),
).filter((g) => g.cities.length > 0);

/** Same URL level as the suburbs: one page type, one parent path. */
export const CITY_BASE = '/overspray-removal';
export const cityPath = (c: City) => `${CITY_BASE}/${c.slug}`;
