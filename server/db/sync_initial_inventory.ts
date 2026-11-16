import { db } from './database.js';
import fs from 'fs';
import path from 'path';

const rows = db.prepare('SELECT * FROM ingredients').all() as any[];

const ingredients = rows.map(r => ({
  id: r.id,
  code: r.code,
  name: r.name,
  itemType: r.item_type,
  category: r.category,
  unit: r.unit,
  stock: r.stock,
  minStock: r.min_stock,
  costPerUnit: r.cost_per_unit,
  isTaxAffected: Boolean(r.is_tax_affected),
  batches: JSON.parse(r.batches || '[]'),
  isIntermediateRecipe: Boolean(r.is_intermediate_recipe),
  recipeId: r.recipe_id || undefined
}));

const content = `import type { Ingredient } from '../types';\n\nexport const initialIngredients: Ingredient[] = ${JSON.stringify(ingredients, null, 2)};\n`;

fs.writeFileSync(path.resolve('src/data/initialInventory.ts'), content, 'utf-8');
console.log(`✓ ${ingredients.length} insumos sincronizados en src/data/initialInventory.ts`);

