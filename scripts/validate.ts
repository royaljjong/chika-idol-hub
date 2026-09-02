import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { ChikaDataset, ChikaLiveDataset, ChikaNotice, DiscoverySourceCatalog, GeoAreaDataset, GravureCandidateDataset, GravureFeature, ImageCandidateDataset, LiveEventCandidateDataset, MetricDataset } from '../src/lib/schema';
import { isDistrictInRegion } from '../src/lib/geo-contract';

const dataDir = path.join(process.cwd(), 'data');
const groups = ChikaDataset.parse(JSON.parse(fs.readFileSync(path.join(dataDir, 'chika-groups.json'), 'utf8')));
const notices = z.array(ChikaNotice).parse(JSON.parse(fs.readFileSync(path.join(dataDir, 'chika-notices.json'), 'utf8')));
const gravures = z.array(GravureFeature).parse(JSON.parse(fs.readFileSync(path.join(dataDir, 'chika-gravure.json'), 'utf8')));
const gravureCandidates = GravureCandidateDataset.parse(JSON.parse(fs.readFileSync(path.join(dataDir, 'chika-gravure-candidates.json'), 'utf8')));
const live = ChikaLiveDataset.parse(JSON.parse(fs.readFileSync(path.join(dataDir, 'chika-live.json'), 'utf8')));
const geoAreas = GeoAreaDataset.parse(JSON.parse(fs.readFileSync(path.join(dataDir, 'chika-geo-areas.json'), 'utf8')));
const liveCandidates = LiveEventCandidateDataset.parse(JSON.parse(fs.readFileSync(path.join(dataDir, 'chika-live-candidates.json'), 'utf8')));
const metrics = MetricDataset.parse(JSON.parse(fs.readFileSync(path.join(dataDir, 'chika-metrics.json'), 'utf8')));
const sourceCatalog = DiscoverySourceCatalog.parse(JSON.parse(fs.readFileSync(path.join(dataDir, 'chika-source-catalog.json'), 'utf8')));
const imageCandidates = ImageCandidateDataset.parse(JSON.parse(fs.readFileSync(path.join(dataDir, 'chika-image-candidates.json'), 'utf8')));

const errors: string[] = [];
const warnings: string[] = [];

const geoAreaIds = new Set<string>();
const geoAreaById = new Map(geoAreas.areas.map((area) => [area.id, area]));
for (const area of geoAreas.areas) {
  if (geoAreaIds.has(area.id)) errors.push(`duplicate geo area id: ${area.id}`);
  geoAreaIds.add(area.id);
}
for (const area of geoAreas.areas) {
  if (area.parentId && !geoAreaIds.has(area.parentId)) errors.push(`${area.id}: unknown parent geo area ${area.parentId}`);
  if (area.verificationStatus === 'map_ready' && (!area.center || !area.boundaryUrl)) errors.push(`${area.id}: map_ready area missing center or boundary`);
}

const discoverySourceKeys = new Set<string>();
for (const source of sourceCatalog.sources) {
  if (discoverySourceKeys.has(source.key)) errors.push(`duplicate discovery source key: ${source.key}`);
  discoverySourceKeys.add(source.key);
}
const discoveryCandidateIds = new Set<string>();
for (const candidate of sourceCatalog.entityCandidates) {
  if (discoveryCandidateIds.has(candidate.id)) errors.push(`duplicate discovery candidate id: ${candidate.id}`);
  discoveryCandidateIds.add(candidate.id);
  if (!discoverySourceKeys.has(candidate.discoverySourceKey)) errors.push(`${candidate.id}: unknown discovery source ${candidate.discoverySourceKey}`);
  if (candidate.reviewStatus === 'official_source_found' && !candidate.officialUrls.some((source) => source.status === 'verified')) {
    errors.push(`${candidate.id}: official_source_found without verified official URL`);
  }
}
const groupIds = new Set(groups.map((group) => group.id));
const memberIds = new Set<string>();
let officialGroupImages = 0;
let placeholderGroupImages = 0;
let groupTextWordmarks = 0;
let officialMemberImages = 0;
let placeholderMemberImages = 0;

function isValidMonthDay(value: string) {
  if (!/^\d{2}-\d{2}$/.test(value)) return false;
  const [month, day] = value.split('-').map(Number);
  if (!month || !day) return false;
  const probe = new Date(Date.UTC(2000, month - 1, day));
  return probe.getUTCMonth() === month - 1 && probe.getUTCDate() === day;
}

function isValidIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return false;
  const probe = new Date(Date.UTC(year, month - 1, day));
  return probe.getUTCFullYear() === year && probe.getUTCMonth() === month - 1 && probe.getUTCDate() === day;
}

