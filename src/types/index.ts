// Unidades de medida mínimas comerciales
export type MeasurementUnit = 'kg' | 'L' | 'und';

// Clasificación estricta de artículos en inventario
export type ItemType = 'insumo' | 'subreceta' | 'descartable' | 'consumible';

// Lote individual de inventario para costeo continuo FIFO
export interface InventoryBatch {
  id: string;
  purchaseInvoiceId?: string;
  date: string;
  initialQty: number;
  remainingQty: number;
  unitCost: number; // Costo por kg, L o und en PEN
}

export interface IngredientCategory {
  id: string;
  name: string;
  label: string;
  icon?: string;
  defaultUnit: MeasurementUnit;
  defaultQty: number;
  isSlotCategory: boolean;
}

export interface Ingredient {
  id: string;
  code: string;
  name: string;
  itemType: ItemType; // 'insumo', 'subreceta', 'descartable', 'consumible'
  category?: string; // frutas, lacteos, abarrotes, o categoría personalizada creada por el usuario
  unit: MeasurementUnit;
  stock: number; // Suma de remainingQty en lotes
  minStock: number;
  costPerUnit: number; // Costo promedio ponderado dinámico actual
  isTaxAffected: boolean; // true = 18% IGV (lácteos, descartables, etc.), false = Inafecto (frutas frescas)
  batches: InventoryBatch[]; // Lotes FIFO activos
  lastUpdated?: string;
  isIntermediateRecipe?: boolean; // Para recetas base (pulpa congelada, mix waffle)
  recipeId?: string;
}

export interface BomItem {
  ingredientId: string;
  quantity: number; // En kg, L o und
  unit: MeasurementUnit;
  isDisposable?: boolean; // Si es un descartable añadido automáticamente
}

export interface ModifierInventoryImpact {
  ingredientId: string;
  qtyDelta: number;
}

export interface QuickModifier {
  id: string;
  label: string;
  priceDelta: number;
  toppingMasterId?: string; // Vinculado al maestro de toppings
  ingredientId?: string;     // Insumo o subreceta de inventario a descontar
  quantity?: number;         // Porción que descuenta
  unit?: MeasurementUnit;
  inventoryImpact?: ModifierInventoryImpact[];
  hasVariants?: boolean;
  allowedIngredientIds?: string[];
}

export interface FlavorSlotConfig {
  slotIndex: number;
  label: string; // ej. "Bola 1", "Bola 2", "Bola 3"
  category?: string;
  allowedIngredientIds?: string[];
  quantity: number; // ej. 0.07
  unit: MeasurementUnit; // ej. 'L'
  required?: boolean;
}

export interface ServingOptionConfig {
  id: string;
  name: string; // ej. "En Cono Barquillo" | "En Vasito + Cucharita"
  ingredientId?: string;
  priceDelta?: number;
}

