import { setRequestLocale } from 'next-intl/server';
import { getGroups, getNotices, getGravureFeatures, getUpcomingBirthdays, getAllRankedMembers } from '@/lib/data';
import { Navigation } from '@/components/ui/Navigation';
import { Footer } from '@/components/ui/Footer';
import { InteractiveJapanMap } from '@/components/map/InteractiveJapanMap';
import { GroupCard } from '@/components/group/GroupCard';
import { NoticeFeed } from '@/components/home/NoticeFeed';
import { GravureSection } from '@/components/home/GravureSection';
import { BirthdayTracker } from '@/components/home/BirthdayTracker';
import { IdolLeaderboard } from '@/components/home/IdolLeaderboard';
import type { Metadata } from 'next';
import { Link } from '@/i18n/routing';
import { getJapanCalendarDate } from '@/lib/japan-date';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;

  let title = '日本全国 地下アイドル | 公式リンク・地域・ライブ情報';
  let description = '公式出典を確認した日本のライブアイドルを地域・グループ・メンバー・ライブから探し、公式サイト・チケット・会場へ移動できる多言語ディレクトリ。';

  if (locale === 'ko') {
    title = '일본 전국 지하아이돌 | 공식 링크·지역·라이브 정보';
    description = '공식 출처가 확인된 일본 라이브아이돌을 지역·그룹·멤버·공연으로 탐색하고 공식 사이트·티켓·공연장으로 이동하는 다국어 디렉터리입니다.';
  } else if (locale === 'en') {
    title = 'Japan Underground Idols | Verified Groups, Lives & Official Links';
    description = 'Explore verified Japanese live-idol groups, members and events by region, then continue to official sites, tickets and venues.';
  }

  return {
    title,
    description,
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const groups = getGroups();
  const notices = getNotices();
  const gravures = getGravureFeatures();
  const birthdays = getUpcomingBirthdays();
  const rankedMembers = getAllRankedMembers();
  const currentJapanMonth = Number(getJapanCalendarDate().slice(5, 7));

  return (
    <div className="relative min-h-screen flex flex-col justify-between">
      <Navigation showBrand={false} />

      <main id="main-content" className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex-1 w-full">
        {/* Centered Clean Title (Sakamichi style) */}
        <div className="text-center max-w-2xl mx-auto my-8 sm:my-12">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-star-white font-[family-name:var(--font-klee-one)]">
            {locale === 'ko' ? '일본 전국 지하아이돌' : locale === 'ja' ? '日本全国 地下アイドル' : 'Japan Underground Idols'}
          </h1>
          <p className="text-xs sm:text-sm text-star-dim mt-3">
            {locale === 'ko'
              ? '공식 출처 기반 지역 탐색・그룹・멤버・라이브・생일 정보'
              : locale === 'ja'
              ? '公式出典に基づく地域・グループ・メンバー・ライブ・誕生日情報'
              : 'Verified regional discovery, groups, members, live events and birthdays'}
          </p>
        </div>

        {/* 1. Region-first discovery */}
        <div className="mb-14">
          <div className="mb-6 flex flex-col items-start gap-3 border-b border-white/10 pb-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🗾</span>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-star-white font-[family-name:var(--font-klee-one)]">
                  {locale === 'ko' ? '일본 전국 거점 맵 탐색' : locale === 'ja' ? '日本全国 拠点マップ探索' : 'Interactive Map Navigation'}
                </h2>
                <p className="text-xs text-star-dim mt-0.5">
                  {locale === 'ko'
                    ? '도시 선택 ➔ 검증 그룹·예정 라이브 확인 ➔ 멤버 프로필과 공식 링크로 연결됩니다'
                    : locale === 'ja'
                      ? '都市選択 ➔ 検証済みグループ・予定ライブ ➔ メンバーと公式リンクへ進みます'
                      : 'Choose a city, compare verified groups and upcoming live events, then open official profiles.'}
                </p>
              </div>
            </div>
            <span className="text-xs text-star-dim font-mono">
              NATIONAL STATE A
            </span>
          </div>

          <InteractiveJapanMap groups={groups} locale={locale} />
        </div>

        {/* 2. Verified official notices */}
        {notices.length > 0 ? <NoticeFeed notices={notices} locale={locale} /> : (
          <section className="mb-14 border-y border-white/10 py-8">
            <p className="text-[10px] font-bold tracking-[.18em] text-pink-400">OFFICIAL NOTICE</p>
            <h2 className="mt-2 text-xl font-bold text-star-white">{locale === 'ko' ? '공식 공지 검증 중' : locale === 'ja' ? '公式お知らせ検証中' : 'Official notices under verification'}</h2>
          </section>
        )}

        {/* 3. Birthday Calendar Spotlight */}
        <BirthdayTracker birthdays={birthdays} locale={locale} currentMonth={currentJapanMonth} />

        {/* 4. Rankings appear only after source verification */}
        <IdolLeaderboard initialMembers={rankedMembers} locale={locale} />

        {/* 5. All Groups Directory (전체 걸그룹 디렉터리) */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/10">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-star-white font-[family-name:var(--font-klee-one)]">
                {locale === 'ko' ? '전국 주요 걸그룹 디렉터리' : locale === 'ja' ? '全国主要アイドルグループ一覧' : 'Key Idol Groups Directory'}
              </h2>
              <p className="text-xs text-star-dim mt-0.5">
                {locale === 'ko' ? '공식 홈페이지, 라이브 티켓, 체키/굿즈 스토어 링크' : '公式サイト、チケット(TIGET/TicketDive/LivePocket)、チェキ通販'}
              </p>
            </div>
            <span className="text-xs text-star-dim font-mono">
              {groups.length} Groups
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {groups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                locale={locale}
              />
            ))}
          </div>
        </div>

        {/* 6. Separate lower gravure directory */}
        <section className="mt-20 border-t border-white/15 pt-10">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-[10px] font-bold tracking-[.18em] text-purple-300">GRAVURE DIRECTORY · PREPARING</p><h2 className="mt-2 text-2xl font-bold text-white">{locale === 'ko' ? '그라비아·사진집 공식 원문' : locale === 'ja' ? 'グラビア・写真集の公式原文' : 'Official gravure & photobook sources'}</h2><p className="mt-2 max-w-2xl text-xs leading-6 text-star-dim">{locale === 'ko' ? '공식 개별 기사·발매일·인물 연결을 확인한 링크 중심 항목을 준비 중입니다.' : locale === 'ja' ? '公式の個別記事・発売日・人物の一致を確認したリンク中心の項目を準備中です。' : 'Preparing link-only entries with verified individual sources, release dates and identity matches.'}</p></div><Link href="/gravure" className="text-xs font-bold text-purple-300">{locale === 'ko' ? '준비 상태 보기' : locale === 'ja' ? '準備状況を見る' : 'View preparation status'} →</Link></div>
          {gravures.length > 0 ? <GravureSection gravures={gravures} locale={locale} /> : <div className="border-y border-white/10 py-9 text-sm text-star-dim">{locale === 'ko' ? '현재 공개 가능한 항목은 0건입니다. 이미지 없이 연결할 수 있는 공식 개별 원문을 검증 중입니다.' : locale === 'ja' ? '現在公開できる項目は0件です。画像を掲載せずに案内できる公式の個別原文を検証中です。' : 'There are currently 0 publishable entries. Individual official sources are being verified for image-free linking.'}</div>}
        </section>
      </main>

      <Footer />
    </div>
  );
}
