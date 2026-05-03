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
  basicsBlockPerspective: 900,
  basicsRailItemWidth: 128,
  basicsRailItemHeight: 156,
  basicsSwatch: 10,
  basicsDragThreshold: 48,
  starterConfirmationDot: 10,
  starterCheckmark: {
    size: 7,
    lineHeight: 8,
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
  },
} as const;

export type SizingToken = typeof sizing;
