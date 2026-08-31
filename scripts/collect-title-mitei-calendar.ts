import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { LiveEventCandidateDataset, type LiveEventCandidate } from '../src/lib/schema';
import { getJapanCalendarDate } from '../src/lib/japan-date';

const GROUP_ID = 'title-mitei';
const SOURCE_KEY = 'title-mitei-calendar';
const OFFICIAL_PAGE_URL = 'https://miteititle.com/schedule/';
const FEED_URL = 'https://calendar.google.com/calendar/ical/titlemitei0516%40gmail.com/public/basic.ics';
const OUTPUT_PATH = path.join(process.cwd(), 'data', 'chika-live-candidates.json');

function getArg(name: string) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function unfoldIcs(input: string) {
  return input.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '').replace(/\r/g, '');
}

function unescapeIcs(value: string) {
  return value.replace(/\\n/gi, ' ').replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\').trim();
}

function readField(block: string, name: string) {
  const line = block.split('\n').find((item) => item.startsWith(`${name}:`) || item.startsWith(`${name};`));
  return line ? unescapeIcs(line.slice(line.indexOf(':') + 1)) : null;
}

function parseIcsDate(value: string | null) {
  if (!value) return null;
  const match = value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2}))?/);
  if (!match) return null;
  return { date: `${match[1]}-${match[2]}-${match[3]}`, time: match[4] && match[5] ? `${match[4]}:${match[5]}` : null };
}

function previousDate(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

function extractTicketUrls(description: string | null) {
  if (!description) return [];
  const urls = description.match(/https?:\/\/[^\s\\]+/g) ?? [];
  return Array.from(new Set(urls.map((url) => url.replace(/[),.;]+$/g, '')).filter((url) => /ticket|tiget|t-dv|livepocket|pia|eplus/i.test(url))));
}

function extractTimeText(description: string | null, startTime: string | null) {
  if (startTime) return startTime;
  if (!description) return null;
  const match = description.match(/(?:OPEN|開場)\s*[:：]?\s*\d{1,2}:\d{2}(?:\s*[\/／・]\s*(?:START|開演)\s*[:：]?\s*\d{1,2}:\d{2})?/i);
  return match?.[0] ?? null;
}

function stableId(sourceEventId: string) {
  return `title-mitei-${createHash('sha256').update(sourceEventId).digest('hex').slice(0, 16)}`;
}

function classifyCandidate(title: string) {
  if (/誕生日|生誕/.test(title)) return 'birthday' as const;
  if (/発売|配信|放送|ラジオ|テレビ|TV|雑誌|掲載/.test(title)) return 'release_or_media' as const;
  if (/ライブ|LIVE|フェス|祭|公演|イベント|対バン|ツアー|FESTIVAL/i.test(title)) return 'live_or_event' as const;
  return 'unknown' as const;
}

function parseCandidates(ics: string, from: string, collectedAt: string): LiveEventCandidate[] {
  const blocks = unfoldIcs(ics).split('BEGIN:VEVENT').slice(1).map((item) => item.split('END:VEVENT')[0] ?? '');
  const candidates: LiveEventCandidate[] = [];

  for (const block of blocks) {
    const sourceEventId = readField(block, 'UID');
    const title = readField(block, 'SUMMARY');
    const start = parseIcsDate(readField(block, 'DTSTART'));
    if (!sourceEventId || !title || !start || start.date < from || readField(block, 'STATUS') === 'CANCELLED') continue;
    const end = parseIcsDate(readField(block, 'DTEND'));
    const inclusiveEnd = end ? previousDate(end.date) : null;
    const description = readField(block, 'DESCRIPTION');
    candidates.push({
      id: stableId(sourceEventId), sourceKey: SOURCE_KEY, sourceEventId, groupId: GROUP_ID, reviewStatus: 'review_pending', candidateKind: classifyCandidate(title), publishedEventId: null, title,
      startsOn: start.date, endsOn: inclusiveEnd && inclusiveEnd !== start.date ? inclusiveEnd : null,
      timeText: extractTimeText(description, start.time), locationText: readField(block, 'LOCATION'),
      ticketUrls: extractTicketUrls(description), officialPageUrl: OFFICIAL_PAGE_URL, sourceUrl: FEED_URL, collectedAt,
    });
  }

  return candidates.sort((a, b) => a.startsOn.localeCompare(b.startsOn) || a.title.localeCompare(b.title, 'ja'));
}

