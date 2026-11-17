import { db } from '../server/db/database.js';

const helados = db.prepare("SELECT id, code, name, stock, unit, category FROM ingredients WHERE id LIKE '%helado%' OR category = 'helados'").all();
console.table(helados);

