'use client';

import React from 'react';
import Image from 'next/image';
import type { GravureFeature } from '@/lib/schema';
import { Link } from '@/i18n/routing';

interface GravureSectionProps {
  gravures: GravureFeature[];
  locale: string;
  showHeader?: boolean;
}

export function GravureSection({ gravures, locale, showHeader = true }: GravureSectionProps) {
  return (
    <section className="mb-14">
      {showHeader && <div className="flex items-center justify-between pb-3 mb-6 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">📸</span>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-star-white font-[family-name:var(--font-klee-one)]">
              {locale === 'ko' ? '그라비아 & 비주얼 사진집' : locale === 'ja' ? 'グラビア・写真集特設' : 'Gravure & Photobooks'}
            </h2>
            <p className="text-xs text-star-dim mt-0.5">
              {locale === 'ko' ? '주간 플레이보이, 영점프 등 주요 잡지 표지 및 화보 아카이브' : '週刊ヤングジャンプ、プレイボーイ等の表紙・巻頭グラビア'}
            </p>
          </div>
        </div>
        <span className="text-xs text-star-dim font-mono">
          {gravures.length} Features
        </span>
      </div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {gravures.map((item) => {
          const title = item.title[locale as 'ja' | 'ko' | 'en'] || item.title.ja;
          const memberName = item.memberName[locale as 'ja' | 'ko' | 'en'] || item.memberName.ja;
          const groupName = item.groupName[locale as 'ja' | 'ko' | 'en'] || item.groupName.ja;
          const magazine = typeof item.magazine === 'string' ? item.magazine : (item.magazine[locale as 'ja' | 'ko' | 'en'] || item.magazine.ja);

          return (
            <div
              key={item.id}
              className="group p-5 rounded-2xl glass-panel border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="flex items-start gap-4">
                {/* Visual Avatar / Cover */}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-space-900 border-2 border-purple-500/30 shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                  {item.imageUrl && item.rightsStatus !== 'link_only' ? (
                    <Image
                      src={item.imageUrl}
                      alt={memberName}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl font-bold bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-star-white">
                      {memberName[0]}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {item.releaseDate}
                    </span>
                    <span className="text-[11px] font-semibold text-star-dim truncate">
                      {groupName}
                    </span>
                  </div>

                  <Link href={`/m/${item.memberId}`}>
                    <h3 className="text-base font-bold text-star-white group-hover:text-purple-300 transition truncate">
                      {memberName}
                    </h3>
                  </Link>

                  <p className="text-xs text-star-dim/80 font-medium truncate mt-0.5">
                    {magazine}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <p className="text-xs text-star-dim line-clamp-1 font-medium">
                  {title}
                </p>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-purple-400 hover:text-purple-300 shrink-0 ml-2"
                  >
                    {locale === 'ko' ? '화보 보기' : '詳細'} →
                  </a>
                )}
              </div>
              {(item.gallery?.length ?? 0) > 0 && <div className="mt-4 grid grid-cols-5 gap-1.5 border-t border-white/5 pt-4">{(item.gallery ?? []).filter((photo) => photo.rightsStatus !== 'link_only').slice(0, 10).map((photo, index) => <a key={`${item.id}-${index}`} href={photo.postUrl} target="_blank" rel="noopener noreferrer" className="relative aspect-square overflow-hidden border border-white/10 bg-black/30"><Image src={photo.imageUrl} alt={`${memberName} ${index + 1}`} fill className="object-cover transition duration-300 hover:scale-105" unoptimized /></a>)}</div>}
              <Link href={`/m/${item.memberId}`} className="mt-4 block border border-white/10 px-3 py-2 text-center text-xs font-bold text-star-dim transition hover:border-purple-400 hover:text-white">{locale === 'ko' ? '프로필·SNS 카드' : locale === 'ja' ? 'プロフィール・SNS' : 'Profile & social cards'} →</Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
