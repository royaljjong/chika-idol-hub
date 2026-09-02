'use client';

import React, { useEffect, useRef, useState, use } from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getGroup, getUpcomingLiveEventsForGroup } from '@/lib/data';
import type { ChikaMember } from '@/lib/schema';
import { Link } from '@/i18n/routing';
import { Navigation } from '@/components/ui/Navigation';
import { Footer } from '@/components/ui/Footer';
import { MemberCard } from '@/components/member/MemberCard';
import { GroupLiveMap } from '@/components/map/GroupLiveMap';

interface GroupPageProps {
  params: Promise<{ locale: string; groupId: string }>;
  searchParams: Promise<{ tab?: string | string[] }>;
}

type MemberSortMode = 'default' | 'popularity' | 'followers' | 'search';

export default function GroupPage({ params, searchParams }: GroupPageProps) {
  const { locale, groupId } = use(params);
  const initialSearchParams = use(searchParams);
  const initialTab = initialSearchParams.tab === 'live' ? 'live' : 'profile';
  const [sortMode, setSortMode] = useState<MemberSortMode>('default');
  const [bannerError, setBannerError] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'live'>(initialTab);
  const profileTabRef = useRef<HTMLButtonElement>(null);
  const liveTabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const restoreTab = () => {
      const url = new URL(window.location.href);
      const rawTab = url.searchParams.get('tab');
      setActiveTab(rawTab === 'live' ? 'live' : 'profile');
      if (rawTab && rawTab !== 'live') {
        url.searchParams.delete('tab');
        window.history.replaceState(window.history.state, '', url);
      }
    };
    restoreTab();
    window.addEventListener('popstate', restoreTab);
    return () => window.removeEventListener('popstate', restoreTab);
  }, []);

  const chooseTab = (tab: 'profile' | 'live') => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    if (tab === 'live') url.searchParams.set('tab', 'live'); else url.searchParams.delete('tab');
    window.history.pushState(window.history.state, '', url);
  };

  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    let nextTab: 'profile' | 'live' | null = null;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp' || event.key === 'Home') nextTab = 'profile';
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown' || event.key === 'End') nextTab = 'live';
    if (!nextTab) return;
    event.preventDefault();
    chooseTab(nextTab);
    (nextTab === 'profile' ? profileTabRef : liveTabRef).current?.focus();
  };

  const group = getGroup(groupId);
  if (!group) {
    notFound();
  }

  const groupName = group.name[locale as 'ja' | 'ko' | 'en'] || group.name.ja;
  const description = group.description[locale as 'ja' | 'ko' | 'en'] || group.description.ja;
  const language = locale === 'ko' || locale === 'en' ? locale : 'ja';
  const upcomingEvents = getUpcomingLiveEventsForGroup(group.id);
  const hasVerifiedMetrics = group.members.some((member) => member.metricsVerifiedAt && member.metricsSourceUrl && (member.popularityScore !== undefined || member.searchVolumeScore !== undefined || member.xFollowers !== 0 || member.igFollowers !== 0));

  // Filter members by selected subunit
  const filtered = group.members;

  // Sort members according to selected mode
  const sortedMembers = [...filtered].sort((a, b) => {
    if (sortMode === 'followers') {
      const totalA = (a.xFollowers || 0) + (a.igFollowers || 0);
      const totalB = (b.xFollowers || 0) + (b.igFollowers || 0);
      return totalB - totalA;
    }
    if (sortMode === 'search') {
      return (b.searchVolumeScore ?? -1) - (a.searchVolumeScore ?? -1);
    }
    if (sortMode === 'popularity') {
      return (b.popularityScore ?? -1) - (a.popularityScore ?? -1);
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
      return member.searchVolumeScore === undefined ? '' : `${member.searchVolumeScore}pt`;
    }
    if (sortMode === 'popularity') {
      return member.popularityScore === undefined ? '' : `${member.popularityScore}점`;
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
          <Link href={`/?mapRegion=${encodeURIComponent(group.region)}&mapDistrict=${encodeURIComponent(group.district)}`} className="hover:text-cyan-200 transition">{group.region.toUpperCase()} ({group.district.toUpperCase()})</Link>
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
                    Debut {group.debutYear} • {group.members.length} {locale === 'ko' ? '검증 수록' : locale === 'ja' ? '検証収録' : 'verified entries'}
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

        <div className="group-detail-tabs" role="tablist" aria-label={language === 'ko' ? '그룹 상세 보기' : language === 'en' ? 'Group details' : 'グループ詳細'}>
          <button ref={profileTabRef} type="button" role="tab" id="group-profile-tab" aria-controls="group-profile-panel" aria-selected={activeTab === 'profile'} tabIndex={activeTab === 'profile' ? 0 : -1} className={activeTab === 'profile' ? 'group-detail-tab-active' : ''} onClick={() => chooseTab('profile')} onKeyDown={handleTabKeyDown}>{language === 'ko' ? '프로필 · 멤버' : language === 'en' ? 'Profile & members' : 'プロフィール・メンバー'}</button>
          <button ref={liveTabRef} type="button" role="tab" id="group-live-tab" aria-controls="group-live-panel" aria-selected={activeTab === 'live'} tabIndex={activeTab === 'live' ? 0 : -1} className={activeTab === 'live' ? 'group-detail-tab-active' : ''} onClick={() => chooseTab('live')} onKeyDown={handleTabKeyDown}>{language === 'ko' ? '라이브 · 공연장 지도' : language === 'en' ? 'Live & venue map' : 'ライブ・会場マップ'}<span>{upcomingEvents.length}</span></button>
        </div>

        {activeTab === 'live' ? <section id="group-live-panel" aria-labelledby="group-live-tab" className="mb-12" role="tabpanel">
          <div className="mb-5 flex items-end justify-between border-b border-white/10 pb-3">
            <div><p className="text-[10px] font-bold tracking-[.16em] text-pink-400">VERIFIED LIVE</p><h2 className="mt-1 text-xl font-bold text-white">{language === 'ko' ? '예정 공연' : language === 'en' ? 'Upcoming events' : '今後のライブ'}</h2></div>
            <Link href={`/live?group=${group.id}`} className="text-xs font-bold text-pink-300 hover:text-pink-200">{language === 'ko' ? '전체 일정' : language === 'en' ? 'All events' : '一覧'} →</Link>
          </div>
          <GroupLiveMap events={upcomingEvents} locale={language} />
          {upcomingEvents.length ? <div className="grid gap-3">{upcomingEvents.slice(0, 3).map(({ event }) => <Link key={event.id} href={`/live/${event.id}`} className="glass-panel flex flex-col justify-between gap-3 p-5 transition hover:border-white/25 sm:flex-row sm:items-center"><div><p className="font-mono text-xs text-pink-300">{event.startsOn}{event.endsOn ? ` – ${event.endsOn}` : ''}</p><h3 className="mt-2 font-bold text-white">{event.title[language]}</h3><p className="mt-1 text-xs text-star-dim">{event.areaLabel[language]} · {event.startsAt ? event.startsAt.slice(11, 16) : (language === 'ko' ? '시간 미정' : language === 'en' ? 'Time TBA' : '時間未定')}</p></div><span className="text-xs font-bold text-star-dim">{language === 'ko' ? '상세' : language === 'en' ? 'Details' : '詳細'} →</span></Link>)}</div> : <div className="border border-dashed border-white/15 px-5 py-8 text-sm text-star-dim">{language === 'ko' ? '현재 공개 가능한 검증 공연을 수집 중입니다. 공식 일정에서 최신 정보를 확인하세요.' : language === 'en' ? 'Verified events are being collected. Check the official schedule for the latest information.' : '公開可能な検証済み公演を収集中です。最新情報は公式スケジュールでご確認ください。'}</div>}
        </section> : null}

        {/* Member Section Header & Sorting Rank Tabs */}
        {activeTab === 'profile' ? <section id="group-profile-panel" aria-labelledby="group-profile-tab" className="mb-14" role="tabpanel">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-6 border-b border-white/10 gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-star-white font-[family-name:var(--font-klee-one)]">
                {locale === 'ko' ? '소속 멤버 목록 및 랭킹' : locale === 'ja' ? 'メンバー一覧・順位' : 'Members & Ranking'}
              </h2>
              <p className="text-xs text-star-dim mt-0.5">
                {group.coverageStatus !== 'complete'
                  ? (locale === 'ko' ? `전체 현역 명단 검증 중${group.officialMemberCount ? ` · 공식 명단 ${group.officialMemberCount}명` : ''}` : locale === 'ja' ? `現役メンバー全名簿を検証中${group.officialMemberCount ? ` · 公式${group.officialMemberCount}名` : ''}` : `Full active roster under verification${group.officialMemberCount ? ` · ${group.officialMemberCount} official` : ''}`)
                  : (locale === 'ko' ? '멤버 카드를 클릭하면 개인 공식 링크로 이동합니다.' : locale === 'ja' ? 'メンバーカードから公式リンクへ移動' : 'Open a member card for official links.')}
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
          {sortedMembers.length === 0 ? <div className="border border-dashed border-amber-300/25 bg-amber-300/[.03] px-5 py-10 text-center text-sm text-star-dim">{locale === 'ko' ? '현재 공식 멤버 명단을 검증하고 있습니다. 확인되지 않은 과거 멤버는 표시하지 않습니다.' : locale === 'ja' ? '現役公式メンバーを検証中です。未確認の旧メンバーは表示しません。' : 'The current official roster is being verified. Unconfirmed former members are hidden.'}</div> : null}
        </section> : null}
      </main>

      <Footer />
    </div>
  );
}
