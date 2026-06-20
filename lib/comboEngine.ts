/**
 * Combo engine v0 — the product core (PRODUCT_STRATEGY.md §9, SYSTEM_DESIGN.md §1).
 *
 * Pairs garments into outfits from METADATA, not pixels: a wrinkled photo
 * produces the same combo as a studio shot. Pure, on-device, no network —
 * generate valid outfits by rule, then rank by a deterministic editorial
 * score. The LLM-as-judge + chain-of-thought taste layer (v1) will re-rank
 * the top few of these against the week's trend; this file is the brain it
 * sits on top of.
 *
 * Input is a normalized ComboItem[] (built from starter selections, which
 * already carry tone + shape, and from captured pieces, which carry the
 * classifier's feature vector). Output is ranked Combos with a rationale.
 */
import type { StarterVariant, StarterShape } from '@/components/StarterPack/StarterPackExplorer';
import type { CapturedPiece } from '@/lib/firstWeek';
import type { GarmentKind } from '@/components/GarmentTile/GarmentTile';
import type { WardrobeTone } from '@/tokens/wardrobe';

export type Slot = 'top' | 'bottom' | 'footwear' | 'outerwear' | 'accessory';
export type ColorFamily = 'neutral' | 'accent';
export type Pattern = 'solid' | 'subtle' | 'bold';
export type Season = 'all-season' | 'warm' | 'cold';

export type ComboItem = {
  id: string;
  label: string;
  detail: string;
  slot: Slot;
  /** A dress fills top + bottom at once. */
  fillsBottom?: boolean;
  colorFamily: ColorFamily;
  tone?: WardrobeTone;
  formality: number; // 1-5
  pattern: Pattern;
  season: Season;
  kind: GarmentKind; // for rendering
  imageUri?: string;
};

export type Combo = {
  id: string;
  items: ComboItem[];
  score: number;
  rationale: string;
};

// ── Mapping helpers ────────────────────────────────────────────────────────

const SHAPE_TO_SLOT: Record<StarterShape, Slot> = {
  tee: 'top',
  jeans: 'bottom',
  sneaker: 'footwear',
  loafer: 'footwear',
  boot: 'footwear',
  jacket: 'outerwear',
  cap: 'accessory',
  belt: 'accessory',
  bag: 'accessory',
};

const SHAPE_TO_KIND: Record<StarterShape, GarmentKind> = {
  tee: 'tee',
  jeans: 'denim',
  sneaker: 'sneaker',
  loafer: 'flat',
  boot: 'boot',
  jacket: 'jacket',
  cap: 'cap',
  belt: 'accessory' as GarmentKind, // no exact kind; renders generic
  bag: 'bag',
};

export const KIND_TO_SLOT: Record<GarmentKind, Slot> = {
  tee: 'top', oxford: 'top', knit: 'top',
  dress: 'top', // dress is special-cased via fillsBottom
  denim: 'bottom', trouser: 'bottom', shorts: 'bottom', skirt: 'bottom',
  jacket: 'outerwear', coat: 'outerwear',
  sneaker: 'footwear', boot: 'footwear', heel: 'footwear', flat: 'footwear',
  bag: 'accessory', cap: 'accessory',
};

// Our palette is mostly quiet/neutral by design (DESIGN.md §6). Only a few
// tones read as a saturated "accent" that you don't want two of in a look.
const ACCENT_TONES = new Set<WardrobeTone>(['burgundy', 'olive', 'tobacco', 'sky', 'washedRed']);

function toneColorFamily(tone: WardrobeTone | undefined): ColorFamily {
  return tone && ACCENT_TONES.has(tone) ? 'accent' : 'neutral';
}

// Rough formality / season heuristics for items that only carry a shape/kind
// (no classifier vector yet). Real captured pieces override these.
const SHAPE_FORMALITY: Partial<Record<StarterShape, number>> = {
  tee: 2, jeans: 2, sneaker: 2, boot: 3, loafer: 4, jacket: 3, cap: 1, belt: 3, bag: 2,
};

// ── Building ComboItems from app data ──────────────────────────────────────

export function comboItemFromStarter(variant: StarterVariant): ComboItem {
  return {
    id: variant.id,
    label: variant.label,
    detail: variant.detail,
    slot: SHAPE_TO_SLOT[variant.shape],
    colorFamily: toneColorFamily(variant.tone),
    tone: variant.tone,
    formality: SHAPE_FORMALITY[variant.shape] ?? 3,
    pattern: 'solid',
    season: 'all-season',
    kind: SHAPE_TO_KIND[variant.shape],
  };
}

