/**
 * Radius tokens from DESIGN.md §9.
 * Structural elements never exceed 4px; pills are reserved for chips and tags.
 */
export const radius = {
  none: 0,
  xs: 2,
  sm: 4,
  pill: 999,
} as const;

export type RadiusToken = typeof radius;
