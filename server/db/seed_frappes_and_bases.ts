import { db } from './database.js';

// 1. INSUMOS NUEVOS PARA PREMEZCLAS, FRAPPÉS Y SMOOTHIES
const newIngredients = [
  // Insumos Secos para Premezclas
  { id: 'ing-crema-no-lactea', code: 'INS-030', name: 'Crema No Láctea en Polvo', item_type: 'insumo', category: 'abarrotes', unit: 'kg', stock: 10.0, min_stock: 2.0, cost_per_unit: 18.00, is_tax_affected: 1 },
  { id: 'ing-leche-polvo', code: 'INS-031', name: 'Leche Entera en Polvo', item_type: 'insumo', category: 'lacteos', unit: 'kg', stock: 12.0, min_stock: 3.0, cost_per_unit: 22.00, is_tax_affected: 1 },
  { id: 'ing-azucar-glass', code: 'INS-032', name: 'Azúcar Glass (Impalpable)', item_type: 'insumo', category: 'abarrotes', unit: 'kg', stock: 10.0, min_stock: 2.5, cost_per_unit: 6.50, is_tax_affected: 1 },
  { id: 'ing-cmc', code: 'INS-033', name: 'CMC Grado Alimenticio (Estabilizante)', item_type: 'insumo', category: 'abarrotes', unit: 'kg', stock: 2.0, min_stock: 0.5, cost_per_unit: 45.00, is_tax_affected: 1 },

  // Premezclas / Subrecetas Base
  { id: 'sub-base-neutra', code: 'SUB-020', name: 'Base Neutra (Frappés Lácteos)', item_type: 'subreceta', category: 'jarabes_bases', unit: 'kg', stock: 5.0, min_stock: 1.0, cost_per_unit: 17.65, is_tax_affected: 0, is_intermediate_recipe: 1 },
  { id: 'sub-base-cristal', code: 'SUB-021', name: 'Base Cristal (Frappés al Agua)', item_type: 'subreceta', category: 'jarabes_bases', unit: 'kg', stock: 8.0, min_stock: 1.5, cost_per_unit: 4.70, is_tax_affected: 0, is_intermediate_recipe: 1 },

  // Insumos Frutales y Congelados
  { id: 'ing-pulpa-maracuya', code: 'CONG-001', name: 'Pulpa de Maracuyá Congelada', item_type: 'insumo', category: 'congelados', unit: 'kg', stock: 8.0, min_stock: 2.0, cost_per_unit: 9.00, is_tax_affected: 0 },
  { id: 'ing-fresa-congelada', code: 'CONG-002', name: 'Fresa Congelada', item_type: 'insumo', category: 'congelados', unit: 'kg', stock: 12.0, min_stock: 3.0, cost_per_unit: 7.50, is_tax_affected: 0 },
  { id: 'ing-mango-congelado', code: 'CONG-003', name: 'Mango en Cubos Congelado', item_type: 'insumo', category: 'congelados', unit: 'kg', stock: 10.0, min_stock: 2.5, cost_per_unit: 8.50, is_tax_affected: 0 },
  { id: 'ing-pina-congelada', code: 'CONG-004', name: 'Piña Congelada en Trozos', item_type: 'insumo', category: 'congelados', unit: 'kg', stock: 10.0, min_stock: 2.5, cost_per_unit: 4.00, is_tax_affected: 0 },
  { id: 'ing-platano-congelado', code: 'CONG-005', name: 'Plátano de Seda Congelado', item_type: 'insumo', category: 'congelados', unit: 'kg', stock: 8.0, min_stock: 2.0, cost_per_unit: 3.00, is_tax_affected: 0 },
  { id: 'ing-arandanos-congelados', code: 'CONG-006', name: 'Arándanos Congelados', item_type: 'insumo', category: 'congelados', unit: 'kg', stock: 5.0, min_stock: 1.5, cost_per_unit: 16.00, is_tax_affected: 0 },
  { id: 'ing-pulpa-lucuma', code: 'CONG-007', name: 'Pulpa de Lúcuma Congelada', item_type: 'insumo', category: 'congelados', unit: 'kg', stock: 6.0, min_stock: 1.5, cost_per_unit: 14.00, is_tax_affected: 0 },
  { id: 'ing-hielo', code: 'CONG-008', name: 'Hielo Industrial en Cubos', item_type: 'insumo', category: 'congelados', unit: 'kg', stock: 40.0, min_stock: 15.0, cost_per_unit: 0.60, is_tax_affected: 1 },

  // Líquidos, Siropes y Abarrotes
  { id: 'ing-agua-bidon', code: 'AB-010', name: 'Agua Purificada de Bidón', item_type: 'insumo', category: 'abarrotes', unit: 'L', stock: 60.0, min_stock: 20.0, cost_per_unit: 0.30, is_tax_affected: 1 },
  { id: 'ing-limon-sutil', code: 'FRU-010', name: 'Limón Sutil Fresco (para jugo)', item_type: 'insumo', category: 'frutas', unit: 'kg', stock: 8.0, min_stock: 2.0, cost_per_unit: 4.50, is_tax_affected: 0 },
  { id: 'ing-sirope-blue-curacao', code: 'SIR-001', name: 'Sirope Blue Curaçao', item_type: 'insumo', category: 'jarabes_bases', unit: 'L', stock: 3.0, min_stock: 1.0, cost_per_unit: 32.00, is_tax_affected: 1 },
  { id: 'ing-hierbabuena', code: 'FRU-011', name: 'Hojas de Hierbabuena / Menta', item_type: 'insumo', category: 'frutas', unit: 'kg', stock: 2.0, min_stock: 0.5, cost_per_unit: 12.00, is_tax_affected: 0 },
  { id: 'ing-jarabe-goma', code: 'SIR-002', name: 'Jarabe de Goma Simple', item_type: 'insumo', category: 'jarabes_bases', unit: 'L', stock: 8.0, min_stock: 2.0, cost_per_unit: 6.50, is_tax_affected: 1 },
  { id: 'ing-concentrado-cafe', code: 'SIR-003', name: 'Concentrado de Café (Cold Brew)', item_type: 'insumo', category: 'jarabes_bases', unit: 'L', stock: 5.0, min_stock: 1.5, cost_per_unit: 12.00, is_tax_affected: 0, is_intermediate_recipe: 1 },
  { id: 'ing-leche-evaporada', code: 'LAC-005', name: 'Leche Evaporada Entera', item_type: 'insumo', category: 'lacteos', unit: 'L', stock: 15.0, min_stock: 4.0, cost_per_unit: 6.80, is_tax_affected: 1 },
  { id: 'ing-manjar-blanco', code: 'PAS-002', name: 'Manjar Blanco Pastelero', item_type: 'insumo', category: 'pasteleria', unit: 'kg', stock: 5.0, min_stock: 1.5, cost_per_unit: 14.00, is_tax_affected: 1 },
  { id: 'ing-galleta-oreo', code: 'AB-015', name: 'Galleta Oreo (Paquete x4)', item_type: 'insumo', category: 'abarrotes', unit: 'kg', stock: 4.0, min_stock: 1.0, cost_per_unit: 25.00, is_tax_affected: 1 },
  { id: 'ing-yogurt-natural', code: 'LAC-006', name: 'Yogurt Natural / Bebible', item_type: 'insumo', category: 'lacteos', unit: 'L', stock: 12.0, min_stock: 3.0, cost_per_unit: 6.50, is_tax_affected: 1 },
  { id: 'ing-leche-coco', code: 'LAC-007', name: 'Leche de Coco Gastronómica', item_type: 'insumo', category: 'lacteos', unit: 'L', stock: 4.0, min_stock: 1.0, cost_per_unit: 9.50, is_tax_affected: 1 }
];

const insertIng = db.prepare(`
  INSERT OR REPLACE INTO ingredients 
  (id, code, name, item_type, category, unit, stock, min_stock, cost_per_unit, is_tax_affected, batches, is_intermediate_recipe)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

newIngredients.forEach(s => {
  const batch = [{
    id: `batch-${s.id}-init`,
    date: new Date().toISOString(),
    initialQty: s.stock,
    remainingQty: s.stock,
    unitCost: s.cost_per_unit
  }];
  insertIng.run(
    s.id,
    s.code,
    s.name,
    s.item_type,
    s.category,
    s.unit,
    s.stock,
    s.min_stock,
    s.cost_per_unit,
    s.is_tax_affected,
    JSON.stringify(batch),
    s.is_intermediate_recipe ? 1 : 0
  );
});

console.log(`✓ ${newIngredients.length} insumos y premezclas insertados en SQLite`);

