import { db, initDatabase } from '../server/db/database.js';

// Inicializar esquemas y columnas
initDatabase();

console.log('--- INICIANDO LIMPIEZA Y RESEED COMPLETO DE BASE DE DATOS SQLITE ---');

db.transaction(() => {
  // 1. Limpiar comandas de prueba y ventas anteriores
  console.log('1. Limpiando comandas activas y ventas de prueba...');
  db.prepare('DELETE FROM sales_orders').run();
  
  // Resetear todas las mesas a libre
  db.prepare(`
    UPDATE active_tables 
    SET status = 'libre', 
        total = 0, 
        customer_name = '', 
        items = '[]', 
        enable_disposables = 1, 
        manual_disposables = '[]',
        order_id = NULL,
        sent_to_kitchen_at = NULL,
        updated_at = CURRENT_TIMESTAMP
  `).run();

  // 2. Sembrar Categorías de Insumos (con flags de slots de selección)
  console.log('2. Sembrando categorías maestras de insumos...');
  const insertCat = db.prepare(`
    INSERT OR REPLACE INTO ingredient_categories 
    (id, name, label, icon, default_unit, default_qty, is_slot_category, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);

  const initialCategories = [
    { id: 'helados', name: 'helados', label: 'Sabores de Helado', icon: '🍨', default_unit: 'L', default_qty: 0.07, is_slot_category: 1 },
    { id: 'panaderia', name: 'panaderia', label: 'Panadería & Panes', icon: '🥖', default_unit: 'und', default_qty: 1, is_slot_category: 1 },
    { id: 'jarabes_bases', name: 'jarabes_bases', label: 'Jarabes, Salsas & Coberturas', icon: '🍯', default_unit: 'L', default_qty: 0.03, is_slot_category: 1 },
    { id: 'frutas', name: 'frutas', label: 'Frutas Frescas', icon: '🍓', default_unit: 'kg', default_qty: 0.08, is_slot_category: 1 },
    { id: 'lacteos', name: 'lacteos', label: 'Lácteos & Derivados', icon: '🥛', default_unit: 'L', default_qty: 0.15, is_slot_category: 0 },
    { id: 'proteinas', name: 'proteinas', label: 'Proteínas & Fiambres', icon: '🥩', default_unit: 'kg', default_qty: 0.05, is_slot_category: 0 },
    { id: 'abarrotes', name: 'abarrotes', label: 'Abarrotes & Secos', icon: '🌾', default_unit: 'kg', default_qty: 0.05, is_slot_category: 0 },
    { id: 'descartables', name: 'descartables', label: 'Empaques & Descartables', icon: '📦', default_unit: 'und', default_qty: 1, is_slot_category: 0 },
    { id: 'consumibles', name: 'consumibles', label: 'Limpieza & Químicos', icon: '🧼', default_unit: 'und', default_qty: 1, is_slot_category: 0 },
  ];

  initialCategories.forEach(c => {
    insertCat.run(c.id, c.name, c.label, c.icon, c.default_unit, c.default_qty, c.is_slot_category);
  });

  // 3. Sembrar Insumos Limpios con Iconos y Categorías Correctas
  console.log('3. Sembrando insumos, subrecetas y descartables...');
  const insertIng = db.prepare(`
    INSERT OR REPLACE INTO ingredients 
    (id, code, name, item_type, category, icon, unit, stock, min_stock, cost_per_unit, is_tax_affected, batches, is_intermediate_recipe, recipe_id, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);

  const initialIngredients = [
    // Helados (con stock abundante para que ninguno salga agotado)
    { id: 'ing-base-helado-vainilla', code: 'LAC-004', name: 'Helado Vainilla Clásica', item_type: 'insumo', category: 'helados', icon: '🍦', unit: 'L', stock: 15.0, min_stock: 3.0, cost_per_unit: 11.00, is_tax_affected: 1 },
    { id: 'ing-helado-chocolate', code: 'LAC-020', name: 'Helado Chocolate Intenso', item_type: 'insumo', category: 'helados', icon: '🍫', unit: 'L', stock: 15.0, min_stock: 3.0, cost_per_unit: 12.00, is_tax_affected: 1 },
    { id: 'ing-helado-fresa', code: 'LAC-021', name: 'Helado Fresa Cremosa', item_type: 'insumo', category: 'helados', icon: '🍓', unit: 'L', stock: 15.0, min_stock: 3.0, cost_per_unit: 11.50, is_tax_affected: 1 },
    { id: 'ing-helado-lucuma', code: 'LAC-022', name: 'Helado Lúcuma Andina', item_type: 'insumo', category: 'helados', icon: '🍈', unit: 'L', stock: 15.0, min_stock: 3.0, cost_per_unit: 13.00, is_tax_affected: 1 },
    { id: 'ing-helado-mango', code: 'LAC-023', name: 'Helado Mango Cremoso', item_type: 'insumo', category: 'helados', icon: '🥭', unit: 'L', stock: 15.0, min_stock: 3.0, cost_per_unit: 12.00, is_tax_affected: 1 },
    { id: 'ing-helado-maracuya', code: 'LAC-024', name: 'Helado Maracuyá Tropical', item_type: 'insumo', category: 'helados', icon: '🌴', unit: 'L', stock: 15.0, min_stock: 3.0, cost_per_unit: 11.50, is_tax_affected: 1 },
    { id: 'ing-helado-unicornio', code: 'LAC-025', name: 'Helado Unicornio Especial', item_type: 'insumo', category: 'helados', icon: '🦄', unit: 'L', stock: 15.0, min_stock: 3.0, cost_per_unit: 14.00, is_tax_affected: 1 },

    // Panadería
    { id: 'ing-pan-ciabatta', code: 'PAN-001', name: 'Pan Ciabatta Artesanal Crujiente', item_type: 'insumo', category: 'panaderia', icon: '🥖', unit: 'und', stock: 50, min_stock: 15, cost_per_unit: 0.50, is_tax_affected: 1 },
    { id: 'ing-pan-frances', code: 'PAN-002', name: 'Pan Francés Tradicional Crocante', item_type: 'insumo', category: 'panaderia', icon: '🥖', unit: 'und', stock: 60, min_stock: 20, cost_per_unit: 0.40, is_tax_affected: 1 },
    { id: 'ing-pan-molde', code: 'PAN-003', name: 'Pan de Molde Integral con Granos', item_type: 'insumo', category: 'panaderia', icon: '🍞', unit: 'und', stock: 40, min_stock: 10, cost_per_unit: 0.45, is_tax_affected: 1 },
    { id: 'ing-pan-croissant', code: 'PAN-004', name: 'Pan Croissant de Mantequilla', item_type: 'insumo', category: 'panaderia', icon: '🥐', unit: 'und', stock: 30, min_stock: 10, cost_per_unit: 1.20, is_tax_affected: 1 },
    { id: 'ing-pan-brioche', code: 'PAN-005', name: 'Pan Brioche Artesanal Dulce', item_type: 'insumo', category: 'panaderia', icon: '🍞', unit: 'und', stock: 30, min_stock: 10, cost_per_unit: 0.90, is_tax_affected: 1 },

    // Frutas Frescas
    { id: 'ing-papaya', code: 'FRU-001', name: 'Papaya Selva Especial', item_type: 'insumo', category: 'frutas', icon: '🍈', unit: 'kg', stock: 30.0, min_stock: 5.0, cost_per_unit: 3.19, is_tax_affected: 0 },
    { id: 'ing-fresa', code: 'FRU-002', name: 'Fresas Huacho Seleccionadas', item_type: 'insumo', category: 'frutas', icon: '🍓', unit: 'kg', stock: 20.0, min_stock: 4.0, cost_per_unit: 7.50, is_tax_affected: 0 },
    { id: 'ing-pina', code: 'FRU-003', name: 'Piña Golden Junín', item_type: 'insumo', category: 'frutas', icon: '🍍', unit: 'kg', stock: 25.0, min_stock: 5.0, cost_per_unit: 3.40, is_tax_affected: 0 },
    { id: 'ing-platano', code: 'FRU-004', name: 'Plátano de Seda de Tingo María', item_type: 'insumo', category: 'frutas', icon: '🍌', unit: 'kg', stock: 20.0, min_stock: 5.0, cost_per_unit: 2.80, is_tax_affected: 0 },
    { id: 'ing-mango', code: 'FRU-005', name: 'Mango Kent Dulce', item_type: 'insumo', category: 'frutas', icon: '🥭', unit: 'kg', stock: 15.0, min_stock: 3.0, cost_per_unit: 8.50, is_tax_affected: 0 },
    { id: 'ing-maracuya', code: 'FRU-006', name: 'Maracuyá Criollo Aromático', item_type: 'insumo', category: 'frutas', icon: '🌴', unit: 'kg', stock: 12.0, min_stock: 3.0, cost_per_unit: 4.50, is_tax_affected: 0 },
    { id: 'ing-lucuma', code: 'FRU-007', name: 'Lúcuma de Seda Madura', item_type: 'insumo', category: 'frutas', icon: '🍈', unit: 'kg', stock: 10.0, min_stock: 2.0, cost_per_unit: 9.00, is_tax_affected: 0 },

    // Lácteos
    { id: 'ing-leche-entera', code: 'LAC-001', name: 'Leche Fresca Entera Pasteurizada', item_type: 'insumo', category: 'lacteos', icon: '🥛', unit: 'L', stock: 40.0, min_stock: 8.0, cost_per_unit: 4.80, is_tax_affected: 1 },
    { id: 'ing-leche-deslact', code: 'LAC-002', name: 'Leche Deslactosada UHT', item_type: 'insumo', category: 'lacteos', icon: '🥛', unit: 'L', stock: 20.0, min_stock: 4.0, cost_per_unit: 5.80, is_tax_affected: 1 },
    { id: 'ing-queso-edam', code: 'LAC-003', name: 'Queso Edam Tajado Sandwichero', item_type: 'insumo', category: 'lacteos', icon: '🧀', unit: 'kg', stock: 10.0, min_stock: 2.0, cost_per_unit: 32.00, is_tax_affected: 1 },
    { id: 'ing-mantequilla', code: 'LAC-005', name: 'Mantequilla con Sal Pastelería', item_type: 'insumo', category: 'lacteos', icon: '🧈', unit: 'kg', stock: 5.0, min_stock: 1.0, cost_per_unit: 22.00, is_tax_affected: 1 },

    // Proteínas
    { id: 'ing-pollo-pechuga', code: 'PRO-001', name: 'Pechuga Pollo Sancochada Deshilachada', item_type: 'insumo', category: 'proteinas', icon: '🍗', unit: 'kg', stock: 15.0, min_stock: 3.0, cost_per_unit: 17.50, is_tax_affected: 1 },
    { id: 'ing-jamon-ingles', code: 'PRO-002', name: 'Jamón Inglés Especial Sandwichero', item_type: 'insumo', category: 'proteinas', icon: '🥩', unit: 'kg', stock: 8.0, min_stock: 2.0, cost_per_unit: 24.00, is_tax_affected: 1 },

    // Abarrotes y Secos
    { id: 'ing-azucar', code: 'ABA-001', name: 'Azúcar Rubia Doméstica', item_type: 'insumo', category: 'abarrotes', icon: '🌾', unit: 'kg', stock: 50.0, min_stock: 10.0, cost_per_unit: 3.80, is_tax_affected: 1 },
    { id: 'ing-cafe-espresso', code: 'ABA-002', name: 'Concentrado Café Espresso Grano Chanchamayo', item_type: 'insumo', category: 'abarrotes', icon: '☕', unit: 'L', stock: 10.0, min_stock: 2.0, cost_per_unit: 18.00, is_tax_affected: 1 },
    { id: 'ing-algarrobina', code: 'ABA-003', name: 'Algarrobina Pura de Piura', item_type: 'insumo', category: 'abarrotes', icon: '🍯', unit: 'L', stock: 8.0, min_stock: 2.0, cost_per_unit: 28.00, is_tax_affected: 1 },
    { id: 'ing-harina-trigo', code: 'ABA-007', name: 'Harina de Trigo Especial Panadería', item_type: 'insumo', category: 'abarrotes', icon: '🌾', unit: 'kg', stock: 30.0, min_stock: 5.0, cost_per_unit: 3.80, is_tax_affected: 1 },
    { id: 'ing-mayonesa', code: 'ABA-008', name: 'Mayonesa Clásica Sandwichera', item_type: 'insumo', category: 'abarrotes', icon: '🥫', unit: 'kg', stock: 10.0, min_stock: 2.0, cost_per_unit: 12.00, is_tax_affected: 1 },

    // Jarabes, Salsas y Subrecetas
    { id: 'ing-fudge-chocolate', code: 'JAR-001', name: 'Fudge de Chocolate Artesanal', item_type: 'subreceta', category: 'jarabes_bases', icon: '🍫', unit: 'kg', stock: 12.0, min_stock: 2.0, cost_per_unit: 14.00, is_tax_affected: 1, is_intermediate_recipe: 1 },
    { id: 'ing-jarabe-goma', code: 'JAR-002', name: 'Jarabe de Goma Casero 2:1', item_type: 'subreceta', category: 'jarabes_bases', icon: '🍯', unit: 'L', stock: 15.0, min_stock: 3.0, cost_per_unit: 6.00, is_tax_affected: 1, is_intermediate_recipe: 1 },
    { id: 'ing-crema-chantilly', code: 'JAR-003', name: 'Crema Chantilly Batida', item_type: 'subreceta', category: 'jarabes_bases', icon: '🧁', unit: 'kg', stock: 8.0, min_stock: 2.0, cost_per_unit: 18.00, is_tax_affected: 1, is_intermediate_recipe: 1 },
    { id: 'ing-mix-waffle', code: 'SUB-002', name: 'Mix Batido Waffles & Crepes', item_type: 'subreceta', category: 'jarabes_bases', icon: '🥞', unit: 'L', stock: 15.0, min_stock: 3.0, cost_per_unit: 4.80, is_tax_affected: 1, is_intermediate_recipe: 1 },
    { id: 'ing-pulpa-mixta', code: 'SUB-001', name: 'Pulpa Congelada Surtida (Rescate)', item_type: 'subreceta', category: 'jarabes_bases', icon: '🍓', unit: 'kg', stock: 10.0, min_stock: 2.0, cost_per_unit: 3.10, is_tax_affected: 1, is_intermediate_recipe: 1 },

    // Descartables y Empaques
    { id: 'ing-vaso-16oz', code: 'DES-001', name: 'Vaso Pet 16oz + Tapa Domo', item_type: 'descartable', category: 'descartables', icon: '🥤', unit: 'und', stock: 500, min_stock: 100, cost_per_unit: 0.38, is_tax_affected: 1 },
    { id: 'ing-sorbete', code: 'DES-002', name: 'Sorbete Biodegradable Grueso', item_type: 'descartable', category: 'descartables', icon: '🥢', unit: 'und', stock: 1000, min_stock: 200, cost_per_unit: 0.05, is_tax_affected: 1 },
    { id: 'ing-servilleta', code: 'DES-003', name: 'Servilleta Mesa Doble Hoja', item_type: 'descartable', category: 'descartables', icon: '🧻', unit: 'und', stock: 2000, min_stock: 300, cost_per_unit: 0.02, is_tax_affected: 1 },
    { id: 'ing-caja-sandwich', code: 'DES-004', name: 'Caja Kraft Biodegradable Sándwich', item_type: 'descartable', category: 'descartables', icon: '📦', unit: 'und', stock: 300, min_stock: 50, cost_per_unit: 0.45, is_tax_affected: 1 },
    { id: 'ing-plato-waffle', code: 'DES-005', name: 'Plato Biodegradable Bagazo Waffle/Crepe', item_type: 'descartable', category: 'descartables', icon: '🍽️', unit: 'und', stock: 300, min_stock: 50, cost_per_unit: 0.40, is_tax_affected: 1 },
    { id: 'ing-cono-barquillo', code: 'DES-015', name: 'Barquillo Dulce para Helado', item_type: 'descartable', category: 'descartables', icon: '🍦', unit: 'und', stock: 200, min_stock: 40, cost_per_unit: 0.25, is_tax_affected: 1 },
    { id: 'ing-vaso-helado', code: 'DES-016', name: 'Vasito Polipapel Helado + Cucharita', item_type: 'descartable', category: 'descartables', icon: '🍨', unit: 'und', stock: 300, min_stock: 50, cost_per_unit: 0.30, is_tax_affected: 1 },

    // Consumibles de Limpieza y Operativos
    { id: 'ing-detergente', code: 'CON-001', name: 'Detergente Clorado Desinfectante', item_type: 'consumible', category: 'consumibles', icon: '🧼', unit: 'L', stock: 10, min_stock: 2, cost_per_unit: 6.50, is_tax_affected: 1 },
    { id: 'ing-alcohol', code: 'CON-002', name: 'Alcohol 70% Spray Sanitizante', item_type: 'consumible', category: 'consumibles', icon: '🧴', unit: 'L', stock: 8, min_stock: 2, cost_per_unit: 7.00, is_tax_affected: 1 }
  ];

  initialIngredients.forEach(ing => {
    insertIng.run(
      ing.id,
      ing.code,
      ing.name,
      ing.item_type,
      ing.category,
      ing.icon,
      ing.unit,
      ing.stock,
      ing.minStock,
      ing.cost_per_unit,
      ing.is_tax_affected,
      JSON.stringify([{ batchNumber: 'LOT-BASE', entryDate: '2026-11-01', expiryDate: '2027-11-01', initialQty: ing.stock, remainingQty: ing.stock, unitCost: ing.cost_per_unit }]),
      ing.is_intermediate_recipe || 0,
      null
    );
  });

  // 4. Sembrar Toppings Maestros Dinámicos
  console.log('4. Sembrando maestro de toppings dinámicos...');
  const insertTopping = db.prepare(`
    INSERT OR REPLACE INTO toppings_master 
    (id, name, category, price, cost, data, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);

  const initialToppings = [
    {
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
    },
    {
      id: 'top-extra-fudge',
      name: '+ Extra Fudge',
      category: 'jarabes_bases',
      linkedItemType: 'subreceta',
      ingredientId: 'ing-fudge-chocolate',
      portionQuantity: 0.03,
      portionUnit: 'kg',
      defaultPriceDelta: 1.00,
      isActive: true,
      hasVariants: false
    },
    {
      id: 'top-chantilly',
      name: '+ Crema Chantilly',
      category: 'jarabes_bases',
      linkedItemType: 'subreceta',
      ingredientId: 'ing-crema-chantilly',
      portionQuantity: 0.04,
      portionUnit: 'kg',
      defaultPriceDelta: 2.00,
      isActive: true,
      hasVariants: false
    },
    {
      id: 'top-queso-edam',
      name: '+ Queso Edam',
      category: 'lacteos',
      linkedItemType: 'insumo',
      ingredientId: 'ing-queso-edam',
      portionQuantity: 0.03,
      portionUnit: 'kg',
      defaultPriceDelta: 2.00,
      isActive: true,
      hasVariants: false
    },
    {
      id: 'top-leche',
      name: '+ Con Leche',
      category: 'lacteos',
      linkedItemType: 'insumo',
      ingredientId: 'ing-leche-entera',
      portionQuantity: 0.15,
      portionUnit: 'L',
      defaultPriceDelta: 2.00,
      isActive: true,
      hasVariants: false
    },
    {
      id: 'top-algarrobina',
      name: '+ Algarrobina',
      category: 'abarrotes',
      linkedItemType: 'insumo',
      ingredientId: 'ing-algarrobina',
      portionQuantity: 0.03,
      portionUnit: 'L',
      defaultPriceDelta: 1.50,
      isActive: true,
      hasVariants: false
    }
  ];

  initialToppings.forEach(top => {
    insertTopping.run(
      top.id,
      top.name,
      top.category,
      top.defaultPriceDelta,
      0.50,
      JSON.stringify(top)
    );
  });

  // 5. Sembrar Menú Limpio, Dinámico y Agnóstico
  console.log('5. Sembrando menú y recetas limpias...');
  const menuConfig = {
    version: '2.5.0',
    currency: 'PEN',
    lines: [
      {
        id: 'linea-fria',
        name: 'Línea Fría',
        theme: {
          accentColor: '#06b6d4',
          badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
          activeTabClass: 'bg-cyan-600 text-white shadow-cyan-600/30'
        },
        categories: [
          {
            id: 'cat-jugos',
            name: 'Jugos Naturales & Especiales',
            icon: '🥤',
            products: [
              {
                id: 'prod-jugo-surtido',
                sku: 'JUG-01',
                name: 'Jugo Surtido Especial',
                shortName: 'Surtido Especial',
                price: 11.00,
                targetCost: 2.50,
                category: 'cat-jugos',
                recipeType: 'final',
                isActive: true,
                ui: { color: 'cyan', bgClass: 'bg-cyan-950/40', borderClass: 'border-cyan-500/30', textClass: 'text-cyan-200' },
                quickModifiers: [
                  { id: 'mod-sin-azucar', label: 'Sin Azúcar', priceDelta: 0 },
                  { id: 'mod-con-leche', label: '+ Con Leche', priceDelta: 2.00, toppingMasterId: 'top-leche', ingredientId: 'ing-leche-entera', quantity: 0.15, unit: 'L' },
                  { id: 'mod-algarrobina', label: '+ Algarrobina', priceDelta: 1.50, toppingMasterId: 'top-algarrobina', ingredientId: 'ing-algarrobina', quantity: 0.03, unit: 'L' }
                ],
                recipeBom: [
                  { ingredientId: 'ing-papaya', quantity: 0.100, unit: 'kg' },
                  { ingredientId: 'ing-pina', quantity: 0.080, unit: 'kg' },
                  { ingredientId: 'ing-platano', quantity: 0.050, unit: 'kg' },
                  { ingredientId: 'ing-fresa', quantity: 0.040, unit: 'kg' },
                  { ingredientId: 'ing-azucar', quantity: 0.025, unit: 'kg' },
                  { ingredientId: 'ing-vaso-16oz', quantity: 1, unit: 'und', isDisposable: true },
                  { ingredientId: 'ing-sorbete', quantity: 1, unit: 'und', isDisposable: true },
                  { ingredientId: 'ing-servilleta', quantity: 2, unit: 'und', isDisposable: true }
                ]
                // SIN FLAVOR SLOTS (receta limpia)
              },
              {
                id: 'prod-jugo-papaya',
                sku: 'JUG-02',
                name: 'Jugo de Papaya al Natural',
                shortName: 'Jugo Papaya',
                price: 8.50,
                targetCost: 1.80,
                category: 'cat-jugos',
                recipeType: 'final',
                isActive: true,
                ui: { color: 'amber', bgClass: 'bg-amber-950/40', borderClass: 'border-amber-500/30', textClass: 'text-amber-200' },
                quickModifiers: [
                  { id: 'mod-sin-azucar', label: 'Sin Azúcar', priceDelta: 0 },
                  { id: 'mod-con-leche', label: '+ Con Leche', priceDelta: 2.00, toppingMasterId: 'top-leche', ingredientId: 'ing-leche-entera', quantity: 0.15, unit: 'L' }
                ],
                recipeBom: [
                  { ingredientId: 'ing-papaya', quantity: 0.250, unit: 'kg' },
                  { ingredientId: 'ing-azucar', quantity: 0.025, unit: 'kg' },
                  { ingredientId: 'ing-vaso-16oz', quantity: 1, unit: 'und', isDisposable: true },
                  { ingredientId: 'ing-sorbete', quantity: 1, unit: 'und', isDisposable: true },
                  { ingredientId: 'ing-servilleta', quantity: 2, unit: 'und', isDisposable: true }
                ]
              }
            ]
          },
          {
            id: 'cat-helados',
            name: 'Copas de Helado & Especiales',
            icon: '🍨',
            products: [
              {
                id: 'prod-banana-split',
                sku: 'HEL-05',
                name: 'Banana Split Clásica Sabor & Fruta',
                shortName: 'Banana Split',
                price: 16.50,
                targetCost: 4.20,
                category: 'cat-helados',
                recipeType: 'final',
                isActive: true,
                ui: { color: 'cyan', bgClass: 'bg-cyan-950/40', borderClass: 'border-cyan-500/30', textClass: 'text-cyan-200' },
                quickModifiers: [
                  { id: 'mod-extra-fudge', label: '+ Extra Fudge', priceDelta: 1.00, toppingMasterId: 'top-extra-fudge', ingredientId: 'ing-fudge-chocolate', quantity: 0.03, unit: 'kg' },
                  { id: 'mod-chantilly', label: '+ Crema Chantilly', priceDelta: 2.00, toppingMasterId: 'top-chantilly', ingredientId: 'ing-crema-chantilly', quantity: 0.04, unit: 'kg' }
                ],
                flavorSlots: [
                  { slotIndex: 0, label: 'Bola 1', category: 'helados', quantity: 0.07, unit: 'L', required: true },
                  { slotIndex: 1, label: 'Bola 2', category: 'helados', quantity: 0.07, unit: 'L', required: true },
                  { slotIndex: 2, label: 'Bola 3', category: 'helados', quantity: 0.07, unit: 'L', required: true }
                ],
                recipeBom: [
                  { ingredientId: 'ing-platano', quantity: 0.120, unit: 'kg' },
                  { ingredientId: 'ing-fudge-chocolate', quantity: 0.030, unit: 'kg' },
                  { ingredientId: 'ing-vaso-helado', quantity: 1, unit: 'und', isDisposable: true },
                  { ingredientId: 'ing-servilleta', quantity: 2, unit: 'und', isDisposable: true }
                ]
              },
              {
                id: 'prod-copa-2-bolas',
                sku: 'HEL-02',
                name: 'Copa de Helado Artesanal (2 Bolas)',
                shortName: 'Helado 2 Bolas',
                price: 10.00,
                targetCost: 2.80,
                category: 'cat-helados',
                recipeType: 'final',
                isActive: true,
                ui: { color: 'cyan', bgClass: 'bg-cyan-950/40', borderClass: 'border-cyan-500/30', textClass: 'text-cyan-200' },
                quickModifiers: [
                  { id: 'mod-extra-fudge', label: '+ Extra Fudge', priceDelta: 1.00, toppingMasterId: 'top-extra-fudge', ingredientId: 'ing-fudge-chocolate', quantity: 0.03, unit: 'kg' }
                ],
                servingOptions: [
                  { id: 'srv-vasito', name: 'En Vasito + Cucharita', ingredientId: 'ing-vaso-helado', priceDelta: 0 },
                  { id: 'srv-cono', name: 'En Cono Barquillo', ingredientId: 'ing-cono-barquillo', priceDelta: 0 }
                ],
                flavorSlots: [
                  { slotIndex: 0, label: 'Bola 1', category: 'helados', quantity: 0.07, unit: 'L', required: true },
                  { slotIndex: 1, label: 'Bola 2', category: 'helados', quantity: 0.07, unit: 'L', required: true }
                ],
                recipeBom: [
                  { ingredientId: 'ing-fudge-chocolate', quantity: 0.020, unit: 'kg' },
                  { ingredientId: 'ing-servilleta', quantity: 2, unit: 'und', isDisposable: true }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'linea-caliente',
        name: 'Línea Caliente',
        theme: {
          accentColor: '#f43f5e',
          badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
          activeTabClass: 'bg-rose-600 text-white shadow-rose-600/30'
        },
        categories: [
          {
            id: 'cat-sandwiches',
            name: 'Sándwiches Clásicos',
            icon: '🥪',
            products: [
              {
                id: 'prod-san-pollo',
                sku: 'SAN-01',
                name: 'Sándwich Pollo Deshilachado',
                shortName: 'Sándwich Pollo',
                price: 8.50,
                targetCost: 2.60,
                category: 'cat-sandwiches',
                recipeType: 'final',
                isActive: true,
                ui: { color: 'rose', bgClass: 'bg-rose-950/40', borderClass: 'border-rose-500/30', textClass: 'text-rose-200' },
                flavorSlots: [
                  { slotIndex: 0, label: 'Tipo de Pan', category: 'panaderia', quantity: 1, unit: 'und', required: true }
                ],
                quickModifiers: [
                  { id: 'mod-sin-mayonesa', label: 'Sin Mayonesa', priceDelta: 0 },
                  { id: 'mod-queso-edam', label: '+ Queso Edam', priceDelta: 2.00, toppingMasterId: 'top-queso-edam', ingredientId: 'ing-queso-edam', quantity: 0.03, unit: 'kg' }
                ],
                recipeBom: [
                  { ingredientId: 'ing-pollo-pechuga', quantity: 0.090, unit: 'kg' },
                  { ingredientId: 'ing-mayonesa', quantity: 0.020, unit: 'kg' },
                  { ingredientId: 'ing-caja-sandwich', quantity: 1, unit: 'und', isDisposable: true },
                  { ingredientId: 'ing-servilleta', quantity: 2, unit: 'und', isDisposable: true }
                ]
              },
              {
                id: 'prod-san-mixto',
                sku: 'SAN-02',
                name: 'Mixto Caliente Jamón & Queso',
                shortName: 'Mixto Caliente',
                price: 7.50,
                targetCost: 2.10,
                category: 'cat-sandwiches',
                recipeType: 'final',
                isActive: true,
                ui: { color: 'rose', bgClass: 'bg-rose-950/40', borderClass: 'border-rose-500/30', textClass: 'text-rose-200' },
                flavorSlots: [
                  { slotIndex: 0, label: 'Tipo de Pan', category: 'panaderia', quantity: 1, unit: 'und', required: true }
                ],
                quickModifiers: [
                  { id: 'mod-sin-mantequilla', label: 'Sin Mantequilla', priceDelta: 0 }
                ],
                recipeBom: [
                  { ingredientId: 'ing-jamon-ingles', quantity: 0.050, unit: 'kg' },
                  { ingredientId: 'ing-queso-edam', quantity: 0.050, unit: 'kg' },
                  { ingredientId: 'ing-mantequilla', quantity: 0.010, unit: 'kg' },
                  { ingredientId: 'ing-caja-sandwich', quantity: 1, unit: 'und', isDisposable: true },
                  { ingredientId: 'ing-servilleta', quantity: 2, unit: 'und', isDisposable: true }
                ]
              }
            ]
          },
          {
            id: 'cat-waffles',
            name: 'Waffles & Crepes Rápidos',
            icon: '🥞',
            products: [
              {
                id: 'prod-waffle-fresa',
                sku: 'WAF-01',
                name: 'Waffle Belga con Fresas y Fudge',
                shortName: 'Waffle Fresa-Fudge',
                price: 13.00,
                targetCost: 3.50,
                category: 'cat-waffles',
                recipeType: 'final',
                isActive: true,
                ui: { color: 'amber', bgClass: 'bg-amber-950/40', borderClass: 'border-amber-500/30', textClass: 'text-amber-200' },
                quickModifiers: [
                  { id: 'mod-top-helado', label: '+ Bola de Helado', priceDelta: 3.00, toppingMasterId: 'top-bola-helado', hasVariants: true, variantCategory: 'helados', ingredientId: 'ing-base-helado-vainilla', quantity: 0.07, unit: 'L' },
                  { id: 'mod-extra-fudge', label: '+ Extra Fudge', priceDelta: 1.00, toppingMasterId: 'top-extra-fudge', ingredientId: 'ing-fudge-chocolate', quantity: 0.03, unit: 'kg' }
                ],
                recipeBom: [
                  { ingredientId: 'ing-mix-waffle', quantity: 0.180, unit: 'L' },
                  { ingredientId: 'ing-fresa', quantity: 0.080, unit: 'kg' },
                  { ingredientId: 'ing-fudge-chocolate', quantity: 0.035, unit: 'kg' },
                  { ingredientId: 'ing-plato-waffle', quantity: 1, unit: 'und', isDisposable: true },
                  { ingredientId: 'ing-servilleta', quantity: 2, unit: 'und', isDisposable: true }
                ]
              }
            ]
          }
        ]
      }
    ],
    globalModifiers: [
      { id: 'gmod-llevar', label: 'Para Llevar', type: 'toggle' }
    ]
  };

  db.prepare("INSERT OR REPLACE INTO menu_config (id, data, updated_at) VALUES ('current', ?, CURRENT_TIMESTAMP)").run(
    JSON.stringify(menuConfig)
  );

  console.log('✓ BASE DE DATOS SQLITE LIMPIADA Y RESEMBRADA CON ÉXITO.');
})();

