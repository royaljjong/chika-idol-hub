'use client';

import React, { useState, useMemo } from 'react';
import { useLocale } from 'next-intl';
import { Navigation } from '@/components/ui/Navigation';
import { Footer } from '@/components/ui/Footer';
import { ChikaGroupCard } from '@/components/group/ChikaGroupCard';
import { getGroups } from '@/lib/data';
import type { ChikaGroup } from '@/lib/schema';

export default function SearchPage() {
  const locale = useLocale();
  const [query, setQuery] = useState('');

  const groups = getGroups();

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;

    return groups.filter((g) => {
      const matchNameJa = g.name.ja.toLowerCase().includes(q) || g.shortName.ja.toLowerCase().includes(q);
      const matchNameKo = g.name.ko.toLowerCase().includes(q) || g.shortName.ko.toLowerCase().includes(q);
      const matchNameEn = g.name.en.toLowerCase().includes(q) || g.shortName.en.toLowerCase().includes(q);
      const matchAgency = g.agency.toLowerCase().includes(q);
      const matchRegion = g.region.toLowerCase().includes(q) || g.district.toLowerCase().includes(q);

      const matchMember = g.members.some(
        (m) =>
          m.name.ja.kanji.toLowerCase().includes(q) ||
          m.name.ja.kana.toLowerCase().includes(q) ||
          m.name.ko.hangul.toLowerCase().includes(q) ||
          m.name.en.romaji.toLowerCase().includes(q),
      );

      return matchNameJa || matchNameKo || matchNameEn || matchAgency || matchRegion || matchMember;
    });
  }, [query, groups]);

  return (
    <div className="relative min-h-screen flex flex-col justify-between">
      <Navigation />

      <main id="main-content" className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-star-white mb-3 font-[family-name:var(--font-klee-one)]">
            {locale === 'ko' ? '아이돌 & 그룹 검색' : locale === 'ja' ? 'アイドル・グループ検索' : 'Search Live Idols'}
          </h1>
          <p className="text-xs sm:text-sm text-star-dim">
            {locale === 'ko'
              ? '그룹명, 멤버명, 소속사(KAWAII LAB., HEROINES, WACK 등), 지역(시부야, 하라주쿠, 아키하바라 등)으로 검색'
              : 'グループ名・メンバー名・事務所・エリア名で瞬時に検索できます。'}
          </p>
        </div>

        {/* Search Input Box */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-star-dim text-lg">
              🔍
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                locale === 'ko'
                  ? 'FRUITS ZIPPER, iLiFE!, 시부야, KAWAII LAB. ...'
                  : 'FRUITS ZIPPER, iLiFE!, 渋谷, 原宿, WACK ...'
              }
              className="w-full pl-12 pr-10 py-4 rounded-2xl bg-space-850 border border-white/15 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 text-star-white placeholder:text-star-faint text-sm sm:text-base outline-none transition shadow-xl"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-star-dim hover:text-star-white text-xs px-2 py-1 rounded-md bg-white/10"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center justify-between mt-3 px-2 text-xs text-star-dim">
            <span>
              {locale === 'ko'
                ? `검색 결과: ${filteredGroups.length}건`
                : `検索結果: ${filteredGroups.length}件`}
            </span>
            <div className="flex gap-2">
              {['FRUITS ZIPPER', 'iLiFE!', 'WACK', '渋谷', '原宿', '大阪'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/15 text-star-dim hover:text-star-white transition"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Result Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <ChikaGroupCard key={group.id} group={group} locale={locale} />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
