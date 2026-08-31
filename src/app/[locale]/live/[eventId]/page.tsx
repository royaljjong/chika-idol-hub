import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getLiveEvent, getLiveEvents } from '@/lib/data';
import { Link } from '@/i18n/routing';
import { Navigation } from '@/components/ui/Navigation';
import { Footer } from '@/components/ui/Footer';

interface EventPageProps { params: Promise<{ locale: string; eventId: string }> }
const labels = {
  ja: { back: 'ライブ一覧', date: '開催日', time: '時間', venue: '会場', price: '料金', tba: '未定', groups: '出演', ticket: '公式チケット', official: '公式スケジュールで確認', trust: '出典・確認情報', checked: '確認日' },
  ko: { back: '라이브 목록', date: '개최일', time: '시간', venue: '공연장', price: '가격', tba: '미정', groups: '출연', ticket: '공식 티켓', official: '공식 일정에서 확인', trust: '출처·확인 정보', checked: '확인일' },
  en: { back: 'Live events', date: 'Date', time: 'Time', venue: 'Venue', price: 'Price', tba: 'TBA', groups: 'Performers', ticket: 'Official tickets', official: 'Check official schedule', trust: 'Source and review', checked: 'Checked' },
} as const;

export function generateStaticParams() { return getLiveEvents().map(({ event }) => ({ eventId: event.id })); }

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { locale, eventId } = await params;
  const item = getLiveEvent(eventId);
  if (!item) return {};
  const language = locale === 'ko' || locale === 'en' ? locale : 'ja';
  return { title: item.event.title[language], description: `${item.event.startsOn} · ${item.event.areaLabel[language]}` };
}

export default async function EventPage({ params }: EventPageProps) {
  const { locale, eventId } = await params;
  setRequestLocale(locale);
  const language = locale === 'ko' || locale === 'en' ? locale : 'ja';
  const item = getLiveEvent(eventId);
  if (!item) notFound();
  const { event, groups, venue } = item;
  const t = labels[language];
  const date = event.endsOn && event.endsOn !== event.startsOn ? `${event.startsOn} – ${event.endsOn}` : event.startsOn;

  return <div className="relative flex min-h-screen flex-col"><Navigation /><main id="main-content" className="relative z-10 mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6"><Link href="/live" className="text-xs font-bold text-star-dim hover:text-white">← {t.back}</Link><section className="glass-panel mt-6 overflow-hidden"><div className="border-b border-white/10 p-6 sm:p-9"><p className="text-[10px] font-bold tracking-[.18em] text-pink-400">VERIFIED EVENT</p><h1 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-5xl">{event.title[language]}</h1><p className="mt-4 text-sm text-star-dim">{event.areaLabel[language]}</p></div><div className="grid gap-px bg-white/10 sm:grid-cols-2"><Info label={t.date} value={date} /><Info label={t.time} value={event.startsAt ? event.startsAt.slice(11, 16) : t.tba} /><Info label={t.venue} value={venue?.name[language] ?? t.tba} /><Info label={t.price} value={event.price?.[language] ?? t.tba} /></div><div className="p-6 sm:p-9"><h2 className="text-xs font-bold uppercase tracking-[.16em] text-star-dim">{t.groups}</h2><div className="mt-4 flex flex-wrap gap-3">{groups.map((group) => <Link key={group.id} href={`/g/${group.id}`} className="rounded-full border px-4 py-2 text-sm font-bold" style={{ borderColor: `${group.color}66`, color: group.color }}>{group.name[language]}</Link>)}</div><div className="mt-8 flex flex-wrap gap-3">{event.ticketUrl ? <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-pink-500 px-5 py-3 text-sm font-bold text-white">🎟️ {t.ticket}</a> : null}<a href={event.officialUrl} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-space-950">↗ {t.official}</a></div></div></section><section className="mt-8 border-y border-white/10 py-6"><h2 className="text-sm font-bold text-white">{t.trust}</h2><p className="mt-3 break-all text-xs leading-6 text-star-dim"><a href={event.provenance.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-pink-300 hover:text-pink-200">{event.provenance.sourceUrl}</a><br />{t.checked}: {event.provenance.checkedAt}</p></section></main><Footer /></div>;
}

function Info({ label, value }: { label: string; value: string }) { return <div className="bg-space-900/80 p-6"><p className="text-[10px] font-bold uppercase tracking-[.15em] text-star-dim">{label}</p><p className="mt-2 text-base font-bold text-white">{value}</p></div>; }
