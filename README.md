# 🍽️ GastroERP - Sistema Modular de POS, KDS y Gestión Gastronómica Universal

> **Plataforma Integral de Punto de Venta (POS), Pantalla de Cocina (KDS) y Control Operativo (ERP) con Arquitectura Dinámica y Agnóstica para Negocios Gastronómicos.**

---

## 🌟 Descripción General

**GastroERP** es una solución de software empresarial de código abierto diseñada para operar eficientemente en restaurantes, cafeterías, bares, pastelerías, heladerías, fuentes de soda y cadenas de comida rápida. 

A diferencia de los sistemas tradicionales con estructuras rígidas, **GastroERP implementa una arquitectura 100% desacoplada y genérica**: no asume nombres de categorías, productos ni ingredientes quemados en código. Toda la configuración del menú, cartas, líneas de despacho, insumos, presentaciones y mesas se define y persiste dinámicamente en una base de datos local **SQLite** con sincronización en tiempo real vía **WebSockets**.

---

## 🚀 Módulos del Sistema

### 1. 🛒 Punto de Venta (POS) Táctil & Salón de Mesas
- **Salón Visual & Mesas:** Vista gráfica del salón con estados en vivo: *Libre*, *En Preparación*, *Por Cobrar* y *Despachado*.
- **Pedidos para Llevar & Delivery:** Gestión independiente de pedidos de mostrador con empaque para llevar.
- **Ranuras Dinámicas a Elección (*Option/Flavor Slots*):**
  - Permite configurar productos personalizables con slots obligatorios u opcionales (ej. *Tipo de Pan*, *Sabor de Helado*, *Tipo de Leche*, *Guarnición a Elección*).
  - Los slots se enlazan dinámicamente a cualquier categoría maestra de insumos creada por el usuario.
- **Presentaciones de Servido Multidimensionales:**
  - Configuración libre de formas de consumo (ej. *En Cono Barquillo*, *En Vaso + Cucharita*, *Para Llevar en Caja*).
  - Deducción automática y combinada de múltiples descartables por presentación (ej. 1 caja + 1 bolsa + 2 servilletas).
- **Adicionales & Toppings Maestros:** Selección de extras simples o con variantes vinculadas a inventario con recargo y deducción por gramaje.

### 2. ⏱️ Kitchen Display System (KDS) en Tiempo Real
- Pantalla táctil interactiva para cocina y barra de preparación.
- Recepción instantánea de comandas por WebSockets sin recargar página.
- Visualización detallada de especificaciones de cocina, variantes elegidas y presentaciones.
- Marcado de ítems listos con temporizador de despacho lean en vivo.

### 3. 📋 Ingeniería de Menú & Recetas (BOM - Bill of Materials)
- **Recetas Finales, Intermedias y Subrecetas de Producción:**
  - Desglose riguroso de ingredientes comestibles y empaques descartables.
- **Calculadora de Costos & Food Cost en Vivo:**
  - Costo comestible neto vs. costo total con empaques.
  - Cálculo automático de precios de venta sugeridos (30% meta, 45% piso de quiebre).
- **Correlativo Inteligente de SKU:** Derivación automática según la línea de producto.
- **Categorías y Líneas 100% Configurables:** Creación libre de líneas de despacho (ej. *Línea Fría*, *Línea Caliente*, *Cafetería*, *Bar*) y categorías personalizadas.

### 4. 📦 Inventario Maestro & Kárdex Valorizado (FIFO)
- **Control de Materias Primas, Consumibles y Descartables:**
  - Unidades de medida estándar (`kg`, `L`, `und`) con control de decimales de alta precisión.
  - Alertas automáticas de stock mínimo y reposición.
- **Trazabilidad por Lotes (FIFO):**
  - Valorización de salidas de almacén bajo el principio de Primeras Entradas, Primeras Salidas (*First In, First Out*).
  - Recálculo dinámico del costo promedio ponderado.
- **Categorías Maestras con Flags de Selección:**
  - Definición de categorías marcadas como ranuras seleccionables en POS (`isSlotCategory`).

### 5. ✨ Catálogo Maestro de Toppings & Modificadores
- Centralización de adicionales con descuento automático de almacén por porción exacta.
- Soporte para toppings con variantes (selección dinámica de insumo en el momento de la venta).
- Tabla interactiva con cabecera fija y desplazamiento vertical optimizado.

