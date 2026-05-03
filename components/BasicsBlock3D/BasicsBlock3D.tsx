import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { colors, motion, radius, sizing, spacing, type } from '@/tokens';
import { StarterGarmentImage, type StarterShape, type StarterVariant } from '@/components/StarterPack/StarterPackExplorer';

type BasicCategory = 'tees' | 'denim' | 'boots' | 'shoes';
type BasicTone =
  | 'white'
  | 'black'
  | 'bone'
  | 'heather'
  | 'charcoal'
  | 'navy'
  | 'rawIndigo'
  | 'indigo'
  | 'washedBlue'
  | 'ecru'
  | 'offBlack'
  | 'field'
  | 'brown'
  | 'silver';

type WardrobeBasic = {
  category: BasicCategory;
  detail: string;
  label: string;
  shape: StarterShape;
  tone: BasicTone;
};

const wardrobeBasics: WardrobeBasic[] = [
  { category: 'tees', label: 'white tee', detail: 'dense cotton. straight hem.', shape: 'tee', tone: 'white' },
  { category: 'tees', label: 'black tee', detail: 'flat black. close neck.', shape: 'tee', tone: 'black' },
  { category: 'tees', label: 'bone tee', detail: 'warmer cotton. dry hand.', shape: 'tee', tone: 'bone' },
  { category: 'tees', label: 'heather tee', detail: 'soft grey. quiet texture.', shape: 'tee', tone: 'heather' },
  { category: 'tees', label: 'navy tee', detail: 'near-black. clean sleeve.', shape: 'tee', tone: 'navy' },
  { category: 'tees', label: 'heavy tee', detail: 'boxier cut. no collapse.', shape: 'tee', tone: 'charcoal' },
  { category: 'denim', label: 'raw denim', detail: 'rigid. architectural leg.', shape: 'jeans', tone: 'rawIndigo' },
  { category: 'denim', label: 'indigo denim', detail: 'straight. worn dark.', shape: 'jeans', tone: 'indigo' },
  { category: 'denim', label: 'washed denim', detail: 'pale cast. easy break.', shape: 'jeans', tone: 'washedBlue' },
  { category: 'denim', label: 'black denim', detail: 'clean column. matte.', shape: 'jeans', tone: 'black' },
  { category: 'denim', label: 'ecru denim', detail: 'dry cotton. no distress.', shape: 'jeans', tone: 'ecru' },
  { category: 'boots', label: 'chelsea boot', detail: 'brushed leather. narrow shaft.', shape: 'boot', tone: 'black' },
  { category: 'boots', label: 'ankle boot', detail: 'stacked sole. polished toe.', shape: 'boot', tone: 'offBlack' },
  { category: 'boots', label: 'field boot', detail: 'heavy tread. quiet hardware.', shape: 'boot', tone: 'field' },
  { category: 'shoes', label: 'white court shoe', detail: 'low profile. leather panels.', shape: 'sneaker', tone: 'white' },
  { category: 'shoes', label: 'black loafer', detail: 'single line. no ornament.', shape: 'loafer', tone: 'black' },
  { category: 'shoes', label: 'suede runner', detail: 'panelled. muted sole.', shape: 'sneaker', tone: 'brown' },
  { category: 'shoes', label: 'silver trainer', detail: 'technical skin. light sole.', shape: 'sneaker', tone: 'silver' },
];

const categoryCounts: {
  category: BasicCategory;
  label: string;
}[] = [
  { category: 'tees', label: 'six tees' },
  { category: 'denim', label: 'five jeans' },
  { category: 'boots', label: 'three boots' },
  { category: 'shoes', label: 'four shoes' },
];

const easedTiming = {
  duration: motion.durations.page,
  easing: Easing.bezier(...motion.defaultEase),
};

function toStarterVariant(item: WardrobeBasic): StarterVariant {
  return {
    id: `${item.category}-${item.label}`,
    detail: item.detail,
    label: item.label,
    shape: item.shape,
    tone: item.tone,
  };
}

