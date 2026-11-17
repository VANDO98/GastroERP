import { db } from '../server/db/database.js';
import fs from 'fs';
import path from 'path';

const menuRow = db.prepare("SELECT data FROM menu_config WHERE id = 'current'").get() as any;
if (menuRow) {
  const menu = JSON.parse(menuRow.data);
  const content = `import type { MenuConfig } from '../types';\n\nexport const initialMenuConfig: MenuConfig = ${JSON.stringify(menu, null, 2)};\n`;
  fs.writeFileSync(path.resolve('src/data/menuConfig.ts'), content, 'utf-8');
  console.log('✓ src/data/menuConfig.ts sincronizado con SQLite.');
}
