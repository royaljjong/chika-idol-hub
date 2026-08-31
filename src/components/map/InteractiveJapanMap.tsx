'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Link } from '@/i18n/routing';
import type { ChikaGroup, DistrictId, RegionId } from '@/lib/schema';
import { isDistrictInRegion } from '@/lib/geo-contract';

type Locale = 'ja' | 'ko' | 'en';
type Stage = 'country' | 'city' | 'district';
type Region = { id: RegionId; label: Record<Locale, string>; prefecture: Record<Locale, string>; x: number; y: number };

const REGIONS: Region[] = [
  { id: 'sapporo', label: { ja: '札幌', ko: '삿포로', en: 'Sapporo' }, prefecture: { ja: '北海道', ko: '홋카이도', en: 'Hokkaido' }, x: 78, y: 17 },
  { id: 'tokyo', label: { ja: '東京', ko: '도쿄', en: 'Tokyo' }, prefecture: { ja: '東京都', ko: '도쿄도', en: 'Tokyo Met.' }, x: 71, y: 66 },
  { id: 'nagoya', label: { ja: '名古屋', ko: '나고야', en: 'Nagoya' }, prefecture: { ja: '愛知県', ko: '아이치현', en: 'Aichi' }, x: 58, y: 69 },
  { id: 'osaka', label: { ja: '大阪', ko: '오사카', en: 'Osaka' }, prefecture: { ja: '大阪府', ko: '오사카부', en: 'Osaka' }, x: 48, y: 72 },
  { id: 'fukuoka', label: { ja: '福岡', ko: '후쿠오카', en: 'Fukuoka' }, prefecture: { ja: '福岡県', ko: '후쿠오카현', en: 'Fukuoka' }, x: 25, y: 78 },
];

const DISTRICTS: Record<DistrictId, { label: Record<Locale, string>; x: number; y: number }> = {
  shibuya: { label: { ja: '渋谷', ko: '시부야', en: 'Shibuya' }, x: 32, y: 66 },
  harajuku: { label: { ja: '原宿', ko: '하라주쿠', en: 'Harajuku' }, x: 37, y: 47 },
  akihabara: { label: { ja: '秋葉原', ko: '아키하바라', en: 'Akihabara' }, x: 69, y: 38 },
  shinjuku: { label: { ja: '新宿', ko: '신주쿠', en: 'Shinjuku' }, x: 25, y: 35 },
  ikebukuro: { label: { ja: '池袋', ko: '이케부쿠로', en: 'Ikebukuro' }, x: 45, y: 18 },
  roppongi: { label: { ja: '六本木', ko: '롯폰기', en: 'Roppongi' }, x: 55, y: 72 },
  namba: { label: { ja: '難波', ko: '난바', en: 'Namba' }, x: 40, y: 58 },
  umeda: { label: { ja: '梅田', ko: '우메다', en: 'Umeda' }, x: 62, y: 30 },
  susukino: { label: { ja: 'すすきの', ko: '스스키노', en: 'Susukino' }, x: 50, y: 48 },
  sakae: { label: { ja: '栄', ko: '사카에', en: 'Sakae' }, x: 50, y: 48 },
  tenjin: { label: { ja: '天神', ko: '텐진', en: 'Tenjin' }, x: 50, y: 48 },
  general: { label: { ja: '市内・広域', ko: '도시권·광역', en: 'Citywide' }, x: 78, y: 68 },
};

const copy = {
  title: { ja: '日本アイドル・エリアガイド', ko: '일본 아이돌 지역 가이드', en: 'Japan idol area guide' },
  countryHint: { ja: '都市を選んで、アイドルカルチャーの街へ。', ko: '도시를 선택해 아이돌 문화의 거리로 들어가세요.', en: 'Choose a city and enter its idol culture districts.' },
  cityHint: { ja: '活動エリアを選択', ko: '활동 지역을 선택하세요', en: 'Choose an activity district' },
  groups: { ja: 'この街で活動するグループ', ko: '이 지역에서 활동하는 그룹', en: 'Groups active in this district' },
  backCountry: { ja: '日本全国', ko: '일본 전국', en: 'All Japan' },
  backCity: { ja: '都市へ戻る', ko: '도시로 돌아가기', en: 'Back to city' },
  empty: { ja: '検証済みグループを収集中です。', ko: '검증된 그룹을 수집 중입니다.', en: 'Verified groups are being collected.' },
  view: { ja: 'プロフィール', ko: '프로필 보기', en: 'View profile' },
};

