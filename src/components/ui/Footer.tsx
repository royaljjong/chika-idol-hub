import React from 'react';
import { Link } from '@/i18n/routing';

export function Footer() {
  return (
    <footer className="relative z-10 w-full border-t border-white/10 mt-20 py-10 bg-space-950/60 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-star-dim">
        <div className="flex items-center gap-2">
          <span>✨</span>
          <span className="font-semibold text-star-white">CHIKA IDOL HUB</span>
          <span>•</span>
          <span>Japanese Underground & Live Idol Directory</span>
        </div>

        <div className="flex items-center gap-4 text-star-faint">
          <Link href="/about" className="hover:text-star-white transition">
            About & Disclaimer
          </Link>
          <span>•</span>
          <span>Official Links & Verified Sources</span>
        </div>
      </div>
    </footer>
  );
}