for (const group of groups) {
  if (!isDistrictInRegion(group.region, group.district)) errors.push(`${group.id}: district ${group.district} does not belong to region ${group.region}`);
  if (group.xFollowers !== undefined || group.popularityScore !== undefined || group.searchVolumeScore !== undefined) errors.push(`${group.id}: legacy group ranking metrics are not permitted without a provenance contract`);
  if (group.activityStatus === 'ended' && !group.endedAt) errors.push(`${group.id}: ended group missing endedAt`);
  if (group.activityStatus !== 'ended' && group.endedAt) errors.push(`${group.id}: non-ended group has endedAt`);
  if (group.coverageStatus === 'complete' && !group.provenance) errors.push(`${group.id}: complete coverage missing provenance`);
  if (group.coverageStatus === 'complete' && group.officialMemberCount !== group.members.filter((member) => ['active', 'hiatus'].includes(member.activityStatus ?? 'active')).length) errors.push(`${group.id}: complete coverage member count mismatch`);
  if (group.officialMemberCount != null && !group.rosterCheckedAt) errors.push(`${group.id}: official member count missing rosterCheckedAt`);
  if (!group.provenance) warnings.push(`${group.id}: group provenance missing`);
  if (group.activityStatus !== 'ended' && (group.areaEvidence?.length ?? 0) === 0) warnings.push(`${group.id}: map area evidence missing`);
  const groupImageOfficial = group.imageKind === 'official_photo' || group.imageKind === 'official_logo';
  if (groupImageOfficial) officialGroupImages += 1; else if (group.imageKind === 'text_wordmark') groupTextWordmarks += 1; else placeholderGroupImages += 1;
  if (groupImageOfficial && (!group.imageUrl || !group.imageSourceUrl || !group.imageCheckedAt || !['official_embed', 'permission_confirmed'].includes(group.imageRightsStatus ?? ''))) errors.push(`${group.id}: official group image missing embeddable rights/source/date`);
  if (group.imageRightsStatus === 'link_only' && group.imageUrl) errors.push(`${group.id}: link-only group image must not be embedded`);
  if (group.imageKind === 'text_wordmark' && (!group.imageUrl?.startsWith('/images/groups/') || !group.imageUrl.endsWith('.svg'))) errors.push(`${group.id}: text wordmark must use a local group SVG`);
  for (const member of group.members) {
    if (memberIds.has(member.id)) errors.push(`duplicate member id: ${member.id}`);
    memberIds.add(member.id);
    if (member.groupId !== group.id) errors.push(`${member.id}: groupId mismatch`);
    if (member.memberColorBasis === 'official_name_approximation' && member.memberColorName.en === 'Unverified') errors.push(`${member.id}: approximate display color missing official color name`);
    if (member.memberColorBasis === 'official_hex' && member.memberColor === '#9CA3AF') errors.push(`${member.id}: official color cannot use unverified gray`);
    if (member.birthDate && !isValidIsoDate(member.birthDate)) errors.push(`${member.id}: invalid birthDate`);
    if (member.birthMonthDay && !isValidMonthDay(member.birthMonthDay)) errors.push(`${member.id}: invalid birthMonthDay`);
    if (member.birthDate && member.birthMonthDay && member.birthDate.slice(5) !== member.birthMonthDay) errors.push(`${member.id}: birthDate and birthMonthDay mismatch`);
    if (!member.provenance) warnings.push(`${member.id}: member provenance missing`);
    if (member.imageKind === 'official') officialMemberImages += 1; else placeholderMemberImages += 1;
    if (member.imageKind === 'official' && (!member.imageUrl || !member.imageSourceUrl || !member.imageCheckedAt || !['official_embed', 'permission_confirmed'].includes(member.imageRightsStatus ?? ''))) errors.push(`${member.id}: official member image missing embeddable rights/source/date`);
    if (member.imageRightsStatus === 'link_only' && member.imageUrl) errors.push(`${member.id}: link-only member image must not be embedded`);
    const hasMetricValue = member.popularityScore !== undefined || member.searchVolumeScore !== undefined || member.xFollowers > 0 || member.igFollowers > 0;
    const hasMetricSource = Boolean(member.metricsSourceUrl);
    const hasMetricDate = Boolean(member.metricsVerifiedAt);
    if (hasMetricSource !== hasMetricDate) errors.push(`${member.id}: ranking metric source/date must be provided together`);
    if (hasMetricValue && (!hasMetricSource || !hasMetricDate)) errors.push(`${member.id}: ranking metric value missing source/date`);
  }
}