export function BasicsBlock3D() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = wardrobeBasics[activeIndex];
  const rotation = useSharedValue(0);
  const tilt = useSharedValue(0);

  const commitDrag = (translationX: number) => {
    if (Math.abs(translationX) < sizing.basicsDragThreshold) {
      return;
    }

    setActiveIndex((currentIndex) => {
      const direction = translationX < 0 ? 1 : -1;
      return (currentIndex + direction + wardrobeBasics.length) % wardrobeBasics.length;
    });
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      rotation.value = event.translationX / spacing[2];
      tilt.value = -event.translationY / spacing[3];
    })
    .onEnd((event) => {
      runOnJS(commitDrag)(event.translationX);
      rotation.value = withTiming(0, easedTiming);
      tilt.value = withTiming(0, easedTiming);
    });

  const animatedBlockStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: sizing.basicsBlockPerspective },
      { rotateY: `${rotation.value}deg` },
      { rotateX: `${tilt.value}deg` },
    ],
  }));

  return (
    <View style={styles.wrap}>
      <View style={styles.summaryRow}>
        {categoryCounts.map((item) => (
          <View key={item.category} style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>{item.label}</Text>
            <View style={styles.summaryLine} />
          </View>
        ))}
      </View>

      <GestureDetector gesture={panGesture}>
        <Animated.View
          accessible
          accessibilityLabel={`${active.label}. ${active.detail}`}
          style={[styles.block, animatedBlockStyle]}
        >
          <View style={styles.blockTop}>
            <View style={[styles.topSwatch, toneStyles[active.tone]]} />
            <Text style={styles.topLabel}>{active.category}</Text>
          </View>

          <View style={styles.blockFace}>
            <View style={styles.blockInner}>
              <View style={styles.heroImageFrame}>
                <StarterGarmentImage item={toStarterVariant(active)} size="closetHero" />
              </View>
              <View style={styles.itemCopy}>
                <Text style={styles.itemLabel}>{active.label}</Text>
                <Text style={styles.itemDetail}>{active.detail}</Text>
              </View>
            </View>
          </View>

          <View style={styles.blockSide}>
            <View style={styles.sideRule} />
            <View style={styles.sideRule} />
            <View style={styles.sideRule} />
          </View>
        </Animated.View>
      </GestureDetector>

      <ScrollView
        contentContainerStyle={styles.rail}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {wardrobeBasics.map((item, index) => {
          const isActive = index === activeIndex;

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              key={`${item.category}-${item.label}`}
              onPress={() => setActiveIndex(index)}
              style={[styles.railItem, isActive && styles.railItemActive]}
            >
              <View style={styles.railImageFrame}>
                <StarterGarmentImage item={toStarterVariant(item)} size="closetRail" />
              </View>
              <View style={styles.railCopy}>
                <Text style={styles.railLabel}>{item.label}</Text>
                <Text style={styles.railCategory}>{item.category}</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing[4],
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  summaryItem: {
    flex: 1,
    gap: spacing[1],
  },
  summaryLabel: {
    color: colors.smoke[300],
    fontFamily: type.families.body,
    fontSize: type.micro.size,
    fontWeight: type.micro.weight,
    letterSpacing: type.micro.letterSpacing,
    lineHeight: type.micro.lineHeight,
  },
  summaryLine: {
    height: sizing.hairline,
    backgroundColor: colors.smoke[200],
  },
  block: {
    minHeight: sizing.basicsBlockHeight,
    justifyContent: 'center',
  },
  blockTop: {
    minHeight: spacing[7],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    borderColor: colors.smoke[200],
    borderWidth: sizing.hairline,
    backgroundColor: colors.bone,
    paddingHorizontal: spacing[4],
  },
  topSwatch: {
    width: sizing.basicsSwatch,
    height: sizing.basicsSwatch,
    borderColor: colors.smoke[300],
    borderRadius: radius.none,
    borderWidth: sizing.hairline,
  },
  topLabel: {
    color: colors.smoke[300],
    fontFamily: type.families.body,
    fontSize: type.micro.size,
    fontWeight: type.micro.weight,
    letterSpacing: type.micro.letterSpacing,
    lineHeight: type.micro.lineHeight,
  },
  blockFace: {
    minHeight: sizing.basicsBlockFaceHeight,
    borderColor: colors.ink,
    borderWidth: sizing.hairline,
    backgroundColor: colors.paper,
    padding: spacing[4],
  },
  blockInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[5],
  },
  heroImageFrame: {
    width: sizing.basicsHeroImage,
    height: sizing.basicsHeroImage,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.smoke[300],
    borderRadius: radius.none,
    borderWidth: sizing.hairline,
  },
  itemCopy: {
    flex: 1,
    gap: spacing[2],
  },
  itemLabel: {
    color: colors.ink,
    fontFamily: type.families.displayMagazine,
    fontSize: type.displayMd.size,
    fontStyle: 'italic',
    fontWeight: type.displayMd.weight,
    lineHeight: type.displayMd.lineHeight,
  },
  itemDetail: {
    color: colors.smoke[300],
    fontFamily: type.families.body,
    fontSize: type.bodyMd.size,
    fontWeight: type.bodyMd.weight,
    lineHeight: type.bodyMd.lineHeight,
  },
  blockSide: {
    minHeight: spacing[6],
    justifyContent: 'space-between',
    borderColor: colors.smoke[300],
    borderWidth: sizing.hairline,
    backgroundColor: colors.bone,
    padding: spacing[2],
  },
  sideRule: {
    height: sizing.hairline,
    backgroundColor: colors.smoke[200],
  },
  rail: {
    gap: spacing[2],
    paddingRight: spacing[5],
  },
  railItem: {
    width: sizing.basicsRailItemWidth,
    minHeight: sizing.basicsRailItemHeight,
    justifyContent: 'space-between',
    borderColor: colors.smoke[200],
    borderRadius: radius.none,
    borderWidth: sizing.hairline,
    backgroundColor: colors.bone,
    padding: spacing[3],
  },
  railItemActive: {
    borderColor: colors.ink,
    backgroundColor: colors.paper,
  },
  railImageFrame: {
    width: sizing.basicsRailImage,
    height: sizing.basicsRailImage,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  railCopy: {
    gap: spacing[1],
  },
  railLabel: {
    color: colors.ink,
    fontFamily: type.families.body,
    fontSize: type.bodyMd.size,
    fontWeight: type.bodyMd.weight,
    lineHeight: type.bodyMd.lineHeight,
  },
  railCategory: {
    color: colors.smoke[300],
    fontFamily: type.families.body,
    fontSize: type.micro.size,
    fontWeight: type.micro.weight,
    letterSpacing: type.micro.letterSpacing,
    lineHeight: type.micro.lineHeight,
  },
});

const toneStyles = StyleSheet.create({
  white: {
    backgroundColor: colors.paper,
  },
  black: {
    backgroundColor: colors.ink,
  },
  bone: {
    backgroundColor: colors.bone,
  },
  heather: {
    backgroundColor: colors.smoke[200],
  },
  charcoal: {
    backgroundColor: colors.smoke[300],
  },
  navy: {
    backgroundColor: colors.smoke[500],
  },
  rawIndigo: {
    backgroundColor: colors.ink,
  },
  indigo: {
    backgroundColor: colors.smoke[500],
  },
  washedBlue: {
    backgroundColor: colors.smoke[200],
  },
  ecru: {
    backgroundColor: colors.bone,
  },
  offBlack: {
    backgroundColor: colors.ink,
  },
  field: {
    backgroundColor: colors.power,
  },
  brown: {
    backgroundColor: colors.power,
  },
  silver: {
    backgroundColor: colors.smoke[200],
  },
});
