import fs from 'node:fs';
import path from 'node:path';
import { ImageCandidateDataset } from '../src/lib/schema';

const file = path.join(process.cwd(), 'data', 'chika-image-candidates.json');
const dataset = ImageCandidateDataset.parse(JSON.parse(fs.readFileSync(file, 'utf8')));
const byStatus = Object.groupBy(dataset.candidates, (candidate) => candidate.reviewStatus);

console.log(`Image candidates: ${dataset.candidates.length}`);
for (const status of ['discovered', 'rights_review', 'approved', 'rejected'] as const) console.log(`${status}: ${byStatus[status]?.length ?? 0}`);
for (const candidate of dataset.candidates.filter((item) => item.reviewStatus === 'rights_review')) console.log(`- ${candidate.subjectType}:${candidate.subjectId} ${candidate.assetKind} — ${candidate.blocker}`);
