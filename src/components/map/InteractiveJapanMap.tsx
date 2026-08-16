'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { ChikaGroup, RegionId, DistrictId } from '@/lib/schema';
import { GroupCard } from '@/components/group/GroupCard';

interface InteractiveJapanMapProps {
  groups: ChikaGroup[];
  locale: string;
}

interface RegionItem {
  id: RegionId;
  name: { ja: string; ko: string; en: string };
  sub: { ja: string; ko: string; en: string };
  emoji: string;
  pinX: number; // Percentage X (0-100)
  pinY: number; // Percentage Y (0-100)
  color: string;
  accent: string;
  isTokyo?: boolean;
}

interface DistrictItem {
  id: DistrictId;
  name: { ja: string; ko: string; en: string };
  ward: { ja: string; ko: string; en: string };
  emoji: string;
  color: string;
  hotspots: string;
}

const REGIONS: RegionItem[] = [
  {
    id: 'sapporo',
    name: { ja: '北海道・札幌', ko: '홋카이도・삿포로', en: 'Hokkaido (Sapporo)' },
    sub: { ja: 'すすきの・大通', ko: '스스키노・오도리', en: 'Susukino / Odori' },
    emoji: '❄️',
    pinX: 77,
    pinY: 18,
    color: '#38BDF8',
    accent: '#0284C7',
  },
  {
    id: 'tokyo',
    name: { ja: '関東・東京 (23区)', ko: '간토・도쿄 (23구)', en: 'Kanto (Tokyo 23 Wards)' },
    sub: { ja: '渋谷・原宿・秋葉原・新宿 (クリックで23区へ 🔍)', ko: '시부야・하라주쿠・아키바・신주쿠 (클릭 시 23구 진입 🔍)', en: 'Shibuya, Harajuku, Akiba (Click to Enter 🔍)' },
    emoji: '🗼',
    pinX: 68,
    pinY: 62,
    color: '#FF2E7E',
    accent: '#FF6EA7',
    isTokyo: true,
  },
  {
    id: 'nagoya',
    name: { ja: '東海・名古屋', ko: '토카이・나고야', en: 'Tokai (Nagoya)' },
    sub: { ja: '栄・大須', ko: '사카에・오스', en: 'Sakae / Osu' },
    emoji: '🏯',
    pinX: 57,
    pinY: 66,
    color: '#F59E0B',
    accent: '#D97706',
  },
  {
    id: 'osaka',
    name: { ja: '関西・大阪', ko: '간사이・오사카', en: 'Kansai (Osaka)' },
    sub: { ja: '難波・心斎橋・梅田', ko: '난바・신사이바시・우메다', en: 'Namba / Shinsaibashi' },
    emoji: '🐙',
    pinX: 47,
    pinY: 70,
    color: '#10B981',
    accent: '#059669',
  },
  {
    id: 'fukuoka',
    name: { ja: '九州・福岡', ko: '큐슈・후쿠오카', en: 'Kyushu (Fukuoka)' },
    sub: { ja: '天神・博多', ko: '텐진・하카타', en: 'Tenjin / Hakata' },
    emoji: '🍜',
    pinX: 23,
    pinY: 76,
    color: '#8B5CF6',
    accent: '#7C3AED',
  },
];

