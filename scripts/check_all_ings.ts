import { db } from '../server/db/database.js';

const rows = db.prepare("SELECT id, name, category, item_type FROM ingredients ORDER BY category, name").all();
console.log(JSON.stringify(rows, null, 2));

