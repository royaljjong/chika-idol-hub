# Chika Idol Box — 현행 인수인계

기준일: 2026-09-01
저장소: `D:\drive\programming\window\Chika Idol Box`
브랜치/배포 SHA: `codex/trust-data-phase2` / `3cb2234`
프로덕션: https://chika-idol-hub.vercel.app
현행 상태: 제품 런타임은 커밋 `3cb2234`, Vercel 배포 `dpl_6gGN5AxRSeiY6d1QjGvc51EnsGsH`로 production READY다. 배포 메타데이터를 기록한 후속 문서 커밋은 런타임 변경이 아니다.

이 문서가 유일한 현행 인수인계다. `HANDOVER.md`는 2026-08-16 초기 프로토타입의 폐기된 역사 자료다. 의사결정 이력은 `AUDIT_AND_REBUILD_PLAN.md`, 실행 이력은 `WORK_ORDER.md`를 본다.

## 1. 제품 의도와 고정 흐름

공식 근거가 있는 일본 라이브아이돌을 지역·그룹·멤버·공연 기준으로 탐색하고 공식 원문·티켓·공연장으로 연결하는 일본어·한국어·영어 디렉터리다.

`일본 열도 형상 탐색 → 도시 → 활동 지역 → 비주얼 그룹 카드 → 그룹 상세 → 프로필·멤버 또는 라이브·공연장 지도`

- 홈은 범용 도로지도가 아니라 실제 일본 열도 형상의 단계형 탐색 UI다.
- 도시 선택 후 아키하바라·시부야 같은 활동 지역과 해당 그룹 카드를 표시한다.
- 실제 도로·공연장 지도는 선택 그룹의 `라이브 · 공연장 지도` 탭에서만 지연 로드한다.
- 지도/WebGL/좌표/일정이 실패하거나 비어도 목록과 공식 링크는 유지한다.
- 이 흐름은 사용자 실화면 승인을 받았다. 홈을 범용 실지도와 하단 그룹 목록 구조로 되돌리지 않는다.

## 2. 신뢰·권리·안전 경계

- 날짜 판정은 `Asia/Tokyo`를 사용한다. 후보는 사람의 검증 전 공개 데이터로 자동 승격하지 않는다.
- 출처 URL·확인일·종류를 기록하고 생일·연도·활동 상태·색상·장소를 추정하지 않는다.
- 연도 비공개 생일은 `birthMonthDay: MM-DD`, 완전 생년월일은 `birthDate: YYYY-MM-DD`로 보존한다.
- 공식 색상명만 있으면 UI 근사값과 `memberColorBasis=official_name_approximation`을 함께 저장한다.
- 그룹 고유 담당 요소는 색상과 분리한다. FRUiTY 담당 과일은 `memberMotif`다.
- 이미지 순서는 `허가된 공식 사진 → 허가된 공식 로고 → 자체 텍스트 워드마크 → 이름 기반 대체 비주얼`이다.
- 공식 페이지에 자산이 있다는 이유만으로 복제·다운로드·핫링크하지 않는다. 그라비아는 권리 확인 전 `link_only`다.
- 가십·루머·사생활 침해와 미성년자의 공식 기본 프로필 밖 정보는 수록하지 않는다.
- 커밋·배포·이미지 문의 발송은 사용자 별도 승인 전 수행하지 않는다.

## 3. 현재 데이터·운영 기준선

2026-09-01 최신 수동 일일 실행 기준:

| 항목 | 현재 값 |
|---|---:|
| 공개 그룹 / 전체 멤버 | 37 / 188 |
| 공간 영역 | 9 |
| 공개 공연 / 공연 후보 | 70 / 55 |
| 공식 공지 | 4 |
| 그라비아 공개 / 후보 | 5 / 2 |
| 생일 미확인 현역 | 28 |
| 향후 30일 생일 | 19 |
| 그룹 이미지 | 공식 0 / 워드마크 11 / 대체 26 |
| 멤버 이미지 | 공식 0 / 대체 188 |
| 이미지 후보 | 전체 3 / 권리 검토 2 / 승인 0 / 거절 1 |
| 데이터 경고 | 검토 항목 24 |

