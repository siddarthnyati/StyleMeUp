/**
 * @register Magazine
 * @design-ref DESIGN.md §1.5, §10 (Onboarding), §11 (image load-in), §12
 *
 * The first-fit audience picker as a Magazine cover: three full-bleed
 * editorial columns (man | woman | non-binary), claude.design variant 02.
 * Hero plates + per-rail captions come from lib/firstFitHeroes — the rail
 * chosen here routes the entire downstream catalog.
 */
import { type CSSProperties } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, motion, sizing, spacing, type } from '@/tokens';
import { useFirstWeekStore, type AudienceIdentity } from '@/lib/firstWeek';
import { AUDIENCE_CAPTIONS, AUDIENCE_ORDER, getFirstFitHeroUrl } from '@/lib/firstFitHeroes';

export function Identity() {
  const audienceIdentity = useFirstWeekStore((state) => state.audienceIdentity);
  const setAudienceIdentity = useFirstWeekStore((state) => state.setAudienceIdentity);

  function handleSelect(identity: AudienceIdentity) {
    setAudienceIdentity(identity);
    router.push('/onboarding/starter-pack');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>first fit</Text>
        <Text style={styles.headline}>your foundation starts with…</Text>
        <Text style={styles.deck}>choose the rail closest to yours.</Text>
      </View>

      <View style={styles.columns} accessibilityRole="radiogroup">
        {AUDIENCE_ORDER.map((identity) => {
          const caption = AUDIENCE_CAPTIONS[identity];
          const heroUrl = getFirstFitHeroUrl(identity);
          const isSelected = identity === audienceIdentity;
          const accessibilityLabel = `${identity}. ${caption}`;

          return Platform.OS === 'web' ? (
            <a
              aria-checked={isSelected}
              aria-label={accessibilityLabel}
              href="/onboarding/starter-pack"
              key={identity}
              onClick={() => setAudienceIdentity(identity)}
              role="radio"
              style={getWebColumnStyle()}
            >
              <Image
                accessible={false}
                contentFit="cover"
                source={{ uri: heroUrl }}
                style={StyleSheet.absoluteFill}
                transition={motion.durations.page}
              />
              <div style={getWebScrimStyle()}>
                <Text style={styles.slug}>{identity}</Text>
                <Text style={styles.caption}>{caption}</Text>
              </div>
              {isSelected ? <View pointerEvents="none" style={styles.selectedRule} /> : null}
            </a>
          ) : (
            <Pressable
              accessibilityLabel={accessibilityLabel}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
              key={identity}
              onPress={() => handleSelect(identity)}
              style={({ pressed }) => [styles.column, pressed && styles.columnPressed]}
            >
              <Image
                accessible={false}
                contentFit="cover"
                source={{ uri: heroUrl }}
                style={StyleSheet.absoluteFill}
                transition={motion.durations.page}
              />
              <View style={styles.scrim}>
                <Text style={styles.slug}>{identity}</Text>
                <Text style={styles.caption}>{caption}</Text>
              </View>
              {isSelected ? <View pointerEvents="none" style={styles.selectedRule} /> : null}
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

function getWebColumnStyle(): CSSProperties {
  return {
    position: 'relative',
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    minHeight: sizing.tapTarget,
    cursor: 'pointer',
    textDecoration: 'none',
    backgroundColor: colors.void,
  };
}

function getWebScrimStyle(): CSSProperties {
  return {
    position: 'absolute',
    insetInlineStart: 0,
    insetInlineEnd: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[1],
    paddingBlock: `${spacing[7]}px ${spacing[5]}px`,
    paddingInline: spacing[4],
    background: 'linear-gradient(to top, rgba(0, 0, 0, 0.78), rgba(0, 0, 0, 0))',
  };
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.void,
  },
  header: {
    gap: spacing[2],
    paddingHorizontal: spacing[5],
    paddingTop: spacing[6],
    paddingBottom: spacing[5],
  },
  eyebrow: {
    color: colors.smoke[300],
    fontFamily: type.families.body,
    fontSize: type.micro.size,
    fontWeight: type.micro.weight,
    letterSpacing: type.micro.letterSpacing,
    lineHeight: type.micro.lineHeight,
    textTransform: 'uppercase',
  },
  headline: {
    color: colors.paper,
    fontFamily: type.families.displayMagazine,
    fontSize: type.displayLg.size,
    fontStyle: 'italic',
    fontWeight: type.displayLg.weight,
    lineHeight: type.displayLg.lineHeight,
  },
  deck: {
    color: colors.smoke[200],
    fontFamily: type.families.body,
    fontSize: type.bodyMd.size,
    fontWeight: type.bodyMd.weight,
    lineHeight: type.bodyMd.lineHeight,
  },
  columns: {
    flex: 1,
    flexDirection: 'row',
    gap: 2,
    backgroundColor: colors.void,
  },
  column: {
    flex: 1,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    backgroundColor: colors.void,
  },
  columnPressed: {
    opacity: 0.86,
  },
  scrim: {
    gap: spacing[1],
    paddingTop: spacing[7],
    paddingBottom: spacing[5],
    paddingHorizontal: spacing[4],
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  slug: {
    color: colors.paper,
    fontFamily: type.families.displayMagazine,
    fontSize: type.displayMd.size,
    fontStyle: 'italic',
    fontWeight: type.displayMd.weight,
    lineHeight: type.displayMd.lineHeight,
  },
  caption: {
    color: colors.paper,
    opacity: 0.85,
    fontFamily: type.families.body,
    fontSize: type.label.size,
    fontWeight: type.label.weight,
    lineHeight: type.label.lineHeight,
  },
  selectedRule: {
    ...StyleSheet.absoluteFillObject,
    borderColor: colors.paper,
    borderWidth: 1,
  },
});
