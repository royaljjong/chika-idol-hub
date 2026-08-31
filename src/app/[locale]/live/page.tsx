import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getLiveEvents } from "@/lib/data";
import {
  LiveExplorer,
  type LiveExplorerItem,
} from "@/components/live/LiveExplorer";
import { Navigation } from "@/components/ui/Navigation";
import { Footer } from "@/components/ui/Footer";
import { getJapanCalendarDate } from "@/lib/japan-date";

interface LivePageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ group?: string; region?: string; date?: string; mode?: string }>;
}

export async function generateMetadata({
  params,
}: LivePageProps): Promise<Metadata> {
  const { locale } = await params;
  return {
    title:
      locale === "ko"
        ? "검증된 라이브 일정"
        : locale === "en"
          ? "Verified live schedule"
          : "検証済みライブスケジュール",
    description:
      locale === "ko"
        ? "공식 출처로 확인된 일본 라이브아이돌 공연을 날짜·지역·그룹으로 찾습니다."
        : locale === "en"
          ? "Find Japanese live-idol events by date, area, and group with official sources."
          : "公式出典で確認したライブアイドル公演を日付・地域・グループから探せます。",
  };
}

export default async function LivePage({
  params,
  searchParams,
}: LivePageProps) {
  const { locale } = await params;
  const { group: initialGroup, region: initialRegion, date: initialDate, mode: initialMode } = await searchParams;
  setRequestLocale(locale);
  const language = locale === "ko" || locale === "en" ? locale : "ja";
  const items: LiveExplorerItem[] = getLiveEvents().map(
    ({ event, groups, venue }) => ({
      id: event.id,
      title: event.title[language],
      startsOn: event.startsOn,
      endsOn: event.endsOn,
      startsAt: event.startsAt,
      timeStatus: event.timeStatus,
      region: event.region,
      areaLabel: event.areaLabel[language],
      venueName: venue?.name[language] ?? null,
      price: event.price?.[language] ?? null,
      hasTicket: Boolean(event.ticketUrl),
      status: event.status,
      groups: groups.map((group) => ({
        id: group.id,
        name: group.name[language],
        color: group.color,
      })),
      checkedAt: event.provenance.checkedAt,
    }),
  );

  return (
    <div className="relative flex min-h-screen flex-col">
      <Navigation />
      <main
        id="main-content"
        className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6"
      >
        <p className="text-[10px] font-bold tracking-[.2em] text-pink-400">
          VERIFIED LIVE DIRECTORY
        </p>
        <div className="mt-3 flex flex-col justify-between gap-4 border-b border-white/10 pb-7 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              {language === "ko"
                ? "라이브 일정 찾기"
                : language === "en"
                  ? "Find live events"
                  : "ライブを探す"}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-star-dim">
              {language === "ko"
                ? "공식 원문과 확인일이 있는 공연만 공개합니다. 시간·장소·티켓이 발표되지 않은 경우 미정으로 표시합니다."
                : language === "en"
                  ? "Only events with an official source and review date are published. Unannounced time, venue, and ticket details remain marked TBA."
                  : "公式原文と確認日がある公演のみ掲載します。未発表の時間・会場・チケットは未定と表示します。"}
            </p>
          </div>
          <span className="font-mono text-xs text-star-dim">
            {items.length} VERIFIED
          </span>
        </div>
        <div className="mt-8">
          <LiveExplorer
            events={items}
            locale={language}
            today={getJapanCalendarDate()}
            initialGroup={initialGroup}
            initialRegion={initialRegion}
            initialDate={initialDate}
            initialMode={initialMode}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
