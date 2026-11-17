import { db } from '../server/db/database.js';

console.log('Ingredients with empty category:');
console.log(db.prepare("SELECT id, name, item_type, category FROM ingredients WHERE category = '' OR category IS NULL").all());

