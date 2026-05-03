import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, useLocalSearchParams, type Href } from 'expo-router';

import { colors, radius, sizing, spacing, type, wardrobeTones } from '@/tokens';
import type { WardrobeTone } from '@/tokens/wardrobe';

export type StarterAudience = 'men' | 'women';
export type StarterCategoryKey = 'tshirts' | 'jeans' | 'shoes' | 'accessories' | 'boots' | 'jackets';
export type StarterShape = 'tee' | 'jeans' | 'sneaker' | 'loafer' | 'boot' | 'cap' | 'belt' | 'bag' | 'jacket';
export type StarterImageSize = 'hero' | 'preview' | 'variant' | 'closetHero' | 'closetRail';

export type StarterVariant = {
  detail: string;
  id: string;
  label: string;
  shape: StarterShape;
  tone: WardrobeTone;
};

export type StarterCategory = {
  deck: string;
  key: StarterCategoryKey;
  label: string;
  variants: StarterVariant[];
};

type StarterPackExplorerProps = {
  continueHref?: Href;
  initialSelectedIds?: readonly string[];
  onContinue: (selectionIds: string[]) => void;
  onSelectionsChange?: (selectionIds: string[]) => void;
};

export const starterCategories: StarterCategory[] = [
  {
    key: 'tshirts',
    label: 't-shirts',
    deck: 'crew necks. washed cotton. close to the body.',
    variants: [
      { id: 'tee-optic', label: 'optic tee', detail: 'dense cotton. clean neck.', shape: 'tee', tone: 'optic' },
      { id: 'tee-black', label: 'black tee', detail: 'flat black. straight hem.', shape: 'tee', tone: 'black' },
      { id: 'tee-bone', label: 'bone tee', detail: 'warm white. dry hand.', shape: 'tee', tone: 'bone' },
      { id: 'tee-heather', label: 'heather tee', detail: 'soft grey. worn easy.', shape: 'tee', tone: 'heather' },
      { id: 'tee-navy', label: 'navy tee', detail: 'near black. quieter.', shape: 'tee', tone: 'navy' },
      { id: 'tee-charcoal', label: 'charcoal tee', detail: 'washed dark. no shine.', shape: 'tee', tone: 'charcoal' },
      { id: 'tee-tobacco', label: 'tobacco tee', detail: 'warm brown. old cotton.', shape: 'tee', tone: 'tobacco' },
      { id: 'tee-olive', label: 'olive tee', detail: 'military cast. softened.', shape: 'tee', tone: 'olive' },
      { id: 'tee-burgundy', label: 'burgundy tee', detail: 'deep red. almost black.', shape: 'tee', tone: 'burgundy' },
      { id: 'tee-sky', label: 'sky tee', detail: 'pale blue. summer weight.', shape: 'tee', tone: 'sky' },
      { id: 'tee-steel', label: 'steel tee', detail: 'blue grey. compact knit.', shape: 'tee', tone: 'steel' },
      { id: 'tee-cream-long', label: 'cream long sleeve', detail: 'ribbed cuff. tucked in.', shape: 'tee', tone: 'cream' },
      { id: 'tee-washed-red', label: 'washed red tee', detail: 'faded. not loud.', shape: 'tee', tone: 'washedRed' },
      { id: 'tee-heavy-grey', label: 'heavy grey tee', detail: 'boxier cut. keeps shape.', shape: 'tee', tone: 'heather' },
    ],
  },
  {
    key: 'jeans',
    label: 'jeans',
    deck: 'raw, rinsed, washed. the leg does the work.',
    variants: [
      { id: 'jean-raw', label: 'raw indigo jean', detail: 'rigid. architectural leg.', shape: 'jeans', tone: 'rawIndigo' },
      { id: 'jean-rinsed', label: 'rinsed jean', detail: 'dark blue. barely worn.', shape: 'jeans', tone: 'indigo' },
      { id: 'jean-washed', label: 'washed blue jean', detail: 'soft break. straight.', shape: 'jeans', tone: 'washedBlue' },
      { id: 'jean-pale', label: 'pale denim', detail: 'light cast. relaxed.', shape: 'jeans', tone: 'paleDenim' },
      { id: 'jean-black', label: 'black denim', detail: 'matte. clean column.', shape: 'jeans', tone: 'black' },
      { id: 'jean-charcoal', label: 'charcoal denim', detail: 'faded black. narrow.', shape: 'jeans', tone: 'charcoal' },
      { id: 'jean-ecru', label: 'ecru denim', detail: 'dry cotton. no distress.', shape: 'jeans', tone: 'ecru' },
      { id: 'jean-brown', label: 'brown denim', detail: 'workwear. softer edge.', shape: 'jeans', tone: 'brown' },
      { id: 'jean-grey', label: 'grey denim', detail: 'stone wash. quiet.', shape: 'jeans', tone: 'greyDenim' },
      { id: 'jean-white', label: 'white denim', detail: 'crisp. summer weight.', shape: 'jeans', tone: 'white' },
      { id: 'jean-wide', label: 'wide raw jean', detail: 'fuller leg. low break.', shape: 'jeans', tone: 'rawIndigo' },
      { id: 'jean-straight', label: 'straight blue jean', detail: 'medium wash. daily.', shape: 'jeans', tone: 'washedBlue' },
      { id: 'jean-cord', label: 'cord jean', detail: 'wale texture. autumn.', shape: 'jeans', tone: 'tobacco' },
    ],
  },
  {
    key: 'shoes',
    label: 'shoes',
    deck: 'court shoes, loafers, runners. low profile first.',
    variants: [
      { id: 'shoe-white-court', label: 'white court shoe', detail: 'leather panels. low sole.', shape: 'sneaker', tone: 'white' },
      { id: 'shoe-black-court', label: 'black court shoe', detail: 'quiet sole. no gloss.', shape: 'sneaker', tone: 'black' },
      { id: 'shoe-silver-trainer', label: 'silver trainer', detail: 'technical skin. light sole.', shape: 'sneaker', tone: 'silver' },
      { id: 'shoe-grey-runner', label: 'grey runner', detail: 'suede panels. soft line.', shape: 'sneaker', tone: 'heather' },
      { id: 'shoe-navy-sneaker', label: 'navy sneaker', detail: 'deep blue. gum edge.', shape: 'sneaker', tone: 'navy' },
      { id: 'shoe-brown-suede', label: 'brown suede sneaker', detail: 'matte hide. low cut.', shape: 'sneaker', tone: 'brown' },
      { id: 'shoe-black-loafer', label: 'black loafer', detail: 'single line. polished.', shape: 'loafer', tone: 'black' },
      { id: 'shoe-burgundy-loafer', label: 'burgundy loafer', detail: 'wine leather. narrow.', shape: 'loafer', tone: 'burgundy' },
      { id: 'shoe-tan-loafer', label: 'tan loafer', detail: 'warm leather. soft vamp.', shape: 'loafer', tone: 'tan' },
      { id: 'shoe-cream-slip', label: 'cream slip-on', detail: 'canvas. clean foxing.', shape: 'sneaker', tone: 'cream' },
      { id: 'shoe-gum-sneaker', label: 'gum sole sneaker', detail: 'white upper. amber sole.', shape: 'sneaker', tone: 'gum' },
      { id: 'shoe-canvas-low', label: 'canvas low shoe', detail: 'plain weave. daily.', shape: 'sneaker', tone: 'canvas' },
      { id: 'shoe-dark-trainer', label: 'dark trainer', detail: 'black mesh. spare.', shape: 'sneaker', tone: 'offBlack' },
      { id: 'shoe-white-loafer', label: 'white loafer', detail: 'summer leather. sharp.', shape: 'loafer', tone: 'white' },
    ],
  },
  {
    key: 'accessories',
    label: 'accessories',
    deck: 'belt, cap, bag. one line, then stop.',
    variants: [
      { id: 'accessory-black-belt', label: 'black belt', detail: 'plain leather. small buckle.', shape: 'belt', tone: 'black' },
      { id: 'accessory-brown-belt', label: 'brown belt', detail: 'polished edge. warm.', shape: 'belt', tone: 'brown' },
      { id: 'accessory-tan-belt', label: 'tan belt', detail: 'matte leather. casual.', shape: 'belt', tone: 'tan' },
      { id: 'accessory-silver-belt', label: 'silver buckle belt', detail: 'black strap. bright point.', shape: 'belt', tone: 'silver' },
      { id: 'accessory-white-cap', label: 'white cap', detail: 'cotton twill. low crown.', shape: 'cap', tone: 'white' },
      { id: 'accessory-navy-cap', label: 'navy cap', detail: 'dark crown. clean brim.', shape: 'cap', tone: 'navy' },
      { id: 'accessory-black-cap', label: 'black cap', detail: 'flat black. no mark.', shape: 'cap', tone: 'black' },
      { id: 'accessory-charcoal-beanie', label: 'charcoal beanie', detail: 'rib knit. winter.', shape: 'cap', tone: 'charcoal' },
      { id: 'accessory-canvas-tote', label: 'canvas tote', detail: 'plain cotton. useful.', shape: 'bag', tone: 'canvas' },
      { id: 'accessory-black-pouch', label: 'black pouch', detail: 'nylon. clean zip.', shape: 'bag', tone: 'black' },
      { id: 'accessory-card-case', label: 'brown card case', detail: 'small leather. daily.', shape: 'bag', tone: 'brown' },
      { id: 'accessory-olive-scarf', label: 'olive scarf', detail: 'soft wool. long line.', shape: 'belt', tone: 'olive' },
    ],
  },
  {
    key: 'jackets',
    label: 'jackets',
    deck: 'cotton, leather, wool. the outer line.',
    variants: [
      { id: 'jacket-black-bomber', label: 'black bomber', detail: 'matte shell. close rib.', shape: 'jacket', tone: 'black' },
      { id: 'jacket-denim', label: 'denim jacket', detail: 'mid wash. straight body.', shape: 'jacket', tone: 'washedBlue' },
      { id: 'jacket-raw-denim', label: 'raw denim jacket', detail: 'dark indigo. square cut.', shape: 'jacket', tone: 'rawIndigo' },
      { id: 'jacket-leather', label: 'black leather jacket', detail: 'clean shoulder. low shine.', shape: 'jacket', tone: 'offBlack' },
      { id: 'jacket-suede', label: 'brown suede jacket', detail: 'soft nap. warm edge.', shape: 'jacket', tone: 'brown' },
      { id: 'jacket-chore', label: 'navy chore jacket', detail: 'flat cotton. useful pocket.', shape: 'jacket', tone: 'navy' },
      { id: 'jacket-olive-field', label: 'olive field jacket', detail: 'dry cloth. quiet hardware.', shape: 'jacket', tone: 'olive' },
      { id: 'jacket-charcoal-wool', label: 'charcoal wool jacket', detail: 'short coat. soft structure.', shape: 'jacket', tone: 'charcoal' },
      { id: 'jacket-tan-trucker', label: 'tan trucker', detail: 'canvas body. straight hem.', shape: 'jacket', tone: 'tan' },
      { id: 'jacket-ecru-work', label: 'ecru work jacket', detail: 'dry cotton. pale edge.', shape: 'jacket', tone: 'ecru' },
      { id: 'jacket-tobacco-cord', label: 'tobacco cord jacket', detail: 'wide wale. autumn weight.', shape: 'jacket', tone: 'tobacco' },
      { id: 'jacket-grey-overshirt', label: 'grey overshirt', detail: 'brushed wool. easy layer.', shape: 'jacket', tone: 'heather' },
      { id: 'jacket-burgundy-blouson', label: 'burgundy blouson', detail: 'deep red. compact shape.', shape: 'jacket', tone: 'burgundy' },
      { id: 'jacket-rain', label: 'black rain jacket', detail: 'rubberized cloth. spare.', shape: 'jacket', tone: 'rubber' },
    ],
  },
  {
    key: 'boots',
    label: 'boots',
    deck: 'chelsea, field, lace. leather with weight.',
    variants: [
      { id: 'boot-black-chelsea', label: 'black chelsea', detail: 'brushed leather. clean.', shape: 'boot', tone: 'black' },
      { id: 'boot-brown-chelsea', label: 'brown chelsea', detail: 'warm calf. narrow shaft.', shape: 'boot', tone: 'brown' },
      { id: 'boot-tan-chelsea', label: 'tan chelsea', detail: 'light leather. softer.', shape: 'boot', tone: 'tan' },
      { id: 'boot-charcoal', label: 'charcoal boot', detail: 'dark grey. city sole.', shape: 'boot', tone: 'charcoal' },
      { id: 'boot-field', label: 'field boot', detail: 'heavy tread. quiet hardware.', shape: 'boot', tone: 'field' },
      { id: 'boot-black-lace', label: 'black lace boot', detail: 'tall eyelets. compact.', shape: 'boot', tone: 'black' },
      { id: 'boot-brown-lace', label: 'brown lace boot', detail: 'work boot. polished edge.', shape: 'boot', tone: 'brown' },
      { id: 'boot-lug', label: 'lug sole boot', detail: 'larger volume. winter.', shape: 'boot', tone: 'rubber' },
      { id: 'boot-suede-desert', label: 'suede desert boot', detail: 'sand suede. low ankle.', shape: 'boot', tone: 'tan' },
      { id: 'boot-ecru-desert', label: 'ecru desert boot', detail: 'light upper. crepe line.', shape: 'boot', tone: 'ecru' },
      { id: 'boot-rain', label: 'rubber rain boot', detail: 'matte black. weather.', shape: 'boot', tone: 'rubber' },
      { id: 'boot-hiking', label: 'hiking boot', detail: 'brown leather. ridge sole.', shape: 'boot', tone: 'chocolate' },
      { id: 'boot-ankle', label: 'brushed ankle boot', detail: 'short shaft. clean toe.', shape: 'boot', tone: 'offBlack' },
      { id: 'boot-chocolate', label: 'chocolate boot', detail: 'dark brown. full sole.', shape: 'boot', tone: 'chocolate' },
    ],
  },
];

