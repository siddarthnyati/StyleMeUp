/**
 * @register Sanctuary
 * @design-ref DESIGN.md §1.5, §10 (Onboarding), §12
 */
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GarmentKind, GarmentTile } from '@/components/GarmentTile/GarmentTile';
import { colors, radius, sizing, spacing, type } from '@/tokens';

const starterItems: {
  kind: GarmentKind;
  label: string;
}[] = [
  { kind: 'tee', label: 'white tee' },
  { kind: 'tee', label: 'black tee' },
  { kind: 'oxford', label: 'blue oxford' },
  { kind: 'denim', label: 'indigo denim' },
  { kind: 'denim', label: 'black denim' },
  { kind: 'sneaker', label: 'white sneaker' },
];

export function StarterPack() {
  const [selectedItems, setSelectedItems] = useState<ReadonlySet<string>>(() => new Set(['white tee', 'indigo denim']));

  function toggleItem(item: string) {
    setSelectedItems((current) => {
      const next = new Set(current);

      if (next.has(item)) {
        next.delete(item);
      } else {
        next.add(item);
      }

      return next;
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.stage}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>STARTING POINT</Text>
          <Text style={styles.headline}>you probably own these.</Text>
          <Text style={styles.subcaption}>tap what you have.</Text>
        </View>

        <View style={styles.grid}>
          {starterItems.map((item) => {
            const isSelected = selectedItems.has(item.label);

            return (
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
                key={item.label}
                onPress={() => toggleItem(item.label)}
                style={({ pressed }) => [
                  styles.tile,
                  isSelected && styles.tileSelected,
                  pressed && styles.tilePressed,
                ]}
              >
                <GarmentTile kind={item.kind} label={item.label} register="Sanctuary" />
                {isSelected ? (
                  <View style={styles.confirmationDot}>
                    <Text style={styles.checkmark}>✓</Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/onboarding/persona-pick')}
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
        >
          <Text style={styles.ctaLabel}>continue →</Text>
        </Pressable>
      </View>
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
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'center',
    gap: spacing[3],
    paddingVertical: spacing[6],
  },
  tile: {
    width: '48%',
    minHeight: sizing.garmentTileHeight,
    borderRadius: radius.xs,
  },
  tileSelected: {
    borderColor: colors.ink,
    borderWidth: 0.5,
    backgroundColor: colors.paper,
  },
  tilePressed: {
    opacity: 0.82,
  },
  confirmationDot: {
    position: 'absolute',
    top: spacing[3],
    right: spacing[3],
    width: sizing.starterConfirmationDot,
    height: sizing.starterConfirmationDot,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.signal,
  },
  checkmark: {
    color: colors.paper,
    fontSize: sizing.starterCheckmark.size,
    fontWeight: type.micro.weight,
    lineHeight: sizing.starterCheckmark.lineHeight,
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
