import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'data/erp_database.sqlite');
console.log('Conectando a base de datos:', dbPath);
const db = new Database(dbPath);

// 1. Eliminar toppings antiguos u obsoletos que duplican la bola de helado
console.log('Eliminando toppings obsoletos o duplicados...');
db.prepare("DELETE FROM toppings_master WHERE id IN ('top-helado-vainilla', 'top-bola-helado-70ml') OR name LIKE '%(70ml)%'").run();

// Asegurar que el topping maestro oficial sea + Bola de Helado con variantes activas
const officialTopping = {
  id: 'top-bola-helado',
  name: '+ Bola de Helado',
  category: 'helados',
  linkedItemType: 'insumo',
  ingredientId: 'ing-base-helado-vainilla',
  portionQuantity: 0.07,
  portionUnit: 'L',
  defaultPriceDelta: 3.00,
  isActive: true,
  hasVariants: true,
  variantCategory: 'helados'
};

db.prepare(`
  INSERT OR REPLACE INTO toppings_master 
  (id, name, category, price, cost, data, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
`).run(
  officialTopping.id,
  officialTopping.name,
  officialTopping.category,
  officialTopping.defaultPriceDelta,
  0,
  JSON.stringify(officialTopping)
);

// 2. Limpiar recetas en menu_config
const menuRow = db.prepare("SELECT data FROM menu_config WHERE id = 'default'").get() as { data: string } | undefined;
if (menuRow) {
  const menuConfig = JSON.parse(menuRow.data);
  let changed = false;

  menuConfig.lines.forEach((line: any) => {
    line.categories.forEach((cat: any) => {
      cat.products.forEach((prod: any) => {
        if (prod.quickModifiers && prod.quickModifiers.length > 0) {
          let seenIceCream = false;
          const origLen = prod.quickModifiers.length;
          prod.quickModifiers = prod.quickModifiers.filter((m: any) => {
            const isIceCream = m.id === 'mod-top-helado' || 
                               m.id === 'top-helado-vainilla' ||
                               m.toppingMasterId === 'top-bola-helado' ||
                               m.toppingMasterId === 'top-helado-vainilla' ||
                               m.label.toLowerCase().includes('bola de helado');
            if (isIceCream) {
              if (seenIceCream) return false; // eliminar duplicado
              seenIceCream = true;
              m.id = 'mod-top-helado';
              m.label = '+ Bola de Helado';
              m.priceDelta = 3.00;
              m.toppingMasterId = 'top-bola-helado';
              m.hasVariants = true;
              m.variantCategory = 'helados';
              m.quantity = 0.07;
              m.unit = 'L';
              m.ingredientId = 'ing-base-helado-vainilla';
              return true;
            }
            return true;
          });
          if (prod.quickModifiers.length !== origLen) {
            changed = true;
            console.log(`Producto ${prod.sku} (${prod.name}) limpiado de modificadores duplicados.`);
          }
        }
      });
    });
  });

  if (changed) {
    db.prepare("UPDATE menu_config SET data = ? WHERE id = 'default'").run(JSON.stringify(menuConfig));
    console.log('menu_config actualizado con recetas desduplicadas.');
  }
}

// 3. Mostrar lista final de toppings
const finalToppings = db.prepare('SELECT id, name, category FROM toppings_master').all();
console.log('Toppings finales en BD:', finalToppings);

db.close();
console.log('¡Proceso finalizado exitosamente!');
