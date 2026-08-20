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

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;

  let title = '日本全国 地下アイドル | 公式リンク＆拠点マップ・グラビア・生誕・お知らせ';
  let description = '東京(渋谷・原宿・秋葉原・新宿)、大阪、札幌、名古屋、福岡の地下アイドル公式リンク、チケット(TIGET/TicketDive/LivePocket)、グラビア特集、誕生日カレンダー、SNSフォロワーランキング。';

  if (locale === 'ko') {
    title = '일본 전국 지하아이돌 | 공식 링크 & 거점 맵・그라비아・생일・오시라세 허브';
    description = '도쿄(시부야·하라주쿠·아키하바라·신주쿠), 오사카, 삿포로, 나고야, 후쿠오카 지하아이돌 전국 거점 맵, 그라비아 화보, 생일 캘린더, SNS 팔로워 랭킹, 공식 티켓팅 링크 허브.';
  } else if (locale === 'en') {
    title = 'Japan Underground Idols | Map, Gravure, Birthdays & Official Links';
    description = 'Explore Japan\'s live idol scenes across Tokyo, Osaka, Sapporo, Nagoya, Fukuoka with official links, tickets, gravure photobooks, and birthday calendar.';
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
              ? '전국 거점 맵・공식 티켓팅・체키 스토어・그라비아 화보・생일 캘린더・종합 랭킹'
              : locale === 'ja'
              ? '全国拠点マップ・公式チケット・通販チェキ・グラビア写真集・誕生日・総合ランキング'
              : 'Interactive Map, Live Tickets, Official Links, Gravure & Comprehensive Rankings'}
          </p>
        </div>

        {/* 1. Region-first discovery */}
        <div className="mb-14">
          <div className="flex items-center justify-between pb-3 mb-6 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🗾</span>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-star-white font-[family-name:var(--font-klee-one)]">
                  {locale === 'ko' ? '일본 전국 거점 맵 탐색' : locale === 'ja' ? '日本全国 拠点マップ探索' : 'Interactive Map Navigation'}
                </h2>
                <p className="text-xs text-star-dim mt-0.5">
                  {locale === 'ko'
                    ? '도시 클릭 ➔ 구역 선택 ➔ 활동 지하아이돌 공식 로고/단체 사진 ➔ 멤버 사진/이름 ➔ 개인 SNS로 연결됩니다'
                    : '都市クリック ➔ エリア選択 ➔ 地下アイドル写真 ➔ メンバー写真・名前 ➔ 個別SNSへ直結'}
                </p>
              </div>
            </div>
            <span className="text-xs text-star-dim font-mono">
              3-Level Drilldown
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
        <BirthdayTracker birthdays={birthdays} locale={locale} />

        {/* 4. Rankings appear only after source verification */}
        <IdolLeaderboard initialMembers={rankedMembers} locale={locale} />

        {/* 5. Gravure & Visual Photobooks */}
        {gravures.length > 0 && <GravureSection gravures={gravures} locale={locale} />}

        {/* 6. All Groups Directory (전체 걸그룹 디렉터리) */}
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
      </main>

      <Footer />
    </div>
  );
}