export const starterTotal = starterCategories.reduce((total, category) => total + category.variants.length, 0);
export const initialStarterSelectionIds = ['tee-optic', 'jean-rinsed', 'shoe-white-court', 'boot-black-chelsea'] as const;

function renderStarterShape(shape: StarterShape, tone: WardrobeTone) {
  const toneStyle = toneStyles[tone];

  if (shape === 'tee') {
    return (
      <View style={styles.teeWrap}>
        <View style={[styles.teeSleeve, styles.teeSleeveLeft, toneStyle]} />
        <View style={[styles.teeSleeve, styles.teeSleeveRight, toneStyle]} />
        <View style={[styles.teeBody, toneStyle]}>
          <View style={styles.neckLine} />
        </View>
      </View>
    );
  }

  if (shape === 'jeans') {
    return (
      <View style={styles.jeansWrap}>
        <View style={[styles.jeansWaist, toneStyle]} />
        <View style={styles.jeansLegs}>
          <View style={[styles.jeansLeg, toneStyle]} />
          <View style={[styles.jeansLeg, toneStyle]} />
        </View>
      </View>
    );
  }

  if (shape === 'boot') {
    return (
      <View style={styles.bootWrap}>
        <View style={[styles.bootShaft, toneStyle]} />
        <View style={[styles.bootFoot, toneStyle]} />
      </View>
    );
  }

  if (shape === 'jacket') {
    return (
      <View style={styles.jacketWrap}>
        <View style={[styles.jacketSleeve, styles.jacketSleeveLeft, toneStyle]} />
        <View style={[styles.jacketSleeve, styles.jacketSleeveRight, toneStyle]} />
        <View style={[styles.jacketBody, toneStyle]}>
          <View style={styles.jacketOpening} />
        </View>
      </View>
    );
  }

  if (shape === 'cap') {
    return (
      <View style={styles.capWrap}>
        <View style={[styles.capCrown, toneStyle]} />
        <View style={[styles.capBrim, toneStyle]} />
      </View>
    );
  }

  if (shape === 'belt') {
    return (
      <View style={styles.beltWrap}>
        <View style={[styles.beltStrap, toneStyle]} />
        <View style={styles.beltBuckle} />
      </View>
    );
  }

  if (shape === 'bag') {
    return (
      <View style={styles.bagWrap}>
        <View style={styles.bagHandle} />
        <View style={[styles.bagBody, toneStyle]} />
      </View>
    );
  }

  return (
    <View style={shape === 'loafer' ? styles.loaferWrap : styles.sneakerWrap}>
      <View style={[styles.shoeUpper, toneStyle]} />
      <View style={styles.shoeSole} />
    </View>
  );
}

