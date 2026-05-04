import type { GarmentKind } from '@/components/GarmentTile/GarmentTile';

export type MagazineSurface = {
  baseSelectionIds: string[];
  body: string;
  deck: string;
  eyebrow: string;
  headline: string;
  kind: GarmentKind;
  section: 'cover' | 'trend' | 'curator';
  slug: string;
};

export type MagazineIssue = {
  audiencePersona: string;
  cover: MagazineSurface;
  publishDate: string;
  slug: string;
  title: string;
  trend: string;
  volume: number;
  surfaces: MagazineSurface[];
};

const cover: MagazineSurface = {
  baseSelectionIds: ['jacket-tobacco-cord', 'jean-cord', 'boot-chocolate'],
  body:
    'corduroy returns when the cultural mood favors texture over polish. heavier. more tailored. less apologetic.',
  deck: 'the eight-line wale,\nrecut for a heavier hand.',
  eyebrow: "VOL. 18 · THIS WEEK'S RETURN",
  headline: 'LAST SEEN: 2013. RETURNING.',
  kind: 'jacket',
  section: 'cover',
  slug: 'vol-18-corduroy',
};

const trendSurfaces: MagazineSurface[] = [
  {
    baseSelectionIds: ['jean-rinsed', 'jean-washed', 'jean-cord', 'jean-raw'],
    body: 'eight threads to the inch. coat-weight.',
    deck: 'wide-leg corduroy with a high natural waist and a heavier hand.',
    eyebrow: 'FOR THURSDAY',
    headline: 'the wide wale.',
    kind: 'trouser',
    section: 'trend',
    slug: 'vol-18-corduroy-wide-wale',
  },
  {
    baseSelectionIds: ['jacket-chore', 'jacket-olive-field', 'tee-optic', 'jean-rinsed'],
    body: 'three pockets. one rule: keep it heavy.',
    deck: 'moss corduroy cut like French workwear. square, useful, exact.',
    eyebrow: 'FOR THE OFFICE THAT IS NOT AN OFFICE',
    headline: 'the chore cut.',
    kind: 'jacket',
    section: 'trend',
    slug: 'vol-18-corduroy-chore-cut',
  },
  {
    baseSelectionIds: ['tee-black', 'tee-burgundy', 'shoe-black-loafer'],
    body: 'dust-rose. ankle. nothing else needed.',
    deck: 'a column in corduroy, high at the waist and quiet through the hem.',
    eyebrow: 'FOR LATE LIGHT',
    headline: 'the long skirt.',
    kind: 'skirt',
    section: 'trend',
    slug: 'vol-18-corduroy-long-skirt',
  },
  {
    baseSelectionIds: ['tee-heather', 'tee-charcoal', 'accessory-black-cap'],
    body: 'charcoal, fine-wale, brass at the back.',
    deck: 'the smallest piece carries the texture without taking the room.',
    eyebrow: 'FINISH THE LOOK',
    headline: 'the cap.',
    kind: 'cap',
    section: 'trend',
    slug: 'vol-18-corduroy-cap',
  },
];

const curatorSurfaces: MagazineSurface[] = [
  {
    baseSelectionIds: ['jacket-tobacco-cord', 'jean-cord', 'accessory-brown-belt'],
    body: 'from a paris atelier of one.',
    deck: 'tonal browns, horn buttons, cream stitching thread.',
    eyebrow: 'CURATED BY ATELIER ROUGEMONT',
    headline: 'three for autumn.',
    kind: 'jacket',
    section: 'curator',
    slug: 'vol-18-corduroy-rougemont',
  },
  {
    baseSelectionIds: ['jacket-chore', 'jean-grey', 'accessory-black-pouch'],
    body: 'from a copenhagen studio.',
    deck: 'cool greys, deep moss, hard-edged shadows.',
    eyebrow: 'CURATED BY STUDIO HALDEN',
    headline: 'cold-cut, cleanly.',
    kind: 'trouser',
    section: 'curator',
    slug: 'vol-18-corduroy-halden',
  },
  {
    baseSelectionIds: ['jacket-tobacco-cord', 'tee-burgundy', 'shoe-burgundy-loafer'],
    body: 'from an antwerp gallery upstairs.',
    deck: 'oxidized brass and oxblood, lit from the edge.',
    eyebrow: 'CURATED BY MAISON DEUX-CINQ',
    headline: 'brass and oxblood.',
    kind: 'skirt',
    section: 'curator',
    slug: 'vol-18-corduroy-deux-cinq',
  },
];

export const magazineIssue: MagazineIssue = {
  audiencePersona: 'classy',
  cover,
  publishDate: '2026-05-06',
  slug: 'vol-18-corduroy',
  title: '[STYLE] · Vol. 18 · corduroy',
  trend: 'corduroy',
  volume: 18,
  surfaces: [cover, ...trendSurfaces, ...curatorSurfaces],
};

export function getMagazineSurface(slug: string | undefined) {
  return magazineIssue.surfaces.find((surface) => surface.slug === slug) ?? magazineIssue.cover;
}
