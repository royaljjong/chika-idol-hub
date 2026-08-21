'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { ChikaGroup, DistrictId, RegionId } from '@/lib/schema';
import { GroupCard } from '@/components/group/GroupCard';

type Locale = 'ja' | 'ko' | 'en';
const REGIONS: Array<{ id: RegionId; label: Record<Locale,string>; sub: Record<Locale,string>; pos: string; districts: DistrictId[] }> = [
  { id:'sapporo', label:{ja:'札幌',ko:'삿포로',en:'Sapporo'}, sub:{ja:'北海道',ko:'홋카이도',en:'Hokkaido'}, pos:'map-sapporo', districts:['susukino'] },
  { id:'tokyo', label:{ja:'東京',ko:'도쿄',en:'Tokyo'}, sub:{ja:'関東',ko:'간토',en:'Kanto'}, pos:'map-tokyo', districts:['shinjuku','harajuku','shibuya','akihabara','ikebukuro','roppongi'] },
  { id:'nagoya', label:{ja:'名古屋',ko:'나고야',en:'Nagoya'}, sub:{ja:'中部',ko:'주부',en:'Chubu'}, pos:'map-nagoya', districts:['sakae'] },
  { id:'osaka', label:{ja:'大阪',ko:'오사카',en:'Osaka'}, sub:{ja:'関西',ko:'간사이',en:'Kansai'}, pos:'map-osaka', districts:['namba','umeda'] },
  { id:'fukuoka', label:{ja:'福岡',ko:'후쿠오카',en:'Fukuoka'}, sub:{ja:'九州',ko:'규슈',en:'Kyushu'}, pos:'map-fukuoka', districts:['tenjin'] },
];
const DISTRICT_LABEL: Record<DistrictId,Record<Locale,string>> = {
  shibuya:{ja:'渋谷',ko:'시부야',en:'Shibuya'}, harajuku:{ja:'原宿',ko:'하라주쿠',en:'Harajuku'}, akihabara:{ja:'秋葉原',ko:'아키하바라',en:'Akihabara'}, shinjuku:{ja:'新宿',ko:'신주쿠',en:'Shinjuku'}, ikebukuro:{ja:'池袋',ko:'이케부쿠로',en:'Ikebukuro'}, roppongi:{ja:'六本木',ko:'롯폰기',en:'Roppongi'}, namba:{ja:'難波',ko:'난바',en:'Namba'}, umeda:{ja:'梅田',ko:'우메다',en:'Umeda'}, susukino:{ja:'すすきの',ko:'스스키노',en:'Susukino'}, sakae:{ja:'栄',ko:'사카에',en:'Sakae'}, tenjin:{ja:'天神',ko:'텐진',en:'Tenjin'}, general:{ja:'その他',ko:'기타',en:'Other'}
};

export function InteractiveJapanMap({ groups, locale }: { groups: ChikaGroup[]; locale: string }) {
  const lang = (['ja','ko','en'].includes(locale) ? locale : 'ja') as Locale;
  const [region,setRegion] = useState<RegionId>('tokyo');
  const [district,setDistrict] = useState<DistrictId | 'all'>('all');
  const current = REGIONS.find((item)=>item.id===region) ?? REGIONS[1]!;
  const visible = useMemo(()=>groups.filter((group)=>group.region===region && (district==='all'||group.district===district)),[groups,region,district]);
  const chooseRegion=(id:RegionId)=>{setRegion(id);setDistrict('all')};

  return <section className="chika-map-shell">
    <div className="chika-map-board" aria-label={lang==='ko'?'일본 라이브 아이돌 지역 지도':'Japan live idol region map'}>
      <div className="map-grid-lines" />
      <div className="japan-route" aria-hidden="true"><i/><i/><i/><i/><i/></div>
      {REGIONS.map((item)=>{const count=groups.filter((g)=>g.region===item.id).length;return <button key={item.id} type="button" onClick={()=>chooseRegion(item.id)} className={`city-map-card ${item.pos} ${region===item.id?'city-map-card-active':''}`}><small>{item.sub[lang]}</small><strong>{item.label[lang]}</strong><span>{count} GROUPS</span></button>})}
      <p className="map-coordinate">35.6762° N / 139.6503° E · LIVE IDOL DIRECTORY</p>
    </div>
    <div className="mt-6 border-y border-white/10 py-5"><div className="flex flex-wrap items-center gap-2"><button type="button" onClick={()=>setDistrict('all')} className={`district-chip ${district==='all'?'district-chip-active':''}`}>{lang==='ko'?'전체':lang==='ja'?'すべて':'All'}</button>{current.districts.map((item)=><button type="button" key={item} onClick={()=>setDistrict(item)} className={`district-chip ${district===item?'district-chip-active':''}`}>{DISTRICT_LABEL[item][lang]}</button>)}</div></div>
    <AnimatePresence mode="wait"><motion.div key={`${region}-${district}`} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} className="mt-7"><div className="mb-5 flex items-end justify-between"><div><p className="text-[10px] font-bold tracking-[.18em] text-cyan-300">SELECTED AREA</p><h3 className="mt-2 text-2xl font-bold text-white">{current.label[lang]}{district!=='all' ? ` · ${DISTRICT_LABEL[district][lang]}`:''}</h3></div><span className="text-xs text-star-dim">{visible.length} groups</span></div>{visible.length?<div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{visible.map((group)=><GroupCard key={group.id} group={group} locale={locale}/>)}</div>:<div className="border border-dashed border-white/15 py-10 text-center text-sm text-star-dim">{lang==='ko'?'검증된 그룹을 수집 중입니다.':lang==='ja'?'検証済みグループを収集中です。':'Verified groups are being collected.'}</div>}</motion.div></AnimatePresence>
  </section>;
}
