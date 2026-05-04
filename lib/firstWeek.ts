import { Platform } from 'react-native';
import { createMMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import type { StateStorage } from 'zustand/middleware';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  getStarterVariantsByIds,
  type StarterShape,
  type StarterVariant,
} from '@/components/StarterPack/StarterPackExplorer';
import type { GarmentKind } from '@/components/GarmentTile/GarmentTile';

export type Persona = 'work' | 'going out' | 'weekend';
export type AudienceIdentity = 'man' | 'woman' | 'non-binary';
export type FirstSignatureRequestStatus = 'idle' | 'reading' | 'ready' | 'failed';

export type LookPiece = {
  detail: string;
  kind: GarmentKind;
  label: string;
};

const garmentKindMap: Record<GarmentKind, true> = {
  boot: true,
  cap: true,
  denim: true,
  jacket: true,
  oxford: true,
  skirt: true,
  sneaker: true,
  tee: true,
  trouser: true,
};

export type SavedLook = {
  caption: string;
  id: string;
  note: string;
  persona: Persona;
  pieces: LookPiece[];
  rationale: string;
  savedAt: string;
  title: string;
};

export type CapturedPiece = {
  capturedAt: string;
  detail: string;
  id: string;
  kind: GarmentKind;
  label: string;
  pairing: string;
};

type FirstWeekState = {
  audienceIdentity: AudienceIdentity | null;
  capturedPieces: CapturedPiece[];
  firstSignatureDraft: Omit<SavedLook, 'savedAt'> | null;
  firstSignatureSaved: boolean;
  firstSignatureRequestStatus: FirstSignatureRequestStatus;
  foundationReceiptSeen: boolean;
  lastDressingRoomDate: string | null;
  persona: Persona;
  savedLooks: SavedLook[];
  starterSelections: string[];
  tasteNotes: string[];
  markFoundationReceiptSeen: () => void;
  requestFirstSignature: (persona?: Persona) => Promise<void>;
  saveCapturedPiece: () => void;
  saveLook: (look: Omit<SavedLook, 'savedAt'>) => void;
  setAudienceIdentity: (identity: AudienceIdentity) => void;
  setLastDressingRoomDate: (date: string) => void;
  setPersona: (persona: Persona) => void;
  setStarterSelections: (selectionIds: string[]) => void;
};

type PersistedFirstWeekState = Partial<
  Pick<
    FirstWeekState,
    | 'audienceIdentity'
    | 'capturedPieces'
    | 'firstSignatureDraft'
    | 'firstSignatureSaved'
    | 'firstSignatureRequestStatus'
    | 'foundationReceiptSeen'
    | 'lastDressingRoomDate'
    | 'persona'
    | 'savedLooks'
    | 'starterSelections'
    | 'tasteNotes'
  >
>;

const legacySeededStarterSelections = ['tee-optic', 'jean-rinsed', 'shoe-white-court', 'boot-black-chelsea'];

function isLegacySeededStarterSelection(value: unknown) {
  return (
    Array.isArray(value) &&
    value.length === legacySeededStarterSelections.length &&
    legacySeededStarterSelections.every((selectionId) => value.includes(selectionId))
  );
}

function migrateFirstWeekState(persistedState: unknown) {
  if (!persistedState || typeof persistedState !== 'object') {
    return persistedState;
  }

  const state = persistedState as PersistedFirstWeekState;

  if (!isLegacySeededStarterSelection(state.starterSelections)) {
    return state;
  }

  return {
    ...state,
    firstSignatureDraft: null,
    firstSignatureRequestStatus: 'idle',
    starterSelections: [],
    tasteNotes: [],
  };
}

let nativeStorage: ReturnType<typeof createMMKV> | null = null;

function getNativeStorage() {
  if (Platform.OS === 'web') {
    return null;
  }

  nativeStorage ??= createMMKV({ id: 'stylemeup.first-week' });

  return nativeStorage;
}

function getWebStorage() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return null;
  }

  return window.localStorage;
}

