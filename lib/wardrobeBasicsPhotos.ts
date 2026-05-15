// Maps starter pack variant IDs to real Supabase wardrobe-basics photos.
// Variants without a mapping fall back to the SVG shape renderer.
//
// The wardrobe-basics bucket is public, so URLs are direct + no signing.
// Pattern: https://{supabaseHost}/storage/v1/object/public/wardrobe-basics/{gender}/{slug}.png
//
// We have ~10 men + ~10 women generated today. The catalog will expand;
// any starter variant ID not in this map renders the SVG fallback. That
// keeps the experience consistent during the gradual rollout.

import type { AudienceIdentity } from '@/lib/firstWeek';

const SUPABASE_PUBLIC_BASE =
  'https://bocvtwwmqphfnwmzdjcc.supabase.co/storage/v1/object/public/wardrobe-basics';

// Per-gender mapping. Some entries map both genders to the same slug
// (e.g., chelsea boots), others diverge meaningfully (tees, jeans).
type GenderedMap = { men?: string; women?: string };

const STARTER_TO_BASICS: Record<string, GenderedMap> = {
  // T-shirts — men's catalog has white-crew-tee (boxy 240gsm), women's has white-fitted-tee (160gsm Pima fitted)
  'tee-optic': { men: 'men/white-crew-tee.png', women: 'women/white-fitted-tee.png' },
  'tee-black': { men: 'men/black-crew-tee.png', women: 'women/black-fitted-tee.png' },

  // Jeans
  'jean-raw': { men: 'men/raw-indigo-jean.png', women: 'women/dark-wash-straight-jean-women.png' },
  'jean-charcoal': { men: 'men/black-washed-jean.png' },

  // Shoes (sneakers + flats)
  'shoe-white-court': { men: 'men/white-low-sneaker.png', women: 'women/white-leather-sneaker-women.png' },
  // ballet flat is women-only; closest masculine analog is the loafer (not yet generated)
  'shoe-black-loafer': { women: 'women/black-ballet-flat.png' },

  // Boots
  'boot-black-chelsea': { men: 'men/black-chelsea-boot-men.png', women: 'women/black-chelsea-boot-women.png' },

  // Jackets / outerwear
  'jacket-denim': { men: 'men/denim-trucker-jacket.png' },
  'jacket-charcoal-wool': { men: 'men/navy-wool-blazer-men.png', women: 'women/black-fitted-blazer-women.png' },
  'jacket-black-bomber': { men: 'men/black-bomber-jacket-men.png', women: 'women/black-bomber-jacket-women.png' },

  // Accessories
  'accessory-black-belt': { men: 'men/black-leather-belt-men.png', women: 'women/black-leather-belt-women.png' },
};

/**
 * Returns the public photo URL for a starter variant if one exists for
 * the user's audience identity. Otherwise returns undefined and the
 * caller falls back to the SVG shape renderer.
 */
export function getWardrobeBasicsPhotoUrl(
  variantId: string,
  audience: AudienceIdentity | null,
): string | undefined {
  const entry = STARTER_TO_BASICS[variantId];
  if (!entry) return undefined;

  // For non-binary or unknown: prefer men's catalog as default (boxier
  // silhouettes read more gender-neutral), but fall back to women's if
  // only that one was generated.
  if (audience === 'woman') {
    return entry.women ? `${SUPABASE_PUBLIC_BASE}/${entry.women}` : undefined;
  }

  // man + non-binary + null all default to men's first, then women's
  const path = entry.men ?? entry.women;
  return path ? `${SUPABASE_PUBLIC_BASE}/${path}` : undefined;
}

/**
 * Has any photo available for this variant (either gender)?
 * Useful for analytics — "% of starter pack now rendered from real photos."
 */
export function hasWardrobeBasicsPhoto(variantId: string): boolean {
  const entry = STARTER_TO_BASICS[variantId];
  return Boolean(entry && (entry.men || entry.women));
}

/**
 * Pick N preview variant IDs from a list, preferring ones that have real
 * photos available for the given audience. Falls back to fillers when
 * fewer than N photographed variants exist.
 */
export function pickPhotoFirstVariants<T extends { id: string }>(
  variants: readonly T[],
  audience: AudienceIdentity | null,
  count: number,
): T[] {
  const photographed: T[] = [];
  const rest: T[] = [];
  for (const v of variants) {
    if (getWardrobeBasicsPhotoUrl(v.id, audience)) photographed.push(v);
    else rest.push(v);
  }
  return [...photographed, ...rest].slice(0, count);
}
