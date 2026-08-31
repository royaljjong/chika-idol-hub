import fs from 'node:fs';
import path from 'node:path';
import { ChikaLiveDataset, LiveEventCandidateDataset } from '../src/lib/schema';

const dataDir = path.join(process.cwd(), 'data');
const publicData = ChikaLiveDataset.parse(JSON.parse(fs.readFileSync(path.join(dataDir, 'chika-live.json'), 'utf8')));
const candidateData = LiveEventCandidateDataset.parse(JSON.parse(fs.readFileSync(path.join(dataDir, 'chika-live-candidates.json'), 'utf8')));
const publicIds = new Set(publicData.events.map((event) => event.id));

const rows = candidateData.candidates.map((candidate) => {
  let reviewBucket: 'published' | 'excluded' | 'needs_classification' | 'needs_details' | 'reviewable';
  const details = [candidate.timeText && 'time', candidate.locationText && 'venue', candidate.ticketUrls.length > 0 && 'ticket'].filter(Boolean) as string[];
  if (candidate.reviewStatus === 'published') reviewBucket = 'published';
  else if (candidate.reviewStatus === 'rejected') reviewBucket = 'excluded';
  else if (candidate.candidateKind === 'unknown') reviewBucket = 'needs_classification';
  else if (candidate.candidateKind !== 'live_or_event') reviewBucket = 'excluded';
  else if (details.length === 0) reviewBucket = 'needs_details';
  else reviewBucket = 'reviewable';
  return {
    date: candidate.startsOn,
    source: candidate.sourceKey,
    status: candidate.reviewStatus,
    bucket: reviewBucket,
    kind: candidate.candidateKind,
    evidence: details.join(',') || '-',
    linked: candidate.publishedEventId ? publicIds.has(candidate.publishedEventId) : false,
    title: candidate.title,
  };
});

console.table(rows);
const counts = rows.reduce<Record<string, number>>((summary, row) => {
  summary[row.bucket] = (summary[row.bucket] ?? 0) + 1;
  return summary;
}, {});
console.log('Summary:', counts);
if (rows.some((row) => row.status === 'published' && !row.linked)) process.exitCode = 1;
