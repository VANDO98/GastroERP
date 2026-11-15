import type { Combo } from '../types';

export const initialCombos: Combo[] = [
  {
    id: 'combo-1',
    sku: 'CMB-001',
    name: 'Combo Mañanero Sabor',
    shortName: 'Combo Mañanero',
    description: '1 Jugo Surtido Especial + 1 Sándwich Mixto Caliente a la plancha',
    price: 15.50, // Individual suma S/ 18.50
    items: [
      { productId: 'prod-jugo-surtido', name: 'Jugo Surtido Especial', quantity: 1 },
      { productId: 'prod-sand-mixto', name: 'Sándwich Mixto Caliente', quantity: 1 }
    ],
    isActive: true,
    createdAt: '2026-11-10T08:00:00Z'
  },
  {
    id: 'combo-2',
    sku: 'CMB-002',
    name: 'Combo Dulce Tentación',
    shortName: 'Combo Dulce',
    description: '1 Frappé Moka Chanchamayo + 1 Waffle Belga con Fresas y Fudge',
    price: 22.00, // Individual suma S/ 26.50
    items: [
      { productId: 'prod-frap-moka', name: 'Frappé Moka Chanchamayo', quantity: 1 },
      { productId: 'prod-waffle-fresa', name: 'Waffle Belga con Fresas y Fudge', quantity: 1 }
    ],
    isActive: true,
    createdAt: '2026-11-10T09:00:00Z'
  },
  {
    id: 'combo-3',
    sku: 'CMB-003',
    name: 'Combo Lonche Proteico',
    shortName: 'Combo Lonche',
    description: '1 Sándwich Pollo Deshilachado + 1 Jugo de Fresa con Leche',
    price: 17.00, // Individual suma S/ 20.00
    items: [
      { productId: 'prod-sand-pollo', name: 'Sándwich Pollo Deshilachado', quantity: 1 },
      { productId: 'prod-fresa-leche', name: 'Jugo de Fresa con Leche', quantity: 1 }
    ],
    isActive: true,
    createdAt: '2026-11-10T10:00:00Z'
  }
];
