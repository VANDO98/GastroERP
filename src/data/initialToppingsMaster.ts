import type { ToppingMaster } from '../types';

/**
 * Catálogo maestro de toppings y adicionales.
 * Se gestiona y sincroniza exclusivamente desde SQLite vía /api/bootstrap.
 */
export const initialToppingsMaster: ToppingMaster[] = [];
