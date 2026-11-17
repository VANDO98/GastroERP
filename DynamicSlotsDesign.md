# Arquitectura del Sistema de Categorías Dinámicas & Slots de Elección

Este documento detalla el funcionamiento del sistema dinámico de categorías de insumos y su integración con los *slots* de elección (sabores, tipos de pan, salsas, etc.) en recetas y pedidos POS.

---

## 1. Principio Fundamental: Categorías Operativas vs. Categorías de Selección

En un ERP gastronómico real, no todas las materias primas son aptas para ofrecerlas a elección del cliente:
- **Categorías de Gestión / Compras e Inventario Interno (`isSlotCategory = false`)**:  
  Ejemplo: *Abarrotes & Secos* (harina, azúcar, sal), *Limpieza & Químicos* (lejía, detergente), *Empaques & Descartables*.  
  *Comportamiento:* Se controlan en inventario, compras y mermas, pero **nunca** aparecen en los menús de elección al mozo o cliente.
- **Categorías de Selección / Slots en Recetas & POS (`isSlotCategory = true`)**:  
  Ejemplo: *Sabores de Helado* (vainilla, chocolate, fresa, lúcuma), *Panadería & Panes* (ciabatta, croissant, francés, molde), *Jarabes, Salsas & Coberturas* (fudge, caramelo).  
  *Comportamiento:* El usuario decide habilitarlas para que aparezcan en el creador de recetas como ranuras de selección (*slots*).

---

## 2. Estructura en Base de Datos SQLite

La tabla `ingredient_categories` almacena centralmente las categorías con sincronización en tiempo real vía WebSockets:

```sql
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
```

### Categorías Semilla Configuradas:
| ID | Etiqueta | Icono | Unidad Defecto | Porción Defecto | ¿Disponible en Slots? |
|---|---|---|---|---|---|
| `helados` | Sabores de Helado | 🍨 | L | 0.07 L | **Sí (`true`)** |
| `panaderia` | Panadería & Panes | 🥖 | und | 1 und | **Sí (`true`)** |
| `jarabes_bases` | Jarabes, Salsas & Coberturas | 🍯 | L | 0.03 L | **Sí (`true`)** |
| `frutas` | Frutas Frescas | 🍓 | kg | 0.08 kg | No (`false`) |
| `lacteos` | Lácteos & Derivados | 🥛 | L | 0.15 L | No (`false`) |
| `proteinas` | Proteínas & Fiambres | 🥩 | kg | 0.05 kg | No (`false`) |
| `abarrotes` | Abarrotes & Secos | 🌾 | kg | 0.05 kg | No (`false`) |
| `descartables` | Empaques & Descartables | 📦 | und | 1 und | No (`false`) |
| `consumibles` | Limpieza & Químicos | 🧼 | und | 1 und | No (`false`) |

---

## 3. Flujo en la Interfaz de Usuario (UI)

### A. Módulo de Insumos (`IngredientsModule`)
1. **Panel Lateral de Categorías:**  
   - Muestra cada categoría con su icono, nombre, contador de artículos y un distintivo `🎯 Slot` si está habilitada para selección.
   - Botón `+ Nueva` abre el modal para crear nuevas categorías libres (ej: *Bases de Jugo*, *Quesos Especiales*, etc.).
   - Al pasar el cursor sobre cualquier categoría, aparecen botones para **Editar** (cambiar nombre, icono, unidad o activar/desactivar el interruptor de Slot) o **Eliminar** (si no tiene insumos asociados).
2. **Reasignación Rápida de Categorías en la Tabla:**  
   - Al hacer clic en el lápiz de edición de cualquier fila, la columna "Categoría" se convierte en un `<select>` que permite reasignar el insumo a cualquier categoría con 1 clic.

### B. Módulo de Recetas (`RecipesModule`)
1. **Ranuras de Insumo Variable / A Elección:**  
   - En el desplegable de categoría del slot, **únicamente aparecen las categorías con `isSlotCategory === true`** (*Sabores de Helado*, *Panadería*, *Jarabes*, etc.). Categorías como *Abarrotes* o *Limpieza* quedan excluidas.
   - Al elegir la categoría, se precargan su unidad y porción por defecto.
   - Se listan los insumos de esa categoría para restringir o permitir opciones específicas si se desea.
2. **Costeo Proyectado:**  
   - Calcula el promedio ponderado del costo de los insumos permitidos en el slot para proyectar el Food Cost real de la receta.

### C. Punto de Venta (`PosModule`)
1. **Toma de Comanda:**  
   - Al abrir platos con slots (ej. Banana Split, Sándwiches con pan a elección, Waffles con salsa a elección), el modal muestra los botones con stock en tiempo real y el icono de la categoría.
   - Selecciona automáticamente la primera opción disponible de esa categoría específica en lugar de recurrir a valores hardcodeados.

---

## 4. Persistencia y Eliminación de Código Hardcodeado

- `src/data/initialInventory.ts` se redujo a un arreglo vacío (`[]`). Toda la carga inicial y operativa proviene directamente de SQLite (`data/erp_database.sqlite`).
- Nuevas categorías, modificaciones de insumos y slots se sincronizan al instante vía Socket.io a todas las pantallas (POS, KDS, Producción y Administración).

