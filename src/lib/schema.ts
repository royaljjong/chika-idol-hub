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
  sourceKind: z.enum(['official_site', 'official_sns', 'ticket_platform', 'venue_official', 'agency']),
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
  activityStatus: z.enum(['active', 'hiatus', 'former', 'unknown']).optional(),
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
  memberColorBasis: z.enum(['official_hex', 'official_name_approximation', 'unverified']).optional(),
  memberMotif: LocalizedText.nullable().optional(),
  imageUrl: z.string().nullable().default(null),
  imageKind: z.enum(['official', 'placeholder']).optional(),
  imageRightsStatus: z.enum(['official_embed', 'permission_confirmed', 'link_only']).nullable().optional(),
  imageSourceUrl: z.string().url().nullable().optional(),
  imageCheckedAt: z.string().nullable().optional(),
  birthDate: z.string().nullable().default(null), // YYYY-MM-DD
  birthMonthDay: z.string().regex(/^\d{2}-\d{2}$/).nullable().optional(), // MM-DD when official source withholds year
  birthplace: LocalizedText.nullable().default(null),
  nickname: LocalizedText.nullable().default(null),
  xFollowers: z.number().optional().default(0),
  igFollowers: z.number().optional().default(0),
  popularityScore: z.number().min(0).max(100).optional(),
  searchVolumeScore: z.number().min(0).max(100).optional(),
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
  region: RegionId,
  district: DistrictId,
  color: z.string(),
  accentColor: z.string(),
  debutYear: z.number(),
  activityStatus: z.enum(['active', 'hiatus', 'ended']).optional(),
  endedAt: z.string().nullable().optional(),
  description: LocalizedText,
  imageUrl: z.string().nullable().default(null),
  imageKind: z.enum(['official_photo', 'official_logo', 'text_wordmark', 'placeholder']).optional(),
  imageRightsStatus: z.enum(['official_embed', 'permission_confirmed', 'link_only']).nullable().optional(),
  imageSourceUrl: z.string().url().nullable().optional(),
  imageCheckedAt: z.string().nullable().optional(),
  officialSite: z.string().url().nullable().default(null),
  ticketUrl: z.string().url().nullable().default(null),
  chekiUrl: z.string().url().nullable().default(null),
  scheduleUrl: z.string().url().nullable().default(null),
  x: z.string().url().nullable().default(null),
  instagram: z.string().url().nullable().default(null),
  tiktok: z.string().url().nullable().default(null),
  youtube: z.string().url().nullable().default(null),
  xFollowers: z.number().optional(),
  popularityScore: z.number().min(0).max(100).optional(),
  searchVolumeScore: z.number().min(0).max(100).optional(),
  subUnits: z.array(SubUnit).default([]),
  members: z.array(ChikaMember).default([]),
  coverageStatus: z.enum(['complete', 'partial', 'collecting']).optional(),
  rosterCheckedAt: z.string().nullable().optional(),
  officialMemberCount: z.number().int().nonnegative().nullable().optional(),
  locationBasis: z.enum(['official_concept', 'official_home_base', 'regional_identity', 'unverified']).optional(),
  areaEvidence: z.array(z.object({
    areaId: z.string(),
    relation: z.enum(['official_base', 'agency_location', 'recurring_activity', 'verified_event_history']),
    sourceUrl: z.string().url(),
    checkedAt: z.string(),
  })).optional(),
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

