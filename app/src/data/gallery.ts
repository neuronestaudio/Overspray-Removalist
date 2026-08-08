/**
 * Gallery items.
 *
 * Alt text is per-photo and descriptive, not the filename and not the business
 * name repeated 26 times. The old site had 48 of 79 images with missing or
 * empty alt, which is both an accessibility failure and a wasted signal on the
 * one asset here that competitors cannot fabricate.
 */
export interface GalleryItem {
  /** Image stem in /assets/images, without width suffix or extension. */
  stem: string;
  alt: string;
}

export const GALLERY: GalleryItem[] = [
  { stem: 'job-splatter-1', alt: 'Black sedan covered in orange paint overspray before removal' },
  { stem: 'job-splatter-2', alt: 'Orange overspray being rinsed from the roof and boot of a black sedan' },
  { stem: 'job-splatter-3', alt: 'Orange overspray down the side of a black sedan before treatment' },
  { stem: 'job-splatter-after', alt: 'The sedan after full overspray removal' },
  { stem: 'job-tarago-before', alt: 'Toyota van covered in dark paint overspray along the driver side' },
  { stem: 'job-tarago-after', alt: 'The same Toyota van restored, paint clean and undamaged' },
  { stem: 'job-ute-1', alt: 'Blue Holden ute showing industrial fallout across the panels' },
  { stem: 'job-ute-2', alt: 'Rear of the blue Holden ute with fallout contamination' },
  { stem: 'job-ute-3', alt: 'Blue Holden ute in the yard before decontamination' },
  { stem: 'job-ute-4', alt: 'Fallout detail across the ute tray and tailgate' },
  { stem: 'job-ute-after-1', alt: 'The blue Holden ute after fallout removal, gloss restored' },
  { stem: 'job-ute-after-2', alt: 'Second angle of the restored blue Holden ute' },
  { stem: 'job-merc-1', alt: 'White Mercedes A-Class with heavy fallout on the rear quarter' },
  { stem: 'job-merc-2', alt: 'Fallout detail across the Mercedes tail light and panel' },
  { stem: 'job-merc-after', alt: 'The white Mercedes A-Class after restoration' },
  { stem: 'job-audi-1', alt: 'Red graffiti sprayed across the boot of a silver Audi' },
  { stem: 'job-audi-2', alt: 'Red graffiti along the side of the silver Audi' },
  { stem: 'job-audi-after', alt: 'The silver Audi after graffiti removal, original paint intact' },
  { stem: 'ram', alt: 'Restored white RAM pickup after overspray removal' },
  { stem: 'landcruiser', alt: 'Toyota Landcruiser ute cleaned of industrial fallout' },
  { stem: 'challenger', alt: 'Dodge Challenger in green after paint restoration' },
  { stem: 'suv-black', alt: 'Black SUV restored to gloss after fallout removal' },
  { stem: 'audi', alt: 'Audi front grille after decontamination' },
  { stem: 'wheel-a', alt: 'Alloy wheel and guard cleaned of overspray' },
  { stem: 'wheel-b', alt: 'Wheel arch detail after overspray removal' },
  { stem: 'van-wash', alt: 'Commercial van being treated during a fallout job' },
];
