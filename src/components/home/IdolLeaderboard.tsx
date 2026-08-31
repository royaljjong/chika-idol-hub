'use client';

import React, { useState } from 'react';
import type { ChikaMember, ChikaGroup } from '@/lib/schema';
import { MemberAvatar } from '@/components/member/MemberAvatar';
import { Link } from '@/i18n/routing';

export type RankTab = 'popularity' | 'followers' | 'search';

interface IdolLeaderboardProps {
  initialMembers: Array<{
    member: ChikaMember;
    group: ChikaGroup;
  }>;
  locale: string;
}

export function IdolLeaderboard({ initialMembers, locale }: IdolLeaderboardProps) {
  const [tab, setTab] = useState<RankTab>('popularity');

  const formatScore = (member: ChikaMember, currentTab: RankTab) => {
    if (currentTab === 'followers') {
      const total = (member.xFollowers || 0) + (member.igFollowers || 0);
      return total >= 10000 ? `${(total / 10000).toFixed(1)}만` : total.toLocaleString();
    }
    if (currentTab === 'search') {
      return member.searchVolumeScore === undefined ? '-' : `${member.searchVolumeScore}pt`;
    }
    return member.popularityScore === undefined ? '-' : `${member.popularityScore}점`;
  };

  const getSubtext = (member: ChikaMember, currentTab: RankTab) => {
    if (currentTab === 'followers') {
      const xF = member.xFollowers || 0;
      const igF = member.igFollowers || 0;
      const xStr = xF >= 10000 ? `${(xF / 10000).toFixed(1)}만` : xF.toString();
      const igStr = igF >= 10000 ? `${(igF / 10000).toFixed(1)}만` : igF.toString();
      return `𝕏 ${xStr} • 📷 ${igStr}`;
    }
    if (currentTab === 'search') {
      return locale === 'ko' ? '주간 미디어 버즈 지수' : locale === 'ja' ? '週間メディア検索指数' : 'Weekly Media Buzz';
    }
    return locale === 'ko' ? '종합 팬덤 & 라이브 동원력' : locale === 'ja' ? '総合ファン動員指数' : 'Live Mobilization Score';
  };

  // Sort according to current active tab
  const sorted = [...initialMembers].sort((a, b) => {
    if (tab === 'followers') {
      const totalA = (a.member.xFollowers || 0) + (a.member.igFollowers || 0);
      const totalB = (b.member.xFollowers || 0) + (b.member.igFollowers || 0);
      return totalB - totalA;
    }
    if (tab === 'search') {
      return (b.member.searchVolumeScore ?? -1) - (a.member.searchVolumeScore ?? -1);
    }
    return (b.member.popularityScore ?? -1) - (a.member.popularityScore ?? -1);
  });

  const top8 = sorted.slice(0, 8);

  if (initialMembers.length === 0) {
    return (
      <section className="mb-14 border-y border-white/10 py-8">
        <p className="text-[10px] font-bold tracking-[.18em] text-pink-400">RANKING · DATA POLICY</p>
        <h2 className="mt-2 text-xl font-bold text-star-white">
          {locale === 'ko' ? '랭킹 데이터 검증 중' : locale === 'ja' ? 'ランキングデータ検証中' : 'Ranking data under verification'}
        </h2>
        <p className="mt-3 max-w-2xl text-xs leading-6 text-star-dim">
          {locale === 'ko' ? '출처·수집일·플랫폼이 확인되지 않은 기존 점수는 공개하지 않습니다. 검증된 팔로워 스냅숏과 검색 지수만 순위에 반영합니다.' : locale === 'ja' ? '出典・収集日・プラットフォームを確認できない既存スコアは公開しません。検証済みデータのみ掲載します。' : 'Unsourced legacy scores are hidden. Rankings will return with platform, source and collection date.'}
        </p>
      </section>
    );
  }

  const getRankBadge = (idx: number) => {
    if (idx === 0) return '🥇 1';
    if (idx === 1) return '🥈 2';
    if (idx === 2) return '🥉 3';
    return `${idx + 1}`;
  };

  const getRankStyle = (idx: number) => {
    if (idx === 0) return 'border-amber-400/60 bg-gradient-to-br from-amber-500/15 via-space-850 to-transparent shadow-lg shadow-amber-500/5';
    if (idx === 1) return 'border-slate-300/60 bg-gradient-to-br from-slate-400/15 via-space-850 to-transparent shadow-lg shadow-slate-400/5';
    if (idx === 2) return 'border-amber-700/60 bg-gradient-to-br from-amber-700/15 via-space-850 to-transparent shadow-lg shadow-amber-700/5';
    return 'border-white/10 bg-space-850/60 hover:border-white/20';
  };

  return (
    <section className="mb-14">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-6 border-b border-white/10 gap-4">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🏆</span>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-star-white font-[family-name:var(--font-klee-one)]">
              {locale === 'ko' ? '일본 지하아이돌 종합 랭킹' : locale === 'ja' ? '全国地下アイドル総合ランキング' : 'National Idol Leaderboard'}
            </h2>
            <p className="text-xs text-star-dim mt-0.5">
              {locale === 'ko' ? '인기 순위, SNS 팔로워 순위, 검색량/트렌드 순위 3대 지표' : '人気順・SNSフォロワー順・検索トレンド順の3大指標'}
            </p>
          </div>
        </div>

        {/* 3 Tab Switcher */}
        <div className="flex items-center bg-space-900/80 p-1 rounded-xl border border-white/10 shrink-0">
          <button
            onClick={() => setTab('popularity')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              tab === 'popularity'
                ? 'bg-pink-600 text-white shadow-md'
                : 'text-star-dim hover:text-star-white'
            }`}
          >
            <span>👑</span>
            <span>{locale === 'ko' ? '인기 순위' : locale === 'ja' ? '人気順' : 'Popularity'}</span>
          </button>

          <button
            onClick={() => setTab('followers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              tab === 'followers'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-star-dim hover:text-star-white'
            }`}
          >
            <span>📈</span>
            <span>{locale === 'ko' ? '팔로우 순위' : locale === 'ja' ? 'フォロワー順' : 'Followers'}</span>
          </button>

          <button
            onClick={() => setTab('search')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              tab === 'search'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-star-dim hover:text-star-white'
            }`}
          >
            <span>🔥</span>
            <span>{locale === 'ko' ? '검색량(이슈)' : locale === 'ja' ? '検索量・トレンド' : 'Search / Trend'}</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {top8.map((item, idx) => {
          const nameJa = item.member.name.ja.kanji;
          const nameDisplay = locale === 'ko' ? item.member.name.ko.hangul : locale === 'en' ? item.member.name.en.romaji : nameJa;
          const groupName = item.group.name[locale as 'ja' | 'ko' | 'en'] || item.group.name.ja;

          return (
            <Link
              key={`${tab}-${item.member.id}`}
              href={`/m/${item.member.id}`}
              className={`group p-4 rounded-2xl glass-panel border transition-all duration-300 hover:-translate-y-1 flex items-center justify-between ${getRankStyle(idx)}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <MemberAvatar
                    glyph={nameJa[0] || '★'}
                    memberColor={item.member.memberColor}
                    imageUrl={item.member.imageUrl}
                    name={nameDisplay}
                    size={46}
                    className="ring-2 ring-space-900 shadow-md group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute -top-2 -left-1 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-space-900 text-star-white border border-white/20 shadow">
                    {getRankBadge(idx)}
                  </span>
                </div>

                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-star-white group-hover:text-pink-300 transition truncate">
                    {nameDisplay}
                  </h4>
                  <p className="text-[11px] text-star-dim truncate">
                    {groupName}
                  </p>
                  <p className="text-[10px] text-star-dim/70 truncate mt-0.5 font-mono">
                    {getSubtext(item.member, tab)}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0 ml-2">
                <span className="text-sm font-extrabold text-pink-400 block font-mono">
                  {formatScore(item.member, tab)}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-star-dim/60 block">
                  {tab === 'followers' ? 'Total' : tab === 'search' ? 'Buzz' : 'Score'}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
