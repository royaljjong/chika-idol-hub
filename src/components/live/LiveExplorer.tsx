'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from '@/i18n/routing';

export interface LiveExplorerItem {
  id: string;
  title: string;
  startsOn: string;
  endsOn: string | null;
  startsAt: string | null;
  timeStatus: 'confirmed' | 'tba';
  region: string;
  areaLabel: string;
  venueName: string | null;
  price: string | null;
  hasTicket: boolean;
  status: 'scheduled' | 'sold_out' | 'canceled' | 'postponed';
  groups: Array<{ id: string; name: string; color: string }>;
  checkedAt: string;
}

const copy = {
  ja: { all: 'すべて', upcoming: 'これから', date: '日付', region: '地域', group: 'グループ', reset: '条件をリセット', empty: '条件に合う検証済み公演はありません。', detail: '詳細を見る', tba: '時間未定', ticket: 'チケットあり', source: '確認日' },
  ko: { all: '전체', upcoming: '예정', date: '날짜', region: '지역', group: '그룹', reset: '조건 초기화', empty: '조건에 맞는 검증된 공연이 없습니다.', detail: '상세 보기', tba: '시간 미정', ticket: '티켓 있음', source: '확인일' },
  en: { all: 'All', upcoming: 'Upcoming', date: 'Date', region: 'Area', group: 'Group', reset: 'Reset filters', empty: 'No verified events match these filters.', detail: 'View details', tba: 'Time TBA', ticket: 'Tickets available', source: 'Checked' },
} as const;

const regionLabels: Record<string, Record<'ja' | 'ko' | 'en', string>> = {
  tokyo: { ja: '東京', ko: '도쿄', en: 'Tokyo' },
  osaka: { ja: '大阪', ko: '오사카', en: 'Osaka' },
  sapporo: { ja: '札幌', ko: '삿포로', en: 'Sapporo' },
  nagoya: { ja: '名古屋', ko: '나고야', en: 'Nagoya' },
  fukuoka: { ja: '福岡', ko: '후쿠오카', en: 'Fukuoka' },
  other: { ja: 'その他・地域未確認', ko: '기타·지역 미확인', en: 'Other / unverified area' },
};

