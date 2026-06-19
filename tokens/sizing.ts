/**
 * Sizing tokens from DESIGN.md §10 and §13.
 * These values cover fixed-format controls and state marks.
 */
export const sizing = {
  tapTarget: 44,
  hairline: 0.5,
  bottomNavigationHeight: 64,
  captureShutter: 48,
  captureShutterRing: 3,
  captureControlHeight: 112,
  appPreviewMaxWidth: 480,
  magazineCoverHeight: 520,
  garmentTileHeight: 172,
  garmentStageHeight: 96,
  lookCardHeight: 272,
  basicsBlockHeight: 344,
  basicsBlockFaceHeight: 168,
  basicsHeroImage: 128,
  basicsBlockPerspective: 900,
  basicsRailItemWidth: 128,
  basicsRailItemHeight: 156,
  basicsRailImage: 72,
  basicsSwatch: 10,
  basicsDragThreshold: 48,
  starterConfirmationDot: 10,
  starterDepartmentCardHeight: 148,
  starterCheckmark: {
    size: 7,
    lineHeight: 8,
    stroke: 1.5,
  },
  starterCategoryCardWidth: 132,
  starterCategoryImage: 52,
  starterCategoryHeroHeight: 168,
  starterHeroImage: 148,
  starterVariantCardHeight: 208,
  starterVariantImage: 88,
  starterFooterHeight: 72,
  starterShape: {
    teeWrap: { width: 64, height: 72 },
    teeSleeve: { width: 22, height: 22 },
    teeBody: { width: 34, height: 62 },
    teeNeck: { width: 18, height: 8 },
    jeansWrap: { width: 54, height: 76 },
    jeansWaistHeight: 14,
    sneakerWrap: { width: 74, height: 32 },
    loaferWrap: { width: 70, height: 28 },
    shoeUpperHeight: 20,
    shoeSoleHeight: 4,
    bootWrap: { width: 62, height: 72 },
    bootShaft: { width: 30, height: 52 },
    bootFoot: { width: 58, height: 20 },
    jacketWrap: { width: 76, height: 78 },
    jacketSleeve: { width: 22, height: 56 },
    jacketBody: { width: 42, height: 72 },
    jacketOpeningWidth: 10,
    capWrap: { width: 72, height: 42 },
    capCrown: { width: 48, height: 26 },
    capBrim: { width: 72, height: 10 },
    beltWrap: { width: 76, height: 30 },
    beltStrapHeight: 14,
    beltBuckle: { width: 18, height: 22 },
    bagWrap: { width: 62, height: 70 },
    bagHandle: { width: 30, height: 22 },
    bagBody: { width: 56, height: 48 },
  },
  starterSilhouette: {
    width: 56,
    height: 72,
  },
  outfit: {
    jacketHeight: 188,
    oxfordHeight: 132,
    denimHeight: 148,
  },
  garment: {
    tee: {
      width: 58,
      height: 72,
    },
    oxford: {
      width: 64,
      height: 82,
    },
    denim: {
      width: 54,
      height: 92,
    },
    sneaker: {
      width: 82,
      height: 30,
    },
    boot: {
      width: 68,
      height: 86,
    },
    jacket: {
      width: 82,
      height: 96,
    },
    trouser: {
      width: 58,
      height: 100,
    },
    skirt: {
      width: 62,
      height: 104,
    },
    cap: {
      width: 76,
      height: 42,
    },
    knit: {
      width: 62,
      height: 76,
    },
    dress: {
      width: 58,
      height: 116,
    },
    shorts: {
      width: 58,
      height: 54,
    },
    coat: {
      width: 84,
      height: 112,
    },
    heel: {
      width: 72,
      height: 38,
    },
    flat: {
      width: 74,
      height: 26,
    },
    bag: {
      width: 60,
      height: 58,
    },
  },
} as const;

export type SizingToken = typeof sizing;
