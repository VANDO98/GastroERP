import type { TableConfig } from '../types';

export const initialTablesConfig: TableConfig[] = [
  { id: 'mesa-1', numberName: 'Mesa 1', zone: 'salon', capacity: 4, isActive: true },
  { id: 'mesa-2', numberName: 'Mesa 2', zone: 'salon', capacity: 4, isActive: true },
  { id: 'mesa-3', numberName: 'Mesa 3', zone: 'salon', capacity: 2, isActive: true },
  { id: 'mesa-4', numberName: 'Mesa 4', zone: 'salon', capacity: 4, isActive: true },
  { id: 'mesa-5', numberName: 'Mesa 5', zone: 'salon', capacity: 6, isActive: true },
  { id: 'mesa-6', numberName: 'Mesa 6', zone: 'salon', capacity: 4, isActive: true },
  { id: 'terraza-1', numberName: 'Terraza 1', zone: 'terraza', capacity: 4, isActive: true },
  { id: 'barra', numberName: 'Barra', zone: 'barra', capacity: 3, isActive: true },
  { id: 'llevar', numberName: 'Para Llevar 1', zone: 'llevar', capacity: 1, isActive: true }
];
