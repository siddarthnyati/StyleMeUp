/**
 * @register Magazine
 * @design-ref DESIGN.md §1.5, §10 (Discover), §12
 */
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, sizing, spacing, type } from '@/tokens';
import { BottomNavigation } from '@/components/BottomNavigation/BottomNavigation';
import { GarmentTile, type GarmentKind } from '@/components/GarmentTile/GarmentTile';
import { useFirstWeekStore } from '@/lib/firstWeek';

const trendCards: {
  baseSelectionIds: string[];
  body: string;
  eyebrow: string;
  headline: string;
  kind: GarmentKind;
}[] = [
  {
    eyebrow: 'FOR THURSDAY',
    headline: 'the wide wale.',
    body: 'eight threads to the inch. coat-weight.',
    kind: 'trouser',
    baseSelectionIds: ['jean-rinsed', 'jean-washed', 'jean-cord', 'jean-raw'],
  },
  {
    eyebrow: 'FOR THE OFFICE THAT IS NOT AN OFFICE',
    headline: 'the chore cut.',
    body: 'three pockets. one rule: keep it heavy.',
    kind: 'jacket',
    baseSelectionIds: ['tee-optic', 'tee-bone', 'jean-rinsed'],
  },
  {
    eyebrow: 'FOR LATE LIGHT',
    headline: 'the long skirt.',
    body: 'dust-rose. ankle. nothing else needed.',
    kind: 'skirt',
    baseSelectionIds: ['tee-black', 'tee-burgundy', 'shoe-black-loafer'],
  },
  {
    eyebrow: 'FINISH THE LOOK',
    headline: 'the cap.',
    body: 'charcoal, fine-wale, brass at the back.',
    kind: 'cap',
    baseSelectionIds: ['tee-heather', 'tee-charcoal', 'accessory-black-cap'],
  },
];

export function Discover() {
  const capturedPieces = useFirstWeekStore((state) => state.capturedPieces);
  const starterSelections = useFirstWeekStore((state) => state.starterSelections);
  const selectedIdSet = new Set(starterSelections);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.cover}>
          <Text style={styles.eyebrow}>VOL. 18 · THE RETURN</Text>
          <Text style={styles.monumental}>LAST SEEN: 2013. RETURNING.</Text>
          <Text style={styles.dek}>the eight-line wale,{'\n'}recut for a heavier hand.</Text>
        </View>

        <View style={styles.feed}>
          {trendCards.map((card) => {
            const hasBase =
              card.baseSelectionIds.some((selectionId) => selectedIdSet.has(selectionId)) ||
              capturedPieces.some((piece) => card.body.includes(piece.label.split(' ')[0]));

            return (
              <View key={card.headline} style={styles.card}>
                <GarmentTile detail={card.eyebrow} kind={card.kind} label={card.headline} register="Magazine" />
                <Text style={styles.cardBody}>{card.body}</Text>
                {hasBase ? (
                  <View style={styles.matchBlock}>
                    <Text style={styles.matchText}>you have the base.</Text>
                    <Link href="/looks" asChild>
                      <Pressable
                        accessibilityRole="button"
                        style={({ pressed }) => [styles.matchAction, pressed && styles.matchActionPressed]}
                      >
                        <Text style={styles.matchActionLabel}>build from yours →</Text>
                      </Pressable>
                    </Link>
                  </View>
                ) : null}
              </View>
            );
          })}
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
  content: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[8],
    paddingBottom: spacing[7],
    gap: spacing[7],
  },
  cover: {
    minHeight: sizing.magazineCoverHeight,
    justifyContent: 'center',
    gap: spacing[5],
  },
  eyebrow: {
    color: colors.smoke[300],
    fontFamily: type.families.body,
    fontSize: type.micro.size,
    fontWeight: type.micro.weight,
    letterSpacing: type.micro.letterSpacing,
    lineHeight: type.micro.lineHeight,
  },
  monumental: {
    color: colors.paper,
    fontFamily: type.families.displayMagazine,
    fontSize: type.displayLg.size,
    fontWeight: type.displayLg.weight,
    lineHeight: type.displayLg.lineHeight,
  },
  dek: {
    color: colors.paper,
    fontFamily: type.families.displayMagazine,
    fontSize: type.displayMd.size,
    fontStyle: 'italic',
    fontWeight: type.displayMd.weight,
    lineHeight: type.displayMd.lineHeight,
  },
  feed: {
    gap: spacing[4],
  },
  card: {
    gap: spacing[3],
  },
  cardBody: {
    color: colors.smoke[300],
    fontFamily: type.families.body,
    fontSize: type.bodyMd.size,
    fontWeight: type.bodyMd.weight,
    lineHeight: type.bodyMd.lineHeight,
  },
  matchBlock: {
    gap: spacing[1],
    borderColor: colors.smoke[500],
    borderTopWidth: sizing.hairline,
    paddingTop: spacing[3],
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
  matchActionPressed: {
    opacity: 0.64,
  },
});
