import { z } from 'zod';

export const LocalizedText = z.object({
  ja: z.string(),
  ko: z.string(),
  en: z.string(),
});
export type LocalizedText = z.infer<typeof LocalizedText>;

export const SourceRecord = z.object({
  sourceUrl: z.string().url(),
  checkedAt: z.string(),
  sourceKind: z.enum(['official_site', 'official_sns', 'ticket_platform', 'venue_official']),
});

export const RegionId = z.enum([
  'tokyo',
  'osaka',
  'sapporo',
  'nagoya',
  'fukuoka',
  'other',
]);
export type RegionId = z.infer<typeof RegionId>;

export const DistrictId = z.enum([
  'shibuya',
  'harajuku',
  'akihabara',
  'shinjuku',
  'ikebukuro',
  'roppongi',
  'namba',
  'umeda',
  'susukino',
  'sakae',
  'tenjin',
  'general',
]);
export type DistrictId = z.infer<typeof DistrictId>;

export const LinkType = z.enum([
  'official_profile',
  'official_blog',
  'twitter',
  'x',
  'instagram',
  'tiktok',
  'youtube',
  'showroom',
  'ticket',
  'cheki',
  'store',
  'gravure',
  'other',
]);
export type LinkType = z.infer<typeof LinkType>;

export const IdolLink = z.object({
  type: LinkType,
  url: z.string().url(),
  label: LocalizedText,
  verified: z.boolean().default(true),
  checkedAt: z.string().nullable().optional(),
  sourceUrl: z.string().url().nullable().optional(),
  isPrimary: z.boolean().default(false),
});
export type IdolLink = z.infer<typeof IdolLink>;

export const SubUnit = z.object({
  id: z.string(),
  name: LocalizedText,
  debutYear: z.number(),
  description: LocalizedText,
  ticketUrl: z.string().url().nullable().default(null),
  chekiUrl: z.string().url().nullable().default(null),
});
export type SubUnit = z.infer<typeof SubUnit>;

export const ChikaMember = z.object({
  id: z.string(),
  groupId: z.string(),
  subUnitId: z.string().default(''),
  name: z.object({
    ja: z.object({
      kanji: z.string(),
      kana: z.string(),
    }),
    ko: z.object({
      hangul: z.string(),
    }),
    en: z.object({
      romaji: z.string(),
    }),
  }),
  memberColor: z.string().default('#FF2E7E'),
  memberColorName: LocalizedText,
  imageUrl: z.string().nullable().default(null),
  imageKind: z.enum(['official', 'placeholder']).optional(),
  birthDate: z.string().nullable().default(null), // YYYY-MM-DD
  birthplace: LocalizedText.nullable().default(null),
  nickname: LocalizedText.nullable().default(null),
  xFollowers: z.number().optional().default(0),
  igFollowers: z.number().optional().default(0),
  popularityScore: z.number().optional().default(85), // 인기 지수 (0-100)
  searchVolumeScore: z.number().optional().default(80), // 검색량/트렌드 지수 (0-100)
  metricsVerifiedAt: z.string().nullable().optional(),
  metricsSourceUrl: z.string().url().nullable().optional(),
  isGravureActive: z.boolean().optional().default(false),
  gravureHighlights: z.array(z.string()).optional().default([]),
  links: z.array(IdolLink).default([]),
  provenance: SourceRecord.optional(),
});
export type ChikaMember = z.infer<typeof ChikaMember>;

