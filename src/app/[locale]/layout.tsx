import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { Analytics } from '@vercel/analytics/next';
import { routing } from '@/i18n/routing';
import { StarlightCanvas } from '@/components/background/StarlightCanvas';
import 'maplibre-gl/dist/maplibre-gl.css';
import '../globals.css';

export const metadata: Metadata = {
  title: 'CHIKA IDOL HUB | 地下アイドル・ライブアイドル リンクハブ',
  description: '일본 전국(도쿄 시부야·하라주쿠·아키하바라·신주쿠, 오사카, 삿포로, 나고야, 후쿠오카) 지하아이돌・라이브아이돌 공식 링크 및 티켓팅 맵 허브',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!routing.locales.some((supportedLocale) => supportedLocale === locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className="dark">
      <body className="bg-[#07090F] text-[#F4F7FB] antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="relative min-h-screen flex flex-col justify-between selection:bg-pink-500/30 selection:text-pink-200">
            <StarlightCanvas />
            {children}
            <Analytics />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
