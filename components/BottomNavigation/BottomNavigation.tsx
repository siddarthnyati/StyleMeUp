import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { colors, radius, sizing, spacing, type } from '@/tokens';
import { useFirstWeekStore } from '@/lib/firstWeek';
import { isNewMagazineIssue, useLatestMagazineIssue } from '@/lib/magazineFeed';

type Destination = 'discover' | 'closet' | 'capture' | 'looks';

type BottomNavigationProps = {
  active: Destination;
  register: 'Magazine' | 'Sanctuary';
};

const destinations: {
  key: Destination;
  label: string;
  path: '/discover' | '/closet' | '/capture' | '/looks';
}[] = [
  { key: 'discover', label: 'Discover', path: '/discover' },
  { key: 'closet', label: 'Closet', path: '/closet' },
  { key: 'capture', label: 'Capture', path: '/capture' },
  { key: 'looks', label: 'Looks', path: '/looks' },
];

export function BottomNavigation({ active, register }: BottomNavigationProps) {
  const isMagazine = register === 'Magazine';
  const latestIssueQuery = useLatestMagazineIssue();
  const seenMagazineIssueSlug = useFirstWeekStore((state) => state.seenMagazineIssueSlug);
  const showDiscoverBadge = isNewMagazineIssue(latestIssueQuery.data, seenMagazineIssueSlug);

  return (
    <View style={[styles.bar, isMagazine && styles.barMagazine]}>
      {destinations.map((destination) => {
        const isActive = active === destination.key;

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              destination.key === 'discover' && showDiscoverBadge ? 'Discover, new Magazine issue live' : destination.label
            }
            accessibilityState={{ selected: isActive }}
            key={destination.key}
            onPress={() => router.push(destination.path)}
            style={({ pressed }) => [
              styles.item,
              destination.key === 'capture' && styles.captureItem,
              pressed && styles.itemPressed,
            ]}
          >
            <View style={styles.markerWrap}>
              <View
                style={[
                  styles.markerPill,
                  isMagazine && styles.markerPillMagazine,
                  destination.key === 'capture' && styles.captureMarker,
                  isActive && styles.markerPillActive,
                  isMagazine && isActive && styles.markerPillActiveMagazine,
                ]}
              />
              {destination.key === 'discover' && showDiscoverBadge && !isActive ? <View style={styles.badgeDot} /> : null}
            </View>
            <Text
              style={[
                styles.label,
                isMagazine && styles.labelMagazine,
                isActive ? styles.labelActive : styles.labelInactive,
              ]}
            >
              {destination.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    minHeight: sizing.bottomNavigationHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderColor: colors.smoke[200],
    borderTopWidth: sizing.hairline,
    backgroundColor: colors.paper,
    paddingHorizontal: spacing[3],
  },
  barMagazine: {
    borderColor: colors.smoke[500],
    backgroundColor: colors.void,
  },
  item: {
    flex: 1,
    minHeight: sizing.tapTarget,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
  },
  captureItem: {
    transform: [{ translateY: -spacing[2] }],
  },
  itemPressed: {
    opacity: 0.64,
  },
  markerWrap: {
    position: 'relative',
  },
  markerPill: {
    width: 18,
    height: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.smoke[300],
  },
  markerPillMagazine: {
    backgroundColor: colors.smoke[500],
  },
  markerPillActive: {
    backgroundColor: colors.ink,
  },
  markerPillActiveMagazine: {
    backgroundColor: colors.paper,
  },
  captureMarker: {
    width: 12,
    height: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.power,
  },
  badgeDot: {
    position: 'absolute',
    top: -7,
    right: -9,
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.power,
  },
  label: {
    color: colors.ink,
    fontFamily: type.families.body,
    fontSize: type.micro.size,
    fontWeight: type.micro.weight,
    letterSpacing: type.micro.letterSpacing,
    lineHeight: type.micro.lineHeight,
  },
  labelMagazine: {
    color: colors.paper,
  },
  labelActive: {
    opacity: 1,
  },
  labelInactive: {
    opacity: 0.58,
  },
});
