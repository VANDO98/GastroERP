import type { CompanyConfig } from '../types';

/**
 * Datos de la empresa en memoria.
 * Se gestionan y sincronizan exclusivamente desde SQLite.
 */
export const initialCompanyConfig: CompanyConfig = {
  businessName: '',
  tradeName: '',
  ruc: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  currency: 'PEN',
  notes: ''
};
