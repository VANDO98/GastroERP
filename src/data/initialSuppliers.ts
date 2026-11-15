import type { Supplier } from '../types';

// Proveedores iniciales del rubro juguería / fuente de soda - Carabayllo
export const initialSuppliers: Supplier[] = [
  {
    id: 'prv-001',
    code: 'PRV-001',
    name: 'MERCADO MAYORISTA DE FRUTAS SANTA ANITA',
    ruc: '20100047359',
    phone: '01-3621900',
    email: 'ventas@mercadofrutas.pe',
    address: 'Av. Nicolas Ayllón 4800, Santa Anita, Lima',
    category: 'frutas_verduras',
    isActive: true,
    notes: 'Proveedor principal de frutas frescas de temporada. Entrega lunes, miércoles y viernes.',
    createdAt: '2026-01-10T08:00:00Z'
  },
  {
    id: 'prv-002',
    code: 'PRV-002',
    name: 'GLORIA S.A. - DISTRIBUIDORA LIMA NORTE',
    ruc: '20100190797',
    phone: '01-6134000',
    email: 'distribuidora.limanorte@gloria.com.pe',
    address: 'Av. Panamericana Norte Km 23, Carabayllo, Lima',
    category: 'lacteos_derivados',
    isActive: true,
    notes: 'Leche fresca, leche UHT, crema chantilly. Crédito a 15 días.',
    createdAt: '2026-01-10T08:00:00Z'
  },
  {
    id: 'prv-003',
    code: 'PRV-003',
    name: 'AVÍCOLA SANTA ELENA - CARABAYLLO',
    ruc: '20516638736',
    phone: '01-5240800',
    email: 'ventas@avicola-se.com.pe',
    address: 'Carretera a Canta Km 4, Carabayllo, Lima',
    category: 'proteinas_carnes',
    isActive: true,
    notes: 'Pollo entero, pechuga deshuesada, huevos frescos de granja. Entrega diaria.',
    createdAt: '2026-01-10T08:00:00Z'
  },
  {
    id: 'prv-004',
    code: 'PRV-004',
    name: 'DISTRIBUIDORA MAKRO - COMAS',
    ruc: '20419026809',
    phone: '01-5306200',
    email: 'atencion.cliente@makro.pe',
    address: 'Av. Universitaria Norte 6180, Los Olivos, Lima',
    category: 'abarrotes_secos',
    isActive: true,
    notes: 'Azúcar, harina, aceite vegetal, café en grano. Pago al contado. Frecuencia semanal.',
    createdAt: '2026-01-10T08:00:00Z'
  },
  {
    id: 'prv-005',
    code: 'PRV-005',
    name: 'PLASTICENTRO DEL NORTE SAC',
    ruc: '20507823441',
    phone: '997-123-456',
    email: 'ventas@plasticentronorte.pe',
    address: 'Jr. Los Rosales 348, Carabayllo, Lima',
    category: 'descartables_envases',
    isActive: true,
    notes: 'Vasos PET, sorbetes kraft, cajas biodegradables, bolsas delivery. Pedido mínimo S/ 100.',
    createdAt: '2026-01-10T08:00:00Z'
  },
  {
    id: 'prv-006',
    code: 'PRV-006',
    name: 'SODIMAC HOMECENTER - COMAS',
    ruc: '20331376977',
    phone: '01-6116000',
    email: 'corporativo@sodimac.com.pe',
    address: 'Av. Universitaria Norte 5900, Los Olivos, Lima',
    category: 'limpieza_consumibles',
    isActive: true,
    notes: 'Lejía, detergente industrial, papel toalla, bolsas de residuos. Compras ocasionales.',
    createdAt: '2026-01-10T08:00:00Z'
  }
];