export const ImageCandidate = z.object({
  id: z.string(),
  subjectType: z.enum(['group', 'member']),
  subjectId: z.string(),
  assetKind: z.enum(['group_photo', 'member_photo', 'logo']),
  officialPageUrl: z.string().url(),
  rightsPolicyUrl: z.string().url().nullable().default(null),
  permissionContactUrl: z.string().url().nullable().default(null),
  assetUrl: z.string().url().nullable().default(null),
  rightsStatus: z.enum(['official_embed', 'permission_confirmed', 'link_only']),
  reviewStatus: z.enum(['discovered', 'rights_review', 'approved', 'rejected']),
  checkedAt: z.string(),
  blocker: z.string().nullable().default(null),
});
export type ImageCandidate = z.infer<typeof ImageCandidate>;
export const ImageCandidateDataset = z.object({ generatedAt: z.string(), candidates: z.array(ImageCandidate) });

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
  checkedAt: z.string(),
  sourceUrl: z.string().url(),
  contentType: z.enum(['magazine', 'photobook', 'digital', 'video']).optional(),
  rightsStatus: z.enum(['official_embed', 'permission_confirmed', 'link_only']),
  agency: z.string().optional(),
  gallery: z.array(z.object({
    imageUrl: z.string().url(),
    postUrl: z.string().url(),
    checkedAt: z.string(),
    rightsStatus: z.enum(['official_embed', 'permission_confirmed']),
  })).max(10).optional(),
});
export type GravureFeature = z.infer<typeof GravureFeature>;

export const GravureCandidate = z.object({
  id: z.string(),
  sourceKey: z.string(),
  sourceUrl: z.string().url(),
  checkedAt: z.string(),
  personNameJa: z.string(),
  memberId: z.string().nullable().default(null),
  groupNameJa: z.string().nullable().default(null),
  titleJa: z.string(),
  publication: z.string().nullable().default(null),
  releaseDate: z.string().nullable().default(null),
  contentType: z.enum(['magazine', 'photobook', 'digital', 'video', 'event']),
  officialProductUrl: z.string().url().nullable().default(null),
  rightsStatus: z.literal('link_only').default('link_only'),
  reviewStatus: z.enum(['discovered', 'review_pending', 'ready_for_publish', 'published', 'rejected']).default('discovered'),
  publishedFeatureId: z.string().nullable().default(null),
  blocker: z.string().nullable().default(null),
});
export type GravureCandidate = z.infer<typeof GravureCandidate>;

export const GravureCandidateDataset = z.object({
  generatedAt: z.string(),
  candidates: z.array(GravureCandidate),
});
export type GravureCandidateDataset = z.infer<typeof GravureCandidateDataset>;

export const ChikaVenue = z.object({
  id: z.string(),
  name: LocalizedText,
  region: RegionId,
  district: DistrictId,
  address: LocalizedText,
  googleMapsUrl: z.string().url(),
  geoAreaId: z.string().nullable().default(null),
  latitude: z.number().min(-90).max(90).nullable().default(null),
  longitude: z.number().min(-180).max(180).nullable().default(null),
  coordinateProvenance: SourceRecord.nullable().default(null),
  provenance: SourceRecord,
});

export const GeoArea = z.object({
  id: z.string(),
  parentId: z.string().nullable().default(null),
  level: z.enum(['country', 'prefecture', 'municipality', 'ward', 'activity_zone']),
  name: LocalizedText,
  center: z.object({ latitude: z.number(), longitude: z.number() }).nullable().default(null),
  boundingBox: z.tuple([z.number(), z.number(), z.number(), z.number()]).nullable().default(null),
  boundaryUrl: z.string().url().nullable().default(null),
  verificationStatus: z.enum(['identity_verified', 'map_ready']),
  provenance: SourceRecord,
});
export type GeoArea = z.infer<typeof GeoArea>;

export const GeoAreaDataset = z.object({
  generatedAt: z.string(),
  areas: z.array(GeoArea),
});
export type GeoAreaDataset = z.infer<typeof GeoAreaDataset>;