동적 수치는 `.tmp/daily-update/latest-report.json`과 당일 보고서를 다시 생성해 확인한다.

## 4. MVP 진행 상태

| MVP | 상태 | 결과 |
|---|---|---|
| A 신뢰 기반 | 완료 | 일본 날짜, 출처, 후보/공개 분리, 검증 계약 |
| B 핵심 발견 흐름 | 완료·사용자 승인 | 일본 → 도시 → 활동 지역 → 그룹 → 상세, URL 복원 |
| C 그룹별 라이브 | 완료 | 선택 그룹 일정, 검증 공연장, 실지도, 길찾기 |
| D 안전한 비주얼 | 운영 중 | 이미지 계약·폴백·권리 큐, 승인 공식 자산 0건 |
| E 일일 운영 루프 | 완료 | 공연 후보·생일·검증·이미지 권리 큐 연결 |
| F 데이터 깊이 | 진행 중 | F-1~F-25 완료, 생일 미확인 152명 → 28명; F-25는 공식 근거 부재 재감사 |
| C/E 공연 운영 | 진행 중 | C/E-1~14 완료; 공식 상세 완결 후보 32건 승격, 공개 공연 70건·공개 연결 후보 45건; C/E-14 공식 ICS 갱신 후 미완결 5건 유지 |
| G 확장 가지 | 대기 | 그라비아·공지·검색은 별도 정책 게이트 후 진행 |
| H 인수인계 정합성 | H-1~5 완료 | 현행 기준 단일화, 다국어 HTTP 스모크, 문서 권위와 기능·URL·데이터·검증 계약 정합화 |

### 완료된 F 배치

- F-1 selfish 6명: 월·일 생일, `birthMonthDay` 계약.
- F-2 I’mew 6명: 생일 4명, 애칭 6명.
- F-3 可憐なアイボリー 11명: 완전 생년월일·애칭·출신지.
- F-4 AsIs 7명: 월·일 생일·출신지·담당색.
- F-5 UtaGe! 7명: 월·일 생일·담당색 근거.
- F-6 FRUiTY 9명: 월·일 생일·담당 과일, `memberMotif` 교정.
- F-7 HelloYouth 9명: 완전 생년월일·출신지·담당색.
- F-8 JamsCollection 8명: 월·일 생일·애칭·출신지·담당색.
- F-9 MAGICAL SPEC 8명: 월·일 생일·출신지·담당색.
- F-10 NANIMONO 7명: 월·일 생일·담당색.
- F-11 Palette Parade 7명: 월·일 생일.
- F-12 AVAM 7명: 월·일 생일·애칭·담당색.
- F-13 Ringwanderung 5명: 월·일 생일·출신지.
- F-14 NEO BREAK 6명: 월·일 생일·개인 공식 근거. 애칭·출생연도·사진은 미반영.
- F-15 FES☆TIVE 与田理央那 1명: 완전 생년월일·출신지·담당색·공식 공공기관 근거. 애칭·사진·SNS는 미반영.
- F-16 手羽先センセーション 宮代柚花 1명: 월·일 생일·출신지·개인 공식 근거. 출생연도·담당색·애칭·사진·SNS는 미반영.
- F-17 BYBBiT 5명: 월·일 생일·담당색·소속사 개인 공식 근거. 출생연도·출신지·애칭·사진·SNS는 미반영.
- F-18 ドラマチックレコード 新居歩美 1명: 완전 생년월일·출신지·소속사 개인 공식 근거.
- F-19 ドラマチックレコード 高梨有咲 1명: 완전 생년월일·출신지·담당색·공식 출판사 근거.
- F-20 CYNHN 月雲ねる 1명: 월·일 생일·소속사 개인 공식 근거.
- F-21 CYNHN 3명: 월·일 생일·소속사 개인 공식 근거로 현역 4인 생일 완결.
- F-22 エイアイカ 3명: 월·일 생일·출신지·그룹 공식 사이트 근거로 현역 3인 생일 완결.
- F-23 INUWASI 6명: 월·일 생일·개인 공식 페이지 근거. 메인 홈 5인과 별도 공식 인덱스·최근 행사 자료 6인 표기가 충돌해 활동 상태는 보존.
- F-24 Sweet Alley 笹木里緒菜 1명: 완전 생년월일·출신지·TWIN PLANET 공식 개인 프로필 근거.
- F-25 잔여 28명 공식 근거 재감사: MyDearDarlin’·Mirror,Mirror·Sweet Alley·ドラマチックレコード·yosugala의 공식 출처 가용성을 재확인했으나 새 개인 생일 원문이 없어 빈 상태를 보존.

