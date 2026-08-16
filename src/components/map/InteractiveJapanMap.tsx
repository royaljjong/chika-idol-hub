'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { ChikaGroup, RegionId, DistrictId } from '@/lib/schema';
import { ChikaGroupCard } from '@/components/group/ChikaGroupCard';

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
  posX: number;
  posY: number;
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
    sub: { ja: '渋谷・原宿・秋葉原・新宿 (クリックで拡大 🔍)', ko: '시부야・하라주쿠・아키바・신주쿠 (클릭 시 23구 확대 🔍)', en: 'Shibuya, Harajuku, Akiba (Click to Zoom 🔍)' },
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
    name: { ja: '渋谷', ko: '시부야', en: 'Shibuya' },
    ward: { ja: '渋谷区 (道玄坂・円山町)', ko: '시부야구 (도겐자카・마루야마초)', en: 'Shibuya Ward' },
    emoji: '🛍️',
    color: '#FF2E7E',
    hotspots: 'WACK / Appare! / Takane no Nadeshiko / Spotify O-EAST / WWW X',
    posX: 38,
    posY: 60,
  },
  {
    id: 'harajuku',
    name: { ja: '原宿・表参道', ko: '하라주쿠・오모테산도', en: 'Harajuku / Omotesando' },
    ward: { ja: '渋谷区 (原宿・神宮前)', ko: '시부야구 (하라주쿠・진구마에)', en: 'Harajuku / Jingumae' },
    emoji: '🎀',
    color: '#FF6EA7',
    hotspots: 'KAWAII LAB. / FRUITS ZIPPER / CANDY TUNE / SWEET STEADY / CUTIE STREET',
    posX: 36,
    posY: 46,
  },
  {
    id: 'akihabara',
    name: { ja: '秋葉原', ko: '아키하바라', en: 'Akihabara' },
    ward: { ja: '千代田区・外神田', ko: '지요다구 (소토칸다)', en: 'Chiyoda Ward / Sotokanda' },
    emoji: '⚡',
    color: '#00E5FF',
    hotspots: 'DEARSTAGE / でんぱ組.inc / 虹のコンキスタドール / TwinBox / P.A.R.M.S',
    posX: 66,
    posY: 40,
  },
  {
    id: 'shinjuku',
    name: { ja: '新宿・歌舞伎町', ko: '신주쿠・가부키초', en: 'Shinjuku / Kabukicho' },
    ward: { ja: '新宿区 (歌舞伎町・西新宿)', ko: '신주쿠구 (가부키초)', en: 'Shinjuku Ward' },
    emoji: '🌃',
    color: '#A855F7',
    hotspots: 'HEROINES / iLiFE! / 夜光性アミューズ / Shinjuku BLAZE / ReNY',
    posX: 33,
    posY: 32,
  },
  {
    id: 'ikebukuro',
    name: { ja: '池袋', ko: '이케부쿠로', en: 'Ikebukuro' },
    ward: { ja: '豊島区 (東池袋)', ko: '도시마구 (히가시이케부쿠로)', en: 'Toshima Ward' },
    emoji: '🦉',
    color: '#3B82F6',
    hotspots: 'Harevutai / Club Mixa / サンシャインシティ噴水広場',
    posX: 36,
    posY: 18,
  },
  {
    id: 'roppongi',
    name: { ja: '六本木・赤坂', ko: '롯폰기・아카사카', en: 'Roppongi / Akasaka' },
    ward: { ja: '港区 (六本木・赤坂)', ko: '미나토구 (롯폰기)', en: 'Minato Ward' },
    emoji: '🍸',
    color: '#EAB308',
    hotspots: 'EX THEATER ROPPONGI / 赤坂BLITZ (역사)',
    posX: 52,
    posY: 68,
  },
];

