import { db } from './database.js';

// 1. Agregar nuevos Toppings Maestros que descuentan inventario
const toppingsToAdd = [
  {
    id: 'top-leche-deslact',
    name: 'Con Leche Deslactosada (200ml)',
    linkedItemType: 'insumo',
    ingredientId: 'ing-leche-deslact',
    portionQuantity: 0.200,
    portionUnit: 'L',
    defaultPriceDelta: 1.50,
    isActive: true
  },
  {
    id: 'top-shot-cafe',
    name: 'Shot de Café Espresso (30ml)',
    linkedItemType: 'insumo',
    ingredientId: 'ing-cafe-espresso',
    portionQuantity: 0.030,
    portionUnit: 'L',
    defaultPriceDelta: 2.00,
    isActive: true
  },
  {
    id: 'top-chantilly',
    name: 'Crema Chantilly Batida (25g)',
    linkedItemType: 'insumo',
    ingredientId: 'ing-crema-chantilly',
    portionQuantity: 0.025,
    portionUnit: 'kg',
    defaultPriceDelta: 1.50,
    isActive: true
  },
  {
    id: 'top-helado-vainilla',
    name: 'Bola de Helado Vainilla (70ml)',
    linkedItemType: 'insumo',
    ingredientId: 'ing-base-helado-vainilla',
    portionQuantity: 0.070,
    portionUnit: 'L',
    defaultPriceDelta: 3.00,
    isActive: true
  },
  {
    id: 'top-mango-cubos',
    name: 'Mango en Cubitos (20g)',
    linkedItemType: 'insumo',
    ingredientId: 'ing-mango',
    portionQuantity: 0.020,
    portionUnit: 'kg',
    defaultPriceDelta: 1.50,
    isActive: true
  },
  {
    id: 'top-fresa-picada',
    name: 'Fresas Picadas (20g)',
    linkedItemType: 'insumo',
    ingredientId: 'ing-fresa',
    portionQuantity: 0.020,
    portionUnit: 'kg',
    defaultPriceDelta: 1.50,
    isActive: true
  },
  {
    id: 'top-fudge',
    name: 'Fudge de Chocolate Casero (25g)',
    linkedItemType: 'insumo',
    ingredientId: 'ing-fudge-chocolate',
    portionQuantity: 0.025,
    portionUnit: 'kg',
    defaultPriceDelta: 1.00,
    isActive: true
  },
  {
    id: 'top-oreo-triturada',
    name: 'Galleta Oreo Triturada (1 und / 9g)',
    linkedItemType: 'insumo',
    ingredientId: 'ing-galleta-oreo',
    portionQuantity: 0.009,
    portionUnit: 'kg',
    defaultPriceDelta: 1.50,
    isActive: true
  },
  {
    id: 'top-algarrobina',
    name: 'Toque de Algarrobina Pura (20ml)',
    linkedItemType: 'insumo',
    ingredientId: 'ing-algarrobina',
    portionQuantity: 0.020,
    portionUnit: 'L',
    defaultPriceDelta: 1.50,
    isActive: true
  },
  {
    id: 'top-queso-extra',
    name: 'Tajada Extra Queso Edam (35g)',
    linkedItemType: 'insumo',
    ingredientId: 'ing-queso-edam',
    portionQuantity: 0.035,
    portionUnit: 'kg',
    defaultPriceDelta: 2.00,
    isActive: true
  }
];

const insertTopping = db.prepare(`
  INSERT OR REPLACE INTO toppings_master (id, name, category, price, cost, data, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
`);

const tx = db.transaction(() => {
  toppingsToAdd.forEach(top => {
    insertTopping.run(
      top.id,
      top.name,
      top.linkedItemType === 'subreceta' ? 'subrecetas' : 'toppings',
      top.defaultPriceDelta,
      0,
      JSON.stringify(top)
    );
  });
});
tx();
console.log('Toppings maestros actualizados con insumos reales de almacén.');