export const ChikaLiveEvent = z.object({
  id: z.string(),
  groupIds: z.array(z.string()).min(1),
  title: LocalizedText,
  startsOn: z.string(),
  endsOn: z.string().nullable().default(null),
  startsAt: z.string().nullable().default(null),
  opensAt: z.string().nullable(),
  timeStatus: z.enum(['confirmed', 'tba']),
  venueId: z.string().nullable().default(null),
  region: RegionId,
  areaLabel: LocalizedText,
  posterUrl: z.string().url().nullable(),
  price: LocalizedText.nullable(),
  ticketUrl: z.string().url().nullable(),
  officialUrl: z.string().url(),
  status: z.enum(['scheduled', 'sold_out', 'canceled', 'postponed']),
  provenance: SourceRecord,
});
export type ChikaLiveEvent = z.infer<typeof ChikaLiveEvent>;
export type ChikaVenue = z.infer<typeof ChikaVenue>;

export const ChikaLiveDataset = z.object({
  generatedAt: z.string(),
  venues: z.array(ChikaVenue),
  events: z.array(ChikaLiveEvent),
});
export type ChikaLiveDataset = z.infer<typeof ChikaLiveDataset>;

export const LiveEventCandidate = z.object({
  id: z.string(),
  sourceKey: z.string().default('title-mitei-calendar'),
  sourceEventId: z.string(),
  groupId: z.string(),
  reviewStatus: z.enum(['review_pending', 'approved', 'rejected', 'published']),
  candidateKind: z.enum(['live_or_event', 'birthday', 'release_or_media', 'unknown']),
  publishedEventId: z.string().nullable().default(null),
  title: z.string(),
  startsOn: z.string(),
  endsOn: z.string().nullable(),
  timeText: z.string().nullable(),
  locationText: z.string().nullable(),
  ticketUrls: z.array(z.string().url()),
  officialPageUrl: z.string().url(),
  sourceUrl: z.string().url(),
  collectedAt: z.string(),
});
export type LiveEventCandidate = z.infer<typeof LiveEventCandidate>;

export const LiveEventCandidateDataset = z.object({
  generatedAt: z.string(),
  sources: z.array(z.object({
    key: z.string(),
    groupId: z.string(),
    officialPageUrl: z.string().url(),
    feedUrl: z.string().url(),
    lastCollectedAt: z.string(),
    contentHash: z.string(),
    candidateCount: z.number().int().nonnegative(),
  })),
  candidates: z.array(LiveEventCandidate),
});
export type LiveEventCandidateDataset = z.infer<typeof LiveEventCandidateDataset>;

export const DiscoverySourceCatalog = z.object({
  generatedAt: z.string(),
  sources: z.array(z.object({
    key: z.string(),
    name: z.string(),
    baseUrl: z.string().url(),
    role: z.enum(['discovery', 'official_profile', 'official_schedule', 'ticket', 'venue', 'publisher', 'official_sales']),
    trustTier: z.enum(['discovery_only', 'primary', 'secondary']),
    accessStatus: z.enum(['available', 'security_checkpoint', 'robots_blocked', 'manual_only']),
    entityKinds: z.array(z.enum(['group', 'member', 'live', 'venue', 'gravure'])).min(1),
    fields: z.array(z.string()),
    usePolicy: z.string(),
    checkedAt: z.string(),
  })),
  entityCandidates: z.array(z.object({
    id: z.string(),
    kind: z.enum(['group', 'member', 'live', 'venue', 'gravure']),
    nameJa: z.string(),
    parentNameJa: z.string().nullable().default(null),
    discoverySourceKey: z.string(),
    discoveryUrl: z.string().url(),
    officialUrls: z.array(z.object({
      url: z.string().url(),
      kind: z.enum(['official_site', 'agency', 'official_sns', 'official_schedule', 'ticket', 'venue', 'publisher', 'official_store']),
      status: z.enum(['pending', 'verified', 'rejected']),
      checkedAt: z.string().nullable(),
    })),
    reviewStatus: z.enum(['discovered', 'official_source_found', 'ready_for_review', 'rejected', 'imported']),
    importedEntityId: z.string().nullable().default(null),
    scopeFit: z.enum(['core', 'boundary', 'out_of_scope', 'unreviewed']),
    notes: z.string(),
  })),
});
export type DiscoverySourceCatalog = z.infer<typeof DiscoverySourceCatalog>;