export function comboItemFromCaptured(piece: CapturedPiece): ComboItem {
  const slot = KIND_TO_SLOT[piece.kind] ?? 'top';
  return {
    id: piece.id,
    label: piece.label,
    detail: piece.detail,
    slot,
    fillsBottom: piece.kind === 'dress',
    // Captured pieces don't carry tone yet (classifier wiring, Phase C).
    colorFamily: 'neutral',
    formality: 3,
    pattern: 'solid',
    season: 'all-season',
    kind: piece.kind,
    imageUri: piece.imageUri,
  };
}

// ── Generation + ranking ────────────────────────────────────────────────────

function bySlot(items: ComboItem[], slot: Slot): ComboItem[] {
  return items.filter((item) => item.slot === slot);
}

function scoreCombo(items: ComboItem[]): { score: number; rationale: string } {
  let score = 100;
  const notes: string[] = [];

  // Color: count saturated accents — at most one in a quiet outfit.
  const accents = items.filter((item) => item.colorFamily === 'accent').length;
  if (accents === 0) {
    notes.push('a quiet base.');
  } else if (accents === 1) {
    score += 6;
    notes.push('one note of colour.');
  } else {
    score -= 22 * (accents - 1);
    notes.push('two colours competing.');
  }

  // Formality coherence: tight spread reads intentional.
  const formalities = items.map((item) => item.formality);
  const spread = Math.max(...formalities) - Math.min(...formalities);
  if (spread <= 1) {
    score += 8;
  } else if (spread >= 3) {
    score -= 18;
    notes.push('mixed dress codes.');
  }

  // Season: don't mix warm-weather and cold-weather pieces.
  const seasons = new Set(items.map((item) => item.season));
  if (seasons.has('warm') && seasons.has('cold')) {
    score -= 25;
    notes.push('wrong-weather mix.');
  }

  // Pattern: at most one loud pattern.
  const bold = items.filter((item) => item.pattern === 'bold').length;
  if (bold >= 2) {
    score -= 24;
    notes.push('two loud patterns.');
  }

  // Completeness: outerwear finishes a look.
  if (items.some((item) => item.slot === 'outerwear')) {
    score += 4;
  }

  const rationale = notes.length > 0 ? notes.join(' ') : 'clean lines.';
  return { score, rationale };
}

export type GenerateOptions = {
  /** Max items considered per slot, to bound combinations. */
  perSlotCap?: number;
  /** Max combos returned. */
  limit?: number;
};

/**
 * Generate ranked outfit combos from a pool of items. A valid combo is a
 * top + bottom + footwear (a dress can replace top+bottom), with optional
 * outerwear and one accessory. Returns highest-scored first.
 */
export function generateCombos(items: ComboItem[], options: GenerateOptions = {}): Combo[] {
  const perSlotCap = options.perSlotCap ?? 4;
  const limit = options.limit ?? 6;

  const tops = bySlot(items, 'top').slice(0, perSlotCap);
  const bottoms = bySlot(items, 'bottom').slice(0, perSlotCap);
  const footwear = bySlot(items, 'footwear').slice(0, perSlotCap);
  const outerwear = bySlot(items, 'outerwear').slice(0, perSlotCap);
  const accessories = bySlot(items, 'accessory').slice(0, perSlotCap);

  // A "core" is what satisfies top+bottom: either a (top, bottom) pair or a
  // single dress (top slot with fillsBottom).
  const cores: ComboItem[][] = [];
  const dresses = tops.filter((item) => item.fillsBottom);
  const plainTops = tops.filter((item) => !item.fillsBottom);
  for (const dress of dresses) cores.push([dress]);
  for (const top of plainTops) {
    for (const bottom of bottoms) cores.push([top, bottom]);
  }

  if (cores.length === 0 || footwear.length === 0) {
    return [];
  }

  const combos: Combo[] = [];
  let n = 0;
  for (const core of cores) {
    for (const shoe of footwear) {
      // base outfit
      const base = [...core, shoe];
      pushCombo(base);
      // + one outerwear
      for (const outer of outerwear) pushCombo([...base, outer]);
    }
  }

  function pushCombo(coreItems: ComboItem[]) {
    // optionally add the single best-fitting accessory (first one) for finish
    const items = accessories.length > 0 ? [...coreItems, accessories[0]] : coreItems;
    const { score, rationale } = scoreCombo(items);
    combos.push({ id: `combo-${n++}`, items, score, rationale });
  }

  return combos.sort((a, b) => b.score - a.score).slice(0, limit);
}