const imageCandidateIds = new Set<string>();
for (const candidate of imageCandidates.candidates) {
  if (imageCandidateIds.has(candidate.id)) errors.push(`duplicate image candidate id: ${candidate.id}`);
  imageCandidateIds.add(candidate.id);
  if (candidate.subjectType === 'group' && !groupIds.has(candidate.subjectId)) errors.push(`${candidate.id}: unknown image candidate group`);
  if (candidate.subjectType === 'member' && !memberIds.has(candidate.subjectId)) errors.push(`${candidate.id}: unknown image candidate member`);
  if (candidate.rightsStatus === 'link_only' && candidate.assetUrl) errors.push(`${candidate.id}: link-only image candidate must not store assetUrl`);
  if (candidate.reviewStatus === 'approved' && (!candidate.assetUrl || !['official_embed', 'permission_confirmed'].includes(candidate.rightsStatus))) errors.push(`${candidate.id}: approved image candidate missing embeddable rights/asset`);
  if (candidate.reviewStatus === 'rights_review' && !candidate.blocker) errors.push(`${candidate.id}: rights review candidate missing blocker`);
  if (candidate.reviewStatus === 'rights_review' && !candidate.permissionContactUrl) errors.push(`${candidate.id}: rights review candidate missing permission contact`);
  if (candidate.reviewStatus === 'rejected' && !candidate.rightsPolicyUrl) errors.push(`${candidate.id}: rejected image candidate missing policy source`);
}

const gravureCandidateIds = new Set<string>();
for (const candidate of gravureCandidates.candidates) {
  if (gravureCandidateIds.has(candidate.id)) errors.push(`duplicate gravure candidate id: ${candidate.id}`);
  gravureCandidateIds.add(candidate.id);
  if (candidate.memberId && !memberIds.has(candidate.memberId)) errors.push(`${candidate.id}: unknown gravure candidate member ${candidate.memberId}`);
  if (candidate.reviewStatus === 'published' && !candidate.publishedFeatureId) errors.push(`${candidate.id}: published gravure candidate missing feature id`);
  if (candidate.reviewStatus === 'ready_for_publish' && candidate.blocker) errors.push(`${candidate.id}: ready gravure candidate still has blocker`);
}

for (const candidate of sourceCatalog.entityCandidates) {
  if (candidate.reviewStatus === 'imported' && (!candidate.importedEntityId || !groupIds.has(candidate.importedEntityId))) {
    errors.push(`${candidate.id}: imported candidate missing valid importedEntityId`);
  }
  if (candidate.reviewStatus !== 'imported' && candidate.importedEntityId) {
    errors.push(`${candidate.id}: non-imported candidate has importedEntityId`);
  }
}

const venueIds = new Set(live.venues.map((venue) => venue.id));
for (const venue of live.venues) {
  if (venue.geoAreaId && !geoAreaIds.has(venue.geoAreaId)) errors.push(`${venue.id}: unknown geoAreaId ${venue.geoAreaId}`);
  const venueGeoArea = venue.geoAreaId ? geoAreaById.get(venue.geoAreaId) : undefined;
  if (venueGeoArea && venueGeoArea.level !== 'ward') errors.push(`${venue.id}: venue geoAreaId must reference a ward`);
  if (venue.region === 'tokyo' && venueGeoArea && venueGeoArea.parentId !== 'tokyo-to') errors.push(`${venue.id}: Tokyo venue geoAreaId must belong to Tokyo`);
  const hasCoordinates = venue.latitude !== null || venue.longitude !== null;
  if (hasCoordinates && (venue.latitude === null || venue.longitude === null || !venue.coordinateProvenance)) errors.push(`${venue.id}: incomplete coordinate provenance`);
}
const eventIds = new Set<string>();
for (const event of live.events) {
  if (eventIds.has(event.id)) errors.push(`duplicate event id: ${event.id}`);
  eventIds.add(event.id);
  for (const groupId of event.groupIds) if (!groupIds.has(groupId)) errors.push(`${event.id}: unknown groupId ${groupId}`);
  if (event.venueId && !venueIds.has(event.venueId)) errors.push(`${event.id}: unknown venueId ${event.venueId}`);
  if (event.endsOn && event.endsOn < event.startsOn) errors.push(`${event.id}: endsOn precedes startsOn`);
  if (event.timeStatus === 'confirmed' && !event.startsAt) errors.push(`${event.id}: confirmed time missing startsAt`);
  if (event.startsAt && !event.startsAt.startsWith(event.startsOn)) errors.push(`${event.id}: startsAt does not match startsOn`);
  if (!event.officialUrl || !event.provenance.sourceUrl || !event.provenance.checkedAt) errors.push(`${event.id}: missing official source contract`);
}

