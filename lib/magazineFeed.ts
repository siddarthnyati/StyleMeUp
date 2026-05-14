import { useQuery } from '@tanstack/react-query';

import { magazineIssue, type MagazineIssue, type MagazineSurface } from '@/lib/magazineIssue';
import type { GarmentKind } from '@/components/GarmentTile/GarmentTile';

const DEFAULT_API_URL = 'https://the-edit-lime.vercel.app';
const VALID_KINDS = new Set<GarmentKind>([
  'tee',
  'oxford',
  'denim',
  'sneaker',
  'boot',
  'jacket',
  'trouser',
  'skirt',
  'cap',
]);

function apiUrl() {
  const root = process.env.EXPO_PUBLIC_THE_EDIT_API_URL || DEFAULT_API_URL;
  return `${root.replace(/\/$/, '')}/api/issues/latest`;
}

function normalizeKind(kind: unknown): GarmentKind {
  return typeof kind === 'string' && VALID_KINDS.has(kind as GarmentKind) ? (kind as GarmentKind) : 'jacket';
}

function normalizeSurface(surface: Partial<MagazineSurface>, fallback: MagazineSurface): MagazineSurface {
  return {
    baseSelectionIds: Array.isArray(surface.baseSelectionIds) ? surface.baseSelectionIds : fallback.baseSelectionIds,
    body: surface.body || fallback.body,
    deck: surface.deck || fallback.deck,
    eyebrow: surface.eyebrow || fallback.eyebrow,
    headline: surface.headline || fallback.headline,
    history: surface.history,
    imagePath: surface.imagePath,
    imageUrl: surface.imageUrl,
    kind: normalizeKind(surface.kind),
    section: surface.section || fallback.section,
    slug: surface.slug || fallback.slug,
    sourceSummary: surface.sourceSummary,
    whyNow: surface.whyNow,
  };
}

function normalizeIssue(raw: Partial<MagazineIssue>): MagazineIssue {
  const cover = normalizeSurface(raw.cover ?? {}, magazineIssue.cover);
  const trendCards = Array.isArray(raw.trendCards)
    ? raw.trendCards.map((surface, index) => normalizeSurface(surface, magazineIssue.surfaces[index + 1] ?? magazineIssue.cover))
    : magazineIssue.surfaces.filter((surface) => surface.section === 'trend');
  const curatorCards = Array.isArray(raw.curatorCards)
    ? raw.curatorCards.map((surface, index) => normalizeSurface(surface, magazineIssue.surfaces[index + 4] ?? magazineIssue.cover))
    : magazineIssue.surfaces.filter((surface) => surface.section === 'curator');

  return {
    audiencePersona: raw.audiencePersona || magazineIssue.audiencePersona,
    cover,
    curatorCards,
    history: raw.history,
    publishDate: raw.publishDate || magazineIssue.publishDate,
    slug: raw.slug || cover.slug,
    sourceCount: raw.sourceCount,
    sourceSummary: raw.sourceSummary,
    title: raw.title || cover.headline,
    trend: raw.trend || magazineIssue.trend,
    trendCards,
    volume: Number(raw.volume ?? magazineIssue.volume),
    whyNow: raw.whyNow,
    surfaces: [cover, ...trendCards, ...curatorCards],
  };
}

export async function fetchLatestMagazineIssue(): Promise<MagazineIssue> {
  const response = await fetch(apiUrl(), { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`Magazine issue fetch failed: ${response.status}`);
  }

  const payload = await response.json();
  return normalizeIssue(payload.issue ?? {});
}

export function useLatestMagazineIssue() {
  return useQuery({
    queryKey: ['magazine', 'latest-issue'],
    queryFn: fetchLatestMagazineIssue,
    retry: 1,
    staleTime: 1000 * 60 * 15,
  });
}

export function issueWithFallback(issue: MagazineIssue | undefined): MagazineIssue {
  return issue ?? magazineIssue;
}

export function isNewMagazineIssue(issue: MagazineIssue | undefined, seenSlug: string | null): issue is MagazineIssue {
  return Boolean(issue && issue.slug !== magazineIssue.slug && issue.slug !== seenSlug);
}

export function findMagazineSurface(issue: MagazineIssue, slug: string | undefined): MagazineSurface {
  return issue.surfaces.find((surface) => surface.slug === slug) ?? issue.cover;
}
