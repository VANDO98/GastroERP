import type { ProductionOrder } from '../types';

export const initialProductionOrders: ProductionOrder[] = [
  {
    id: 'op-3635',
    orderNumber: 'OP-3635',
    batchNumber: 'LOTE-PAPAYA-20261111',
    warehouseName: 'Producción Barra TV',
    preparedAt: '2026-11-11T09:30:00Z',
    status: 'completado',
    responsibleName: 'Jesús Saavedra',
    items: [
      {
        recipeId: 'ing-pulpa-papaya',
        recipeName: 'Pulpa de Papaya Congelada (Rescate)',
        recipeCode: 'SUB-005',
        estimatedQuantity: 5.0,
        resultQuantity: 4.7,
        unit: 'kg',
        wastePercent: 6.0,
        wasteQuantity: 0.3,
        unitCost: 3.20,
        totalCost: 15.04,
        targetIngredientId: 'ing-pulpa-papaya'
      }
    ],
    requiredIngredients: [
      {
        ingredientId: 'ing-papaya',
        ingredientName: 'Papaya Selva Fresca',
        ingredientCode: 'FRU-001',
        category: 'frutas',
        quantityRequired: 5.0,
        unit: 'kg',
        wastePercent: 6.0,
        wasteQuantity: 0.3,
        unitCost: 2.80,
        totalCost: 14.00,
        currentStock: 12.0
      },
      {
        ingredientId: 'ing-azucar',
        ingredientName: 'Azúcar Blanca Refinada',
        ingredientCode: 'ABA-001',
        category: 'abarrotes',
        quantityRequired: 0.25,
        unit: 'kg',
        wastePercent: 0.0,
        wasteQuantity: 0.0,
        unitCost: 4.16,
        totalCost: 1.04,
        currentStock: 18.5
      }
    ],
    totalEstimatedCost: 15.04,
    totalActualCost: 15.04,
    notes: 'Fruta madura rescatada del fin de semana. Congelada en bloques individuales para jugos frozen.',
    createdAt: '2026-11-11T09:00:00Z'
  },
  {
    id: 'op-3634',
    orderNumber: 'OP-3634',
    batchNumber: 'LOTE-POLLO-20261110',
    warehouseName: 'Producción Cocina TV',
    preparedAt: '2026-11-10T14:52:00Z',
    status: 'completado',
    responsibleName: 'Jesús Saavedra',
    items: [
      {
        recipeId: 'ing-pollo-deshilachado',
        recipeName: 'Pollo Deshilachado para Sándwich',
        recipeCode: 'SUB-004',
        estimatedQuantity: 4.0,
        resultQuantity: 3.8,
        unit: 'kg',
        wastePercent: 5.0,
        wasteQuantity: 0.2,
        unitCost: 14.50,
        totalCost: 55.10,
        targetIngredientId: 'ing-pollo-pechuga'
      }
    ],
    requiredIngredients: [
      {
        ingredientId: 'ing-pollo-pechuga',
        ingredientName: 'Pechuga de Pollo Fresca',
        ingredientCode: 'CAR-001',
        category: 'carnes',
        quantityRequired: 4.0,
        unit: 'kg',
        wastePercent: 5.0,
        wasteQuantity: 0.2,
        unitCost: 13.50,
        totalCost: 54.00,
        currentStock: 8.5
      },
      {
        ingredientId: 'ing-sal-cocina',
        ingredientName: 'Sal de Cocina Yodada',
        ingredientCode: 'ABA-005',
        category: 'abarrotes',
        quantityRequired: 0.05,
        unit: 'kg',
        wastePercent: 0.0,
        wasteQuantity: 0.0,
        unitCost: 1.80,
        totalCost: 0.09,
        currentStock: 5.0
      }
    ],
    totalEstimatedCost: 54.09,
    totalActualCost: 55.10,
    notes: 'Cocción y deshilachado para el turno de tarde.',
    createdAt: '2026-11-10T14:30:00Z'
  }
];
