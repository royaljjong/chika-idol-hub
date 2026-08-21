import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { ChikaDataset, ChikaLiveDataset, ChikaNotice, GravureFeature, MetricDataset } from '../src/lib/schema';

const dataDir = path.join(process.cwd(), 'data');
const groups = ChikaDataset.parse(JSON.parse(fs.readFileSync(path.join(dataDir, 'chika-groups.json'), 'utf8')));
const notices = z.array(ChikaNotice).parse(JSON.parse(fs.readFileSync(path.join(dataDir, 'chika-notices.json'), 'utf8')));
const gravures = z.array(GravureFeature).parse(JSON.parse(fs.readFileSync(path.join(dataDir, 'chika-gravure.json'), 'utf8')));
const live = ChikaLiveDataset.parse(JSON.parse(fs.readFileSync(path.join(dataDir, 'chika-live.json'), 'utf8')));
const metrics = MetricDataset.parse(JSON.parse(fs.readFileSync(path.join(dataDir, 'chika-metrics.json'), 'utf8')));

const errors: string[] = [];
const warnings: string[] = [];
const groupIds = new Set(groups.map((group) => group.id));
const memberIds = new Set<string>();

for (const group of groups) {
  if (group.activityStatus === 'ended' && !group.endedAt) errors.push(`${group.id}: ended group missing endedAt`);
  if (group.activityStatus !== 'ended' && group.endedAt) errors.push(`${group.id}: non-ended group has endedAt`);
  if (group.coverageStatus === 'complete' && !group.provenance) errors.push(`${group.id}: complete coverage missing provenance`);
  if (group.coverageStatus === 'complete' && group.officialMemberCount !== group.members.filter((member) => (member.activityStatus ?? 'active') === 'active').length) errors.push(`${group.id}: complete coverage member count mismatch`);
  if (group.officialMemberCount != null && !group.rosterCheckedAt) errors.push(`${group.id}: official member count missing rosterCheckedAt`);
  if (!group.provenance) warnings.push(`${group.id}: group provenance missing`);
  for (const member of group.members) {
    if (memberIds.has(member.id)) errors.push(`duplicate member id: ${member.id}`);
    memberIds.add(member.id);
    if (member.groupId !== group.id) errors.push(`${member.id}: groupId mismatch`);
    if (!member.provenance) warnings.push(`${member.id}: member provenance missing`);
    if ((member.popularityScore || member.searchVolumeScore || member.xFollowers || member.igFollowers) && (!member.metricsVerifiedAt || !member.metricsSourceUrl)) {
      warnings.push(`${member.id}: legacy ranking metrics hidden (missing source/date)`);
    }
  }
}

const venueIds = new Set(live.venues.map((venue) => venue.id));
for (const event of live.events) {
  for (const groupId of event.groupIds) if (!groupIds.has(groupId)) errors.push(`${event.id}: unknown groupId ${groupId}`);
  if (!venueIds.has(event.venueId)) errors.push(`${event.id}: unknown venueId ${event.venueId}`);
}

for (const notice of notices) if (!groupIds.has(notice.groupId)) errors.push(`${notice.id}: unknown groupId ${notice.groupId}`);
for (const notice of notices) if (!notice.checkedAt || !notice.sourceUrl) warnings.push(`${notice.id}: hidden notice (missing source/date)`);
for (const feature of gravures) {
  if (!groupIds.has(feature.groupId)) errors.push(`${feature.id}: unknown groupId ${feature.groupId}`);
  if (!memberIds.has(feature.memberId)) warnings.push(`${feature.id}: member not present in partial dataset`);
  if (!feature.checkedAt || !feature.sourceUrl || !feature.rightsStatus) warnings.push(`${feature.id}: hidden feature (missing source/date/rights)`);
}

for (const snapshot of metrics.snapshots) {
  if (snapshot.scope === 'group' && !groupIds.has(snapshot.subjectId)) errors.push(`${snapshot.id}: unknown ranking group ${snapshot.subjectId}`);
  if (snapshot.scope === 'member' && !memberIds.has(snapshot.subjectId)) errors.push(`${snapshot.id}: unknown ranking member ${snapshot.subjectId}`);
  if (snapshot.metric === 'x_followers' && snapshot.platform !== 'x') errors.push(`${snapshot.id}: X metric/platform mismatch`);
  if (snapshot.metric === 'instagram_followers' && snapshot.platform !== 'instagram') errors.push(`${snapshot.id}: Instagram metric/platform mismatch`);
  if (snapshot.metric === 'google_trends_index' && snapshot.platform !== 'google_trends') errors.push(`${snapshot.id}: Google Trends metric/platform mismatch`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`OK: ${groups.length} groups, ${memberIds.size} members, ${notices.length} notices, ${gravures.length} gravure records, ${live.events.length} live events, ${metrics.snapshots.length} metric snapshots`);
console.warn(`WARN: ${warnings.length} review items`);