export function StarterGarmentImage({
  item,
  size,
  accessible = true,
}: {
  accessible?: boolean;
  item: StarterVariant;
  size: StarterImageSize;
}) {
  const imageStyle =
    size === 'hero'
      ? styles.heroImage
      : size === 'preview'
        ? styles.previewImage
        : size === 'closetHero'
          ? styles.closetHeroImage
          : size === 'closetRail'
            ? styles.closetRailImage
            : styles.variantImage;

  return (
    <View
      accessibilityElementsHidden={!accessible}
      accessibilityLabel={accessible ? `${item.label}, ${item.detail}` : undefined}
      accessible={accessible}
      importantForAccessibility={accessible ? 'auto' : 'no-hide-descendants'}
      style={[imageStyle, styles.garmentFrame, styles.pointerEventsNone]}
    >
      <View style={[styles.shapeStage, shapeStageStyles[size]]}>{renderStarterShape(item.shape, item.tone)}</View>
    </View>
  );
}

export function getStarterCategoryCounts(selectionIds: readonly string[]) {
  const selectedIdSet = new Set(selectionIds);

  return starterCategories.map((category) => ({
    count: category.variants.filter((variant) => selectedIdSet.has(variant.id)).length,
    key: category.key,
    label: category.label,
  }));
}