모든 배치에서 권리 미확인 사진은 추가하지 않았다. 세부 출처와 검증 결과는 `WORK_ORDER.md`에 있다.

## 5. 생일 미확인 잔여 28명

| 그룹 | 인원 | 현재 제약 |
|---|---:|---|
| Sweet Alley | 7 | 笹木里緒菜 외 멤버의 공식 개인 프로필 근거 부족 |
| MyDearDarlin' | 7 | 공식 현역 7인·프로필 인덱스는 확인, 개인 생일 원문 없음 |
| Mirror,Mirror | 6 | 공식 프로필에서 개인 생일 원문 미확보 |
| ドラマチックレコード | 4 | 공식 소속사 그룹 프로필은 현역 명단만 제공, 개인 생일 없음 |
| yosugala | 4 | 공식 사이트에서 개인 생일 원문 미확보 |

합계 28명이다. 공식 페이지가 불완전하거나 열리지 않으면 부분 추정하지 않는다.

## 6. 지도·라이브 상태

- 홈은 `public/maps/japan-prefectures.svg` 기반 단계형 탐색이며 출처는 `public/maps/README.md`와 UI에 표시한다.
- `mapRegion`, `mapDistrict` URL과 그룹 breadcrumb로 선택 상태를 왕복 복원한다.
- 지역과 구역은 공통 소속 계약으로 검증하며 교차 지역 조합은 도시 단계로 정규화한다.
- 그룹 라이브 탭은 `?tab=live`로 복원하고 잘못된 값은 프로필로 정규화한다.
- 라이브의 `mode`, `date`, `region`, `group` 필터는 URL·새로고침·뒤로가기에서 복원되고 잘못된 값은 제거된다. 취소 공연은 예정 보기에서 제외한다.
- `GroupLiveMap.tsx`는 선택 그룹의 예정 공연 중 좌표 검증 공연장만 표시한다.
- 지도 실패·좌표 없음에도 일정 목록을 유지한다. 공개 공연과 후보는 분리한다.
- 기술 이력은 `MAP_DISCOVERY_MVP.md`, `MAP_TECH_SPIKE.md`를 본다. 과거 홈 MapLibre 설계는 현재 제품 흐름보다 우선하지 않는다.

## 7. 일일 수동 업데이트

바탕화면 `C:\Users\royal\Desktop\Chika Idol Box 일일 업데이트.cmd`를 사용자가 하루 한 번 실행한다. 예약 작업은 없다. CMD는 ASCII·CRLF 래퍼이며 저장소의 `scripts/run-daily-update.ps1`을 호출한다.

```powershell
node node_modules\tsx\dist\cli.mjs scripts\daily-update.ts --write
```

