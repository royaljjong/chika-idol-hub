import fs from 'node:fs';
import path from 'node:path';
import { GravureCandidateDataset } from '../src/lib/schema';

const filePath = path.join(process.cwd(), 'data', 'chika-gravure-candidates.json');
const dataset = GravureCandidateDataset.parse(JSON.parse(fs.readFileSync(filePath, 'utf8')));

console.log(`Gravure candidates: ${dataset.candidates.length}`);
console.table(dataset.candidates.map((candidate) => ({
  id: candidate.id,
  person: candidate.personNameJa,
  type: candidate.contentType,
  date: candidate.releaseDate ?? 'unknown',
  rights: candidate.rightsStatus,
  status: candidate.reviewStatus,
  linkedMember: candidate.memberId ?? 'unlinked',
  blocker: candidate.blocker ?? '',
})));
