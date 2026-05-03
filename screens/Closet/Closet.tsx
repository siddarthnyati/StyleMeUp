/**
 * @register Sanctuary
 * @design-ref DESIGN.md §1.5, §10 (Closet), §12
 */
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BasicsBlock3D } from '@/components/BasicsBlock3D/BasicsBlock3D';
import { BottomNavigation } from '@/components/BottomNavigation/BottomNavigation';
import { colors, spacing, type } from '@/tokens';

export function Closet() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.stage}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>closet</Text>
          <Text style={styles.headline}>your closet.</Text>
          <Text style={styles.subcaption}>cotton, denim, leather. the first foundation.</Text>
        </View>

        <BasicsBlock3D />
      </ScrollView>
      <BottomNavigation active="closet" register="Sanctuary" />
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
});
