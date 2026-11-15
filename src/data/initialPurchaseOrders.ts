import type { PurchaseOrder } from '../types';

export const initialPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'po-2026-001',
    poNumber: 'OC-2026-001',
    supplierId: 'prv-001',
    supplierName: 'MERCADO MAYORISTA DE FRUTAS SANTA ANITA',
    supplierRuc: '20100047359',
    issueDate: '2026-11-10',
    expectedDeliveryDate: '2026-11-12',
    status: 'enviada',
    items: [
      {
        id: 'poi-1',
        ingredientId: 'ing-papaya',
        ingredientCode: 'FRU-001',
        ingredientName: 'Papaya Selva Especial',
        unit: 'kg',
        quantity: 30,
        unitPrice: 3.00,
        subtotal: 90.00
      },
      {
        id: 'poi-2',
        ingredientId: 'ing-fresa',
        ingredientCode: 'FRU-002',
        ingredientName: 'Fresas Huacho Seleccionadas',
        unit: 'kg',
        quantity: 15,
        unitPrice: 7.20,
        subtotal: 108.00
      },
      {
        id: 'poi-3',
        ingredientId: 'ing-mango',
        ingredientCode: 'FRU-005',
        ingredientName: 'Mango Kent Dulce',
        unit: 'kg',
        quantity: 12,
        unitPrice: 8.00,
        subtotal: 96.00
      }
    ],
    subtotal: 294.00,
    taxAmount: 0.00,
    total: 294.00,
    notes: 'Fruta fresca inafecta a IGV. Entregar antes de las 08:30 AM en cajones plásticos limpios.',
    createdAt: '2026-11-10T14:30:00Z'
  },
  {
    id: 'po-2026-002',
    poNumber: 'OC-2026-002',
    supplierId: 'prv-002',
    supplierName: 'GLORIA S.A. - DISTRIBUIDORA LIMA NORTE',
    supplierRuc: '20100190797',
    issueDate: '2026-11-11',
    expectedDeliveryDate: '2026-11-13',
    status: 'borrador',
    items: [
      {
        id: 'poi-4',
        ingredientId: 'ing-leche-entera',
        ingredientCode: 'LAC-001',
        ingredientName: 'Leche Fresca Entera Pasteurizada',
        unit: 'L',
        quantity: 40,
        unitPrice: 4.80,
        subtotal: 192.00
      },
      {
        id: 'poi-5',
        ingredientId: 'ing-crema-chantilly',
        ingredientCode: 'LAC-005',
        ingredientName: 'Crema Chantilly Batida para Topping',
        unit: 'L',
        quantity: 6,
        unitPrice: 18.00,
        subtotal: 108.00
      }
    ],
    subtotal: 300.00,
    taxAmount: 54.00,
    total: 354.00,
    notes: 'Lácteos procesados afectos al 18% IGV. Factura a crédito 15 días.',
    createdAt: '2026-11-11T10:15:00Z'
  }
];
