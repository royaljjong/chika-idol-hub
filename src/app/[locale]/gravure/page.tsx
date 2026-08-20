import { setRequestLocale } from 'next-intl/server';
import { getGravureFeatures } from '@/lib/data';
import { Navigation } from '@/components/ui/Navigation';
import { Footer } from '@/components/ui/Footer';
import { GravureSection } from '@/components/home/GravureSection';

export default async function GravurePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const features = getGravureFeatures();
  const title = locale === 'ko' ? '그라비아·사진집' : locale === 'ja' ? 'グラビア・写真集' : 'Gravure & photobooks';
  const note = locale === 'ko' ? '출판사·소속사·공식 판매처에서 확인된 발매 정보만 제공합니다.' : locale === 'ja' ? '出版社・所属事務所・公式販売元で確認できた情報のみ掲載します。' : 'Only releases verified through publishers, agencies or official stores are listed.';
  return <div className="relative min-h-screen"><Navigation /><main className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6"><p className="text-[10px] font-bold tracking-[.18em] text-pink-400">VERIFIED EDITORIAL</p><h1 className="mt-3 text-3xl font-bold text-star-white">{title}</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-star-dim">{note}</p>{features.length ? <div className="mt-10"><GravureSection gravures={features} locale={locale} /></div> : <div className="mt-10 border-y border-white/10 py-10 text-sm text-star-dim">{locale === 'ko' ? '검증된 항목을 수집 중입니다.' : locale === 'ja' ? '検証済み項目を収集中です。' : 'Verified entries are being collected.'}</div>}</main><Footer /></div>;
}
