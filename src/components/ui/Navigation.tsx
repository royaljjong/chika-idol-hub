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
  const branches = [
    { href: '/', label: locale === 'ko' ? '지도·그룹' : locale === 'ja' ? '地図・グループ' : 'Map & groups' },
    { href: '/live', label: locale === 'ko' ? '라이브' : locale === 'ja' ? 'ライブ' : 'Live' },
    { href: '/gravure', label: locale === 'ko' ? '그라비아' : locale === 'ja' ? 'グラビア' : 'Gravure' },
  ] as const;

  return (
    <nav className="relative z-20 mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5 sm:flex-nowrap sm:px-6 sm:py-6">
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

      <div className="order-3 flex w-full items-center gap-1 rounded-xl border border-white/10 bg-white/[.03] p-1 sm:order-none sm:w-auto sm:border-0 sm:bg-transparent sm:p-0" aria-label={locale === 'ko' ? '제품 탐색' : locale === 'ja' ? 'プロダクトナビゲーション' : 'Product navigation'}>
        {branches.map((branch) => {
          const active = branch.href === '/' ? pathname === '/' : pathname.startsWith(branch.href);
          return <Link key={branch.href} href={branch.href} aria-current={active ? 'page' : undefined} className={`flex-1 rounded-lg px-3 py-2 text-center text-xs font-bold transition sm:flex-none sm:py-1.5 ${active ? 'bg-white text-space-950 shadow-sm' : 'text-star-dim hover:bg-white/10 hover:text-white'}`}>{branch.label}</Link>;
        })}
      </div>

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
                <span className="sm:hidden">{l.code.toUpperCase()}</span><span className="hidden sm:inline">{l.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
