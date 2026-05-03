/**
 * @register Magazine
 * @design-ref DESIGN.md §1.5, §10 (Onboarding), §12
 */
import { StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, sizing, spacing, type } from '@/tokens';

export function Cover() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.stage}>
        <Text style={styles.title}>this week.</Text>
        <Link accessibilityRole="button" href="/onboarding/starter-pack" style={[styles.cta, styles.ctaLabel]}>
          Begin.
        </Link>
      </View>
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[6],
  },
  title: {
    color: colors.paper,
    fontFamily: type.families.displayMagazine,
    fontSize: type.displayXl.size,
    fontStyle: 'italic',
    fontWeight: type.displayXl.weight,
    lineHeight: type.displayXl.lineHeight,
    textAlign: 'center',
  },
  cta: {
    position: 'absolute',
    right: spacing[5],
    bottom: spacing[6],
    minHeight: sizing.tapTarget,
    minWidth: 96,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.paper,
    paddingHorizontal: spacing[5],
  },
  ctaLabel: {
    color: colors.void,
    fontFamily: type.families.body,
    fontSize: type.label.size,
    fontWeight: type.label.weight,
    letterSpacing: type.micro.letterSpacing,
    lineHeight: type.label.lineHeight,
  },
});
