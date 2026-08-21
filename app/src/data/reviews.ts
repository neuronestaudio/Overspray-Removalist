/**
 * Reviews.
 *
 * PLACEHOLDER CONTENT, for the demo only.
 *
 * The audit found this business has no published social proof anywhere: no
 * testimonials, no reviews, no client logos. That is a real gap and the section
 * is worth having, but nothing here is a real customer and none of it may go
 * live as written.
 *
 * Replace with genuine Google reviews before launch. Every entry below is
 * marked `placeholder: true`, and the component prints a visible ribbon while
 * any of them are, so this cannot ship unnoticed.
 */
export interface Review {
  quote: string;
  name: string;
  context: string;
  stars: number;
  placeholder?: boolean;
}

export const REVIEWS: Review[] = [
  {
    quote:
      'Overspray from a factory next door hit eleven cars in our car park. They came to us, worked through the whole lot on site and handled the paperwork with every owner.',
    name: 'Site manager',
    context: 'Construction, Melbourne',
    stars: 5,
    placeholder: true,
  },
  {
    quote:
      'The assessor wanted to respray two panels. These guys took the fallout off instead and the factory paint is still on the car.',
    name: 'Vehicle owner',
    context: 'Insurance claim',
    stars: 5,
    placeholder: true,
  },
  {
    quote:
      'Concrete splatter down one side of a new ute. I thought it was going to need a repaint. You cannot tell it ever happened.',
    name: 'Fleet operator',
    context: 'Northern suburbs',
    stars: 5,
    placeholder: true,
  },
  {
    quote:
      'Booked them for the whole yard before a dealer handover. Turned up when they said, worked around us, no fuss.',
    name: 'Dealer principal',
    context: 'Dealership stock',
    stars: 5,
    placeholder: true,
  },
  {
    quote:
      'Red aerosol across the doors and boot. Off in a day, no colour match, no blend panels, nothing on the vehicle history.',
    name: 'Vehicle owner',
    context: 'Graffiti removal',
    stars: 5,
    placeholder: true,
  },
  {
    quote:
      'Straight answer on the phone, price held, and they told me what they were not going to charge me for. Rare.',
    name: 'Vehicle owner',
    context: 'Industrial fallout',
    stars: 5,
    placeholder: true,
  },
];