export function InteractiveJapanMap({ groups, locale }: InteractiveJapanMapProps) {
  // START AT JAPAN MAP (isTokyoDrilldown = false, selectedRegion = 'all')
  const [isTokyoDrilldown, setIsTokyoDrilldown] = useState<boolean>(false);
  const [selectedRegion, setSelectedRegion] = useState<RegionId | 'all'>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictId | 'all'>('all');
  const [hoveredRegion, setHoveredRegion] = useState<RegionId | null>(null);

  // Group filtering
  const filteredGroups = groups.filter((g) => {
    if (isTokyoDrilldown) {
      if (selectedDistrict !== 'all') {
        return g.region === 'tokyo' && g.district === selectedDistrict;
      }
      return g.region === 'tokyo';
    }
    if (selectedRegion !== 'all') {
      return g.region === selectedRegion;
    }
    return true;
  });

  const handleRegionSelect = (regionId: RegionId) => {
    setSelectedRegion(regionId);
    if (regionId === 'tokyo') {
      // Smoothly drill down to Tokyo
      setIsTokyoDrilldown(true);
      setSelectedDistrict('all');
    } else {
      setIsTokyoDrilldown(false);
      setSelectedDistrict('all');
    }
  };

  const handleBackToJapan = () => {
    setIsTokyoDrilldown(false);
    setSelectedRegion('all');
    setSelectedDistrict('all');
  };

  return (
    <div className="w-full">
      {/* Top Map Navigator Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-4 rounded-2xl glass-panel border border-white/10 shadow-lg">
        <div className="flex items-center gap-3">
          {isTokyoDrilldown ? (
            <button
              onClick={handleBackToJapan}
              className="px-3.5 py-1.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 text-xs font-bold flex items-center gap-2 transition border border-pink-500/40 shadow-sm"
            >
              <span>←</span>
              <span>{locale === 'ko' ? '일본 전국 맵으로 축소' : locale === 'ja' ? '全国マップに戻る' : 'Back to Japan Map'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-star-white font-mono">
                {locale === 'ko' ? '일본 전국 라이브 아이돌 거점 맵' : locale === 'ja' ? '日本全国 拠点マップ' : 'Japan National Idol Map'}
              </span>
            </div>
          )}
        </div>

        {/* Region Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={handleBackToJapan}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              !isTokyoDrilldown && selectedRegion === 'all'
                ? 'bg-white text-space-950 shadow-md font-bold'
                : 'text-star-dim hover:text-star-white hover:bg-white/5 border border-transparent'
            }`}
          >
            {locale === 'ko' ? '전국 전체' : locale === 'ja' ? '全国すべて' : 'All Japan'}
          </button>
          {REGIONS.map((r) => {
            const isSelected = (!isTokyoDrilldown && selectedRegion === r.id) || (isTokyoDrilldown && r.id === 'tokyo');
            return (
              <button
                key={r.id}
                onClick={() => handleRegionSelect(r.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-gradient-to-r from-pink-500/30 to-purple-500/30 text-pink-200 border-pink-400 shadow-md font-bold'
                    : 'text-star-dim hover:text-star-white hover:bg-white/5 border-white/5'
                }`}
              >
                <span>{r.emoji}</span>
                <span>{r.name[locale as 'ja' | 'ko' | 'en'] || r.name.ja}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Map Frame */}
      <div className="relative w-full rounded-3xl overflow-hidden glass-panel p-4 sm:p-8 mb-10 border border-white/15 shadow-2xl bg-gradient-to-b from-space-900/90 to-space-950/95">
        <AnimatePresence mode="wait">
          {!isTokyoDrilldown ? (
            /* ========================================================
               1. JAPAN NATIONAL MAP VIEW (REALISTIC ACCURATE SVG)
               ======================================================== */
            <motion.div
              key="national-japan-map"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.3 }}
              className="relative w-full aspect-[4/3] sm:aspect-[16/10] max-h-[580px] flex items-center justify-center select-none"
            >
              {/* Detailed Japan Geographic SVG Canvas */}
              <svg
                viewBox="0 0 1000 700"
                className="w-full h-full max-h-[550px]"
                style={{ filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.5))' }}
              >
                <defs>
                  {/* Glowing Gradients */}
                  <linearGradient id="hokkaidoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1E293B" />
                    <stop offset="100%" stopColor="#0F172A" />
                  </linearGradient>
                  <linearGradient id="honshuGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1E293B" />
                    <stop offset="100%" stopColor="#0B1120" />
                  </linearGradient>
                  <filter id="neonPinGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* --- Sea Grid Background Lines --- */}
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

                {/* --- 1. Hokkaido Island --- */}
                <path
                  d="M 720 70 
                     C 760 50, 830 40, 860 60 
                     C 890 80, 880 120, 850 140 
                     C 820 160, 790 190, 740 190 
                     C 710 190, 690 160, 700 130 
                     C 680 120, 660 140, 640 130 
                     C 640 100, 680 80, 720 70 Z"
                  fill={hoveredRegion === 'sapporo' ? '#1E3A8A' : 'url(#hokkaidoGrad)'}
                  stroke={hoveredRegion === 'sapporo' ? '#38BDF8' : '#334155'}
                  strokeWidth={hoveredRegion === 'sapporo' ? '2.5' : '1.5'}
                  className="transition-all duration-300 cursor-pointer"
                  onClick={() => handleRegionSelect('sapporo')}
                  onMouseEnter={() => setHoveredRegion('sapporo')}
                  onMouseLeave={() => setHoveredRegion(null)}
                />

                {/* --- 2. Honshu Main Island (Tohoku -> Kanto -> Chubu -> Kansai -> Chugoku) --- */}
                <path
                  d="M 730 210
                     C 750 230, 740 280, 720 320
                     C 710 360, 690 400, 680 430
                     C 670 450, 690 470, 660 480
                     C 630 480, 600 460, 560 460
                     C 520 460, 480 490, 440 480
                     C 400 470, 360 460, 320 470
                     C 280 480, 240 500, 220 490
                     C 210 470, 240 450, 270 440
                     C 310 430, 350 430, 390 430
                     C 430 430, 460 410, 500 390
                     C 540 370, 580 340, 600 310
                     C 620 280, 650 240, 690 220
                     C 710 200, 720 200, 730 210 Z"
                  fill="url(#honshuGrad)"
                  stroke="#334155"
                  strokeWidth="1.5"
                />

                {/* --- 3. Shikoku Island --- */}
                <path
                  d="M 370 510
                     C 410 500, 450 510, 440 540
                     C 420 560, 380 560, 350 540
                     C 340 520, 360 510, 370 510 Z"
                  fill="url(#honshuGrad)"
                  stroke="#334155"
                  strokeWidth="1.5"
                />

                {/* --- 4. Kyushu Island --- */}
                <path
                  d="M 210 500
                     C 240 510, 250 540, 240 570
                     C 230 610, 210 630, 180 620
                     C 150 610, 160 560, 170 530
                     C 180 500, 200 490, 210 500 Z"
                  fill={hoveredRegion === 'fukuoka' ? '#3B0764' : 'url(#honshuGrad)'}
                  stroke={hoveredRegion === 'fukuoka' ? '#8B5CF6' : '#334155'}
                  strokeWidth={hoveredRegion === 'fukuoka' ? '2.5' : '1.5'}
                  className="transition-all duration-300 cursor-pointer"
                  onClick={() => handleRegionSelect('fukuoka')}
                  onMouseEnter={() => setHoveredRegion('fukuoka')}
                  onMouseLeave={() => setHoveredRegion(null)}
                />

                {/* --- Connecting Golden Constellation Routes --- */}
                <path
                  d="M 770 126 L 680 434 L 570 462 L 470 490 L 230 532"
                  fill="none"
                  stroke="rgba(255, 110, 167, 0.4)"
                  strokeWidth="2"
                  strokeDasharray="6 6"
                />
              </svg>

              {/* --- Interactive HTML Overlay Pins (100% Reliable Clicking & Beautiful Hover Cards) --- */}
              <div className="absolute inset-0 pointer-events-none">
                {REGIONS.map((r) => {
                  const count = groups.filter((g) => g.region === r.id).length;
                  const isSelected = selectedRegion === r.id;
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
                        onClick={() => handleRegionSelect(r.id)}
                        onMouseEnter={() => setHoveredRegion(r.id)}
                        onMouseLeave={() => setHoveredRegion(null)}
                        className={`group relative flex flex-col items-center focus:outline-none transition-all duration-300 ${
                          isSelected || isHovered ? 'scale-110 z-30' : 'scale-100'
                        }`}
                      >
                        {/* Glowing Pulsing Ring */}
                        <span
                          className="absolute w-12 h-12 rounded-full animate-ping opacity-40 pointer-events-none"
                          style={{ backgroundColor: r.color }}
                        />

                        {/* Starlight Pin Center */}
                        <div
                          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-lg sm:text-xl shadow-xl transition-all duration-300 border-2 ${
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
                          className={`mt-2 px-3 py-1 rounded-xl backdrop-blur-xl border shadow-2xl transition-all duration-300 flex flex-col items-center whitespace-nowrap ${
                            r.isTokyo
                              ? 'bg-pink-950/90 border-pink-400 text-pink-100 shadow-pink-900/50'
                              : isSelected || isHovered
                              ? 'bg-space-800/95 border-white text-star-white'
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
            </motion.div>
          ) : (
            /* ========================================================
               2. TOKYO 23 WARDS DRILL-DOWN DETAILED MAP
               ======================================================== */
            <motion.div
              key="tokyo-drilldown-map"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.35 }}
              className="relative w-full"
            >
              {/* Tokyo Banner Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-xl shadow-lg shadow-pink-500/30">
                    🗼
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-star-white font-[family-name:var(--font-klee-one)]">
                      {locale === 'ko' ? '도쿄 23구 핵심 지하아이돌 거점 구역' : locale === 'ja' ? '東京23区・主要アイドルエリア詳細' : 'Tokyo 23 Wards Key Idol Districts'}
                    </h3>
                    <p className="text-xs text-star-dim">
                      {locale === 'ko'
                        ? '시부야・하라주쿠・아키하바라・신주쿠 구역을 클릭하여 해당 거점의 그룹을 확인하세요.'
                        : 'エリアを選択すると、所属アイドルグループとチケット情報が表示されます。'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => setSelectedDistrict('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      selectedDistrict === 'all'
                        ? 'bg-pink-500 text-white shadow-md'
                        : 'bg-white/10 text-star-dim hover:text-white'
                    }`}
                  >
                    {locale === 'ko' ? '도쿄 전체 보기' : '東京全域'}
                  </button>
                  <button
                    onClick={handleBackToJapan}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-star-white text-xs font-medium transition"
                  >
                    {locale === 'ko' ? '← 전국 맵' : '← 全国マップ'}
                  </button>
                </div>
              </div>

              {/* Interactive Tokyo District Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {TOKYO_DISTRICTS.map((d) => {
                  const isSelected = selectedDistrict === d.id;
                  const count = groups.filter((g) => g.region === 'tokyo' && g.district === d.id).length;

                  return (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDistrict(d.id)}
                      className={`p-5 rounded-2xl text-left transition-all duration-300 border relative overflow-hidden group ${
                        isSelected
                          ? 'bg-gradient-to-br from-pink-950/70 to-purple-950/70 border-pink-500 shadow-[0_0_30px_rgba(255,110,167,0.35)] scale-[1.02]'
                          : 'bg-space-850/80 border-white/10 hover:border-pink-500/50 hover:bg-space-800/90'
                      }`}
                    >
                      {/* Ambient corner glow */}
                      <div
                        className="absolute -right-8 -top-8 w-20 h-20 rounded-full blur-2xl opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity"
                        style={{ backgroundColor: d.color }}
                      />

                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl group-hover:scale-110 transition-transform">
                            {d.emoji}
                          </span>
                          <div>
                            <span className={`text-base font-bold block ${isSelected ? 'text-pink-300' : 'text-star-white'}`}>
                              {d.name[locale as 'ja' | 'ko' | 'en'] || d.name.ja}
                            </span>
                            <span className="text-[10px] text-star-faint">
                              {d.ward[locale as 'ja' | 'ko' | 'en'] || d.ward.ja}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            isSelected ? 'bg-pink-500 text-white' : 'bg-white/10 text-star-dim'
                          }`}
                        >
                          {count} Groups
                        </span>
                      </div>

                      <p className="text-xs text-star-dim line-clamp-2 leading-relaxed">
                        {d.hotspots}
                      </p>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filtered Group Showcase Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-pink-400 font-bold text-lg">✦</span>
            <h3 className="text-lg sm:text-xl font-bold text-star-white font-[family-name:var(--font-klee-one)]">
              {isTokyoDrilldown
                ? selectedDistrict === 'all'
                  ? locale === 'ko' ? '도쿄 전체 거점 아이돌' : '東京全域 拠点アイドル'
                  : `${TOKYO_DISTRICTS.find((d) => d.id === selectedDistrict)?.name[locale as 'ja' | 'ko' | 'en'] || ''} 거점 아이돌`
                : selectedRegion === 'all'
                ? locale === 'ko' ? '전국 대표 아이돌 그룹' : '全国代表アイドルグループ'
                : `${REGIONS.find((r) => r.id === selectedRegion)?.name[locale as 'ja' | 'ko' | 'en'] || ''} 거점 아이돌`}
            </h3>
          </div>
          <span className="text-xs text-star-dim font-mono">
            {filteredGroups.length} Groups
          </span>
        </div>

        {filteredGroups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <ChikaGroupCard
                key={group.id}
                group={group}
                locale={locale}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl glass-panel">
            <p className="text-sm text-star-dim">
              {locale === 'ko' ? '해당 구역의 등록된 그룹이 없습니다.' : '該当するグループがありません。'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