function setMapUrl(region: RegionId | null, district: DistrictId | null) {
  const url = new URL(window.location.href);
  url.searchParams.delete('mapLayer'); url.searchParams.delete('mapWard');
  if (region) url.searchParams.set('mapRegion', region); else url.searchParams.delete('mapRegion');
  if (district) url.searchParams.set('mapDistrict', district); else url.searchParams.delete('mapDistrict');
  window.history.pushState(window.history.state, '', url);
}

function GroupVisualCard({ group, lang }: { group: ChikaGroup; lang: Locale }) {
  const [failed, setFailed] = useState(false);
  const imageUrl = group.imageUrl && !failed ? group.imageUrl : null;
  return <Link href={`/g/${group.id}`} className="discovery-group-card">
    <div className="discovery-group-visual" style={{ '--group-color': group.color } as CSSProperties}>
      {imageUrl ? <Image src={imageUrl} alt="" fill sizes="(max-width: 800px) 76vw, 260px" className="object-cover" unoptimized onError={() => setFailed(true)} /> : <span className="discovery-group-placeholder">{group.shortName[lang] || group.name[lang]}</span>}
      <div className="discovery-group-shade" />
      <span className={`discovery-image-kind ${group.imageKind === 'official_photo' || group.imageKind === 'official_logo' ? 'discovery-image-kind-official' : ''}`}>{group.imageKind === 'official_photo' ? 'OFFICIAL PHOTO' : group.imageKind === 'official_logo' ? 'OFFICIAL LOGO' : group.imageKind === 'text_wordmark' ? 'TEXT WORDMARK' : lang === 'ko' ? '대표 이미지 준비 중' : lang === 'ja' ? '公式画像準備中' : 'VISUAL PLACEHOLDER'}</span>
    </div>
    <div className="discovery-group-copy"><small>{DISTRICTS[group.district as DistrictId]?.label[lang] ?? group.district}</small><strong>{group.name[lang]}</strong><span>{group.members.length} MEMBERS · {copy.view[lang]} →</span></div>
  </Link>;
}

