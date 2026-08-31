# Chika Idol Box 일일 업데이트 운영 안내

## 목적과 안전 경계

이 명령은 공식 일정 공급원에서 공연 후보를 갱신하고, 기존 공식 생일을 기준으로 오늘부터 30일 이내 생일과 생일 미확인 멤버를 보고한다. 또한 분리된 이미지 후보 큐의 권리 검토·승인·거절 상태를 읽기 전용으로 요약한다. 네트워크 결과는 `data/chika-live-candidates.json`에만 저장하며 공개 공연·멤버·생일·이미지를 자동 게시하지 않는다.

## 실행 방법

- 바탕화면의 `Chika Idol Box 일일 업데이트.cmd`를 하루 한 번 실행한다. 이 파일은 저장소의 `scripts/run-daily-update.ps1`을 호출하며 콘솔 출력과 `.tmp/daily-update/launcher/YYYYMMDD-HHMMSS.log`를 함께 남긴다.
- 저장소에서 미리 보기: `node node_modules\tsx\dist\cli.mjs scripts\daily-update.ts`
- 후보 저장 실행: `node node_modules\tsx\dist\cli.mjs scripts\daily-update.ts --write`
- 네트워크 없이 생일·검증·보고 확인: `node node_modules\tsx\dist\cli.mjs scripts\daily-update.ts --skip-network`
- 운영 진입점 오프라인 확인: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts\run-daily-update.ps1 -Offline -NoPause`
- 바탕화면 래퍼 자동 검증: `"C:\Users\royal\Desktop\Chika Idol Box 일일 업데이트.cmd" --no-pause`

보고서는 `.tmp/daily-update/YYYY-MM-DD.md`와 `.tmp/daily-update/latest-report.json`에 생성된다. 일부 공급원이 실패해도 나머지 단계는 계속되며 최종 판정은 `PARTIAL/FAIL`로 표시된다.

PowerShell 운영 진입점은 Node·tsx·저장소를 사전 확인하고, 자식 명령 종료 코드뿐 아니라 이번 실행에서 `latest-report.json`이 새로 생성됐는지와 `success=true`인지까지 확인한다. 실패하면 기존 후보·보고서를 삭제하지 않고 실행 로그 경로와 비정상 종료 코드를 남긴다. 일반 더블클릭에서는 결과를 읽을 때까지 창을 유지하고, 자동 검증에서만 `-NoPause` 또는 `--no-pause`를 사용한다.

## 현재 자동 공급원

- タイトル未定 공식 Google Calendar ICS
- FRUITS ZIPPER 공식 일정 HTML
- FRUITS ZIPPER 공식 개별 일정 상세 보강

생일은 현재 공개 데이터에 공식 근거로 저장된 완전 생년월일(`birthDate`) 또는 연도 비공개 월·일(`birthMonthDay`)만 보고한다. 누락 생일과 출생연도·나이를 검색 결과나 이름으로 추정하지 않는다.

이미지 후보는 `data/chika-image-candidates.json`의 상태만 보고한다. `rights_review`를 승인으로 간주하지 않으며 이미지 다운로드·핫링크·문의 발송·공개 승격은 수행하지 않는다.
