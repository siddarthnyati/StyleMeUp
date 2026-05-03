import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { colors, motion, radius, sizing, spacing, type } from '@/tokens';

type BasicCategory = 'tees' | 'denim' | 'boots' | 'shoes';
type Tone = 'paper' | 'ink' | 'bone' | 'smokeLight' | 'smokeMid' | 'smokeDark' | 'power';

type WardrobeBasic = {
  category: BasicCategory;
  detail: string;
  label: string;
  shape: BasicCategory;
  tone: Tone;
};

const wardrobeBasics: WardrobeBasic[] = [
  { category: 'tees', label: 'white tee', detail: 'dense cotton. straight hem.', shape: 'tees', tone: 'paper' },
  { category: 'tees', label: 'black tee', detail: 'flat black. close neck.', shape: 'tees', tone: 'ink' },
  { category: 'tees', label: 'bone tee', detail: 'warmer cotton. dry hand.', shape: 'tees', tone: 'bone' },
  { category: 'tees', label: 'heather tee', detail: 'soft grey. quiet texture.', shape: 'tees', tone: 'smokeLight' },
  { category: 'tees', label: 'navy tee', detail: 'near-black. clean sleeve.', shape: 'tees', tone: 'smokeDark' },
  { category: 'tees', label: 'heavy tee', detail: 'boxier cut. no collapse.', shape: 'tees', tone: 'smokeMid' },
  { category: 'denim', label: 'raw denim', detail: 'rigid. architectural leg.', shape: 'denim', tone: 'ink' },
  { category: 'denim', label: 'indigo denim', detail: 'straight. worn dark.', shape: 'denim', tone: 'smokeDark' },
  { category: 'denim', label: 'washed denim', detail: 'pale cast. easy break.', shape: 'denim', tone: 'smokeLight' },
  { category: 'denim', label: 'black denim', detail: 'clean column. matte.', shape: 'denim', tone: 'smokeDark' },
  { category: 'denim', label: 'ecru denim', detail: 'dry cotton. no distress.', shape: 'denim', tone: 'bone' },
  { category: 'boots', label: 'chelsea boot', detail: 'brushed leather. narrow shaft.', shape: 'boots', tone: 'ink' },
  { category: 'boots', label: 'ankle boot', detail: 'stacked sole. polished toe.', shape: 'boots', tone: 'smokeDark' },
  { category: 'boots', label: 'field boot', detail: 'heavy tread. quiet hardware.', shape: 'boots', tone: 'power' },
  { category: 'shoes', label: 'white court shoe', detail: 'low profile. leather panels.', shape: 'shoes', tone: 'paper' },
  { category: 'shoes', label: 'black loafer', detail: 'single line. no ornament.', shape: 'shoes', tone: 'ink' },
  { category: 'shoes', label: 'suede runner', detail: 'panelled. muted sole.', shape: 'shoes', tone: 'smokeMid' },
  { category: 'shoes', label: 'silver trainer', detail: 'technical skin. light sole.', shape: 'shoes', tone: 'smokeLight' },
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

const toneFills: Record<Tone, string> = {
  paper: colors.paper,
  ink: colors.ink,
  bone: colors.bone,
  smokeLight: colors.smoke[200],
  smokeMid: colors.smoke[300],
  smokeDark: colors.smoke[500],
  power: colors.power,
};

function garmentSvg(shape: BasicCategory, tone: Tone) {
  const fill = toneFills[tone];
  const stroke = tone === 'paper' || tone === 'bone' || tone === 'smokeLight' ? colors.smoke[300] : colors.smoke[200];
  const accent = tone === 'paper' || tone === 'bone' || tone === 'smokeLight' ? colors.smoke[200] : colors.smoke[400];

  const shapes: Record<BasicCategory, string> = {
    tees: `
      <path d="M78 31h36l18 17 25 9-14 33-23-9v75H72V81l-23 9-14-33 25-9 18-17Z" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
      <path d="M84 33c7 11 23 11 30 0" fill="none" stroke="${accent}" stroke-width="2"/>
      <path d="M72 139h48" stroke="${accent}" stroke-width="2"/>
    `,
    denim: `
      <path d="M69 28h58l9 128H98l-8-76-9 76H43L58 28Z" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
      <path d="M70 28v24h45V28" fill="none" stroke="${accent}" stroke-width="2"/>
      <path d="M90 55v101" stroke="${accent}" stroke-width="2"/>
      <path d="M62 43h20M103 43h20" stroke="${accent}" stroke-width="2"/>
    `,
    boots: `
      <path d="M51 40h42v73l18 9 38 2 8 21H51V40Z" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
      <path d="M93 80h29l8 43" fill="none" stroke="${accent}" stroke-width="2"/>
      <path d="M51 133h104M68 145v10M90 145v10M112 145v10M134 145v10" stroke="${accent}" stroke-width="2"/>
    `,
    shoes: `
      <path d="M42 104c24-2 45-12 61-31 21 22 41 31 61 32 10 1 16 8 18 20l2 12H33l3-18c1-9 3-14 6-15Z" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
      <path d="M85 84h43M101 73l7 22M118 77l7 18" stroke="${accent}" stroke-width="2"/>
      <path d="M35 130h147" stroke="${accent}" stroke-width="2"/>
    `,
  };

  return `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
      <rect width="192" height="192" fill="transparent"/>
      ${shapes[shape]}
    </svg>
  `)}`;
}

function GarmentImage({ item, style }: { item: WardrobeBasic; style: object }) {
  return (
    <Image
      accessibilityLabel={item.label}
      contentFit="contain"
      source={{ uri: garmentSvg(item.shape, item.tone) }}
      style={style}
    />
  );
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
                <GarmentImage item={active} style={styles.heroImage} />
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
                <GarmentImage item={item} style={styles.railImage} />
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
  heroImage: {
    width: sizing.basicsHeroImage,
    height: sizing.basicsHeroImage,
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
  railImage: {
    width: sizing.basicsRailImage,
    height: sizing.basicsRailImage,
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
  paper: {
    backgroundColor: colors.paper,
  },
  ink: {
    backgroundColor: colors.ink,
  },
  bone: {
    backgroundColor: colors.bone,
  },
  smokeLight: {
    backgroundColor: colors.smoke[200],
  },
  smokeMid: {
    backgroundColor: colors.smoke[300],
  },
  smokeDark: {
    backgroundColor: colors.smoke[500],
  },
  power: {
    backgroundColor: colors.power,
  },
});
