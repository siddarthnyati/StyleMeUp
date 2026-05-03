/**
 * Color tokens from DESIGN.md §6.
 * Canvases are true black (`void`) and true white (`paper`) per §1.5 and §6.
 */
export const colors = {
  void: '#000000',
  paper: '#FFFFFF',
  ink: '#0A0A0A',
  bone: '#FAFAFA',
  shadow: '#050505',
  signal: '#E10600',
  power: '#B8954A',
  moment: '#FFD60A',
  smoke: {
    100: '#F2F2F2',
    200: '#D6D6D6',
    300: '#8C8C8C',
    400: '#3D3D3D',
    500: '#1A1A1A',
  },
} as const;

export type ColorToken = typeof colors;
