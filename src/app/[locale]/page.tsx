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
              ? '전국 거점 맵・공식 티켓팅・체키 스토어・그라비아 화보・생일 캘린더・종합 랭킹'
              : locale === 'ja'
              ? '全国拠点マップ・公式チケット・通販チェキ・グラビア写真集・誕生日・総合ランキング'
              : 'Interactive Map, Live Tickets, Official Links, Gravure & Comprehensive Rankings'}
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
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-[10px] font-bold tracking-[.18em] text-purple-300">GRAVURE DIRECTORY</p><h2 className="mt-2 text-2xl font-bold text-white">{locale === 'ko' ? '그라비아 아이돌·사진집' : locale === 'ja' ? 'グラビアアイドル・写真集' : 'Gravure idols & photobooks'}</h2><p className="mt-2 max-w-2xl text-xs leading-6 text-star-dim">{locale === 'ko' ? '지하아이돌 지도와 분리하여 소속사·레이블 단위로 정리합니다.' : locale === 'ja' ? 'ライブアイドル地図とは分け、所属事務所・レーベル単位で整理します。' : 'Organized separately from the live-idol map by agency and label.'}</p></div><Link href="/gravure" className="text-xs font-bold text-purple-300">{locale === 'ko' ? '전체 보기' : locale === 'ja' ? '一覧を見る' : 'Open directory'} →</Link></div>
          {gravures.length > 0 ? <GravureSection gravures={gravures} locale={locale} /> : <div className="border-y border-white/10 py-9 text-sm text-star-dim">{locale === 'ko' ? '공식 출처와 이미지 권리를 확인한 항목을 수집 중입니다.' : locale === 'ja' ? '公式出典と画像権利を確認できた項目を収集中です。' : 'Collecting entries with verified official sources and image rights.'}</div>}
        </section>
      </main>

      <Footer />
    </div>
  );
}
