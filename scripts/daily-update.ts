import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ChikaDataset, ImageCandidateDataset, LiveEventCandidateDataset } from '../src/lib/schema';
import { getJapanCalendarDate } from '../src/lib/japan-date';

type StepResult = {
  id: string;
  label: string;
  status: 'passed' | 'failed' | 'skipped';
  exitCode: number | null;
  summary: string;
};

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const write = process.argv.includes('--write');
const skipNetwork = process.argv.includes('--skip-network');
const today = getJapanCalendarDate();
const reportDir = path.join(root, '.tmp', 'daily-update');
const tsxCli = path.join(root, 'node_modules', 'tsx', 'dist', 'cli.mjs');
const groupsPath = path.join(root, 'data', 'chika-groups.json');
const candidatesPath = path.join(root, 'data', 'chika-live-candidates.json');
const imageCandidatesPath = path.join(root, 'data', 'chika-image-candidates.json');

function compactOutput(value: string) {
  return value.replace(/\r/g, '').trim().split('\n').filter(Boolean).slice(-8).join('\n');
}

function runStep(id: string, label: string, script: string, args: string[] = []): StepResult {
  const result = spawnSync(process.execPath, [tsxCli, script, ...args], {
    cwd: root,
    encoding: 'utf8',
    windowsHide: true,
  });
  const output = compactOutput(`${result.stdout ?? ''}\n${result.stderr ?? ''}`);
  const exitCode = result.status;
  const status = exitCode === 0 ? 'passed' : 'failed';
  console.log(`\n[${status.toUpperCase()}] ${label}`);
  if (output) console.log(output);
  return { id, label, status, exitCode, summary: output };
}

function skippedStep(id: string, label: string, reason: string): StepResult {
  console.log(`\n[SKIPPED] ${label}: ${reason}`);
  return { id, label, status: 'skipped', exitCode: null, summary: reason };
}

function utcDate(value: string) {
  return new Date(`${value}T00:00:00Z`);
}

function daysBetween(from: Date, to: Date) {
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}

function nextBirthday(knownBirthday: string, from: Date) {
  const parts = knownBirthday.split('-').map(Number);
  const month = parts.at(-2);
  const day = parts.at(-1);
  if (!month || !day) throw new Error(`Invalid birthday: ${knownBirthday}`);
  let year = from.getUTCFullYear();
  while (year < from.getUTCFullYear() + 8) {
    const birthdayDate: Date = new Date(Date.UTC(year, month - 1, day));
    if (birthdayDate.getUTCMonth() === month - 1 && birthdayDate.getUTCDate() === day && birthdayDate >= from) return birthdayDate;
    year += 1;
  }
  throw new Error(`Unable to calculate next birthday: ${knownBirthday}`);
}

function markdownCell(value: string) {
  return value.replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}

const steps: StepResult[] = [];
if (skipNetwork) {
  steps.push(skippedStep('title-mitei', 'タイトル未定 공식 캘린더 후보 수집', '--skip-network'));
  steps.push(skippedStep('fruits-zipper', 'FRUITS ZIPPER 공식 일정 후보 수집', '--skip-network'));
  steps.push(skippedStep('fruits-zipper-detail', 'FRUITS ZIPPER 후보 상세 보강', '--skip-network'));
} else {
  const writeArg = write ? ['--write'] : [];
  steps.push(runStep('title-mitei', 'タイトル未定 공식 캘린더 후보 수집', 'scripts/collect-title-mitei-calendar.ts', writeArg));
  steps.push(runStep('fruits-zipper', 'FRUITS ZIPPER 공식 일정 후보 수집', 'scripts/collect-fruits-zipper-schedule.ts', writeArg));
  steps.push(runStep('fruits-zipper-detail', 'FRUITS ZIPPER 후보 상세 보강', 'scripts/enrich-fruits-zipper-candidates.ts', writeArg));
}

steps.push(runStep('validate', '전체 데이터 계약 검사', 'scripts/validate.ts'));

const groups = ChikaDataset.parse(JSON.parse(fs.readFileSync(groupsPath, 'utf8')));
const candidates = LiveEventCandidateDataset.parse(JSON.parse(fs.readFileSync(candidatesPath, 'utf8')));
const imageCandidates = ImageCandidateDataset.parse(JSON.parse(fs.readFileSync(imageCandidatesPath, 'utf8')));
const currentDate = utcDate(today);
const activeMembers = groups
  .filter((group) => (group.activityStatus ?? 'active') === 'active')
  .flatMap((group) => group.members
    .filter((member) => (member.activityStatus ?? 'active') === 'active')
    .map((member) => ({ groupId: group.id, groupName: group.name.ja, member })));
const birthdays = activeMembers
  .filter(({ member }) => member.birthDate || member.birthMonthDay)
  .map(({ groupId, groupName, member }) => {
    const knownBirthday = member.birthDate ?? member.birthMonthDay!;
    const next = nextBirthday(knownBirthday, currentDate);
    return {
      memberId: member.id,
      memberName: member.name.ja.kanji,
      groupId,
      groupName,
      birthDate: member.birthDate,
      birthMonthDay: member.birthMonthDay,
      nextDate: next.toISOString().slice(0, 10),
      daysUntil: daysBetween(currentDate, next),
      sourceUrl: member.provenance?.sourceUrl ?? null,
    };
  })
  .filter((item) => item.daysUntil <= 30)
  .sort((a, b) => a.daysUntil - b.daysUntil || a.memberName.localeCompare(b.memberName, 'ja'));
