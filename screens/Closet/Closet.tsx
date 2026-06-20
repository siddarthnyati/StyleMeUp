/**
 * @register Sanctuary
 * @design-ref DESIGN.md §1.5, §10 (Closet), §12
 */
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, sizing, spacing, type } from '@/tokens';
import { BasicsBlock3D } from '@/components/BasicsBlock3D/BasicsBlock3D';
import { BottomNavigation } from '@/components/BottomNavigation/BottomNavigation';
import { GarmentTile, GARMENT_KINDS, type GarmentKind } from '@/components/GarmentTile/GarmentTile';
import { getStarterVariantsByIds } from '@/components/StarterPack/StarterPackExplorer';
import { getTodayLookForPersona, useFirstWeekStore, type Persona } from '@/lib/firstWeek';
import { comboItemFromCaptured, comboItemFromStarter, generateCombos } from '@/lib/comboEngine';

const personaOrder: Persona[] = ['work', 'going out', 'weekend'];

export function Closet() {
  const searchParams = useLocalSearchParams<{ captured?: string }>();
  const capturedPieces = useFirstWeekStore((state) => state.capturedPieces);
  const firstSignatureSaved = useFirstWeekStore((state) => state.firstSignatureSaved);
  const persona = useFirstWeekStore((state) => state.persona);
  const saveCapturedPiece = useFirstWeekStore((state) => state.saveCapturedPiece);
  const updateCapturedPiece = useFirstWeekStore((state) => state.updateCapturedPiece);
  const saveLook = useFirstWeekStore((state) => state.saveLook);
  const setLastDressingRoomDate = useFirstWeekStore((state) => state.setLastDressingRoomDate);
  const starterSelections = useFirstWeekStore((state) => state.starterSelections);
  const tasteNotes = useFirstWeekStore((state) => state.tasteNotes);
  const [activePersona, setActivePersona] = useState<Persona>(persona);
  const [todayState, setTodayState] = useState<'ready' | 'saved' | 'passed'>('ready');
  const [editingPieceId, setEditingPieceId] = useState<string | null>(null);
  const editingPiece = capturedPieces.find((piece) => piece.id === editingPieceId) ?? null;

  // Combo engine v0: pair outfits from the user's marked starter pieces
  // (which carry tone + shape) plus captured pieces. Runs on metadata,
  // on-device, no network (lib/comboEngine).
  const combos = useMemo(() => {
    const starterItems = getStarterVariantsByIds(starterSelections).map((entry) =>
      comboItemFromStarter(entry.variant),
    );
    const capturedItems = capturedPieces.map(comboItemFromCaptured);
    return generateCombos([...starterItems, ...capturedItems], { limit: 3 });
  }, [starterSelections, capturedPieces]);

  function handlePickKind(kind: GarmentKind) {
    if (editingPieceId) {
      updateCapturedPiece(editingPieceId, { kind, label: kind });
    }
    setEditingPieceId(null);
  }
  const todayLook = getTodayLookForPersona(activePersona);
  const routeCaptured = searchParams.captured === '1';
  const hasCapturedPiece = capturedPieces.length > 0 || routeCaptured;
  const headerCopy = hasCapturedPiece
    ? 'one piece is real now.'
    : firstSignatureSaved
      ? 'your closet has begun.'
      : 'the first foundation.';
  const milestones = [
    { complete: starterSelections.length > 0, label: 'foundation' },
    { complete: hasCapturedPiece, label: 'one piece' },
    { complete: firstSignatureSaved, label: 'first look' },
  ];

  useEffect(() => {
    if (routeCaptured && capturedPieces.length === 0) {
      saveCapturedPiece();
    }
  }, [capturedPieces.length, routeCaptured, saveCapturedPiece]);

  function handleWearThis() {
    saveLook(todayLook);
    setLastDressingRoomDate(new Date().toISOString());
    setTodayState('saved');
  }

  function handleChangeMood() {
    const currentIndex = personaOrder.indexOf(activePersona);
    const nextPersona = personaOrder[(currentIndex + 1) % personaOrder.length];

    setActivePersona(nextPersona);
    setTodayState('ready');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.stage}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>closet</Text>
          <Text style={styles.headline}>your closet.</Text>
          <Text style={styles.subcaption}>{headerCopy}</Text>
        </View>

        <View style={styles.path} accessible accessibilityLabel="foundation path progress">
          {milestones.map((milestone) => (
            <View
              accessible
              accessibilityLabel={`${milestone.label}, ${milestone.complete ? 'marked' : 'open'}`}
              key={milestone.label}
              style={styles.milestone}
            >
              <View style={[styles.check, milestone.complete && styles.checkComplete]}>
                <Text style={[styles.checkText, milestone.complete && styles.checkTextComplete]}>✓</Text>
              </View>
              <Text style={styles.milestoneLabel}>{milestone.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.todayCard}>
          <View style={styles.todayHeader}>
            <Text style={styles.todayEyebrow}>today</Text>
            <Text style={styles.todayTitle}>{todayLook.title}</Text>
            <Text style={styles.todayCaption}>{todayLook.caption}</Text>
          </View>

          <View style={styles.todayPieces}>
            {todayLook.pieces.map((piece) => (
              <GarmentTile key={`${todayLook.id}-${piece.label}`} detail={piece.detail} kind={piece.kind} label={piece.label} register="Sanctuary" />
            ))}
          </View>

          <Text style={styles.todayRationale}>{todayLook.rationale}</Text>

          {todayState === 'saved' ? (
            <Text style={styles.savedText}>saved.</Text>
          ) : todayState === 'passed' ? (
            <Text style={styles.savedText}>another line tomorrow.</Text>
          ) : (
            <View style={styles.todayActions}>
              <Pressable
                accessibilityRole="button"
                onPress={handleWearThis}
                style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}
              >
                <Text style={styles.primaryActionLabel}>WEAR THIS</Text>
              </Pressable>
              <View style={styles.secondaryActions}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setTodayState('passed')}
                  style={({ pressed }) => [styles.textAction, pressed && styles.pressed]}
                >
                  <Text style={styles.textActionLabel}>not today</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={handleChangeMood}
                  style={({ pressed }) => [styles.textAction, pressed && styles.pressed]}
                >
                  <Text style={styles.textActionLabel}>change the mood</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        <View style={styles.tasteNotes}>
          <Text style={styles.tasteHeadline}>private notes.</Text>
          {tasteNotes.map((note) => (
            <Text key={note} style={styles.tasteNote}>{note}</Text>
          ))}
          {!hasCapturedPiece ? (
            <Link href="/capture" asChild>
              <Pressable accessibilityRole="button" style={({ pressed }) => [styles.nextAction, pressed && styles.pressed]}>
                <Text style={styles.nextActionLabel}>capture one piece →</Text>
              </Pressable>
            </Link>
          ) : null}
        </View>

        {capturedPieces.length > 0 ? (
          <View style={styles.capturedSection}>
            <Text style={styles.capturedHeadline}>your pieces.</Text>
            <Text style={styles.capturedHint}>tap a piece to fix what it is.</Text>
            <View style={styles.capturedGrid}>
              {capturedPieces.map((piece) => (
                <Pressable
                  accessibilityHint="opens a picker to correct the garment type"
                  accessibilityLabel={`${piece.label}. tap to change.`}
                  accessibilityRole="button"
                  key={piece.id}
                  onPress={() => setEditingPieceId(piece.id)}
                  style={({ pressed }) => [styles.capturedCell, pressed && styles.pressed]}
                >
                  <GarmentTile
                    detail={piece.detail}
                    imageUri={piece.imageUri}
                    kind={piece.kind}
                    label={piece.label}
                    register="Sanctuary"
                  />
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        {combos.length > 0 ? (
          <View style={styles.combosSection}>
            <Text style={styles.combosHeadline}>outfits from your closet.</Text>
            <Text style={styles.capturedHint}>built from what you marked and captured.</Text>
            {combos.map((combo) => (
              <View key={combo.id} style={styles.comboCard}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.comboRow}>
                  {combo.items.map((item) => (
                    <View key={`${combo.id}-${item.id}`} style={styles.comboItemCell}>
                      <GarmentTile
                        detail={item.detail}
                        imageUri={item.imageUri}
                        kind={item.kind}
                        label={item.label}
                        register="Sanctuary"
                      />
                    </View>
                  ))}
                </ScrollView>
                <Text style={styles.comboRationale}>{combo.rationale}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <BasicsBlock3D />
      </ScrollView>
      <BottomNavigation active="closet" register="Sanctuary" />

      <Modal
        animationType="slide"
        onRequestClose={() => setEditingPieceId(null)}
        transparent
        visible={editingPiece !== null}
      >
        <Pressable accessibilityLabel="dismiss" onPress={() => setEditingPieceId(null)} style={styles.sheetBackdrop} />
        <View style={styles.sheet}>
          <Text style={styles.sheetEyebrow}>what is this piece?</Text>
          <Text style={styles.sheetHeadline}>set the type.</Text>
          <ScrollView contentContainerStyle={styles.sheetGrid} showsVerticalScrollIndicator={false}>
            {GARMENT_KINDS.map((kind) => {
              const isCurrent = editingPiece?.kind === kind;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: isCurrent }}
                  key={kind}
                  onPress={() => handlePickKind(kind)}
                  style={({ pressed }) => [styles.kindChip, isCurrent && styles.kindChipCurrent, pressed && styles.pressed]}
                >
                  <Text style={[styles.kindChipLabel, isCurrent && styles.kindChipLabelCurrent]}>{kind}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  stage: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[7],
    paddingBottom: spacing[7],
    gap: spacing[5],
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
  path: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
    borderColor: colors.smoke[200],
    borderWidth: sizing.hairline,
    backgroundColor: colors.bone,
    padding: spacing[3],
  },
  milestone: {
    minWidth: 88,
    flexGrow: 1,
    alignItems: 'center',
    gap: spacing[2],
  },
  check: {
    width: sizing.tapTarget,
    height: sizing.tapTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.smoke[200],
    borderRadius: radius.pill,
    borderWidth: sizing.hairline,
    backgroundColor: colors.paper,
  },
  checkComplete: {
    borderColor: colors.ink,
    backgroundColor: colors.ink,
  },
  checkText: {
    color: colors.smoke[200],
    fontFamily: type.families.body,
    fontSize: type.label.size,
    fontWeight: type.label.weight,
    lineHeight: type.label.lineHeight,
  },
  checkTextComplete: {
    color: colors.paper,
  },
  milestoneLabel: {
    color: colors.smoke[300],
    fontFamily: type.families.body,
    fontSize: type.micro.size,
    fontWeight: type.micro.weight,
    letterSpacing: type.micro.letterSpacing,
    lineHeight: type.micro.lineHeight,
  },
  todayCard: {
    gap: spacing[4],
    borderColor: colors.ink,
    borderRadius: radius.xs,
    borderWidth: sizing.hairline,
    backgroundColor: colors.paper,
    padding: spacing[4],
  },
  todayHeader: {
    gap: spacing[1],
  },
  todayEyebrow: {
    color: colors.smoke[300],
    fontFamily: type.families.body,
    fontSize: type.micro.size,
    fontWeight: type.micro.weight,
    letterSpacing: type.micro.letterSpacing,
    lineHeight: type.micro.lineHeight,
  },
  todayTitle: {
    color: colors.ink,
    fontFamily: type.families.displayMagazine,
    fontSize: type.displayMd.size,
    fontStyle: 'italic',
    fontWeight: type.displayMd.weight,
    lineHeight: type.displayMd.lineHeight,
  },
  todayCaption: {
    color: colors.smoke[300],
    fontFamily: type.families.body,
    fontSize: type.bodyMd.size,
    fontWeight: type.bodyMd.weight,
    lineHeight: type.bodyMd.lineHeight,
  },
  todayPieces: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  todayRationale: {
    color: colors.ink,
    fontFamily: type.families.displayMagazine,
    fontSize: type.bodyLg.size,
    fontStyle: 'italic',
    fontWeight: type.bodyLg.weight,
    lineHeight: type.bodyLg.lineHeight,
  },
  todayActions: {
    gap: spacing[2],
  },
  primaryAction: {
    minHeight: sizing.tapTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.ink,
    paddingHorizontal: spacing[5],
  },
  primaryActionLabel: {
    color: colors.paper,
    fontFamily: type.families.body,
    fontSize: type.label.size,
    fontWeight: type.label.weight,
    letterSpacing: type.micro.letterSpacing,
    lineHeight: type.label.lineHeight,
  },
  secondaryActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  textAction: {
    minHeight: sizing.tapTarget,
    justifyContent: 'center',
  },
  textActionLabel: {
    color: colors.ink,
    fontFamily: type.families.body,
    fontSize: type.bodyMd.size,
    fontWeight: type.headlineMd.weight,
    lineHeight: type.bodyMd.lineHeight,
  },
  savedText: {
    color: colors.ink,
    fontFamily: type.families.displayMagazine,
    fontSize: type.headlineLg.size,
    fontStyle: 'italic',
    fontWeight: type.displayMd.weight,
    lineHeight: type.headlineLg.lineHeight,
  },
  tasteNotes: {
    gap: spacing[2],
    borderColor: colors.smoke[200],
    borderWidth: sizing.hairline,
    backgroundColor: colors.bone,
    padding: spacing[4],
  },
  tasteHeadline: {
    color: colors.ink,
    fontFamily: type.families.displayMagazine,
    fontSize: type.headlineLg.size,
    fontStyle: 'italic',
    fontWeight: type.displayMd.weight,
    lineHeight: type.headlineLg.lineHeight,
  },
  tasteNote: {
    color: colors.smoke[300],
    fontFamily: type.families.body,
    fontSize: type.bodyMd.size,
    fontWeight: type.bodyMd.weight,
    lineHeight: type.bodyMd.lineHeight,
  },
  capturedSection: {
    gap: spacing[3],
  },
  capturedHeadline: {
    color: colors.ink,
    fontFamily: type.families.displayMagazine,
    fontSize: type.headlineLg.size,
    fontStyle: 'italic',
    fontWeight: type.displayMd.weight,
    lineHeight: type.headlineLg.lineHeight,
  },
  capturedHint: {
    color: colors.smoke[300],
    fontFamily: type.families.body,
    fontSize: type.micro.size,
    fontWeight: type.micro.weight,
    letterSpacing: type.micro.letterSpacing,
    lineHeight: type.micro.lineHeight,
    marginTop: -spacing[2],
  },
  capturedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  capturedCell: {
    width: '48%',
  },
  combosSection: {
    gap: spacing[3],
  },
  combosHeadline: {
    color: colors.ink,
    fontFamily: type.families.displayMagazine,
    fontSize: type.headlineLg.size,
    fontStyle: 'italic',
    fontWeight: type.displayMd.weight,
    lineHeight: type.headlineLg.lineHeight,
  },
  comboCard: {
    gap: spacing[2],
  },
  comboRow: {
    gap: spacing[2],
    paddingVertical: spacing[1],
  },
  comboItemCell: {
    width: 124,
  },
  comboRationale: {
    color: colors.ink,
    fontFamily: type.families.displayMagazine,
    fontSize: type.bodyLg.size,
    fontStyle: 'italic',
    fontWeight: type.bodyLg.weight,
    lineHeight: type.bodyLg.lineHeight,
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: colors.shadow,
    opacity: 0.4,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '70%',
    gap: spacing[2],
    borderTopColor: colors.smoke[200],
    borderTopWidth: sizing.hairline,
    backgroundColor: colors.paper,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[5],
    paddingBottom: spacing[7],
  },
  sheetEyebrow: {
    color: colors.smoke[300],
    fontFamily: type.families.body,
    fontSize: type.micro.size,
    fontWeight: type.micro.weight,
    letterSpacing: type.micro.letterSpacing,
    lineHeight: type.micro.lineHeight,
  },
  sheetHeadline: {
    color: colors.ink,
    fontFamily: type.families.displayMagazine,
    fontSize: type.displayMd.size,
    fontStyle: 'italic',
    fontWeight: type.displayMd.weight,
    lineHeight: type.displayMd.lineHeight,
    marginBottom: spacing[2],
  },
  sheetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  kindChip: {
    minHeight: sizing.tapTarget,
    justifyContent: 'center',
    borderColor: colors.smoke[200],
    borderRadius: radius.xs,
    borderWidth: sizing.hairline,
    backgroundColor: colors.bone,
    paddingHorizontal: spacing[4],
  },
  kindChipCurrent: {
    borderColor: colors.ink,
    backgroundColor: colors.ink,
  },
  kindChipLabel: {
    color: colors.ink,
    fontFamily: type.families.body,
    fontSize: type.bodyMd.size,
    fontWeight: type.bodyMd.weight,
    lineHeight: type.bodyMd.lineHeight,
  },
  kindChipLabelCurrent: {
    color: colors.paper,
  },
  nextAction: {
    minHeight: sizing.tapTarget,
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  nextActionLabel: {
    color: colors.ink,
    fontFamily: type.families.body,
    fontSize: type.bodyMd.size,
    fontWeight: type.headlineMd.weight,
    lineHeight: type.bodyMd.lineHeight,
  },
  pressed: {
    opacity: 0.64,
  },
});
