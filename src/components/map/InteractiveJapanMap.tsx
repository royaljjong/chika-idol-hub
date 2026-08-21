'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { ChikaGroup, DistrictId, RegionId } from '@/lib/schema';
import { GroupCard } from '@/components/group/GroupCard';

type Locale = 'ja' | 'ko' | 'en';
type MapRegion = {
  id: RegionId;
  label: Record<Locale, string>;
  prefecture: Record<Locale, string>;
  x: number;
  y: number;
};

const REGIONS: MapRegion[] = [
  { id: 'sapporo', label: { ja: '札幌', ko: '삿포로', en: 'Sapporo' }, prefecture: { ja: '北海道', ko: '홋카이도', en: 'Hokkaido' }, x: 77, y: 16 },
  { id: 'tokyo', label: { ja: '東京', ko: '도쿄', en: 'Tokyo' }, prefecture: { ja: '東京都', ko: '도쿄도', en: 'Tokyo Met.' }, x: 72, y: 65 },
  { id: 'nagoya', label: { ja: '名古屋', ko: '나고야', en: 'Nagoya' }, prefecture: { ja: '愛知県', ko: '아이치현', en: 'Aichi' }, x: 58, y: 69 },
  { id: 'osaka', label: { ja: '大阪', ko: '오사카', en: 'Osaka' }, prefecture: { ja: '大阪府', ko: '오사카부', en: 'Osaka' }, x: 47, y: 72 },
  { id: 'fukuoka', label: { ja: '福岡', ko: '후쿠오카', en: 'Fukuoka' }, prefecture: { ja: '福岡県', ko: '후쿠오카현', en: 'Fukuoka' }, x: 22, y: 78 },
];

const DISTRICT_LABEL: Record<DistrictId, Record<Locale, string>> = {
  shibuya: { ja: '渋谷', ko: '시부야', en: 'Shibuya' },
  harajuku: { ja: '原宿', ko: '하라주쿠', en: 'Harajuku' },
  akihabara: { ja: '秋葉原', ko: '아키하바라', en: 'Akihabara' },
  shinjuku: { ja: '新宿', ko: '신주쿠', en: 'Shinjuku' },
  ikebukuro: { ja: '池袋', ko: '이케부쿠로', en: 'Ikebukuro' },
  roppongi: { ja: '六本木', ko: '롯폰기', en: 'Roppongi' },
  namba: { ja: '難波', ko: '난바', en: 'Namba' },
  umeda: { ja: '梅田', ko: '우메다', en: 'Umeda' },
  susukino: { ja: 'すすきの', ko: '스스키노', en: 'Susukino' },
  sakae: { ja: '栄', ko: '사카에', en: 'Sakae' },
  tenjin: { ja: '天神', ko: '텐진', en: 'Tenjin' },
  general: { ja: '市内・広域', ko: '도시권·광역', en: 'Citywide' },
};

const copy = {
  mapLabel: { ja: '日本ライブアイドル地域マップ', ko: '일본 라이브 아이돌 지역 지도', en: 'Japan live idol region map' },
  all: { ja: 'すべて', ko: '전체', en: 'All' },
  selected: { ja: '選択した地域', ko: '선택 지역', en: 'Selected area' },
  empty: { ja: '検証済みグループを収集中です。', ko: '검증된 그룹을 수집 중입니다.', en: 'Verified groups are being collected.' },
  note: { ja: 'ピンは都市の実際の相対位置を示します。区分は公式根拠がある場合のみ表示します。', ko: '핀은 도시의 실제 상대 위치를 나타냅니다. 세부 구역은 공식 근거가 있을 때만 표시합니다.', en: 'Pins show real relative city positions. Districts appear only when supported by an official source.' },
};

