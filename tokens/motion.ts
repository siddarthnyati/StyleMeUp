/**
 * Motion tokens from DESIGN.md §11.
 * The Vanishing is the brand signature transition and totals 1300ms.
 */
export const motion = {
  defaultEase: [0.22, 1, 0.36, 1],
  durations: {
    page: 400,
    micro: 250,
    magazineReveal: 600,
    vanishing: 1300,
  },
  vanishing: {
    dematerialize: 350,
    anticipation: 250,
    materialize: 450,
    settle: 250,
    reducedMotionFallback: 400,
  },
} as const;

export type MotionToken = typeof motion;
