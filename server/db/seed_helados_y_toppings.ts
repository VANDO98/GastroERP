import { db } from './database.js';

console.log('Iniciando migración y poblado de helados, slots dinámicos y toppings polimórficos...');

// 1. INSUMOS DE HELADOS Y DESCARTABLES
const iceCreamIngredients = [
  {
    id: 'ing-base-helado-vainilla',
    code: 'LAC-004',
    name: 'Helado Vainilla Clásica',
    item_type: 'insumo',
    category: 'lacteos',
    unit: 'L',
    stock: 10.0,
    min_stock: 3.0,
    cost_per_unit: 11.00,
    is_tax_affected: 1
  },
  {
    id: 'ing-helado-chocolate',
    code: 'LAC-020',
    name: 'Helado Chocolate Intenso',
    item_type: 'insumo',
    category: 'lacteos',
    unit: 'L',
    stock: 10.0,
    min_stock: 3.0,
    cost_per_unit: 11.00,
    is_tax_affected: 1
  },
  {
    id: 'ing-helado-fresa',
    code: 'LAC-021',
    name: 'Helado Fresa Cremosa',
    item_type: 'insumo',
    category: 'lacteos',
    unit: 'L',
    stock: 10.0,
    min_stock: 3.0,
    cost_per_unit: 11.00,
    is_tax_affected: 1
  },
  {
    id: 'ing-helado-lucuma',
    code: 'LAC-022',
    name: 'Helado Lúcuma Andina',
    item_type: 'insumo',
    category: 'lacteos',
    unit: 'L',
    stock: 10.0,
    min_stock: 3.0,
    cost_per_unit: 11.00,
    is_tax_affected: 1
  },
  {
    id: 'ing-helado-mango',
    code: 'LAC-023',
    name: 'Helado Mango Cremoso',
    item_type: 'insumo',
    category: 'lacteos',
    unit: 'L',
    stock: 10.0,
    min_stock: 3.0,
    cost_per_unit: 11.00,
    is_tax_affected: 1
  },
  {
    id: 'ing-helado-maracuya',
    code: 'LAC-024',
    name: 'Helado Maracuyá Tropical',
    item_type: 'insumo',
    category: 'lacteos',
    unit: 'L',
    stock: 10.0,
    min_stock: 3.0,
    cost_per_unit: 11.00,
    is_tax_affected: 1
  },
  {
    id: 'ing-cono-barquillo',
    code: 'DES-015',
    name: 'Barquillo Dulce para Helado',
    item_type: 'descartable',
    category: 'descartables',
    unit: 'und',
    stock: 100.0,
    min_stock: 25.0,
    cost_per_unit: 0.30,
    is_tax_affected: 1
  },
  {
    id: 'ing-vaso-helado',
    code: 'DES-016',
    name: 'Vasito Polipapel Helado + Cucharita',
    item_type: 'descartable',
    category: 'descartables',
    unit: 'und',
    stock: 100.0,
    min_stock: 25.0,
    cost_per_unit: 0.35,
    is_tax_affected: 1
  }
];

const insertIng = db.prepare(`
  INSERT INTO ingredients 
  (id, code, name, item_type, category, unit, stock, min_stock, cost_per_unit, is_tax_affected, batches, is_intermediate_recipe)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
  ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    cost_per_unit = excluded.cost_per_unit,
    unit = excluded.unit,
    stock = CASE WHEN ingredients.stock <= 0 THEN excluded.stock ELSE ingredients.stock END
`);

iceCreamIngredients.forEach(ing => {
  const batches = JSON.stringify([{
    id: `batch-${ing.id}-init`,
    date: new Date().toISOString(),
    initialQty: ing.stock,
    remainingQty: ing.stock,
    unitCost: ing.cost_per_unit
  }]);

  insertIng.run(
    ing.id,
    ing.code,
    ing.name,
    ing.item_type,
    ing.category,
    ing.unit,
    ing.stock,
    ing.min_stock,
    ing.cost_per_unit,
    ing.is_tax_affected,
    batches
  );
  console.log(`Insumo registrado/actualizado: ${ing.code} - ${ing.name}`);
});

// 2. ACTUALIZAR TOPPING MAESTRO DE HELADO (POLIMÓRFICO CON SABORES)
const iceCreamAllowedIds = [
  'ing-base-helado-vainilla',
  'ing-helado-chocolate',
  'ing-helado-fresa',
  'ing-helado-lucuma',
  'ing-helado-mango',
  'ing-helado-maracuya'
];

