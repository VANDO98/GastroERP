import { db } from '../server/db/database.js';

console.log('Tables:');
console.log(db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all());

console.log('\nCustom categories:');
console.log(db.prepare('SELECT * FROM custom_categories').all());

console.log('\nCategories in ingredients:');
console.log(db.prepare('SELECT DISTINCT category, count(*) as count FROM ingredients GROUP BY category').all());

