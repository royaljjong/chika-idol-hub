# 🗾 日本全国 地下アイドル 허브 (Chika Idol Hub) 인수인계 및 프로젝트 기술 명세서

> **최종 수정일:** 2026-08-16  
> **프로젝트 위치:** `C:\Users\royal\Desktop\programming\window\Chika Idol Box`  
> **GitHub 저장소:** [https://github.com/royaljjong/chika-idol-hub](https://github.com/royaljjong/chika-idol-hub)  
> **Vercel 프로덕션 배포 URL:** [https://chika-idol-hub.vercel.app](https://chika-idol-hub.vercel.app)  

---

## 1. 📌 프로젝트 개요 및 핵심 기획 배경

일본 전국(도쿄, 오사카, 삿포로, 나고야, 후쿠오카)에서 활동 중인 **실제 현역 지하아이돌/라이브아이돌**의 공식 링크, 라이브 티켓 예매처, 온라인 체키 스토어, SNS, 그라비아 화보, 생일, 랭킹을 **사카미치 허브 감성의 정돈된 UI와 인터랙티브 일본 지도**로 제공하는 다국어(한국어/일본어/영어) 웹 플랫폼입니다.

[liveidol.blog](https://liveidol.blog/) (지하아이돌 전선)의 방대한 정보 구조를 현대적인 Next.js 15 App Router와 Glassmorphism 디자인으로 재해석하여 구축되었습니다.

---

## 2. 🗂️ 프로젝트 디렉터리 및 코드 구조

```
Chika Idol Box/
├── data/                               # JSON 데이터베이스 원천 파일
│   ├── chika-groups.json               # 18대 걸그룹 및 소속 멤버 전체 데이터
│   ├── chika-notices.json              # 공식 오시라세 (라이브 속보, 공지사항)
│   └── chika-gravure.json              # 그라비아 & 비주얼 사진집 아카이브
│
├── public/                             # 정적 에셋 (100% 로컬 SVG 파이프라인)
│   ├── images/
│   │   ├── groups/                     # 걸그룹 공식 비주얼 배너 SVGs (fruits-zipper.svg 등)
│   │   └── members/                    # 멤버별 포트레이트 SVGs (fz-sakurai-yui.svg 등)
│   └── favicon.ico
│
├── scripts/                            # 데이터 시딩 및 에셋 생성 스크립트
│   ├── generate-assets.ts              # 로컬 SVG 배너/멤버 아바타 생성기
│   ├── seed-chika-all.ts               # 18대 그룹, 오시라세, 그라비아, 랭킹 통합 시드
│   └── seed-chika.ts                   # Next 빌드/실행 시드 진입점
│
├── src/
│   ├── app/
│   │   ├── [locale]/                   # 다국어 라우팅 (next-intl: ja, ko, en)
│   │   │   ├── page.tsx                # 메인 홈 화면 (오시라세 + 지도 + 랭킹 + 생일 + 화보 + 그룹목록)
│   │   │   ├── layout.tsx              # 루트 레이아웃 (NextIntlClientProvider, 폰트)
│   │   │   ├── about/page.tsx          # 서비스 소개 페이지
│   │   │   ├── search/page.tsx         # 아이돌/멤버 통합 검색 페이지
│   │   │   ├── g/[groupId]/page.tsx    # 그룹 상세 페이지 (배너 + 링크바 + 멤버 3대 랭킹 탭)
│   │   │   └── m/[memberId]/page.tsx   # 멤버 개인 상세 페이지 (검증된 SNS/블로그 링크망)
│   │   └── not-found.tsx
│   │
│   ├── components/
│   │   ├── map/
│   │   │   └── InteractiveJapanMap.tsx # 🌟 3단계 인터랙티브 전국 지도 (전국 ➔ 구역 ➔ 그룹 ➔ 멤버)
│   │   ├── group/
│   │   │   └── GroupCard.tsx           # 걸그룹 카드 (공식 배너 + 컬러바 + 아바타 링 + 티켓/체키)
│   │   ├── member/
│   │   │   ├── MemberAvatar.tsx        # 담당 컬러 링 포함 멤버 아바타
│   │   │   └── MemberCard.tsx          # 멤버 카드 (한글/한자명, 닉네임, 생년월일, 컬러뱃지)
│   │   ├── home/
│   │   │   ├── NoticeFeed.tsx          # 📢 공식 오시라세 & 라이브 속보 피드
│   │   │   ├── IdolLeaderboard.tsx     # 🏆 전체 아이돌 3대 랭킹 (인기/팔로워/검색량 탭)
│   │   │   ├── BirthdayTracker.tsx     # 🎂 아이돌 생일 캘린더 (이번달/다음달)
│   │   │   └── GravureSection.tsx      # 📸 그라비아 & 비주얼 사진집 아카이브
│   │   └── ui/
│   │       ├── Navigation.tsx          # 상단 글로벌 네비게이션 & 언어 전환기(JA/KO/EN)
│   │       └── Footer.tsx              # 하단 푸터
│   │
│   ├── i18n/
│   │   ├── routing.ts                  # locales: ['ja', 'ko', 'en'], defaultLocale: 'ja'
│   │   └── request.ts                  # getRequestConfig 설정
│   │
│   ├── lib/
│   │   ├── schema.ts                   # Zod 스키마 정의 (ChikaGroup, ChikaMember, ChikaNotice 등)
│   │   └── data.ts                     # 데이터 조회 및 랭킹 정렬 함수 모음
│   │
│   └── messages/                       # 다국어 번역 사전
│       ├── ja.json                     # 일본어 사전
│       ├── ko.json                     # 한국어 사전
│       └── en.json                     # 영어 사전
│
├── package.json                        # 종속성 및 실행 스크립트 정의
└── tsconfig.json
```

---

## 3. ⚙️ 주요 핵심 기능 및 구현 세부사항

### A. 🗺️ 지도 ➔ 구역 ➔ 그룹 ➔ 멤버 ➔ 개인 SNS 완벽 드릴다운 ([InteractiveJapanMap.tsx](file:///C:/Users/royal/Desktop/programming/window/Chika%20Idol%20Box/src/components/map/InteractiveJapanMap.tsx))
1. **Level 1 (전국 맵)**:
   - 홋카이도・삿포로(❄️), 도쿄(🗼), 나고야(🏯), 오사카(🐙), 후쿠오카(🍜) 5대 주요 도시 핀 노출.
2. **Level 2 (도시 구역 전환)**:
   - 도쿄 클릭 시 도쿄 23구의 4대 핵심 지하아이돌 거점 구역으로 전환:
     - 🎀 **하라주쿠/오모테산도**: FRUITS ZIPPER, CANDY TUNE, CUTIE STREET, SWEET STEADY (KAWAII LAB.)
     - 🛍️ **시부야**: Appare!, GANG PARADE (WACK), Jams Collection
     - 🌃 **신주쿠**: iLiFE!, 夜光性アミューズ, のんふぃく！ (HEROINES)
     - ⚡ **아키하바라**: でんぱ組.inc, 虹のコンキスタドール, FES☆TIVE
3. **Level 3 (구역 소속 그룹)**:
   - 구역 클릭 시 공식 로고와 단체 사진 배너가 담긴 `GroupCard` 그리드 노출.
4. **Level 4 (그룹 상세 및 멤버)**:
   - 그룹 카드 클릭 시 `/g/[groupId]`로 이동하여 멤버 전원의 실제 사진, 한글/한자명, 담당 컬러 확인.
5. **Level 5 (개인 SNS 직결)**:
   - 멤버 카드 클릭 시 `/m/[memberId]`로 이동하여 공식 X, 인스타그램, 틱톡, SHOWROOM, 블로그 바로 연결.

---

### B. 🏆 전체 아이돌 3대 랭킹 리더보드 ([IdolLeaderboard.tsx](file:///C:/Users/royal/Desktop/programming/window/Chika%20Idol%20Box/src/components/home/IdolLeaderboard.tsx))
- 홈 화면에서 원클릭으로 3개 지표를 실시간 전환 정렬:
  1. 👑 **인기 순위 (`popularity`)**: 종합 팬덤 및 라이브 동원력 지수 (예: 마츠모토 카렌 99점, 신조메 리리 99점)
  2. 📈 **팔로우 순위 (`followers`)**: X(Twitter) + Instagram 종합 팔로워 수 (예: 신조메 리리 55만, 마츠모토 카렌 51.5만)
  3. 🔥 **검색량(이슈) 순위 (`search`)**: 미디어 노출 및 주간 검색 트렌드 버즈량 (예: 99pt, 98pt)
- 🥇 1위, 🥈 2위, 🥉 3위 메달 뱃지와 커스텀 글로우 카드 스타일링 적용.

---

### C. 👥 그룹 페이지 내 멤버 3대 랭킹 필터 ([g/[groupId]/page.tsx](file:///C:/Users/royal/Desktop/programming/window/Chika%20Idol%20Box/src/app/[locale]/g/[groupId]/page.tsx))
- 각 걸그룹 페이지 상단에 `[👑 인기순] [📈 팔로우순] [🔥 검색량순]` 필터 탭 제공.
- 탭 선택 시 해당 그룹 내부 멤버들이 해당 순위에 맞춰 즉시 재정렬되고 카드 상단에 실시간 순위 뱃지와 점수가 표시됨.

---

### D. 📢 오시라세, 🎂 생일 캘린더, 📸 그라비아 아카이브
1. **NoticeFeed (`NoticeFeed.tsx`)**: 전국 투어, 무도관 공연, 신곡 릴리즈, 화보 소식 등 공식 속보 타임라인.
2. **BirthdayTracker (`BirthdayTracker.tsx`)**: 이번 달 및 다가오는 생일의 멤버들을 모아 축하 아바타 링 제공.
3. **GravureSection (`GravureSection.tsx`)**: 주간 영점프, 주간 플레이보이, 영 애니멀 등 주요 잡지 표지/권두 화보 아카이브.

---

### E. 🌐 3개 국어 (KO / JA / EN) 완전 지원
- `next-intl` 기반 다국어 라우팅 (`/ja`, `/ko`, `/en`).
- 모든 그룹명, 멤버명, 지역명, 공지사항, 뱃지, 네비게이션 텍스트가 1:1 완벽 번역 매핑됨.

---

## 4. 💻 작업 및 실행 명령어 모음 (CLI Reference)

### 1) 프로젝트 의존성 설치
```powershell
# 프로젝트 루트 폴더에서 실행
cd "C:\Users\royal\Desktop\programming\window\Chika Idol Box"
pnpm install
# 또는
npm install
```

### 2) 비주얼 에셋(SVG) 및 데이터베이스 시딩
```powershell
# 18대 걸그룹 및 멤버 로컬 SVG 에셋 생성
node node_modules/tsx/dist/cli.mjs scripts/generate-assets.ts

# 그룹, 오시라세, 그라비아, 랭킹 JSON 데이터 파일 시딩
node node_modules/tsx/dist/cli.mjs scripts/seed-chika.ts
```

### 3) 로컬 개발 서버 실행
```powershell
npm run dev
# 브라우저에서 http://localhost:3000 접속
```

### 4) 프로덕션 빌드 검증
```powershell
node node_modules/next/dist/bin/next build
```

### 5) Git 커밋 & Vercel 프로덕션 배포
```powershell
git add .
git commit -m "feat: your commit message"
git push origin main

# Vercel 프로덕션 즉시 배포
npx vercel --prod --yes
```

---

## 5. 🔍 상태 점검 및 유지보수 가이드

| 항목 | 확인 방법 / 대상 파일 |
|:---|:---|
| **새로운 걸그룹 추가** | [scripts/seed-chika-all.ts](file:///C:/Users/royal/Desktop/programming/window/Chika%20Idol%20Box/scripts/seed-chika-all.ts) 의 `CHIKA_GROUPS_COMPLETE` 배열에 추가 후 `seed-chika.ts` 실행 |
| **새로운 공지(오시라세) 등록** | [scripts/seed-chika-all.ts](file:///C:/Users/royal/Desktop/programming/window/Chika%20Idol%20Box/scripts/seed-chika-all.ts) 의 `CHIKA_NOTICES_DATA`에 항목 추가 후 시드 실행 |
| **그라비아 화보 등록** | [scripts/seed-chika-all.ts](file:///C:/Users/royal/Desktop/programming/window/Chika%20Idol%20Box/scripts/seed-chika-all.ts) 의 `CHIKA_GRAVURE_DATA`에 항목 추가 후 시드 실행 |
| **지도 구역/도시 수정** | [src/components/map/InteractiveJapanMap.tsx](file:///C:/Users/royal/Desktop/programming/window/Chika%20Idol%20Box/src/components/map/InteractiveJapanMap.tsx) 의 `REGIONS` 및 `TOKYO_DISTRICTS` 상수 수정 |
| **다국어 문구 수정** | [src/messages/ja.json](file:///C:/Users/royal/Desktop/programming/window/Chika%20Idol%20Box/src/messages/ja.json), [ko.json](file:///C:/Users/royal/Desktop/programming/window/Chika%20Idol%20Box/src/messages/ko.json), [en.json](file:///C:/Users/royal/Desktop/programming/window/Chika%20Idol%20Box/src/messages/en.json) 파일 수정 |

---

## 6. 🚀 라이브 확인 링크 모음

- **메인 홈페이지 (일본어 기본):** [https://chika-idol-hub.vercel.app/ja](https://chika-idol-hub.vercel.app/ja)
- **메인 홈페이지 (한국어):** [https://chika-idol-hub.vercel.app/ko](https://chika-idol-hub.vercel.app/ko)
- **메인 홈페이지 (영어):** [https://chika-idol-hub.vercel.app/en](https://chika-idol-hub.vercel.app/en)
- **그룹 상세 예시 (FRUITS ZIPPER):** [https://chika-idol-hub.vercel.app/ko/g/fruits-zipper](https://chika-idol-hub.vercel.app/ko/g/fruits-zipper)
- **멤버 SNS 예시 (사쿠라이 유이):** [https://chika-idol-hub.vercel.app/ko/m/fz-sakurai-yui](https://chika-idol-hub.vercel.app/ko/m/fz-sakurai-yui)
