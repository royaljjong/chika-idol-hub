'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import type { ChikaMember, ChikaGroup } from '@/lib/schema';
import { MemberAvatar } from './MemberAvatar';

interface MemberCardProps {
  member: ChikaMember;
  group?: ChikaGroup;
  locale: string;
  size?: 'sm' | 'md';
}

export function MemberCard({
  member,
  group,
  locale,
  size = 'md',
}: MemberCardProps) {
  const nameJa = member.name.ja.kanji;
  const nameKana = member.name.ja.kana;
  const nameKo = member.name.ko.hangul;
  const nameEn = member.name.en.romaji;
  const colorName = member.memberColorName[locale as 'ja' | 'ko' | 'en'] || member.memberColorName.ja;
  const motif = member.memberMotif?.[locale as 'ja' | 'ko' | 'en'] || member.memberMotif?.ja;

  const primaryName =
    locale === 'ko' ? nameKo : locale === 'en' ? nameEn : nameJa;
  const subName =
    locale === 'ko' ? `${nameJa} (${nameKana})` : locale === 'en' ? nameJa : nameKana;

  const subUnit = group?.subUnits.find((s) => s.id === member.subUnitId);
  const subUnitName = subUnit ? subUnit.name[locale as 'ja' | 'ko' | 'en'] || subUnit.name.ja : '';

  return (
    <Link
      href={`/m/${member.id}`}
      className="group relative flex flex-col justify-between p-4.5 sm:p-5 rounded-[22px] bg-space-850/80 hover:bg-space-800 border border-white/10 hover:border-pink-500/50 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 focus-visible:outline-2"
    >
      <div className="flex items-start gap-3.5 mb-3">
        <MemberAvatar
          glyph={nameJa[0] || '★'}
          memberColor={member.memberColor}
          imageUrl={member.imageUrl}
          name={nameJa}
          size={size === 'sm' ? 46 : 54}
          className="group-hover:scale-105 transition-transform duration-300 ring-2 ring-space-900 shadow-sm"
        />
        {(member.imageKind ?? 'placeholder') === 'placeholder' && (
          <span className="absolute left-4 top-16 z-10 bg-black/70 px-1.5 py-0.5 text-[9px] text-star-dim">
            {locale === 'ko' ? '사진 준비 중' : locale === 'ja' ? '画像準備中' : 'Placeholder'}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="text-base sm:text-lg font-bold text-star-white leading-snug truncate font-[family-name:var(--font-klee-one)] group-hover:text-pink-300 transition">
              {primaryName}
            </h3>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
              style={{
                backgroundColor: `${member.memberColor}25`,
                color: member.memberColor,
                border: `1px solid ${member.memberColor}50`,
              }}
            >
              {colorName}
            </span>
          </div>

          <p className="text-xs text-star-dim truncate mt-0.5">
            {subName}
          </p>

          {motif && <p className="text-[11px] text-amber-200/90 truncate mt-1">{locale === 'ko' ? '담당' : locale === 'en' ? 'Motif' : '担当'}: {motif}</p>}

          {subUnitName && (
            <p className="text-xs text-pink-300/80 mt-1 font-mono">
              {subUnitName}
            </p>
          )}
        </div>
      </div>

      {/* Link dots / count */}
      <div className="flex items-center justify-between pt-2.5 border-t border-white/10 text-[11px] text-star-faint">
        <div className="flex items-center gap-1.5">
          {member.links.slice(0, 4).map((l, i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-pink-500 opacity-70 group-hover:opacity-100 transition-opacity"
              title={l.type}
            />
          ))}
          {member.links.length > 4 && (
            <span className="text-[10px] text-star-dim font-mono">
              +{member.links.length - 4}
            </span>
          )}
        </div>
        <span className="text-star-dim group-hover:text-pink-400 transition-colors font-medium">
          {locale === 'ko' ? '링크 보기' : locale === 'ja' ? 'リンク' : 'Links'} →
        </span>
      </div>
    </Link>
  );
}
