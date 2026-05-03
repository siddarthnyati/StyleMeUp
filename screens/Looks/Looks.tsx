/**
 * @register Sanctuary
 * @design-ref DESIGN.md §1.5, §10 (Looks), §12
 */
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavigation } from '@/components/BottomNavigation/BottomNavigation';
import { GarmentKind, GarmentTile } from '@/components/GarmentTile/GarmentTile';
import { colors, radius, sizing, spacing, type } from '@/tokens';

const savedLooks: {
  title: string;
  note: string;
  pieces: {
    kind: GarmentKind;
    label: string;
  }[];
}[] = [
  {
    title: 'thursday.',
    note: 'camel jacket, oxford, indigo denim.',
    pieces: [
      { kind: 'jacket', label: 'camel jacket' },
      { kind: 'oxford', label: 'blue oxford' },
      { kind: 'denim', label: 'indigo denim' },
    ],
  },
  {
    title: 'friday.',
    note: 'black tee, corduroy trouser, white sneaker.',
    pieces: [
      { kind: 'tee', label: 'black tee' },
      { kind: 'trouser', label: 'corduroy trouser' },
      { kind: 'sneaker', label: 'white sneaker' },
    ],
  },
  {
    title: 'weekend.',
    note: 'white tee, long skirt, charcoal cap.',
    pieces: [
      { kind: 'tee', label: 'white tee' },
      { kind: 'skirt', label: 'long skirt' },
      { kind: 'cap', label: 'charcoal cap' },
    ],
  },
];

export function Looks() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.stage}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>looks</Text>
          <Text style={styles.headline}>first signatures.</Text>
          <Text style={styles.subcaption}>three studies from the pieces you marked.</Text>
        </View>

        <View style={styles.looksStack}>
          {savedLooks.map((look) => (
            <Pressable
              accessibilityRole="button"
              key={look.title}
              onPress={() => router.push('/onboarding/first-signature')}
              style={({ pressed }) => [styles.lookCard, pressed && styles.lookCardPressed]}
            >
              <View style={styles.lookHeader}>
                <Text style={styles.lookTitle}>{look.title}</Text>
                <Text style={styles.lookMeta}>{look.note}</Text>
              </View>

              <View style={styles.piecesRow}>
                {look.pieces.map((piece) => (
                  <GarmentTile key={`${look.title}-${piece.label}`} kind={piece.kind} label={piece.label} register="Sanctuary" />
                ))}
              </View>
            </Pressable>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/onboarding/first-signature')}
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
        >
          <Text style={styles.ctaLabel}>open the first.</Text>
        </Pressable>
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
