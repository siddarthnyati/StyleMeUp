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
  // ── T-shirts ──────────────────────────────────────────────────────────
  // men's catalog has boxy crew (240gsm); women's has fitted (160gsm Pima)
  'tee-optic': { men: 'men/white-crew-tee.png', women: 'women/white-fitted-tee.png' },
  'tee-black': { men: 'men/black-crew-tee.png', women: 'women/black-fitted-tee.png' },
  'tee-heather': { men: 'men/heather-grey-tee-men.png', women: 'women/heather-grey-tee-women.png' },
  'tee-navy': { men: 'men/navy-crew-tee-men.png', women: 'women/navy-fitted-tee-women.png' },
  'tee-olive': { men: 'men/olive-crew-tee-men.png', women: 'women/olive-fitted-tee-women.png' },
  // heather-grey doubles for the "heavy grey tee" variant (same fabric story)
  'tee-heavy-grey': { men: 'men/heather-grey-tee-men.png', women: 'women/heather-grey-tee-women.png' },

  // ── Jeans ────────────────────────────────────────────────────────────
  'jean-raw': { men: 'men/raw-indigo-jean.png', women: 'women/dark-wash-straight-jean-women.png' },
  'jean-rinsed': { men: 'men/raw-indigo-jean.png', women: 'women/dark-wash-straight-jean-women.png' },
  'jean-washed': { men: 'men/washed-blue-jean-men.png', women: 'women/washed-blue-jean-women.png' },
  'jean-straight': { men: 'men/washed-blue-jean-men.png', women: 'women/washed-blue-jean-women.png' },
  'jean-pale': { men: 'men/pale-denim-jean-men.png', women: 'women/light-wash-jean-women.png' },
  'jean-black': { men: 'men/black-washed-jean.png' },
  'jean-charcoal': { men: 'men/black-washed-jean.png' },

  // ── Shoes (sneakers + loafers) ───────────────────────────────────────
  'shoe-white-court': { men: 'men/white-low-sneaker.png', women: 'women/white-leather-sneaker-women.png' },
  'shoe-black-court': { men: 'men/black-court-sneaker-men.png' },
  'shoe-burgundy-loafer': { men: 'men/burgundy-loafer-men.png' },
  // black loafer — replaced the ballet-flat fallback with a real women's penny loafer
  'shoe-black-loafer': { women: 'women/black-leather-loafer-women.png' },

  // ── Boots ────────────────────────────────────────────────────────────
  'boot-black-chelsea': { men: 'men/black-chelsea-boot-men.png', women: 'women/black-chelsea-boot-women.png' },
  'boot-brown-chelsea': { men: 'men/brown-chelsea-boot-men.png', women: 'women/brown-chelsea-boot-women.png' },

  // ── Jackets / outerwear ──────────────────────────────────────────────
  'jacket-denim': { men: 'men/denim-trucker-jacket.png' },
  'jacket-raw-denim': { men: 'men/denim-trucker-jacket.png' },
  'jacket-charcoal-wool': { men: 'men/navy-wool-blazer-men.png', women: 'women/black-fitted-blazer-women.png' },
  'jacket-black-bomber': { men: 'men/black-bomber-jacket-men.png', women: 'women/black-bomber-jacket-women.png' },
  'jacket-leather': { men: 'men/black-leather-jacket-men.png', women: 'women/black-leather-jacket-women.png' },
  'jacket-olive-field': { men: 'men/olive-field-jacket-men.png' },

  // ── Accessories ──────────────────────────────────────────────────────
  'accessory-black-belt': { men: 'men/black-leather-belt-men.png', women: 'women/black-leather-belt-women.png' },
  'accessory-brown-belt': { men: 'men/brown-leather-belt-men.png', women: 'women/brown-leather-belt-women.png' },
  'accessory-navy-cap': { men: 'men/navy-cotton-cap-men.png' },
  'accessory-white-cap': { women: 'women/white-cotton-cap-women.png' },
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

  // Strict per-audience: a man never sees a women-cut photo, a woman
  // never sees a men-cut photo. Non-binary / unset can fall back to
  // either side (we prefer men's first for the boxier silhouette).
  if (audience === 'woman') {
    return entry.women ? `${SUPABASE_PUBLIC_BASE}/${entry.women}` : undefined;
  }
  if (audience === 'man') {
    return entry.men ? `${SUPABASE_PUBLIC_BASE}/${entry.men}` : undefined;
  }

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
