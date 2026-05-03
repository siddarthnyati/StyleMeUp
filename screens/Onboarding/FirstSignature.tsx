/**
 * @register Magazine
 * @design-ref DESIGN.md §1.5, §10 (Onboarding), §12
 */
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, sizing, spacing, type } from '@/tokens';
import { BottomNavigation } from '@/components/BottomNavigation/BottomNavigation';
import { OutfitComposition } from '@/components/OutfitComposition/OutfitComposition';
import { getSignatureForPersona, useFirstWeekStore } from '@/lib/firstWeek';

export function FirstSignature() {
  const firstSignatureSaved = useFirstWeekStore((state) => state.firstSignatureSaved);
  const persona = useFirstWeekStore((state) => state.persona);
  const saveLook = useFirstWeekStore((state) => state.saveLook);
  const signature = getSignatureForPersona(persona);
  const [showSaved, setShowSaved] = useState(firstSignatureSaved);
  const [showCaptureAction, setShowCaptureAction] = useState(firstSignatureSaved);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  function handleSave() {
    saveLook(signature);
    setShowSaved(true);
    setShowCaptureAction(false);

    timerRef.current = setTimeout(() => {
      setShowCaptureAction(true);
    }, 1200);
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
          ) : (
            <Link
              accessibilityRole="button"
              href="/capture"
              onPress={(event) => {
                event.preventDefault();
                handleSave();
              }}
              style={styles.primaryAction}
            >
              <Text style={styles.primaryActionLabel}>SAVE TO CLOSET</Text>
            </Link>
          )}
        </View>
      </View>
      <BottomNavigation active="closet" register="Magazine" />
    </SafeAreaView>
  );
}

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
