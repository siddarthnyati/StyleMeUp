/**
 * @register Magazine
 * @design-ref DESIGN.md §1.5, §10 (Onboarding), §12
 */
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavigation } from '@/components/BottomNavigation/BottomNavigation';
import { OutfitComposition } from '@/components/OutfitComposition/OutfitComposition';
import { colors, spacing, type } from '@/tokens';

export function FirstSignature() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.stage}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>YOUR FIRST SIGNATURE</Text>
          <Text style={styles.headline}>thursday.</Text>
        </View>

        <OutfitComposition />

        <View style={styles.captionBlock}>
          <Text style={styles.caption}>camel jacket · oxford · indigo denim</Text>
          <Text style={styles.subcaption}>
            — <Text style={styles.momentText}>your moment.</Text>
          </Text>
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
});
