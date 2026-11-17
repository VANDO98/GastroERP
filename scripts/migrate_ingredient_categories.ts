import { db } from '../server/db/database.js';

export function runMigration() {
  console.log('Iniciando migración de categorías de insumos...');

  // 1. Crear tabla ingredient_categories si no existe
  db.exec(`
    CREATE TABLE IF NOT EXISTS ingredient_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      label TEXT NOT NULL,
      icon TEXT DEFAULT '🏷️',
      default_unit TEXT DEFAULT 'und',
      default_qty REAL DEFAULT 1,
      is_slot_category INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Verificar si ya existen categorías
  const count = (db.prepare('SELECT count(*) as count FROM ingredient_categories').get() as { count: number }).count;

  if (count === 0) {
    console.log('Poblando categorías iniciales...');
    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO ingredient_categories (id, name, label, icon, default_unit, default_qty, is_slot_category)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const defaultCats = [
      {
        id: 'helados',
        name: 'helados',
        label: 'Sabores de Helado',
        icon: '🍨',
        default_unit: 'L',
        default_qty: 0.07,
        is_slot_category: 1
      },
      {
        id: 'panaderia',
        name: 'panaderia',
        label: 'Panadería & Panes',
        icon: '🥖',
        default_unit: 'und',
        default_qty: 1,
        is_slot_category: 1
      },
      {
        id: 'jarabes_bases',
        name: 'jarabes_bases',
        label: 'Jarabes, Salsas & Coberturas',
        icon: '🍯',
        default_unit: 'L',
        default_qty: 0.03,
        is_slot_category: 1
      },
      {
        id: 'frutas',
        name: 'frutas',
        label: 'Frutas Frescas',
        icon: '🍓',
        default_unit: 'kg',
        default_qty: 0.08,
        is_slot_category: 0
      },
      {
        id: 'lacteos',
        name: 'lacteos',
        label: 'Lácteos & Derivados',
        icon: '🥛',
        default_unit: 'L',
        default_qty: 0.15,
        is_slot_category: 0
      },
      {
        id: 'proteinas',
        name: 'proteinas',
        label: 'Proteínas & Fiambres',
        icon: '🥩',
        default_unit: 'kg',
        default_qty: 0.05,
        is_slot_category: 0
      },
      {
        id: 'abarrotes',
        name: 'abarrotes',
        label: 'Abarrotes & Secos',
        icon: '🌾',
        default_unit: 'kg',
        default_qty: 0.05,
        is_slot_category: 0
      },
      {
        id: 'descartables',
        name: 'descartables',
        label: 'Empaques & Descartables',
        icon: '📦',
        default_unit: 'und',
        default_qty: 1,
        is_slot_category: 0
      },
      {
        id: 'consumibles',
        name: 'consumibles',
        label: 'Limpieza & Químicos',
        icon: '🧼',
        default_unit: 'und',
        default_qty: 1,
        is_slot_category: 0
      }
    ];

    const tx = db.transaction(() => {
      for (const cat of defaultCats) {
        insertStmt.run(cat.id, cat.name, cat.label, cat.icon, cat.default_unit, cat.default_qty, cat.is_slot_category);
      }
    });
    tx();
  }

  // 3. Separar los helados de 'lacteos' hacia la categoría 'helados'
  console.log('Reclasificando helados hacia categoría "helados"...');
  db.prepare(`
    UPDATE ingredients 
    SET category = 'helados' 
    WHERE id LIKE '%helado%' OR name LIKE '%Helado%'
  `).run();

  // 4. Si hay descartables o consumibles con category vacía, asignarle su categoría
  db.prepare(`
    UPDATE ingredients 
    SET category = 'descartables' 
    WHERE (category = '' OR category IS NULL) AND item_type = 'descartable'
  `).run();

  db.prepare(`
    UPDATE ingredients 
    SET category = 'consumibles' 
    WHERE (category = '' OR category IS NULL) AND item_type = 'consumible'
  `).run();

  console.log('Migración completada con éxito.');
  console.log('Categorías en BD:');
  console.log(db.prepare('SELECT * FROM ingredient_categories').all());
  console.log('Distribución de insumos por categoría:');
  console.log(db.prepare('SELECT category, count(*) as count FROM ingredients GROUP BY category').all());
}

runMigration();

