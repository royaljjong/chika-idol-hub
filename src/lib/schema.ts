import { z } from 'zod';

export const LocalizedText = z.object({
  ja: z.string(),
  ko: z.string(),
  en: z.string(),
});
export type LocalizedText = z.infer<typeof LocalizedText>;

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
  'other',
]);
export type LinkType = z.infer<typeof LinkType>;

export const IdolLink = z.object({
  type: LinkType,
  url: z.string().url(),
  label: LocalizedText,
  verified: z.boolean().default(true),
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
  imageUrl: z.string().url().nullable().default(null),
  birthDate: z.string().nullable().default(null),
  birthplace: LocalizedText.nullable().default(null),
  nickname: LocalizedText.nullable().default(null),
  links: z.array(IdolLink).default([]),
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
});
export type ChikaGroup = z.infer<typeof ChikaGroup>;
