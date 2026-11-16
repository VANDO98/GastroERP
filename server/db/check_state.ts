import { db } from './database.js';

console.log('--- DB CHECK ---');
const ingCount = db.prepare('SELECT count(*) as count FROM ingredients').get() as any;
console.log('Ingredients count in DB:', ingCount.count);

const cmc = db.prepare("SELECT * FROM ingredients WHERE name LIKE '%CMC%' OR id LIKE '%cmc%'").all();
console.log('CMC in DB:', cmc);

const subrecetas = db.prepare("SELECT id, name, item_type FROM ingredients WHERE item_type = 'subreceta' OR id LIKE 'SUB%'").all();
console.log('Subrecetas in DB:', subrecetas);

const menuRow = db.prepare("SELECT data FROM menu_config WHERE id = 'current'").get() as any;
if (menuRow) {
  const menu = JSON.parse(menuRow.data);
  console.log('Menu categories:', menu.categories?.map((c: any) => c.name));
  const frappCat = menu.categories?.find((c: any) => c.id === 'frappes' || c.name.toLowerCase().includes('frapp'));
  console.log('Frappes category products:', frappCat?.subcategories?.map((s: any) => ({ sub: s.name, prods: s.products?.map((p: any) => p.name) })));
} else {
  console.log('No menu_config in DB!');
}