async function main() {
  const from = getArg('--from') ?? getJapanCalendarDate();
  const shouldWrite = process.argv.includes('--write');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from)) throw new Error(`Invalid --from date: ${from}`);
  const response = await fetch(FEED_URL, { headers: { 'user-agent': 'ChikaIdolBox/0.1 official-calendar-review-candidate-collector' } });
  if (!response.ok) throw new Error(`Calendar fetch failed: ${response.status} ${response.statusText}`);
  const collectedAt = new Date().toISOString();
  const discovered = parseCandidates(await response.text(), from, collectedAt);
  const previous = fs.existsSync(OUTPUT_PATH) ? LiveEventCandidateDataset.parse(JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8'))) : null;
  const previousBySourceId = new Map(previous?.candidates.map((candidate) => [candidate.sourceEventId, candidate]));
  const refreshedCandidates = discovered.map((candidate) => {
    const existing = previousBySourceId.get(candidate.sourceEventId);
    return existing ? { ...candidate, reviewStatus: existing.reviewStatus, publishedEventId: existing.publishedEventId } : candidate;
  });
  const refreshedIds = new Set(refreshedCandidates.map((candidate) => candidate.sourceEventId));
  const retainedHistory = previous?.candidates.filter((candidate) => candidate.sourceKey === SOURCE_KEY && !refreshedIds.has(candidate.sourceEventId) && candidate.reviewStatus !== 'review_pending') ?? [];
  const candidates = [...retainedHistory, ...refreshedCandidates].sort((a, b) => a.startsOn.localeCompare(b.startsOn) || a.title.localeCompare(b.title, 'ja'));
  const contentHash = createHash('sha256').update(JSON.stringify(refreshedCandidates.map(({ sourceEventId, title, startsOn, endsOn, timeText, locationText, ticketUrls }) => ({ sourceEventId, title, startsOn, endsOn, timeText, locationText, ticketUrls })))).digest('hex');
  const previousSource = previous?.sources.find((source) => source.key === SOURCE_KEY);
  const sources = [...(previous?.sources.filter((source) => source.key !== SOURCE_KEY) ?? []), { key: SOURCE_KEY, groupId: GROUP_ID, officialPageUrl: OFFICIAL_PAGE_URL, feedUrl: FEED_URL, lastCollectedAt: collectedAt, contentHash, candidateCount: candidates.length }];
  const otherCandidates = previous?.candidates.filter((candidate) => candidate.sourceKey !== SOURCE_KEY) ?? [];
  const dataset = LiveEventCandidateDataset.parse({ generatedAt: collectedAt, sources, candidates: [...otherCandidates, ...candidates] });
  const missingVenue = candidates.filter((candidate) => !candidate.locationText).length;
  const missingTicket = candidates.filter((candidate) => candidate.ticketUrls.length === 0).length;
  const liveLike = candidates.filter((candidate) => candidate.candidateKind === 'live_or_event').length;
  console.log(`Candidates: ${candidates.length} (${refreshedCandidates.length} current, ${retainedHistory.length} retained history) from ${from}; live/event: ${liveLike}; venue TBA: ${missingVenue}; ticket TBA: ${missingTicket}; ${previousSource?.contentHash === contentHash ? 'unchanged' : 'changed'}`);
  if (!shouldWrite) { console.log('Dry run only. Pass --write to update data/chika-live-candidates.json.'); return; }
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(dataset, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${path.relative(process.cwd(), OUTPUT_PATH)}`);
}

main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exit(1); });
