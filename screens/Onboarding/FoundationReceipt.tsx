/**
 * @register Sanctuary
 * @design-ref DESIGN.md §1.5, §10 (Onboarding), §12
 */
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, useLocalSearchParams, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, sizing, spacing, type } from '@/tokens';
import {
  FOUNDATION_MINIMUM_TOTAL,
  getStarterCategoryCounts,
  getStarterSelectionFromSearch,
} from '@/components/StarterPack/StarterPackExplorer';
import { useFirstWeekStore } from '@/lib/firstWeek';

export function FoundationReceipt() {
  const markFoundationReceiptSeen = useFirstWeekStore((state) => state.markFoundationReceiptSeen);
  const setStarterSelections = useFirstWeekStore((state) => state.setStarterSelections);
  const starterSelections = useFirstWeekStore((state) => state.starterSelections);
  const searchParams = useLocalSearchParams<{ selected?: string }>();
  const selectedFromSearch = getStarterSelectionFromSearch(searchParams.selected);
  const receiptSelections = selectedFromSearch ?? starterSelections;
  const categoryCounts = getStarterCategoryCounts(receiptSelections).filter((category) => category.count > 0);
  const totalMarked = categoryCounts.reduce((total, category) => total + category.count, 0);
  const personaHref = `/onboarding/persona-pick?selected=${encodeURIComponent(receiptSelections.join(','))}`;

  useEffect(() => {
    if (selectedFromSearch) {
      setStarterSelections(selectedFromSearch);
    }
  }, [selectedFromSearch, setStarterSelections]);

  function handleContinue() {
    if (selectedFromSearch) {
      setStarterSelections(selectedFromSearch);
    }

    markFoundationReceiptSeen();
  }

  if (totalMarked < FOUNDATION_MINIMUM_TOTAL) {
    const remaining = FOUNDATION_MINIMUM_TOTAL - totalMarked;

    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.stage} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.eyebrow}>foundation</Text>
            <Text style={styles.headline}>not quite yet.</Text>
            <Text style={styles.subcaption}>the first signature needs more of what you own.</Text>
          </View>

          <View style={styles.receipt} accessible accessibilityLabel={`${remaining} more pieces before the receipt`}>
            <View style={styles.receiptHeader}>
              <Text style={styles.receiptTitle}>{remaining} more.</Text>
              <Text style={styles.receiptMeta}>the foundation needs a little more weight.</Text>
            </View>
          </View>

          <Link
            href={`/onboarding/starter-pack?selected=${encodeURIComponent(receiptSelections.join(','))}&needed=foundation`}
            asChild
          >
            <Pressable accessibilityRole="button" style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}>
              <Text style={styles.ctaLabel}>return to foundation →</Text>
            </Pressable>
          </Link>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.stage} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>foundation</Text>
          <Text style={styles.headline}>your foundation.</Text>
          <Text style={styles.subcaption}>cotton, denim, leather. enough to begin.</Text>
        </View>

        <View style={styles.receipt} accessible accessibilityLabel={`${totalMarked} pieces marked across your foundation`}>
          <View style={styles.receiptHeader}>
            <Text style={styles.receiptTitle}>{totalMarked} marked.</Text>
            <Text style={styles.receiptMeta}>the first line.</Text>
          </View>

          <View style={styles.rows}>
            {categoryCounts.map((category) => (
              <View
                accessibilityLabel={`${category.label}, ${category.count} marked`}
                accessible
                key={category.key}
                style={styles.row}
              >
                <Text style={styles.rowLabel}>{category.label}</Text>
                <Text style={styles.rowCount}>{category.count}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.note}>
          <Text style={styles.noteText}>the app begins with what is already yours.</Text>
        </View>

        <Link href={personaHref as Href} onPress={handleContinue} asChild>
          <Pressable accessibilityRole="button" style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}>
            <Text style={styles.ctaLabel}>show the first →</Text>
          </Pressable>
        </Link>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  stage: {
    flexGrow: 1,
    gap: spacing[5],
    paddingHorizontal: spacing[5],
    paddingTop: spacing[7],
    paddingBottom: spacing[6],
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
  receipt: {
    gap: spacing[5],
    borderColor: colors.ink,
    borderRadius: radius.xs,
    borderWidth: sizing.hairline,
    backgroundColor: colors.paper,
    padding: spacing[4],
  },
  receiptHeader: {
    gap: spacing[1],
  },
  receiptTitle: {
    color: colors.ink,
    fontFamily: type.families.displayMagazine,
    fontSize: type.headlineLg.size,
    fontStyle: 'italic',
    fontWeight: type.displayMd.weight,
    lineHeight: type.headlineLg.lineHeight,
  },
  receiptMeta: {
    color: colors.smoke[300],
    fontFamily: type.families.body,
    fontSize: type.micro.size,
    fontWeight: type.micro.weight,
    letterSpacing: type.micro.letterSpacing,
    lineHeight: type.micro.lineHeight,
  },
  rows: {
    gap: spacing[2],
  },
  row: {
    minHeight: sizing.tapTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: colors.smoke[200],
    borderTopWidth: sizing.hairline,
  },
  rowLabel: {
    color: colors.ink,
    fontFamily: type.families.body,
    fontSize: type.bodyMd.size,
    fontWeight: type.headlineMd.weight,
    lineHeight: type.bodyMd.lineHeight,
  },
  rowCount: {
    color: colors.ink,
    fontFamily: type.families.mono,
    fontSize: type.bodyMd.size,
    fontWeight: type.bodyMd.weight,
    lineHeight: type.bodyMd.lineHeight,
  },
  note: {
    flex: 1,
    justifyContent: 'center',
  },
  noteText: {
    color: colors.smoke[300],
    fontFamily: type.families.displayMagazine,
    fontSize: type.headlineLg.size,
    fontStyle: 'italic',
    fontWeight: type.displayMd.weight,
    lineHeight: type.headlineLg.lineHeight,
  },
  cta: {
    minHeight: sizing.tapTarget,
    alignSelf: 'flex-end',
    justifyContent: 'center',
  },
  ctaPressed: {
    opacity: 0.64,
  },
  ctaLabel: {
    color: colors.ink,
    fontFamily: type.families.body,
    fontSize: type.bodyMd.size,
    fontWeight: type.headlineMd.weight,
    lineHeight: type.bodyMd.lineHeight,
  },
});