const iceCreamToppingData = {
  id: 'top-helado-vainilla',
  name: 'Bola de Helado (70ml)',
  linkedItemType: 'insumo',
  ingredientId: 'ing-base-helado-vainilla',
  portionQuantity: 0.07,
  portionUnit: 'L',
  defaultPriceDelta: 3.0,
  isActive: true,
  hasVariants: true,
  variantCategory: 'lacteos',
  allowedIngredientIds: iceCreamAllowedIds
};

db.prepare(`
  INSERT INTO toppings_master (id, name, category, price, cost, data, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    price = excluded.price,
    cost = excluded.cost,
    data = excluded.data,
    updated_at = CURRENT_TIMESTAMP
`).run(
  iceCreamToppingData.id,
  iceCreamToppingData.name,
  'lacteos',
  iceCreamToppingData.defaultPriceDelta,
  0.77,
  JSON.stringify(iceCreamToppingData)
);
console.log('Topping Maestro de Helado configurado como polimórfico con variantes de sabor.');

// 3. ACTUALIZAR O INSERTAR RECETAS EN MENU_CONFIG
const menuRow = db.prepare('SELECT data FROM menu_config LIMIT 1').get() as { data: string } | undefined;
if (menuRow) {
  const menuConfig = JSON.parse(menuRow.data);
  let heladosCat = null as any;

  // Buscar categoría de helados
  menuConfig.lines.forEach((line: any) => {
    line.categories.forEach((cat: any) => {
      if (cat.id === 'cat-helados' || cat.name.toLowerCase().includes('helado')) {
        heladosCat = cat;
      }
    });
  });

  if (heladosCat) {
    // Definición de las nuevas recetas de helados solos y Banana Split
    const newIceCreamProducts = [
      {
        id: 'prod-copa-helada',
        sku: 'HEL-01',
        name: 'Copa Artesanal Vainilla & Fresa',
        shortName: 'Copa Helada',
        description: 'Helado cremoso con fresas Huacho picadas al momento y fudge',
        price: 11.5,
        targetCost: 3.15,
        recipeType: 'final',
        isActive: true,
        ui: {
          color: 'indigo',
          bgClass: 'bg-indigo-500/20 hover:bg-indigo-500/30',
          borderClass: 'border-indigo-500/40',
          textClass: 'text-indigo-100',
          badgeClass: 'bg-indigo-500/20 text-indigo-300'
        },
        quickModifiers: [
          {
            id: 'm-extra-fudge',
            label: '+ Fudge Casero',
            priceDelta: 1,
            toppingMasterId: 'top-fudge',
            ingredientId: 'ing-fudge-chocolate',
            quantity: 0.025,
            unit: 'kg'
          },
          {
            id: 'm-bola-extra',
            label: '+ Bola Extra Helado',
            priceDelta: 3,
            toppingMasterId: 'top-helado-vainilla',
            ingredientId: 'ing-base-helado-vainilla',
            quantity: 0.07,
            unit: 'L',
            hasVariants: true,
            allowedIngredientIds: iceCreamAllowedIds
          }
        ],
        recipeBom: [
          { ingredientId: 'ing-base-helado-vainilla', quantity: 0.16, unit: 'L' },
          { ingredientId: 'ing-fresa', quantity: 0.06, unit: 'kg' },
          { ingredientId: 'ing-fudge-chocolate', quantity: 0.03, unit: 'kg' },
          { ingredientId: 'ing-vaso-domo-16oz', quantity: 1, unit: 'und' }
        ]
      },
      {
        id: 'prod-helado-simple',
        sku: 'HEL-02',
        name: 'Helado Simple (1 Bola)',
        shortName: 'Helado Simple',
        description: '1 bola generosa de helado artesanal a elección (70ml) en barquillo o vasito',
        price: 5.0,
        targetCost: 1.09,
        recipeType: 'final',
        isActive: true,
        ui: {
          color: 'cyan',
          bgClass: 'bg-cyan-500/20 hover:bg-cyan-500/30',
          borderClass: 'border-cyan-500/40',
          textClass: 'text-cyan-100',
          badgeClass: 'bg-cyan-500/20 text-cyan-300'
        },
        flavorSlots: [
          {
            slotIndex: 1,
            label: 'Sabor de Helado',
            category: 'lacteos',
            allowedIngredientIds: iceCreamAllowedIds,
            quantity: 0.07,
            unit: 'L',
            required: true
          }
        ],
        servingOptions: [
          { id: 'srv-cono', name: 'En Cono Barquillo', ingredientId: 'ing-cono-barquillo', priceDelta: 0 },
          { id: 'srv-vaso', name: 'En Vasito + Cucharita', ingredientId: 'ing-vaso-helado', priceDelta: 0 }
        ],
        quickModifiers: [
          {
            id: 'm-extra-fudge',
            label: '+ Fudge Casero',
            priceDelta: 1,
            toppingMasterId: 'top-fudge',
            ingredientId: 'ing-fudge-chocolate',
            quantity: 0.025,
            unit: 'kg'
          },
          {
            id: 'm-chantilly',
            label: '+ Corona Chantilly',
            priceDelta: 1.5,
            toppingMasterId: 'top-chantilly',
            ingredientId: 'ing-crema-chantilly',
            quantity: 0.03,
            unit: 'kg'
          }
        ],
        recipeBom: []
      },
      {
        id: 'prod-helado-doble',
        sku: 'HEL-03',
        name: 'Helado Doble (2 Bolas)',
        shortName: 'Helado Doble',
        description: '2 bolas de helado artesanal combinables a elección (140ml) en barquillo o vasito',
        price: 9.0,
        targetCost: 1.86,
        recipeType: 'final',
        isActive: true,
        ui: {
          color: 'amber',
          bgClass: 'bg-amber-500/20 hover:bg-amber-500/30',
          borderClass: 'border-amber-500/40',
          textClass: 'text-amber-100',
          badgeClass: 'bg-amber-500/20 text-amber-300'
        },
        flavorSlots: [
          {
            slotIndex: 1,
            label: 'Bola 1',
            category: 'lacteos',
            allowedIngredientIds: iceCreamAllowedIds,
            quantity: 0.07,
            unit: 'L',
            required: true
          },
          {
            slotIndex: 2,
            label: 'Bola 2',
            category: 'lacteos',
            allowedIngredientIds: iceCreamAllowedIds,
            quantity: 0.07,
            unit: 'L',
            required: true
          }
        ],
        servingOptions: [
          { id: 'srv-cono', name: 'En Cono Barquillo', ingredientId: 'ing-cono-barquillo', priceDelta: 0 },
          { id: 'srv-vaso', name: 'En Vasito + Cucharita', ingredientId: 'ing-vaso-helado', priceDelta: 0 }
        ],
        quickModifiers: [
          {
            id: 'm-extra-fudge',
            label: '+ Fudge Casero',
            priceDelta: 1,
            toppingMasterId: 'top-fudge',
            ingredientId: 'ing-fudge-chocolate',
            quantity: 0.025,
            unit: 'kg'
          },
          {
            id: 'm-chantilly',
            label: '+ Corona Chantilly',
            priceDelta: 1.5,
            toppingMasterId: 'top-chantilly',
            ingredientId: 'ing-crema-chantilly',
            quantity: 0.03,
            unit: 'kg'
          }
        ],
        recipeBom: []
      },
      {
        id: 'prod-helado-triple',
        sku: 'HEL-04',
        name: 'Helado Triple (3 Bolas)',
        shortName: 'Helado Triple',
        description: '3 bolas de helado artesanal combinables a elección (210ml) en vasito o cono',
        price: 12.5,
        targetCost: 2.71,
        recipeType: 'final',
        isActive: true,
        ui: {
          color: 'rose',
          bgClass: 'bg-rose-500/20 hover:bg-rose-500/30',
          borderClass: 'border-rose-500/40',
          textClass: 'text-rose-100',
          badgeClass: 'bg-rose-500/20 text-rose-300'
        },
        flavorSlots: [
          {
            slotIndex: 1,
            label: 'Bola 1',
            category: 'lacteos',
            allowedIngredientIds: iceCreamAllowedIds,
            quantity: 0.07,
            unit: 'L',
            required: true
          },
          {
            slotIndex: 2,
            label: 'Bola 2',
            category: 'lacteos',
            allowedIngredientIds: iceCreamAllowedIds,
            quantity: 0.07,
            unit: 'L',
            required: true
          },
          {
            slotIndex: 3,
            label: 'Bola 3',
            category: 'lacteos',
            allowedIngredientIds: iceCreamAllowedIds,
            quantity: 0.07,
            unit: 'L',
            required: true
          }
        ],
        servingOptions: [
          { id: 'srv-vaso', name: 'En Vasito + Cucharita', ingredientId: 'ing-vaso-helado', priceDelta: 0 },
          { id: 'srv-cono', name: 'En Cono Barquillo', ingredientId: 'ing-cono-barquillo', priceDelta: 0 }
        ],
        quickModifiers: [
          {
            id: 'm-extra-fudge',
            label: '+ Fudge Casero',
            priceDelta: 1,
            toppingMasterId: 'top-fudge',
            ingredientId: 'ing-fudge-chocolate',
            quantity: 0.025,
            unit: 'kg'
          },
          {
            id: 'm-chantilly',
            label: '+ Corona Chantilly',
            priceDelta: 1.5,
            toppingMasterId: 'top-chantilly',
            ingredientId: 'ing-crema-chantilly',
            quantity: 0.03,
            unit: 'kg'
          }
        ],
        recipeBom: []
      },
      {
        id: 'prod-banana-split',
        sku: 'HEL-05',
        name: 'Banana Split Clásica Sabor & Fruta',
        shortName: 'Banana Split',
        description: 'Plátano de seda entero con 3 bolas de helado a elección, fudge casero, corona de chantilly y barquillo',
        price: 16.5,
        targetCost: 4.35,
        recipeType: 'final',
        isActive: true,
        ui: {
          color: 'amber',
          bgClass: 'bg-yellow-500/20 hover:bg-yellow-500/30',
          borderClass: 'border-yellow-500/40',
          textClass: 'text-yellow-100',
          badgeClass: 'bg-yellow-500/20 text-yellow-300'
        },
        flavorSlots: [
          {
            slotIndex: 1,
            label: 'Bola 1',
            category: 'lacteos',
            allowedIngredientIds: iceCreamAllowedIds,
            quantity: 0.07,
            unit: 'L',
            required: true
          },
          {
            slotIndex: 2,
            label: 'Bola 2',
            category: 'lacteos',
            allowedIngredientIds: iceCreamAllowedIds,
            quantity: 0.07,
            unit: 'L',
            required: true
          },
          {
            slotIndex: 3,
            label: 'Bola 3',
            category: 'lacteos',
            allowedIngredientIds: iceCreamAllowedIds,
            quantity: 0.07,
            unit: 'L',
            required: true
          }
        ],
        quickModifiers: [
          {
            id: 'm-extra-fudge',
            label: '+ Extra Fudge',
            priceDelta: 1,
            toppingMasterId: 'top-fudge',
            ingredientId: 'ing-fudge-chocolate',
            quantity: 0.025,
            unit: 'kg'
          }
        ],
        recipeBom: [
          { ingredientId: 'ing-platano', quantity: 0.18, unit: 'kg' },
          { ingredientId: 'ing-fudge-chocolate', quantity: 0.03, unit: 'kg' },
          { ingredientId: 'ing-crema-chantilly', quantity: 0.025, unit: 'kg' },
          { ingredientId: 'ing-vaso-domo-16oz', quantity: 1, unit: 'und' }
        ]
      }
    ];

    // Reemplazar o actualizar los productos en la categoría
    heladosCat.products = newIceCreamProducts;
    console.log(`Categoría "${heladosCat.name}" actualizada con 5 recetas de helados y Banana Split.`);

    // Actualizar también en waffles el modificador de helado para que soporte sabores
    menuConfig.lines.forEach((line: any) => {
      line.categories.forEach((cat: any) => {
        cat.products.forEach((prod: any) => {
          prod.quickModifiers?.forEach((mod: any) => {
            if (mod.id === 'm-con-helado' || mod.label.toLowerCase().includes('helado')) {
              mod.hasVariants = true;
              mod.allowedIngredientIds = iceCreamAllowedIds;
              mod.quantity = 0.07;
              mod.unit = 'L';
            }
          });
        });
      });
    });

    db.prepare('UPDATE menu_config SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1').run(JSON.stringify(menuConfig));
    console.log('menu_config actualizado con éxito en la base de datos.');
  }
}

console.log('Migración completada con éxito.');
process.exit(0);

