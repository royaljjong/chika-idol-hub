'use client';

import React from 'react';
import type { ChikaMember, ChikaGroup } from '@/lib/schema';
import { MemberAvatar } from '@/components/member/MemberAvatar';
import { Link } from '@/i18n/routing';

interface RankingItem {
  member: ChikaMember;
  group: ChikaGroup;
  totalFollowers: number;
}

interface FollowerRankingProps {
  ranking: RankingItem[];
  locale: string;
}

export function FollowerRanking({ ranking, locale }: FollowerRankingProps) {
  const top10 = ranking.slice(0, 8);

  const formatFollowers = (num: number) => {
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}만`;
    }
    return num.toLocaleString();
  };

  const getRankStyle = (idx: number) => {
    if (idx === 0) return 'border-amber-400/50 bg-gradient-to-br from-amber-500/10 to-transparent';
    if (idx === 1) return 'border-slate-300/50 bg-gradient-to-br from-slate-400/10 to-transparent';
    if (idx === 2) return 'border-amber-700/50 bg-gradient-to-br from-amber-700/10 to-transparent';
    return 'border-white/10 bg-space-850/60';
  };

  return (
    <section className="mb-14">
      <div className="flex items-center justify-between pb-3 mb-6 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">📈</span>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-star-white font-[family-name:var(--font-klee-one)]">
              {locale === 'ko' ? 'SNS 팔로워 랭킹 TOP' : locale === 'ja' ? 'SNSフォロワーランキング' : 'Top Follower Leaderboard'}
            </h2>
            <p className="text-xs text-star-dim mt-0.5">
              {locale === 'ko' ? 'X(트위터) 및 인스타그램 종합 팔로워 랭킹' : 'X(Twitter)・Instagram 合計フォロワー数ランキング'}
            </p>
          </div>
        </div>
        <span className="text-xs text-star-dim font-mono">
          Live Stats
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {top10.map((item, idx) => {
          const nameJa = item.member.name.ja.kanji;
          const nameDisplay = locale === 'ko' ? item.member.name.ko.hangul : locale === 'en' ? item.member.name.en.romaji : nameJa;
          const groupName = item.group.name[locale as 'ja' | 'ko' | 'en'] || item.group.name.ja;

          return (
            <Link
              key={item.member.id}
              href={`/m/${item.member.id}`}
              className={`group p-4 rounded-2xl glass-panel border transition-all duration-300 hover:-translate-y-1 flex items-center justify-between ${getRankStyle(idx)}`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative shrink-0">
                  <MemberAvatar
                    glyph={nameJa[0] || '★'}
                    memberColor={item.member.memberColor}
                    imageUrl={item.member.imageUrl}
                    name={nameDisplay}
                    size={46}
                    className="ring-2 ring-space-900 shadow-md"
                  />
                  <span className="absolute -top-2 -left-1 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-space-900 text-star-white border border-white/20">
                    {idx + 1}
                  </span>
                </div>

                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-star-white group-hover:text-pink-300 transition truncate">
                    {nameDisplay}
                  </h4>
                  <p className="text-[11px] text-star-dim truncate">
                    {groupName}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-star-dim/80 font-mono mt-0.5">
                    <span>𝕏 {formatFollowers(item.member.xFollowers || 0)}</span>
                    <span>📷 {formatFollowers(item.member.igFollowers || 0)}</span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0 ml-2">
                <span className="text-xs font-bold text-pink-400 block font-mono">
                  {formatFollowers(item.totalFollowers)}
                </span>
                <span className="text-[10px] text-star-dim/60 block">
                  Followers
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
