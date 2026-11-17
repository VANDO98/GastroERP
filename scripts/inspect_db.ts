import { db } from '../server/db/database.js';

console.log('--- ACTIVE TABLES ---');
const tables = db.prepare('SELECT table_id, table_name, status, total, customer_name, length(items) as items_len FROM active_tables').all();
console.table(tables);

console.log('--- SALES ORDERS ---');
const sales = db.prepare('SELECT COUNT(*) as count, SUM(total) as total_ventas FROM sales_orders').get();
console.log(sales);

console.log('--- INGREDIENTS COUNT BY TYPE ---');
const ingTypes = db.prepare('SELECT item_type, COUNT(*) as count FROM ingredients GROUP BY item_type').all();
console.table(ingTypes);

console.log('--- INGREDIENT CATEGORIES ---');
const cats = db.prepare('SELECT * FROM ingredient_categories').all();
console.table(cats);

