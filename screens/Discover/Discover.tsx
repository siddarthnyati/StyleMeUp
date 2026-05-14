/**
 * @register Magazine
 * @design-ref DESIGN.md §1.5, §10 (Discover), §12
 */
import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, sizing, spacing, type } from '@/tokens';
import { BottomNavigation } from '@/components/BottomNavigation/BottomNavigation';
import { GarmentTile } from '@/components/GarmentTile/GarmentTile';
import { useFirstWeekStore } from '@/lib/firstWeek';
import { isNewMagazineIssue, issueWithFallback, useLatestMagazineIssue } from '@/lib/magazineFeed';
import type { MagazineSurface } from '@/lib/magazineIssue';

export function Discover() {
  const issueQuery = useLatestMagazineIssue();
  const issue = issueWithFallback(issueQuery.data);
  const capturedPieces = useFirstWeekStore((state) => state.capturedPieces);
  const seenMagazineIssueSlug = useFirstWeekStore((state) => state.seenMagazineIssueSlug);
  const starterSelections = useFirstWeekStore((state) => state.starterSelections);
  const selectedIdSet = new Set(starterSelections);
  const cards = issue.surfaces.filter((surface) => surface.section !== 'cover');
  const trendCards = cards.filter((surface) => surface.section === 'trend');
  const curatorCards = cards.filter((surface) => surface.section === 'curator');
  const hasNewIssue = isNewMagazineIssue(issueQuery.data, seenMagazineIssueSlug);

  function hasBaseForSurface(surface: MagazineSurface) {
    return (
      surface.baseSelectionIds.some((selectionId) => selectedIdSet.has(selectionId)) ||
      capturedPieces.some((piece) => surface.body.toLowerCase().includes(piece.label.split(' ')[0].toLowerCase()))
    );
  }

  function renderTrendCard(card: MagazineSurface) {
    const hasBase = hasBaseForSurface(card);

    return (
      <View key={card.slug} style={styles.gridCard}>
        <Link href={{ pathname: '/discover/[slug]', params: { slug: card.slug } }} asChild>
          <Pressable accessibilityRole="button" style={({ pressed }) => [styles.cardAction, pressed && styles.cardPressed]}>
            {card.imageUrl ? (
              <Image source={{ uri: card.imageUrl }} style={styles.cardImage} resizeMode="cover" />
            ) : (
              <GarmentTile detail={card.eyebrow} kind={card.kind} label={card.headline} register="Magazine" />
            )}
            <Text style={styles.cardEyebrow}>{card.eyebrow}</Text>
            <Text style={styles.cardHeadline}>{card.headline}</Text>
            <Text style={styles.cardDeck}>{card.deck}</Text>
            <Text style={styles.cardBody}>{card.body}</Text>
          </Pressable>
        </Link>
        {hasBase ? (
          <View style={styles.matchBlock}>
            <Text style={styles.matchText}>you have the base.</Text>
            <Link href="/looks" asChild>
              <Pressable accessibilityRole="button" style={({ pressed }) => [styles.matchAction, pressed && styles.matchActionPressed]}>
                <Text style={styles.matchActionLabel}>build from yours →</Text>
              </Pressable>
            </Link>
          </View>
        ) : null}
      </View>
    );
  }

  const heroContent = (
    <View style={styles.heroCopy}>
      {hasNewIssue ? (
        <View style={styles.newIssueBadge}>
          <Text style={styles.newIssueBadgeLabel}>new issue live.</Text>
        </View>
      ) : null}
      <Text style={styles.eyebrow}>{issue.cover.eyebrow || `VOL. ${issue.volume}`}</Text>
      <Text style={styles.monumental}>{issue.cover.headline}</Text>
      <Text style={styles.dek}>{issue.cover.deck}</Text>
      {issueQuery.isError ? <Text style={styles.feedNote}>local issue shown.</Text> : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Link href={{ pathname: '/discover/[slug]', params: { slug: issue.cover.slug } }} asChild>
          <Pressable accessibilityRole="button" style={({ pressed }) => [pressed && styles.cardPressed]}>
            {issue.cover.imageUrl ? (
              <ImageBackground source={{ uri: issue.cover.imageUrl }} style={styles.coverImage} imageStyle={styles.coverImageInner}>
                <View style={styles.coverShade}>{heroContent}</View>
              </ImageBackground>
            ) : (
              <View style={styles.cover}>{heroContent}</View>
            )}
          </Pressable>
        </Link>

        <View style={styles.issueMeta}>
          <Text style={styles.issueMetaText}>VOL. {issue.volume}</Text>
          <Text style={styles.issueMetaText}>{issue.trend}</Text>
          <Text style={styles.issueMetaText}>{new Date(issue.publishDate).toLocaleDateString()}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>the grid.</Text>
          <View style={styles.grid}>{trendCards.map(renderTrendCard)}</View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>the return.</Text>
          <Text style={styles.editorialCopy}>{issue.history || issue.cover.history || issue.cover.deck}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>why now.</Text>
          <Text style={styles.editorialCopy}>{issue.whyNow || issue.cover.whyNow || issue.sourceSummary}</Text>
        </View>

        {curatorCards.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>you have the base.</Text>
            <View style={styles.feed}>{curatorCards.map(renderTrendCard)}</View>
          </View>
        )}
      </ScrollView>
      <BottomNavigation active="discover" register="Magazine" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.void,
  },
  content: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[6],
    paddingBottom: spacing[8],
    gap: spacing[7],
  },
  cover: {
    minHeight: sizing.magazineCoverHeight,
    justifyContent: 'flex-end',
    backgroundColor: colors.void,
    borderColor: colors.smoke[500],
    borderBottomWidth: sizing.hairline,
  },
  coverImage: {
    minHeight: sizing.magazineCoverHeight + 72,
    justifyContent: 'flex-end',
    backgroundColor: colors.void,
  },
  coverImageInner: {
    opacity: 0.72,
  },
  coverShade: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.32)',
  },
  heroCopy: {
    gap: spacing[4],
    paddingVertical: spacing[6],
  },
  newIssueBadge: {
    alignSelf: 'flex-start',
    borderColor: colors.paper,
    borderRadius: radius.pill,
    borderWidth: sizing.hairline,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  newIssueBadgeLabel: {
    color: colors.paper,
    fontFamily: type.families.body,
    fontSize: type.micro.size,
    fontWeight: type.micro.weight,
    letterSpacing: type.micro.letterSpacing,
    lineHeight: type.micro.lineHeight,
    textTransform: 'uppercase',
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
  monumental: {
    color: colors.paper,
    fontFamily: type.families.displayMagazine,
    fontSize: type.displayLg.size,
    fontWeight: type.displayLg.weight,
    lineHeight: type.displayLg.lineHeight,
  },
  dek: {
    color: colors.paper,
    fontFamily: type.families.displayMagazine,
    fontSize: type.displayMd.size,
    fontStyle: 'italic',
    fontWeight: type.displayMd.weight,
    lineHeight: type.displayMd.lineHeight,
  },
  feedNote: {
    color: colors.smoke[300],
    fontFamily: type.families.body,
    fontSize: type.micro.size,
    fontWeight: type.micro.weight,
    letterSpacing: type.micro.letterSpacing,
    lineHeight: type.micro.lineHeight,
    textTransform: 'uppercase',
  },
  issueMeta: {
    borderColor: colors.smoke[500],
    borderTopWidth: sizing.hairline,
    borderBottomWidth: sizing.hairline,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
  },
  issueMetaText: {
    color: colors.smoke[300],
    fontFamily: type.families.body,
    fontSize: type.micro.size,
    fontWeight: type.micro.weight,
    letterSpacing: type.micro.letterSpacing,
    lineHeight: type.micro.lineHeight,
    maxWidth: '32%',
    textTransform: 'uppercase',
  },
  section: {
    gap: spacing[4],
  },
  sectionTitle: {
    color: colors.paper,
    fontFamily: type.families.displayMagazine,
    fontSize: type.displayMd.size,
    fontStyle: 'italic',
    fontWeight: type.displayMd.weight,
    lineHeight: type.displayMd.lineHeight,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[4],
  },
  feed: {
    gap: spacing[4],
  },
  gridCard: {
    flexGrow: 1,
    flexBasis: '46%',
    minWidth: 150,
    gap: spacing[3],
  },
  cardAction: {
    gap: spacing[3],
  },
  cardImage: {
    width: '100%',
    aspectRatio: 0.8,
    backgroundColor: colors.shadow,
  },
  cardPressed: {
    opacity: 0.72,
  },
  cardEyebrow: {
    color: colors.smoke[300],
    fontFamily: type.families.body,
    fontSize: type.micro.size,
    fontWeight: type.micro.weight,
    letterSpacing: type.micro.letterSpacing,
    lineHeight: type.micro.lineHeight,
    textTransform: 'uppercase',
  },
  cardHeadline: {
    color: colors.paper,
    fontFamily: type.families.displayMagazine,
    fontSize: type.bodyLg.size,
    fontStyle: 'italic',
    fontWeight: type.bodyLg.weight,
    lineHeight: type.bodyLg.lineHeight,
  },
  cardDeck: {
    color: colors.paper,
    fontFamily: type.families.body,
    fontSize: type.bodyMd.size,
    fontWeight: type.bodyMd.weight,
    lineHeight: type.bodyMd.lineHeight,
  },
  cardBody: {
    color: colors.smoke[300],
    fontFamily: type.families.body,
    fontSize: type.bodyMd.size,
    fontWeight: type.bodyMd.weight,
    lineHeight: type.bodyMd.lineHeight,
  },
  editorialCopy: {
    color: colors.paper,
    fontFamily: type.families.body,
    fontSize: type.bodyLg.size,
    fontWeight: type.bodyLg.weight,
    lineHeight: type.bodyLg.lineHeight,
  },
  matchBlock: {
    gap: spacing[1],
    borderColor: colors.smoke[500],
    borderTopWidth: sizing.hairline,
    paddingTop: spacing[3],
  },
  matchText: {
    color: colors.paper,
    fontFamily: type.families.displayMagazine,
    fontSize: type.bodyLg.size,
    fontStyle: 'italic',
    fontWeight: type.bodyLg.weight,
    lineHeight: type.bodyLg.lineHeight,
  },
  matchAction: {
    minHeight: sizing.tapTarget,
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  matchActionLabel: {
    color: colors.paper,
    fontFamily: type.families.body,
    fontSize: type.bodyMd.size,
    fontWeight: type.headlineMd.weight,
    lineHeight: type.bodyMd.lineHeight,
  },
  matchActionPressed: {
    opacity: 0.64,
  },
});
