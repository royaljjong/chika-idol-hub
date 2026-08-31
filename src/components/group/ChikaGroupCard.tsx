'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import type { ChikaGroup } from '@/lib/schema';
import { Link } from '@/i18n/routing';

interface ChikaGroupCardProps {
  group: ChikaGroup;
  locale: string;
}

export function ChikaGroupCard({ group, locale }: ChikaGroupCardProps) {
  const [imageError, setImageError] = useState(false);
  const groupName = group.name[locale as 'ja' | 'ko' | 'en'] || group.name.ja;
  const description = group.description[locale as 'ja' | 'ko' | 'en'] || group.description.ja;

  return (
    <div
      className="relative rounded-3xl glass-panel glass-panel-hover p-6 flex flex-col justify-between transition-all duration-300 group overflow-hidden"
      style={{
        borderColor: 'rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Background ambient accent glow */}
      <div
        className="absolute -right-16 -top-16 w-36 h-36 rounded-full blur-3xl opacity-20 pointer-events-none transition-opacity group-hover:opacity-40"
        style={{ backgroundColor: group.color }}
      />

      <Link href={`/g/${group.id}`} className="relative -mx-6 -mt-6 mb-5 block h-36 overflow-hidden" style={{ background: `linear-gradient(135deg, ${group.color}66, #07111d)` }}>
        {group.imageUrl && !imageError ? <Image src={group.imageUrl} alt="" fill className="object-cover" sizes="(max-width: 640px) 100vw, 420px" unoptimized onError={() => setImageError(true)} /> : <span className="absolute inset-0 grid place-items-center px-8 text-center text-xl font-black text-white/80">{group.shortName[locale as 'ja' | 'ko' | 'en'] || group.name.ja}</span>}
        <span className="absolute left-3 top-3 bg-black/75 px-2 py-1 text-[9px] text-star-dim">{group.imageKind === 'official_photo' ? 'OFFICIAL PHOTO' : group.imageKind === 'official_logo' ? 'OFFICIAL LOGO' : group.imageKind === 'text_wordmark' ? 'TEXT WORDMARK' : locale === 'ko' ? '대표 이미지 준비 중' : locale === 'ja' ? '公式画像準備中' : 'Visual placeholder'}</span>
      </Link>

      <div>
        {/* Badges: Agency & District */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-white/10 text-star-white border border-white/10 truncate">
            {group.agency}
          </span>
          <span
            className="text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{
              color: group.color,
              backgroundColor: `${group.color}20`,
              borderColor: `${group.color}40`,
            }}
          >
            {group.district.toUpperCase()}
          </span>
        </div>

        {/* Group Name & Debut */}
        <div className="mb-3">
          <Link
            href={`/g/${group.id}`}
            className="text-xl sm:text-2xl font-bold text-star-white hover:text-pink-300 transition block font-[family-name:var(--font-klee-one)]"
          >
            {groupName}
          </Link>
          <span className="text-xs text-star-dim mt-0.5 block">
            Debut {group.debutYear} • {group.members.length} Members
          </span>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-star-dim line-clamp-2 mb-4 leading-relaxed">
          {description}
        </p>

        {/* Member Color Dots */}
        {group.members.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5 items-center">
            {group.members.map((m) => {
              const displayName = locale === 'ko' ? m.name.ko.hangul : locale === 'en' ? m.name.en.romaji : m.name.ja.kanji;
              const colorName = m.memberColorName[locale as 'ja' | 'ko' | 'en'] || m.memberColorName.ja;
              return (
                <span
                  key={m.id}
                  title={`${displayName} (${colorName})`}
                  className="w-4 h-4 rounded-full border border-black/40 shadow-sm transition-transform hover:scale-125 cursor-help"
                  style={{ backgroundColor: m.memberColor }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Action Links Bar */}
      <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-2 mt-auto">
        {/* Ticket Link (TIGET/LivePocket) */}
        {group.ticketUrl && (
          <a
            href={group.ticketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[110px] text-center px-3 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-bold shadow-md transition-all hover:scale-[1.02]"
          >
            🎟️ {locale === 'ko' ? '티켓 예매' : locale === 'ja' ? 'チケット' : 'Tickets'}
          </a>
        )}

        {/* Cheki / Goods Link */}
        {group.chekiUrl && (
          <a
            href={group.chekiUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[110px] text-center px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-star-white text-xs font-bold transition border border-white/10"
          >
            📸 {locale === 'ko' ? '체키/굿즈' : locale === 'ja' ? 'チェキ通販' : 'Cheki/Store'}
          </a>
        )}

        {/* Schedule Link */}
        {group.scheduleUrl && (
          <a
            href={group.scheduleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-2 rounded-xl bg-white/5 hover:bg-white/15 text-star-dim hover:text-star-white text-xs transition"
            title="Live Schedule"
          >
            📅
          </a>
        )}

        {/* Official X/Twitter */}
        {group.x && (
          <a
            href={group.x}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-2 rounded-xl bg-white/5 hover:bg-white/15 text-star-dim hover:text-star-white text-xs font-bold transition"
            title="Official X"
          >
            𝕏
          </a>
        )}

        {/* Group Detail Page Link */}
        <Link
          href={`/g/${group.id}`}
          className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/15 text-star-dim hover:text-star-white text-xs font-medium transition"
        >
          {locale === 'ko' ? '상세 →' : locale === 'ja' ? '詳細 →' : 'More →'}
        </Link>
      </div>
    </div>
  );
}
