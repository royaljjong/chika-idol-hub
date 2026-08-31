import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import 'maplibre-gl/dist/maplibre-gl.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'CHIKA IDOL HUB | 地下アイドル・ライブアイドル リンクハブ',
  description: '일본 전국(도쿄 시부야·하라주쿠·아키하바라·신주쿠, 오사카, 삿포로, 나고야, 후쿠오카) 지하아이돌・라이브아이돌 공식 링크 및 티켓팅 맵 허브',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="dark">
      <body className="bg-[#07090F] text-[#F4F7FB] antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
