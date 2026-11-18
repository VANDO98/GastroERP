import type { MenuConfig } from '../types';

/**
 * Configuración inicial del menú en memoria.
 * 
 * NOTA DE ARQUITECTURA:
 * El menú completo (líneas, categorías, platos y recetas BOM) se lee y persiste
 * 100% en la base de datos central SQLite (data/erp_database.sqlite).
 * No se almacenan recetas quemadas en el código fuente del frontend.
 */
export const initialMenuConfig: MenuConfig = {
  version: '1.0.0',
  currency: 'PEN',
  lines: [],
  globalModifiers: []
};
