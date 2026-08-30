/**
 * Service page content.
 *
 * Copy is lifted from the client's own site and kept in their voice. Anything
 * in quotes in the audit came from here. Do not invent claims: this business
 * makes specific, checkable statements (30 years, from $600, non-abrasive) and
 * the value of the copy is that every one of them is theirs.
 */

export interface ServiceBlock {
  heading: string;
  /** Paragraphs. Rendered in order. */
  body: string[];
  /** Optional bullet list rendered after the paragraphs. */
  bullets?: string[];
}

export interface ComparePair {
  before: string;
  after: string;
  altBefore: string;
  altAfter: string;
  caption: string;
}

export interface Service {
  slug: string;
  path: string;
  /** Short label for nav, cards and breadcrumbs. */
  nav: string;
  h1: string;
  title: string;
  description: string;
  lede: string;
  /** Image stem in /assets/images, used for the hero and the OG card. */
  hero: string;
  heroAlt: string;
  blocks: ServiceBlock[];
  pair?: ComparePair;
}

export const SERVICES: Service[] = [
  {
    slug: 'overspray-removal',
    path: '/overspray-removal',
    nav: 'Paint Overspray Removal',
    h1: 'Paint overspray removal',
    title: 'Paint Overspray Removal | Vehicles, Fleets & Property',
    description:
      'Non-abrasive paint overspray removal from vehicles, trucks, boats, aircraft and buildings. Epoxy, urethane and two pack. Over 30 years, Australia wide.',
    lede:
      'Spray painting, roller work, poor booth filtration or a wind change on an outdoor job. The paint lands on everything downwind and bonds to the clear coat.',
    hero: 'svc-overspray',
    heroAlt: 'Technician removing paint overspray from a vehicle panel by hand',
    blocks: [
      {
        heading: 'How far it travels',
        body: [
          'Paint overspray is usually caused by spray painting, but roller and brush painting cause it too, and poor filtration in a spray booth is a common factor. Most of the damage we see was accidental: outdoor work, a wind change, or high altitude work on a building.',
          'Airborne emissions can travel up to five hundred metres in windy conditions and cause widespread damage across every vehicle and surface in the path.',
        ],
      },
      {
        heading: 'What we remove it from',
        body: [
          'Vehicles, trucks, boats, aircraft and affected buildings. On a fully covered vehicle that includes the moulds, plastics, glass, window trims, lenses, roof racks and every external accessory, not just the painted panels.',
        ],
        bullets: [
          'Epoxy, urethane and polyurethane',
          'Two pack epoxy, cured with a hardener',
          'Spray paint and aerosol',
          'Polyurethane foam',
        ],
      },
      {
        heading: 'Why the paint type changes the job',
        body: [
          'Different paints bond differently to a vehicle, which changes the process needed to remove them. Two pack epoxy is a very hard paint cured through adding a hardener, and it behaves nothing like a light dusting of water based paint.',
          'Light coverage that does not reach the whole vehicle is a different job again. That is why heavy or full-coverage damage is sighted and assessed before we price it.',
        ],
      },
    ],
    pair: {
      before: 'job-tarago-before',
      after: 'job-tarago-after',
      altBefore: 'Toyota van covered in dark paint overspray',
      altAfter: 'The same Toyota van after overspray removal',
      caption:
        'Paint overspray across the full driver side. Removed by hand, no abrasives, factory paint untouched.',
    },
  },
  {
    slug: 'cement-splatter-removal',
    path: '/cement-splatter-removal',
    nav: 'Cement & Concrete Splatter',
    h1: 'Cement & concrete splatter removal',
    title: 'Cement & Concrete Splatter Removal from Vehicles',
    description:
      'Cement, concrete and lime stain removal from vehicles and property damaged by slab pours and construction work. Volume pricing for affected lots. Australia wide.',
    lede:
      'Slab pours throw splatter over the site boundary onto everything parked below. Left on the duco it etches, and lime staining often appears once the cement itself comes off.',
    hero: 'svc-cement',
    heroAlt: 'Cement splatter being removed from a vehicle bonnet',
    blocks: [
      {
        heading: 'Where it comes from',
        body: [
          'Our biggest clients are construction companies pouring their slabs. Concrete splatter travels over the edge of the building site and onto the vehicles below. It is rarely one car. It is usually every car on the street that morning.',
        ],
      },
      {
        heading: 'Lime staining',
        body: [
          'Vehicles affected by cement or concrete splatter depend on many factors that determine what it takes to repair. If the car is fully covered, including moulds, plastics, glass, window trims, lenses, roof racks and external accessories, and especially if lime staining appears after the cement is removed off the duco, we can deal with that situation. Those vehicles need to be sighted and assessed.',
        ],
      },
      {
        heading: 'If a whole street is affected',
        body: [
          'When a high volume of cars is affected in one place and we can work through the entire lot in a single location, we price the lot rather than each car. We can also handle the authorisation and release forms and the public relations on your behalf.',
        ],
      },
    ],
  },
  {
    slug: 'graffiti-removal',
    path: '/graffiti-removal',
    nav: 'Graffiti Removal',
    h1: 'Graffiti removal',
    title: 'Graffiti Removal from Vehicles, Plant & Property',
    description:
      'Aerosol graffiti removed from vehicles, plant, equipment and property without damaging the finish underneath. Non-abrasive process, over 30 years experience.',
    lede:
      'Aerosol on a vehicle is a paint bond like any other. The difference is it is usually deliberate, usually urgent, and usually attached to an insurance claim.',
    hero: 'svc-graffiti',
    heroAlt: 'Graffiti paint being lifted from a painted surface',
    blocks: [
      {
        heading: 'What we work on',
        body: [
          'Vehicles, trucks, plant and equipment, and affected buildings. The same non-abrasive process we use for overspray applies here: the aerosol comes off, the finish underneath stays.',
        ],
      },
      {
        heading: 'Why not just respray',
        body: [
          'A respray means colour matching, blend panels, and a repair history on the vehicle. Removing the graffiti instead keeps the factory finish, which matters on a late model vehicle, a fleet livery or anything heading back to a lease.',
        ],
      },
    ],
    pair: {
      before: 'job-audi-2',
      after: 'job-audi-after',
      altBefore: 'Silver Audi sprayed with red graffiti across the doors',
      altAfter: 'The same silver Audi after graffiti removal',
      caption:
        'Red aerosol graffiti over a silver Audi. Removed without damaging the clear coat.',
    },
  },
  {
    slug: 'industrial-fallout',
    path: '/industrial-fallout',
    nav: 'Industrial Fallout & Acid Rain',
    h1: 'Industrial fallout & acid rain',
    title: 'Industrial Fallout, Iron Filings & Acid Rain Removal',
    description:
      'Removal of industrial fallout, iron filings, soot, acid rain and chemical fallout bonded into vehicle paint. Non-abrasive decontamination, Australia wide.',
    lede:
      'Rail dust, foundry fallout, soot and acid rain all bond into the clear coat and keep working. Most of it is invisible at ten paces and obvious under your palm.',
    hero: 'svc-fallout',
    heroAlt: 'Industrial fallout contamination across a vehicle panel',
    blocks: [
      {
        heading: 'What counts as fallout',
        body: [
          'The same principle applies to most types of fallout: acid rain, industrial fallout and chemical fallout. Each one affects vehicles differently, which is why these vehicles need to be sighted and evaluated rather than quoted blind.',
        ],
        bullets: [
          'Iron filings and rail dust',
          'Soot and carbon',
          'Acid rain etching',
          'Chemical and industrial fallout',
        ],
      },
      {
        heading: 'Why it gets worse',
        body: [
          'Metallic fallout keeps oxidising once it is embedded. What starts as a rough feel across the duco becomes a rust-coloured speckle, and then a permanent etch into the clear coat. Early removal is the difference between decontamination and a respray.',
        ],
      },
    ],
    pair: {
      before: 'job-ute-1',
      after: 'job-ute-after-1',
      altBefore: 'Blue Holden ute covered in industrial fallout',
      altAfter: 'The same blue Holden ute after fallout removal',
      caption: 'Industrial fallout bonded across a blue duco. Decontaminated panel by panel.',
    },
  },
  {
    slug: 'roadwork-contamination',
    path: '/roadwork-contamination',
    nav: 'Roadwork Contamination',
    h1: 'Roadwork contamination removal',
    title: 'Road Paint, Tar & Bitumen Removal | Melbourne',
    description:
      'Road marking paint, tar, bitumen and asphalt residue removed from vehicle paint without abrasives. Melbourne wide, on site.',
    lede:
      'Line marking crews and hot mix trucks throw material a long way. It lands hot, it bonds fast, and it is on the lower panels and wheels before anyone notices.',
    hero: 'landcruiser',
    heroAlt: 'Toyota Landcruiser ute after decontamination',
    blocks: [
      {
        heading: 'Fresh line marking is the worst of it',
        body: [
          'Road marking paint is formulated to key into a porous, dusty surface in seconds and survive traffic. On a vehicle it does exactly the same thing, and the longer it cures the harder it holds. A car driven through a wet line pickup usually carries it down the full length of the sills, into the wheel arches and across the wheels.',
        ],
      },
      {
        heading: 'Tar and bitumen behave differently again',
        body: [
          'Hot mix and sealant are not a paint film, they are a bonded deposit, and they need to be softened and lifted rather than dissolved. The wrong solvent smears them and drives the staining further into the clear coat, which is the state most of these jobs are in by the time we see them.',
        ],
      },
      {
        heading: 'Who usually pays for it',
        body: [
          'Roadwork damage is generally traceable to a contractor, a council works order or a project. Where it is, the assessment and the claim are handled the same way we handle an overspray claim, so the vehicle owner is not left chasing it themselves.',
        ],
      },
    ],
  },
  {
    slug: 'fleet-and-construction',
    path: '/fleet-and-construction',
    nav: 'Fleet & Construction Sites',
    h1: 'Fleet & construction site work',
    title: 'Fleet & Construction Site Overspray Damage | Volume Pricing',
    description:
      'Whole-lot overspray and cement splatter remediation for construction sites, fleets and dealerships. Volume pricing, on site, with authorisation and release forms handled.',
    lede:
      'When one incident hits fifty cars, you do not need fifty quotes. You need one number, one crew and one set of paperwork.',
    hero: 'job-splatter-1',
    heroAlt: 'Multiple vehicles affected by paint overspray at a work site',
    blocks: [
      {
        heading: 'One price for the lot',
        body: [
          'If a high volume of cars is affected in one place, and we can work on the entire lot in the one location, we give a price on a volume lot rather than pricing car by car. That is the difference between a manageable remediation and an unbounded claim.',
        ],
      },
      {
        heading: 'We come to the site',
        body: [
          'We work on site, across all suburbs and Australia wide. Vehicles do not need to be driven to a workshop, which matters when the affected cars belong to residents, staff or customers who did not ask to be involved.',
        ],
      },
      {
        heading: 'The paperwork and the public relations',
        body: [
          'We offer a service which includes the authorisation and release forms, and we handle the public relations on your behalf. On a street full of affected vehicle owners, that part is often harder than the removal.',
        ],
      },
    ],
  },
  {
    slug: 'insurance-claims',
    path: '/insurance-claims',
    nav: 'Insurance Claims Management',
    h1: 'Insurance claims management',
    title: 'Overspray Insurance Claims Management & Assessment',
    description:
      'Overspray and fallout claims handled end to end: assessment, restoration instead of respray, authorisation and release forms, and owner liaison. Over 30 years.',
    lede:
      'We have been doing overspray claims for thirty years. Restoration keeps the factory finish and keeps the claim smaller than a respray.',
    hero: 'workshop',
    heroAlt: 'Vehicle being assessed in the workshop before restoration',
    blocks: [
      {
        heading: 'Assessment first',
        body: [
          'Photos give us the fallout type and how hard it has bonded, which is enough to price most jobs. Where the vehicle is fully covered, including moulds, plastics, glass, trims, lenses and accessories, it is sighted and assessed before a figure is committed.',
        ],
      },
      {
        heading: 'Restoration instead of respray',
        body: [
          'Removing the contamination keeps the original factory paint. There is no colour match, no blend panel and no repair history attached to the vehicle. On late model and fleet vehicles that difference carries real value at resale or lease return.',
        ],
      },
      {
        heading: 'Forms and owner liaison',
        body: [
          'We can offer a service which includes authorisation and release forms and handle the public relations on your behalf, which keeps the affected owners informed and keeps the claim moving.',
        ],
      },
    ],
    pair: {
      before: 'job-merc-1',
      after: 'job-merc-after',
      altBefore: 'White Mercedes A-Class with heavy fallout contamination',
      altAfter: 'The same white Mercedes A-Class after restoration',
      caption:
        'Fallout on white duco, where contamination shows worst. Restored without respraying.',
    },
  },
];

export function serviceBySlug(slug: string): Service {
  const found = SERVICES.find((s) => s.slug === slug);
  if (!found) throw new Error(`Unknown service slug: ${slug}`);
  return found;
}
