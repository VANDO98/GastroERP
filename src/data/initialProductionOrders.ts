import type { ProductionOrder } from '../types';

/**
 * Órdenes de producción en memoria.
 * Se gestionan y sincronizan exclusivamente desde SQLite.
 */
export const initialProductionOrders: ProductionOrder[] = [];
