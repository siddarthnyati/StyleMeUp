/**
 * @register Magazine
 * @design-ref DESIGN.md §1.5, §10 (Onboarding), §12
 */
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, sizing, spacing, type } from '@/tokens';
import { BottomNavigation } from '@/components/BottomNavigation/BottomNavigation';
import { getStarterSelectionFromSearch } from '@/components/StarterPack/StarterPackExplorer';
import { OutfitComposition } from '@/components/OutfitComposition/OutfitComposition';
import {
  buildFirstSignatureForFoundation,
  useFirstWeekStore,
  type Persona,
} from '@/lib/firstWeek';

const personas: Persona[] = ['work', 'going out', 'weekend'];
const loadingLines = ['reading the foundation...', 'finding the weight...', 'cutting the silhouette...'] as const;

function getPersonaFromSearch(value: string | string[] | undefined): Persona | undefined {
  const persona = Array.isArray(value) ? value[0] : value;

  return personas.includes(persona as Persona) ? (persona as Persona) : undefined;
}

export function FirstSignature() {
  const searchParams = useLocalSearchParams<{ persona?: string; saved?: string; selected?: string }>();
  const searchPersona = getPersonaFromSearch(searchParams.persona);
  const searchSelectedIds = getStarterSelectionFromSearch(searchParams.selected);
  const routeSaved = searchParams.saved === '1';
  const firstSignatureDraft = useFirstWeekStore((state) => state.firstSignatureDraft);
  const firstSignatureSaved = useFirstWeekStore((state) => state.firstSignatureSaved);
  const firstSignatureRequestStatus = useFirstWeekStore((state) => state.firstSignatureRequestStatus);
  const persona = useFirstWeekStore((state) => state.persona);
  const saveLook = useFirstWeekStore((state) => state.saveLook);
  const starterSelections = useFirstWeekStore((state) => state.starterSelections);
  const effectivePersona = searchPersona ?? persona;
  const effectiveStarterSelections = searchSelectedIds ?? starterSelections;
  const localSignature = buildFirstSignatureForFoundation(effectivePersona, effectiveStarterSelections);
  const genericSignature = buildFirstSignatureForFoundation(effectivePersona, []);
  const shouldUseDraft =
    firstSignatureDraft?.persona === effectivePersona &&
    (!effectiveStarterSelections.length || firstSignatureDraft.caption !== genericSignature.caption);
  const signature = shouldUseDraft ? firstSignatureDraft : localSignature;
  const selectedParam = effectiveStarterSelections.length
    ? `&selected=${encodeURIComponent(effectiveStarterSelections.join(','))}`
    : '';
  const savedHref = `/onboarding/first-signature?persona=${encodeURIComponent(effectivePersona)}${selectedParam}&saved=1`;
  const [showSaved, setShowSaved] = useState(firstSignatureSaved || routeSaved);
  const [showCaptureAction, setShowCaptureAction] = useState(firstSignatureSaved || routeSaved);
  const [loadingIndex, setLoadingIndex] = useState(0);
  const routeSaveHandledRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSave = useCallback(() => {
    saveLook(signature);
    setShowSaved(true);
    setShowCaptureAction(false);

    timerRef.current = setTimeout(() => {
      setShowCaptureAction(true);
    }, 1200);
  }, [saveLook, signature]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (firstSignatureRequestStatus !== 'reading') {
      return;
    }

    setLoadingIndex(0);

    const timers = [
      setTimeout(() => setLoadingIndex(1), 400),
      setTimeout(() => setLoadingIndex(2), 800),
    ];

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [firstSignatureRequestStatus]);

  useEffect(() => {
    if (!routeSaved || routeSaveHandledRef.current) {
      return;
    }

    routeSaveHandledRef.current = true;
    saveLook(signature);
    setShowSaved(true);
    setShowCaptureAction(false);
  }, [routeSaved, saveLook, signature]);

  if (firstSignatureRequestStatus === 'reading') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.stage}>
          <View style={styles.header}>
            <Text style={styles.eyebrow}>YOUR FIRST SIGNATURE</Text>
            <Text style={styles.headline}>{loadingLines[loadingIndex]}</Text>
          </View>
          <View style={styles.loadingStage}>
            <Text style={styles.loadingMeta}>ABOUT A SECOND</Text>
          </View>
        </View>
        <BottomNavigation active="closet" register="Magazine" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.stage}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>YOUR FIRST SIGNATURE</Text>
          <Text style={styles.headline}>{signature.title}</Text>
        </View>

        <OutfitComposition pieces={signature.pieces} />

        <View style={styles.captionBlock}>
          <Text style={styles.caption}>{signature.caption}</Text>
          <Text style={styles.subcaption}>
            — <Text style={styles.momentText}>your moment.</Text>
          </Text>
          <Text style={styles.rationale}>{signature.rationale}</Text>
        </View>

        <View style={styles.actionBlock}>
          {showSaved ? <Text style={styles.savedText}>saved.</Text> : null}
          {showCaptureAction ? (
            <Link href="/capture" asChild>
              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [styles.textAction, pressed && styles.actionPressed]}
              >
                <Text style={styles.textActionLabel}>add one real piece →</Text>
              </Pressable>
            </Link>
          ) : Platform.OS === 'web' ? (
            <a href={savedHref} style={webPrimaryActionStyle}>
              <Text style={styles.primaryActionLabel}>SAVE TO CLOSET</Text>
            </a>
          ) : (
            <Pressable
              accessibilityRole="button"
              onPress={handleSave}
              style={({ pressed }) => [styles.primaryAction, pressed && styles.actionPressed]}
            >
              <Text style={styles.primaryActionLabel}>SAVE TO CLOSET</Text>
            </Pressable>
          )}
        </View>
      </View>
      <BottomNavigation active="closet" register="Magazine" />
    </SafeAreaView>
  );
}