const candidateIds = new Set<string>();
const candidateSourceIds = new Set<string>();
const publishedCandidateEventIds = new Set<string>();
const sourceKeys = new Set<string>();
for (const source of liveCandidates.sources) {
  if (sourceKeys.has(source.key)) errors.push(`duplicate live candidate source key: ${source.key}`);
  sourceKeys.add(source.key);
  if (!groupIds.has(source.groupId)) errors.push(`${source.key}: unknown source groupId ${source.groupId}`);
  const actualCount = liveCandidates.candidates.filter((candidate) => candidate.sourceKey === source.key).length;
  if (source.candidateCount !== actualCount) errors.push(`${source.key}: candidateCount mismatch ${source.candidateCount} != ${actualCount}`);
}
for (const candidate of liveCandidates.candidates) {
  if (candidateIds.has(candidate.id)) errors.push(`duplicate live candidate id: ${candidate.id}`);
  const candidateSourceIdentity = `${candidate.sourceKey}:${candidate.sourceEventId}`;
  if (candidateSourceIds.has(candidateSourceIdentity)) errors.push(`duplicate live candidate sourceEventId: ${candidateSourceIdentity}`);
  candidateIds.add(candidate.id);
  candidateSourceIds.add(candidateSourceIdentity);
  if (!sourceKeys.has(candidate.sourceKey)) errors.push(`${candidate.id}: unknown sourceKey ${candidate.sourceKey}`);
  if (!groupIds.has(candidate.groupId)) errors.push(`${candidate.id}: unknown candidate groupId ${candidate.groupId}`);
  if (candidate.endsOn && candidate.endsOn < candidate.startsOn) errors.push(`${candidate.id}: candidate endsOn precedes startsOn`);
  if (candidate.reviewStatus === 'published' && (!candidate.publishedEventId || !eventIds.has(candidate.publishedEventId))) errors.push(`${candidate.id}: published candidate missing valid publishedEventId`);
  if (candidate.reviewStatus !== 'published' && candidate.publishedEventId) errors.push(`${candidate.id}: unpublished candidate has publishedEventId`);
  if (candidate.publishedEventId) {
    if (publishedCandidateEventIds.has(candidate.publishedEventId)) errors.push(`${candidate.id}: duplicate publishedEventId ${candidate.publishedEventId}`);
    publishedCandidateEventIds.add(candidate.publishedEventId);
  }
}
const candidateSourceGroupIds = new Set(liveCandidates.sources.map((source) => source.groupId));
for (const event of live.events) if (event.groupIds.some((groupId) => candidateSourceGroupIds.has(groupId)) && !publishedCandidateEventIds.has(event.id)) errors.push(`${event.id}: public source event missing published candidate link`);

for (const notice of notices) if (!groupIds.has(notice.groupId)) errors.push(`${notice.id}: unknown groupId ${notice.groupId}`);
for (const notice of notices) if (!notice.checkedAt || !notice.sourceUrl) warnings.push(`${notice.id}: hidden notice (missing source/date)`);
for (const feature of gravures) {
  if (!groupIds.has(feature.groupId)) errors.push(`${feature.id}: unknown groupId ${feature.groupId}`);
  if (!memberIds.has(feature.memberId)) warnings.push(`${feature.id}: member not present in partial dataset`);
  if (feature.rightsStatus === 'link_only' && feature.imageUrl) errors.push(`${feature.id}: link-only gravure image must not be embedded`);
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

console.log(`OK: ${groups.length} groups, ${memberIds.size} members, ${geoAreas.areas.length} geo areas, ${notices.length} notices, ${gravures.length} gravure records, ${gravureCandidates.candidates.length} gravure candidates, ${live.events.length} live events, ${liveCandidates.candidates.length} live candidates, ${sourceCatalog.sources.length} discovery sources, ${sourceCatalog.entityCandidates.length} discovery candidates, ${metrics.snapshots.length} metric snapshots`);
console.log(`IMAGE: groups ${officialGroupImages} official / ${groupTextWordmarks} text wordmark / ${placeholderGroupImages} placeholder; members ${officialMemberImages} official / ${placeholderMemberImages} placeholder`);
console.log(`IMAGE CANDIDATES: ${imageCandidates.candidates.length} total / ${imageCandidates.candidates.filter((item) => item.reviewStatus === 'rights_review').length} rights review / ${imageCandidates.candidates.filter((item) => item.reviewStatus === 'approved').length} approved`);
console.warn(`WARN: ${warnings.length} review items`);
