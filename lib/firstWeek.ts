import { Platform } from 'react-native';
import { createMMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import type { StateStorage } from 'zustand/middleware';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { GarmentKind } from '@/components/GarmentTile/GarmentTile';

export type Persona = 'work' | 'going out' | 'weekend';
export type FirstSignatureRequestStatus = 'idle' | 'reading' | 'ready' | 'failed';

export type LookPiece = {
  detail: string;
  kind: GarmentKind;
  label: string;
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
  capturedPieces: CapturedPiece[];
  firstSignatureSaved: boolean;
  firstSignatureRequestStatus: FirstSignatureRequestStatus;
  foundationReceiptSeen: boolean;
  lastDressingRoomDate: string | null;
  persona: Persona;
  savedLooks: SavedLook[];
  starterSelections: string[];
  tasteNotes: string[];
  markFoundationReceiptSeen: () => void;
  requestFirstSignature: () => Promise<void>;
  saveCapturedPiece: () => void;
  saveLook: (look: Omit<SavedLook, 'savedAt'>) => void;
  setLastDressingRoomDate: (date: string) => void;
  setPersona: (persona: Persona) => void;
  setStarterSelections: (selectionIds: string[]) => void;
};

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

export function getSignatureForPersona(persona: Persona) {
  return signatureByPersona[persona];
}

export function getTodayLookForPersona(persona: Persona) {
  return todayLookByPersona[persona];
}

async function requestFirstSignatureDraft({
  persona,
  starterSelections,
}: {
  persona: Persona;
  starterSelections: string[];
}) {
  const endpoint =
    Platform.OS === 'web' && typeof process !== 'undefined'
      ? process.env.EXPO_PUBLIC_STYLEMEUP_LLM_ENDPOINT
      : undefined;

  if (!endpoint) {
    return getSignatureForPersona(persona);
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      moment: 'first-signature',
      persona,
      starterSelections,
    }),
  });

  if (!response.ok) {
    throw new Error('first signature request failed');
  }

  return getSignatureForPersona(persona);
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

export const useFirstWeekStore = create<FirstWeekState>()(
  persist(
    (set, get) => ({
      capturedPieces: [],
      firstSignatureSaved: false,
      firstSignatureRequestStatus: 'idle',
      foundationReceiptSeen: false,
      lastDressingRoomDate: null,
      persona: 'work',
      savedLooks: [],
      starterSelections: ['tee-optic', 'jean-rinsed', 'shoe-white-court', 'boot-black-chelsea'],
      tasteNotes: ['you keep choosing denim.'],
      markFoundationReceiptSeen: () => set({ foundationReceiptSeen: true }),
      requestFirstSignature: async () => {
        const state = get();

        set({ firstSignatureRequestStatus: 'reading' });

        try {
          await requestFirstSignatureDraft({
            persona: state.persona,
            starterSelections: state.starterSelections,
          });
          set({ firstSignatureRequestStatus: 'ready' });
        } catch {
          set({ firstSignatureRequestStatus: 'failed' });
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
      setLastDressingRoomDate: (date) => set({ lastDressingRoomDate: date }),
      setPersona: (persona) => set({ persona }),
      setStarterSelections: (selectionIds) =>
        set((state) => ({
          starterSelections: selectionIds,
          tasteNotes: buildTasteNotes(selectionIds, state.capturedPieces, state.savedLooks),
        })),
    }),
    {
      name: 'stylemeup-first-week',
      storage: createJSONStorage(() => firstWeekStorage),
    },
  ),
);