const firstWeekStorage: StateStorage = {
  getItem: (name) => {
    const webStorage = getWebStorage();

    if (webStorage) {
      return webStorage.getItem(name);
    }

    return getNativeStorage()?.getString(name) ?? null;
  },
  removeItem: (name) => {
    const webStorage = getWebStorage();

    if (webStorage) {
      webStorage.removeItem(name);
      return;
    }

    getNativeStorage()?.remove(name);
  },
  setItem: (name, value) => {
    const webStorage = getWebStorage();

    if (webStorage) {
      webStorage.setItem(name, value);
      return;
    }

    getNativeStorage()?.set(name, value);
  },
};

export const signatureByPersona: Record<Persona, Omit<SavedLook, 'savedAt'>> = {
  work: {
    id: 'signature-work',
    title: 'thursday.',
    persona: 'work',
    caption: 'camel jacket · oxford · indigo denim',
    rationale: 'white cotton cuts the denim weight.',
    note: 'camel jacket, oxford, indigo denim.',
    pieces: [
      { kind: 'jacket', label: 'camel jacket', detail: 'soft shoulder' },
      { kind: 'oxford', label: 'blue oxford', detail: 'blue cotton' },
      { kind: 'denim', label: 'indigo denim', detail: 'straight leg' },
    ],
  },
  'going out': {
    id: 'signature-going-out',
    title: 'late light.',
    persona: 'going out',
    caption: 'black tee · black denim · low sneaker',
    rationale: 'one dark line keeps the room quiet.',
    note: 'black tee, black denim, low sneaker.',
    pieces: [
      { kind: 'tee', label: 'black tee', detail: 'flat cotton' },
      { kind: 'denim', label: 'black denim', detail: 'clean column' },
      { kind: 'sneaker', label: 'low sneaker', detail: 'quiet sole' },
    ],
  },
  weekend: {
    id: 'signature-weekend',
    title: 'weekend.',
    persona: 'weekend',
    caption: 'white tee · washed denim · white sneaker',
    rationale: 'soft cotton keeps the denim easy.',
    note: 'white tee, washed denim, white sneaker.',
    pieces: [
      { kind: 'tee', label: 'white tee', detail: 'dense cotton' },
      { kind: 'denim', label: 'washed denim', detail: 'soft break' },
      { kind: 'sneaker', label: 'white sneaker', detail: 'low sole' },
    ],
  },
};

export const todayLookByPersona: Record<Persona, Omit<SavedLook, 'savedAt'>> = {
  work: {
    id: 'today-work',
    title: 'today.',
    persona: 'work',
    caption: 'blue oxford · raw denim · black boot',
    rationale: 'a clean shirt gives the denim structure.',
    note: 'blue oxford, raw denim, black boot.',
    pieces: [
      { kind: 'oxford', label: 'blue oxford', detail: 'pressed cotton' },
      { kind: 'denim', label: 'raw denim', detail: 'rigid leg' },
      { kind: 'boot', label: 'black boot', detail: 'brushed leather' },
    ],
  },
  'going out': {
    id: 'today-going-out',
    title: 'tonight.',
    persona: 'going out',
    caption: 'black tee · cord trouser · white sneaker',
    rationale: 'the pale shoe breaks the darker line.',
    note: 'black tee, cord trouser, white sneaker.',
    pieces: [
      { kind: 'tee', label: 'black tee', detail: 'flat cotton' },
      { kind: 'trouser', label: 'cord trouser', detail: 'wide wale' },
      { kind: 'sneaker', label: 'white sneaker', detail: 'low sole' },
    ],
  },
  weekend: {
    id: 'today-weekend',
    title: 'today.',
    persona: 'weekend',
    caption: 'white tee · pale denim · charcoal cap',
    rationale: 'the cap gives the soft base a finish.',
    note: 'white tee, pale denim, charcoal cap.',
    pieces: [
      { kind: 'tee', label: 'white tee', detail: 'dense cotton' },
      { kind: 'denim', label: 'pale denim', detail: 'light cast' },
      { kind: 'cap', label: 'charcoal cap', detail: 'low crown' },
    ],
  },
};

const shapeKindByStarterShape: Record<StarterShape, GarmentKind> = {
  bag: 'cap',
  belt: 'cap',
  boot: 'boot',
  cap: 'cap',
  jacket: 'jacket',
  jeans: 'denim',
  loafer: 'sneaker',
  sneaker: 'sneaker',
  tee: 'tee',
};