function formatDate(item: LiveExplorerItem, locale: string) {
  const language = locale === 'ko' ? 'ko-KR' : locale === 'en' ? 'en-US' : 'ja-JP';
  const format = (value: string) => new Intl.DateTimeFormat(language, { month: 'short', day: 'numeric', weekday: 'short', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
  return item.endsOn && item.endsOn !== item.startsOn ? `${format(item.startsOn)} – ${format(item.endsOn)}` : format(item.startsOn);
}

export function LiveExplorer({ events, locale, today, initialGroup = 'all', initialRegion = 'all', initialDate = '', initialMode = 'upcoming' }: { events: LiveExplorerItem[]; locale: string; today: string; initialGroup?: string; initialRegion?: string; initialDate?: string; initialMode?: string }) {
  const language = locale === 'ko' || locale === 'en' ? locale : 'ja';
  const t = copy[language];
  const [dateMode, setDateMode] = useState<'upcoming' | 'all'>(initialMode === 'all' ? 'all' : 'upcoming');
  const [date, setDate] = useState(/^\d{4}-\d{2}-\d{2}$/.test(initialDate) ? initialDate : '');
  const [region, setRegion] = useState(events.some((item) => item.region === initialRegion) ? initialRegion : 'all');
  const [group, setGroup] = useState(events.some((item) => item.groups.some((entry) => entry.id === initialGroup)) ? initialGroup : 'all');
  const regions = useMemo(() => Array.from(new Set(events.map((item) => item.region))).map((value) => [value, regionLabels[value]?.[language] ?? value] as const), [events, language]);
  const groups = useMemo(() => Array.from(new Map(events.flatMap((item) => item.groups.map((entry) => [entry.id, entry.name] as const))).entries()), [events]);
  const filtered = useMemo(() => events.filter((item) => {
    if (dateMode === 'upcoming' && (item.startsOn < today || item.status === 'canceled')) return false;
    if (date && !(item.startsOn <= date && (item.endsOn ?? item.startsOn) >= date)) return false;
    if (region !== 'all' && item.region !== region) return false;
    if (group !== 'all' && !item.groups.some((entry) => entry.id === group)) return false;
    return true;
  }), [date, dateMode, events, group, region, today]);

  const normalizeRegion = useCallback((value: string | null) => events.some((item) => item.region === value) ? value! : 'all', [events]);
  const normalizeGroup = useCallback((value: string | null) => events.some((item) => item.groups.some((entry) => entry.id === value)) ? value! : 'all', [events]);
  const applyUrl = useCallback((next: { dateMode: 'upcoming' | 'all'; date: string; region: string; group: string }, replace = false) => {
    const url = new URL(window.location.href);
    const setOrDelete = (key: string, value: string, empty: string) => value === empty ? url.searchParams.delete(key) : url.searchParams.set(key, value);
    setOrDelete('mode', next.dateMode, 'upcoming');
    setOrDelete('date', next.date, '');
    setOrDelete('region', next.region, 'all');
    setOrDelete('group', next.group, 'all');
    window.history[replace ? 'replaceState' : 'pushState'](window.history.state, '', url);
  }, []);
  const restore = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const nextMode = params.get('mode') === 'all' ? 'all' : 'upcoming';
    const rawDate = params.get('date') ?? '';
    const nextDate = /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : '';
    const nextRegion = normalizeRegion(params.get('region'));
    const nextGroup = normalizeGroup(params.get('group'));
    setDateMode(nextMode); setDate(nextDate); setRegion(nextRegion); setGroup(nextGroup);
    applyUrl({ dateMode: nextMode, date: nextDate, region: nextRegion, group: nextGroup }, true);
  }, [applyUrl, normalizeGroup, normalizeRegion]);
  useEffect(() => {
    queueMicrotask(restore);
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, [restore]);
  const update = (next: Partial<{ dateMode: 'upcoming' | 'all'; date: string; region: string; group: string }>) => {
    const state = { dateMode, date, region, group, ...next };
    setDateMode(state.dateMode); setDate(state.date); setRegion(state.region); setGroup(state.group); applyUrl(state);
  };
  const reset = () => update({ dateMode: 'upcoming', date: '', region: 'all', group: 'all' });
  const statusLabel = (status: LiveExplorerItem['status']) => ({ scheduled: '', sold_out: language === 'ko' ? '매진' : language === 'en' ? 'Sold out' : '完売', canceled: language === 'ko' ? '취소' : language === 'en' ? 'Canceled' : '中止', postponed: language === 'ko' ? '연기' : language === 'en' ? 'Postponed' : '延期' })[status];

  return <div>
    <div className="mb-8 border-y border-white/10 py-5">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex rounded-xl border border-white/10 bg-black/20 p-1">
          {(['upcoming', 'all'] as const).map((mode) => <button key={mode} type="button" onClick={() => update({ dateMode: mode })} className={`rounded-lg px-3 py-2 text-xs font-bold ${dateMode === mode ? 'bg-white text-space-950' : 'text-star-dim hover:text-white'}`}>{mode === 'upcoming' ? t.upcoming : t.all}</button>)}
        </div>
        <label className="grid gap-1 text-[10px] font-bold uppercase tracking-[.14em] text-star-dim"><span>{t.date}</span><input type="date" value={date} onChange={(event) => update({ date: event.target.value })} className="rounded-xl border border-white/10 bg-space-900 px-3 py-2 text-xs text-white" /></label>
        <label className="grid gap-1 text-[10px] font-bold uppercase tracking-[.14em] text-star-dim"><span>{t.region}</span><select value={region} onChange={(event) => update({ region: event.target.value })} className="min-w-40 rounded-xl border border-white/10 bg-space-900 px-3 py-2 text-xs text-white [color-scheme:dark]"><option value="all">{t.all}</option>{regions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="grid gap-1 text-[10px] font-bold uppercase tracking-[.14em] text-star-dim"><span>{t.group}</span><select value={group} onChange={(event) => update({ group: event.target.value })} className="min-w-44 rounded-xl border border-white/10 bg-space-900 px-3 py-2 text-xs text-white [color-scheme:dark]"><option value="all">{t.all}</option>{groups.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <button type="button" onClick={reset} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-star-dim hover:border-white/30 hover:text-white">{t.reset}</button>
        <span className="ml-auto font-mono text-xs text-star-dim">{filtered.length} / {events.length}</span>
      </div>
    </div>

    {filtered.length ? <div className="grid gap-4">{filtered.map((item) => <article key={item.id} className="glass-panel grid gap-5 p-5 sm:grid-cols-[150px_1fr_auto] sm:items-center sm:p-6">
      <div><p className="text-lg font-bold text-white">{formatDate(item, language)}</p><p className="mt-1 text-xs text-star-dim">{item.startsAt ? item.startsAt.slice(11, 16) : t.tba}</p></div>
      <div><div className="mb-2 flex flex-wrap gap-2">{item.groups.map((entry) => <Link key={entry.id} href={`/g/${entry.id}`} className="rounded-full border px-2.5 py-1 text-[10px] font-bold" style={{ borderColor: `${entry.color}66`, color: entry.color }}>{entry.name}</Link>)}{statusLabel(item.status) ? <span className="rounded-full border border-amber-300/40 px-2.5 py-1 text-[10px] font-bold text-amber-200">{statusLabel(item.status)}</span> : null}</div><h2 className="text-lg font-bold text-star-white">{item.title}</h2><p className="mt-2 text-xs text-star-dim">{item.venueName ?? item.areaLabel}{item.price ? ` · ${item.price}` : ''}</p><p className="mt-2 text-[10px] text-star-faint">{t.source}: {item.checkedAt}{item.hasTicket ? ` · ${t.ticket}` : ''}</p></div>
      <Link href={`/live/${item.id}`} className="inline-flex justify-center rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-space-950 hover:bg-pink-100">{t.detail} →</Link>
    </article>)}</div> : <div className="border border-dashed border-white/15 px-6 py-16 text-center"><p className="text-sm text-star-dim">{t.empty}</p><button type="button" onClick={reset} className="mt-4 text-xs font-bold text-pink-300 hover:text-pink-200">{t.reset}</button></div>}
  </div>;
}
