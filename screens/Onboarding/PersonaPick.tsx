/**
 * @register Sanctuary
 * @design-ref DESIGN.md §1.5, §10 (Onboarding)
 */
import { useState, type CSSProperties } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, sizing, spacing, type } from '@/tokens';
import { getStarterSelectionFromSearch } from '@/components/StarterPack/StarterPackExplorer';
import { useFirstWeekStore, type Persona } from '@/lib/firstWeek';

const personas: Persona[] = ['work', 'going out', 'weekend'];

function getPersonaFromSearch(value: string | string[] | undefined): Persona | undefined {
  const persona = Array.isArray(value) ? value[0] : value;

  return personas.includes(persona as Persona) ? (persona as Persona) : undefined;
}

export function PersonaPick() {
  const savedPersona = useFirstWeekStore((state) => state.persona);
  const requestFirstSignature = useFirstWeekStore((state) => state.requestFirstSignature);
  const setPersona = useFirstWeekStore((state) => state.setPersona);
  const setStarterSelections = useFirstWeekStore((state) => state.setStarterSelections);
  const searchParams = useLocalSearchParams<{ persona?: string; selected?: string }>();
  const searchPersona = getPersonaFromSearch(searchParams.persona);
  const searchSelectedIds = getStarterSelectionFromSearch(searchParams.selected);
  const [selectedPersona, setSelectedPersona] = useState<Persona>(savedPersona);
  const effectivePersona = searchPersona ?? selectedPersona;
  const selectedParam = searchSelectedIds ? `&selected=${encodeURIComponent(searchSelectedIds.join(','))}` : '';
  const firstSignatureHref = `/onboarding/first-signature?persona=${encodeURIComponent(effectivePersona)}${selectedParam}`;

  function handlePersonaSelect(persona: Persona) {
    setSelectedPersona(persona);
    setPersona(persona);
  }

  function handleBegin() {
    if (searchSelectedIds) {
      setStarterSelections(searchSelectedIds);
    }

    setPersona(effectivePersona);
    void requestFirstSignature(effectivePersona);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.stage}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>ONE MORE THING</Text>
          <Text style={styles.headline}>you usually dress for…</Text>
        </View>

        <View style={styles.options}>
          {personas.map((persona) => {
            const isSelected = persona === effectivePersona;

            return Platform.OS === 'web' ? (
              <a
                aria-checked={isSelected}
                href={`/onboarding/persona-pick?persona=${encodeURIComponent(persona)}${selectedParam}`}
                key={persona}
                onClick={() => handlePersonaSelect(persona)}
                role="radio"
                style={getWebOptionStyle(isSelected)}
              >
                <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>{persona}</Text>
              </a>
            ) : (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                key={persona}
                onPress={() => handlePersonaSelect(persona)}
                style={({ pressed }) => [
                  styles.option,
                  isSelected && styles.optionSelected,
                  pressed && styles.optionPressed,
                ]}
              >
                <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>{persona}</Text>
              </Pressable>
            );
          })}
        </View>

        {Platform.OS === 'web' ? (
          <a href={firstSignatureHref} onClick={handleBegin} style={webCtaStyle}>
            <Text style={styles.ctaLabel}>begin →</Text>
          </a>
        ) : (
          <Link href="/onboarding/first-signature" onPress={handleBegin} asChild>
            <Pressable accessibilityRole="button" style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}>
              <Text style={styles.ctaLabel}>begin →</Text>
            </Pressable>
          </Link>
        )}
      </View>
    </SafeAreaView>
  );
}

const webCtaStyle: CSSProperties = {
  minHeight: sizing.tapTarget,
  alignSelf: 'flex-start',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: colors.ink,
  textDecoration: 'none',
};

function getWebOptionStyle(isSelected: boolean): CSSProperties {
  return {
    minHeight: sizing.tapTarget,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
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
  options: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing[3],
  },
  option: {
    minHeight: sizing.tapTarget,
    justifyContent: 'center',
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
  optionPressed: {
    opacity: 0.82,
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
