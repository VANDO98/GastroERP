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

      const ingCatRows = db.prepare('SELECT * FROM ingredient_categories ORDER BY label ASC').all() as any[];
      const ingredientCategories = ingCatRows.map(c => ({
        id: c.id,
        name: c.name,
        label: c.label,
        icon: c.icon || '🏷️',
        defaultUnit: c.default_unit || 'und',
        defaultQty: Number(c.default_qty) || 1,
        isSlotCategory: Boolean(c.is_slot_category)
      }));

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
        customCategories,
        ingredientCategories
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

  // 4. Actualizar insumos completos o lote (persistencia estricta en SQLite)
  router.post('/ingredients', (req, res) => {
    try {
      const ingredients = req.body as any[];
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO ingredients 
        (id, code, name, item_type, category, unit, stock, min_stock, cost_per_unit, is_tax_affected, batches, is_intermediate_recipe, recipe_id, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);

      const tx = db.transaction(() => {
        const currentIds = ingredients.map(i => i.id);
        if (currentIds.length > 0) {
          const placeholders = currentIds.map(() => '?').join(',');
          db.prepare(`DELETE FROM ingredients WHERE id NOT IN (${placeholders})`).run(...currentIds);
        } else {
          db.prepare('DELETE FROM ingredients').run();
        }
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
      const senderSocketId = req.headers['x-socket-id'] as string | undefined;

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

      // Emitir solo a los DEMÁS dispositivos si conocemos al remitente; si no, a todos
      if (senderSocketId && io.sockets.sockets.has(senderSocketId)) {
        io.sockets.sockets.get(senderSocketId)?.broadcast.emit('tables:updated', tables);
      } else {
        io.emit('tables:updated', tables);
      }

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

  // 10. Órdenes de Producción (Mise en Place / Subrecetas)
  router.post('/production-orders', (req, res) => {
    try {
      const op = req.body;
      db.prepare(`
        INSERT OR REPLACE INTO production_orders 
        (id, data, created_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `).run(op.id, JSON.stringify(op));

      io.emit('production_order:created', op);
      res.json({ success: true, order: op });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  router.delete('/production-orders/:id', (req, res) => {
    try {
      const { id } = req.params;
      db.prepare('DELETE FROM production_orders WHERE id = ?').run(id);
      io.emit('production_order:deleted', id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 11. Configuración de Mesas del Local
  router.post('/tables-config', (req, res) => {
    try {
      const tablesConfig = req.body;
      db.prepare('INSERT OR REPLACE INTO tables_config (id, data, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)').run(
        'current',
        JSON.stringify(tablesConfig)
      );
      io.emit('tables_config:updated', tablesConfig);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 12. Maestro de Toppings y Adicionales
  router.post('/toppings-master', (req, res) => {
    try {
      const toppings = req.body as any[];
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO toppings_master 
        (id, name, category, price, cost, data, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);
      const tx = db.transaction(() => {
        const ids = toppings.map(t => t.id);
        if (ids.length > 0) {
          const ph = ids.map(() => '?').join(',');
          db.prepare(`DELETE FROM toppings_master WHERE id NOT IN (${ph})`).run(...ids);
        } else {
          db.prepare('DELETE FROM toppings_master').run();
        }
        toppings.forEach(t => {
          stmt.run(t.id, t.name, t.category || '', t.price || 0, t.cost || 0, JSON.stringify(t));
        });
      });
      tx();
      io.emit('toppings:updated', toppings);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 13. Órdenes de Compra (OC)
  router.post('/purchase-orders', (req, res) => {
    try {
      const orders = req.body as any[];
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO purchase_orders 
        (id, order_number, supplier_id, supplier_name, status, total, data, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const tx = db.transaction(() => {
        orders.forEach(po => {
          stmt.run(
            po.id,
            po.poNumber || po.orderNumber || '',
            po.supplierId || '',
            po.supplierName || '',
            po.status || 'borrador',
            po.total || 0,
            JSON.stringify(po),
            po.createdAt || new Date().toISOString()
          );
        });
      });
      tx();
      io.emit('purchase_orders:updated', orders);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 14. Combos y Promociones
  router.post('/combos', (req, res) => {
    try {
      const combos = req.body as any[];
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO combos 
        (id, sku, name, short_name, price, data, is_active, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const tx = db.transaction(() => {
        combos.forEach(c => {
          stmt.run(
            c.id,
            c.sku || '',
            c.name,
            c.shortName || '',
            c.price,
            JSON.stringify(c),
            c.isActive ? 1 : 0,
            c.createdAt || new Date().toISOString()
          );
        });
      });
      tx();
      io.emit('combos:updated', combos);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 15. Categorías personalizadas
  router.post('/custom-categories', (req, res) => {
    try {
      const categories = req.body as string[];
      const stmt = db.prepare('INSERT OR REPLACE INTO custom_categories (name) VALUES (?)');
      const tx = db.transaction(() => {
        db.prepare('DELETE FROM custom_categories').run();
        categories.forEach(name => stmt.run(name));
      });
      tx();
      io.emit('custom_categories:updated', categories);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 16. Maestro Central de Categorías de Insumos (con control de Slots para Recetas y POS)
  router.get('/ingredient-categories', (_req, res) => {
    try {
      const rows = db.prepare('SELECT * FROM ingredient_categories ORDER BY label ASC').all() as any[];
      const categories = rows.map(c => ({
        id: c.id,
        name: c.name,
        label: c.label,
        icon: c.icon || '🏷️',
        defaultUnit: c.default_unit || 'und',
        defaultQty: Number(c.default_qty) || 1,
        isSlotCategory: Boolean(c.is_slot_category)
      }));
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/ingredient-categories', (req, res) => {
    try {
      const { id, name, label, icon, defaultUnit, defaultQty, isSlotCategory } = req.body;
      const cleanName = (name || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
      const catId = id || cleanName || `cat_${Date.now()}`;
      const catLabel = label || name || 'Nueva Categoría';

      const stmt = db.prepare(`
        INSERT INTO ingredient_categories (id, name, label, icon, default_unit, default_qty, is_slot_category, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          label = excluded.label,
          icon = excluded.icon,
          default_unit = excluded.default_unit,
          default_qty = excluded.default_qty,
          is_slot_category = excluded.is_slot_category,
          updated_at = CURRENT_TIMESTAMP
      `);

      stmt.run(
        catId,
        cleanName || catId,
        catLabel,
        icon || '🏷️',
        defaultUnit || 'und',
        Number(defaultQty) || 1,
        isSlotCategory ? 1 : 0
      );

      const allRows = db.prepare('SELECT * FROM ingredient_categories ORDER BY label ASC').all() as any[];
      const categories = allRows.map(c => ({
        id: c.id,
        name: c.name,
        label: c.label,
        icon: c.icon || '🏷️',
        defaultUnit: c.default_unit || 'und',
        defaultQty: Number(c.default_qty) || 1,
        isSlotCategory: Boolean(c.is_slot_category)
      }));

      io.emit('ingredient_categories:updated', categories);
      res.json({ success: true, category: { id: catId, name: cleanName, label: catLabel, icon, defaultUnit, defaultQty, isSlotCategory: Boolean(isSlotCategory) } });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  router.put('/ingredient-categories/:id', (req, res) => {
    try {
      const { id } = req.params;
      const { name, label, icon, defaultUnit, defaultQty, isSlotCategory } = req.body;

      db.prepare(`
        UPDATE ingredient_categories
        SET name = COALESCE(?, name),
            label = COALESCE(?, label),
            icon = COALESCE(?, icon),
            default_unit = COALESCE(?, default_unit),
            default_qty = COALESCE(?, default_qty),
            is_slot_category = COALESCE(?, is_slot_category),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        name ? name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_') : null,
        label ? label.trim() : null,
        icon ?? null,
        defaultUnit ?? null,
        defaultQty !== undefined ? Number(defaultQty) : null,
        isSlotCategory !== undefined ? (isSlotCategory ? 1 : 0) : null,
        id
      );

      const allRows = db.prepare('SELECT * FROM ingredient_categories ORDER BY label ASC').all() as any[];
      const categories = allRows.map(c => ({
        id: c.id,
        name: c.name,
        label: c.label,
        icon: c.icon || '🏷️',
        defaultUnit: c.default_unit || 'und',
        defaultQty: Number(c.default_qty) || 1,
        isSlotCategory: Boolean(c.is_slot_category)
      }));

      io.emit('ingredient_categories:updated', categories);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  router.delete('/ingredient-categories/:id', (req, res) => {
    try {
      const { id } = req.params;
      // Verificar si hay insumos asociados
      const inUse = db.prepare('SELECT count(*) as count FROM ingredients WHERE category = ?').get(id) as { count: number };
      if (inUse && inUse.count > 0) {
        return res.status(400).json({ error: `No se puede eliminar la categoría porque tiene ${inUse.count} insumo(s) asignado(s).` });
      }

      db.prepare('DELETE FROM ingredient_categories WHERE id = ?').run(id);

      const allRows = db.prepare('SELECT * FROM ingredient_categories ORDER BY label ASC').all() as any[];
      const categories = allRows.map(c => ({
        id: c.id,
        name: c.name,
        label: c.label,
        icon: c.icon || '🏷️',
        defaultUnit: c.default_unit || 'und',
        defaultQty: Number(c.default_qty) || 1,
        isSlotCategory: Boolean(c.is_slot_category)
      }));

      io.emit('ingredient_categories:updated', categories);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}

