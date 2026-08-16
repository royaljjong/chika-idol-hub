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

export const ChikaMember = z.object({
  id: z.string(),
  groupId: z.string(),
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
  memberColor: z.string().default('#FFFFFF'),
  memberColorName: LocalizedText,
  imageUrl: z.string().url().nullable().default(null),
  x: z.string().url().nullable().default(null),
  instagram: z.string().url().nullable().default(null),
  tiktok: z.string().url().nullable().default(null),
  showroom: z.string().url().nullable().default(null),
  cheki: z.string().url().nullable().default(null),
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
  description: LocalizedText,
  logoUrl: z.string().url().nullable().default(null),
  bannerUrl: z.string().url().nullable().default(null),
  officialSite: z.string().url().nullable().default(null),
  ticketUrl: z.string().url().nullable().default(null),
  chekiUrl: z.string().url().nullable().default(null),
  scheduleUrl: z.string().url().nullable().default(null),
  x: z.string().url().nullable().default(null),
  instagram: z.string().url().nullable().default(null),
  tiktok: z.string().url().nullable().default(null),
  youtube: z.string().url().nullable().default(null),
  members: z.array(ChikaMember).default([]),
});
export type ChikaGroup = z.infer<typeof ChikaGroup>;