function starterVariantToLookPiece(variant: StarterVariant): LookPiece {
  return {
    detail: variant.detail.replace(/\.$/, ''),
    kind: shapeKindByStarterShape[variant.shape],
    label: variant.label,
  };
}

type StarterTone = StarterVariant['tone'];

const tonePreferencesByPersona: Record<
  Persona,
  Record<'accessory' | 'boot' | 'denim' | 'jacket' | 'shoe' | 'tee', readonly StarterTone[]>
> = {
  work: {
    accessory: ['black', 'brown', 'tan', 'silver', 'canvas'],
    boot: ['black', 'brown', 'chocolate', 'charcoal', 'tan'],
    denim: ['rawIndigo', 'indigo', 'black', 'charcoal', 'ecru'],
    jacket: ['navy', 'charcoal', 'brown', 'olive', 'tan', 'black'],
    shoe: ['black', 'brown', 'tan', 'white', 'burgundy'],
    tee: ['optic', 'bone', 'white', 'cream', 'sky', 'heather'],
  },
  'going out': {
    accessory: ['black', 'silver', 'charcoal', 'navy', 'brown'],
    boot: ['black', 'offBlack', 'charcoal', 'chocolate', 'brown'],
    denim: ['black', 'rawIndigo', 'indigo', 'charcoal', 'greyDenim'],
    jacket: ['black', 'offBlack', 'charcoal', 'burgundy', 'navy'],
    shoe: ['black', 'offBlack', 'burgundy', 'silver', 'navy'],
    tee: ['black', 'charcoal', 'navy', 'burgundy', 'offBlack'],
  },
  weekend: {
    accessory: ['canvas', 'navy', 'white', 'olive', 'charcoal'],
    boot: ['tan', 'brown', 'ecru', 'field', 'chocolate'],
    denim: ['washedBlue', 'paleDenim', 'indigo', 'ecru', 'greyDenim'],
    jacket: ['washedBlue', 'olive', 'tan', 'ecru', 'heather'],
    shoe: ['white', 'canvas', 'cream', 'gum', 'heather'],
    tee: ['optic', 'bone', 'heather', 'sky', 'cream', 'washedRed'],
  },
};

function findPreferredStarterVariant(
  variants: StarterVariant[],
  predicate: (variant: StarterVariant) => boolean,
  preferredTones: readonly StarterTone[],
) {
  const matches = variants.filter(predicate);

  return matches.sort((first, second) => {
    const firstToneIndex = preferredTones.indexOf(first.tone);
    const secondToneIndex = preferredTones.indexOf(second.tone);
    const firstScore = firstToneIndex === -1 ? preferredTones.length : firstToneIndex;
    const secondScore = secondToneIndex === -1 ? preferredTones.length : secondToneIndex;

    return firstScore - secondScore;
  })[0];
}

function buildLookPiecesFromFoundation(persona: Persona, starterSelections: readonly string[]) {
  const selectedVariants = getStarterVariantsByIds(starterSelections).map((entry) => entry.variant);
  const fallbackPieces = signatureByPersona[persona].pieces;

  if (selectedVariants.length === 0) {
    return fallbackPieces;
  }

  const tonePreferences = tonePreferencesByPersona[persona];
  const tee = findPreferredStarterVariant(selectedVariants, (variant) => variant.shape === 'tee', tonePreferences.tee);
  const denim = findPreferredStarterVariant(selectedVariants, (variant) => variant.shape === 'jeans', tonePreferences.denim);
  const sneaker = findPreferredStarterVariant(
    selectedVariants,
    (variant) => variant.shape === 'sneaker' || variant.shape === 'loafer',
    tonePreferences.shoe,
  );
  const boot = findPreferredStarterVariant(selectedVariants, (variant) => variant.shape === 'boot', tonePreferences.boot);
  const jacket = findPreferredStarterVariant(selectedVariants, (variant) => variant.shape === 'jacket', tonePreferences.jacket);
  const accessory = findPreferredStarterVariant(
    selectedVariants,
    (variant) => variant.shape === 'cap' || variant.shape === 'belt' || variant.shape === 'bag',
    tonePreferences.accessory,
  );

  const selectedPieces =
    persona === 'work'
      ? [jacket, tee, denim, boot ?? sneaker]
      : persona === 'going out'
        ? [tee, denim, boot ?? sneaker, jacket]
        : [tee, denim, sneaker ?? boot, accessory];
  const pieces = selectedPieces
    .filter((variant): variant is StarterVariant => Boolean(variant))
    .slice(0, 3)
    .map(starterVariantToLookPiece);

  if (pieces.length >= 3) {
    return pieces;
  }

  const existingLabels = new Set(pieces.map((piece) => piece.label));
  const filledPieces = [
    ...pieces,
    ...fallbackPieces.filter((piece) => !existingLabels.has(piece.label)),
  ];

  return filledPieces.slice(0, 3);
}