- 네트워크 수집은 タイトル未定·FRUITS ZIPPER 후보만 갱신하고 자동 공개하지 않는다.
- 오프라인 점검은 `--skip-network`를 사용한다.
- 보고서는 `.tmp/daily-update/YYYY-MM-DD.md`와 `latest-report.json`에 생성된다.
- 실행별 영구 로그는 `.tmp/daily-update/launcher/YYYYMMDD-HHMMSS.log`에 생성된다. PowerShell 진입점은 Windows PowerShell 5.1에서도 Node 출력과 BOM 없는 JSON을 UTF-8로 읽고, 보고서가 이번 실행에서 갱신됐는지와 `success=true`까지 확인한다.
- 권리 판정 변경, 외부 문의, 공개 승격은 자동으로 하지 않는다.

## 8. 최신 검증 기준선

2026-09-01 MVP H-5 전체 계약 정합화 완료 결과다.

- 오프라인 일일 업데이트·데이터 계약: PASS.
- TypeScript `--noEmit`: PASS.
- ESLint CLI `--max-warnings=0`: PASS.
- 일본 날짜·파라미터 회귀 계약: PASS.
- Next.js 프로덕션 빌드: PASS, 774/774. C/E-2에서 보존한 이전 캐시는 `.tmp/next-before-ce2`에 있다.
- 홈 첫 로드 144kB, 그룹 상세 203kB, 멤버 상세 137kB.
- `git diff --check`: PASS. 기존 LF→CRLF 경고만 있음.
- 로컬 프로덕션 HTTP 스모크: 3개 언어 홈·라이브·대표 그룹·멤버·C/E-13 공연 5건 상세와 의도된 404를 포함해 28/28 PASS.
- 지도 핵심 흐름과 그룹 라이브 지도: 사용자 실화면 승인 완료.
- 2026-09-01 수동 갱신기 재검증: PowerShell 5.1 오프라인 진입점과 실제 바탕화면 CMD write가 종료 코드 0, 최신 보고서 `success=true`; 후보 55건·향후 생일 19명·미확인 생일 28명.
- 2026-09-01 Release R-1: `3bd93ea` 전체 구현과 `3cb2234` 배포 입력 정리를 원격 브랜치에 푸시했다. 최종 Vercel production `dpl_6gGN5AxRSeiY6d1QjGvc51EnsGsH`는 READY·기본 alias 연결 완료다.
- `.vercelignore` 적용으로 CLI 업로드가 391.5MB·2175파일에서 362.3KB·148파일로 감소했다.
- 프로덕션 스모크 5/5: `/ko`, `/ja/live`, `/en/g/fruits-zipper?tab=live`, `/ko/m/fz-matsumoto-karen`는 200, `/ko/live/does-not-exist`는 404. 최근 1시간 Vercel error 로그 0건.

```powershell
node node_modules\tsx\dist\cli.mjs scripts\daily-update.ts --skip-network
node node_modules\tsx\dist\cli.mjs scripts\report-live-candidates.ts
node node_modules\tsx\dist\cli.mjs scripts\report-image-candidates.ts
node node_modules\tsx\dist\cli.mjs scripts\validate.ts
node node_modules\tsx\dist\cli.mjs scripts\verify-japan-date.ts
node node_modules\tsx\dist\cli.mjs scripts\verify-parameters.ts
node node_modules\eslint\bin\eslint.js . --max-warnings=0
node node_modules\typescript\bin\tsc --noEmit
node node_modules\next\dist\bin\next build
git diff --check
node node_modules\next\dist\bin\next start --port 3001
```

앞의 목록은 후보·운영·인수인계 또는 릴리스 기준선을 재검증할 때 사용하는 확장 검사다. 일반 코드·데이터 변경은 `AGENTS.md`의 기본 네 명령을 최소 기준으로 적용하고, 문서만 변경한 H-4 같은 작업은 관련 Markdown 상태·참조 전수 검색과 `git diff --check`로 검증 범위를 제한한다. `next start`는 서버를 띄운 뒤 별도 HTTP 요청과 종료 확인까지 수행해야 스모크 통과로 기록할 수 있다.