export const ChikaGroup = z.object({
  id: z.string(),
  name: LocalizedText,
  shortName: LocalizedText,
  agency: z.string(),
  region: z.string(),
  district: z.string(),
  color: z.string(),
  accentColor: z.string(),
  debutYear: z.number(),
  description: LocalizedText,
  imageUrl: z.string().nullable().default(null),
  xFollowers: z.number().optional().default(0),
  popularityScore: z.number().optional().default(90),
  searchVolumeScore: z.number().optional().default(85),
  officialSite: z.string().url().nullable().default(null),
  ticketUrl: z.string().url().nullable().default(null),
  chekiUrl: z.string().url().nullable().default(null),
  scheduleUrl: z.string().url().nullable().default(null),
  x: z.string().url().nullable().default(null),
  instagram: z.string().url().nullable().default(null),
  tiktok: z.string().url().nullable().default(null),
  youtube: z.string().url().nullable().default(null),
  subUnits: z.array(SubUnit).default([]),
  members: z.array(ChikaMember).default([]),
  coverageStatus: z.enum(['complete', 'partial', 'collecting']).optional(),
  provenance: SourceRecord.optional(),
});
export type ChikaGroup = z.infer<typeof ChikaGroup>;

export const ChikaDataset = z.array(ChikaGroup);

export const MetricSnapshot = z.object({
  id: z.string(),
  scope: z.enum(['group', 'member']),
  subjectId: z.string(),
  metric: z.enum(['x_followers', 'instagram_followers', 'google_trends_index']),
  platform: z.enum(['x', 'instagram', 'google_trends']),
  value: z.number().nonnegative(),
  collectedOn: z.string(),
  sourceUrl: z.string().url(),
});
export type MetricSnapshot = z.infer<typeof MetricSnapshot>;
export const MetricDataset = z.object({ generatedAt: z.string(), snapshots: z.array(MetricSnapshot) });

// 오시라세 (공지사항 / 뉴스 / 라이브 속보)
export const ChikaNotice = z.object({
  id: z.string(),
  groupId: z.string(),
  groupName: LocalizedText,
  title: LocalizedText,
  category: z.enum(['live', 'release', 'media', 'gravure', 'announcement']),
  date: z.string(), // YYYY-MM-DD
  badge: LocalizedText,
  summary: LocalizedText,
  url: z.string().url().nullable().default(null),
  checkedAt: z.string().nullable().optional(),
  sourceUrl: z.string().url().nullable().optional(),
});
export type ChikaNotice = z.infer<typeof ChikaNotice>;

const stringOrLocalized = z.union([z.string(), LocalizedText]);

// 그라비아 & 비주얼 화보 피처
export const GravureFeature = z.object({
  id: z.string(),
  memberId: z.string(),
  memberName: z.object({
    ja: z.string(),
    ko: z.string(),
    en: z.string(),
  }),
  groupId: z.string(),
  groupName: LocalizedText,
  title: LocalizedText,
  magazine: stringOrLocalized,
  releaseDate: z.string(), // YYYY-MM-DD
  imageUrl: z.string().nullable().default(null),
  url: z.string().url().nullable().default(null),
  checkedAt: z.string().nullable().optional(),
  sourceUrl: z.string().url().nullable().optional(),
  contentType: z.enum(['magazine', 'photobook', 'digital', 'video']).optional(),
  rightsStatus: z.enum(['official_embed', 'permission_confirmed', 'link_only']).optional(),
});
export type GravureFeature = z.infer<typeof GravureFeature>;

export const ChikaVenue = z.object({
  id: z.string(),
  name: LocalizedText,
  region: RegionId,
  district: DistrictId,
  address: LocalizedText,
  googleMapsUrl: z.string().url(),
  provenance: SourceRecord,
});

export const ChikaLiveEvent = z.object({
  id: z.string(),
  groupIds: z.array(z.string()).min(1),
  title: LocalizedText,
  startsAt: z.string(),
  opensAt: z.string().nullable(),
  venueId: z.string(),
  posterUrl: z.string().url().nullable(),
  price: LocalizedText.nullable(),
  ticketUrl: z.string().url().nullable(),
  officialUrl: z.string().url(),
  status: z.enum(['scheduled', 'sold_out', 'canceled', 'postponed']),
  provenance: SourceRecord,
});

export const ChikaLiveDataset = z.object({
  generatedAt: z.string(),
  venues: z.array(ChikaVenue),
  events: z.array(ChikaLiveEvent),
});
export type ChikaLiveDataset = z.infer<typeof ChikaLiveDataset>;
