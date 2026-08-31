import type { DistrictId, RegionId } from './schema';

export const REGION_DISTRICTS: Record<RegionId, readonly DistrictId[]> = {
  tokyo: ['shibuya', 'harajuku', 'akihabara', 'shinjuku', 'ikebukuro', 'roppongi', 'general'],
  osaka: ['namba', 'umeda', 'general'],
  sapporo: ['susukino', 'general'],
  nagoya: ['sakae', 'general'],
  fukuoka: ['tenjin', 'general'],
  other: ['general'],
};

export function isDistrictInRegion(region: RegionId, district: DistrictId) {
  return REGION_DISTRICTS[region].includes(district);
}
