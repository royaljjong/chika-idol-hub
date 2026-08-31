import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { LiveEventCandidateDataset, type LiveEventCandidate } from '../src/lib/schema';
import { getJapanCalendarDate } from '../src/lib/japan-date';

const SOURCE_KEY = 'fruits-zipper-official-html';
const GROUP_ID = 'fruits-zipper';
const ORIGIN = 'https://fruitszipper.asobisystem.com';
const OFFICIAL_PAGE_URL = `${ORIGIN}/live_information/schedule/list`;
const OUTPUT_PATH = path.join(process.cwd(), 'data', 'chika-live-candidates.json');

function getArg(name: string) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function decodeHtml(value: string) {
  const named: Record<string, string> = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' };
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (_, entity: string) => {
    if (entity.startsWith('#x')) return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
    if (entity.startsWith('#')) return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
    return named[entity.toLowerCase()] ?? `&${entity};`;
  });
}

function cleanText(value: string) {
  return decodeHtml(value.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

function stableId(sourceEventId: string) {
  return `fruits-zipper-${createHash('sha256').update(sourceEventId).digest('hex').slice(0, 16)}`;
}

function monthSequence(from: string, count: number) {
  const start = new Date(`${from.slice(0, 7)}-01T00:00:00Z`);
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(start);
    date.setUTCMonth(date.getUTCMonth() + index);
    return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 };
  });
}

async function fetchMonth(year: number, month: number) {
  const initialUrl = `${OFFICIAL_PAGE_URL}/?viewMode=default&year=${year}&month=${String(month).padStart(2, '0')}&displayNone=1`;
  const pages: Array<{ url: string; html: string }> = [];
  const seen = new Set<string>();
  let nextUrl: string | null = initialUrl;
  while (nextUrl && pages.length < 10) {
    if (seen.has(nextUrl)) throw new Error(`Pagination loop detected: ${nextUrl}`);
    seen.add(nextUrl);
    const response: Response = await fetch(nextUrl, { headers: { 'user-agent': 'ChikaIdolBox/0.1 official-schedule-review-candidate-collector' } });
    if (!response.ok) throw new Error(`Schedule fetch failed: ${response.status} ${nextUrl}`);
    const html: string = await response.text();
    pages.push({ url: nextUrl, html });
    const nextMatch: RegExpMatchArray | null = html.match(/<div id="next">[\s\S]*?<a href="([^"]*page=\d+[^"]*)"/i);
    nextUrl = nextMatch?.[1] ? new URL(decodeHtml(nextMatch[1]), ORIGIN).toString() : null;
  }
  return pages;
}

