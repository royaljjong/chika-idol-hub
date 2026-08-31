# Chika Idol Box 작업 지침

이 파일은 저장소 전체에 적용된다. 상위 경로의 공통 `AGENTS.md`와 함께 따른다.

## 문서 우선순위

작업 시작 시 다음 순서로 읽는다. 1~4번이 지침·현행 제품·실행·운영 기준이며, 주제 문서는 해당 작업에서 필요한 설계·기술 이력을 보충한다.

1. `AGENTS.md`
2. `AUDIT_AND_REBUILD_PLAN.md`
3. `WORK_ORDER.md`
4. `CODEX_HANDOVER.md`
5. `SOURCE_RESEARCH_AND_MVP.md` — 대규모 출처·그룹·공연·그라비아 확장 작업일 때
6. `MAP_DISCOVERY_MVP.md` — 지도·지역·공연장·티켓 탐색의 결정 이력이 필요할 때
7. `MAP_TECH_SPIKE.md` — 실제 지도 기술·타일·경계·성능의 결정 이력이 필요할 때
8. `GRAVURE_DISCOVERY_MVP.md` — 그라비아 출판·권리·인물 연결 작업일 때

`CODEX_HANDOVER.md`가 유일한 현행 인수인계다. 주제 문서에 역사·시점 고정 배너가 있거나 현행 계획·인수인계와 충돌하면 `AUDIT_AND_REBUILD_PLAN.md`, 최신 `WORK_ORDER.md`, `CODEX_HANDOVER.md`를 우선한다. `HANDOVER.md`는 2026-08-16 초기 프로토타입의 역사 자료이며 현재 데이터 수, 기능 상태, 실행·배포 절차의 근거로 사용하지 않는다. `ADVERSARIAL_REVIEW_2026-08-29.md`도 당시 상태의 감사 기록이지 현재 우선순위가 아니다.

## 변경 전 설계

- 코드, 데이터, UI, 설정, 자동화, 문서 구조를 바꾸기 전에 제품 기획서와 작업지시서를 먼저 갱신한다.
- 사용자 의도, 영향 범위, 데이터·UI·명령 연결, 실패·빈 상태, 회귀 위험, 완료 조건, 검증 방법을 기록한다.
- 공식 출처가 없는 멤버 정보, SNS, 지표, 공연, 이미지 권리 상태를 추정하지 않는다.
- 기존 `former` 레코드와 사용자의 미커밋 변경을 임의로 삭제하거나 되돌리지 않는다.

## 기본 검증

변경 범위에 맞게 다음을 실행하고 실제 결과를 `WORK_ORDER.md`에 기록한다.

```powershell
node node_modules\tsx\dist\cli.mjs scripts\validate.ts
node node_modules\typescript\bin\tsc --noEmit
node node_modules\next\dist\bin\next build
git diff --check
```

위 네 명령은 코드·데이터 변경의 기본 검증이다. 후보 데이터·일일 운영·인수인계 또는 릴리스 기준선을 변경할 때는 `CODEX_HANDOVER.md`의 최신 검증 기준선에 따라 오프라인 일일 실행, 후보 보고, 필요한 HTTP 스모크를 추가한다. 문서만 변경한 경우에는 관련 Markdown 상태·참조 전수 검색과 `git diff --check`를 수행하고 코드 빌드는 변경 영향이 없음을 작업지시서에 명시할 수 있다.

검증하지 못한 항목은 통과로 기록하지 않는다. 배포와 외부 데이터 수집은 사용자 요청 범위에 포함될 때만 수행한다.
