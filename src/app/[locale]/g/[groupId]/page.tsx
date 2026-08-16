import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getGroup, getGroups } from '@/lib/data';
import { routing, Link } from '@/i18n/routing';
import { Navigation } from '@/components/ui/Navigation';
import { Footer } from '@/components/ui/Footer';
import { MemberCard } from '@/components/member/MemberCard';
import type { Metadata } from 'next';

interface GroupPageProps {
  params: Promise<{ locale: string; groupId: string }>;
}

export function generateStaticParams() {
  const groups = getGroups();
  return routing.locales.flatMap((locale) =>
    groups.map((g) => ({
      locale,
      groupId: g.id,
    })),
  );
}

export async function generateMetadata({ params }: GroupPageProps): Promise<Metadata> {
  const { locale, groupId } = await params;
  const group = getGroup(groupId);
  if (!group) return {};

  const name = group.name[locale as 'ja' | 'ko' | 'en'] || group.name.ja;
  const title = `${name} (${group.agency}) メンバー一覧・公式リンク | CHIKA IDOL HUB`;
  const description = `${name}의 멤버 목록, 프로필, 라이브 티켓(TIGET/LivePocket), 체키 스토어, SNS 링크 모음.`;

  return {
    title,
    description,
  };
}

export default async function GroupPage({ params }: GroupPageProps) {
  const { locale, groupId } = await params;
  setRequestLocale(locale);

  const group = getGroup(groupId);
  if (!group) {
    notFound();
  }

  const groupName = group.name[locale as 'ja' | 'ko' | 'en'] || group.name.ja;
  const description = group.description[locale as 'ja' | 'ko' | 'en'] || group.description.ja;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    name: group.name.ja,
    alternateName: [group.name.ko, group.name.en],
    url: group.officialSite || undefined,
    sameAs: [group.x, group.instagram, group.tiktok, group.youtube].filter(Boolean),
    member: group.members.map((m) => ({
      '@type': 'Person',
      name: m.name.ja.kanji,
      alternateName: [m.name.ko.hangul, m.name.en.romaji],
    })),
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navigation />

      <main id="main-content" className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-star-dim mb-6 font-medium">
          <Link href="/" className="hover:text-star-white transition">
            Home
          </Link>
          <span>/</span>
          <span>{group.region.toUpperCase()} ({group.district.toUpperCase()})</span>
          <span>/</span>
          <span className="text-star-white font-semibold">{groupName}</span>
        </div>

        {/* Group Profile Header */}
        <section className="relative p-6 sm:p-10 rounded-3xl glass-panel border border-white/10 overflow-hidden mb-10 shadow-2xl">
          <div
            className="absolute -right-20 -top-20 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ backgroundColor: group.color }}
          />

          <div className="flex flex-col sm:flex-row items-start justify-between gap-6 relative z-10">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2.5 mb-3">
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/10 text-star-white border border-white/15">
                  {group.agency}
                </span>
                <span
                  className="text-[11px] font-bold px-3 py-1 rounded-full"
                  style={{
                    color: group.color,
                    backgroundColor: `${group.color}20`,
                  }}
                >
                  {group.district.toUpperCase()} ({group.region})
                </span>
                <span className="text-xs text-star-dim font-mono">
                  Debut {group.debutYear}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-star-white tracking-tight mb-3 font-[family-name:var(--font-klee-one)]">
                {groupName}
              </h1>

              <p className="text-sm text-star-dim max-w-2xl leading-relaxed">
                {description}
              </p>
            </div>
          </div>

          {/* Quick Action Links Bar */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-3">
            {group.officialSite && (
              <a
                href={group.officialSite}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-white text-space-950 text-xs font-bold transition hover:bg-star-white flex items-center gap-1.5 shadow-md"
              >
                <span>🌐</span>
                <span>{locale === 'ko' ? '공식 사이트' : '公式サイト'}</span>
              </a>
            )}

            {group.ticketUrl && (
              <a
                href={group.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-pink-500/20"
              >
                <span>🎟️</span>
                <span>{locale === 'ko' ? '라이브 티켓 예매' : 'ライブチケット (TIGET/LivePocket)'}</span>
              </a>
            )}

            {group.chekiUrl && (
              <a
                href={group.chekiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-star-white text-xs font-bold transition border border-white/10 flex items-center gap-1.5"
              >
                <span>📸</span>
                <span>{locale === 'ko' ? '체키/공식 스토어' : 'チェキ・通販'}</span>
              </a>
            )}

            {group.scheduleUrl && (
              <a
                href={group.scheduleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-star-white text-xs font-bold transition border border-white/10 flex items-center gap-1.5"
              >
                <span>📅</span>
                <span>{locale === 'ko' ? '라이브 일정' : 'スケジュール'}</span>
              </a>
            )}

            {group.x && (
              <a
                href={group.x}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-star-dim hover:text-star-white text-xs font-bold transition"
                title="X (Twitter)"
              >
                𝕏
              </a>
            )}
            {group.instagram && (
              <a
                href={group.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-star-dim hover:text-star-white text-xs transition"
                title="Instagram"
              >
                📷
              </a>
            )}
            {group.tiktok && (
              <a
                href={group.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-star-dim hover:text-star-white text-xs transition"
                title="TikTok"
              >
                🎵
              </a>
            )}
            {group.youtube && (
              <a
                href={group.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-star-dim hover:text-star-white text-xs transition"
                title="YouTube"
              >
                ▶️
              </a>
            )}
          </div>
        </section>

        {/* Member Cards Grid (Click goes directly to /m/[memberId]) */}
        <section className="mb-14">
          <div className="flex items-center justify-between pb-3 mb-6 border-b border-white/10">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-star-white font-[family-name:var(--font-klee-one)]">
                {locale === 'ko' ? '소속 멤버 목록' : locale === 'ja' ? '所属メンバー一覧' : 'Members'}
              </h2>
              <p className="text-xs text-star-dim mt-0.5">
                {locale === 'ko' ? '멤버 카드를 클릭하면 상세 SNS 및 공식 링크를 확인할 수 있습니다.' : 'メンバーを選択して詳細SNSリンクを確認'}
              </p>
            </div>
            <span className="text-xs text-star-dim font-mono">
              {group.members.length} Members
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {group.members.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                group={group}
                locale={locale}
              />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
