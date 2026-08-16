'use client';

import React from 'react';
import { Link, usePathname } from '@/i18n/routing';
import { useLocale } from 'next-intl';

interface NavigationProps {
  showBrand?: boolean;
}

export function Navigation({ showBrand = true }: NavigationProps) {
  const locale = useLocale();
  const pathname = usePathname();

  const locales = [
    { code: 'ja', label: '日本語' },
    { code: 'ko', label: '한국어' },
    { code: 'en', label: 'EN' },
  ];

  return (
    <nav className="relative z-20 flex items-center justify-between py-6 max-w-6xl mx-auto px-4 sm:px-6 w-full">
      {showBrand ? (
        <Link
          href="/"
          className="group flex items-center gap-2 text-lg sm:text-xl font-bold tracking-tight text-star-white font-[family-name:var(--font-klee-one)] focus-visible:outline-2"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-pink-500 group-hover:scale-125 transition-transform" />
          <span>
            {locale === 'ko' ? '일본 전국 지하아이돌' : locale === 'ja' ? '日本全国 地下アイドル' : 'Japan Underground Idols'}
          </span>
        </Link>
      ) : (
        <div aria-hidden="true" />
      )}

      {/* Top-right Actions: Search & Locales strictly aligned to far right */}
      <div className="flex items-center gap-2.5 ml-auto">
        <Link
          href="/search"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/15 text-xs font-medium text-star-white border border-white/10 shadow-sm transition hover:scale-105"
        >
          <span className="text-star-dim text-xs">🔍</span>
          <span>{locale === 'ko' ? '검색' : locale === 'ja' ? '検索' : 'Search'}</span>
        </Link>

        {/* Language Switcher */}
        <div className="flex items-center gap-1 p-0.5 rounded-full bg-white/5 border border-white/10 text-xs">
          {locales.map((l) => {
            const isActive = locale === l.code;
            return (
              <Link
                key={l.code}
                href={pathname}
                locale={l.code}
                className={`px-2.5 py-1 rounded-full font-medium transition ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold shadow-sm'
                    : 'text-star-dim hover:text-star-white'
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
