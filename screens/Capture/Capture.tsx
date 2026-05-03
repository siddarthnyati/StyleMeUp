/**
 * @register Sanctuary
 * @design-ref DESIGN.md §1.5, §10 (Capture), §12
 */
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavigation } from '@/components/BottomNavigation/BottomNavigation';
import { colors, radius, sizing, spacing, type } from '@/tokens';

export function Capture() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.stage}>
        <View style={styles.topBar}>
          <Text style={styles.cancel}>← cancel</Text>
          <Text style={styles.eyebrow}>FRAME THE PIECE</Text>
          <View style={styles.topSpacer} />
        </View>

        <View style={styles.viewfinder}>
          <Text style={styles.viewfinderText}>camera surface</Text>
        </View>

        <View style={styles.shutterWrap}>
          <View style={styles.shutter} />
        </View>
      </View>
      <BottomNavigation active="capture" register="Sanctuary" />
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
    backgroundColor: colors.ink,
  },
  topBar: {
    minHeight: sizing.tapTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[5],
  },
  cancel: {
    color: colors.paper,
    fontFamily: type.families.body,
    fontSize: type.bodyMd.size,
    fontWeight: type.bodyMd.weight,
    lineHeight: type.bodyMd.lineHeight,
    opacity: 0.7,
  },
  eyebrow: {
    color: colors.paper,
    fontFamily: type.families.body,
    fontSize: type.micro.size,
    fontWeight: type.micro.weight,
    letterSpacing: type.micro.letterSpacing,
    lineHeight: type.micro.lineHeight,
    opacity: 0.85,
  },
  topSpacer: {
    width: sizing.tapTarget,
  },
  viewfinder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.smoke[500],
    borderTopWidth: sizing.hairline,
    borderBottomWidth: sizing.hairline,
  },
  viewfinderText: {
    color: colors.smoke[300],
    fontFamily: type.families.displayMagazine,
    fontSize: type.bodyLg.size,
    fontStyle: 'italic',
    fontWeight: type.bodyLg.weight,
    lineHeight: type.bodyLg.lineHeight,
  },
  shutterWrap: {
    minHeight: sizing.captureControlHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutter: {
    width: sizing.captureShutter,
    height: sizing.captureShutter,
    borderColor: colors.paper,
    borderRadius: radius.pill,
    borderWidth: sizing.captureShutterRing,
    backgroundColor: colors.power,
  },
});
