import React from 'react';
import { setRequestLocale } from 'next-intl/server';
import { Navigation } from '@/components/ui/Navigation';
import { Footer } from '@/components/ui/Footer';

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="relative min-h-screen flex flex-col justify-between">
      <Navigation />

      <main id="main-content" className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-12 flex-1 w-full">
        <div className="p-8 sm:p-12 rounded-3xl glass-panel border border-white/10">
          <span className="text-xs uppercase tracking-widest text-pink-400 font-bold mb-2 block font-mono">
            Concept & Mission
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-star-white mb-6 font-[family-name:var(--font-klee-one)]">
            {locale === 'ko' ? '지하지만 가장 밝게 빛나는 별들' : '地下で最も輝く星たち'}
          </h1>

          <div className="space-y-4 text-sm text-star-dim leading-relaxed">
            <p>
              {locale === 'ko'
                ? 'CHIKA IDOL HUB는 일본 전역(도쿄 시부야·하라주쿠·아키하바라·신주쿠, 오사카, 삿포로, 나고야, 후쿠오카)에서 활동하는 라이브 아이돌·지하아이돌의 공식 정보와 티켓팅, 굿즈/체키 스토어를 한눈에 탐색할 수 있도록 돕는 인터랙티브 아카이브입니다.'
                : 'CHIKA IDOL HUBは、日本全国（東京・渋谷・原宿・秋葉原・新宿、大阪、札幌、名古屋、福岡）で輝くライブアイドル・地下アイドルの公式リンク、チケット(TIGET/LivePocket)、チェキ通販を直感的に探索できるインターラクティブマップです。'}
            </p>
            <p>
              {locale === 'ko'
                ? 'KAWAII LAB., HEROINES, WACK, DearStage, TWIN PLANET 등 주요 레이블부터 지역의 실력파 독립 그룹까지, 팬들이 언제든 안전하고 신속하게 공식 티켓과 활동을 접할 수 있도록 공식 링크만을 엄선하여 제공합니다.'
                : '主要レーベルから全国の有力グループまで、信頼できる公式リンクのみを掲載しています。'}
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
