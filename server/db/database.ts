import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base de datos SQLite única en disco (persistente y portable)
const dbPath = path.resolve(__dirname, '../../data/erp_database.sqlite');
export const db = new Database(dbPath);

// Habilitar claves foráneas y modo WAL para concurrencia en red local
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    -- Configuración general del local
    CREATE TABLE IF NOT EXISTS company_config (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Configuración de mesas del local
    CREATE TABLE IF NOT EXISTS tables_config (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Carta / Menú y recetas (100% dinámico y configurable)
    CREATE TABLE IF NOT EXISTS menu_config (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Insumos y Materias Primas con control de lotes y stock
    CREATE TABLE IF NOT EXISTS ingredients (
      id TEXT PRIMARY KEY,
      code TEXT,
      name TEXT NOT NULL,
      item_type TEXT NOT NULL,
      category TEXT,
      unit TEXT NOT NULL,
      stock REAL NOT NULL DEFAULT 0,
      min_stock REAL NOT NULL DEFAULT 0,
      cost_per_unit REAL NOT NULL DEFAULT 0,
      is_tax_affected INTEGER NOT NULL DEFAULT 1,
      batches TEXT DEFAULT '[]',
      is_intermediate_recipe INTEGER DEFAULT 0,
      recipe_id TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Maestro de Toppings y Adicionales
    CREATE TABLE IF NOT EXISTS toppings_master (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT,
      price REAL NOT NULL DEFAULT 0,
      cost REAL NOT NULL DEFAULT 0,
      data TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Combos y Promociones
    CREATE TABLE IF NOT EXISTS combos (
      id TEXT PRIMARY KEY,
      sku TEXT,
      name TEXT NOT NULL,
      short_name TEXT,
      price REAL NOT NULL,
      data TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Proveedores del local
    CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      ruc TEXT,
      name TEXT NOT NULL,
      category TEXT,
      contact TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      payment_condition TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Compras detalladas (Facturas / Boletas de insumos)
    CREATE TABLE IF NOT EXISTS purchase_invoices (
      id TEXT PRIMARY KEY,
      code_number TEXT,
      register_date TEXT,
      purchase_date TEXT,
      document_type TEXT,
      series TEXT,
      number TEXT,
      supplier TEXT,
      subtotal REAL,
      taxable_operation REAL,
      unaffected_operation REAL,
      taxes REAL,
      total REAL,
      status TEXT DEFAULT 'Activo',
      data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Órdenes de Compra a Proveedores
    CREATE TABLE IF NOT EXISTS purchase_orders (
      id TEXT PRIMARY KEY,
      order_number TEXT,
      supplier_id TEXT,
      supplier_name TEXT,
      status TEXT,
      total REAL,
      data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Mermas y Desperdicios operativos
    CREATE TABLE IF NOT EXISTS wastes (
      id TEXT PRIMARY KEY,
      date TEXT,
      ingredient_id TEXT,
      ingredient_name TEXT,
      quantity REAL,
      unit TEXT,
      cost REAL,
      reason TEXT,
      responsible TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Órdenes de Producción (Subrecetas / Lotes base)
    CREATE TABLE IF NOT EXISTS production_orders (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Mesas activas en salón (Estado en tiempo real)
    CREATE TABLE IF NOT EXISTS active_tables (
      table_id TEXT PRIMARY KEY,
      table_name TEXT NOT NULL,
      status TEXT NOT NULL,
      order_id TEXT,
      total REAL DEFAULT 0,
      customer_name TEXT,
      enable_disposables INTEGER DEFAULT 1,
      manual_disposables TEXT DEFAULT '[]',
      items TEXT DEFAULT '[]',
      sent_to_kitchen_at TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Historial de Ventas / Pedidos cobrados
    CREATE TABLE IF NOT EXISTS sales_orders (
      id TEXT PRIMARY KEY,
      ticket_number INTEGER,
      table_id TEXT,
      table_name TEXT,
      created_at TEXT,
      total REAL NOT NULL,
      subtotal REAL,
      tax REAL,
      total_food_cost REAL,
      payment_method TEXT,
      customer_name TEXT,
      order_type TEXT,
      status TEXT DEFAULT 'completado',
      data TEXT NOT NULL
    );

    -- Categorías personalizadas de insumos
    CREATE TABLE IF NOT EXISTS custom_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    );
  `);
}

