'use client';

import React from 'react';
import type { IdolLink } from '@/lib/schema';

interface LinkGridProps {
  links: IdolLink[];
  locale: string;
}

const LINK_ICONS: Record<string, string> = {
  official_profile: '🌐',
  official_blog: '📝',
  twitter: '𝕏',
  x: '𝕏',
  instagram: '📷',
  tiktok: '🎵',
  youtube: '▶️',
  showroom: '📺',
  ticket: '🎟️',
  cheki: '📸',
  store: '🛍️',
  other: '🔗',
};

const LINK_COLORS: Record<string, string> = {
  x: '#1DA1F2',
  twitter: '#1DA1F2',
  instagram: '#E1306C',
  tiktok: '#00F2FE',
  youtube: '#FF0000',
  showroom: '#38BDF8',
  ticket: '#F43F5E',
  cheki: '#EC4899',
  official_profile: '#8B5CF6',
  official_blog: '#10B981',
  store: '#F59E0B',
  other: '#64748B',
};

export function LinkGrid({ links, locale }: LinkGridProps) {
  if (!links || links.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl glass-panel text-sm text-star-dim">
        {locale === 'ko' ? '등록된 공식 링크가 없습니다.' : '登録されている公式リンクがありません。'}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
      {links.map((link, idx) => {
        const icon = LINK_ICONS[link.type] || '🔗';
        const color = LINK_COLORS[link.type] || '#8B5CF6';
        const label = link.label[locale as 'ja' | 'ko' | 'en'] || link.label.ja;

        return (
          <a
            key={`${link.url}-${idx}`}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-space-850/80 hover:bg-space-800 border border-white/10 hover:border-pink-500/50 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Type Icon Disc */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold shadow-md shrink-0 transition-transform group-hover:scale-110"
                style={{
                  backgroundColor: `${color}20`,
                  color: color,
                  border: `1px solid ${color}40`,
                }}
              >
                <span>{icon}</span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-sm sm:text-base font-bold text-star-white group-hover:text-pink-300 transition truncate font-[family-name:var(--font-klee-one)]">
                    {label}
                  </span>
                  {link.verified && (
                    <span className="text-[11px] text-emerald-400 font-bold" title="Verified Official Link">
                      ✓
                    </span>
                  )}
                </div>
                <span className="text-xs text-star-faint truncate block font-mono">
                  {link.url.replace(/^https?:\/\/(www\.)?/, '')}
                </span>
              </div>
            </div>

            {/* External arrow icon */}
            <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-pink-500/20 group-hover:text-pink-300 flex items-center justify-center text-xs text-star-dim transition-all shrink-0 ml-2 group-hover:translate-x-0.5">
              ↗
            </div>
          </a>
        );
      })}
    </div>
  );
}
