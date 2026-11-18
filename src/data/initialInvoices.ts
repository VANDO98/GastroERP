import type { DetailedPurchaseInvoice } from '../types';

/**
 * Registro de facturas de compras en memoria.
 * Se gestiona y sincroniza exclusivamente desde SQLite.
 */
export const initialDetailedInvoices: DetailedPurchaseInvoice[] = [];
