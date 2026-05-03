/**
 * Typography tokens from DESIGN.md §7.
 * MVP font fallbacks follow the documented free stack: Fraunces + Inter.
 */
export const type = {
  families: {
    displayMagazine: 'Fraunces',
    displaySanctuary: 'Inter',
    body: 'Inter',
    mono: 'JetBrains Mono',
  },
  monumental: {
    size: 96,
    lineHeight: 96,
    weight: '400',
  },
  displayXl: {
    size: 56,
    lineHeight: 60,
    weight: '400',
  },
  displayLg: {
    size: 40,
    lineHeight: 44,
    weight: '400',
  },
  displayMd: {
    size: 28,
    lineHeight: 32,
    weight: '400',
  },
  headlineLg: {
    size: 22,
    lineHeight: 28,
    weight: '500',
  },
  headlineMd: {
    size: 18,
    lineHeight: 24,
    weight: '500',
  },
  bodyLg: {
    size: 16,
    lineHeight: 24,
    weight: '400',
  },
  bodyMd: {
    size: 14,
    lineHeight: 20,
    weight: '400',
  },
  label: {
    size: 12,
    lineHeight: 16,
    weight: '500',
  },
  micro: {
    size: 10,
    lineHeight: 14,
    weight: '600',
    letterSpacing: 1.2,
  },
} as const;

export type TypeToken = typeof type;