export interface ProductUiConfig {
  color: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  badgeClass?: string;
  gridSpan?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  shortName: string;
  description?: string;
  price: number;
  targetCost: number;
  category?: string;
  recipeType?: 'final' | 'intermedia' | 'base';
  isActive?: boolean; // Control para activar/inactivar en carta POS
  yieldUnit?: MeasurementUnit; // kg o L para subrecetas base
  ui: ProductUiConfig;
  quickModifiers: QuickModifier[];
  recipeBom: BomItem[];
  flavorSlots?: FlavorSlotConfig[];
  servingOptions?: ServingOptionConfig[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  products: Product[];
}

export interface MenuLine {
  id: 'linea-fria' | 'linea-caliente';
  name: string;
  theme: {
    accentColor: string;
    badgeColor: string;
    activeTabClass: string;
  };
  categories: Category[];
}

export interface MenuConfig {
  version: string;
  currency: string;
  lines: MenuLine[];
  globalModifiers: {
    id: string;
    label: string;
    type: 'toggle' | 'flag';
  }[];
}

export interface OrderItemModifier {
  id: string;
  label: string;
  priceDelta: number;
  toppingMasterId?: string;
  ingredientId?: string;
  quantity?: number;
  unit?: MeasurementUnit;
  selectedVariantIngredientId?: string;
  selectedVariantName?: string;
}

export interface SelectedFlavorSlot {
  slotIndex: number;
  slotLabel: string;
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: MeasurementUnit;
}

export interface SelectedServing {
  id: string;
  name: string;
  ingredientId?: string;
  priceDelta?: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  selectedModifiers: OrderItemModifier[];
  selectedSlots?: SelectedFlavorSlot[];
  selectedServing?: SelectedServing;
  notes?: string;
  itemTotal: number;
  recipeBom: BomItem[];
  kitchenStatus?: 'pendiente' | 'en_preparacion' | 'entregado'; // Discriminación KDS y ciclo de envío a barra
  selectedSourceType?: 'fruta_fresca' | 'pulpa_rescate'; // Control operativo en KDS Barra
  selectedFruitSources?: Record<string, 'fruta_fresca' | 'pulpa_rescate'>; // Selección individual por fruta en bebidas mixtas
  addedAt?: string;
  // Soporte para Combos y Auditoría de Costos
  isCombo?: boolean;
  comboId?: string;
  comboItems?: { productId: string; name: string; quantity: number }[];
  unitCost?: number;   // Costo unitario real para trazabilidad histórica
  totalCost?: number;  // Costo total del item (unitCost * quantity)
}

// Item integrante de un Combo
export interface ComboItem {
  productId: string;
  name: string;
  quantity: number;
}

// Ficha de Combo / Pack Promocional
export interface Combo {
  id: string;
  sku: string; // CMB-001, CMB-002, etc.
  name: string;
  shortName: string;
  description?: string;
  price: number;
  items: ComboItem[];
  isActive: boolean;
  createdAt: string;
}

// Descartable libre manual agregado por el mozo al cobrar
export interface ManualDisposable {
  ingredientId: string;
  name: string;
  quantity: number;
  unitPrice: number; // Puede ser 0.00 si es cortesía o cobrarse
}

export type TableStatus = 'libre' | 'en_toma' | 'en_preparacion' | 'por_cobrar';

export interface TableOrder {
  tableId: string;
  tableName: string;
  orderId?: string;
  status: TableStatus;
  items: OrderItem[];
  customerName?: string;
  enableDisposables: boolean; // Descartables automáticos por receta
  manualDisposables: ManualDisposable[]; // Descartables libres añadidos manualmente (táper sobras, bolsa)
  sentToKitchenAt?: string;
  total: number;
}

export interface Order {
  id: string;
  ticketNumber: number;
  createdAt: string;
  tableId?: string;
  tableName?: string;
  items: OrderItem[];
  manualDisposables?: ManualDisposable[];
  subtotal: number;
  tax: number;
  total: number;
  totalFoodCost: number;
  paymentMethod: 'efectivo' | 'yape_plin' | 'tarjeta';
  customerName?: string;
  orderType: 'para_mesa' | 'para_llevar';
  status: 'completado' | 'anulado';
  // Seguimiento de descartables para control de márgenes
  disposablesCostReal?: number;  // Costo real de los descartables descontados del inventario
  disposablesCharged?: number;   // Lo que efectivamente se cobró al cliente
}

// Factura / Boleta en Base de Datos Unificada
export interface DetailedPurchaseItem {
  id: string;
  ingredientId: string;
  code: string;
  name: string;
  itemType: ItemType;
  presentation: 'KILOS' | 'LITROS' | 'UNIDADES';
  quantity: number;
  warehouse: string;
  isTaxAffected: boolean;
  unitValue: number;
  costVariationPercent: number;
  discount: number;
  subtotal: number;
  taxAmount: number;
  total: number;
}

export interface DetailedPurchaseInvoice {
  id: string;
  codeNumber: string;
  registerDate: string;
  purchaseDate: string;
  documentType: 'Factura' | 'Boleta';
  series: string;
  number: string;
  local: string; // "Sabor & Fruta - Carabayllo"
  supplier: string;
  paymentType: 'Contado' | 'Al crédito (1 cuotas pend.)' | 'Al crédito (2 cuotas)';
  currency: 'PEN';
  taxOption: 'IMPUESTOS INCLUIDOS';
  items: DetailedPurchaseItem[];
  subtotal: number;
  globalDiscount: number;
  taxableOperation: number;
  unaffectedOperation: number;
  taxes: number;
  total: number;
  notes?: string;
  status: 'Activo' | 'Anulado';
  linkedPoId?: string;
  linkedPoNumber?: string;
}

export interface BatchProduction {
  id: string;
  name: string;
  outputIngredientId: string;
  outputQuantity: number;
  unit: MeasurementUnit;
  consumedIngredients: {
    ingredientId: string;
    quantity: number;
  }[];
  date: string;
  costEstimate: number;
}

export interface WasteRecord {
  id: string;
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: MeasurementUnit;
  reason: 'vencimiento' | 'deterioro_frio' | 'error_preparacion' | 'merma_corte';
  costLost: number;
  date: string;
  recoveredIntoBatch?: boolean;
  notes?: string;
}

export interface PurchaseRecord {
  id: string;
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: MeasurementUnit;
  totalAmount: number;
  costPerUnit: number;
  supplier?: string;
  date: string;
}

// Rubro comercial del proveedor
export type SupplierCategory =
  | 'frutas_verduras'
  | 'lacteos_derivados'
  | 'proteinas_carnes'
  | 'abarrotes_secos'
  | 'descartables_envases'
  | 'limpieza_consumibles'
  | 'otros';

// Proveedor registrado en la BD
export interface Supplier {
  id: string;
  code: string; // PRV-001, PRV-002, ...
  name: string; // Nombre comercial o razón social
  ruc?: string; // RUC (11 dígitos)
  phone?: string;
  email?: string;
  address?: string;
  category: SupplierCategory;
  isActive: boolean;
  notes?: string;
  createdAt: string;
}

// Datos de la Empresa (para membrete de OC y comprobantes)
export interface CompanyConfig {
  businessName: string; // "Sabor & Fruta S.A.C."
  tradeName: string;    // "Fuente de Soda Sabor & Fruta"
  ruc: string;          // "20608945123"
  address: string;      // "Av. Universitaria 4520, Carabayllo, Lima"
  phone: string;        // "+51 987 654 321"
  email: string;        // "compras@saborfruta.pe"
  website?: string;
  currency: string;     // "PEN"
  notes?: string;
}

// Estado de la Orden de Compra
export type PurchaseOrderStatus = 'borrador' | 'enviada' | 'recibida' | 'cancelada';

// Ítem de una Orden de Compra
export interface PurchaseOrderItem {
  id: string;
  ingredientId: string;
  ingredientCode: string;
  ingredientName: string;
  unit: MeasurementUnit;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

// Orden de Compra (OC)
export interface PurchaseOrder {
  id: string;
  poNumber: string; // Ej: OC-2026-001
  supplierId: string;
  supplierName: string;
  supplierRuc?: string;
  issueDate: string; // YYYY-MM-DD
  expectedDeliveryDate?: string;
  status: PurchaseOrderStatus;
  items: PurchaseOrderItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  notes?: string;
  convertedToInvoiceId?: string; // ID de factura generada al recepcionar
  convertedInvoiceNumber?: string; // Número de factura generada (ej. F001-3777)
  createdAt: string;
}

// Catálogo Maestro de Toppings con descuento de inventario
export interface ToppingMaster {
  id: string;
  name: string; // Ej. "Mango en Cubitos (10g)", "Chantilly Casero (40g)"
  linkedItemType: 'insumo' | 'subreceta';
  ingredientId: string; // ID del insumo o subreceta en almacén por defecto
  portionQuantity: number; // Cantidad a descontar en stock (ej. 0.010 para 10g o 0.070 para 70ml)
  portionUnit: MeasurementUnit; // kg, L, und
  defaultPriceDelta: number; // Recargo en soles (ej. 1.50)
  isActive: boolean;
  hasVariants?: boolean;
  variantCategory?: string; // ej. 'lacteos', 'helados'
  allowedIngredientIds?: string[]; // IDs de insumos específicos permitidos para este topping
}

// Configuración de Mesas del Local
export interface TableConfig {
  id: string;
  numberName: string; // "Mesa 1", "Mesa 2", "Barra 1", "Terraza 1"
  zone: 'salon' | 'terraza' | 'barra' | 'llevar';
  capacity: number;
  isActive: boolean;
}

// ================= ÓRDENES DE PRODUCCIÓN (BATCHES & PREPARAR RECETAS) =================
export type ProductionOrderStatus = 'borrador' | 'en_proceso' | 'completado' | 'cancelado';

export interface ProductionOrderIngredient {
  ingredientId: string;
  ingredientName: string;
  ingredientCode: string;
  category: string;
  quantityRequired: number;
  quantityReal?: number; // Cantidad real retirada del almacén (a descontar de stock)
  unit: MeasurementUnit;
  wastePercent: number;
  wasteQuantity: number;
  unitCost: number;
  totalCost: number;
  currentStock: number;
}

export interface ProductionOrderItem {
  recipeId: string; // ID de la subreceta o producto preparado
  recipeName: string;
  recipeCode: string;
  estimatedQuantity: number;
  resultQuantity: number;
  unit: MeasurementUnit;
  wastePercent: number;
  wasteQuantity: number;
  unitCost: number;
  totalCost: number;
  targetIngredientId?: string; // ID del insumo en almacén que incrementará stock
}

export interface ProductionOrder {
  id: string;
  orderNumber: string; // ej. OP-3635
  batchNumber: string; // ej. LOTE-PAPAYA-20261112
  warehouseName: string; // ej. "Producción Cocina TV" o "Barra Central"
  preparedAt: string;
  status: ProductionOrderStatus;
  responsibleName: string;
  items: ProductionOrderItem[];
  requiredIngredients: ProductionOrderIngredient[];
  totalEstimatedCost: number;
  totalActualCost: number;
  notes?: string;
  createdAt: string;
}



