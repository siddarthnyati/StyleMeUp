/**
 * @register Sanctuary
 * @design-ref DESIGN.md §1.5, §10 (Looks), §12
 */
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, sizing, spacing, type } from '@/tokens';
import { BottomNavigation } from '@/components/BottomNavigation/BottomNavigation';
import { GarmentTile } from '@/components/GarmentTile/GarmentTile';
import { signatureByPersona, useFirstWeekStore } from '@/lib/firstWeek';

const fallbackLooks = Object.values(signatureByPersona).map((look) => ({
  ...look,
  savedAt: '',
}));

export function Looks() {
  const savedLooks = useFirstWeekStore((state) => state.savedLooks);
  const looks = savedLooks.length > 0 ? savedLooks : fallbackLooks;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.stage}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>looks</Text>
          <Text style={styles.headline}>first signatures.</Text>
          <Text style={styles.subcaption}>studies from the pieces you marked.</Text>
        </View>

        <View style={styles.threeWays}>
          <Text style={styles.threeWaysTitle}>one look, three ways.</Text>
          <Text style={styles.threeWaysMeta}>white tee as the anchor.</Text>
          <View style={styles.waysRows}>
            {Object.values(signatureByPersona).map((look) => (
              <View key={look.id} style={styles.wayRow}>
                <Text style={styles.wayLabel}>{look.persona}</Text>
                <Text style={styles.wayCopy}>{look.caption}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.looksStack}>
          {looks.map((look) => (
            <Link href="/onboarding/first-signature" key={look.title} asChild>
              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [styles.lookCard, pressed && styles.lookCardPressed]}
              >
                <View style={styles.lookHeader}>
                  <Text style={styles.lookTitle}>{look.title}</Text>
                  <Text style={styles.lookMeta}>{look.note}</Text>
                </View>

                <View style={styles.piecesRow}>
                  {look.pieces.map((piece) => (
                    <GarmentTile
                      detail={piece.detail}
                      key={`${look.title}-${piece.label}`}
                      kind={piece.kind}
                      label={piece.label}
                      register="Sanctuary"
                    />
                  ))}
                </View>
              </Pressable>
            </Link>
          ))}
        </View>

        <Link href="/onboarding/first-signature" asChild>
          <Pressable accessibilityRole="button" style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}>
            <Text style={styles.ctaLabel}>open the first.</Text>
          </Pressable>
        </Link>
      </ScrollView>
      <BottomNavigation active="looks" register="Sanctuary" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  stage: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[7],
    paddingBottom: spacing[7],
    gap: spacing[5],
  },
  header: {
    gap: spacing[2],
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
    color: colors.ink,
    fontFamily: type.families.displayMagazine,
    fontSize: type.displayMd.size,
    fontStyle: 'italic',
    fontWeight: type.displayMd.weight,
    lineHeight: type.displayMd.lineHeight,
  },
  subcaption: {
    color: colors.smoke[300],
    fontFamily: type.families.body,
    fontSize: type.bodyMd.size,
    fontWeight: type.bodyMd.weight,
    lineHeight: type.bodyMd.lineHeight,
  },
  looksStack: {
    gap: spacing[3],
  },
  threeWays: {
    gap: spacing[3],
    borderColor: colors.ink,
    borderRadius: radius.xs,
    borderWidth: sizing.hairline,
    backgroundColor: colors.paper,
    padding: spacing[4],
  },
  threeWaysTitle: {
    color: colors.ink,
    fontFamily: type.families.displayMagazine,
    fontSize: type.headlineLg.size,
    fontStyle: 'italic',
    fontWeight: type.displayMd.weight,
    lineHeight: type.headlineLg.lineHeight,
  },
  threeWaysMeta: {
    color: colors.smoke[300],
    fontFamily: type.families.body,
    fontSize: type.bodyMd.size,
    fontWeight: type.bodyMd.weight,
    lineHeight: type.bodyMd.lineHeight,
  },
  waysRows: {
    gap: spacing[2],
  },
  wayRow: {
    gap: spacing[1],
    borderColor: colors.smoke[200],
    borderTopWidth: sizing.hairline,
    paddingTop: spacing[2],
  },
  wayLabel: {
    color: colors.ink,
    fontFamily: type.families.body,
    fontSize: type.micro.size,
    fontWeight: type.micro.weight,
    letterSpacing: type.micro.letterSpacing,
    lineHeight: type.micro.lineHeight,
  },
  wayCopy: {
    color: colors.smoke[300],
    fontFamily: type.families.body,
    fontSize: type.bodyMd.size,
    fontWeight: type.bodyMd.weight,
    lineHeight: type.bodyMd.lineHeight,
  },
  lookCard: {
    minHeight: sizing.lookCardHeight,
    gap: spacing[4],
    justifyContent: 'space-between',
    borderColor: colors.smoke[200],
    borderRadius: radius.none,
    borderWidth: sizing.hairline,
    backgroundColor: colors.bone,
    padding: spacing[4],
  },
  lookCardPressed: {
    opacity: 0.64,
  },
  lookHeader: {
    gap: spacing[1],
  },
  lookTitle: {
    color: colors.ink,
    fontFamily: type.families.displayMagazine,
    fontSize: type.headlineLg.size,
    fontStyle: 'italic',
    fontWeight: type.displayMd.weight,
    lineHeight: type.headlineLg.lineHeight,
  },
  lookMeta: {
    color: colors.smoke[300],
    fontFamily: type.families.body,
    fontSize: type.bodyMd.size,
    fontWeight: type.bodyMd.weight,
    lineHeight: type.bodyMd.lineHeight,
  },
  piecesRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  cta: {
    minHeight: sizing.tapTarget,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    borderColor: colors.ink,
    borderRadius: radius.sm,
    borderWidth: sizing.hairline,
    paddingHorizontal: spacing[5],
  },
  ctaPressed: {
    opacity: 0.64,
  },
  ctaLabel: {
    color: colors.ink,
    fontFamily: type.families.body,
    fontSize: type.label.size,
    fontWeight: type.label.weight,
    letterSpacing: type.micro.letterSpacing,
    lineHeight: type.label.lineHeight,
  },
});
