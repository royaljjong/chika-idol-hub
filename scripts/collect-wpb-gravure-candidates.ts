import fs from 'node:fs';
import path from 'node:path';
import { ChikaDataset, GravureCandidateDataset } from '../src/lib/schema';

const SOURCE_URL = 'https://wpb.shueisha.co.jp/gravure/list/';
const checkedAt = new Date().toISOString().slice(0, 10);
const write = process.argv.includes('--write');
const root = process.cwd();
const groups = ChikaDataset.parse(JSON.parse(fs.readFileSync(path.join(root, 'data', 'chika-groups.json'), 'utf8')));
const candidatePath = path.join(root, 'data', 'chika-gravure-candidates.json');
const dataset = GravureCandidateDataset.parse(JSON.parse(fs.readFileSync(candidatePath, 'utf8')));

async function main() {
const response = await fetch(SOURCE_URL, { headers: { 'user-agent': 'ChikaIdolBox/0.1 (+link-only research)' } });
if (!response.ok) throw new Error(`WPB list fetch failed: ${response.status}`);
const html = await response.text();
const plain = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#039;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ');
const links = new Map<string, string>();
for (const match of html.matchAll(/href=["']([^"']*\/gravure\/(?:info|news|\d{8})[^"']*)["']/gi)) {
  links.set(new URL(match[1]!, SOURCE_URL).toString(), match[1]!);
}

const found = groups.flatMap((group) => group.members.flatMap((member) => {
  const name = member.name.ja.kanji.replace(/\s+/g, '');
  if (!plain.replace(/\s+/g, '').includes(name)) return [];
  const sourceUrl = [...links.keys()].find((url) => html.includes(name) && html.indexOf(name) - html.indexOf(url) < 2500) ?? SOURCE_URL;
  const birthYear = member.birthDate ? Number(member.birthDate.slice(0, 4)) : null;
  const minor = birthYear !== null && Number(checkedAt.slice(0, 4)) - birthYear < 18;
  return [{
    id: `wpb-${member.id}-${checkedAt}`,
    sourceKey: 'wpb-official',
    sourceUrl,
    checkedAt,
    personNameJa: member.name.ja.kanji,
    memberId: member.id,
    groupNameJa: group.name.ja,
    titleJa: `週プレNEWS公式グラビア一覧掲載候補: ${member.name.ja}`,
    publication: '週刊プレイボーイ',
    releaseDate: null,
    contentType: 'magazine' as const,
    officialProductUrl: null,
    rightsStatus: 'link_only' as const,
    reviewStatus: 'review_pending' as const,
    publishedFeatureId: null,
    safetyReviewStatus: 'pending' as const,
    safetyReviewedAt: null,
    blocker: minor ? '미성년자 안전 검토와 개별 공식 원문 확인 필요' : '개별 공식 원문·발매일·상품 링크 확인 필요',
  }];
}));

console.log(`WPB official matches: ${found.length} (${write ? 'write' : 'dry-run'})`);
console.table(found.map(({ personNameJa, groupNameJa, sourceUrl, blocker }) => ({ personNameJa, groupNameJa, sourceUrl, blocker })));
if (write) {
  const byId = new Map(dataset.candidates.map((candidate) => [candidate.id, candidate]));
  for (const candidate of found) byId.set(candidate.id, candidate);
  fs.writeFileSync(candidatePath, `${JSON.stringify({ generatedAt: new Date().toISOString(), candidates: [...byId.values()] }, null, 2)}\n`);
}
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