export function buildFirstSignatureForFoundation(persona: Persona, starterSelections: readonly string[]) {
  const pieces = buildLookPiecesFromFoundation(persona, starterSelections);
  const caption = pieces.map((piece) => piece.label).join(' · ');
  const personaSlug = persona.replace(/\s+/g, '-');
  const rationaleByPersona: Record<Persona, string> = {
    work: 'the outer line gives the denim structure.',
    'going out': 'one clean line keeps the room quiet.',
    weekend: 'soft cotton keeps the denim easy.',
  };

  return {
    ...signatureByPersona[persona],
    id: `signature-${personaSlug}`,
    caption,
    note: `${caption}.`,
    pieces,
    rationale: rationaleByPersona[persona],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeString(value: unknown, maxLength: number) {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  return trimmed.slice(0, maxLength);
}

function isGarmentKind(value: unknown): value is GarmentKind {
  return typeof value === 'string' && value in garmentKindMap;
}

function normalizeModelPiece(value: unknown): LookPiece | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const kind = value.kind;
  const label = normalizeString(value.label, 40);
  const detail = normalizeString(value.detail, 64);

  if (!isGarmentKind(kind) || !label || !detail) {
    return undefined;
  }

  return {
    detail: detail.replace(/\.$/, ''),
    kind,
    label,
  };
}

function getFirstSignatureCandidate(response: unknown) {
  if (!isRecord(response)) {
    return response;
  }

  return response.firstSignature ?? response.look ?? response;
}

function normalizeFirstSignatureResponse({
  persona,
  response,
  starterSelections,
}: {
  persona: Persona;
  response: unknown;
  starterSelections: readonly string[];
}) {
  const fallback = buildFirstSignatureForFoundation(persona, starterSelections);
  const candidate = getFirstSignatureCandidate(response);

  if (!isRecord(candidate) || !Array.isArray(candidate.pieces)) {
    return fallback;
  }

  const pieces = candidate.pieces
    .map(normalizeModelPiece)
    .filter((piece): piece is LookPiece => Boolean(piece))
    .slice(0, 3);

  if (pieces.length < 3) {
    return fallback;
  }

  const caption = normalizeString(candidate.caption, 120) ?? pieces.map((piece) => piece.label).join(' · ');

  return {
    ...fallback,
    caption,
    note: normalizeString(candidate.note, 140) ?? `${caption}.`,
    pieces,
    rationale: normalizeString(candidate.rationale, 120) ?? fallback.rationale,
    title: normalizeString(candidate.title, 36) ?? fallback.title,
  };
}

export function getSignatureForPersona(persona: Persona) {
  return signatureByPersona[persona];
}

export function getTodayLookForPersona(persona: Persona) {
  return todayLookByPersona[persona];
}

async function requestFirstSignatureDraft({
  audienceIdentity,
  persona,
  starterSelections,
}: {
  audienceIdentity: AudienceIdentity | null;
  persona: Persona;
  starterSelections: string[];
}) {
  const endpoint = typeof process !== 'undefined' ? process.env.EXPO_PUBLIC_STYLEMEUP_LLM_ENDPOINT : undefined;

  if (!endpoint) {
    return buildFirstSignatureForFoundation(persona, starterSelections);
  }

  const starterPieces = getStarterVariantsByIds(starterSelections).map(({ category, variant }) => ({
    category: category.label,
    detail: variant.detail,
    id: variant.id,
    label: variant.label,
    shape: variant.shape,
    tone: variant.tone,
  }));

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      audienceIdentity,
      moment: 'first-signature',
      persona,
      starterSelections,
      starterPieces,
    }),
  });

  if (!response.ok) {
    throw new Error('first signature request failed');
  }

  const responseBody: unknown = await response.json();

  return normalizeFirstSignatureResponse({
    persona,
    response: responseBody,
    starterSelections,
  });
}

