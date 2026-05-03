/**
 * Garment tone tokens for starter-pack imagery.
 * These are product-material tones, not interface colors; DESIGN.md §12 requires starter basics,
 * and §13 requires editorial alt text for garment imagery.
 */
export const wardrobeTones = {
  optic: '#FDFDFB',
  white: '#FFFFFF',
  black: '#090909',
  offBlack: '#151515',
  bone: '#F4EFE7',
  cream: '#EFE7D7',
  heather: '#C9C9C5',
  charcoal: '#2A2A2A',
  navy: '#151B2B',
  tobacco: '#8B5E3C',
  olive: '#536045',
  burgundy: '#5A1E25',
  sky: '#AFC7D8',
  steel: '#6F7B82',
  washedRed: '#9B4643',
  rawIndigo: '#111C30',
  indigo: '#1D3557',
  washedBlue: '#7895B7',
  paleDenim: '#B8C8D8',
  greyDenim: '#686C6F',
  ecru: '#E8DFD2',
  brown: '#604333',
  chocolate: '#3A2418',
  tan: '#B99267',
  silver: '#C9CDD0',
  gum: '#B58A52',
  canvas: '#D9D1C4',
  field: '#4B4637',
  rubber: '#1F2322',
} as const;

export type WardrobeTone = keyof typeof wardrobeTones;