### 6. 💼 Gestión de Compras & Proveedores
- Directorio de proveedores clasificados por rubro, RUC y condiciones crediticias.
- Emisión de Órdenes de Compra (OC).
- Módulo de facturas y boletas con registro de series, correlativos e imputación directa al Kárdex de almacén.

### 7. 🏭 Órdenes de Producción & Control de Mermas
- **Producción de Subrecetas en Lote:**
  - Transformación de insumos base en preparaciones complejas (ej. salsas, bases, masas, pulpas).
  - Descuento automático de insumos comestibles origen y alta del producto terminado en stock.
  - Exclusión inteligente de descartables (los empaques se reservan para el POS).
- **Registro de Mermas y Desperdicios:** Clasificación de motivos (vencimiento, merma operativa, derrame) con cálculo de valor monetario perdido.

### 8. 📊 Historial de Ventas & Métricas Financieras
- Registro cronológico de tickets cerrados con desglose de métodos de pago (Efectivo, Tarjeta, Yape/Plin).
- Métricas en tiempo real: Ventas brutas, COGS (Costo de Mercadería Vendida), margen bruto y porcentaje real de Food Cost ponderado.

---

## 🛠️ Tecnologías Empleadas

| Capa | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Frontend** | React 19 + TypeScript | Interfaz de usuario reactiva, tipada y modular |
| **Estilos** | Tailwind CSS 3 | Diseño responsive, modo oscuro/claro y layout adaptativo |
| **Bundler** | Vite 8 | Servidor de desarrollo ultrarrápido y compilador de producción |
| **Backend** | Node.js + Express 5 | API REST local y servicio de persistencia |
| **Tiempo Real** | Socket.io 4 | Conexión bidireccional entre POS, KDS y pantallas de mozo |
| **Base de Datos**| SQLite (`better-sqlite3`) | Motor de base de datos relacional local, ultrarrápido y sin servidores externos |
| **Iconografía** | Lucide React | Iconos vectoriales limpios y coherentes |

---

## ⚙️ Arquitectura del Proyecto

```
├── data/                      # Directorio de persistencia SQLite local (.gitignore)
│   └── erp_database.sqlite    # Base de datos central permanente
├── server/                    # Servidor Backend (Express + WebSockets + SQLite)
│   ├── db/                    # Inicialización de esquema y migraciones
│   ├── routes/                # Endpoints de API REST (/api/bootstrap, pedidos, inventario)
│   └── index.ts               # Punto de entrada del servidor local
├── src/                       # Código fuente del Frontend SPA
│   ├── components/            # Módulos del ERP (PosModule, KdsModule, RecipesModule, etc.)
│   ├── context/               # AppContext (Gestión de estado global y sincronización WS)
│   ├── services/              # Cliente de API y conexión Socket.io
│   ├── types/                 # Definiciones de TypeScript unificadas
│   ├── App.tsx                # Layout principal y pantalla de inicialización
│   └── main.tsx               # Bootstrap de React
├── vite.config.ts             # Configuración de Vite con proxy hacia puerto 3001
└── package.json               # Dependencias y scripts
```

---

## 🚀 Puesta en Marcha Local

### Prerrequisitos
- **Node.js** v18.0.0 o superior
- **npm** v9.0.0 o superior

### 1. Clonar el repositorio e instalar dependencias
```bash
git clone <URL_DE_TU_REPOSITORIO>
cd erp-gastro
npm install
```

### 2. Iniciar el Servidor Backend (Puerto 3001)
En una terminal:
```bash
npm run server
```
*El backend creará automáticamente la estructura de base de datos SQLite si es la primera ejecución.*

### 3. Iniciar el Frontend (Puerto 5173)
En otra terminal:
```bash
npm run dev
```

Abre tu navegador en `http://localhost:5173`. Los dispositivos en la misma red Wi-Fi (tablets, celulares para mozos) pueden acceder directamente mediante la IP asignada por el router (ej. `http://192.168.1.X:5173`).

### 4. Compilar para Producción
```bash
npm run build
```

---

## 🔒 Privacidad y Control de Datos

- **Sin dependencias de nube obligatorias:** Todos los datos residen en tu propia máquina en `data/erp_database.sqlite`.
- **Aislamiento en Git:** Las bases de datos locales y archivos temporales están explícitamente excluidos en `.gitignore` para garantizar que tu repositorio remoto permanezca como un esqueleto limpio.

---

## 📄 Licencia

Este proyecto está distribuido bajo la licencia **MIT**. Puedes usarlo, adaptarlo y distribuirlo libremente para cualquier tipo de negocio.
