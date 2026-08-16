import * as fs from 'fs';
import * as path from 'path';
import { CHIKA_GROUPS_COMPLETE, CHIKA_NOTICES_DATA, CHIKA_GRAVURE_DATA } from './seed-chika-all';

function seed() {
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  fs.writeFileSync(path.join(dataDir, 'chika-groups.json'), JSON.stringify(CHIKA_GROUPS_COMPLETE, null, 2), 'utf-8');
  fs.writeFileSync(path.join(dataDir, 'chika-notices.json'), JSON.stringify(CHIKA_NOTICES_DATA, null, 2), 'utf-8');
  fs.writeFileSync(path.join(dataDir, 'chika-gravure.json'), JSON.stringify(CHIKA_GRAVURE_DATA, null, 2), 'utf-8');

  console.log(`✅ Seeded complete Chika dataset (${CHIKA_GROUPS_COMPLETE.length} groups, ${CHIKA_NOTICES_DATA.length} notices, ${CHIKA_GRAVURE_DATA.length} gravure features)`);
}

seed();