const TOKYO_DISTRICTS: DistrictItem[] = [
  {
    id: 'shibuya',
    name: { ja: '渋谷 (道玄坂・神南)', ko: '시부야 (도겐자카・진난)', en: 'Shibuya' },
    ward: { ja: 'Appare! / GANG PARADE / Jams Collection', ko: 'Appare! / 갱퍼레이드 / 잼스컬렉션', en: 'Appare! / GANG PARADE / Jams Collection' },
    emoji: '🛍️',
    color: '#FFB800',
    hotspots: 'Spotify O-EAST, O-WEST, WWW X, WOMB',
  },
  {
    id: 'harajuku',
    name: { ja: '原宿・表参道 (竹下通り)', ko: '하라주쿠・오모테산도 (다케시타)', en: 'Harajuku' },
    ward: { ja: 'FRUITS ZIPPER / CANDY TUNE / CUTIE STREET / SWEET STEADY', ko: '후르츠지퍼 / 캔디튠 / 큐티스트리트 / 스위트스테디', en: 'FRUITS ZIPPER / CANDY TUNE / CUTIE STREET' },
    emoji: '🎀',
    color: '#FF6EA7',
    hotspots: 'KAWAII LAB., Laforet Harajuku, with HARAJUKU',
  },
  {
    id: 'shinjuku',
    name: { ja: '新宿 (歌舞伎町・大久保)', ko: '신주쿠 (가부키초・오쿠보)', en: 'Shinjuku' },
    ward: { ja: 'iLiFE! / 夜光性アミューズ / のんふぃく！', ko: 'iLiFE! / 야광성 어뮤즈 / 논픽션', en: 'iLiFE! / Yakousei Amuse / NonFiction' },
    emoji: '🌃',
    color: '#FF2E7E',
    hotspots: 'Zepp Shinjuku, Shinjuku BLAZE, Shinjuku LOFT',
  },
  {
    id: 'akihabara',
    name: { ja: '秋葉原 (外神田・電気街)', ko: '아키하바라 (소토칸다・전자상가)', en: 'Akihabara' },
    ward: { ja: 'でんぱ組.inc / 虹のコンキスタドール / FES☆TIVE', ko: '덴파구미.inc / 니지콘 / 페스티브', en: 'Dempagumi.inc / 2zicon / FES☆TIVE' },
    emoji: '⚡',
    color: '#00E5FF',
    hotspots: 'DearStage, Akiba Cultures Theater, TwinBox',
  },
];

type FolderLevel = 'national' | 'tokyo-wards' | 'district-groups';