function getSearchString(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getAudienceFromSearch(value: string | string[] | undefined): StarterAudience {
  const audience = getSearchString(value);
  return audience === 'women' ? 'women' : 'men';
}

function getCategoryFromSearch(value: string | string[] | undefined): StarterCategoryKey | undefined {
  const key = getSearchString(value);
  return starterCategories.some((category) => category.key === key) ? (key as StarterCategoryKey) : undefined;
}

export function getStarterSelectionFromSearch(value: string | string[] | undefined) {
  const selected = getSearchString(value);

  if (!selected) {
    return undefined;
  }

  return selected.split(',').filter(Boolean);
}

function getStarterPackHref({
  audience,
  category,
  selectionIds,
}: {
  audience: StarterAudience;
  category?: StarterCategoryKey;
  selectionIds: readonly string[];
}) {
  const categoryParam = category ? `&category=${category}` : '';
  return `/onboarding/starter-pack?audience=${audience}${categoryParam}&selected=${encodeURIComponent(selectionIds.join(','))}`;
}

function getFoundationReceiptHref(selectionIds: readonly string[]) {
  return `/onboarding/foundation-receipt?selected=${encodeURIComponent(selectionIds.join(','))}`;
}

function toggleSelectionId(selectionIds: readonly string[], id: string) {
  return selectionIds.includes(id) ? selectionIds.filter((selectionId) => selectionId !== id) : [...selectionIds, id];
}

export function StarterPackExplorer({
  continueHref,
  initialSelectedIds = initialStarterSelectionIds,
  onContinue,
  onSelectionsChange,
}: StarterPackExplorerProps) {
  const usesWrappedCategoryRail = Platform.OS === 'web';
  const searchParams = useLocalSearchParams<{ audience?: string; category?: string; selected?: string }>();
  const searchSelectedIds = useMemo(() => getStarterSelectionFromSearch(searchParams.selected), [searchParams.selected]);
  const initialIds = searchSelectedIds ?? initialSelectedIds;
  const [audience, setAudience] = useState<StarterAudience>('men');
  const [activeCategoryKey, setActiveCategoryKey] = useState<StarterCategoryKey | undefined>();
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(() => new Set(initialSelectedIds));
  const effectiveAudience = usesWrappedCategoryRail ? getAudienceFromSearch(searchParams.audience) : audience;
  const effectiveActiveCategoryKey = usesWrappedCategoryRail
    ? getCategoryFromSearch(searchParams.category)
    : activeCategoryKey;
  const effectiveSelectedIds = useMemo(
    () => (usesWrappedCategoryRail ? initialIds : [...selectedIds]),
    [initialIds, selectedIds, usesWrappedCategoryRail],
  );
  const effectiveSelectedSet = useMemo(() => new Set(effectiveSelectedIds), [effectiveSelectedIds]);

  const activeCategory = useMemo(
    () => starterCategories.find((category) => category.key === effectiveActiveCategoryKey),
    [effectiveActiveCategoryKey],
  );

  useEffect(() => {
    if (usesWrappedCategoryRail && searchSelectedIds) {
      onSelectionsChange?.(searchSelectedIds);
    }
  }, [onSelectionsChange, searchSelectedIds, usesWrappedCategoryRail]);

  function toggleVariant(id: string) {
    const next = new Set(selectedIds);

    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }

    setSelectedIds(next);
    onSelectionsChange?.([...next]);
  }

  function selectCategory(key: StarterCategoryKey) {
    setActiveCategoryKey(key);
  }

  function showFoundation() {
    setActiveCategoryKey(undefined);
  }

  return (
    <View style={styles.shell}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>starting point</Text>
          <Text style={styles.headline}>{activeCategory ? activeCategory.label : 'what you already own.'}</Text>
          <Text style={styles.subcaption}>
            {activeCategory ? activeCategory.deck : `${starterTotal} foundation tones. choose the ones that feel familiar.`}
          </Text>
        </View>

        <View style={styles.audienceRail} accessibilityRole="radiogroup">
          {(['men', 'women'] as const).map((audienceOption) =>
            usesWrappedCategoryRail ? (
              <a
                aria-checked={effectiveAudience === audienceOption}
                href={getStarterPackHref({
                  audience: audienceOption,
                  category: effectiveActiveCategoryKey,
                  selectionIds: effectiveSelectedIds,
                })}
                key={audienceOption}
                role="radio"
                style={getWebAudienceButtonStyle(effectiveAudience === audienceOption)}
              >
                <Text style={styles.audienceLabel}>{audienceOption}</Text>
              </a>
            ) : (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: effectiveAudience === audienceOption }}
                key={audienceOption}
                onPress={() => setAudience(audienceOption)}
                style={[styles.audienceButton, effectiveAudience === audienceOption && styles.audienceButtonActive]}
              >
                <Text style={styles.audienceLabel}>{audienceOption}</Text>
              </Pressable>
            ),
          )}
        </View>

        {activeCategory ? (
          <View style={styles.detailNav}>
            {usesWrappedCategoryRail ? (
              <a
                href={getStarterPackHref({ audience: effectiveAudience, selectionIds: effectiveSelectedIds })}
                style={getWebBackStyle()}
              >
                <Text style={styles.backLabel}>foundation ←</Text>
              </a>
            ) : (
              <Pressable accessibilityRole="button" onPress={showFoundation} style={styles.backButton}>
                <Text style={styles.backLabel}>foundation ←</Text>
              </Pressable>
            )}
            <Text style={styles.detailCount}>{activeCategory.variants.length} tones</Text>
          </View>
        ) : null}

        {!activeCategory ? (
          <View style={styles.categoryGrid}>
            {starterCategories.map((category) => {
              const preview = category.variants[0];

              return usesWrappedCategoryRail ? (
                <a
                  aria-label={`${preview.label}, ${preview.detail}. ${category.label}. ${category.variants.length} tones.`}
                  href={getStarterPackHref({
                    audience: effectiveAudience,
                    category: category.key,
                    selectionIds: effectiveSelectedIds,
                  })}
                  key={category.key}
                  role="button"
                  style={getWebCategoryButtonStyle(false)}
                >
                  <StarterGarmentImage accessible={false} item={preview} size="preview" />
                  <View style={styles.categoryCopy}>
                    <Text style={styles.categoryLabel}>{category.label}</Text>
                    <Text style={styles.categoryMeta}>{category.variants.length} tones</Text>
                  </View>
                </a>
              ) : (
                <Pressable
                  accessibilityLabel={`${preview.label}, ${preview.detail}. ${category.label}. ${category.variants.length} tones.`}
                  accessibilityRole="button"
                  key={category.key}
                  onPress={() => selectCategory(category.key)}
                  style={styles.categoryCard}
                >
                  <StarterGarmentImage accessible={false} item={preview} size="preview" />
                  <View style={styles.categoryCopy}>
                    <Text style={styles.categoryLabel}>{category.label}</Text>
                    <Text style={styles.categoryMeta}>{category.variants.length} tones</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View style={styles.variantGrid}>
            {activeCategory.variants.map((variant) => {
              const isSelected = effectiveSelectedSet.has(variant.id);
              const nextSelectionIds = toggleSelectionId(effectiveSelectedIds, variant.id);

              return usesWrappedCategoryRail ? (
                <a
                  aria-checked={isSelected}
                  aria-label={`${variant.label}, ${variant.detail}`}
                  href={getStarterPackHref({
                    audience: effectiveAudience,
                    category: activeCategory.key,
                    selectionIds: nextSelectionIds,
                  })}
                  key={variant.id}
                  role="checkbox"
                  style={getWebVariantButtonStyle(isSelected)}
                >
                  <StarterGarmentImage accessible={false} item={variant} size="variant" />
                  <View style={styles.variantCopy}>
                    <Text style={styles.variantLabel}>{variant.label}</Text>
                    <Text style={styles.variantDetail}>{variant.detail}</Text>
                  </View>
                  {isSelected ? (
                    <View style={[styles.selectedMark, styles.pointerEventsNone]}>
                      <View style={styles.selectedCheck} />
                    </View>
                  ) : null}
                </a>
              ) : (
                <Pressable
                  accessibilityLabel={`${variant.label}, ${variant.detail}`}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSelected }}
                  key={variant.id}
                  onPress={() => toggleVariant(variant.id)}
                  style={[styles.variantCard, isSelected && styles.variantCardSelected]}
                >
                  <StarterGarmentImage accessible={false} item={variant} size="variant" />
                  <View style={styles.variantCopy}>
                    <Text style={styles.variantLabel}>{variant.label}</Text>
                    <Text style={styles.variantDetail}>{variant.detail}</Text>
                  </View>
                  {isSelected ? (
                    <View style={[styles.selectedMark, styles.pointerEventsNone]}>
                      <View style={styles.selectedCheck} />
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View>
          <Text style={styles.footerCount}>{effectiveSelectedSet.size} marked.</Text>
          <Text style={styles.footerMeta}>closet begins here.</Text>
        </View>
        {continueHref ? (
          usesWrappedCategoryRail ? (
            <a href={getFoundationReceiptHref(effectiveSelectedIds)} style={getWebCtaStyle()}>
              <Text style={styles.ctaLabel}>continue →</Text>
            </a>
          ) : (
            <Link
              accessibilityRole="button"
              href={continueHref}
              onPress={() => onContinue([...selectedIds])}
              style={styles.cta}
            >
              <Text style={styles.ctaLabel}>continue →</Text>
            </Link>
          )
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={() => onContinue([...selectedIds])}
            style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
          >
            <Text style={styles.ctaLabel}>continue →</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  content: {
    gap: spacing[5],
    paddingHorizontal: spacing[5],
    paddingTop: spacing[7],
    paddingBottom: sizing.starterFooterHeight,
  },
  header: {
    gap: spacing[2],
  },
  audienceRail: {
    minHeight: sizing.tapTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    borderBottomColor: colors.smoke[200],
    borderBottomWidth: sizing.hairline,
    paddingBottom: spacing[2],
  },
  audienceButton: {
    minHeight: sizing.tapTarget,
    justifyContent: 'center',
    borderColor: colors.smoke[200],
    borderRadius: radius.xs,
    borderWidth: sizing.hairline,
    paddingHorizontal: spacing[4],
  },
  audienceButtonActive: {
    borderColor: colors.ink,
    backgroundColor: colors.bone,
  },
  audienceLabel: {
    color: colors.ink,
    fontFamily: type.families.body,
    fontSize: type.bodyMd.size,
    fontWeight: type.headlineMd.weight,
    lineHeight: type.bodyMd.lineHeight,
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
  categoryRail: {
    gap: spacing[2],
    paddingRight: spacing[5],
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  categoryCard: {
    width: '47%',
    minHeight: sizing.starterDepartmentCardHeight,
    justifyContent: 'space-between',
    borderColor: colors.smoke[200],
    borderRadius: radius.xs,
    borderWidth: sizing.hairline,
    backgroundColor: colors.bone,
    padding: spacing[3],
  },
  categoryCardWrapped: {
    width: '48%',
  },
  categoryCardActive: {
    borderColor: colors.ink,
    backgroundColor: colors.paper,
  },
  previewImage: {
    width: sizing.starterCategoryImage,
    height: sizing.starterCategoryImage,
    alignSelf: 'center',
  },
  garmentFrame: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shapeStage: {
    width: sizing.starterVariantImage,
    height: sizing.starterVariantImage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teeWrap: {
    width: sizing.starterShape.teeWrap.width,
    height: sizing.starterShape.teeWrap.height,
    alignItems: 'center',
  },
  teeSleeve: {
    position: 'absolute',
    top: spacing[2],
    width: sizing.starterShape.teeSleeve.width,
    height: sizing.starterShape.teeSleeve.height,
    borderColor: colors.smoke[500],
    borderWidth: sizing.hairline,
  },
  teeSleeveLeft: {
    left: spacing[1],
    transform: [{ rotate: '-16deg' }],
  },
  teeSleeveRight: {
    right: spacing[1],
    transform: [{ rotate: '16deg' }],
  },
  teeBody: {
    width: sizing.starterShape.teeBody.width,
    height: sizing.starterShape.teeBody.height,
    borderColor: colors.smoke[500],
    borderWidth: sizing.hairline,
  },
  neckLine: {
    alignSelf: 'center',
    width: sizing.starterShape.teeNeck.width,
    height: sizing.starterShape.teeNeck.height,
    borderColor: colors.smoke[500],
    borderBottomWidth: sizing.hairline,
  },
  jeansWrap: {
    width: sizing.starterShape.jeansWrap.width,
    height: sizing.starterShape.jeansWrap.height,
  },
  jeansWaist: {
    height: sizing.starterShape.jeansWaistHeight,
    borderColor: colors.smoke[500],
    borderWidth: sizing.hairline,
  },
  jeansLegs: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing[1],
  },
  jeansLeg: {
    flex: 1,
    borderColor: colors.smoke[500],
    borderWidth: sizing.hairline,
  },
  sneakerWrap: {
    width: sizing.starterShape.sneakerWrap.width,
    height: sizing.starterShape.sneakerWrap.height,
    justifyContent: 'flex-end',
  },
  loaferWrap: {
    width: sizing.starterShape.loaferWrap.width,
    height: sizing.starterShape.loaferWrap.height,
    justifyContent: 'flex-end',
  },
  shoeUpper: {
    height: sizing.starterShape.shoeUpperHeight,
    borderColor: colors.smoke[500],
    borderRadius: radius.xs,
    borderWidth: sizing.hairline,
  },
  shoeSole: {
    height: sizing.starterShape.shoeSoleHeight,
    borderColor: colors.smoke[500],
    borderTopWidth: sizing.hairline,
    backgroundColor: colors.paper,
  },
  bootWrap: {
    width: sizing.starterShape.bootWrap.width,
    height: sizing.starterShape.bootWrap.height,
    justifyContent: 'flex-end',
  },
  bootShaft: {
    width: sizing.starterShape.bootShaft.width,
    height: sizing.starterShape.bootShaft.height,
    borderColor: colors.smoke[500],
    borderWidth: sizing.hairline,
  },
  bootFoot: {
    width: sizing.starterShape.bootFoot.width,
    height: sizing.starterShape.bootFoot.height,
    borderColor: colors.smoke[500],
    borderWidth: sizing.hairline,
  },
  jacketWrap: {
    width: sizing.starterShape.jacketWrap.width,
    height: sizing.starterShape.jacketWrap.height,
    alignItems: 'center',
  },
  jacketSleeve: {
    position: 'absolute',
    top: spacing[2],
    width: sizing.starterShape.jacketSleeve.width,
    height: sizing.starterShape.jacketSleeve.height,
    borderColor: colors.smoke[500],
    borderWidth: sizing.hairline,
  },
  jacketSleeveLeft: {
    left: spacing[1],
    transform: [{ rotate: '12deg' }],
  },
  jacketSleeveRight: {
    right: spacing[1],
    transform: [{ rotate: '-12deg' }],
  },
  jacketBody: {
    width: sizing.starterShape.jacketBody.width,
    height: sizing.starterShape.jacketBody.height,
    borderColor: colors.smoke[500],
    borderWidth: sizing.hairline,
  },
  jacketOpening: {
    alignSelf: 'center',
    width: sizing.starterShape.jacketOpeningWidth,
    height: '100%',
    borderLeftColor: colors.smoke[500],
    borderLeftWidth: sizing.hairline,
  },
  capWrap: {
    width: sizing.starterShape.capWrap.width,
    height: sizing.starterShape.capWrap.height,
    justifyContent: 'flex-end',
  },
  capCrown: {
    alignSelf: 'center',
    width: sizing.starterShape.capCrown.width,
    height: sizing.starterShape.capCrown.height,
    borderColor: colors.smoke[500],
    borderTopLeftRadius: radius.pill,
    borderTopRightRadius: radius.pill,
    borderWidth: sizing.hairline,
  },
  capBrim: {
    width: sizing.starterShape.capBrim.width,
    height: sizing.starterShape.capBrim.height,
    borderColor: colors.smoke[500],
    borderRadius: radius.pill,
    borderWidth: sizing.hairline,
  },
  beltWrap: {
    width: sizing.starterShape.beltWrap.width,
    height: sizing.starterShape.beltWrap.height,
    flexDirection: 'row',
    alignItems: 'center',
  },
  beltStrap: {
    flex: 1,
    height: sizing.starterShape.beltStrapHeight,
    borderColor: colors.smoke[500],
    borderWidth: sizing.hairline,
  },
  beltBuckle: {
    width: sizing.starterShape.beltBuckle.width,
    height: sizing.starterShape.beltBuckle.height,
    borderColor: colors.smoke[500],
    borderWidth: sizing.hairline,
  },
  bagWrap: {
    width: sizing.starterShape.bagWrap.width,
    height: sizing.starterShape.bagWrap.height,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bagHandle: {
    width: sizing.starterShape.bagHandle.width,
    height: sizing.starterShape.bagHandle.height,
    borderColor: colors.smoke[500],
    borderTopLeftRadius: radius.pill,
    borderTopRightRadius: radius.pill,
    borderTopWidth: sizing.hairline,
    borderLeftWidth: sizing.hairline,
    borderRightWidth: sizing.hairline,
  },
  bagBody: {
    width: sizing.starterShape.bagBody.width,
    height: sizing.starterShape.bagBody.height,
    borderColor: colors.smoke[500],
    borderWidth: sizing.hairline,
  },
  categoryCopy: {
    gap: spacing[1],
  },
  categoryLabel: {
    color: colors.ink,
    fontFamily: type.families.body,
    fontSize: type.bodyMd.size,
    fontWeight: type.headlineMd.weight,
    lineHeight: type.bodyMd.lineHeight,
  },
  categoryMeta: {
    color: colors.smoke[300],
    fontFamily: type.families.body,
    fontSize: type.micro.size,
    fontWeight: type.micro.weight,
    letterSpacing: type.micro.letterSpacing,
    lineHeight: type.micro.lineHeight,
  },
  activePanel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[5],
    borderColor: colors.ink,
    borderRadius: radius.xs,
    borderWidth: sizing.hairline,
    backgroundColor: colors.paper,
    padding: spacing[4],
  },
  activeImageFrame: {
    width: sizing.starterHeroImage,
    height: sizing.starterHeroImage,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.smoke[200],
    borderRadius: radius.xs,
    borderWidth: sizing.hairline,
    backgroundColor: colors.bone,
  },
  heroImage: {
    width: sizing.starterHeroImage,
    height: sizing.starterHeroImage,
  },
  closetHeroImage: {
    width: sizing.basicsHeroImage,
    height: sizing.basicsHeroImage,
  },
  closetRailImage: {
    width: sizing.basicsRailImage,
    height: sizing.basicsRailImage,
  },
  activeCopy: {
    flex: 1,
    gap: spacing[2],
  },
  activeLabel: {
    color: colors.ink,
    fontFamily: type.families.displayMagazine,
    fontSize: type.displayMd.size,
    fontStyle: 'italic',
    fontWeight: type.displayMd.weight,
    lineHeight: type.displayMd.lineHeight,
  },
  activeDeck: {
    color: colors.smoke[300],
    fontFamily: type.families.body,
    fontSize: type.bodyMd.size,
    fontWeight: type.bodyMd.weight,
    lineHeight: type.bodyMd.lineHeight,
  },
  variantGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  detailNav: {
    minHeight: sizing.tapTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomColor: colors.smoke[200],
    borderBottomWidth: sizing.hairline,
    paddingBottom: spacing[2],
  },
  backButton: {
    minHeight: sizing.tapTarget,
    justifyContent: 'center',
    paddingRight: spacing[4],
  },
  backLabel: {
    color: colors.ink,
    fontFamily: type.families.body,
    fontSize: type.bodyMd.size,
    fontWeight: type.headlineMd.weight,
    lineHeight: type.bodyMd.lineHeight,
  },
  detailCount: {
    color: colors.smoke[300],
    fontFamily: type.families.body,
    fontSize: type.micro.size,
    fontWeight: type.micro.weight,
    letterSpacing: type.micro.letterSpacing,
    lineHeight: type.micro.lineHeight,
  },
  variantCard: {
    width: '48%',
    minHeight: sizing.starterVariantCardHeight,
    justifyContent: 'space-between',
    borderColor: colors.smoke[200],
    borderRadius: radius.xs,
    borderWidth: sizing.hairline,
    backgroundColor: colors.bone,
    padding: spacing[3],
  },
  variantCardSelected: {
    borderColor: colors.ink,
    backgroundColor: colors.paper,
  },
  variantImage: {
    width: sizing.starterVariantImage,
    height: sizing.starterVariantImage,
    alignSelf: 'center',
  },
  variantCopy: {
    gap: spacing[1],
  },
  variantLabel: {
    color: colors.ink,
    fontFamily: type.families.body,
    fontSize: type.bodyMd.size,
    fontWeight: type.headlineMd.weight,
    lineHeight: type.bodyMd.lineHeight,
  },
  variantDetail: {
    color: colors.smoke[300],
    fontFamily: type.families.body,
    fontSize: type.micro.size,
    fontWeight: type.micro.weight,
    letterSpacing: type.micro.letterSpacing,
    lineHeight: type.micro.lineHeight,
  },
  selectedMark: {
    position: 'absolute',
    top: spacing[3],
    right: spacing[3],
    width: sizing.starterConfirmationDot,
    height: sizing.starterConfirmationDot,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.signal,
  },
  selectedCheck: {
    width: sizing.starterCheckmark.size,
    height: sizing.starterCheckmark.lineHeight,
    borderLeftColor: colors.paper,
    borderBottomColor: colors.paper,
    borderLeftWidth: sizing.starterCheckmark.stroke,
    borderBottomWidth: sizing.starterCheckmark.stroke,
    transform: [{ rotate: '-45deg' }, { translateY: -1 }],
  },
  pointerEventsNone: {
    pointerEvents: 'none',
  },
  footer: {
    minHeight: sizing.starterFooterHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: colors.smoke[200],
    borderTopWidth: sizing.hairline,
    backgroundColor: colors.paper,
    paddingHorizontal: spacing[5],
  },
  footerCount: {
    color: colors.ink,
    fontFamily: type.families.displayMagazine,
    fontSize: type.headlineLg.size,
    fontStyle: 'italic',
    fontWeight: type.displayMd.weight,
    lineHeight: type.headlineLg.lineHeight,
  },
  footerMeta: {
    color: colors.smoke[300],
    fontFamily: type.families.body,
    fontSize: type.micro.size,
    fontWeight: type.micro.weight,
    letterSpacing: type.micro.letterSpacing,
    lineHeight: type.micro.lineHeight,
  },
  cta: {
    minHeight: sizing.tapTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
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

const shapeStageStyles = StyleSheet.create({
  hero: {
    transform: [{ scale: 1.42 }],
  },
  preview: {
    transform: [{ scale: 0.58 }],
  },
  variant: {
    transform: [{ scale: 1 }],
  },
  closetHero: {
    transform: [{ scale: 1.24 }],
  },
  closetRail: {
    transform: [{ scale: 0.76 }],
  },
});

function getWebCategoryButtonStyle(isActive: boolean): CSSProperties {
  return {
    width: '46%',
    minHeight: sizing.starterDepartmentCardHeight,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxSizing: 'border-box',
    gap: spacing[2],
    padding: spacing[3],
    borderRadius: radius.xs,
    borderStyle: 'solid',
    borderWidth: sizing.hairline,
    borderColor: isActive ? colors.ink : colors.smoke[200],
    background: isActive ? colors.paper : colors.bone,
    cursor: 'pointer',
    appearance: 'none',
    WebkitAppearance: 'none',
    color: colors.ink,
    textDecoration: 'none',
    textAlign: 'left',
  };
}

function getWebAudienceButtonStyle(isActive: boolean): CSSProperties {
  return {
    minHeight: sizing.tapTarget,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    paddingInline: spacing[4],
    borderRadius: radius.xs,
    borderStyle: 'solid',
    borderWidth: sizing.hairline,
    borderColor: isActive ? colors.ink : colors.smoke[200],
    background: isActive ? colors.bone : colors.paper,
    cursor: 'pointer',
    color: colors.ink,
    textDecoration: 'none',
  };
}

function getWebBackStyle(): CSSProperties {
  return {
    minHeight: sizing.tapTarget,
    display: 'flex',
    alignItems: 'center',
    paddingRight: spacing[4],
    color: colors.ink,
    textDecoration: 'none',
  };
}

function getWebVariantButtonStyle(isSelected: boolean): CSSProperties {
  return {
    width: '46%',
    minHeight: sizing.starterVariantCardHeight,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxSizing: 'border-box',
    gap: spacing[2],
    padding: spacing[3],
    position: 'relative',
    borderRadius: radius.xs,
    borderStyle: 'solid',
    borderWidth: sizing.hairline,
    borderColor: isSelected ? colors.ink : colors.smoke[200],
    background: isSelected ? colors.paper : colors.bone,
    cursor: 'pointer',
    appearance: 'none',
    WebkitAppearance: 'none',
    color: colors.ink,
    textDecoration: 'none',
    textAlign: 'left',
  };
}

function getWebCtaStyle(): CSSProperties {
  return {
    minHeight: sizing.tapTarget,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingInline: spacing[4],
    color: colors.ink,
    textDecoration: 'none',
  };
}

const toneStyles = StyleSheet.create({
  optic: {
    backgroundColor: wardrobeTones.optic,
  },
  white: {
    backgroundColor: wardrobeTones.white,
  },
  black: {
    backgroundColor: wardrobeTones.black,
  },
  offBlack: {
    backgroundColor: wardrobeTones.offBlack,
  },
  bone: {
    backgroundColor: wardrobeTones.bone,
  },
  cream: {
    backgroundColor: wardrobeTones.cream,
  },
  heather: {
    backgroundColor: wardrobeTones.heather,
  },
  charcoal: {
    backgroundColor: wardrobeTones.charcoal,
  },
  navy: {
    backgroundColor: wardrobeTones.navy,
  },
  tobacco: {
    backgroundColor: wardrobeTones.tobacco,
  },
  olive: {
    backgroundColor: wardrobeTones.olive,
  },
  burgundy: {
    backgroundColor: wardrobeTones.burgundy,
  },
  sky: {
    backgroundColor: wardrobeTones.sky,
  },
  steel: {
    backgroundColor: wardrobeTones.steel,
  },
  washedRed: {
    backgroundColor: wardrobeTones.washedRed,
  },
  rawIndigo: {
    backgroundColor: wardrobeTones.rawIndigo,
  },
  indigo: {
    backgroundColor: wardrobeTones.indigo,
  },
  washedBlue: {
    backgroundColor: wardrobeTones.washedBlue,
  },
  paleDenim: {
    backgroundColor: wardrobeTones.paleDenim,
  },
  greyDenim: {
    backgroundColor: wardrobeTones.greyDenim,
  },
  ecru: {
    backgroundColor: wardrobeTones.ecru,
  },
  brown: {
    backgroundColor: wardrobeTones.brown,
  },
  chocolate: {
    backgroundColor: wardrobeTones.chocolate,
  },
  tan: {
    backgroundColor: wardrobeTones.tan,
  },
  silver: {
    backgroundColor: wardrobeTones.silver,
  },
  gum: {
    backgroundColor: wardrobeTones.gum,
  },
  canvas: {
    backgroundColor: wardrobeTones.canvas,
  },
  field: {
    backgroundColor: wardrobeTones.field,
  },
  rubber: {
    backgroundColor: wardrobeTones.rubber,
  },
});
