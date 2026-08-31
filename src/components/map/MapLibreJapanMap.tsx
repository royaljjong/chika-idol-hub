'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { RegionId } from '@/lib/schema';

type Locale = 'ja' | 'ko' | 'en';
type MapPoint = {
  id: RegionId;
  label: Record<Locale, string>;
  longitude: number;
  latitude: number;
  count: number;
  eventCount: number;
};
type VenuePoint = {
  id: string;
  name: Record<Locale, string>;
  region: RegionId;
  longitude: number;
  latitude: number;
  eventCount: number;
  geoAreaId: string | null;
};

export function MapLibreJapanMap({
  points,
  venuePoints,
  layer,
  locale,
  selected,
  selectedWardId,
  onSelect,
  onVenueSelect,
  onReady,
  onUnavailable,
}: {
  points: MapPoint[];
  venuePoints: VenuePoint[];
  layer: 'events' | 'groups';
  locale: Locale;
  selected: RegionId | 'all';
  selectedWardId: string | 'all';
  onSelect: (region: RegionId) => void;
  onVenueSelect: (venueId: string) => void;
  onReady: () => void;
  onUnavailable: () => void;
}) {
  const selectedWardVenues = useMemo(() => venuePoints.filter((venue) => selectedWardId === 'all' || venue.geoAreaId === selectedWardId), [selectedWardId, venuePoints]);
  const selectedWardCenter = useMemo(() => selectedWardVenues.length ? [selectedWardVenues.reduce((sum, venue) => sum + venue.longitude, 0) / selectedWardVenues.length, selectedWardVenues.reduce((sum, venue) => sum + venue.latitude, 0) / selectedWardVenues.length] as [number, number] : null, [selectedWardVenues]);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import('maplibre-gl').Map | null>(null);
  const loadedRef = useRef(false);
  const [readyVersion, setReadyVersion] = useState(0);
  const callbacksRef = useRef({ onSelect, onVenueSelect, onReady, onUnavailable });

  useEffect(() => {
    callbacksRef.current = { onSelect, onVenueSelect, onReady, onUnavailable };
  }, [onReady, onSelect, onUnavailable, onVenueSelect]);

  useEffect(() => {
    if (!containerRef.current || !('WebGLRenderingContext' in window)) {
      callbacksRef.current.onUnavailable();
      return;
    }

    let disposed = false;
    let map: import('maplibre-gl').Map | undefined;
    const timeout = window.setTimeout(() => callbacksRef.current.onUnavailable(), 10000);

    void import('maplibre-gl').then(({ Map, NavigationControl }) => {
      if (disposed || !containerRef.current) return;

      map = new Map({
        container: containerRef.current,
        center: selectedWardCenter ?? (selected === 'all' ? [137.4, 37.2] : [points.find((point) => point.id === selected)?.longitude ?? 137.4, points.find((point) => point.id === selected)?.latitude ?? 37.2]),
        zoom: selectedWardCenter ? 12.3 : selected === 'all' ? 4.05 : selected === 'tokyo' ? 11.05 : 7.2,
        minZoom: 3.5,
        maxZoom: 12,
        attributionControl: {},
        localIdeographFontFamily: 'sans-serif',
        style: {
          version: 8,
          sources: {
            gsi: {
              type: 'raster',
              tiles: ['https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noreferrer">地理院タイル</a>',
            },
            gsiBoundary: {
              type: 'vector',
              tiles: ['https://cyberjapandata.gsi.go.jp/xyz/experimental_bvmap/{z}/{x}/{y}.pbf'],
              minzoom: 4,
              maxzoom: 16,
              attribution: '<a href="https://maps.gsi.go.jp/development/vt.html" target="_blank" rel="noreferrer">国土地理院ベクトルタイル提供実験</a>',
            },
            regions: {
              type: 'geojson',
              data: {
                type: 'FeatureCollection',
                features: points.map((point) => ({
                  type: 'Feature',
                  geometry: { type: 'Point', coordinates: [point.longitude, point.latitude] },
                  properties: { id: point.id, label: point.label[locale], count: point.count, eventCount: point.eventCount },
                })),
              },
            },
            venues: {
              type: 'geojson',
              data: {
                type: 'FeatureCollection',
                features: selectedWardVenues.filter((venue) => selected === 'all' || venue.region === selected).map((venue) => ({
                  type: 'Feature',
                  geometry: { type: 'Point', coordinates: [venue.longitude, venue.latitude] },
                  properties: { id: venue.id, label: venue.name[locale], eventCount: venue.eventCount },
                })),
              },
            },
          },
          layers: [
            { id: 'gsi', type: 'raster', source: 'gsi' },
            {
              id: 'tokyo-municipal-boundary',
              type: 'line',
              source: 'gsiBoundary',
              'source-layer': 'boundary',
              minzoom: 10.75,
              filter: ['all', ['in', 'ftCode', 1212]],
              layout: { visibility: selected === 'tokyo' ? 'visible' : 'none', 'line-cap': 'round' },
              paint: { 'line-color': '#E879F9', 'line-width': 2.25, 'line-opacity': 0.88, 'line-dasharray': [3, 1.5] },
            },
            {
              id: 'region-halo',
              type: 'circle',
              source: 'regions',
              paint: {
                'circle-radius': ['interpolate', ['linear'], ['get', layer === 'events' ? 'eventCount' : 'count'], 0, 12, 30, 30],
                'circle-color': ['case', ['==', ['get', 'id'], selected], '#F472B6', '#22D3EE'],
                'circle-opacity': 0.2,
                'circle-stroke-color': '#FFFFFF',
                'circle-stroke-width': 1,
              },
            },
            {
              id: 'region-point',
              type: 'circle',
              source: 'regions',
              paint: {
                'circle-radius': ['case', ['==', ['get', 'id'], selected], 9, 7],
                'circle-color': ['case', ['==', ['get', 'id'], selected], '#F472B6', '#0891B2'],
                'circle-stroke-color': '#FFFFFF',
                'circle-stroke-width': 2,
              },
            },
            {
              id: 'region-label',
              type: 'symbol',
              source: 'regions',
              layout: {
                visibility: window.matchMedia('(max-width: 700px)').matches ? 'none' : 'visible',
                'text-field': ['format', ['get', 'label'], {}, '\n', {}, ['get', 'count'], { 'font-scale': 0.82 }, 'G · ', { 'font-scale': 0.72 }, ['get', 'eventCount'], { 'font-scale': 0.82 }, ' LIVE', { 'font-scale': 0.72 }],
                'text-size': 13,
                'text-offset': [0, 1.7],
                'text-anchor': 'top',
                'text-allow-overlap': true,
              },
              paint: { 'text-color': '#111827', 'text-halo-color': '#FFFFFF', 'text-halo-width': 2 },
            },
            {
              id: 'venue-halo',
              type: 'circle',
              source: 'venues',
              minzoom: 7,
              paint: { 'circle-radius': ['interpolate', ['linear'], ['get', 'eventCount'], 0, 8, 5, 16], 'circle-color': '#F472B6', 'circle-opacity': 0.24 },
            },
            {
              id: 'venue-point',
              type: 'circle',
              source: 'venues',
              minzoom: 7,
              paint: { 'circle-radius': 5, 'circle-color': '#EC4899', 'circle-stroke-color': '#FFFFFF', 'circle-stroke-width': 2 },
            },
            {
              id: 'venue-label',
              type: 'symbol',
              source: 'venues',
              minzoom: 10,
              layout: { 'text-field': ['get', 'label'], 'text-size': 11, 'text-offset': [0, 1.25], 'text-anchor': 'top' },
              paint: { 'text-color': '#111827', 'text-halo-color': '#FFFFFF', 'text-halo-width': 2 },
            },
          ],
        },
      });
      mapRef.current = map;

      map.addControl(new NavigationControl({ showCompass: false }), 'top-right');
      map.on('style.load', () => {
        if (disposed) return;
        loadedRef.current = true;
        window.clearTimeout(timeout);
        callbacksRef.current.onReady();
        setReadyVersion((version) => version + 1);
      });
      // Source/tile errors can be transient and MapLibre may recover from them.
      // The initialization timeout remains the single fallback boundary so one
      // failed raster request cannot tear down an otherwise usable map.
      map.on('click', 'region-halo', (event) => {
        const id = event.features?.[0]?.properties?.id as RegionId | undefined;
        if (id) callbacksRef.current.onSelect(id);
      });
      map.on('mouseenter', 'region-halo', () => { map?.getCanvas().style.setProperty('cursor', 'pointer'); });
      map.on('mouseleave', 'region-halo', () => { map?.getCanvas().style.removeProperty('cursor'); });
      map.on('click', 'venue-halo', (event) => {
        const id = event.features?.[0]?.properties?.id as string | undefined;
        if (id) callbacksRef.current.onVenueSelect(id);
      });
      map.on('mouseenter', 'venue-halo', () => { map?.getCanvas().style.setProperty('cursor', 'pointer'); });
      map.on('mouseleave', 'venue-halo', () => { map?.getCanvas().style.removeProperty('cursor'); });
    }).catch(() => callbacksRef.current.onUnavailable());

    return () => {
      disposed = true;
      loadedRef.current = false;
      mapRef.current = null;
      window.clearTimeout(timeout);
      map?.remove();
    };
    // The map instance is created once; the following effect synchronizes every reactive input.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;

    const regionSource = map.getSource('regions') as import('maplibre-gl').GeoJSONSource | undefined;
    regionSource?.setData({
      type: 'FeatureCollection',
      features: points.map((point) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [point.longitude, point.latitude] },
        properties: { id: point.id, label: point.label[locale], count: point.count, eventCount: point.eventCount },
      })),
    });

    const venueSource = map.getSource('venues') as import('maplibre-gl').GeoJSONSource | undefined;
    venueSource?.setData({
      type: 'FeatureCollection',
      features: selectedWardVenues.filter((venue) => selected === 'all' || venue.region === selected).map((venue) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [venue.longitude, venue.latitude] },
        properties: { id: venue.id, label: venue.name[locale], eventCount: venue.eventCount },
      })),
    });

    map.setPaintProperty('region-halo', 'circle-radius', ['interpolate', ['linear'], ['get', layer === 'events' ? 'eventCount' : 'count'], 0, 12, 30, 30]);
    map.setPaintProperty('region-halo', 'circle-color', ['case', ['==', ['get', 'id'], selected], '#F472B6', '#22D3EE']);
    map.setPaintProperty('region-point', 'circle-radius', ['case', ['==', ['get', 'id'], selected], 9, 7]);
    map.setPaintProperty('region-point', 'circle-color', ['case', ['==', ['get', 'id'], selected], '#F472B6', '#0891B2']);
    map.setLayoutProperty('tokyo-municipal-boundary', 'visibility', selected === 'tokyo' ? 'visible' : 'none');

    const target = points.find((point) => point.id === selected);
    map.easeTo({
      center: selectedWardCenter ?? (selected === 'all' ? [137.4, 37.2] : [target?.longitude ?? 137.4, target?.latitude ?? 37.2]),
      zoom: selectedWardCenter ? 12.3 : selected === 'all' ? 4.05 : selected === 'tokyo' ? 11.05 : 7.2,
      duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 700,
    });
  }, [layer, locale, points, readyVersion, selected, selectedWardCenter, selectedWardVenues, venuePoints]);

  return <div ref={containerRef} className="maplibre-japan-map" role="region" aria-label={locale === 'ko' ? '검증된 아이돌 지역과 공연장 실지도. 아래 지역과 구 버튼으로 동일하게 탐색할 수 있습니다.' : locale === 'ja' ? '検証済みアイドル地域・会場マップ。下の地域・区ボタンでも同じ操作ができます。' : 'Map of verified idol regions and venues. Equivalent region and ward buttons follow the map.'} />;
}
