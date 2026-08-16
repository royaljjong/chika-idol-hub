import { setRequestLocale } from 'next-intl/server';
import { getGroups } from '@/lib/data';
import { Navigation } from '@/components/ui/Navigation';
import { Footer } from '@/components/ui/Footer';
import { InteractiveJapanMap } from '@/components/map/InteractiveJapanMap';
import type { Metadata } from 'next';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;

  let title = 'CHIKA IDOL HUB | 地下アイドル・ライブアイドル 全国拠点マップ＆公式リンク';
  let description = '東京(渋谷・原宿・秋葉原・新宿)、大阪、札幌、名古屋、福岡の地下アイドル・ライブアイドル公式リンク、チケット(TIGET/LivePocket)、チェキ通販まとめ。';

  if (locale === 'ko') {
    title = 'CHIKA IDOL HUB | 일본 지하아이돌・라이브 아이돌 전국 맵 & 공식 링크';
    description = '도쿄(시부야·하라주쿠·아키하바라·신주쿠), 오사카, 삿포로, 나고야, 후쿠오카 지하아이돌 전국 거점 맵, 라이브 티켓팅, 체키 스토어 링크 허브.';
  } else if (locale === 'en') {
    title = 'CHIKA IDOL HUB | Japanese Underground & Live Idol Interactive Map';
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
      <Navigation />

      <main id="main-content" className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 w-full">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
            <span className="text-[11px] font-semibold text-pink-300 tracking-wider font-mono uppercase">
              Underground Constellation
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-star-white font-[family-name:var(--font-klee-one)] mb-3">
            {locale === 'ko' ? '지하지만 밝게 빛나는 별들' : locale === 'ja' ? '地下で最も輝く星たち' : 'Shining Stars in the Underground'}
          </h1>
          <p className="text-xs sm:text-sm text-star-dim max-w-lg mx-auto leading-relaxed">
            {locale === 'ko'
              ? '도쿄 23구(시부야·하라주쿠·아키하바라·신주쿠) 및 오사카·삿포로·나고야·후쿠오카 거점 라이브 아이돌 인터랙티브 맵 & 공식 링크 허브'
              : locale === 'ja'
              ? '東京(渋谷・原宿・秋葉原・新宿)および大阪・札幌・名古屋・福岡の拠点マップ＆公式チケット・チェキ通販リンク'
              : 'Interactive map and official link hub for Japanese live idols across Tokyo, Osaka, Sapporo, Nagoya, and Fukuoka.'}
          </p>
        </div>

        {/* Interactive Japan & Tokyo Map Component */}
        <InteractiveJapanMap groups={groups} locale={locale} />
      </main>

      <Footer />
    </div>
  );
}
