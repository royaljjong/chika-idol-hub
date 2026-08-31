import fs from 'node:fs';
import path from 'node:path';
import { LiveEventCandidateDataset, type LiveEventCandidate } from '../src/lib/schema';

const SOURCE_KEY = 'fruits-zipper-official-html';
const ORIGIN = 'https://fruitszipper.asobisystem.com';
const OUTPUT_PATH = path.join(process.cwd(), 'data', 'chika-live-candidates.json');

function decodeHtml(value: string) {
  const named: Record<string, string> = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' };
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (_, entity: string) => {
    if (entity.startsWith('#x')) return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
    if (entity.startsWith('#')) return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
    return named[entity.toLowerCase()] ?? `&${entity};`;
  });
}

function cleanText(value: string) {
  return decodeHtml(value.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ' ').replace(/[ \t]+/g, ' ').replace(/\n\s+/g, '\n').trim());
}

function getInfoHtml(html: string) {
  return html.match(/<p class="item-tit">INFO<\/p>\s*<div class="item-detail block--editor">([\s\S]*?)<\/div>/i)?.[1] ?? '';
}

function parseLocation(html: string) {
  const match = html.match(/<p class="item-tit">開催場所・会場<\/p>\s*<div class="item-detail">([\s\S]*?)<\/div>/i);
  return match?.[1] ? cleanText(match[1]) || null : null;
}

function parseTimeText(infoHtml: string) {
  const text = cleanText(infoHtml);
  const paired = text.match(/(?:時間[：:]\s*)?(?:OPEN|開場)\s*([0-2]?\d:[0-5]\d)\s*(?:\/|／|・|\s)+\s*(?:START|開演)\s*([0-2]?\d:[0-5]\d)/i);
  if (paired) return `OPEN ${paired[1]} / START ${paired[2]}`;
  const open = text.match(/(?:OPEN|開場)\s*([0-2]?\d:[0-5]\d)/i)?.[1];
  const start = text.match(/(?:START|開演)\s*([0-2]?\d:[0-5]\d)/i)?.[1];
  if (open && start) return `OPEN ${open} / START ${start}`;
  if (start) return `START ${start}`;
  if (open) return `OPEN ${open}`;
  return null;
}

function parseTicketUrls(infoHtml: string) {
  const ticketHost = /(ticket|eplus|pia\.jp|l-tike|lawson|rakuten|anypass|ticketbook|livepocket|t-dv|tiget|asobiticket)/i;
  const urls = new Set<string>();
  for (const match of infoHtml.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const href = decodeHtml(match[1] ?? '');
    if (!/^https?:\/\//i.test(href) && !href.startsWith('/')) continue;
    const label = cleanText(match[2] ?? '');
    const url = new URL(href, ORIGIN).toString();
    if (ticketHost.test(url) || /(ticket|チケット|申込|申し込み|受付|購入)/i.test(label)) urls.add(url);
  }
  return [...urls];
}

async function fetchCandidate(candidate: LiveEventCandidate) {
  const response = await fetch(candidate.sourceUrl, {
    headers: { 'user-agent': 'ChikaIdolBox/0.1 official-detail-review-candidate-enricher' },
  });
  if (!response.ok) throw new Error(`Detail fetch failed: ${response.status} ${candidate.sourceUrl}`);
  const html = await response.text();
  if (!html.includes('section--detail')) throw new Error(`Detail parse marker missing: ${candidate.sourceUrl}`);
  const infoHtml = getInfoHtml(html);
  const locationText = parseLocation(html);
  const timeText = parseTimeText(infoHtml);
  const ticketUrls = parseTicketUrls(infoHtml);
  return {
    ...candidate,
    locationText: locationText ?? candidate.locationText,
    timeText: timeText ?? candidate.timeText,
    ticketUrls: ticketUrls.length > 0 ? ticketUrls : candidate.ticketUrls,
  };
}

async function main() {
  const shouldWrite = process.argv.includes('--write');
  const dataset = LiveEventCandidateDataset.parse(JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8')));
  const targets = dataset.candidates.filter((candidate) => candidate.sourceKey === SOURCE_KEY);
  const enriched: LiveEventCandidate[] = [];
  for (let index = 0; index < targets.length; index += 5) {
    enriched.push(...await Promise.all(targets.slice(index, index + 5).map(fetchCandidate)));
  }
  const enrichedById = new Map(enriched.map((candidate) => [candidate.id, candidate]));
  const candidates = dataset.candidates.map((candidate) => enrichedById.get(candidate.id) ?? candidate);
  const before = JSON.stringify(targets.map(({ id, timeText, locationText, ticketUrls }) => ({ id, timeText, locationText, ticketUrls })));
  const after = JSON.stringify(enriched.map(({ id, timeText, locationText, ticketUrls }) => ({ id, timeText, locationText, ticketUrls })));
  console.log(`FRUITS ZIPPER details: ${enriched.length}; times: ${enriched.filter((candidate) => candidate.timeText).length}; locations: ${enriched.filter((candidate) => candidate.locationText).length}; ticket links: ${enriched.filter((candidate) => candidate.ticketUrls.length > 0).length}; ${before === after ? 'unchanged' : 'changed'}`);
  if (!shouldWrite) {
    console.log('Dry run only. Pass --write to update data/chika-live-candidates.json.');
    return;
  }
  const output = LiveEventCandidateDataset.parse({ ...dataset, generatedAt: new Date().toISOString(), candidates });
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${path.relative(process.cwd(), OUTPUT_PATH)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
