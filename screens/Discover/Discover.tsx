/**
 * @register Magazine
 * @design-ref DESIGN.md §1.5, §10 (Discover), §12
 */
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavigation } from '@/components/BottomNavigation/BottomNavigation';
import { GarmentKind, GarmentTile } from '@/components/GarmentTile/GarmentTile';
import { colors, sizing, spacing, type } from '@/tokens';

const trendCards: {
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
  },
  {
    eyebrow: 'FOR THE OFFICE THAT IS NOT AN OFFICE',
    headline: 'the chore cut.',
    body: 'three pockets. one rule: keep it heavy.',
    kind: 'jacket',
  },
  {
    eyebrow: 'FOR LATE LIGHT',
    headline: 'the long skirt.',
    body: 'dust-rose. ankle. nothing else needed.',
    kind: 'skirt',
  },
  {
    eyebrow: 'FINISH THE LOOK',
    headline: 'the cap.',
    body: 'charcoal, fine-wale, brass at the back.',
    kind: 'cap',
  },
];

export function Discover() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.cover}>
          <Text style={styles.eyebrow}>VOL. 18 · THE RETURN</Text>
          <Text style={styles.monumental}>LAST SEEN: 2013. RETURNING.</Text>
          <Text style={styles.dek}>the eight-line wale,{'\n'}recut for a heavier hand.</Text>
        </View>

        <View style={styles.feed}>
          {trendCards.map((card) => (
            <View key={card.headline} style={styles.card}>
              <GarmentTile detail={card.eyebrow} kind={card.kind} label={card.headline} register="Magazine" />
              <Text style={styles.cardBody}>{card.body}</Text>
            </View>
          ))}
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
});
