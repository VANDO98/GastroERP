import { db } from './database.js';
import { initialMenuConfig } from '../../src/data/menuConfig.js';
import { initialIngredients } from '../../src/data/initialInventory.js';
import { initialSuppliers } from '../../src/data/initialSuppliers.js';
import { initialCombos } from '../../src/data/initialCombos.js';
import { initialToppingsMaster } from '../../src/data/initialToppingsMaster.js';
import { initialTablesConfig } from '../../src/data/initialTablesConfig.js';
import { initialCompanyConfig } from '../../src/data/initialCompanyConfig.js';
import { initialDetailedInvoices } from '../../src/data/initialInvoices.js';
import { initialPurchaseOrders } from '../../src/data/initialPurchaseOrders.js';

export function seedDatabaseIfEmpty() {
  // Comprobar si ya existe menú configurado
  const menuRow = db.prepare('SELECT id FROM menu_config WHERE id = ?').get('current');
  if (menuRow) {
    return; // Ya está poblado o configurado
  }

  const transaction = db.transaction(() => {
    // 1. Configuración de la Empresa
    db.prepare('INSERT OR REPLACE INTO company_config (id, data) VALUES (?, ?)').run(
      'current',
      JSON.stringify(initialCompanyConfig)
    );

    // 2. Configuración de Mesas del salón
    db.prepare('INSERT OR REPLACE INTO tables_config (id, data) VALUES (?, ?)').run(
      'current',
      JSON.stringify(initialTablesConfig)
    );

    // Mesas iniciales en estado libre
    const insertTable = db.prepare(`
      INSERT OR REPLACE INTO active_tables 
      (table_id, table_name, status, total, customer_name, enable_disposables, manual_disposables, items)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    initialTablesConfig.forEach(t => {
      insertTable.run(
        t.id,
        t.numberName || t.id,
        'libre',
        0,
        '',
        1,
        '[]',
        '[]'
      );
    });

    // 3. Menú y Recetas
    db.prepare('INSERT OR REPLACE INTO menu_config (id, data) VALUES (?, ?)').run(
      'current',
      JSON.stringify(initialMenuConfig)
    );

    // 4. Insumos
    const insertIng = db.prepare(`
      INSERT OR REPLACE INTO ingredients 
      (id, code, name, item_type, category, unit, stock, min_stock, cost_per_unit, is_tax_affected, batches, is_intermediate_recipe, recipe_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    initialIngredients.forEach(ing => {
      insertIng.run(
        ing.id,
        ing.code || '',
        ing.name,
        ing.itemType,
        ing.category || '',
        ing.unit,
        ing.stock,
        ing.minStock,
        ing.costPerUnit,
        ing.isTaxAffected ? 1 : 0,
        JSON.stringify(ing.batches || []),
        ing.isIntermediateRecipe ? 1 : 0,
        ing.recipeId || null
      );
    });

    // 5. Proveedores
    const insertSup = db.prepare(`
      INSERT OR REPLACE INTO suppliers
      (id, ruc, name, category, contact, phone, email, address, payment_condition, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    initialSuppliers.forEach(s => {
      insertSup.run(
        s.id,
        s.ruc,
        s.name,
        s.category,
        s.contact,
        s.phone,
        s.email,
        s.address,
        s.paymentCondition,
        s.isActive ? 1 : 0
      );
    });

    // 6. Toppings Master
    const insertTopping = db.prepare(`
      INSERT OR REPLACE INTO toppings_master (id, name, category, price, cost, data)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    initialToppingsMaster.forEach(top => {
      insertTopping.run(
        top.id,
        top.name,
        top.category,
        top.price,
        top.cost,
        JSON.stringify(top)
      );
    });

    // 7. Combos
    const insertCombo = db.prepare(`
      INSERT OR REPLACE INTO combos (id, sku, name, short_name, price, data, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    initialCombos.forEach(c => {
      insertCombo.run(
        c.id,
        c.sku,
        c.name,
        c.shortName,
        c.price,
        JSON.stringify(c),
        c.isActive ? 1 : 0
      );
    });

    // 8. Facturas y Órdenes de compra iniciales si existieran
    const insertInvoice = db.prepare(`
      INSERT OR REPLACE INTO purchase_invoices
      (id, code_number, register_date, purchase_date, document_type, series, number, supplier, subtotal, taxable_operation, unaffected_operation, taxes, total, status, data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    initialDetailedInvoices.forEach(inv => {
      insertInvoice.run(
        inv.id,
        inv.codeNumber,
        inv.registerDate,
        inv.purchaseDate,
        inv.documentType,
        inv.series,
        inv.number,
        inv.supplier,
        inv.subtotal,
        inv.taxableOperation,
        inv.unaffectedOperation,
        inv.taxes,
        inv.total,
        inv.status,
        JSON.stringify(inv)
      );
    });

    const insertPo = db.prepare(`
      INSERT OR REPLACE INTO purchase_orders
      (id, order_number, supplier_id, supplier_name, status, total, data)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    initialPurchaseOrders.forEach(po => {
      insertPo.run(
        po.id,
        po.orderNumber,
        po.supplierId,
        po.supplierName,
        po.status,
        po.total,
        JSON.stringify(po)
      );
    });
  });

  transaction();
}
