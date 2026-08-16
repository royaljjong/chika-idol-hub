'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { ChikaGroup, RegionId, DistrictId } from '@/lib/schema';
import { ChikaGroupCard } from '@/components/group/ChikaGroupCard';
import { useTranslations } from 'next-intl';

interface InteractiveJapanMapProps {
  groups: ChikaGroup[];
  locale: string;
}

interface RegionMeta {
  id: RegionId;
  name: { ja: string; ko: string; en: string };
  emoji: string;
  cx: number;
  cy: number;
  description: { ja: string; ko: string; en: string };
}

interface DistrictMeta {
  id: DistrictId;
  name: { ja: string; ko: string; en: string };
  emoji: string;
  cx: number;
  cy: number;
  highlight: string;
}

const REGIONS: RegionMeta[] = [
  {
    id: 'sapporo',
    name: { ja: '札幌・北海道', ko: '삿포로・홋카이도', en: 'Sapporo (Hokkaido)' },
    emoji: '❄️',
    cx: 480,
    cy: 80,
    description: { ja: '透明感と叙情的な楽曲が魅力の北の大地', ko: '투명감과 서정적인 감성의 홋카이도 씬', en: 'Poetic & atmospheric northern idol scene' },
  },
  {
    id: 'tokyo',
    name: { ja: '東京 (23区)', ko: '도쿄 (23구)', en: 'Tokyo (23 Wards)' },
    emoji: '🗼',
    cx: 430,
    cy: 270,
    description: { ja: '渋谷・原宿・秋葉原・新宿など全国最大のアイドル激戦区', ko: '시부야·하라주쿠·아키하바라·신주쿠 등 일본 최대 격전지', en: 'The epicentre of Japanese live idol culture' },
  },
  {
    id: 'nagoya',
    name: { ja: '名古屋・愛知', ko: '나고야・아이치', en: 'Nagoya (Tokai)' },
    emoji: '🏯',
    cx: 370,
    cy: 285,
    description: { ja: '栄を中心に熱いライブパフォーマンスを誇る東海拠点', ko: '사카에를 중심으로 뜨거운 라이브 열기의 토카이 거점', en: 'Energetic rock-infused live idol scene' },
  },
  {
    id: 'osaka',
    name: { ja: '大阪・関西', ko: '오사카・간사이', en: 'Osaka (Kansai)' },
    emoji: '🐙',
    cx: 310,
    cy: 300,
    description: { ja: '難波・心斎橋を拠点に独自のポジティブな熱量を持つ関西圏', ko: '난바·신사이바시 중심의 독창적인 간사이 씬', en: 'Vibrant and energetic Kansai live scene' },
  },
  {
    id: 'fukuoka',
    name: { ja: '福岡・九州', ko: '후쿠오카・큐슈', en: 'Fukuoka (Kyushu)' },
    emoji: '🍜',
    cx: 170,
    cy: 330,
    description: { ja: '天神・博多からアジアへ笑顔を広げる九州アイドル文化', ko: '텐진·하카타를 거점으로 밝은 에너지를 전하는 큐슈 씬', en: 'Bright and energetic southern idol culture' },
  },
];

const TOKYO_DISTRICTS: DistrictMeta[] = [
  {
    id: 'shibuya',
    name: { ja: '渋谷 (Shibuya)', ko: '시부야 (Shibuya)', en: 'Shibuya' },
    emoji: '🛍️',
    cx: 240,
    cy: 280,
    highlight: 'WACK / Appare! / Takane no Nadeshiko / O-EAST / WWW X',
  },
  {
    id: 'harajuku',
    name: { ja: '原宿・表参道', ko: '하라주쿠・오모테산도', en: 'Harajuku / Omotesando' },
    emoji: '🎀',
    cx: 230,
    cy: 230,
    highlight: 'KAWAII LAB. / FRUITS ZIPPER / CANDY TUNE',
  },
  {
    id: 'akihabara',
    name: { ja: '秋葉原 (Akiba)', ko: '아키하바라 (Akiba)', en: 'Akihabara' },
    emoji: '⚡',
    cx: 370,
    cy: 190,
    highlight: 'DearStage / でんぱ組.inc / 虹コン / TwinBox / P.A.R.M.S',
  },
  {
    id: 'shinjuku',
    name: { ja: '新宿 (Shinjuku)', ko: '신주쿠 (Shinjuku)', en: 'Shinjuku' },
    emoji: '🌃',
    cx: 210,
    cy: 160,
    highlight: 'HEROINES / iLiFE! / BLAZE / ReNY',
  },
  {
    id: 'ikebukuro',
    name: { ja: '池袋 (Ikebukuro)', ko: '이케부쿠로 (Ikebukuro)', en: 'Ikebukuro' },
    emoji: '🦉',
    cx: 220,
    cy: 90,
    highlight: 'Harevutai / Club Mixa / サンシャインシティ噴水広場',
  },
  {
    id: 'roppongi',
    name: { ja: '六本木・赤坂', ko: '롯폰기・아카사카', en: 'Roppongi / Akasaka' },
    emoji: '🍸',
    cx: 310,
    cy: 300,
    highlight: 'EX THEATER ROPPONGI / 赤坂BLITZ (역사)',
  },
];

