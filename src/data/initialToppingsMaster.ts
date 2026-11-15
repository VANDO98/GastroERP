import type { ToppingMaster } from '../types';

export const initialToppingsMaster: ToppingMaster[] = [
  {
    id: 'top-mango-cubos',
    name: 'Mango en Cubitos (10g)',
    linkedItemType: 'insumo',
    ingredientId: 'ing-mango',
    portionQuantity: 0.010,
    portionUnit: 'kg',
    defaultPriceDelta: 1.50,
    isActive: true
  },
  {
    id: 'top-fresa-picada',
    name: 'Fresas Picadas (15g)',
    linkedItemType: 'insumo',
    ingredientId: 'ing-fresa',
    portionQuantity: 0.015,
    portionUnit: 'kg',
    defaultPriceDelta: 1.50,
    isActive: true
  },
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
    name: 'Crema Chantilly Batida (30ml)',
    linkedItemType: 'insumo',
    ingredientId: 'ing-crema-chantilly',
    portionQuantity: 0.030,
    portionUnit: 'L',
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
    name: 'Mango en Cubitos (10g)',
    linkedItemType: 'insumo',
    ingredientId: 'ing-mango',
    portionQuantity: 0.010,
    portionUnit: 'kg',
    defaultPriceDelta: 1.50,
    isActive: true
  },
  {
    id: 'top-fresa-picada',
    name: 'Fresas Picadas (15g)',
    linkedItemType: 'insumo',
    ingredientId: 'ing-fresa',
    portionQuantity: 0.015,
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
    id: 'top-pulpa-mango-extra',
    name: 'Shot Extra Pulpa de Mango (50g)',
    linkedItemType: 'subreceta',
    ingredientId: 'ing-pulpa-mango',
    portionQuantity: 0.050,
    portionUnit: 'kg',
    defaultPriceDelta: 2.00,
    isActive: true
  }
];
