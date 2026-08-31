import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getMember, getAllMembers } from '@/lib/data';
import { routing, Link } from '@/i18n/routing';
import { Navigation } from '@/components/ui/Navigation';
import { Footer } from '@/components/ui/Footer';
import { LinkGrid } from '@/components/member/LinkGrid';
import { MemberCard } from '@/components/member/MemberCard';
import { MemberAvatar } from '@/components/member/MemberAvatar';
import type { Metadata } from 'next';

interface MemberPageProps {
  params: Promise<{ locale: string; memberId: string }>;
}

export function generateStaticParams() {
  const members = getAllMembers();
  return routing.locales.flatMap((locale) =>
    members.map((m) => ({
      locale,
      memberId: m.id,
    })),
  );
}

export async function generateMetadata({ params }: MemberPageProps): Promise<Metadata> {
  const { locale, memberId } = await params;
  const result = getMember(memberId);
  if (!result) return {};

  const { member, group } = result;
  const groupName = group.name[locale as 'ja' | 'ko' | 'en'] || group.name.ja;
  const nameJa = member.name.ja.kanji;
  const nameKo = member.name.ko.hangul;
  const nameEn = member.name.en.romaji;

  const title =
    locale === 'ko'
      ? `${nameKo} (${nameJa} · ${groupName}) 공식 링크・SNS・체키`
      : locale === 'ja'
      ? `${nameJa} (${groupName}) 公式リンク・SNS・チェキ通販`
      : `${nameEn} (${nameJa} - ${groupName}) Official Links & SNS`;

  const description = `${groupName} 멤버 ${nameKo}(${nameJa}, ${member.name.ja.kana})의 공식 X(트위터), 인스타그램, 틱톡, 체키 스토어, 라이브 티켓 링크 모음.`;

  return {
    title,
    description,
  };
}

export default async function MemberPage({ params }: MemberPageProps) {
  const { locale, memberId } = await params;
  setRequestLocale(locale);

  const result = getMember(memberId);
  if (!result) {
    notFound();
  }

  const { member, group } = result;
  const groupName = group.name[locale as 'ja' | 'ko' | 'en'] || group.name.ja;
  const nameJa = member.name.ja.kanji;
  const nameKana = member.name.ja.kana;
  const nameKo = member.name.ko.hangul;
  const nameEn = member.name.en.romaji;
  const colorName = member.memberColorName[locale as 'ja' | 'ko' | 'en'] || member.memberColorName.ja;

  const displayName = locale === 'ko' ? nameKo : locale === 'en' ? nameEn : nameJa;
  const peers = group.members.filter((m) => m.id !== member.id);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: nameJa,
    alternateName: [nameKana, nameKo, nameEn],
    memberOf: {
      '@type': 'MusicGroup',
      name: group.name.ja,
    },
    sameAs: member.links.map((l) => l.url),
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navigation />

      <main id="main-content" className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-star-dim mb-8 font-medium">
          <Link href="/" className="hover:text-star-white transition">
            Home
          </Link>
          <span>/</span>
          <Link href={`/g/${group.id}`} className="hover:text-star-white transition">
            {groupName}
          </Link>
          <span>/</span>
          <span className="text-star-white font-semibold">{nameJa}</span>
        </div>

        {/* Member Profile Header Card */}
        <section className="relative p-6 sm:p-10 rounded-3xl glass-panel border border-white/10 overflow-hidden mb-10 shadow-2xl">
          <div
            className="absolute -right-16 -top-16 w-56 h-56 rounded-full blur-3xl opacity-25 pointer-events-none"
            style={{ backgroundColor: member.memberColor }}
          />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left relative z-10">
            {/* Member Avatar */}
            <MemberAvatar
              glyph={nameJa[0] || '★'}
              memberColor={member.memberColor}
              imageUrl={member.imageUrl}
              name={displayName}
              size={96}
              className="shadow-2xl"
            />

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-2">
                <h1 className="text-2xl sm:text-4xl font-extrabold text-star-white tracking-tight font-[family-name:var(--font-klee-one)]">
                  {displayName}
                </h1>
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full shadow-sm"
                  style={{
                    backgroundColor: `${member.memberColor}30`,
                    color: member.memberColor,
                    border: `1px solid ${member.memberColor}60`,
                  }}
                >
                  {colorName}
                </span>
              </div>

              {/* Subnames */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 text-xs sm:text-sm text-star-dim font-mono">
                <span>漢字: {nameJa}</span>
                <span>•</span>
                <span>かな: {nameKana}</span>
                <span>•</span>
                <span>Romaji: {nameEn}</span>
              </div>

              {/* Member Meta */}
              <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-1 text-xs text-star-dim">
                <span>所属: <Link href={`/g/${group.id}`} className="text-pink-300 font-bold hover:underline">{groupName}</Link></span>
                {member.birthDate && <span>{locale === 'ko' ? '생년월일' : locale === 'en' ? 'Date of birth' : '生年月日'}: <strong className="text-star-white">{member.birthDate}</strong></span>}
                {!member.birthDate && member.birthMonthDay && <span>{locale === 'ko' ? '생일(월·일)' : locale === 'en' ? 'Birthday (month/day)' : '誕生日（月日）'}: <strong className="text-star-white">{member.birthMonthDay}</strong></span>}
                {member.birthplace && <span>出身地: <strong className="text-star-white">{member.birthplace[locale as 'ja'|'ko'|'en'] || member.birthplace.ja}</strong></span>}
                {member.nickname && <span>愛称: <strong className="text-star-white">{member.nickname[locale as 'ja'|'ko'|'en'] || member.nickname.ja}</strong></span>}
                {member.memberMotif && <span>{locale === 'ko' ? '담당 모티프' : locale === 'en' ? 'Member motif' : '担当モチーフ'}: <strong className="text-star-white">{member.memberMotif[locale as 'ja'|'ko'|'en'] || member.memberMotif.ja}</strong></span>}
              </div>
            </div>
          </div>
        </section>

        {/* Links Grid - The Primary Destination */}
        <section className="mb-14">
          <div className="flex items-center justify-between pb-3 mb-6 border-b border-white/10">
            <h2 className="text-xl sm:text-2xl font-bold text-star-white font-[family-name:var(--font-klee-one)]">
              {locale === 'ko' ? '공식 링크 및 SNS' : locale === 'ja' ? '公式リンク・SNS' : 'Official Links & SNS'}
            </h2>
            <span className="text-xs text-star-dim font-mono">
              {member.links.length} Links
            </span>
          </div>

          <LinkGrid links={member.links} locale={locale} />
        </section>

        {/* Same Group Peer Idols */}
        {peers.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between pb-3 mb-6 border-b border-white/10">
              <h2 className="text-lg sm:text-xl font-bold text-star-white font-[family-name:var(--font-klee-one)]">
                {locale === 'ko' ? `${groupName} 소속 멤버` : locale === 'ja' ? `${groupName} メンバー` : `${groupName} Members`}
              </h2>
              <Link href={`/g/${group.id}`} className="text-xs text-pink-400 hover:underline">
                {locale === 'ko' ? '그룹 홈으로 →' : 'グループへ →'}
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {peers.map((peer) => (
                <MemberCard
                  key={peer.id}
                  member={peer}
                  group={group}
                  locale={locale}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
