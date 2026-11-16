import { db } from './database.js';
import { initialMenuConfig } from '../../src/data/menuConfig.js';

const newSubs = [
  { id: 'sub-mix-surtido-fresco', code: 'SUB-010', name: 'Pack Mix Surtido Fresco (270g)', item_type: 'subreceta', category: 'jarabes_bases', unit: 'und', stock: 35, min_stock: 10, cost_per_unit: 1.65, is_tax_affected: 0, is_intermediate_recipe: 1 },
  { id: 'sub-porcion-mango-fresco', code: 'SUB-011', name: 'Pack Mango Limpio Porcionado (180g)', item_type: 'subreceta', category: 'jarabes_bases', unit: 'und', stock: 20, min_stock: 5, cost_per_unit: 2.20, is_tax_affected: 0, is_intermediate_recipe: 1 },
  { id: 'sub-porcion-fresa-limpia', code: 'SUB-012', name: 'Pack Fresa Limpia Porcionada (150g)', item_type: 'subreceta', category: 'jarabes_bases', unit: 'und', stock: 25, min_stock: 8, cost_per_unit: 1.35, is_tax_affected: 0, is_intermediate_recipe: 1 },
  { id: 'sub-porcion-papaya-limpia', code: 'SUB-013', name: 'Pack Papaya Limpia Porcionada (200g)', item_type: 'subreceta', category: 'jarabes_bases', unit: 'und', stock: 20, min_stock: 5, cost_per_unit: 0.95, is_tax_affected: 0, is_intermediate_recipe: 1 },
  { id: 'sub-porcion-pina-limpia', code: 'SUB-014', name: 'Pack Piña Limpia Porcionada (180g)', item_type: 'subreceta', category: 'jarabes_bases', unit: 'und', stock: 20, min_stock: 5, cost_per_unit: 1.05, is_tax_affected: 0, is_intermediate_recipe: 1 }
];

const insertIng = db.prepare(`
  INSERT OR REPLACE INTO ingredients 
  (id, code, name, item_type, category, unit, stock, min_stock, cost_per_unit, is_tax_affected, batches, is_intermediate_recipe)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

newSubs.forEach(s => {
  const batch = [{ id: 'batch-' + s.id + '-init', date: new Date().toISOString(), initialQty: s.stock, remainingQty: s.stock, unitCost: s.cost_per_unit }];
  insertIng.run(s.id, s.code, s.name, s.item_type, s.category, s.unit, s.stock, s.min_stock, s.cost_per_unit, s.is_tax_affected, JSON.stringify(batch), s.is_intermediate_recipe);
});

db.prepare('INSERT OR REPLACE INTO menu_config (id, data, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)').run(
  'current',
  JSON.stringify(initialMenuConfig)
);

console.log('Semielaborados y menu_config actualizados con exito en SQLite.');

