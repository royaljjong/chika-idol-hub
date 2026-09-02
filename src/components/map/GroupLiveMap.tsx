'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import type { LiveEventView } from '@/lib/data';
import type { RegionId } from '@/lib/schema';

type Locale = 'ja' | 'ko' | 'en';
const MapLibreJapanMap = dynamic(() => import('./MapLibreJapanMap').then((module) => module.MapLibreJapanMap), { ssr: false });

export function GroupLiveMap({ events, locale }: { events: LiveEventView[]; locale: Locale }) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'fallback'>('loading');
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const venuePoints = useMemo(() => {
    const venues = new Map<string, NonNullable<LiveEventView['venue']>>();
    events.forEach(({ venue }) => { if (venue?.latitude != null && venue.longitude != null) venues.set(venue.id, venue); });
    return [...venues.values()].map((venue) => ({
      id: venue.id, name: venue.name, region: venue.region, longitude: venue.longitude!, latitude: venue.latitude!, geoAreaId: venue.geoAreaId,
      eventCount: events.filter((item) => item.venue?.id === venue.id).length,
    }));
  }, [events]);
  const region = (venuePoints[0]?.region ?? events[0]?.event.region ?? 'tokyo') as RegionId;
  const selectedVenue = events.find((item) => item.venue?.id === selectedVenueId)?.venue ?? null;
  const selectedEvents = selectedVenue ? events.filter((item) => item.venue?.id === selectedVenue.id) : [];
  const labels = {
    pending: locale === 'ko' ? '지도 위치가 검증된 공연장이 아직 없습니다.' : locale === 'en' ? 'No venue coordinates have been verified yet.' : '座標を検証済みの会場はまだありません。',
    failed: locale === 'ko' ? '지도를 불러오지 못했습니다. 아래 공연장 링크를 이용하세요.' : locale === 'en' ? 'The map could not load. Use the venue links below.' : '地図を読み込めません。下の会場リンクをご利用ください。',
    venues: locale === 'ko' ? '공연장 선택' : locale === 'en' ? 'Select a venue' : '会場を選択',
  };
  if (!venuePoints.length) return <div className="group-live-map-empty">{labels.pending}</div>;
  const firstVenue = venuePoints[0]!;
  return <div className="group-live-map-shell">
    <div className="group-live-map-canvas">
      {status !== 'fallback' ? <MapLibreJapanMap
        points={[{ id: region, label: { ja: '', ko: '', en: '' }, longitude: firstVenue.longitude, latitude: firstVenue.latitude, count: 0, eventCount: events.length }]}
        venuePoints={venuePoints} layer="events" locale={locale} selected={region} selectedWardId="all"
        onSelect={() => undefined} onVenueSelect={setSelectedVenueId} onReady={() => setStatus('ready')} onUnavailable={() => setStatus('fallback')}
      /> : <div className="group-live-map-empty">{labels.failed}</div>}
      {status === 'loading' ? <div className="group-live-map-loading">MAP LOADING…</div> : null}
    </div>
    <div className="group-live-map-venues" role="group" aria-label={labels.venues}>
      <small>{labels.venues}</small>
      <div>
        {venuePoints.map((venue) => <button key={venue.id} type="button" aria-pressed={selectedVenueId === venue.id} onClick={() => setSelectedVenueId(venue.id)}><strong>{venue.name[locale]}</strong><span>{venue.eventCount} LIVE</span></button>)}
      </div>
    </div>
    {selectedVenue ? <aside className="group-live-map-selection"><small>SELECTED VENUE</small><strong>{selectedVenue.name[locale]}</strong><span>{selectedVenue.address[locale]}</span><a href={selectedVenue.googleMapsUrl} target="_blank" rel="noopener noreferrer">Google Maps →</a>{selectedEvents.map(({ event }) => <a key={event.id} href={`/${locale}/live/${event.id}`}><time>{event.startsOn}</time>{event.title[locale]}</a>)}</aside> : <p className="group-live-map-help">{locale === 'ko' ? '공연장 핀을 누르면 해당 장소의 일정을 확인할 수 있습니다.' : locale === 'en' ? 'Select a venue pin to see its events.' : '会場ピンを選ぶと公演を確認できます。'}</p>}
  </div>;
}
