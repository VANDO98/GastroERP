import { db } from '../server/db/database.js';

const menuRow = db.prepare("SELECT data FROM menu_config WHERE id = 'current'").get() as any;
const menu = JSON.parse(menuRow.data);

console.log('--- MENU LINES ---');
menu.lines.forEach((l: any) => {
  console.log(`Line: ${l.id} - ${l.name} (${l.categories.length} categories)`);
  l.categories.forEach((c: any) => {
    console.log(`  Cat: ${c.id} - ${c.name} (${c.products.length} products)`);
    c.products.forEach((p: any) => {
      if (p.flavorSlots && p.flavorSlots.length > 0) {
        console.log(`    Prod with slots: ${p.sku} - ${p.name}:`, p.flavorSlots);
      }
      if (p.quickModifiers && p.quickModifiers.some((m: any) => m.hasVariants)) {
        console.log(`    Prod with variant modifiers: ${p.sku} - ${p.name}:`, p.quickModifiers.filter((m: any) => m.hasVariants));
      }
    });
  });
});

console.log('--- INGREDIENTS WITH CATEGORY ---');
const ings = db.prepare('SELECT id, code, name, item_type, category, unit, stock, cost_per_unit FROM ingredients').all();
console.table(ings.slice(0, 15));
