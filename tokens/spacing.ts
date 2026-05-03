/**
 * Spacing tokens from DESIGN.md §9.
 * The scale uses a 4pt base.
 */
export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 24,
  6: 32,
  7: 48,
  8: 64,
  9: 96,
  10: 128,
} as const;

export type SpacingToken = typeof spacing;
