'use client';

import React from 'react';
import type { ChikaMember, ChikaGroup } from '@/lib/schema';
import { Link } from '@/i18n/routing';
import { MemberAvatar } from './MemberAvatar';

interface MemberCardProps {
  member: ChikaMember;
  group?: ChikaGroup;
  locale: string;
}

export function MemberCard({ member, group, locale }: MemberCardProps) {
  const nameJa = member.name.ja.kanji;
  const nameKana = member.name.ja.kana;
  const nameKo = member.name.ko.hangul;
  const nameEn = member.name.en.romaji;
  const colorName = member.memberColorName[locale as 'ja' | 'ko' | 'en'] || member.memberColorName.ja;

  const displayName = locale === 'ko' ? nameKo : locale === 'en' ? nameEn : nameJa;
  const subName = locale === 'ko' ? `${nameJa} (${nameKana})` : locale === 'en' ? `${nameJa}` : nameKana;

  return (
    <Link
      href={`/m/${member.id}`}
      className="group relative flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-space-850/80 hover:bg-space-800 border border-white/10 hover:border-pink-500/50 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
    >
      {/* Member Avatar (Image or stylized color disc) */}
      <MemberAvatar
        glyph={nameJa[0] || '★'}
        memberColor={member.memberColor}
        imageUrl={member.imageUrl}
        name={displayName}
        size={58}
        className="transition-transform group-hover:scale-105"
      />

      <div className="min-w-0 flex-1">
        {/* Color Badge */}
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full truncate"
            style={{
              backgroundColor: `${member.memberColor}25`,
              color: member.memberColor,
              border: `1px solid ${member.memberColor}50`,
            }}
          >
            {colorName}
          </span>
          {member.nickname && (
            <span className="text-[10px] text-star-faint truncate">
              {member.nickname[locale as 'ja' | 'ko' | 'en'] || member.nickname.ja}
            </span>
          )}
        </div>

        {/* Member Name */}
        <h3 className="text-base sm:text-lg font-bold text-star-white group-hover:text-pink-300 transition truncate font-[family-name:var(--font-klee-one)]">
          {displayName}
        </h3>

        {/* Subname */}
        <p className="text-xs text-star-dim truncate mt-0.5">
          {subName}
        </p>

        {/* Links Count */}
        <div className="flex items-center gap-2 mt-2 text-[11px] text-star-faint">
          <span>{member.links.length} Official Links</span>
          <span>•</span>
          <span className="text-pink-400 font-medium group-hover:underline">
            {locale === 'ko' ? '프로필 보기 →' : locale === 'ja' ? 'プロフィール →' : 'View Profile →'}
          </span>
        </div>
      </div>
    </Link>
  );
}