const missingBirthDates = activeMembers
  .filter(({ member }) => !member.birthDate && !member.birthMonthDay)
  .map(({ groupId, groupName, member }) => ({
    memberId: member.id,
    memberName: member.name.ja.kanji,
    groupId,
    groupName,
    profileSourceUrl: member.provenance?.sourceUrl ?? null,
  }));
const imageRightsReview = imageCandidates.candidates
  .filter((item) => item.reviewStatus === 'rights_review')
  .sort((a, b) => a.subjectId.localeCompare(b.subjectId));

const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  japanDate: today,
  mode: write ? 'write_candidates' : 'dry_run',
  network: skipNetwork ? 'skipped' : 'enabled',
  success: steps.every((step) => step.status !== 'failed'),
  steps,
  candidates: {
    total: candidates.candidates.length,
    reviewPending: candidates.candidates.filter((item) => item.reviewStatus === 'review_pending').length,
    birthday: candidates.candidates.filter((item) => item.candidateKind === 'birthday').length,
    published: candidates.candidates.filter((item) => item.reviewStatus === 'published').length,
  },
  imageCandidates: {
    total: imageCandidates.candidates.length,
    rightsReview: imageRightsReview.length,
    approved: imageCandidates.candidates.filter((item) => item.reviewStatus === 'approved').length,
    rejected: imageCandidates.candidates.filter((item) => item.reviewStatus === 'rejected').length,
    items: imageRightsReview.map((item) => ({
      id: item.id,
      subjectType: item.subjectType,
      subjectId: item.subjectId,
      assetKind: item.assetKind,
      officialPageUrl: item.officialPageUrl,
      checkedAt: item.checkedAt,
      blocker: item.blocker,
    })),
  },
  birthdaysNext30Days: birthdays,
  missingBirthDates,
};

fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(path.join(reportDir, 'latest-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
const markdown = [
  `# Chika Idol Box 일일 업데이트 — ${today}`,
  '',
  `- 모드: ${report.mode}`,
  `- 네트워크: ${report.network}`,
  `- 전체 판정: ${report.success ? 'PASS' : 'PARTIAL/FAIL'}`,
  `- 후보: 전체 ${report.candidates.total}, 검토 대기 ${report.candidates.reviewPending}, 생일 후보 ${report.candidates.birthday}, 공개 연결 ${report.candidates.published}`,
  `- 이미지 후보: 전체 ${report.imageCandidates.total}, 권리 검토 ${report.imageCandidates.rightsReview}, 승인 ${report.imageCandidates.approved}, 거절 ${report.imageCandidates.rejected}`,
  '',
  '## 실행 단계',
  '',
  '| 단계 | 상태 | 요약 |',
  '|---|---|---|',
  ...steps.map((step) => `| ${markdownCell(step.label)} | ${step.status} | ${markdownCell(step.summary || '-')} |`),
  '',
  '## 오늘·향후 30일 생일',
  '',
  ...(birthdays.length > 0
    ? ['| 날짜 | D-day | 멤버 | 그룹 | 공식 프로필 근거 |', '|---|---:|---|---|---|', ...birthdays.map((item) => `| ${item.nextDate} | D-${item.daysUntil} | ${markdownCell(item.memberName)} | ${markdownCell(item.groupName)} | ${item.sourceUrl ? `[링크](${item.sourceUrl})` : '미연결'} |`)]
    : ['해당 기간에 공식 생일이 등록된 현역 멤버가 없습니다.']),
  '',
  '## 생일 미확인 현역 멤버',
  '',
  `총 ${missingBirthDates.length}명. 자동 추정하지 않으며 공식 프로필 확인 대상으로 유지합니다.`,
  '',
  ...(missingBirthDates.length > 0
    ? ['| 멤버 | 그룹 | 프로필 근거 |', '|---|---|---|', ...missingBirthDates.map((item) => `| ${markdownCell(item.memberName)} | ${markdownCell(item.groupName)} | ${item.profileSourceUrl ? `[링크](${item.profileSourceUrl})` : '미연결'} |`)]
    : ['없음']),
  '',
  '## 이미지 권리 검토 큐',
  '',
  ...(imageRightsReview.length > 0
    ? [
        '| 대상 | 자산 | 확인일 | 공식 페이지 | 차단 사유 |',
        '|---|---|---|---|---|',
        ...imageRightsReview.map((item) => `| ${markdownCell(`${item.subjectType}:${item.subjectId}`)} | ${item.assetKind} | ${item.checkedAt} | [링크](${item.officialPageUrl}) | ${markdownCell(item.blocker ?? '재사용 허가 확인 필요')} |`),
      ]
    : ['현재 권리 검토 대기 이미지 후보가 없습니다.']),
  '',
  '> 이 보고서는 후보와 기존 공식 생일만 다룹니다. 공개 공연·생일·이미지를 자동 승격하거나 외부 문의를 발송하지 않습니다.',
  '',
].join('\n');
const datedReportPath = path.join(reportDir, `${today}.md`);
fs.writeFileSync(datedReportPath, markdown, 'utf8');
console.log(`\nDaily report: ${path.relative(root, datedReportPath)}`);
console.log(`Upcoming birthdays: ${birthdays.length}; missing birth dates: ${missingBirthDates.length}`);
console.log(`Image candidates: ${imageCandidates.candidates.length}; rights review: ${imageRightsReview.length}`);
console.log(`Result: ${report.success ? 'PASS' : 'PARTIAL/FAIL'}`);
process.exitCode = report.success ? 0 : 1;
