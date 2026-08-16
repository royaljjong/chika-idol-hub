'use client';

import React from 'react';
import { Link, usePathname } from '@/i18n/routing';
import { useLocale } from 'next-intl';

export function Navigation() {
  const locale = useLocale();
  const pathname = usePathname();

  const locales = [
    { code: 'ja', label: '日本語' },
    { code: 'ko', label: '한국어' },
    { code: 'en', label: 'EN' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-space-950/80 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="text-xl group-hover:rotate-12 transition-transform duration-300">
            ✨
          </span>
          <div className="flex flex-col">
            <span className="text-sm sm:text-base font-bold tracking-tight text-star-white group-hover:text-pink-300 transition">
              CHIKA IDOL HUB
            </span>
            <span className="text-[9px] uppercase tracking-widest text-star-faint font-mono">
              Live Idol Constellation
            </span>
          </div>
        </Link>

        {/* Navigation Links & Search */}
        <nav className="flex items-center gap-4 sm:gap-6 ml-auto mr-4">
          <Link
            href="/search"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-xs text-star-dim hover:text-star-white border border-white/10 transition"
          >
            <span>🔍</span>
            <span className="hidden sm:inline">
              {locale === 'ko' ? '검색' : locale === 'ja' ? '検索' : 'Search'}
            </span>
          </Link>
        </nav>

        {/* Language Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 text-xs">
          {locales.map((l) => {
            const isActive = locale === l.code;
            return (
              <Link
                key={l.code}
                href={pathname}
                locale={l.code}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold shadow-sm'
                    : 'text-star-dim hover:text-star-white'
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
