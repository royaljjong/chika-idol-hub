import fs from 'node:fs';
import path from 'node:path';
import { DiscoverySourceCatalog } from '../src/lib/schema';

const catalog = DiscoverySourceCatalog.parse(JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'chika-source-catalog.json'), 'utf8')));

console.log(`Sources: ${catalog.sources.length}`);
console.table(catalog.sources.map((source) => ({
  key: source.key,
  role: source.role,
  trust: source.trustTier,
  access: source.accessStatus,
  entities: source.entityKinds.join(', '),
})));

console.log(`Entity candidates: ${catalog.entityCandidates.length}`);
console.table(catalog.entityCandidates.map((candidate) => ({
  id: candidate.id,
  kind: candidate.kind,
  name: candidate.nameJa,
  status: candidate.reviewStatus,
  scope: candidate.scopeFit,
  verifiedOfficialUrls: candidate.officialUrls.filter((source) => source.status === 'verified').length,
})));
