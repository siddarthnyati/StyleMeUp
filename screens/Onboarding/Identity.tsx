/**
 * @register Sanctuary
 * @design-ref DESIGN.md §1.5, §10 (Onboarding), §12
 */
import { type CSSProperties } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, sizing, spacing, type } from '@/tokens';
import { useFirstWeekStore, type AudienceIdentity } from '@/lib/firstWeek';

const identities: {
  deck: string;
  label: AudienceIdentity;
}[] = [
  { label: 'man', deck: 'tees, denim, leather. cut from that rail.' },
  { label: 'woman', deck: 'tees, denim, leather. cut from that rail.' },
  { label: 'non-binary', deck: 'tees, denim, leather. cut without a side.' },
];

export function Identity() {
  const audienceIdentity = useFirstWeekStore((state) => state.audienceIdentity);
  const setAudienceIdentity = useFirstWeekStore((state) => state.setAudienceIdentity);

  function handleSelect(identity: AudienceIdentity) {
    setAudienceIdentity(identity);
    router.push('/onboarding/starter-pack');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.stage}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>first fit</Text>
          <Text style={styles.headline}>your foundation starts with...</Text>
          <Text style={styles.subcaption}>choose the rail closest to yours.</Text>
        </View>

        <View style={styles.options} accessibilityRole="radiogroup">
          {identities.map((identity) => {
            const isSelected = identity.label === audienceIdentity;

            return Platform.OS === 'web' ? (
              <a
                aria-checked={isSelected}
                href="/onboarding/starter-pack"
                key={identity.label}
                onClick={() => setAudienceIdentity(identity.label)}
                role="radio"
                style={getWebOptionStyle(isSelected)}
              >
                <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>{identity.label}</Text>
                <Text style={[styles.optionDeck, isSelected && styles.optionDeckSelected]}>{identity.deck}</Text>
              </a>
            ) : (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                key={identity.label}
                onPress={() => handleSelect(identity.label)}
                style={({ pressed }) => [styles.option, isSelected && styles.optionSelected, pressed && styles.pressed]}
              >
                <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>{identity.label}</Text>
                <Text style={[styles.optionDeck, isSelected && styles.optionDeckSelected]}>{identity.deck}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

function getWebOptionStyle(isSelected: boolean): CSSProperties {
  return {
    minHeight: sizing.tapTarget,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    boxSizing: 'border-box',
    gap: spacing[1],
    paddingBlock: spacing[4],
    paddingInline: spacing[5],
    borderRadius: radius.xs,
    borderStyle: 'solid',
    borderWidth: sizing.hairline,
    borderColor: colors.ink,
    background: isSelected ? colors.ink : colors.paper,
    color: isSelected ? colors.paper : colors.ink,
    cursor: 'pointer',
    textDecoration: 'none',
  };
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  stage: {
    flex: 1,
    justifyContent: 'space-between',
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
  options: {
    gap: spacing[3],
  },
  option: {
    minHeight: sizing.tapTarget,
    justifyContent: 'center',
    gap: spacing[1],
    borderColor: colors.ink,
    borderRadius: radius.xs,
    borderWidth: sizing.hairline,
    backgroundColor: colors.paper,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
  },
  optionSelected: {
    backgroundColor: colors.ink,
  },
  pressed: {
    opacity: 0.64,
  },
  optionLabel: {
    color: colors.ink,
    fontFamily: type.families.body,
    fontSize: type.headlineMd.size,
    fontWeight: type.headlineMd.weight,
    lineHeight: type.headlineMd.lineHeight,
  },
  optionLabelSelected: {
    color: colors.paper,
  },
  optionDeck: {
    color: colors.smoke[300],
    fontFamily: type.families.body,
    fontSize: type.bodyMd.size,
    fontWeight: type.bodyMd.weight,
    lineHeight: type.bodyMd.lineHeight,
  },
  optionDeckSelected: {
    color: colors.smoke[200],
  },
});