function buildTasteNotes(starterSelections: string[], capturedPieces: CapturedPiece[], savedLooks: SavedLook[]) {
  const notes: string[] = [];

  if (starterSelections.some((selection) => selection.includes('denim') || selection.includes('jean'))) {
    notes.push('you keep choosing denim.');
  }

  if (starterSelections.some((selection) => selection.includes('black')) || savedLooks.some((look) => look.caption.includes('black'))) {
    notes.push('dark pieces keep returning.');
  }

  if (capturedPieces.length > 0) {
    notes.push('one real piece is shaping the closet.');
  }

  return notes.slice(0, 3);
}

function waitForEditorialPause(duration: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, duration);
  });
}

export const useFirstWeekStore = create<FirstWeekState>()(
  persist(
    (set, get) => ({
      audienceIdentity: null,
      capturedPieces: [],
      firstSignatureDraft: null,
      firstSignatureSaved: false,
      firstSignatureRequestStatus: 'idle',
      foundationReceiptSeen: false,
      lastDressingRoomDate: null,
      persona: 'work',
      savedLooks: [],
      starterSelections: [],
      tasteNotes: [],
      markFoundationReceiptSeen: () => set({ foundationReceiptSeen: true }),
      requestFirstSignature: async (personaOverride) => {
        const state = get();
        const persona = personaOverride ?? state.persona;

        set({ firstSignatureRequestStatus: 'reading' });

        const editorialPause = waitForEditorialPause(1200);

        try {
          const firstSignatureDraft = await requestFirstSignatureDraft({
            audienceIdentity: state.audienceIdentity,
            persona,
            starterSelections: state.starterSelections,
          });
          await editorialPause;
          set({ firstSignatureDraft, firstSignatureRequestStatus: 'ready', persona });
        } catch {
          await editorialPause;
          set({
            firstSignatureDraft: buildFirstSignatureForFoundation(persona, state.starterSelections),
            firstSignatureRequestStatus: 'failed',
            persona,
          });
        }
      },
      saveCapturedPiece: () => {
        const state = get();
        const capturedPiece: CapturedPiece = {
          id: `captured-piece-${state.capturedPieces.length + 1}`,
          label: 'white crew-neck',
          detail: 'mid-weight cotton. photographed on bone.',
          kind: 'tee',
          pairing: 'wear it with dark denim.',
          capturedAt: new Date().toISOString(),
        };
        const capturedPieces = [...state.capturedPieces, capturedPiece];

        set({
          capturedPieces,
          tasteNotes: buildTasteNotes(state.starterSelections, capturedPieces, state.savedLooks),
        });
      },
      saveLook: (look) => {
        const state = get();
        const savedLook: SavedLook = {
          ...look,
          savedAt: new Date().toISOString(),
        };
        const savedLooks = [savedLook, ...state.savedLooks.filter((existingLook) => existingLook.id !== savedLook.id)];

        set({
          firstSignatureSaved: state.firstSignatureSaved || look.id.startsWith('signature-'),
          savedLooks,
          tasteNotes: buildTasteNotes(state.starterSelections, state.capturedPieces, savedLooks),
        });
      },
      setAudienceIdentity: (identity) => set({ audienceIdentity: identity }),
      setLastDressingRoomDate: (date) => set({ lastDressingRoomDate: date }),
      setPersona: (persona) => set({ firstSignatureDraft: null, firstSignatureRequestStatus: 'idle', persona }),
      setStarterSelections: (selectionIds) =>
        set((state) => ({
          firstSignatureDraft: null,
          firstSignatureRequestStatus: 'idle',
          starterSelections: selectionIds,
          tasteNotes: buildTasteNotes(selectionIds, state.capturedPieces, state.savedLooks),
        })),
    }),
    {
      migrate: migrateFirstWeekState,
      name: 'stylemeup-first-week',
      storage: createJSONStorage(() => firstWeekStorage),
      version: 2,
    },
  ),
);
