import fs from 'node:fs';
import path from 'node:path';
import { ChikaDataset, ChikaLiveDataset, GeoAreaDataset, LiveEventCandidateDataset } from '../src/lib/schema';
import { getJapanCalendarDate } from '../src/lib/japan-date';

const dataDir = path.join(process.cwd(), 'data');
const groups = ChikaDataset.parse(JSON.parse(fs.readFileSync(path.join(dataDir, 'chika-groups.json'), 'utf8')));
const live = ChikaLiveDataset.parse(JSON.parse(fs.readFileSync(path.join(dataDir, 'chika-live.json'), 'utf8')));
const candidates = LiveEventCandidateDataset.parse(JSON.parse(fs.readFileSync(path.join(dataDir, 'chika-live-candidates.json'), 'utf8')));
const geo = GeoAreaDataset.parse(JSON.parse(fs.readFileSync(path.join(dataDir, 'chika-geo-areas.json'), 'utf8')));
const today = getJapanCalendarDate();

const tokyoGroups = groups.filter((group) => group.activityStatus !== 'ended' && group.region === 'tokyo');
const wardIds = new Set(geo.areas.filter((area) => area.level === 'ward' && area.parentId === 'tokyo-to').map((area) => area.id));
const evidencedWards = new Set(tokyoGroups.flatMap((group) => group.areaEvidence?.map((evidence) => evidence.areaId) ?? []).filter((id) => wardIds.has(id)));
const verifiedVenues = live.venues.filter((venue) => venue.geoAreaId && wardIds.has(venue.geoAreaId) && venue.latitude !== null && venue.longitude !== null && venue.coordinateProvenance);
const futureEvents = live.events.filter((event) => event.status === 'scheduled' && (event.endsOn ?? event.startsOn) >= today);
const tokyoFutureEvents = futureEvents.filter((event) => event.region === 'tokyo' && event.venueId && verifiedVenues.some((venue) => venue.id === event.venueId));
const tokyoCandidateEvents = candidates.candidates.filter((candidate) => candidate.reviewStatus === 'review_pending' && candidate.startsOn >= today && candidate.candidateKind === 'live_or_event' && /東京|渋谷|新宿|池袋|秋葉原|原宿|Tokyo/i.test(candidate.locationText ?? ''));

const rows = [
  { metric: 'Tokyo active groups', current: tokyoGroups.length, target: 20 },
  { metric: 'Tokyo wards with verified activity evidence', current: evidencedWards.size, target: 5 },
  { metric: 'Tokyo map-ready venues', current: verifiedVenues.length, target: 15 },
  { metric: 'Tokyo future events at map-ready venues', current: tokyoFutureEvents.length, target: 30 },
];
console.log(`Map Gate 2 audit (as of ${today})`);
console.table(rows.map((row) => ({ ...row, gap: Math.max(0, row.target - row.current), pass: row.current >= row.target })));
console.log(`Nationwide scheduled future events: ${futureEvents.length}`);
console.log(`Tokyo review-pending candidates with location text: ${tokyoCandidateEvents.length}`);
console.log(`Gate 2: ${rows.every((row) => row.current >= row.target) ? 'PASS' : 'NOT READY'}`);
