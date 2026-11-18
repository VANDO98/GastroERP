import type { Supplier } from '../types';

/**
 * Directorio de proveedores en memoria.
 * Se gestiona y sincroniza exclusivamente desde SQLite.
 */
export const initialSuppliers: Supplier[] = [];