export function InteractiveJapanMap({ groups, locale }: InteractiveJapanMapProps) {
  // 3-Level Folder State
  const [level, setLevel] = useState<FolderLevel>('national');
  const [selectedRegion, setSelectedRegion] = useState<RegionId | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictId | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<RegionId | null>(null);

  // 1. Level 1 (National) -> Click Region
  const handleRegionClick = (regionId: RegionId) => {
    setSelectedRegion(regionId);
    if (regionId === 'tokyo') {
      // Enter Level 2: Tokyo 23 Wards Folder
      setLevel('tokyo-wards');
      setSelectedDistrict(null);
    } else {
      // Enter Level 3: Regional Groups Folder (Osaka, Sapporo, Nagoya, Fukuoka)
      setLevel('district-groups');
      setSelectedDistrict(null);
    }
  };

  // 2. Level 2 (Tokyo Wards) -> Click District (e.g. Shibuya)
  const handleDistrictClick = (districtId: DistrictId) => {
    setSelectedDistrict(districtId);
    // Enter Level 3: District Groups Folder
    setLevel('district-groups');
  };

  // 3. Folder Navigation Back Buttons
  const handleBackToNational = () => {
    setLevel('national');
    setSelectedRegion(null);
    setSelectedDistrict(null);
  };

  const handleBackToTokyoWards = () => {
    setLevel('tokyo-wards');
    setSelectedDistrict(null);
  };

  // Filter groups for Level 3
  const activeDistrictItem = TOKYO_DISTRICTS.find((d) => d.id === selectedDistrict);
  const activeRegionItem = REGIONS.find((r) => r.id === selectedRegion);

  const displayedGroups = groups.filter((g) => {
    if (level === 'district-groups') {
      if (selectedRegion === 'tokyo' && selectedDistrict) {
        return g.region === 'tokyo' && g.district === selectedDistrict;
      }
      if (selectedRegion) {
        return g.region === selectedRegion;
      }
    }
    return true;
  });

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {/* =========================================================================
            LEVEL 1: JAPAN NATIONAL MAP VIEW (폴더 1단계: 일본 전국 맵)
           ========================================================================= */}
        {level === 'national' && (
          <motion.div
            key="folder-level-1-national"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between mb-6 p-4 rounded-2xl glass-panel border border-white/10 shadow-lg">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-star-white font-mono">
                  {locale === 'ko' ? '일본 전국 거점 선택 (도시를 클릭하세요)' : locale === 'ja' ? '日本全国拠点マップ（都市を選択）' : 'Japan National Idol Map (Select a City)'}
                </span>
              </div>

              {/* Quick Region Pills */}
              <div className="hidden sm:flex items-center gap-1.5">
                {REGIONS.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleRegionClick(r.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/15 text-star-dim hover:text-star-white border border-white/5 transition flex items-center gap-1"
                  >
                    <span>{r.emoji}</span>
                    <span>{r.name[locale as 'ja' | 'ko' | 'en'] || r.name.ja}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Japan SVG & Radar Overlay Frame */}
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] max-h-[560px] rounded-3xl overflow-hidden glass-panel p-4 sm:p-8 mb-12 border border-white/15 shadow-2xl bg-gradient-to-b from-space-900/90 to-space-950/95 flex items-center justify-center select-none">
              <svg
                viewBox="0 0 1000 700"
                className="w-full h-full max-h-[530px]"
                style={{ filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.5))' }}
              >
                <defs>
                  <linearGradient id="hokkaidoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1E293B" />
                    <stop offset="100%" stopColor="#0F172A" />
                  </linearGradient>
                  <linearGradient id="honshuGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1E293B" />
                    <stop offset="100%" stopColor="#0B1120" />
                  </linearGradient>
                </defs>

                {/* Sea Grid Lines */}
                <g stroke="rgba(255,255,255,0.03)" strokeWidth="1">
                  <line x1="100" y1="0" x2="100" y2="700" />
                  <line x1="300" y1="0" x2="300" y2="700" />
                  <line x1="500" y1="0" x2="500" y2="700" />
                  <line x1="700" y1="0" x2="700" y2="700" />
                  <line x1="900" y1="0" x2="900" y2="700" />
                  <line x1="0" y1="150" x2="1000" y2="150" />
                  <line x1="0" y1="350" x2="1000" y2="350" />
                  <line x1="0" y1="550" x2="1000" y2="550" />
                </g>

                {/* Hokkaido */}
                <path
                  d="M 720 70 C 760 50, 830 40, 860 60 C 890 80, 880 120, 850 140 C 820 160, 790 190, 740 190 C 710 190, 690 160, 700 130 C 680 120, 660 140, 640 130 C 640 100, 680 80, 720 70 Z"
                  fill={hoveredRegion === 'sapporo' ? '#1E3A8A' : 'url(#hokkaidoGrad)'}
                  stroke={hoveredRegion === 'sapporo' ? '#38BDF8' : '#334155'}
                  strokeWidth="1.5"
                  className="transition-all duration-300 cursor-pointer"
                  onClick={() => handleRegionClick('sapporo')}
                  onMouseEnter={() => setHoveredRegion('sapporo')}
                  onMouseLeave={() => setHoveredRegion(null)}
                />

                {/* Honshu */}
                <path
                  d="M 730 210 C 750 230, 740 280, 720 320 C 710 360, 690 400, 680 430 C 670 450, 690 470, 660 480 C 630 480, 600 460, 560 460 C 520 460, 480 490, 440 480 C 400 470, 360 460, 320 470 C 280 480, 240 500, 220 490 C 210 470, 240 450, 270 440 C 310 430, 350 430, 390 430 C 430 430, 460 410, 500 390 C 540 370, 580 340, 600 310 C 620 280, 650 240, 690 220 C 710 200, 720 200, 730 210 Z"
                  fill="url(#honshuGrad)"
                  stroke="#334155"
                  strokeWidth="1.5"
                />

                {/* Shikoku */}
                <path
                  d="M 370 510 C 410 500, 450 510, 440 540 C 420 560, 380 560, 350 540 C 340 520, 360 510, 370 510 Z"
                  fill="url(#honshuGrad)"
                  stroke="#334155"
                  strokeWidth="1.5"
                />

                {/* Kyushu */}
                <path
                  d="M 210 500 C 240 510, 250 540, 240 570 C 230 610, 210 630, 180 620 C 150 610, 160 560, 170 530 C 180 500, 200 490, 210 500 Z"
                  fill={hoveredRegion === 'fukuoka' ? '#3B0764' : 'url(#honshuGrad)'}
                  stroke={hoveredRegion === 'fukuoka' ? '#8B5CF6' : '#334155'}
                  strokeWidth="1.5"
                  className="transition-all duration-300 cursor-pointer"
                  onClick={() => handleRegionClick('fukuoka')}
                  onMouseEnter={() => setHoveredRegion('fukuoka')}
                  onMouseLeave={() => setHoveredRegion(null)}
                />

                {/* Constellation Link Route */}
                <path
                  d="M 770 126 L 680 434 L 570 462 L 470 490 L 230 532"
                  fill="none"
                  stroke="rgba(255, 110, 167, 0.35)"
                  strokeWidth="2"
                  strokeDasharray="6 6"
                />
              </svg>

              {/* Clickable Radar Pins */}
              <div className="absolute inset-0 pointer-events-none">
                {REGIONS.map((r) => {
                  const count = groups.filter((g) => g.region === r.id).length;
                  const isHovered = hoveredRegion === r.id;

                  return (
                    <div
                      key={r.id}
                      style={{
                        left: `${r.pinX}%`,
                        top: `${r.pinY}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      className="absolute pointer-events-auto z-20"
                    >
                      <button
                        onClick={() => handleRegionClick(r.id)}
                        onMouseEnter={() => setHoveredRegion(r.id)}
                        onMouseLeave={() => setHoveredRegion(null)}
                        className={`group relative flex flex-col items-center focus:outline-none transition-all duration-300 ${
                          isHovered ? 'scale-110 z-30' : 'scale-100'
                        }`}
                      >
                        {/* Glowing Ring */}
                        <span
                          className="absolute w-12 h-12 rounded-full animate-ping opacity-40 pointer-events-none"
                          style={{ backgroundColor: r.color }}
                        />

                        {/* Starlight Pin Center */}
                        <div
                          className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center text-xl shadow-xl transition-all duration-300 border-2 ${
                            r.isTokyo
                              ? 'bg-gradient-to-br from-pink-500 to-rose-600 border-white shadow-pink-500/50'
                              : 'bg-space-850 border-white/30 group-hover:border-white shadow-black/60'
                          }`}
                          style={{
                            boxShadow: `0 0 24px ${r.color}60`,
                          }}
                        >
                          <span>{r.emoji}</span>
                        </div>

                        {/* Floating Region Info Badge */}
                        <div
                          className={`mt-2 px-3 py-1.5 rounded-xl backdrop-blur-xl border shadow-2xl transition-all duration-300 flex flex-col items-center whitespace-nowrap ${
                            r.isTokyo
                              ? 'bg-pink-950/90 border-pink-400 text-pink-100 shadow-pink-900/50'
                              : 'bg-space-950/85 border-white/15 text-star-dim group-hover:text-star-white'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs sm:text-sm font-bold text-star-white">
                              {r.name[locale as 'ja' | 'ko' | 'en'] || r.name.ja}
                            </span>
                            <span
                              className="text-[10px] font-bold px-1.5 py-0.2 rounded-full text-white"
                              style={{ backgroundColor: r.color }}
                            >
                              {count}
                            </span>
                          </div>

                          <span className="text-[10px] text-pink-300 font-medium mt-0.5">
                            {r.sub[locale as 'ja' | 'ko' | 'en'] || r.sub.ja}
                          </span>
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* =========================================================================
            LEVEL 2: TOKYO 23 WARDS VIEW (폴더 2단계: 도쿄 23구 구역 선택)
           ========================================================================= */}
        {level === 'tokyo-wards' && (
          <motion.div
            key="folder-level-2-tokyo"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.35 }}
            className="w-full"
          >
            {/* Breadcrumb Navigation Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-4 rounded-2xl glass-panel border border-white/10 shadow-lg">
              <button
                onClick={handleBackToNational}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-star-white text-xs font-bold flex items-center gap-2 transition"
              >
                <span>←</span>
                <span>{locale === 'ko' ? '일본 전국 지도로 돌아가기' : locale === 'ja' ? '全国マップに戻る' : 'Back to Japan Map'}</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-pink-400 font-bold">
                  TOKYO 23 WARDS
                </span>
              </div>
            </div>

            {/* Tokyo Wards Header */}
            <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/15 mb-8 bg-gradient-to-br from-pink-950/40 to-space-950">
              <div className="flex items-center gap-3.5 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-2xl shadow-lg shadow-pink-500/30">
                  🗼
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-star-white font-[family-name:var(--font-klee-one)]">
                    {locale === 'ko' ? '도쿄 23구 지하아이돌 거점 구역' : locale === 'ja' ? '東京23区・地下アイドル主要エリア' : 'Tokyo 23 Wards Key Idol Districts'}
                  </h2>
                  <p className="text-xs text-star-dim">
                    {locale === 'ko'
                      ? '시부야, 하라주쿠, 아키하바라, 신주쿠 등 원하시는 구역을 클릭하여 진입하세요.'
                      : 'エリアを選択すると、その地域のアイドルグループ一覧へ進みます。'}
                  </p>
                </div>
              </div>
            </div>

            {/* 6 Major District Cards (Clicking transitions to Level 3) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
              {TOKYO_DISTRICTS.map((d) => {
                const count = groups.filter((g) => g.region === 'tokyo' && g.district === d.id).length;

                return (
                  <button
                    key={d.id}
                    onClick={() => handleDistrictClick(d.id)}
                    className="p-6 rounded-3xl text-left transition-all duration-300 border border-white/10 hover:border-pink-500/60 bg-space-850/80 hover:bg-space-800 shadow-xl hover:shadow-2xl hover:-translate-y-1 group relative overflow-hidden flex flex-col justify-between min-h-[160px]"
                  >
                    <div
                      className="absolute -right-10 -top-10 w-28 h-28 rounded-full blur-2xl opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity"
                      style={{ backgroundColor: d.color }}
                    />

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl group-hover:scale-110 transition-transform">
                            {d.emoji}
                          </span>
                          <div>
                            <h3 className="text-lg font-bold text-star-white group-hover:text-pink-300 transition font-[family-name:var(--font-klee-one)]">
                              {d.name[locale as 'ja' | 'ko' | 'en'] || d.name.ja}
                            </h3>
                            <span className="text-[11px] text-star-faint font-mono">
                              {d.ward[locale as 'ja' | 'ko' | 'en'] || d.ward.ja}
                            </span>
                          </div>
                        </div>

                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/10 text-star-white">
                          {count} Groups
                        </span>
                      </div>

                      <p className="text-xs text-star-dim line-clamp-2 leading-relaxed">
                        {d.hotspots}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-pink-400 group-hover:translate-x-1 transition-transform">
                      <span>{locale === 'ko' ? '소속 아이돌 목록 보기' : locale === 'ja' ? '所属アイドルを見る' : 'View Idols'}</span>
                      <span>→</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* =========================================================================
            LEVEL 3: DISTRICT / CITY GROUPS VIEW (폴더 3단계: 구역 전용 그룹 목록)
           ========================================================================= */}
        {level === 'district-groups' && (
          <motion.div
            key="folder-level-3-groups"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.35 }}
            className="w-full"
          >
            {/* Breadcrumb Navigation Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-4 rounded-2xl glass-panel border border-white/10 shadow-lg">
              <div className="flex items-center gap-2">
                {selectedRegion === 'tokyo' ? (
                  <>
                    <button
                      onClick={handleBackToTokyoWards}
                      className="px-3.5 py-1.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 text-xs font-bold flex items-center gap-1.5 transition border border-pink-500/40"
                    >
                      <span>←</span>
                      <span>{locale === 'ko' ? '도쿄 23구 구역 선택' : locale === 'ja' ? '東京23区選択に戻る' : 'Back to Tokyo Wards'}</span>
                    </button>
                    <button
                      onClick={handleBackToNational}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-star-dim hover:text-white text-xs font-medium transition"
                    >
                      {locale === 'ko' ? '전국 지도' : '全国マップ'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleBackToNational}
                    className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-star-white text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <span>←</span>
                    <span>{locale === 'ko' ? '일본 전국 지도로 돌아가기' : locale === 'ja' ? '全国マップに戻る' : 'Back to Japan Map'}</span>
                  </button>
                )}
              </div>

              <span className="text-xs text-star-dim font-mono">
                {displayedGroups.length} Groups
              </span>
            </div>

            {/* District / City Showcase Banner */}
            <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/15 mb-8 bg-gradient-to-br from-space-900 to-space-950 shadow-xl">
              <div className="flex items-center gap-3.5">
                <span className="text-3xl sm:text-4xl">
                  {activeDistrictItem?.emoji || activeRegionItem?.emoji || '✦'}
                </span>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-star-white font-[family-name:var(--font-klee-one)]">
                    {activeDistrictItem
                      ? `${activeDistrictItem.name[locale as 'ja' | 'ko' | 'en'] || activeDistrictItem.name.ja} 거점 아이돌 그룹`
                      : activeRegionItem
                      ? `${activeRegionItem.name[locale as 'ja' | 'ko' | 'en'] || activeRegionItem.name.ja} 거점 아이돌 그룹`
                      : '아이돌 그룹 목록'}
                  </h2>
                  <p className="text-xs text-star-dim mt-1">
                    {activeDistrictItem?.ward[locale as 'ja' | 'ko' | 'en'] || activeRegionItem?.sub[locale as 'ja' | 'ko' | 'en'] || ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Large Group Cards Grid (Sakamichi Hub Style) */}
            {displayedGroups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch mb-12">
                {displayedGroups.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    locale={locale}
                  />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-3xl glass-panel border border-white/10 mb-12">
                <p className="text-sm text-star-dim">
                  {locale === 'ko' ? '해당 구역에 등록된 그룹이 없습니다.' : '該当するグループがありません。'}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