Windows 오류 1920이 나면 3001 포트의 기존 Next 프로세스를 확인·종료한 뒤 빌드한다. 작업 트리를 삭제하거나 초기화하지 않는다.

## 9. 다음 권장 순서

1. 개인별 공식 소속사·프로필 근거가 새로 확보된 멤버는 승인된 소배치 정책대로 반영한다. 생탄제·SNS 계정명·2차 기사만으로는 반영하지 않는다.
2. Sweet Alley·MyDearDarlin’·Mirror,Mirror·ドラマチックレコード·yosugala 잔여 28명은 정확한 생일을 명시한 공식 프로필이 확보될 때까지 빈 상태를 유지한다.
3. FRUITS ZIPPER·CANDY TUNE 이미지 문의는 필수 MVP가 아니므로 발송하지 않는다. 일반 텍스트·자체 워드마크·공식 링크·사진 비노출을 유지한다.
4. 잔여 28명은 승인된 반영 단위 정책에 따라 공식 근거 가용성 순으로 줄인다.
5. 공연 후보 55건 중 공개 연결 45건, 제외 4건(사진집/미디어 2·생일 2)이다. ASOBIEXPO HAWAII 1건은 공식 시간·일반권 가격 발표 대기이며, タイトル未定의 상세 부족 3건·분류 대기 2건은 공식 원문을 계속 조사한다.
6. MVP G(그라비아·공지·검색 확장)는 별도 사용자 승인 대기다. 승인 시에도 공개 UI·자동 승격·외부 전송 없이 격리된 오프라인 후보 어댑터 계약과 검증기부터 시작한다.

## 10. Git·배포 경계

- 제품 배포 기준 SHA는 `3cb2234`다. 후속 인수인계 문서 커밋은 런타임 변경 없이 배포 사실만 기록한다.
- 이후 변경은 다시 로컬 검증·커밋·푸시·Vercel READY·공개 HTTP 검증을 모두 거쳐야 프로덕션 반영으로 기록한다.
- 사용자의 명시적 요청 없이 추가 커밋·푸시·Vercel 배포를 수행하지 않는다.
- `.env`, 자격 증명, 개인 데이터는 문서나 외부 모델 입력에 포함하지 않는다.

## 11. 핵심 문서·파일

- 제품·MVP: `AUDIT_AND_REBUILD_PLAN.md`
- 실행 설계·결과: `WORK_ORDER.md`
- 현행 운영·인수인계: `CODEX_HANDOVER.md`
- 일일 운영: `DAILY_UPDATE.md`
- 지도: `MAP_DISCOVERY_MVP.md`, `MAP_TECH_SPIKE.md`
- 이미지 권리: `IMAGE_PERMISSION_REQUESTS.md`, `data/chika-image-candidates.json`
- 그룹·멤버: `data/chika-groups.json`, `src/lib/schema.ts`, `src/lib/data.ts`
- 공연: `data/chika-live.json`, `data/chika-live-candidates.json`
- 지도 UI: `src/components/map/InteractiveJapanMap.tsx`, `src/components/map/GroupLiveMap.tsx`
- 실행·검증: `scripts/daily-update.ts`, `scripts/validate.ts`
- Windows 수동 운영 진입점: `scripts/run-daily-update.ps1`, 바탕화면 `Chika Idol Box 일일 업데이트.cmd`

문서 권위는 `AUDIT_AND_REBUILD_PLAN.md` → 최신 `WORK_ORDER.md` → `CODEX_HANDOVER.md` 순으로 현재 의도·실행·운영 상태를 연결한다. 역사·시점 고정 배너가 있는 주제 문서는 기술·결정 이력으로만 사용한다. 완료 보고 전 제품 계획, 작업지시서 실제 결과, 이 문서의 현재 수치를 다시 대조한다.
