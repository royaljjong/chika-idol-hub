import * as fs from 'fs';
import * as path from 'path';

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const GROUPS_DIR = path.join(PUBLIC_DIR, 'images', 'groups');
const MEMBERS_DIR = path.join(PUBLIC_DIR, 'images', 'members');

if (!fs.existsSync(GROUPS_DIR)) fs.mkdirSync(GROUPS_DIR, { recursive: true });
if (!fs.existsSync(MEMBERS_DIR)) fs.mkdirSync(MEMBERS_DIR, { recursive: true });

interface GroupAssetDef {
  id: string;
  name: string;
  sub: string;
  bg1: string;
  bg2: string;
  accent: string;
  symbol: string;
}

const GROUPS: GroupAssetDef[] = [
  {
    id: 'kawaii-lab',
    name: 'KAWAII LAB.',
    sub: 'FRUITS ZIPPER • CANDY TUNE • SWEET STEADY • CUTIE STREET',
    bg1: '#FF2E7E',
    bg2: '#7928CA',
    accent: '#FFD6E5',
    symbol: '🎀',
  },
  {
    id: 'heroines',
    name: 'HEROINES',
    sub: 'iLiFE! • Appare! • 夜光性アミューズ • Jams Collection',
    bg1: '#FF007A',
    bg2: '#4A00E0',
    accent: '#FFE5F1',
    symbol: '💖',
  },
  {
    id: 'wack',
    name: 'WACK',
    sub: 'GANG PARADE • ASP • ExWHYZ • BiS',
    bg1: '#111827',
    bg2: '#E6FF00',
    accent: '#FACC15',
    symbol: '⚡',
  },
  {
    id: 'dearstage',
    name: 'DEARSTAGE',
    sub: 'でんぱ組.inc • 虹のコンキスタドール • ディアステージ',
    bg1: '#00C6FF',
    bg2: '#0072FF',
    accent: '#E0F7FA',
    symbol: '⚡',
  },
  {
    id: 'kansai-idols',
    name: 'KANSAI IDOLS',
    sub: 'カラフルスクリーム • KRD8 • 大阪・難波・心斎橋',
    bg1: '#10B981',
    bg2: '#047857',
    accent: '#D1FAE5',
    symbol: '🐙',
  },
  {
    id: 'regional-idols',
    name: 'REGIONAL IDOLS',
    sub: 'タイトル未定(札幌) • 手羽先(名古屋) • LinQ(福岡)',
    bg1: '#0EA5E9',
    bg2: '#6366F1',
    accent: '#E0F2FE',
    symbol: '❄️',
  },
];

interface MemberAssetDef {
  id: string;
  nameJa: string;
  nameKo: string;
  color: string;
  groupName: string;
}

const MEMBERS: MemberAssetDef[] = [
  // FRUITS ZIPPER
  { id: 'fz-matsumoto-karen', nameJa: '松本かれん', nameKo: '마츠모토 카렌', color: '#FFA7C4', groupName: 'FRUITS ZIPPER' },
  { id: 'fz-sakurai-yui', nameJa: '櫻井優衣', nameKo: '사쿠라이 유이', color: '#72D792', groupName: 'FRUITS ZIPPER' },
  { id: 'fz-chinzei-suzuka', nameJa: '鎮西寿々歌', nameKo: '친제이 스즈카', color: '#FF9E40', groupName: 'FRUITS ZIPPER' },
  { id: 'fz-tsukiashi-amane', nameJa: '月足天音', nameKo: '츠키아시 아마네', color: '#E63946', groupName: 'FRUITS ZIPPER' },
  { id: 'fz-manaka-mana', nameJa: '真中まな', nameKo: '마나카 마나', color: '#457B9D', groupName: 'FRUITS ZIPPER' },
  { id: 'fz-hayase-noel', nameJa: '早瀬ノエル', nameKo: '하야세 노엘', color: '#F4E409', groupName: 'FRUITS ZIPPER' },
  { id: 'fz-nakagawa-runa', nameJa: '仲川瑠夏', nameKo: '나카가와 루나', color: '#9D4EDD', groupName: 'FRUITS ZIPPER' },
  // CANDY TUNE
  { id: 'ct-murakawa-bibian', nameJa: '村川緋杏', nameKo: '무라카와 비비안', color: '#FF69B4', groupName: 'CANDY TUNE' },
  { id: 'ct-kano-nanako', nameJa: '小川奈々子', nameKo: '오가와 나나코', color: '#4169E1', groupName: 'CANDY TUNE' },
  // iLiFE!
  { id: 'ilife-shinzome-riri', nameJa: '心花りり', nameKo: '신조메 리리', color: '#E60033', groupName: 'iLiFE!' },
  { id: 'ilife-aisu', nameJa: 'あいす', nameKo: '아이스', color: '#B0E0E6', groupName: 'iLiFE!' },
  { id: 'ilife-minase-ramu', nameJa: '水瀬らむ', nameKo: '미나세 라무', color: '#4169E1', groupName: 'iLiFE!' },
  { id: 'ilife-wakaba-noa', nameJa: '若葉のあ', nameKo: '와카바 노아', color: '#32CD32', groupName: 'iLiFE!' },
  // Appare!
  { id: 'appare-asahina-rei', nameJa: '朝比奈れい', nameKo: '아사히나 레이', color: '#E60012', groupName: 'Appare!' },
  { id: 'appare-fujimiya-may', nameJa: '藤宮めい', nameKo: '후지미야 메이', color: '#FFFFFF', groupName: 'Appare!' },
  // WACK
  { id: 'gp-yumeno-yua', nameJa: 'ユメノユア', nameKo: '유메노 유아', color: '#E6FF00', groupName: 'GANG PARADE' },
  { id: 'gp-coco-partin', nameJa: 'ココ・パーティン', nameKo: '코코 파틴', color: '#FF4500', groupName: 'GANG PARADE' },
  // DEARSTAGE
  { id: 'dempa-furukawa-mirin', nameJa: '古川未鈴', nameKo: '후루카와 미린', color: '#E60012', groupName: 'でんぱ組.inc' },
  { id: 'dempa-aizawa-risa', nameJa: '相沢梨紗', nameKo: '아이자와 리사', color: '#FFFFFF', groupName: 'でんぱ組.inc' },
  // KANSAI
  { id: 'karasuku-nako', nameJa: 'なこ', nameKo: '나코', color: '#FF69B4', groupName: 'カラフルスクリーム' },
  // REGIONAL
  { id: 'mitei-abe-hana', nameJa: '阿部葉菜', nameKo: '아베 하나', color: '#FFD700', groupName: 'タイトル未定' },
  { id: 'linq-takaki-yuumi', nameJa: '高木悠未', nameKo: '타카키 유우미', color: '#E60012', groupName: 'LinQ' },
];