// 2. Actualizar las recetas del menú con modificadores y toppings reales
const menuRow = db.prepare("SELECT data FROM menu_config WHERE id = 'current'").get() as any;
if (menuRow) {
  const menu = JSON.parse(menuRow.data);
  
  menu.lines.forEach((l: any) => {
    l.categories.forEach((c: any) => {
      c.products.forEach((p: any) => {
        // Asignar toppings según el tipo de producto
        if (p.sku === 'JUG-01') {
          // Jugo Surtido
          p.quickModifiers = [
            { id: 'm-sin-azucar', label: 'Sin Azúcar', priceDelta: 0, inventoryImpact: [{ ingredientId: 'ing-azucar', qtyDelta: -0.025 }] },
            { id: 'm-algarrobina', label: '+ Algarrobina', priceDelta: 1.50, toppingMasterId: 'top-algarrobina', ingredientId: 'ing-algarrobina', quantity: 0.020, unit: 'L' },
            { id: 'm-deslactosada', label: '+ Leche Deslactosada', priceDelta: 1.50, toppingMasterId: 'top-leche-deslact', ingredientId: 'ing-leche-deslact', quantity: 0.200, unit: 'L' }
          ];
        } else if (p.sku === 'JUG-02') {
          // Fresa con Leche
          p.quickModifiers = [
            { id: 'm-sin-azucar', label: 'Sin Azúcar', priceDelta: 0 },
            { id: 'm-deslactosada', label: 'Deslactosada', priceDelta: 1.50, toppingMasterId: 'top-leche-deslact', ingredientId: 'ing-leche-deslact', quantity: 0.200, unit: 'L' },
            { id: 'm-extra-fresa', label: '+ Fresas Picadas', priceDelta: 1.50, toppingMasterId: 'top-fresa-picada', ingredientId: 'ing-fresa', quantity: 0.020, unit: 'kg' },
            { id: 'm-chantilly', label: '+ Chantilly', priceDelta: 1.50, toppingMasterId: 'top-chantilly', ingredientId: 'ing-crema-chantilly', quantity: 0.025, unit: 'kg' }
          ];
        } else if (p.sku === 'JUG-03') {
          // Mango Pasión
          p.quickModifiers = [
            { id: 'm-sin-azucar', label: 'Sin Azúcar', priceDelta: 0 },
            { id: 'm-al-tiempo', label: 'Al Tiempo', priceDelta: 0 },
            { id: 'm-extra-mango', label: '+ Mango en Cubos', priceDelta: 1.50, toppingMasterId: 'top-mango-cubos', ingredientId: 'ing-mango', quantity: 0.020, unit: 'kg' }
          ];
        } else if (p.sku.startsWith('FRP-AG')) {
          // Frappés al Agua
          p.quickModifiers = [
            { id: 'm-extra-fresa', label: '+ Fresas Picadas', priceDelta: 1.50, toppingMasterId: 'top-fresa-picada', ingredientId: 'ing-fresa', quantity: 0.020, unit: 'kg' },
            { id: 'm-extra-mango', label: '+ Mango en Cubos', priceDelta: 1.50, toppingMasterId: 'top-mango-cubos', ingredientId: 'ing-mango', quantity: 0.020, unit: 'kg' },
            { id: 'm-chantilly', label: '+ Corona Chantilly', priceDelta: 1.50, toppingMasterId: 'top-chantilly', ingredientId: 'ing-crema-chantilly', quantity: 0.025, unit: 'kg' }
          ];
        } else if (p.sku.startsWith('FRP-LC')) {
          // Frappés Lácteos
          p.quickModifiers = [
            { id: 'm-extra-chantilly', label: '+ Extra Chantilly', priceDelta: 1.50, toppingMasterId: 'top-chantilly', ingredientId: 'ing-crema-chantilly', quantity: 0.025, unit: 'kg' },
            { id: 'm-extra-fudge', label: '+ Extra Fudge', priceDelta: 1.00, toppingMasterId: 'top-fudge', ingredientId: 'ing-fudge-chocolate', quantity: 0.025, unit: 'kg' },
            { id: 'm-oreo-crunch', label: '+ Oreo Triturada', priceDelta: 1.50, toppingMasterId: 'top-oreo-triturada', ingredientId: 'ing-galleta-oreo', quantity: 0.009, unit: 'kg' },
            { id: 'm-shot-cafe', label: '+ Shot Espresso', priceDelta: 2.00, toppingMasterId: 'top-shot-cafe', ingredientId: 'ing-cafe-espresso', quantity: 0.030, unit: 'L' }
          ];
        } else if (p.sku.startsWith('SMO-')) {
          // Smoothies
          p.quickModifiers = [
            { id: 'm-sin-azucar', label: 'Sin Azúcar / Fit', priceDelta: 0 },
            { id: 'm-toque-miel', label: '+ Miel de Abeja', priceDelta: 1.50 },
            { id: 'm-extra-fresa', label: '+ Fresas Topping', priceDelta: 1.50, toppingMasterId: 'top-fresa-picada', ingredientId: 'ing-fresa', quantity: 0.020, unit: 'kg' },
            { id: 'm-extra-mango', label: '+ Mango Topping', priceDelta: 1.50, toppingMasterId: 'top-mango-cubos', ingredientId: 'ing-mango', quantity: 0.020, unit: 'kg' }
          ];
        } else if (p.sku === 'HEL-01') {
          // Copa Helada
          p.quickModifiers = [
            { id: 'm-extra-fudge', label: '+ Extra Fudge', priceDelta: 1.00, toppingMasterId: 'top-fudge', ingredientId: 'ing-fudge-chocolate', quantity: 0.025, unit: 'kg' },
            { id: 'm-extra-helado', label: '+ Bola Helado Vainilla', priceDelta: 3.00, toppingMasterId: 'top-helado-vainilla', ingredientId: 'ing-base-helado-vainilla', quantity: 0.070, unit: 'L' },
            { id: 'm-fresa-topping', label: '+ Fresas Picadas', priceDelta: 1.50, toppingMasterId: 'top-fresa-picada', ingredientId: 'ing-fresa', quantity: 0.020, unit: 'kg' },
            { id: 'm-oreo-crunch', label: '+ Galleta Oreo', priceDelta: 1.50, toppingMasterId: 'top-oreo-triturada', ingredientId: 'ing-galleta-oreo', quantity: 0.009, unit: 'kg' }
          ];
        } else if (p.sku.startsWith('SAN-')) {
          // Sándwiches
          p.quickModifiers = [
            { id: 'm-sin-mayonesa', label: 'Sin Mayonesa', priceDelta: 0, inventoryImpact: [{ ingredientId: 'ing-mayonesa', qtyDelta: -0.02 }] },
            { id: 'm-extra-queso', label: '+ Extra Queso Edam', priceDelta: 2.00, toppingMasterId: 'top-queso-extra', ingredientId: 'ing-queso-edam', quantity: 0.035, unit: 'kg' }
          ];
        } else if (p.sku === 'WAF-01' || p.sku === 'CRP-01') {
          // Waffles y Crepes
          p.quickModifiers = [
            { id: 'm-bola-helado', label: '+ Bola de Helado', priceDelta: 3.00, toppingMasterId: 'top-helado-vainilla', ingredientId: 'ing-base-helado-vainilla', quantity: 0.070, unit: 'L' },
            { id: 'm-extra-fudge', label: '+ Extra Fudge', priceDelta: 1.00, toppingMasterId: 'top-fudge', ingredientId: 'ing-fudge-chocolate', quantity: 0.025, unit: 'kg' },
            { id: 'm-fresas-frescas', label: '+ Fresas Picadas', priceDelta: 1.50, toppingMasterId: 'top-fresa-picada', ingredientId: 'ing-fresa', quantity: 0.020, unit: 'kg' },
            { id: 'm-chantilly', label: '+ Corona Chantilly', priceDelta: 1.50, toppingMasterId: 'top-chantilly', ingredientId: 'ing-crema-chantilly', quantity: 0.025, unit: 'kg' }
          ];
        }
      });
    });
  });

  db.prepare("UPDATE menu_config SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 'current'").run(JSON.stringify(menu));
  console.log('Todas las recetas actualizadas con toppings que descuentan de almacén.');
}
