import type { Ingredient } from '../types';

/**
 * Inventario inicial en memoria.
 * 
 * NOTA DE ARQUITECTURA:
 * El sistema ahora lee el 100% de los insumos y materias primas directamente
 * desde la base de datos persistente SQLite (data/erp_database.sqlite) vía /api/bootstrap.
 * No se utiliza inventario hardcodeado en archivos de código fuente.
 */
export const initialIngredients: Ingredient[] = [];