function generateGroupSvg(g: GroupAssetDef): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${g.bg1}" />
      <stop offset="100%" stop-color="${g.bg2}" />
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${g.accent}" stop-opacity="0.35" />
      <stop offset="100%" stop-color="${g.accent}" stop-opacity="0" />
    </radialGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000" flood-opacity="0.5" />
    </filter>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)" />
  <circle cx="950" cy="200" r="400" fill="url(#glow)" />
  <circle cx="250" cy="500" r="350" fill="url(#glow)" />

  <!-- Stars Particles -->
  <g fill="#FFF" opacity="0.6">
    <circle cx="120" cy="80" r="2" />
    <circle cx="280" cy="140" r="3" />
    <circle cx="450" cy="90" r="2" />
    <circle cx="780" cy="120" r="2.5" />
    <circle cx="920" cy="70" r="3" />
    <circle cx="1100" cy="150" r="2" />
    <circle cx="150" cy="400" r="2.5" />
    <circle cx="340" cy="520" r="2" />
    <circle cx="850" cy="480" r="3" />
    <circle cx="1050" cy="530" r="2" />
  </g>

  <!-- Central Emblem Card -->
  <rect x="80" y="80" width="1040" height="470" rx="36" fill="rgba(7, 9, 15, 0.45)" stroke="rgba(255,255,255,0.2)" stroke-width="2" filter="url(#shadow)" backdrop-filter="blur(20px)" />

  <text x="600" y="240" font-size="100" text-anchor="middle">${g.symbol}</text>

  <text x="600" y="340" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="64" fill="#FFFFFF" text-anchor="middle" letter-spacing="4" filter="url(#shadow)">
    ${g.name}
  </text>

  <text x="600" y="410" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="600" font-size="24" fill="${g.accent}" text-anchor="middle" letter-spacing="2">
    ${g.sub}
  </text>
  
  <text x="600" y="460" font-family="monospace" font-weight="bold" font-size="16" fill="rgba(255,255,255,0.7)" text-anchor="middle" letter-spacing="4">
    OFFICIAL ARTIST HUB • CHIKA IDOL DIRECTORY
  </text>
</svg>`;
}

function generateMemberSvg(m: MemberAssetDef): string {
  const isLight = m.color === '#FFFFFF' || m.color === '#F4E409' || m.color === '#FFD700' || m.color === '#B0E0E6';
  const textColor = isLight ? '#111827' : '#FFFFFF';
  const initial = m.nameJa[0] || '★';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <radialGradient id="grad" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="${m.color}" />
      <stop offset="100%" stop-color="#0B0F19" />
    </radialGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#000" flood-opacity="0.6" />
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="500" height="500" fill="#07090F" />
  <circle cx="250" cy="220" r="170" fill="${m.color}" opacity="0.3" filter="blur(30px)" />
  <circle cx="250" cy="220" r="140" fill="url(#grad)" stroke="${m.color}" stroke-width="4" filter="url(#shadow)" />

  <!-- Center Initial Kanji -->
  <text x="250" y="270" font-family="'Klee One', 'Yu Mincho', serif" font-weight="900" font-size="130" fill="${textColor}" text-anchor="middle" filter="url(#shadow)">
    ${initial}
  </text>

  <!-- Member Label Pill -->
  <rect x="80" y="380" width="340" height="74" rx="24" fill="rgba(15, 23, 42, 0.85)" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" filter="url(#shadow)" />

  <text x="250" y="415" font-family="'Klee One', 'Gowun Batang', sans-serif" font-weight="bold" font-size="22" fill="#FFFFFF" text-anchor="middle">
    ${m.nameJa} (${m.nameKo})
  </text>

  <text x="250" y="440" font-family="monospace" font-weight="600" font-size="13" fill="${m.color}" text-anchor="middle">
    ${m.groupName}
  </text>
</svg>`;
}

function run() {
  console.log('🖼️ Generating Group Visual Banners...');
  for (const g of GROUPS) {
    const filePath = path.join(GROUPS_DIR, `${g.id}.svg`);
    fs.writeFileSync(filePath, generateGroupSvg(g), 'utf-8');
    console.log(`  ✓ Created ${g.id}.svg`);
  }

  console.log('👤 Generating Member Portrait Visuals...');
  for (const m of MEMBERS) {
    const filePath = path.join(MEMBERS_DIR, `${m.id}.svg`);
    fs.writeFileSync(filePath, generateMemberSvg(m), 'utf-8');
    console.log(`  ✓ Created ${m.id}.svg`);
  }

  console.log('✨ All 100% Reliable Local Image Assets Created!');
}

run();
