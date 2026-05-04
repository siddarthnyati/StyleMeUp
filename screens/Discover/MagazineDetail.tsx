/**
 * @register Magazine
 * @design-ref DESIGN.md §1.5, §10 (Discover), §12
 */
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, sizing, spacing, type } from '@/tokens';
import { BottomNavigation } from '@/components/BottomNavigation/BottomNavigation';
import { GarmentTile } from '@/components/GarmentTile/GarmentTile';
import { useFirstWeekStore } from '@/lib/firstWeek';
import { getMagazineSurface } from '@/lib/magazineIssue';

export function MagazineDetail() {
  const searchParams = useLocalSearchParams<{ slug?: string }>();
  const slug = Array.isArray(searchParams.slug) ? searchParams.slug[0] : searchParams.slug;
  const surface = getMagazineSurface(slug);
  const capturedPieces = useFirstWeekStore((state) => state.capturedPieces);
  const starterSelections = useFirstWeekStore((state) => state.starterSelections);
  const selectedIdSet = new Set(starterSelections);
  const hasBase =
    surface.baseSelectionIds.some((selectionId) => selectedIdSet.has(selectionId)) ||
    capturedPieces.some((piece) => surface.body.includes(piece.label.split(' ')[0]));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.stage} showsVerticalScrollIndicator={false}>
        <Link href="/discover" asChild>
          <Pressable accessibilityRole="button" style={({ pressed }) => [styles.backAction, pressed && styles.pressed]}>
            <Text style={styles.backLabel}>← discover</Text>
          </Pressable>
        </Link>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>{surface.eyebrow}</Text>
          <Text style={styles.headline}>{surface.headline}</Text>
          <Text style={styles.deck}>{surface.deck}</Text>
        </View>

        <GarmentTile detail={surface.section.toUpperCase()} kind={surface.kind} label={surface.headline} register="Magazine" />

        <View style={styles.copyBlock}>
          <Text style={styles.body}>{surface.body}</Text>
          {hasBase ? (
            <View style={styles.matchBlock}>
              <Text style={styles.matchText}>you have the base.</Text>
              <Link href="/looks" asChild>
                <Pressable accessibilityRole="button" style={({ pressed }) => [styles.matchAction, pressed && styles.pressed]}>
                  <Text style={styles.matchActionLabel}>build from yours →</Text>
                </Pressable>
              </Link>
            </View>
          ) : (
            <Text style={styles.bodyMuted}>start with the foundation. the line will meet you there.</Text>
          )}
        </View>
      </ScrollView>
      <BottomNavigation active="discover" register="Magazine" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.void,
  },
  stage: {
    gap: spacing[5],
    paddingHorizontal: spacing[5],
    paddingTop: spacing[6],
    paddingBottom: spacing[7],
  },
  backAction: {
    minHeight: sizing.tapTarget,
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  backLabel: {
    color: colors.paper,
    fontFamily: type.families.body,
    fontSize: type.bodyMd.size,
    fontWeight: type.bodyMd.weight,
    lineHeight: type.bodyMd.lineHeight,
  },
  hero: {
    minHeight: sizing.magazineCoverHeight,
    justifyContent: 'center',
    gap: spacing[4],
  },
  eyebrow: {
    color: colors.smoke[300],
    fontFamily: type.families.body,
    fontSize: type.micro.size,
    fontWeight: type.micro.weight,
    letterSpacing: type.micro.letterSpacing,
    lineHeight: type.micro.lineHeight,
  },
  headline: {
    color: colors.paper,
    fontFamily: type.families.displayMagazine,
    fontSize: type.displayLg.size,
    fontWeight: type.displayLg.weight,
    lineHeight: type.displayLg.lineHeight,
  },
  deck: {
    color: colors.paper,
    fontFamily: type.families.displayMagazine,
    fontSize: type.displayMd.size,
    fontStyle: 'italic',
    fontWeight: type.displayMd.weight,
    lineHeight: type.displayMd.lineHeight,
  },
  copyBlock: {
    gap: spacing[4],
    borderColor: colors.smoke[500],
    borderTopWidth: sizing.hairline,
    paddingTop: spacing[4],
  },
  body: {
    color: colors.paper,
    fontFamily: type.families.body,
    fontSize: type.bodyLg.size,
    fontWeight: type.bodyLg.weight,
    lineHeight: type.bodyLg.lineHeight,
  },
  bodyMuted: {
    color: colors.smoke[300],
    fontFamily: type.families.displayMagazine,
    fontSize: type.bodyLg.size,
    fontStyle: 'italic',
    fontWeight: type.bodyLg.weight,
    lineHeight: type.bodyLg.lineHeight,
  },
  matchBlock: {
    gap: spacing[2],
    borderColor: colors.smoke[500],
    borderWidth: sizing.hairline,
    borderRadius: radius.xs,
    padding: spacing[3],
  },
  matchText: {
    color: colors.paper,
    fontFamily: type.families.displayMagazine,
    fontSize: type.bodyLg.size,
    fontStyle: 'italic',
    fontWeight: type.bodyLg.weight,
    lineHeight: type.bodyLg.lineHeight,
  },
  matchAction: {
    minHeight: sizing.tapTarget,
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  matchActionLabel: {
    color: colors.paper,
    fontFamily: type.families.body,
    fontSize: type.bodyMd.size,
    fontWeight: type.headlineMd.weight,
    lineHeight: type.bodyMd.lineHeight,
  },
  pressed: {
    opacity: 0.64,
  },
});
