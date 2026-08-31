'use client';

import React from 'react';
import type { ChikaMember, ChikaGroup } from '@/lib/schema';
import { MemberAvatar } from '@/components/member/MemberAvatar';
import { Link } from '@/i18n/routing';

interface BirthdayItem {
  member: ChikaMember;
  group: ChikaGroup;
  birthDate: string;
  month: number;
  day: number;
}

interface BirthdayTrackerProps {
  birthdays: BirthdayItem[];
  locale: string;
  currentMonth: number;
}

export function BirthdayTracker({ birthdays, locale, currentMonth }: BirthdayTrackerProps) {
  const language = locale === 'ko' || locale === 'en' ? locale : 'ja';
  const nextMonth = (currentMonth % 12) + 1;
  const currentMonthBirthdays = birthdays.filter((b) => b.month === currentMonth || b.month === nextMonth);
  const monthLabel = (month: number) => language === 'ko' ? `${month}월` : language === 'ja' ? `${month}月` : new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(2026, month - 1, 1)));
  const dateLabel = (month: number, day: number) => language === 'ko' ? `${month}월 ${day}일` : language === 'ja' ? `${month}月${day}日` : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(2026, month - 1, day)));

  return (
    <section className="mb-14">
      <div className="flex items-center justify-between pb-3 mb-6 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🎂</span>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-star-white font-[family-name:var(--font-klee-one)]">
              {locale === 'ko' ? '아이돌 생일 캘린더' : locale === 'ja' ? '誕生日カレンダー' : 'Birthday Tracker'}
            </h2>
            <p className="text-xs text-star-dim mt-0.5">
              {language === 'ko' ? '이번 달 & 다가오는 생일 축하 아이돌' : language === 'ja' ? '今月・近日誕生日のアイドル一覧' : 'Idols celebrating birthdays this month and next'}
            </p>
          </div>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
          🎉 {monthLabel(currentMonth)} & {monthLabel(nextMonth)}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {currentMonthBirthdays.slice(0, 12).map((item) => {
          const nameJa = item.member.name.ja.kanji;
          const nameDisplay = locale === 'ko' ? item.member.name.ko.hangul : locale === 'en' ? item.member.name.en.romaji : nameJa;
          const groupName = item.group.name[locale as 'ja' | 'ko' | 'en'] || item.group.name.ja;

          return (
            <Link
              key={item.member.id}
              href={`/m/${item.member.id}`}
              className="group p-4 rounded-2xl glass-panel border border-white/10 hover:border-pink-500/50 transition-all duration-300 hover:-translate-y-1 flex flex-col items-center text-center"
            >
              <div className="relative mb-3">
                <MemberAvatar
                  glyph={nameJa[0] || '★'}
                  memberColor={item.member.memberColor}
                  imageUrl={item.member.imageUrl}
                  name={nameDisplay}
                  size={52}
                  className="ring-2 ring-space-900 shadow-md group-hover:scale-105 transition-transform"
                />
                <span className="absolute -bottom-1 -right-1 text-xs">🎉</span>
              </div>

              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-pink-300 mb-1.5 font-mono">
                {dateLabel(item.month, item.day)}
              </span>

              <h4 className="text-xs sm:text-sm font-bold text-star-white group-hover:text-pink-300 transition truncate w-full">
                {nameDisplay}
              </h4>
              <p className="text-[10px] text-star-dim truncate w-full mt-0.5">
                {groupName}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
