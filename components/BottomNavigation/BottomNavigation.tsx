import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { colors, sizing, spacing, type } from '@/tokens';

type Destination = 'discover' | 'closet' | 'capture' | 'looks';

type BottomNavigationProps = {
  active: Destination;
  register: 'Magazine' | 'Sanctuary';
};

const destinations: {
  key: Destination;
  label: string;
  marker: string;
  path: '/discover' | '/closet' | '/capture' | '/looks';
}[] = [
  { key: 'discover', label: 'Discover', marker: 'D', path: '/discover' },
  { key: 'closet', label: 'Closet', marker: 'C', path: '/closet' },
  { key: 'capture', label: 'Capture', marker: '●', path: '/capture' },
  { key: 'looks', label: 'Looks', marker: 'L', path: '/looks' },
];

export function BottomNavigation({ active, register }: BottomNavigationProps) {
  const isMagazine = register === 'Magazine';

  return (
    <View style={[styles.bar, isMagazine && styles.barMagazine]}>
      {destinations.map((destination) => {
        const isActive = active === destination.key;

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            key={destination.key}
            onPress={() => router.push(destination.path)}
            style={({ pressed }) => [
              styles.item,
              destination.key === 'capture' && styles.captureItem,
              pressed && styles.itemPressed,
            ]}
          >
            <Text
              style={[
                styles.marker,
                isMagazine && styles.markerMagazine,
                destination.key === 'capture' && styles.captureMarker,
                isActive && styles.markerActive,
                isMagazine && isActive && styles.markerActiveMagazine,
              ]}
            >
              {destination.marker}
            </Text>
            <Text style={[styles.label, isMagazine && styles.labelMagazine, !isActive && styles.labelInactive]}>
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
    minWidth: sizing.tapTarget,
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
  marker: {
    color: colors.smoke[400],
    fontFamily: type.families.body,
    fontSize: type.label.size,
    fontWeight: type.label.weight,
    lineHeight: type.label.lineHeight,
  },
  markerMagazine: {
    color: colors.smoke[300],
  },
  markerActive: {
    color: colors.ink,
  },
  markerActiveMagazine: {
    color: colors.paper,
  },
  captureMarker: {
    color: colors.power,
    fontSize: type.headlineMd.size,
    lineHeight: type.headlineMd.lineHeight,
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
  labelInactive: {
    opacity: 0,
  },
});