const webPrimaryActionStyle: CSSProperties = {
  minHeight: sizing.tapTarget,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: radius.sm,
  backgroundColor: colors.paper,
  paddingInline: spacing[5],
  display: 'flex',
  textDecoration: 'none',
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.void,
  },
  stage: {
    flex: 1,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[7],
    paddingBottom: spacing[6],
  },
  header: {
    gap: spacing[3],
  },
  eyebrow: {
    color: colors.moment,
    fontFamily: type.families.body,
    fontSize: type.micro.size,
    fontWeight: type.micro.weight,
    letterSpacing: type.micro.letterSpacing,
    lineHeight: type.micro.lineHeight,
  },
  headline: {
    color: colors.paper,
    fontFamily: type.families.displayMagazine,
    fontSize: type.headlineLg.size,
    fontStyle: 'italic',
    fontWeight: type.displayMd.weight,
    lineHeight: type.headlineLg.lineHeight,
  },
  captionBlock: {
    gap: spacing[2],
  },
  loadingStage: {
    flex: 1,
    justifyContent: 'center',
  },
  loadingMeta: {
    color: colors.smoke[300],
    fontFamily: type.families.body,
    fontSize: type.micro.size,
    fontWeight: type.micro.weight,
    letterSpacing: type.micro.letterSpacing,
    lineHeight: type.micro.lineHeight,
  },
  caption: {
    color: colors.smoke[300],
    fontFamily: type.families.body,
    fontSize: type.bodyMd.size,
    fontWeight: type.bodyMd.weight,
    lineHeight: type.bodyMd.lineHeight,
  },
  subcaption: {
    color: colors.smoke[300],
    fontFamily: type.families.body,
    fontSize: type.bodyMd.size,
    fontWeight: type.bodyMd.weight,
    lineHeight: type.bodyMd.lineHeight,
  },
  momentText: {
    color: colors.moment,
  },
  rationale: {
    color: colors.paper,
    fontFamily: type.families.displayMagazine,
    fontSize: type.bodyLg.size,
    fontStyle: 'italic',
    fontWeight: type.bodyLg.weight,
    lineHeight: type.bodyLg.lineHeight,
  },
  actionBlock: {
    minHeight: sizing.captureControlHeight,
    justifyContent: 'center',
    gap: spacing[2],
  },
  savedText: {
    color: colors.paper,
    fontFamily: type.families.displayMagazine,
    fontSize: type.headlineLg.size,
    fontStyle: 'italic',
    fontWeight: type.displayMd.weight,
    lineHeight: type.headlineLg.lineHeight,
  },
  primaryAction: {
    minHeight: sizing.tapTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.paper,
    paddingHorizontal: spacing[5],
  },
  primaryActionLabel: {
    color: colors.void,
    fontFamily: type.families.body,
    fontSize: type.label.size,
    fontWeight: type.label.weight,
    letterSpacing: type.micro.letterSpacing,
    lineHeight: type.label.lineHeight,
  },
  textAction: {
    minHeight: sizing.tapTarget,
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  textActionLabel: {
    color: colors.paper,
    fontFamily: type.families.body,
    fontSize: type.bodyMd.size,
    fontWeight: type.headlineMd.weight,
    lineHeight: type.bodyMd.lineHeight,
  },
  actionPressed: {
    opacity: 0.64,
  },
});
