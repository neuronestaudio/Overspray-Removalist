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
    slug: 'ceramic-coating',
    path: '/ceramic-coating',
    nav: 'Ceramic Coating',
    h1: 'Ceramic coating',
    title: 'Ceramic Coating Melbourne | Paint Protection',
    description:
      'Ceramic coating applied over a properly decontaminated and corrected finish. Hydrophobic, UV stable, and far easier to wash. Melbourne and Australia wide.',
    lede:
      'A coating is only ever as good as the paint underneath it. We spend our days taking contamination off duco, which is exactly the preparation a coating needs.',
    hero: 'suv-black',
    heroAlt: 'Black SUV finished to a deep gloss after decontamination',
    blocks: [
      {
        heading: 'Preparation is the job',
        body: [
          'A ceramic coating bonds to the top of your clear coat. Anything sitting on that surface, fallout, rail dust, overspray, bonded traffic film, gets sealed under the coating and stays there for years.',
          'That is the part most of the market rushes. Decontamination is the trade we have done for three decades, so the surface is genuinely clean before anything goes on it.',
        ],
      },
      {
        heading: 'What it does',
        body: [
          'A cured coating is hydrophobic, so water beads and carries dirt off rather than drying on. It is UV stable, which slows oxidation and fade. It resists chemical etching from bird lime, tree sap and industrial fallout.',
        ],
        bullets: [
          'Water beads and sheets off instead of drying on',
          'Washing gets faster and needs less contact',
          'UV stable, so colour holds longer',
          'Better resistance to bird lime, sap and fallout etching',
        ],
      },
      {
        heading: 'What it is not',
        body: [
          'A coating is not armour. It will not stop a stone chip, a trolley or a key, and it does not make a car self-cleaning. Anyone telling you otherwise is selling something. It makes a good finish easier to keep and slower to degrade, and that is worth real money over years of ownership.',
        ],
      },
    ],
  },
  {
    slug: 'paint-protection',
    path: '/paint-protection',
    nav: 'Paint Protection',
    h1: 'Paint protection',
    title: 'Paint Protection | New Cars, Fleets & Resale',
    description:
      'Paint protection for new cars, fleet vehicles and anything heading for resale. Correction first, then a protective layer matched to how the vehicle is actually used.',
    lede:
      'New car, fleet vehicle, or something heading back to a lease. Protection is worth doing when the finish underneath is worth protecting.',
    hero: 'challenger',
    heroAlt: 'Green Dodge Challenger with a corrected, protected finish',
    blocks: [
      {
        heading: 'Correction before protection',
        body: [
          'Sealing swirls, fallout or overspray under a protective layer locks the damage in. Everything is assessed and put right first, using the same non-abrasive methods we use on contamination work, then protected.',
        ],
      },
      {
        heading: 'Matched to how it is used',
        body: [
          'A dealership demo, a site ute parked under a slab pour and a weekend car are three different problems. We match the level of protection to the exposure rather than selling one package to everybody.',
        ],
      },
      {
        heading: 'Fleets and dealer stock',
        body: [
          'Volume work is priced by the lot, same as our remediation work. For fleets and dealer stock the return is in resale and lease return condition, where a car with original paint in good order is worth demonstrably more than one carrying a repair history.',
        ],
      },
    ],
  },
  {
    slug: 'auto-detailing',
    path: '/auto-detailing',
    nav: 'Auto Detailing',
    h1: 'Auto detailing',
    title: 'Auto Detailing | Decontamination & Finish Restoration',
    description:
      'Detailing built on decontamination rather than a quick polish. Paint, glass, trims and wheels brought back by hand, on site across Melbourne and Australia wide.',
    lede:
      'Most detailing hides contamination under a polish. We take it off first, which is why the result lasts past the next wash.',
    hero: 'ram',
    heroAlt: 'White RAM pickup restored to a clean, even finish',
    blocks: [
      {
        heading: 'Decontamination first',
        body: [
          'Bonded contamination cannot be washed off and polishing over it just buries it. Paint, glass, trims and wheels are decontaminated by hand before anything else happens, which is the same process we use on overspray and fallout work.',
        ],
      },
      {
        heading: 'What gets touched',
        body: [
          'Duco, glass, window trims, lenses, roof racks and external accessories. The same list as a removal job, because contamination does not stop at the painted panels.',
        ],
      },
      {
        heading: 'On site',
        body: [
          'We work where the vehicle is, across all suburbs and Australia wide. For fleets and dealer stock that means the cars never leave the yard.',
        ],
      },
    ],
  },
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
