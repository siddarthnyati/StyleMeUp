/**
 * @register Sanctuary
 * @design-ref DESIGN.md §1.5, §10 (Capture), §12
 */
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, sizing, spacing, type } from '@/tokens';
import { BottomNavigation } from '@/components/BottomNavigation/BottomNavigation';
import { GarmentTile } from '@/components/GarmentTile/GarmentTile';
import { useFirstWeekStore } from '@/lib/firstWeek';

type CaptureStage = 'preface' | 'viewfinder' | 'loading' | 'result';

const loadingLines = ['reading the piece...', 'finding the weight...', 'cutting the silhouette...'] as const;

export function Capture() {
  const saveCapturedPiece = useFirstWeekStore((state) => state.saveCapturedPiece);
  const [stage, setStage] = useState<CaptureStage>('preface');
  const [loadingIndex, setLoadingIndex] = useState(0);

  useEffect(() => {
    if (stage !== 'loading') {
      return;
    }

    setLoadingIndex(0);

    const timers = [
      setTimeout(() => setLoadingIndex(1), 400),
      setTimeout(() => setLoadingIndex(2), 800),
      setTimeout(() => setStage('result'), 1200),
    ];

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [stage]);

  function handleSave() {
    saveCapturedPiece();
    router.push('/closet');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.stage, stage !== 'viewfinder' && stage !== 'loading' && styles.stagePaper]}>
        {stage === 'preface' ? (
          <View style={styles.preface}>
            <View style={styles.prefaceHeader}>
              <Text style={styles.sanctuaryEyebrow}>capture</Text>
              <Text style={styles.prefaceHeadline}>one piece.</Text>
              <Text style={styles.prefaceSubcaption}>start with the one nearest you.</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => setStage('viewfinder')}
              style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}
            >
              <Text style={styles.primaryActionLabel}>OPEN CAMERA</Text>
            </Pressable>
          </View>
        ) : null}

        {stage === 'viewfinder' ? (
          <>
            <View style={styles.topBar}>
              <Link href="/closet" asChild>
                <Pressable accessibilityRole="button" style={styles.topAction}>
                  <Text style={styles.cancel}>← cancel</Text>
                </Pressable>
              </Link>
              <Text style={styles.eyebrow}>FRAME THE PIECE</Text>
              <View style={styles.topSpacer} />
            </View>

            <View style={styles.viewfinder}>
              <Text style={styles.viewfinderText}>camera surface</Text>
            </View>

            <View style={styles.shutterWrap}>
              <Pressable
                accessibilityLabel="capture one piece"
                accessibilityRole="button"
                onPress={() => setStage('loading')}
                style={({ pressed }) => [styles.shutterButton, pressed && styles.pressed]}
              >
                <View style={styles.shutter} />
              </Pressable>
            </View>
          </>
        ) : null}

        {stage === 'loading' ? (
          <View style={styles.loadingStage}>
            <Text style={styles.loadingText}>{loadingLines[loadingIndex]}</Text>
            <Text style={styles.loadingMeta}>ABOUT A SECOND</Text>
          </View>
        ) : null}

        {stage === 'result' ? (
          <View style={styles.resultStage}>
            <View style={styles.resultTop}>
              <Pressable accessibilityRole="button" onPress={() => setStage('viewfinder')} style={styles.topAction}>
                <Text style={styles.resultAction}>← retake</Text>
              </Pressable>
              <Text style={styles.sanctuaryEyebrow}>JUST CAPTURED</Text>
              <View style={styles.topSpacer} />
            </View>

            <View style={styles.resultCard}>
              <GarmentTile detail="MID-WEIGHT COTTON" kind="tee" label="white crew-neck" register="Sanctuary" />
              <View style={styles.resultCopy}>
                <Text style={styles.resultHeadline}>white crew-neck.</Text>
                <Text style={styles.resultDetail}>mid-weight cotton.</Text>
                <Text style={styles.resultMeta}>photographed on bone.</Text>
              </View>
              <Text style={styles.pairing}>wear it with dark denim.</Text>
            </View>

            <View style={styles.resultActions}>
              <Pressable
                accessibilityRole="button"
                onPress={handleSave}
                style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}
              >
                <Text style={styles.primaryActionLabel}>SAVE TO CLOSET</Text>
              </Pressable>
              <Link href="/closet" asChild>
                <Pressable accessibilityRole="button" style={({ pressed }) => [styles.textAction, pressed && styles.pressed]}>
                  <Text style={styles.textActionLabel}>not now</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        ) : null}
      </View>
      <BottomNavigation active="capture" register="Sanctuary" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  stage: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  stagePaper: {
    backgroundColor: colors.paper,
  },
  preface: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing[5],
    paddingTop: spacing[7],
    paddingBottom: spacing[6],
  },
  prefaceHeader: {
    gap: spacing[2],
  },
  sanctuaryEyebrow: {
    color: colors.smoke[300],
    fontFamily: type.families.body,
    fontSize: type.micro.size,
    fontWeight: type.micro.weight,
    letterSpacing: type.micro.letterSpacing,
    lineHeight: type.micro.lineHeight,
  },
  prefaceHeadline: {
    color: colors.ink,
    fontFamily: type.families.displayMagazine,
    fontSize: type.displayMd.size,
    fontStyle: 'italic',
    fontWeight: type.displayMd.weight,
    lineHeight: type.displayMd.lineHeight,
  },
  prefaceSubcaption: {
    color: colors.smoke[300],
    fontFamily: type.families.body,
    fontSize: type.bodyMd.size,
    fontWeight: type.bodyMd.weight,
    lineHeight: type.bodyMd.lineHeight,
  },
  topBar: {
    minHeight: sizing.tapTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[5],
  },
  topAction: {
    minWidth: sizing.tapTarget,
    minHeight: sizing.tapTarget,
    justifyContent: 'center',
  },
  cancel: {
    color: colors.paper,
    fontFamily: type.families.body,
    fontSize: type.bodyMd.size,
    fontWeight: type.bodyMd.weight,
    lineHeight: type.bodyMd.lineHeight,
    opacity: 0.7,
  },
  eyebrow: {
    color: colors.paper,
    fontFamily: type.families.body,
    fontSize: type.micro.size,
    fontWeight: type.micro.weight,
    letterSpacing: type.micro.letterSpacing,
    lineHeight: type.micro.lineHeight,
    opacity: 0.85,
  },
  topSpacer: {
    width: sizing.tapTarget,
  },
  viewfinder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.smoke[500],
    borderTopWidth: sizing.hairline,
    borderBottomWidth: sizing.hairline,
  },
  viewfinderText: {
    color: colors.smoke[300],
    fontFamily: type.families.displayMagazine,
    fontSize: type.bodyLg.size,
    fontStyle: 'italic',
    fontWeight: type.bodyLg.weight,
    lineHeight: type.bodyLg.lineHeight,
  },
  shutterWrap: {
    minHeight: sizing.captureControlHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterButton: {
    width: sizing.tapTarget,
    height: sizing.tapTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutter: {
    width: sizing.captureShutter,
    height: sizing.captureShutter,
    borderColor: colors.paper,
    borderRadius: radius.pill,
    borderWidth: sizing.captureShutterRing,
    backgroundColor: colors.power,
  },
  loadingStage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    backgroundColor: colors.paper,
  },
  loadingText: {
    color: colors.ink,
    fontFamily: type.families.displayMagazine,
    fontSize: type.headlineLg.size,
    fontStyle: 'italic',
    fontWeight: type.displayMd.weight,
    lineHeight: type.headlineLg.lineHeight,
  },
  loadingMeta: {
    color: colors.smoke[300],
    fontFamily: type.families.body,
    fontSize: type.micro.size,
    fontWeight: type.micro.weight,
    letterSpacing: type.micro.letterSpacing,
    lineHeight: type.micro.lineHeight,
  },
  resultStage: {
    flex: 1,
    gap: spacing[5],
    paddingHorizontal: spacing[5],
    paddingTop: spacing[5],
    paddingBottom: spacing[6],
  },
  resultTop: {
    minHeight: sizing.tapTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultAction: {
    color: colors.smoke[300],
    fontFamily: type.families.body,
    fontSize: type.bodyMd.size,
    fontWeight: type.bodyMd.weight,
    lineHeight: type.bodyMd.lineHeight,
  },
  resultCard: {
    flex: 1,
    gap: spacing[4],
    justifyContent: 'center',
  },
  resultCopy: {
    gap: spacing[1],
  },
  resultHeadline: {
    color: colors.ink,
    fontFamily: type.families.displayMagazine,
    fontSize: type.headlineLg.size,
    fontStyle: 'italic',
    fontWeight: type.displayMd.weight,
    lineHeight: type.headlineLg.lineHeight,
  },
  resultDetail: {
    color: colors.ink,
    fontFamily: type.families.displayMagazine,
    fontSize: type.bodyLg.size,
    fontStyle: 'italic',
    fontWeight: type.bodyLg.weight,
    lineHeight: type.bodyLg.lineHeight,
  },
  resultMeta: {
    color: colors.smoke[300],
    fontFamily: type.families.body,
    fontSize: type.bodyMd.size,
    fontWeight: type.bodyMd.weight,
    lineHeight: type.bodyMd.lineHeight,
  },
  pairing: {
    color: colors.ink,
    fontFamily: type.families.displayMagazine,
    fontSize: type.bodyLg.size,
    fontStyle: 'italic',
    fontWeight: type.bodyLg.weight,
    lineHeight: type.bodyLg.lineHeight,
  },
  resultActions: {
    gap: spacing[2],
  },
  primaryAction: {
    minHeight: sizing.tapTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.ink,
    paddingHorizontal: spacing[5],
  },
  primaryActionLabel: {
    color: colors.paper,
    fontFamily: type.families.body,
    fontSize: type.label.size,
    fontWeight: type.label.weight,
    letterSpacing: type.micro.letterSpacing,
    lineHeight: type.label.lineHeight,
  },
  textAction: {
    minHeight: sizing.tapTarget,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  textActionLabel: {
    color: colors.ink,
    fontFamily: type.families.body,
    fontSize: type.bodyMd.size,
    fontWeight: type.headlineMd.weight,
    lineHeight: type.bodyMd.lineHeight,
  },
  pressed: {
    opacity: 0.64,
  },
});