function parsePage(html: string, year: number, from: string, collectedAt: string) {
  const candidates: LiveEventCandidate[] = [];
  const anchorPattern = /<a href="(\/live_information\/detail\/\d+)" class="box box_live_[^"]+">([\s\S]*?)<\/a>/gi;
  for (const match of html.matchAll(anchorPattern)) {
    const body = match[2] ?? '';
    const month = body.match(/block--date__month">\s*(\d{1,2})/i)?.[1];
    const day = body.match(/block--date__date">\s*(\d{1,2})/i)?.[1];
    const titleHtml = body.match(/<p class="tit">([\s\S]*?)<\/p>/i)?.[1];
    if (!month || !day || !titleHtml) continue;
    const startsOn = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    if (startsOn < from) continue;
    const sourcePath = match[1] ?? '';
    const title = cleanText(titleHtml);
    const atIndex = title.lastIndexOf('@');
    candidates.push({
      id: stableId(sourcePath), sourceKey: SOURCE_KEY, sourceEventId: sourcePath, groupId: GROUP_ID,
      reviewStatus: 'review_pending', candidateKind: 'live_or_event', publishedEventId: null,
      title, startsOn, endsOn: null, timeText: null,
      locationText: atIndex >= 0 ? title.slice(atIndex + 1).trim() || null : null,
      ticketUrls: [], officialPageUrl: OFFICIAL_PAGE_URL, sourceUrl: new URL(sourcePath, ORIGIN).toString(), collectedAt,
    });
  }
  return candidates;
}

async function main() {
  const from = getArg('--from') ?? getJapanCalendarDate();
  const months = Number.parseInt(getArg('--months') ?? '6', 10);
  const shouldWrite = process.argv.includes('--write');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from)) throw new Error(`Invalid --from date: ${from}`);
  if (!Number.isInteger(months) || months < 1 || months > 12) throw new Error(`Invalid --months value: ${months}`);
  const collectedAt = new Date().toISOString();
  const monthPages = await Promise.all(monthSequence(from, months).map(async ({ year, month }) => ({ year, pages: await fetchMonth(year, month) })));
  const discovered = monthPages.flatMap(({ year, pages }) => pages.flatMap(({ html }) => parsePage(html, year, from, collectedAt)));
  const unique = Array.from(new Map(discovered.map((candidate) => [candidate.sourceEventId, candidate])).values()).sort((a, b) => a.startsOn.localeCompare(b.startsOn) || a.title.localeCompare(b.title, 'ja'));
  const previous = LiveEventCandidateDataset.parse(JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8')));
  const previousBySourceId = new Map(previous.candidates.filter((candidate) => candidate.sourceKey === SOURCE_KEY).map((candidate) => [candidate.sourceEventId, candidate]));
  const refreshedCandidates = unique.map((candidate) => {
    const existing = previousBySourceId.get(candidate.sourceEventId);
    return existing ? {
      ...candidate,
      reviewStatus: existing.reviewStatus,
      publishedEventId: existing.publishedEventId,
      candidateKind: existing.candidateKind,
      timeText: candidate.timeText ?? existing.timeText,
      locationText: existing.locationText ?? candidate.locationText,
      ticketUrls: candidate.ticketUrls.length > 0 ? candidate.ticketUrls : existing.ticketUrls,
    } : candidate;
  });
  const refreshedIds = new Set(refreshedCandidates.map((candidate) => candidate.sourceEventId));
  const retainedHistory = previous.candidates.filter((candidate) => candidate.sourceKey === SOURCE_KEY && !refreshedIds.has(candidate.sourceEventId) && candidate.reviewStatus !== 'review_pending');
  const candidates = [...retainedHistory, ...refreshedCandidates].sort((a, b) => a.startsOn.localeCompare(b.startsOn) || a.title.localeCompare(b.title, 'ja'));
  const contentHash = createHash('sha256').update(JSON.stringify(unique.map(({ sourceEventId, title, startsOn, locationText }) => ({ sourceEventId, title, startsOn, locationText })))).digest('hex');
  const previousSource = previous.sources.find((source) => source.key === SOURCE_KEY);
  const sources = [...previous.sources.filter((source) => source.key !== SOURCE_KEY), { key: SOURCE_KEY, groupId: GROUP_ID, officialPageUrl: OFFICIAL_PAGE_URL, feedUrl: OFFICIAL_PAGE_URL, lastCollectedAt: collectedAt, contentHash, candidateCount: candidates.length }];
  const dataset = LiveEventCandidateDataset.parse({ generatedAt: collectedAt, sources, candidates: [...previous.candidates.filter((candidate) => candidate.sourceKey !== SOURCE_KEY), ...candidates] });
  console.log(`FRUITS ZIPPER candidates: ${candidates.length} (${refreshedCandidates.length} current, ${retainedHistory.length} retained history); months: ${months}; venue hints: ${candidates.filter((candidate) => candidate.locationText).length}; ${previousSource?.contentHash === contentHash ? 'unchanged' : 'changed'}`);
  if (!shouldWrite) { console.log('Dry run only. Pass --write to update data/chika-live-candidates.json.'); return; }
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(dataset, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${path.relative(process.cwd(), OUTPUT_PATH)}`);
}

main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exit(1); });
