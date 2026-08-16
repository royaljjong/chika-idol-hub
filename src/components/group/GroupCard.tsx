'use client';

import React from 'react';
import type { ChikaGroup } from '@/lib/schema';
import { Link } from '@/i18n/routing';

interface GroupCardProps {
  group: ChikaGroup;
  locale: string;
}

export function GroupCard({ group, locale }: GroupCardProps) {
  const groupName = group.name[locale as 'ja' | 'ko' | 'en'] || group.name.ja;
  const description = group.description[locale as 'ja' | 'ko' | 'en'] || group.description.ja;

  return (
    <div
      className="group relative flex flex-col justify-between rounded-[32px] p-6 sm:p-8 bg-space-850/80 border border-white/10 hover:border-pink-500/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
    >
      {/* Background radial accent glow */}
      <div
        className="absolute -right-16 -top-16 w-44 h-44 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none"
        style={{ backgroundColor: group.color }}
      />

      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/10 text-star-white border border-white/15">
            {group.agency}
          </span>
          <span
            className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
            style={{
              color: group.color,
              backgroundColor: `${group.color}20`,
            }}
          >
            {group.district.toUpperCase()} ({group.region})
          </span>
        </div>

        {/* Group Name */}
        <div className="mb-3">
          <Link
            href={`/g/${group.id}`}
            className="text-2xl sm:text-3xl font-bold text-star-white group-hover:text-pink-300 transition block font-[family-name:var(--font-klee-one)]"
          >
            {groupName}
          </Link>
          <span className="text-xs text-star-dim mt-1 block font-mono">
            Debut {group.debutYear} • {group.members.length} Members
          </span>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-star-dim line-clamp-3 mb-6 leading-relaxed">
          {description}
        </p>

        {/* Member Avatars Preview List (Sakamichi style) */}
        {group.members.length > 0 && (
          <div className="mb-6">
            <span className="text-[11px] font-semibold text-star-faint mb-2 block uppercase tracking-wider font-mono">
              Members Preview
            </span>
            <div className="flex flex-wrap gap-2 items-center">
              {group.members.map((m) => {
                const displayName = locale === 'ko' ? m.name.ko.hangul : locale === 'en' ? m.name.en.romaji : m.name.ja.kanji;
                const colorName = m.memberColorName[locale as 'ja' | 'ko' | 'en'] || m.memberColorName.ja;

                return (
                  <Link
                    key={m.id}
                    href={`/m/${m.id}`}
                    title={`${displayName} (${colorName})`}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 transition-all hover:scale-105"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shadow-sm"
                      style={{ backgroundColor: m.memberColor }}
                    />
                    <span className="text-xs text-star-white font-medium truncate max-w-[90px]">
                      {displayName}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Action Footer Bar */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3 mt-auto">
        <Link
          href={`/g/${group.id}`}
          className="flex-1 text-center py-2.5 rounded-xl bg-white/10 hover:bg-pink-500 hover:text-white text-star-white text-xs font-bold transition-all shadow-md"
        >
          {locale === 'ko' ? '그룹 & 멤버 전체보기 →' : locale === 'ja' ? 'グループ・メンバー詳細 →' : 'View Group & Members →'}
        </Link>

        {group.ticketUrl && (
          <a
            href={group.ticketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 text-xs font-bold transition border border-pink-500/40"
            title="Live Tickets"
          >
            🎟️
          </a>
        )}
      </div>
    </div>
  );
}