export function InteractiveJapanMap({ groups, locale }: { groups: ChikaGroup[]; locale: string }) {
  const lang = (['ja', 'ko', 'en'].includes(locale) ? locale : 'ja') as Locale;
  const [regionId, setRegionId] = useState<RegionId | null>(null);
  const [districtId, setDistrictId] = useState<DistrictId | null>(null);
  const region = REGIONS.find((item) => item.id === regionId) ?? null;
  const stage: Stage = districtId ? 'district' : regionId ? 'city' : 'country';
  const regionGroups = useMemo(() => groups.filter((group) => group.region === regionId), [groups, regionId]);
  const districtIds = useMemo(() => Array.from(new Set(regionGroups.map((group) => group.district as DistrictId))).filter((id) => DISTRICTS[id]), [regionGroups]);
  const districtGroups = useMemo(() => regionGroups.filter((group) => group.district === districtId), [regionGroups, districtId]);
  const restore = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const nextRegion = REGIONS.find((item) => item.id === params.get('mapRegion'))?.id ?? null;
    const rawDistrict = params.get('mapDistrict') as DistrictId | null;
    const nextDistrict = nextRegion && rawDistrict && DISTRICTS[rawDistrict] && isDistrictInRegion(nextRegion, rawDistrict) ? rawDistrict : null;
    setRegionId(nextRegion); setDistrictId(nextDistrict);
    const url = new URL(window.location.href);
    let changed = false;
    for (const legacy of ['mapLayer', 'mapWard']) if (url.searchParams.has(legacy)) { url.searchParams.delete(legacy); changed = true; }
    if (url.searchParams.has('mapRegion') && !nextRegion) { url.searchParams.delete('mapRegion'); changed = true; }
    if (url.searchParams.has('mapDistrict') && !nextDistrict) { url.searchParams.delete('mapDistrict'); changed = true; }
    if (changed) window.history.replaceState(window.history.state, '', url);
  }, []);
  useEffect(() => {
    queueMicrotask(restore);
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, [restore]);
  const chooseRegion = (id: RegionId) => { setRegionId(id); setDistrictId(null); setMapUrl(id, null); };
  const chooseDistrict = (id: DistrictId) => { if (!regionId || !isDistrictInRegion(regionId, id)) return; setDistrictId(id); setMapUrl(regionId, id); };
  const goCountry = () => { setRegionId(null); setDistrictId(null); setMapUrl(null, null); };
  const goCity = () => { setDistrictId(null); setMapUrl(regionId, null); };

  return <section className={`discovery-map discovery-stage-${stage}`} aria-label={copy.title[lang]}>
    <header className="discovery-map-header"><div><p>LOCAL IDOL DISCOVERY</p><h3>{stage === 'country' ? copy.title[lang] : districtId ? DISTRICTS[districtId].label[lang] : region?.label[lang]}</h3><span>{stage === 'country' ? copy.countryHint[lang] : stage === 'city' ? copy.cityHint[lang] : copy.groups[lang]}</span></div>
      <div className="discovery-breadcrumb" aria-label="Breadcrumb">{stage !== 'country' ? <button type="button" onClick={goCountry}>{copy.backCountry[lang]}</button> : null}{stage === 'district' ? <><span>/</span><button type="button" onClick={goCity}>{region?.label[lang]}</button><span>/</span><b>{DISTRICTS[districtId!].label[lang]}</b></> : null}</div>
    </header>
    <div className="discovery-map-viewport"><div className="discovery-map-grid" aria-hidden="true" />
      <div className="discovery-map-art" style={{ '--focus-x': `${region?.x ?? 50}%`, '--focus-y': `${region?.y ?? 50}%` } as CSSProperties}><Image src="/maps/japan-prefectures.svg" alt="" fill priority sizes="(max-width: 800px) 120vw, 900px" className="discovery-japan-vector" /></div>
      {stage === 'country' ? <div className="discovery-city-layer">{REGIONS.map((item) => { const count = groups.filter((group) => group.region === item.id).length; return <button key={item.id} type="button" className="discovery-place-card discovery-city-card" style={{ left: `${item.x}%`, top: `${item.y}%` }} onClick={() => chooseRegion(item.id)}><small>{item.prefecture[lang]}</small><strong>{item.label[lang]}</strong><span>{count} GROUPS</span></button>; })}</div> : null}
      {stage === 'city' ? <div className="discovery-district-layer">{districtIds.map((id) => { const item = DISTRICTS[id]; const count = regionGroups.filter((group) => group.district === id).length; return <button key={id} type="button" className="discovery-place-card discovery-district-card" style={{ left: `${item.x}%`, top: `${item.y}%` }} onClick={() => chooseDistrict(id)}><small>{region?.label[lang]}</small><strong>{item.label[lang]}</strong><span>{count} GROUPS</span></button>; })}</div> : null}
      {stage === 'district' ? <div className="discovery-groups-layer">{districtGroups.length ? <div className="discovery-group-grid">{districtGroups.map((group) => <GroupVisualCard key={group.id} group={group} lang={lang} />)}</div> : <div className="discovery-empty"><p>{copy.empty[lang]}</p><button type="button" onClick={goCity}>{copy.backCity[lang]}</button></div>}</div> : null}
    </div><p className="discovery-map-credit">MAP: GEOLONIA / GFDL · VERIFIED ACTIVITY AREAS ONLY</p>
  </section>;
}
