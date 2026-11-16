import express from 'express';
import { db } from '../db/database.js';
import { Server } from 'socket.io';

export function createApiRouter(io: Server) {
  const router = express.Router();

  // 1. Obtener estado inicial consolidado para la aplicación
  router.get('/bootstrap', (req, res) => {
    try {
      const companyConfigRow = db.prepare('SELECT data FROM company_config WHERE id = ?').get('current') as { data: string } | undefined;
      const tablesConfigRow = db.prepare('SELECT data FROM tables_config WHERE id = ?').get('current') as { data: string } | undefined;
      const menuConfigRow = db.prepare('SELECT data FROM menu_config WHERE id = ?').get('current') as { data: string } | undefined;

      const ingredientsRows = db.prepare('SELECT * FROM ingredients').all() as any[];
      const ingredients = ingredientsRows.map(row => ({
        id: row.id,
        code: row.code,
        name: row.name,
        itemType: row.item_type,
        category: row.category,
        unit: row.unit,
        stock: row.stock,
        minStock: row.min_stock,
        costPerUnit: row.cost_per_unit,
        isTaxAffected: Boolean(row.is_tax_affected),
        batches: JSON.parse(row.batches || '[]'),
        isIntermediateRecipe: Boolean(row.is_intermediate_recipe),
        recipeId: row.recipe_id
      }));

      const activeTablesRows = db.prepare('SELECT * FROM active_tables').all() as any[];
      const activeTables = activeTablesRows.map(row => ({
        tableId: row.table_id,
        tableName: row.table_name,
        status: row.status,
        orderId: row.order_id,
        total: row.total,
        customerName: row.customer_name,
        enableDisposables: Boolean(row.enable_disposables),
        manualDisposables: JSON.parse(row.manual_disposables || '[]'),
        items: JSON.parse(row.items || '[]'),
        sentToKitchenAt: row.sent_to_kitchen_at
      }));

      const ordersRows = db.prepare('SELECT data FROM sales_orders ORDER BY created_at DESC LIMIT 500').all() as { data: string }[];
      const orders = ordersRows.map(r => JSON.parse(r.data));

      const invoicesRows = db.prepare('SELECT data FROM purchase_invoices ORDER BY register_date DESC').all() as { data: string }[];
      const detailedInvoices = invoicesRows.map(r => JSON.parse(r.data));

      const poRows = db.prepare('SELECT data FROM purchase_orders ORDER BY created_at DESC').all() as { data: string }[];
      const purchaseOrders = poRows.map(r => JSON.parse(r.data));

      const toppingsRows = db.prepare('SELECT data FROM toppings_master').all() as { data: string }[];
      const toppingsMaster = toppingsRows.map(r => JSON.parse(r.data));

      const combosRows = db.prepare('SELECT data FROM combos WHERE is_active = 1').all() as { data: string }[];
      const combos = combosRows.map(r => JSON.parse(r.data));

      const suppliersRows = db.prepare('SELECT * FROM suppliers').all() as any[];
      const suppliers = suppliersRows.map(r => ({
        id: r.id,
        ruc: r.ruc,
        name: r.name,
        category: r.category,
        contact: r.contact,
        phone: r.phone,
        email: r.email,
        address: r.address,
        paymentCondition: r.payment_condition,
        isActive: Boolean(r.is_active)
      }));

      const wastesRows = db.prepare('SELECT * FROM wastes ORDER BY date DESC').all() as any[];
      const wastes = wastesRows.map(r => ({
        id: r.id,
        date: r.date,
        ingredientId: r.ingredient_id,
        ingredientName: r.ingredient_name,
        quantity: r.quantity,
        unit: r.unit,
        cost: r.cost,
        reason: r.reason,
        responsible: r.responsible,
        notes: r.notes
      }));

      const prodRows = db.prepare('SELECT data FROM production_orders ORDER BY created_at DESC').all() as { data: string }[];
      const productionOrders = prodRows.map(r => JSON.parse(r.data));

      const categoriesRows = db.prepare('SELECT name FROM custom_categories').all() as { name: string }[];
      const customCategories = categoriesRows.map(c => c.name);

      res.json({
        companyConfig: companyConfigRow ? JSON.parse(companyConfigRow.data) : null,
        tablesConfig: tablesConfigRow ? JSON.parse(tablesConfigRow.data) : [],
        menuConfig: menuConfigRow ? JSON.parse(menuConfigRow.data) : null,
        ingredients,
        activeTables,
        orders,
        detailedInvoices,
        purchaseOrders,
        toppingsMaster,
        combos,
        suppliers,
        wastes,
        productionOrders,
        customCategories
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 2. Actualizar configuración de la empresa
  router.post('/company-config', (req, res) => {
    try {
      const config = req.body;
      db.prepare('INSERT OR REPLACE INTO company_config (id, data, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)').run(
        'current',
        JSON.stringify(config)
      );
      io.emit('company_config:updated', config);
      res.json({ success: true, config });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 3. Guardar menú / recetas
  router.post('/menu-config', (req, res) => {
    try {
      const menu = req.body;
      db.prepare('INSERT OR REPLACE INTO menu_config (id, data, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)').run(
        'current',
        JSON.stringify(menu)
      );
      io.emit('menu:updated', menu);
      res.json({ success: true, menu });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 4. Actualizar insumos completos o lote
  router.post('/ingredients', (req, res) => {
    try {
      const ingredients = req.body as any[];
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO ingredients 
        (id, code, name, item_type, category, unit, stock, min_stock, cost_per_unit, is_tax_affected, batches, is_intermediate_recipe, recipe_id, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);

      const tx = db.transaction(() => {
        ingredients.forEach(ing => {
          stmt.run(
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
      });

      tx();
      io.emit('ingredients:updated', ingredients);
      res.json({ success: true, count: ingredients.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 5. Mesas y pedidos en vivo (Sincronización KDS y Salón)
  router.post('/tables', (req, res) => {
    try {
      const tables = req.body as any[];
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO active_tables 
        (table_id, table_name, status, order_id, total, customer_name, enable_disposables, manual_disposables, items, sent_to_kitchen_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);

      const tx = db.transaction(() => {
        tables.forEach(t => {
          stmt.run(
            t.tableId,
            t.tableName,
            t.status,
            t.orderId || null,
            t.total || 0,
            t.customerName || '',
            t.enableDisposables ? 1 : 0,
            JSON.stringify(t.manualDisposables || []),
            JSON.stringify(t.items || []),
            t.sentToKitchenAt || null
          );
        });
      });

      tx();
      io.emit('tables:updated', tables);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 6. Registro de ventas / cobro de comanda
  router.post('/orders', (req, res) => {
    try {
      const order = req.body;
      db.prepare(`
        INSERT OR REPLACE INTO sales_orders 
        (id, ticket_number, table_id, table_name, created_at, total, subtotal, tax, total_food_cost, payment_method, customer_name, order_type, status, data)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        order.id,
        order.ticketNumber,
        order.tableId || null,
        order.tableName || null,
        order.createdAt,
        order.total,
        order.subtotal,
        order.tax,
        order.totalFoodCost,
        order.paymentMethod,
        order.customerName || '',
        order.orderType,
        order.status || 'completado',
        JSON.stringify(order)
      );

      io.emit('order:created', order);
      res.json({ success: true, order });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 7. Registro de compras / facturas de proveedores
  router.post('/invoices', (req, res) => {
    try {
      const inv = req.body;
      db.prepare(`
        INSERT OR REPLACE INTO purchase_invoices 
        (id, code_number, register_date, purchase_date, document_type, series, number, supplier, subtotal, taxable_operation, unaffected_operation, taxes, total, status, data)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
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

      io.emit('invoice:created', inv);
      res.json({ success: true, invoice: inv });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 8. Proveedores
  router.post('/suppliers', (req, res) => {
    try {
      const suppliers = req.body as any[];
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO suppliers 
        (id, ruc, name, category, contact, phone, email, address, payment_condition, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const tx = db.transaction(() => {
        suppliers.forEach(s => {
          stmt.run(
            s.id,
            s.ruc || '',
            s.name,
            s.category || '',
            s.contact || '',
            s.phone || '',
            s.email || '',
            s.address || '',
            s.paymentCondition || '',
            s.isActive ? 1 : 0
          );
        });
      });

      tx();
      io.emit('suppliers:updated', suppliers);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 9. Mermas
  router.post('/wastes', (req, res) => {
    try {
      const w = req.body;
      db.prepare(`
        INSERT OR REPLACE INTO wastes 
        (id, date, ingredient_id, ingredient_name, quantity, unit, cost, reason, responsible, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        w.id,
        w.date,
        w.ingredientId,
        w.ingredientName,
        w.quantity,
        w.unit,
        w.cost,
        w.reason,
        w.responsible,
        w.notes || ''
      );

      io.emit('waste:created', w);
      res.json({ success: true, waste: w });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
