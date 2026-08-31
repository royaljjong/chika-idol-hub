import fs from 'node:fs';
import path from 'node:path';
import { isDistrictInRegion } from '../src/lib/geo-contract';
import { ChikaDataset, ChikaMember } from '../src/lib/schema';

const groups = ChikaDataset.parse(JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'chika-groups.json'), 'utf8')));
const failures: string[] = [];

for (const group of groups) {
  if (!isDistrictInRegion(group.region, group.district)) failures.push(`${group.id}: invalid region/district pair`);
  for (const member of group.members) {
    const hasMetricValue = member.popularityScore !== undefined || member.searchVolumeScore !== undefined || member.xFollowers > 0 || member.igFollowers > 0;
    const hasCompleteProvenance = Boolean(member.metricsVerifiedAt && member.metricsSourceUrl);
    if (hasMetricValue && !hasCompleteProvenance) failures.push(`${member.id}: unverified ranking metric`);
  }
}

if (isDistrictInRegion('osaka', 'shibuya')) failures.push('cross-region district guard accepted osaka/shibuya');
if (!isDistrictInRegion('osaka', 'namba')) failures.push('valid region/district pair rejected osaka/namba');

const minimalMember = ChikaMember.parse({
  id: 'contract-probe',
  groupId: 'contract-probe-group',
  name: { ja: { kanji: '検証', kana: 'けんしょう' }, ko: { hangul: '검증' }, en: { romaji: 'Probe' } },
  memberColor: '#9CA3AF',
  memberColorName: { ja: '未確認', ko: '미확인', en: 'Unverified' },
  memberColorBasis: 'unverified',
  birthMonthDay: '01-01',
  activityStatus: 'active',
});
if (minimalMember.popularityScore !== undefined || minimalMember.searchVolumeScore !== undefined) {
  failures.push('member schema injected synthetic ranking scores');
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`OK: parameter contracts (${groups.length} groups)`);
