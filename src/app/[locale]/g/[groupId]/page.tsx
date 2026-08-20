'use client';

import React, { useState, use } from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getGroup } from '@/lib/data';
import type { ChikaMember } from '@/lib/schema';
import { Link } from '@/i18n/routing';
import { Navigation } from '@/components/ui/Navigation';
import { Footer } from '@/components/ui/Footer';
import { MemberCard } from '@/components/member/MemberCard';

interface GroupPageProps {
  params: Promise<{ locale: string; groupId: string }>;
}

type MemberSortMode = 'default' | 'popularity' | 'followers' | 'search';

export default function GroupPage({ params }: GroupPageProps) {
  const { locale, groupId } = use(params);
  const [selectedSubUnit, setSelectedSubUnit] = useState<string>('all');
  const [sortMode, setSortMode] = useState<MemberSortMode>('default');
  const [bannerError, setBannerError] = useState<boolean>(false);

  const group = getGroup(groupId);
  if (!group) {
    notFound();
  }

  const groupName = group.name[locale as 'ja' | 'ko' | 'en'] || group.name.ja;
  const description = group.description[locale as 'ja' | 'ko' | 'en'] || group.description.ja;
  const hasVerifiedMetrics = group.members.some((member) => member.metricsVerifiedAt && member.metricsSourceUrl);

  // Filter members by selected subunit
  const filtered = group.members.filter((m) => {
    if (selectedSubUnit === 'all') return true;
    return m.subUnitId === selectedSubUnit;
  });

  // Sort members according to selected mode
  const sortedMembers = [...filtered].sort((a, b) => {
    if (sortMode === 'followers') {
      const totalA = (a.xFollowers || 0) + (a.igFollowers || 0);
      const totalB = (b.xFollowers || 0) + (b.igFollowers || 0);
      return totalB - totalA;
    }
    if (sortMode === 'search') {
      return (b.searchVolumeScore || 80) - (a.searchVolumeScore || 80);
    }
    if (sortMode === 'popularity') {
      return (b.popularityScore || 85) - (a.popularityScore || 85);
    }
    return 0;
  });

  const getMemberRank = (member: ChikaMember) => {
    const idx = sortedMembers.findIndex((m) => m.id === member.id);
    return idx >= 0 ? idx + 1 : 1;
  };

  const getMemberMetricText = (member: ChikaMember) => {
    if (sortMode === 'followers') {
      const total = (member.xFollowers || 0) + (member.igFollowers || 0);
      return total >= 10000 ? `${(total / 10000).toFixed(1)}만` : `${total.toLocaleString()}명`;
    }
    if (sortMode === 'search') {
      return `${member.searchVolumeScore || 80}pt`;
    }
    if (sortMode === 'popularity') {
      return `${member.popularityScore || 85}점`;
    }
    return '';
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between">
      <Navigation />

      <main id="main-content" className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-star-dim mb-6 font-medium">
          <Link href="/" className="hover:text-star-white transition">
            Home
          </Link>
          <span>/</span>
          <span>{group.region.toUpperCase()} ({group.district.toUpperCase()})</span>
          <span>/</span>
          <span className="text-star-white font-semibold">{groupName}</span>
        </div>

        {/* Group Profile Header with Cover Banner */}
        <section className="relative rounded-3xl glass-panel border border-white/10 overflow-hidden mb-10 shadow-2xl">
          {group.imageUrl && !bannerError && (
            <div className="relative w-full h-48 sm:h-64 overflow-hidden bg-space-900">
              <Image
                src={group.imageUrl}
                alt={groupName}
                fill
                className="object-cover object-center"
                onError={() => setBannerError(true)}
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-space-950 via-space-950/60 to-transparent" />
            </div>
          )}

          <div className="p-6 sm:p-10 relative z-10">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2.5 mb-3">
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/10 text-star-white border border-white/15">
                    {group.agency}
                  </span>
                  <span
                    className="text-[11px] font-bold px-3 py-1 rounded-full"
                    style={{
                      color: group.color,
                      backgroundColor: `${group.color}20`,
                    }}
                  >
                    {group.district.toUpperCase()} ({group.region})
                  </span>
                  <span className="text-xs text-star-dim font-mono">
                    Debut {group.debutYear} • {group.members.length} Members
                  </span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-extrabold text-star-white tracking-tight mb-3 font-[family-name:var(--font-klee-one)]">
                  {groupName}
                </h1>

                <p className="text-sm text-star-dim max-w-2xl leading-relaxed">
                  {description}
                </p>
              </div>
            </div>

            {/* Quick Action Links Bar */}
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-3">
              {group.officialSite && (
                <a
                  href={group.officialSite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-white text-space-950 text-xs font-bold transition hover:bg-star-white flex items-center gap-1.5 shadow-md"
                >
                  <span>🌐</span>
                  <span>{locale === 'ko' ? '공식 사이트' : '公式サイト'}</span>
                </a>
              )}

              {group.ticketUrl && (
                <a
                  href={group.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-pink-500/20"
                >
                  <span>🎟️</span>
                  <span>{locale === 'ko' ? '라이브 티켓 예매' : 'ライブチケット (TIGET/LivePocket)'}</span>
                </a>
              )}

              {group.chekiUrl && (
                <a
                  href={group.chekiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-star-white text-xs font-bold transition border border-white/10 flex items-center gap-1.5"
                >
                  <span>📸</span>
                  <span>{locale === 'ko' ? '체키/공식 스토어' : 'チェキ・通販'}</span>
                </a>
              )}

              {group.scheduleUrl && (
                <a
                  href={group.scheduleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-star-white text-xs font-bold transition border border-white/10 flex items-center gap-1.5"
                >
                  <span>📅</span>
                  <span>{locale === 'ko' ? '라이브 일정' : 'スケジュール'}</span>
                </a>
              )}

              {group.x && (
                <a
                  href={group.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-star-dim hover:text-star-white text-xs font-bold transition"
                  title="X (Twitter)"
                >
                  𝕏
                </a>
              )}
              {group.instagram && (
                <a
                  href={group.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-star-dim hover:text-star-white text-xs transition"
                  title="Instagram"
                >
                  📷
                </a>
              )}
              {group.tiktok && (
                <a
                  href={group.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-star-dim hover:text-star-white text-xs transition"
                  title="TikTok"
                >
                  🎵
                </a>
              )}
              {group.youtube && (
                <a
                  href={group.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-star-dim hover:text-star-white text-xs transition"
                  title="YouTube"
                >
                  ▶️
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Member Section Header & Sorting Rank Tabs */}
        <section className="mb-14">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-6 border-b border-white/10 gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-star-white font-[family-name:var(--font-klee-one)]">
                {locale === 'ko' ? '소속 멤버 목록 및 랭킹' : locale === 'ja' ? 'メンバー一覧・順位' : 'Members & Ranking'}
              </h2>
              <p className="text-xs text-star-dim mt-0.5">
                {locale === 'ko' ? '멤버 카드를 클릭하면 각 멤버의 개인 SNS 및 블로그로 이동합니다.' : 'メンバーを選択して個人SNS・プロフィールへ移動'}
              </p>
            </div>

            {hasVerifiedMetrics ? <div className="flex items-center bg-space-900/90 p-1 rounded-xl border border-white/10 shrink-0">
              <button
                onClick={() => setSortMode('popularity')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  sortMode === 'popularity'
                    ? 'bg-pink-600 text-white shadow'
                    : 'text-star-dim hover:text-white'
                }`}
              >
                <span>👑</span>
                <span>{locale === 'ko' ? '인기순' : '人気順'}</span>
              </button>

              <button
                onClick={() => setSortMode('followers')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  sortMode === 'followers'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-star-dim hover:text-white'
                }`}
              >
                <span>📈</span>
                <span>{locale === 'ko' ? '팔로우순' : 'フォロワー順'}</span>
              </button>

              <button
                onClick={() => setSortMode('search')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  sortMode === 'search'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-star-dim hover:text-white'
                }`}
              >
                <span>🔥</span>
                <span>{locale === 'ko' ? '검색량순' : '検索量順'}</span>
              </button>
            </div> : <span className="text-xs text-star-dim">{locale === 'ko' ? '검증된 랭킹 데이터 준비 중' : locale === 'ja' ? '検証済みランキング準備中' : 'Verified rankings coming soon'}</span>}
          </div>

          {/* Members Grid with Rank & Metric Display */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedMembers.map((member) => {
              const rank = getMemberRank(member);
              const metricText = getMemberMetricText(member);

              return (
                <div key={member.id} className="relative">
                  {sortMode !== 'default' && (
                    <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-space-900/90 border border-white/15 text-[11px] font-extrabold shadow pointer-events-none">
                      <span className={rank === 1 ? 'text-amber-400' : rank === 2 ? 'text-slate-300' : rank === 3 ? 'text-amber-600' : 'text-star-dim'}>
                        {rank === 1 ? '🥇 1위' : rank === 2 ? '🥈 2위' : rank === 3 ? '🥉 3위' : `${rank}위`}
                      </span>
                      <span className="text-pink-400 font-mono text-[10px]">
                        ({metricText})
                      </span>
                    </div>
                  )}
                  <MemberCard
                    member={member}
                    group={group}
                    locale={locale}
                  />
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
