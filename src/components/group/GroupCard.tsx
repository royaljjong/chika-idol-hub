'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import type { ChikaGroup } from '@/lib/schema';
import { MemberAvatar } from '@/components/member/MemberAvatar';

interface GroupCardProps {
  group: ChikaGroup;
  locale: string;
}

export function GroupCard({ group, locale }: GroupCardProps) {
  const [imageError, setImageError] = useState(false);
  const groupName = group.name[locale as 'ja' | 'ko' | 'en'] || group.name.ja;
  const description = group.description[locale as 'ja' | 'ko' | 'en'] || group.description.ja;

  const previewMembers = group.members.slice(0, 4);
  const remainingCount = group.members.length - previewMembers.length;

  return (
    <Link
      href={`/g/${group.id}`}
      className="group relative flex flex-col justify-between rounded-[28px] bg-space-850/80 hover:bg-space-800/95 border border-white/10 hover:border-pink-500/50 shadow-lg hover:shadow-2xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 focus-visible:outline-2 overflow-hidden"
    >
      {/* Group Cover Photo / Main Visual Banner */}
      {group.imageUrl && !imageError && (
        <div className="relative w-full h-40 overflow-hidden bg-space-900">
          <Image
            src={group.imageUrl}
            alt={groupName}
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
            onError={() => setImageError(true)}
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-space-850 via-space-850/40 to-transparent" />
        </div>
      )}

      <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
        <div>
          {/* Color accent pill indicator (Sakamichi signature) */}
          <div
            className="w-8 h-1.5 rounded-full mb-4 transition-all duration-300 group-hover:w-16"
            style={{ backgroundColor: group.color }}
          />

          {/* Group Name & Subtitles */}
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-star-white mb-1 font-[family-name:var(--font-klee-one)] group-hover:text-pink-300 transition">
            {group.name.ja}
          </h2>
          {locale !== 'ja' && (
            <p className="text-sm font-medium text-star-dim mb-2">
              {groupName}
            </p>
          )}

          {/* Formed Date & Stats */}
          <div className="mt-3 space-y-1 text-xs text-star-dim font-mono">
            <p>
              {group.debutYear}年〜 • {group.agency}
            </p>
            <p className="font-medium text-pink-300">
              {group.district.toUpperCase()} ({group.region}) • {group.members.length} Members
            </p>
          </div>

          {/* Short description */}
          <p className="mt-3 text-xs text-star-dim line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between">
          {/* Avatars Preview with overlapping rings (Sakamichi style) */}
          <div className="flex items-center -space-x-2.5">
            {previewMembers.map((m) => (
              <MemberAvatar
                key={m.id}
                glyph={m.name.ja.kanji[0] || '★'}
                memberColor={m.memberColor}
                imageUrl={m.imageUrl}
                name={m.name.ja.kanji}
                size={38}
                className="ring-2 ring-space-900 shadow-sm"
              />
            ))}
            {remainingCount > 0 && (
              <div className="flex items-center justify-center w-9 h-9 rounded-2xl bg-space-800 text-[11px] font-semibold text-star-dim ring-2 ring-space-900 shadow-sm font-mono">
                +{remainingCount}
              </div>
            )}
          </div>

          {/* CTA Button */}
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-pink-400 group-hover:translate-x-1 transition-transform duration-200">
            {locale === 'ko' ? '상세보기' : locale === 'ja' ? '詳細を見る' : 'View'} →
          </span>
        </div>
      </div>
    </Link>
  );
}
