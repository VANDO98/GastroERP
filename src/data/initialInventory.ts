import type { Ingredient } from '../types';

export const initialIngredients: Ingredient[] = [
  // ================= 1. INSUMOS DE ALIMENTOS (Frutas, Lácteos, Proteínas, Abarrotes, Bases) =================
  {
    id: 'ing-papaya',
    code: 'FRU-001',
    name: 'Papaya Selva Especial',
    itemType: 'insumo',
    category: 'frutas',
    unit: 'kg',
    stock: 25.0,
    minStock: 5.0,
    costPerUnit: 3.20,
    isTaxAffected: false, // Fruta fresca inafecta
    batches: [
      { id: 'batch-papaya-1', date: '2026-11-08T09:00:00Z', initialQty: 10.0, remainingQty: 10.0, unitCost: 3.50 },
      { id: 'batch-papaya-2', date: '2026-11-10T10:00:00Z', initialQty: 15.0, remainingQty: 15.0, unitCost: 3.00 }
    ]
  },
  {
    id: 'ing-fresa',
    code: 'FRU-002',
    name: 'Fresas Huacho Seleccionadas',
    itemType: 'insumo',
    category: 'frutas',
    unit: 'kg',
    stock: 12.0,
    minStock: 3.0,
    costPerUnit: 7.50,
    isTaxAffected: false,
    batches: [
      { id: 'batch-fresa-1', date: '2026-11-09T08:00:00Z', initialQty: 12.0, remainingQty: 12.0, unitCost: 7.50 }
    ]
  },
  {
    id: 'ing-pina',
    code: 'FRU-003',
    name: 'Piña Golden Junín',
    itemType: 'insumo',
    category: 'frutas',
    unit: 'kg',
    stock: 18.0,
    minStock: 4.0,
    costPerUnit: 3.40,
    isTaxAffected: false,
    batches: [
      { id: 'batch-pina-1', date: '2026-11-09T08:00:00Z', initialQty: 18.0, remainingQty: 18.0, unitCost: 3.40 }
    ]
  },
  {
    id: 'ing-platano',
    code: 'FRU-004',
    name: 'Plátano de Seda de Tingo María',
    itemType: 'insumo',
    category: 'frutas',
    unit: 'kg',
    stock: 14.0,
    minStock: 4.0,
    costPerUnit: 2.80,
    isTaxAffected: false,
    batches: [
      { id: 'batch-platano-1', date: '2026-11-09T08:00:00Z', initialQty: 14.0, remainingQty: 14.0, unitCost: 2.80 }
    ]
  },
  {
    id: 'ing-mango',
    code: 'FRU-005',
    name: 'Mango Kent Dulce',
    itemType: 'insumo',
    category: 'frutas',
    unit: 'kg',
    stock: 8.0,
    minStock: 2.5,
    costPerUnit: 8.50,
    isTaxAffected: false,
    batches: [
      { id: 'batch-mango-1', date: '2026-11-10T08:00:00Z', initialQty: 8.0, remainingQty: 8.0, unitCost: 8.50 }
    ]
  },
  {
    id: 'ing-pulpa-mixta',
    code: 'SUB-001',
    name: 'Pulpa Congelada Surtida (Rescate)',
    itemType: 'subreceta',
    category: 'jarabes_bases',
    unit: 'kg',
    stock: 6.0,
    minStock: 1.5,
    costPerUnit: 3.10,
    isTaxAffected: false,
    isIntermediateRecipe: true,
    batches: [
      { id: 'batch-pulpa-1', date: '2026-11-09T18:00:00Z', initialQty: 6.0, remainingQty: 6.0, unitCost: 3.10 }
    ]
  },
  {
    id: 'ing-pulpa-papaya',
    code: 'SUB-005',
    name: 'Pulpa Congelada de Papaya (Rescate)',
    itemType: 'subreceta',
    category: 'jarabes_bases',
    unit: 'kg',
    stock: 3.0,
    minStock: 1.0,
    costPerUnit: 3.20,
    isTaxAffected: false,
    isIntermediateRecipe: true,
    batches: [
      { id: 'batch-pulpa-papaya-1', date: '2026-11-09T18:00:00Z', initialQty: 3.0, remainingQty: 3.0, unitCost: 3.20 }
    ]
  },
  {
    id: 'ing-pulpa-fresa',
    code: 'SUB-006',
    name: 'Pulpa Congelada de Fresa (Rescate)',
    itemType: 'subreceta',
    category: 'jarabes_bases',
    unit: 'kg',
    stock: 2.5,
    minStock: 1.0,
    costPerUnit: 7.50,
    isTaxAffected: false,
    isIntermediateRecipe: true,
    batches: [
      { id: 'batch-pulpa-fresa-1', date: '2026-11-09T18:00:00Z', initialQty: 2.5, remainingQty: 2.5, unitCost: 7.50 }
    ]
  },
  {
    id: 'ing-pulpa-pina',
    code: 'SUB-007',
    name: 'Pulpa Congelada de Piña (Rescate)',
    itemType: 'subreceta',
    category: 'jarabes_bases',
    unit: 'kg',
    stock: 4.0,
    minStock: 1.0,
    costPerUnit: 3.40,
    isTaxAffected: false,
    isIntermediateRecipe: true,
    batches: [
      { id: 'batch-pulpa-pina-1', date: '2026-11-09T18:00:00Z', initialQty: 4.0, remainingQty: 4.0, unitCost: 3.40 }
    ]
  },
  {
    id: 'ing-pulpa-mango',
    code: 'SUB-008',
    name: 'Pulpa Congelada de Mango (Rescate)',
    itemType: 'subreceta',
    category: 'jarabes_bases',
    unit: 'kg',
    stock: 2.0,
    minStock: 1.0,
    costPerUnit: 8.50,
    isTaxAffected: false,
    isIntermediateRecipe: true,
    batches: [
      { id: 'batch-pulpa-mango-1', date: '2026-11-09T18:00:00Z', initialQty: 2.0, remainingQty: 2.0, unitCost: 8.50 }
    ]
  },
  {
    id: 'ing-leche-entera',
    code: 'LAC-001',
    name: 'Leche Fresca Entera Pasteurizada',
    itemType: 'insumo',
    category: 'lacteos',
    unit: 'L',
    stock: 28.0,
    minStock: 6.0,
    costPerUnit: 4.80,
    isTaxAffected: true, // Lácteo procesado afecto a IGV
    batches: [
      { id: 'batch-leche-1', date: '2026-11-10T07:00:00Z', initialQty: 28.0, remainingQty: 28.0, unitCost: 4.80 }
    ]
  },
  {
    id: 'ing-leche-deslact',
    code: 'LAC-002',
    name: 'Leche Deslactosada UHT',
    itemType: 'insumo',
    category: 'lacteos',
    unit: 'L',
    stock: 10.0,
    minStock: 2.0,
    costPerUnit: 5.80,
    isTaxAffected: true,
    batches: [
      { id: 'batch-deslact-1', date: '2026-11-09T07:00:00Z', initialQty: 10.0, remainingQty: 10.0, unitCost: 5.80 }
    ]
  },
  {
    id: 'ing-queso-edam',
    code: 'LAC-003',
    name: 'Queso Edam Tajado Sandwichero',
    itemType: 'insumo',
    category: 'lacteos',
    unit: 'kg',
    stock: 6.0,
    minStock: 1.5,
    costPerUnit: 32.00,
    isTaxAffected: true,
    batches: [
      { id: 'batch-queso-1', date: '2026-11-08T08:00:00Z', initialQty: 6.0, remainingQty: 6.0, unitCost: 32.00 }
    ]
  },
  {
    id: 'ing-pollo-pechuga',
    code: 'PRO-001',
    name: 'Pechuga Pollo Sancochada Deshilachada',
    itemType: 'insumo',
    category: 'proteinas',
    unit: 'kg',
    stock: 7.0,
    minStock: 2.0,
    costPerUnit: 17.50,
    isTaxAffected: true,
    batches: [
      { id: 'batch-pollo-1', date: '2026-11-10T06:00:00Z', initialQty: 7.0, remainingQty: 7.0, unitCost: 17.50 }
    ]
  },
  {
    id: 'ing-jamon-ingles',
    code: 'PRO-002',
    name: 'Jamón Inglés Especial Sandwichero',
    itemType: 'insumo',
    category: 'proteinas',
    unit: 'kg',
    stock: 4.5,
    minStock: 1.0,
    costPerUnit: 24.00,
    isTaxAffected: true,
    batches: [
      { id: 'batch-jamon-1', date: '2026-11-09T08:00:00Z', initialQty: 4.5, remainingQty: 4.5, unitCost: 24.00 }
    ]
  },
  {
    id: 'ing-pan-ciabatta',
    code: 'ABA-001',
    name: 'Pan Ciabatta Artesanal Crujiente',
    itemType: 'insumo',
    category: 'abarrotes',
    unit: 'und',
    stock: 70,
    minStock: 15,
    costPerUnit: 0.50,
    isTaxAffected: true,
    batches: [
      { id: 'batch-pan-1', date: '2026-11-10T06:00:00Z', initialQty: 70, remainingQty: 70, unitCost: 0.50 }
    ]
  },
  {
    id: 'ing-azucar',
    code: 'ABA-002',
    name: 'Azúcar Rubia Doméstica',
    itemType: 'insumo',
    category: 'abarrotes',
    unit: 'kg',
    stock: 30.0,
    minStock: 8.0,
    costPerUnit: 3.90,
    isTaxAffected: true,
    batches: [
      { id: 'batch-azucar-1', date: '2026-11-05T10:00:00Z', initialQty: 30.0, remainingQty: 30.0, unitCost: 3.90 }
    ]
  },
  {
    id: 'ing-masa-waffle',
    code: 'SUB-002',
    name: 'Mix Batido Masa Waffles/Crepes',
    itemType: 'subreceta',
    category: 'jarabes_bases',
    unit: 'L',
    stock: 8.0,
    minStock: 2.0,
    costPerUnit: 7.20,
    isTaxAffected: true,
    isIntermediateRecipe: true,
    batches: [
      { id: 'batch-masa-1', date: '2026-11-10T07:00:00Z', initialQty: 8.0, remainingQty: 8.0, unitCost: 7.20 }
    ]
  },
  {
    id: 'ing-base-helado-vainilla',
    code: 'LAC-004',
    name: 'Base Helado Suave Vainilla',
    itemType: 'insumo',
    category: 'lacteos',
    unit: 'L',
    stock: 12.0,
    minStock: 3.0,
    costPerUnit: 11.50,
    isTaxAffected: true,
    batches: [
      { id: 'batch-helado-1', date: '2026-11-08T10:00:00Z', initialQty: 12.0, remainingQty: 12.0, unitCost: 11.50 }
    ]
  },
  {
    id: 'ing-crema-chantilly',
    code: 'LAC-005',
    name: 'Crema Chantilly Batida para Topping',
    itemType: 'insumo',
    category: 'lacteos',
    unit: 'L',
    stock: 5.0,
    minStock: 1.0,
    costPerUnit: 18.00,
    isTaxAffected: true,
    batches: [
      { id: 'batch-chantilly-1', date: '2026-11-09T08:00:00Z', initialQty: 5.0, remainingQty: 5.0, unitCost: 18.00 }
    ]
  },
  {
    id: 'ing-cafe-espresso',
    code: 'ABA-003',
    name: 'Concentrado Café Espresso Chanchamayo',
    itemType: 'insumo',
    category: 'abarrotes',
    unit: 'L',
    stock: 4.5,
    minStock: 1.0,
    costPerUnit: 22.00,
    isTaxAffected: true,
    batches: [
      { id: 'batch-cafe-1', date: '2026-11-09T08:00:00Z', initialQty: 4.5, remainingQty: 4.5, unitCost: 22.00 }
    ]
  },
  {
    id: 'ing-algarrobina',
    code: 'ABA-004',
    name: 'Algarrobina Pura de Piura',
    itemType: 'insumo',
    category: 'abarrotes',
    unit: 'L',
    stock: 3.0,
    minStock: 1.0,
    costPerUnit: 26.00,
    isTaxAffected: true,
    batches: [
      { id: 'batch-algarro-1', date: '2026-11-08T09:00:00Z', initialQty: 3.0, remainingQty: 3.0, unitCost: 26.00 }
    ]
  },
  {
    id: 'ing-base-moka',
    code: 'ABA-005',
    name: 'Salsa Concentrada Moka Chocolate',
    itemType: 'insumo',
    category: 'abarrotes',
    unit: 'kg',
    stock: 4.0,
    minStock: 1.0,
    costPerUnit: 22.00,
    isTaxAffected: true,
    batches: [
      { id: 'batch-moka-1', date: '2026-11-08T10:00:00Z', initialQty: 4.0, remainingQty: 4.0, unitCost: 22.00 }
    ]
  },
  {
    id: 'ing-aceite-vegetal',
    code: 'ABA-006',
    name: 'Aceite Vegetal para Cocina',
    itemType: 'insumo',
    category: 'abarrotes',
    unit: 'L',
    stock: 12.0,
    minStock: 3.0,
    costPerUnit: 8.50,
    isTaxAffected: true,
    batches: [
      { id: 'batch-aceite-1', date: '2026-11-08T10:00:00Z', initialQty: 12.0, remainingQty: 12.0, unitCost: 8.50 }
    ]
  },
  {
    id: 'ing-harina-trigo',
    code: 'ABA-007',
    name: 'Harina de Trigo Especial Panadería',
    itemType: 'insumo',
    category: 'abarrotes',
    unit: 'kg',
    stock: 20.0,
    minStock: 5.0,
    costPerUnit: 3.80,
    isTaxAffected: true,
    batches: [
      { id: 'batch-harina-1', date: '2026-11-08T10:00:00Z', initialQty: 20.0, remainingQty: 20.0, unitCost: 3.80 }
    ]
  },
  {
    id: 'ing-huevo-fresco',
    code: 'PRO-003',
    name: 'Huevos Frescos de Granja Seleccionados',
    itemType: 'insumo',
    category: 'proteinas',
    unit: 'und',
    stock: 90,
    minStock: 20,
    costPerUnit: 0.60,
    isTaxAffected: true,
    batches: [
      { id: 'batch-huevo-1', date: '2026-11-10T06:00:00Z', initialQty: 90, remainingQty: 90, unitCost: 0.60 }
    ]
  },
  {
    id: 'ing-fudge-chocolate',
    code: 'SUB-003',
    name: 'Fudge Artesanal Juguería',
    itemType: 'subreceta',
    category: 'jarabes_bases',
    unit: 'kg',
    stock: 4.0,
    minStock: 1.0,
    costPerUnit: 15.00,
    isTaxAffected: true,
    isIntermediateRecipe: true,
    batches: [
      { id: 'batch-fudge-1', date: '2026-11-08T12:00:00Z', initialQty: 4.0, remainingQty: 4.0, unitCost: 15.00 }
    ]
  },
  {
    id: 'ing-mayonesa',
    code: 'SUB-004',
    name: 'Mayonesa Casera Juguería',
    itemType: 'subreceta',
    category: 'jarabes_bases',
    unit: 'kg',
    stock: 3.0,
    minStock: 0.8,
    costPerUnit: 12.00,
    isTaxAffected: true,
    isIntermediateRecipe: true,
    batches: [
      { id: 'batch-mayo-1', date: '2026-11-10T06:30:00Z', initialQty: 3.0, remainingQty: 3.0, unitCost: 12.00 }
    ]
  },

  // ================= 2. DESCARTABLES (Empaques y Despacho) =================
  {
    id: 'ing-vaso-domo-16oz',
    code: 'DSC-001',
    name: 'Vaso Pet 16oz + Tapa Domo',
    itemType: 'descartable',
    unit: 'und',
    stock: 280,
    minStock: 50,
    costPerUnit: 0.38,
    isTaxAffected: true,
    batches: [
      { id: 'batch-vaso-1', date: '2026-11-07T11:00:00Z', initialQty: 280, remainingQty: 280, unitCost: 0.38 }
    ]
  },
  {
    id: 'ing-sorbete-kraft',
    code: 'DSC-002',
    name: 'Sorbete Papel Kraft Biodegradable',
    itemType: 'descartable',
    unit: 'und',
    stock: 450,
    minStock: 100,
    costPerUnit: 0.05,
    isTaxAffected: true,
    batches: [
      { id: 'batch-sorbete-1', date: '2026-11-07T11:00:00Z', initialQty: 450, remainingQty: 450, unitCost: 0.05 }
    ]
  },
  {
    id: 'ing-caja-biodegradable',
    code: 'DSC-003',
    name: 'Caja Kraft Sándwich/Waffle',
    itemType: 'descartable',
    unit: 'und',
    stock: 130,
    minStock: 30,
    costPerUnit: 0.45,
    isTaxAffected: true,
    batches: [
      { id: 'batch-caja-1', date: '2026-11-07T11:00:00Z', initialQty: 130, remainingQty: 130, unitCost: 0.45 }
    ]
  },
  {
    id: 'ing-taper-sobras',
    code: 'DSC-004',
    name: 'Táper Descartable para Sobras (Llevar)',
    itemType: 'descartable',
    unit: 'und',
    stock: 90,
    minStock: 25,
    costPerUnit: 0.60,
    isTaxAffected: true,
    batches: [
      { id: 'batch-taper-1', date: '2026-11-07T11:00:00Z', initialQty: 90, remainingQty: 90, unitCost: 0.60 }
    ]
  },
  {
    id: 'ing-bolsa-kraft',
    code: 'DSC-005',
    name: 'Bolsa Delivery Asa Troquelada',
    itemType: 'descartable',
    unit: 'und',
    stock: 180,
    minStock: 40,
    costPerUnit: 0.30,
    isTaxAffected: true,
    batches: [
      { id: 'batch-bolsa-1', date: '2026-11-07T11:00:00Z', initialQty: 180, remainingQty: 180, unitCost: 0.30 }
    ]
  },

  // ================= 3. CONSUMIBLES (Artículos de Limpieza y Operación) =================
  {
    id: 'ing-lejia-5',
    code: 'CON-001',
    name: 'Lejía Desinfectante 5% Cloro Activo',
    itemType: 'consumible',
    unit: 'L',
    stock: 15.0,
    minStock: 4.0,
    costPerUnit: 3.20,
    isTaxAffected: true,
    batches: [
      { id: 'batch-lejia-1', date: '2026-11-06T14:00:00Z', initialQty: 15.0, remainingQty: 15.0, unitCost: 3.20 }
    ]
  },
  {
    id: 'ing-detergente-industrial',
    code: 'CON-002',
    name: 'Detergente Enzimático Lavavajillas',
    itemType: 'consumible',
    unit: 'kg',
    stock: 10.0,
    minStock: 3.0,
    costPerUnit: 8.50,
    isTaxAffected: true,
    batches: [
      { id: 'batch-detergente-1', date: '2026-11-06T14:00:00Z', initialQty: 10.0, remainingQty: 10.0, unitCost: 8.50 }
    ]
  },
  {
    id: 'ing-papel-toalla',
    code: 'CON-003',
    name: 'Bobina Papel Toalla Industrial 200m',
    itemType: 'consumible',
    unit: 'und',
    stock: 8,
    minStock: 2,
    costPerUnit: 14.50,
    isTaxAffected: true,
    batches: [
      { id: 'batch-papel-1', date: '2026-11-06T14:00:00Z', initialQty: 8, remainingQty: 8, unitCost: 14.50 }
    ]
  },
  {
    id: 'ing-bolsa-basura',
    code: 'CON-004',
    name: 'Bolsas Negras Residuos 50L (Paquete x50)',
    itemType: 'consumible',
    unit: 'und',
    stock: 12,
    minStock: 3,
    costPerUnit: 9.80,
    isTaxAffected: true,
    batches: [
      { id: 'batch-bolsa-res-1', date: '2026-11-06T14:00:00Z', initialQty: 12, remainingQty: 12, unitCost: 9.80 }
    ]
  }
];