export function InteractiveJapanMap({ groups, locale }: InteractiveJapanMapProps) {
  const [selectedRegion, setSelectedRegion] = useState<RegionId | 'all'>('tokyo');
  const [isTokyoDrilldown, setIsTokyoDrilldown] = useState<boolean>(true);
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictId | 'all'>('all');

  // Filter groups
  const filteredGroups = groups.filter((g) => {
    if (isTokyoDrilldown && selectedRegion === 'tokyo') {
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

  const handleRegionClick = (regionId: RegionId) => {
    setSelectedRegion(regionId);
    if (regionId === 'tokyo') {
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
      {/* Map Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-4 rounded-2xl glass-panel">
        <div className="flex items-center gap-3">
          {isTokyoDrilldown ? (
            <button
              onClick={handleBackToJapan}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-star-white flex items-center gap-1.5 transition"
            >
              <span>←</span>
              <span>{locale === 'ko' ? '전국 지도로 축소' : locale === 'ja' ? '全国マップに戻る' : 'Back to Japan Map'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-star-dim font-mono">
                {locale === 'ko' ? '일본 전국 아이돌 거점 맵' : locale === 'ja' ? '全国アイドル拠点マップ' : 'Japan Idol Map'}
              </span>
            </div>
          )}
        </div>

        {/* Quick Region Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={handleBackToJapan}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              !isTokyoDrilldown && selectedRegion === 'all'
                ? 'bg-white text-space-950 font-bold shadow-sm'
                : 'text-star-dim hover:text-star-white hover:bg-white/5'
            }`}
          >
            {locale === 'ko' ? '전국 전체' : locale === 'ja' ? '全国すべて' : 'All Regions'}
          </button>
          {REGIONS.map((r) => {
            const isActive = selectedRegion === r.id;
            return (
              <button
                key={r.id}
                onClick={() => handleRegionClick(r.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 border border-pink-500/40 font-bold'
                    : 'text-star-dim hover:text-star-white hover:bg-white/5'
                }`}
              >
                <span>{r.emoji}</span>
                <span>{r.name[locale as 'ja' | 'ko' | 'en'] || r.name.ja}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Map Visual Area */}
      <div className="relative w-full rounded-3xl overflow-hidden glass-panel p-6 sm:p-8 mb-10 border border-white/10 shadow-2xl">
        <AnimatePresence mode="wait">
          {!isTokyoDrilldown ? (
            /* ================= 1. JAPAN NATIONAL MAP ================= */
            <motion.div
              key="japan-map"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.35 }}
              className="relative w-full aspect-[16/9] max-h-[480px] flex items-center justify-center"
            >
              <svg
                viewBox="0 0 600 420"
                className="w-full h-full max-h-[440px] drop-shadow-md select-none"
              >
                <defs>
                  <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1E293B" />
                    <stop offset="100%" stopColor="#0F172A" />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Stylized Japan Archipelago Silhouette */}
                <g fill="url(#mapGradient)" stroke="#334155" strokeWidth="1.5">
                  {/* Hokkaido */}
                  <path d="M 440 60 L 510 50 L 530 80 L 490 120 L 450 110 Z" />
                  {/* Tohoku */}
                  <path d="M 460 140 L 480 180 L 450 230 L 430 210 Z" />
                  {/* Kanto / Tokyo */}
                  <path d="M 430 230 L 460 270 L 420 290 L 400 250 Z" />
                  {/* Chubu / Nagoya */}
                  <path d="M 390 250 L 410 300 L 360 300 L 360 250 Z" />
                  {/* Kansai / Osaka */}
                  <path d="M 350 270 L 350 320 L 290 320 L 300 280 Z" />
                  {/* Chugoku / Shikoku */}
                  <path d="M 280 290 L 290 330 L 210 330 L 220 290 Z" />
                  {/* Kyushu / Fukuoka */}
                  <path d="M 190 310 L 200 370 L 140 370 L 150 320 Z" />
                </g>

                {/* Connection lines between major hubs */}
                <path
                  d="M 480 80 L 430 270 L 370 285 L 310 300 L 170 330"
                  fill="none"
                  stroke="rgba(255, 110, 167, 0.25)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />

                {/* Regional Clickable Nodes */}
                {REGIONS.map((r) => {
                  const count = groups.filter((g) => g.region === r.id).length;
                  const isSelected = selectedRegion === r.id;

                  return (
                    <g
                      key={r.id}
                      onClick={() => handleRegionClick(r.id)}
                      className="cursor-pointer group"
                    >
                      {/* Pulse Circle */}
                      <circle
                        cx={r.cx}
                        cy={r.cy}
                        r={isSelected ? 18 : 14}
                        fill={isSelected ? '#FF6EA7' : '#38BDF8'}
                        fillOpacity={isSelected ? 0.35 : 0.2}
                        className="animate-ping"
                        style={{ animationDuration: '3s' }}
                      />
                      {/* Main Node */}
                      <circle
                        cx={r.cx}
                        cy={r.cy}
                        r={isSelected ? 12 : 9}
                        fill={isSelected ? '#FF2E7E' : '#0284C7'}
                        stroke="#FFFFFF"
                        strokeWidth={isSelected ? 2.5 : 1.5}
                        filter="url(#glow)"
                        className="transition-all duration-300 group-hover:scale-125"
                      />

                      {/* Label Card */}
                      <foreignObject
                        x={r.cx - 70}
                        y={r.cy + 14}
                        width="140"
                        height="60"
                        className="overflow-visible pointer-events-none"
                      >
                        <div className="flex flex-col items-center justify-center text-center">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md border shadow-md flex items-center gap-1 ${
                            isSelected
                              ? 'bg-pink-500 text-white border-pink-300'
                              : 'bg-space-900/90 text-star-white border-white/20 group-hover:border-pink-400'
                          }`}>
                            <span>{r.emoji}</span>
                            <span>{r.name[locale as 'ja' | 'ko' | 'en'] || r.name.ja}</span>
                          </span>
                          <span className="text-[10px] text-pink-300 font-semibold mt-0.5">
                            {count} Groups
                          </span>
                        </div>
                      </foreignObject>
                    </g>
                  );
                })}
              </svg>
            </motion.div>
          ) : (
            /* ================= 2. TOKYO 23 WARDS DRILL-DOWN MAP ================= */
            <motion.div
              key="tokyo-map"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.35 }}
              className="relative w-full"
            >
              {/* Tokyo Banner Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🗼</span>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-star-white">
                      {locale === 'ko' ? '도쿄 23구 핵심 구역 드릴다운' : locale === 'ja' ? '東京23区・主要エリア探索' : 'Tokyo 23 Wards Key Districts'}
                    </h3>
                    <p className="text-[11px] text-star-dim">
                      {locale === 'ko' ? '시부야·하라주쿠·아키하바라·신주쿠 구역을 클릭하여 거점 아이돌을 확인하세요' : 'エリアを選択して所属グループを絞り込み'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedDistrict('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    selectedDistrict === 'all'
                      ? 'bg-pink-500 text-white'
                      : 'bg-white/10 text-star-dim hover:text-white'
                  }`}
                >
                  {locale === 'ko' ? '도쿄 전체 보기' : '東京全域'}
                </button>
              </div>

              {/* Interactive Tokyo District Grid Map */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 my-4">
                {TOKYO_DISTRICTS.map((d) => {
                  const isSelected = selectedDistrict === d.id;
                  const count = groups.filter((g) => g.region === 'tokyo' && g.district === d.id).length;

                  return (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDistrict(d.id)}
                      className={`p-4 rounded-2xl text-left transition-all duration-300 border relative overflow-hidden group ${
                        isSelected
                          ? 'bg-gradient-to-br from-pink-950/60 to-purple-950/60 border-pink-500 shadow-[0_0_24px_rgba(255,110,167,0.3)]'
                          : 'bg-space-850/70 border-white/10 hover:border-white/25 hover:bg-space-800/80'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl group-hover:scale-110 transition-transform">
                            {d.emoji}
                          </span>
                          <span className={`text-sm font-bold ${isSelected ? 'text-pink-300' : 'text-star-white'}`}>
                            {d.name[locale as 'ja' | 'ko' | 'en'] || d.name.ja}
                          </span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isSelected ? 'bg-pink-500 text-white' : 'bg-white/10 text-star-dim'
                        }`}>
                          {count}
                        </span>
                      </div>

                      <p className="text-[11px] text-star-dim line-clamp-2 leading-snug">
                        {d.highlight}
                      </p>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filtered Group Showcase */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-pink-400 font-bold text-base">✦</span>
            <h3 className="text-base sm:text-lg font-bold text-star-white font-[family-name:var(--font-klee-one)]">
              {locale === 'ko' ? '거점 아이돌 그룹 목록' : locale === 'ja' ? '拠点アイドルグループ一覧' : 'Base Idol Groups'}
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