export function InteractiveJapanMap({ groups, locale }: { groups: ChikaGroup[]; locale: string }) {
  const lang = (['ja', 'ko', 'en'].includes(locale) ? locale : 'ja') as Locale;
  const [region, setRegion] = useState<RegionId>('tokyo');
  const [district, setDistrict] = useState<DistrictId | 'all'>('all');
  const current = REGIONS.find((item) => item.id === region) ?? REGIONS[1]!;
  const regionGroups = useMemo(() => groups.filter((group) => group.region === region), [groups, region]);
  const districts = useMemo(
    () => Array.from(new Set(regionGroups.map((group) => group.district as DistrictId))),
    [regionGroups],
  );
  const visible = useMemo(
    () => regionGroups.filter((group) => district === 'all' || group.district === district),
    [regionGroups, district],
  );
  const chooseRegion = (id: RegionId) => {
    setRegion(id);
    setDistrict('all');
  };

  return (
    <section className="chika-map-shell">
      <div className="chika-map-board" aria-label={copy.mapLabel[lang]}>
        <div className="map-grid-lines" aria-hidden="true" />
        <svg className="japan-silhouette" viewBox="0 0 900 520" role="img" aria-label={copy.mapLabel[lang]}>
          <g className="japan-land">
            <path d="M690 42l45 13 32 31-4 43-28 31-44-2-32-29 5-50z" />
            <path d="M641 173l23 17-5 29-20 7-13-20z" />
            <path d="M606 220l34 8 15 28-18 33-28 8-17 29-43 13-26 32-45 7-28 28-53 8-35-16 17-26 39-12 34-31 42-20 28-38 43-24z" />
            <path d="M374 367l54 8 18 20-21 22-57-4-24-22z" />
            <path d="M248 391l51 4 28 23-15 33-39 14-55-20-12-29z" />
            <path d="M171 438l30 7 7 25-27 19-34-10-5-24z" />
          </g>
          <g className="map-island-dots" aria-hidden="true">
            <circle cx="136" cy="487" r="3" /><circle cx="116" cy="496" r="2" /><circle cx="96" cy="504" r="2" />
          </g>
        </svg>
        <div className="map-sea-label map-sea-japan">日本海</div>
        <div className="map-sea-label map-sea-pacific">太平洋</div>
        {REGIONS.map((item) => {
          const count = groups.filter((group) => group.region === item.id).length;
          const active = region === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => chooseRegion(item.id)}
              className={`map-city-pin ${active ? 'map-city-pin-active' : ''}`}
              style={{ left: `${item.x}%`, top: `${item.y}%` }}
              aria-pressed={active}
            >
              <span className="map-pin-dot" />
              <span className="map-pin-label"><small>{item.prefecture[lang]}</small><strong>{item.label[lang]}</strong><em>{count}</em></span>
            </button>
          );
        })}
        <div className="map-legend"><span className="map-legend-dot" /> VERIFIED DIRECTORY HUB</div>
      </div>

      <p className="map-evidence-note">{copy.note[lang]}</p>
      <div className="map-filter-bar">
        <button type="button" onClick={() => setDistrict('all')} className={`district-chip ${district === 'all' ? 'district-chip-active' : ''}`}>{copy.all[lang]}</button>
        {districts.map((item) => <button type="button" key={item} onClick={() => setDistrict(item)} className={`district-chip ${district === item ? 'district-chip-active' : ''}`}>{DISTRICT_LABEL[item][lang]}</button>)}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={`${region}-${district}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mt-7">
          <div className="mb-5 flex items-end justify-between">
            <div><p className="text-[10px] font-bold tracking-[.18em] text-cyan-300">{copy.selected[lang]}</p><h3 className="mt-2 text-2xl font-bold text-white">{current.label[lang]}{district !== 'all' ? ` · ${DISTRICT_LABEL[district][lang]}` : ''}</h3></div>
            <span className="text-xs text-star-dim">{visible.length} groups</span>
          </div>
          {visible.length ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{visible.map((group) => <GroupCard key={group.id} group={group} locale={locale} />)}</div> : <div className="border border-dashed border-white/15 py-10 text-center text-sm text-star-dim">{copy.empty[lang]}</div>}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
