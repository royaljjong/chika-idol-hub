import { setRequestLocale } from 'next-intl/server';
import { getGroups } from '@/lib/data';
import { Navigation } from '@/components/ui/Navigation';
import { Footer } from '@/components/ui/Footer';
import { InteractiveJapanMap } from '@/components/map/InteractiveJapanMap';
import { GroupCard } from '@/components/group/GroupCard';
import type { Metadata } from 'next';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;

  let title = '日本全国 地下アイドル | 公式リンク＆拠点マップ';
  let description = '東京(渋谷・原宿・秋葉原・新宿)、大阪、札幌、名古屋、福岡の地下アイドル・ライブアイドル公式リンク、チケット(TIGET/LivePocket)、チェキ通販まとめ。';

  if (locale === 'ko') {
    title = '일본 전국 지하아이돌 | 공식 링크 & 거점 맵 허브';
    description = '도쿄(시부야·하라주쿠·아키하바라·신주쿠), 오사카, 삿포로, 나고야, 후쿠오카 지하아이돌 전국 거점 맵, 라이브 티켓팅, 체키 스토어 링크 허브.';
  } else if (locale === 'en') {
    title = 'Japan Underground Idols | Interactive Map & Official Links';
    description = 'Explore Japan\'s live idol scenes across Tokyo (Shibuya, Harajuku, Akihabara, Shinjuku), Osaka, Sapporo, Nagoya, Fukuoka with official links and tickets.';
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

  return (
    <div className="relative min-h-screen flex flex-col justify-between">
      <Navigation showBrand={false} />

      <main id="main-content" className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex-1 w-full">
        {/* Centered Clean Title (Sakamichi style) */}
        <div className="text-center max-w-2xl mx-auto my-8 sm:my-14">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-star-white font-[family-name:var(--font-klee-one)]">
            {locale === 'ko' ? '일본 전국 지하아이돌' : locale === 'ja' ? '日本全国 地下アイドル' : 'Japan Underground Idols'}
          </h1>
        </div>

        {/* 1. Map -> Major Cities -> Region Drill-Down */}
        <div className="mb-14">
          <InteractiveJapanMap groups={groups} locale={locale} />
        </div>

        {/* 2. Major Groups Grid (Sakamichi 3-card style) */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/10">
            <h2 className="text-xl sm:text-2xl font-bold text-star-white font-[family-name:var(--font-klee-one)]">
              {locale === 'ko' ? '주요 그룹 및 레이블' : locale === 'ja' ? '主要グループ・レーベル一覧' : 'Key Idol Groups & Labels'}
            </h2>
            <span className="text-xs text-star-dim font-mono">
              {groups.length} Hubs
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
