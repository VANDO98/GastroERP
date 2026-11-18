import type { PurchaseOrder } from '../types';

/**
 * Órdenes de compra en memoria.
 * Se gestionan y sincronizan exclusivamente desde SQLite.
 */
export const initialPurchaseOrders: PurchaseOrder[] = [];
