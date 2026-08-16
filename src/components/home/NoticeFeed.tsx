'use client';

import React from 'react';
import type { ChikaNotice } from '@/lib/schema';

interface NoticeFeedProps {
  notices: ChikaNotice[];
  locale: string;
}

export function NoticeFeed({ notices, locale }: NoticeFeedProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'live':
        return 'bg-pink-500/20 text-pink-300 border-pink-500/40';
      case 'gravure':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'release':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      default:
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    }
  };

  return (
    <section className="mb-14">
      <div className="flex items-center justify-between pb-3 mb-6 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">📢</span>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-star-white font-[family-name:var(--font-klee-one)]">
              {locale === 'ko' ? '공식 오시라세 & 라이브 속보' : locale === 'ja' ? '公式お知らせ・速報' : 'Official Notices & News'}
            </h2>
            <p className="text-xs text-star-dim mt-0.5">
              {locale === 'ko' ? '전국 주요 지하아이돌 공식 투어 및 중대 발표' : '全国ライブアイドルの重大発表・リリース速報'}
            </p>
          </div>
        </div>
        <span className="text-xs text-star-dim font-mono">
          {notices.length} Updates
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notices.map((notice) => {
          const title = notice.title[locale as 'ja' | 'ko' | 'en'] || notice.title.ja;
          const summary = notice.summary[locale as 'ja' | 'ko' | 'en'] || notice.summary.ja;
          const badge = notice.badge[locale as 'ja' | 'ko' | 'en'] || notice.badge.ja;
          const groupName = notice.groupName[locale as 'ja' | 'ko' | 'en'] || notice.groupName.ja;

          return (
            <a
              key={notice.id}
              href={notice.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-5 rounded-2xl glass-panel border border-white/10 hover:border-pink-500/50 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getCategoryColor(notice.category)}`}>
                      {badge}
                    </span>
                    <span className="text-[11px] font-semibold text-star-dim">
                      {groupName}
                    </span>
                  </div>
                  <span className="text-[11px] text-star-dim/70 font-mono">
                    {notice.date}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-star-white group-hover:text-pink-300 transition line-clamp-2 mb-2">
                  {title}
                </h3>
                <p className="text-xs text-star-dim leading-relaxed line-clamp-2">
                  {summary}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-pink-400 font-medium group-hover:translate-x-1 transition-transform">
                  {locale === 'ko' ? '공식 링크 확인' : locale === 'ja' ? '公式サイトで確認' : 'View Official Link'} →
                </span>
                <span className="text-[11px] text-star-dim font-mono">
                  🔗 Official
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
