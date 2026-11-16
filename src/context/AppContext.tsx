import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  Ingredient,
  MenuConfig,
  Order,
  OrderItem,
  PurchaseRecord,
  BatchProduction,
  WasteRecord,
  TableOrder,
  TableStatus,
  DetailedPurchaseInvoice,
  DetailedPurchaseItem,
  Product,
  InventoryBatch,
  ManualDisposable,
  Supplier,
  Combo,
  CompanyConfig,
  PurchaseOrder,
  PurchaseOrderStatus,
  ToppingMaster,
  TableConfig,
  ProductionOrder,
  ProductionOrderStatus
} from '../types';
import { initialIngredients } from '../data/initialInventory';
import { initialMenuConfig } from '../data/menuConfig';
import { initialDetailedInvoices } from '../data/initialInvoices';
import { initialSuppliers } from '../data/initialSuppliers';
import { initialCombos } from '../data/initialCombos';
import { initialCompanyConfig } from '../data/initialCompanyConfig';
import { initialPurchaseOrders } from '../data/initialPurchaseOrders';
import { initialToppingsMaster } from '../data/initialToppingsMaster';
import { initialTablesConfig } from '../data/initialTablesConfig';
import { initialProductionOrders } from '../data/initialProductionOrders';
import {
  socket,
  fetchBootstrap,
  saveCompanyConfig,
  saveMenuConfig,
  saveIngredients,
  saveTables,
  saveOrder,
  saveInvoice,
  saveSuppliers,
  saveWaste,
  saveProductionOrder,
  deleteProductionOrderApi,
  saveTablesConfig,
  saveToppingsMaster,
  savePurchaseOrders,
  saveCombos,
  saveCustomCategories
} from '../services/apiService';


// Mesas iniciales del local
const defaultTables: TableOrder[] = [
  { tableId: 'mesa-1', tableName: 'Mesa 1', status: 'libre', items: [], enableDisposables: false, manualDisposables: [], total: 0 },
  { tableId: 'mesa-2', tableName: 'Mesa 2', status: 'libre', items: [], enableDisposables: false, manualDisposables: [], total: 0 },
  { tableId: 'mesa-3', tableName: 'Mesa 3', status: 'libre', items: [], enableDisposables: false, manualDisposables: [], total: 0 },
  { tableId: 'mesa-4', tableName: 'Mesa 4', status: 'libre', items: [], enableDisposables: false, manualDisposables: [], total: 0 },
  { tableId: 'mesa-5', tableName: 'Mesa 5', status: 'libre', items: [], enableDisposables: false, manualDisposables: [], total: 0 },
  { tableId: 'mesa-6', tableName: 'Mesa 6', status: 'libre', items: [], enableDisposables: false, manualDisposables: [], total: 0 },
  { tableId: 'barra', tableName: 'Barra', status: 'libre', items: [], enableDisposables: false, manualDisposables: [], total: 0 },
  { tableId: 'llevar', tableName: 'Para Llevar 1', status: 'libre', items: [], enableDisposables: true, manualDisposables: [], total: 0 },
];

/**
 * Función de deducción FIFO y recálculo ponderado del costo promedio del insumo
 */
export function deductFifoFromIngredient(
  ing: Ingredient,
  amountToDeduct: number
): { updatedIngredient: Ingredient; costOfDeduction: number } {
  let remainingNeeded = amountToDeduct;
  let costOfDeduction = 0;

  // Asegurar que existan lotes
  const currentBatches: InventoryBatch[] = ing.batches && ing.batches.length > 0
    ? ing.batches.map(b => ({ ...b }))
    : [
        {
          id: `batch-${ing.id}-legacy`,
          date: new Date().toISOString(),
          initialQty: Math.max(ing.stock, 0),
          remainingQty: Math.max(ing.stock, 0),
          unitCost: ing.costPerUnit
        }
      ];

  const updatedBatches: InventoryBatch[] = [];

  for (const batch of currentBatches) {
    if (remainingNeeded <= 0) {
      updatedBatches.push(batch);
      continue;
    }

    if (batch.remainingQty <= remainingNeeded) {
      // Consumir el lote completo
      costOfDeduction += batch.remainingQty * batch.unitCost;
      remainingNeeded -= batch.remainingQty;
      updatedBatches.push({ ...batch, remainingQty: 0 });
    } else {
      // Consumir parte del lote
      costOfDeduction += remainingNeeded * batch.unitCost;
      updatedBatches.push({ ...batch, remainingQty: Number((batch.remainingQty - remainingNeeded).toFixed(3)) });
      remainingNeeded = 0;
    }
  }

  // Filtrar lotes agotados
  const activeBatches = updatedBatches.filter(b => b.remainingQty > 0.0001);

  // Calcular nuevo stock total
  const newStock = Number((ing.stock - amountToDeduct).toFixed(3));

  // Recalcular nuevo costo promedio ponderado de los lotes restantes
  let newAvgCost = ing.costPerUnit;
  if (activeBatches.length > 0) {
    const totalBatchValue = activeBatches.reduce((acc, b) => acc + b.remainingQty * b.unitCost, 0);
    const totalBatchQty = activeBatches.reduce((acc, b) => acc + b.remainingQty, 0);
    if (totalBatchQty > 0) {
      newAvgCost = Number((totalBatchValue / totalBatchQty).toFixed(2));
    }
  }

  return {
    updatedIngredient: {
      ...ing,
      stock: newStock,
      costPerUnit: newAvgCost,
      batches: activeBatches,
      lastUpdated: new Date().toISOString()
    },
    costOfDeduction
  };
}

interface AppContextType {
  // Tema Visual
  themeMode: 'dark' | 'light';
  toggleTheme: () => void;

  // Configuración de Menú & Recetas
  menuConfig: MenuConfig;
  updateMenuConfig: (newConfig: MenuConfig) => void;
  addNewProductRecipe: (product: Product, lineId: 'linea-fria' | 'linea-caliente', categoryId: string) => void;
  updateProductRecipe: (product: Product) => void;
  addRecipeCategory: (name: string, lineId: 'linea-fria' | 'linea-caliente') => void;

  // Insumos e Inventario Maestro
  ingredients: Ingredient[];
  updateIngredientStock: (id: string, delta: number) => void;
  updateIngredient: (updated: Ingredient) => void;
  addIngredient: (newIng: Omit<Ingredient, 'id' | 'batches'> & { initialUnitCost?: number }) => void;
  customIngredientCategories: string[];
  addIngredientCategory: (name: string) => void;

  // Mesas & Comandas
  tables: TableOrder[];
  activeTableId: string;
  setActiveTableId: (id: string) => void;
  updateTableItems: (
    tableId: string,
    items: OrderItem[],
    enableDisposables: boolean,
    customerName?: string,
    manualDisposables?: ManualDisposable[]
  ) => void;
  sendTableToKitchen: (tableId: string) => void;
  addManualDisposableToTable: (tableId: string, item: ManualDisposable) => void;
  removeManualDisposableFromTable: (tableId: string, ingredientId: string) => void;
  checkoutAndCloseTable: (tableId: string, paymentMethod: 'efectivo' | 'yape_plin' | 'tarjeta') => Order;
  cancelTable: (tableId: string) => void;
  addTakeoutTable: () => string;
  removeTakeoutTable: (tableId: string) => void;

  // KDS (Pantalla de Barra & Cocina)
  kdsOrders: TableOrder[];
  markKdsItemsReady: (tableId: string) => void;

  // Órdenes Históricas & POS
  orders: Order[];
  createOrder: (orderData: Omit<Order, 'id' | 'ticketNumber' | 'createdAt' | 'status'>) => Order;

  // Compras Detalladas (ERP & Móvil Unificadas en la misma BD)
  detailedInvoices: DetailedPurchaseInvoice[];
  addDetailedInvoice: (invoice: DetailedPurchaseInvoice) => void;

  // Compras Rápidas Móvil
  purchases: PurchaseRecord[];
  addPurchase: (purchase: Omit<PurchaseRecord, 'id' | 'costPerUnit'>) => void;

  // Batches & Mermas
  batches: BatchProduction[];
  addBatch: (batch: Omit<BatchProduction, 'id'>) => void;
  wastes: WasteRecord[];
  addWaste: (waste: Omit<WasteRecord, 'id' | 'costLost'>) => void;

  // Proveedores
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id' | 'code' | 'createdAt'>) => void;
  updateSupplier: (updated: Supplier) => void;

  // Combos & Promociones
  combos: Combo[];
  addCombo: (combo: Omit<Combo, 'id' | 'createdAt'>) => void;
  updateCombo: (combo: Combo) => void;
  deleteCombo: (id: string) => void;
  toggleComboActive: (id: string) => void;

  // Configuración de Empresa (para membrete de OC)
  companyConfig: CompanyConfig;
  updateCompanyConfig: (config: Partial<CompanyConfig>) => void;

  // Órdenes de Compra (OC)
  purchaseOrders: PurchaseOrder[];
  addPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'createdAt'>) => void;
  updatePurchaseOrderStatus: (
    poId: string,
    status: PurchaseOrderStatus,
    extraUpdates?: { convertedToInvoiceId?: string; convertedInvoiceNumber?: string }
  ) => void;
  convertPoToInvoice: (poId: string) => void;

  // Catálogo Maestro de Toppings
  toppingsMaster: ToppingMaster[];
  addToppingMaster: (top: Omit<ToppingMaster, 'id'>) => void;
  updateToppingMaster: (top: ToppingMaster) => void;
  deleteToppingMaster: (id: string) => void;

  // Configuración de Mesas del Local
  tablesConfig: TableConfig[];
  addTableConfig: (tbl: Omit<TableConfig, 'id'>) => void;
  updateTableConfig: (tbl: TableConfig) => void;
  deleteTableConfig: (id: string) => void;

  // Órdenes de Producción (Preparar Recetas / Subrecetas)
  productionOrders: ProductionOrder[];
  addProductionOrder: (op: ProductionOrder) => void;
  updateProductionOrderStatus: (id: string, status: ProductionOrderStatus) => void;
  deleteProductionOrder: (id: string) => void;

  // KDS: Decisión Operativa de Insumo vs Pulpa de Rescate (Global o por Fruta)
  updateItemSourceType: (
    tableId: string,
    itemId: string,
    sourceType: 'fruta_fresca' | 'pulpa_rescate',
    fruitIngredientId?: string
  ) => void;

  // Métricas
  totalSalesToday: number;
  ordersCountToday: number;
  averageFoodCostToday: number;
  disposablesCostToday: number; // Costo real de descartables descontados hoy
  disposablesRevenueToday: number; // Cobrado en descartables hoy
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Purgar de forma estricta claves de negocio en localStorage
  // Toda la información reside y se lee exclusivamente de la base de datos permanente SQLite
  useEffect(() => {
    const businessKeys = [
      'erp_menu_config', 'erp_ingredients', 'erp_tables', 'erp_orders',
      'erp_detailed_invoices', 'erp_purchases', 'erp_batches', 'erp_wastes',
      'erp_suppliers', 'erp_combos', 'erp_custom_ingredient_categories',
      'erp_company_config', 'erp_purchase_orders', 'erp_toppings_master',
      'erp_tables_config', 'erp_production_orders', 'erp_invoices', 'erp_db_v2_cleaned'
    ];
    businessKeys.forEach(k => localStorage.removeItem(k));
  }, []);

  // 0. Tema visual (única preferencia local de UI permitida)
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('erp_theme_mode') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('erp_theme_mode', next);
      return next;
    });
  };

  // 1. Estados en memoria: Solo el esqueleto inicial, 100% alimentado por SQLite en fetchBootstrap
  const [menuConfig, setMenuConfig] = useState<MenuConfig>(initialMenuConfig);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [tables, setTables] = useState<TableOrder[]>(defaultTables);
  const [activeTableId, setActiveTableId] = useState<string>('mesa-1');
  const [orders, setOrders] = useState<Order[]>([]);
  const [detailedInvoices, setDetailedInvoices] = useState<DetailedPurchaseInvoice[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [batches, setBatches] = useState<BatchProduction[]>([]);
  const [wastes, setWastes] = useState<WasteRecord[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [customIngredientCategories, setCustomIngredientCategories] = useState<string[]>([]);
  const [companyConfig, setCompanyConfig] = useState<CompanyConfig>(initialCompanyConfig);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [toppingsMaster, setToppingsMaster] = useState<ToppingMaster[]>([]);
  const [tablesConfig, setTablesConfig] = useState<TableConfig[]>([]);
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>([]);

  // Bandera para evitar retransmitir al servidor lo que acabamos de recibir por WebSocket
  const isIncomingSocketUpdate = React.useRef(false);

  // Sincronización Inicial con Servidor Central (Base de Datos SQLite permanente)
  useEffect(() => {
    let isMounted = true;
    fetchBootstrap()
      .then(data => {
        if (!isMounted || !data) return;
        isIncomingSocketUpdate.current = true;
        if (data.companyConfig) setCompanyConfig(data.companyConfig);
        if (data.tablesConfig && data.tablesConfig.length > 0) setTablesConfig(data.tablesConfig);
        if (data.menuConfig) setMenuConfig(data.menuConfig);
        if (data.ingredients) setIngredients(data.ingredients);
        if (data.activeTables && data.activeTables.length > 0) setTables(data.activeTables);
        if (data.orders) setOrders(data.orders);
        if (data.detailedInvoices) setDetailedInvoices(data.detailedInvoices);
        if (data.purchaseOrders) setPurchaseOrders(data.purchaseOrders);
        if (data.toppingsMaster) setToppingsMaster(data.toppingsMaster);
        if (data.combos) setCombos(data.combos);
        if (data.suppliers) setSuppliers(data.suppliers);
        if (data.wastes) setWastes(data.wastes);
        if (data.productionOrders) setProductionOrders(data.productionOrders);
        if (data.customCategories) setCustomIngredientCategories(data.customCategories);
        setTimeout(() => { isIncomingSocketUpdate.current = false; }, 200);
      })
      .catch(err => {
        console.warn('[Sync] Conexión inicial con SQLite:', err.message);
      });

    // Escuchar eventos en vivo emitidos desde otros dispositivos en la red local
    const handleTablesUpdated = (updatedTables: TableOrder[]) => {
      isIncomingSocketUpdate.current = true;
      setTables(updatedTables);
      setTimeout(() => { isIncomingSocketUpdate.current = false; }, 300);
    };

    const handleOrderCreated = (newOrder: Order) => {
      isIncomingSocketUpdate.current = true;
      setOrders(prev => {
        if (prev.some(o => o.id === newOrder.id)) return prev;
        return [newOrder, ...prev];
      });
      setTimeout(() => { isIncomingSocketUpdate.current = false; }, 300);
    };

    const handleIngredientsUpdated = (updatedIngs: Ingredient[]) => {
      isIncomingSocketUpdate.current = true;
      setIngredients(updatedIngs);
      setTimeout(() => { isIncomingSocketUpdate.current = false; }, 300);
    };

    const handleMenuUpdated = (updatedMenu: MenuConfig) => {
      isIncomingSocketUpdate.current = true;
      setMenuConfig(updatedMenu);
      setTimeout(() => { isIncomingSocketUpdate.current = false; }, 300);
    };

    const handleCompanyUpdated = (updatedConfig: CompanyConfig) => {
      isIncomingSocketUpdate.current = true;
      setCompanyConfig(updatedConfig);
      setTimeout(() => { isIncomingSocketUpdate.current = false; }, 300);
    };

    const handleProductionCreated = (op: ProductionOrder) => {
      isIncomingSocketUpdate.current = true;
      setProductionOrders(prev => [op, ...prev.filter(p => p.id !== op.id)]);
      setTimeout(() => { isIncomingSocketUpdate.current = false; }, 300);
    };

    const handleProductionDeleted = (id: string) => {
      isIncomingSocketUpdate.current = true;
      setProductionOrders(prev => prev.filter(p => p.id !== id));
      setTimeout(() => { isIncomingSocketUpdate.current = false; }, 300);
    };

    const handleToppingsUpdated = (tops: ToppingMaster[]) => {
      isIncomingSocketUpdate.current = true;
      setToppingsMaster(tops);
      setTimeout(() => { isIncomingSocketUpdate.current = false; }, 300);
    };

    const handleTablesConfigUpdated = (cfg: TableConfig[]) => {
      isIncomingSocketUpdate.current = true;
      setTablesConfig(cfg);
      setTimeout(() => { isIncomingSocketUpdate.current = false; }, 300);
    };

    const handleSuppliersUpdated = (sups: Supplier[]) => {
      isIncomingSocketUpdate.current = true;
      setSuppliers(sups);
      setTimeout(() => { isIncomingSocketUpdate.current = false; }, 300);
    };

    socket.on('tables:updated', handleTablesUpdated);
    socket.on('order:created', handleOrderCreated);
    socket.on('ingredients:updated', handleIngredientsUpdated);
    socket.on('menu:updated', handleMenuUpdated);
    socket.on('company_config:updated', handleCompanyUpdated);
    socket.on('production_order:created', handleProductionCreated);
    socket.on('production_order:deleted', handleProductionDeleted);
    socket.on('toppings:updated', handleToppingsUpdated);
    socket.on('tables_config:updated', handleTablesConfigUpdated);
    socket.on('suppliers:updated', handleSuppliersUpdated);

    return () => {
      isMounted = false;
      socket.off('tables:updated', handleTablesUpdated);
      socket.off('order:created', handleOrderCreated);
      socket.off('ingredients:updated', handleIngredientsUpdated);
      socket.off('menu:updated', handleMenuUpdated);
      socket.off('company_config:updated', handleCompanyUpdated);
      socket.off('production_order:created', handleProductionCreated);
      socket.off('production_order:deleted', handleProductionDeleted);
      socket.off('toppings:updated', handleToppingsUpdated);
      socket.off('tables_config:updated', handleTablesConfigUpdated);
      socket.off('suppliers:updated', handleSuppliersUpdated);
    };
  }, []);


  // Gestión de Insumos
  const updateIngredientStock = (id: string, delta: number) => {
    setIngredients(prev => {
      const next = prev.map(item => {
        if (item.id !== id) return item;
        if (delta < 0) {
          const { updatedIngredient } = deductFifoFromIngredient(item, Math.abs(delta));
          return updatedIngredient;
        } else {
          const newBatch: InventoryBatch = {
            id: `batch-${item.id}-${Date.now()}`,
            date: new Date().toISOString(),
            initialQty: delta,
            remainingQty: delta,
            unitCost: item.costPerUnit
          };
          return {
            ...item,
            stock: Number((item.stock + delta).toFixed(3)),
            batches: [...(item.batches || []), newBatch],
            lastUpdated: new Date().toISOString()
          };
        }
      });
      saveIngredients(next).catch(() => {});
      return next;
    });
  };

  const updateIngredient = (updated: Ingredient) => {
    setIngredients(prev => {
      const next = prev.map(item => (item.id === updated.id ? updated : item));
      saveIngredients(next).catch(() => {});
      return next;
    });
  };

  const addIngredient = (newIng: Omit<Ingredient, 'id' | 'batches'> & { initialUnitCost?: number }) => {
    const id = `ing-${Date.now()}`;
    const initialCost = newIng.costPerUnit || newIng.initialUnitCost || 0;
    const initialBatch: InventoryBatch = {
      id: `batch-${id}-init`,
      date: new Date().toISOString(),
      initialQty: newIng.stock,
      remainingQty: newIng.stock,
      unitCost: initialCost
    };

    const item: Ingredient = {
      ...newIng,
      id,
      batches: newIng.stock > 0 ? [initialBatch] : []
    };
    setIngredients(prev => {
      const next = [...prev, item];
      saveIngredients(next).catch(() => {});
      return next;
    });
  };

  // Recetas
  const updateMenuConfig = (newConfig: MenuConfig) => {
    setMenuConfig(newConfig);
    saveMenuConfig(newConfig).catch(() => {});
  };

  const addNewProductRecipe = (product: Product, lineId: 'linea-fria' | 'linea-caliente', categoryId: string) => {
    setMenuConfig(prev => {
      const updatedLines = prev.lines.map(line => {
        if (line.id === lineId) {
          const updatedCategories = line.categories.map(cat => {
            if (cat.id === categoryId) {
              return { ...cat, products: [...cat.products, product] };
            }
            return cat;
          });
          return { ...line, categories: updatedCategories };
        }
        return line;
      });
      const next = { ...prev, lines: updatedLines };
      saveMenuConfig(next).catch(() => {});
      return next;
    });
  };

  const updateProductRecipe = (updatedProduct: Product) => {
    setMenuConfig(prev => {
      const updatedLines = prev.lines.map(line => ({
        ...line,
        categories: line.categories.map(cat => ({
          ...cat,
          products: cat.products.map(p => (p.id === updatedProduct.id ? updatedProduct : p))
        }))
      }));
      const next = { ...prev, lines: updatedLines };
      saveMenuConfig(next).catch(() => {});
      return next;
    });
  };

  const addRecipeCategory = (name: string, lineId: 'linea-fria' | 'linea-caliente') => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const catId = `cat-${trimmed.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString().slice(-4)}`;
    setMenuConfig(prev => {
      const updatedLines = prev.lines.map(line => {
        if (line.id === lineId) {
          return {
            ...line,
            categories: [
              ...line.categories,
              {
                id: catId,
                name: trimmed,
                icon: lineId === 'linea-fria' ? 'Sparkles' : 'Flame',
                products: []
              }
            ]
          };
        }
        return line;
      });
      const next = { ...prev, lines: updatedLines };
      saveMenuConfig(next).catch(() => {});
      return next;
    });
  };

  const addIngredientCategory = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || customIngredientCategories.includes(trimmed)) return;
    setCustomIngredientCategories(prev => [...prev, trimmed]);
  };

  // Cálculo auxiliar de descartables (Regla mixta: ≤ S/1.50 cobra S/1.00; > S/1.50 cobra costo real)
  const computeTableDisposablesCharge = (items: OrderItem[], enableDisposables: boolean): number => {
    if (!enableDisposables || items.length === 0) return 0;
    let realCost = 0;
    items.forEach(item => {
      item.recipeBom.forEach(bom => {
        const ing = ingredients.find(i => i.id === bom.ingredientId);
        const isItemDisposable = bom.isDisposable || ing?.itemType === 'descartable';
        if (isItemDisposable && ing) {
          realCost += ing.costPerUnit * bom.quantity * item.quantity;
        }
      });
    });
    return realCost > 1.50 ? Number(realCost.toFixed(2)) : 1.00;
  };

  // Gestión de Mesas
  const updateTableItems = (
    tableId: string,
    items: OrderItem[],
    enableDisposables: boolean,
    customerName?: string,
    manualDisposables?: ManualDisposable[]
  ) => {
    setTables(prev => {
      const next = prev.map(tbl => {
        if (tbl.tableId === tableId) {
          const currentManuals = manualDisposables !== undefined ? manualDisposables : (tbl.manualDisposables || []);
          const itemsTotal = items.reduce((acc, curr) => acc + curr.itemTotal, 0);
          const manualsTotal = currentManuals.reduce((acc, curr) => acc + curr.quantity * curr.unitPrice, 0);
          const autoDisposablesCharge = computeTableDisposablesCharge(items, enableDisposables);
          const grandTotal = Number((itemsTotal + manualsTotal + autoDisposablesCharge).toFixed(2));

          const newStatus: TableStatus = items.length === 0 && currentManuals.length === 0
            ? 'libre'
            : tbl.status === 'en_preparacion'
            ? 'en_preparacion'
            : 'en_toma';

          return {
            ...tbl,
            items,
            enableDisposables,
            manualDisposables: currentManuals,
            customerName: customerName ?? tbl.customerName,
            total: grandTotal,
            status: newStatus
          };
        }
        return tbl;
      });
      saveTables(next).catch(() => {});
      return next;
    });
  };

  const addManualDisposableToTable = (tableId: string, manualItem: ManualDisposable) => {
    setTables(prev => {
      const next = prev.map(tbl => {
        if (tbl.tableId === tableId) {
          const existingIndex = tbl.manualDisposables.findIndex(m => m.ingredientId === manualItem.ingredientId);
          let updatedManuals = [...tbl.manualDisposables];
          if (existingIndex >= 0) {
            updatedManuals[existingIndex] = {
              ...updatedManuals[existingIndex],
              quantity: updatedManuals[existingIndex].quantity + manualItem.quantity
            };
          } else {
            updatedManuals.push(manualItem);
          }

          const itemsTotal = tbl.items.reduce((acc, curr) => acc + curr.itemTotal, 0);
          const manualsTotal = updatedManuals.reduce((acc, curr) => acc + curr.quantity * curr.unitPrice, 0);
          const autoDisposablesCharge = computeTableDisposablesCharge(tbl.items, tbl.enableDisposables);

          return {
            ...tbl,
            manualDisposables: updatedManuals,
            total: Number((itemsTotal + manualsTotal + autoDisposablesCharge).toFixed(2))
          };
        }
        return tbl;
      });
      saveTables(next).catch(() => {});
      return next;
    });
  };

  const removeManualDisposableFromTable = (tableId: string, ingredientId: string) => {
    setTables(prev => {
      const next = prev.map(tbl => {
        if (tbl.tableId === tableId) {
          const updatedManuals = tbl.manualDisposables.filter(m => m.ingredientId !== ingredientId);
          const itemsTotal = tbl.items.reduce((acc, curr) => acc + curr.itemTotal, 0);
          const manualsTotal = updatedManuals.reduce((acc, curr) => acc + curr.quantity * curr.unitPrice, 0);
          const autoDisposablesCharge = computeTableDisposablesCharge(tbl.items, tbl.enableDisposables);
          return {
            ...tbl,
            manualDisposables: updatedManuals,
            total: Number((itemsTotal + manualsTotal + autoDisposablesCharge).toFixed(2))
          };
        }
        return tbl;
      });
      saveTables(next).catch(() => {});
      return next;
    });
  };

  // Enviar comanda a preparación (Cocina / Barra)
  const sendTableToKitchen = (tableId: string) => {
    setTables(prev => {
      const updatedTables = prev.map(tbl => {
        if (tbl.tableId === tableId) {
          const updatedItems: OrderItem[] = tbl.items.map(item => ({
            ...item,
            kitchenStatus: item.kitchenStatus === 'entregado' ? 'entregado' : 'en_preparacion'
          }));

          return {
            ...tbl,
            items: updatedItems,
            status: 'en_preparacion' as const,
            sentToKitchenAt: new Date().toISOString()
          };
        }
        return tbl;
      });

      // Persistir de inmediato al servidor para sincronizar KDS en tiempo real
      saveTables(updatedTables).catch(() => {});
      return updatedTables;
    });
  };

  // Descontar inventario por receta BOM + modificadores + descartables automáticos + descartables manuales usando FIFO
  const deductInventoryWithFifo = (
    items: OrderItem[],
    enableDisposables: boolean,
    manualDisposables?: ManualDisposable[]
  ) => {
    setIngredients(prevIngredients => {
      let updated = [...prevIngredients];

      const applyDeduction = (ingredientId: string, qty: number) => {
        const ingIndex = updated.findIndex(i => i.id === ingredientId);
        if (ingIndex !== -1) {
          const { updatedIngredient } = deductFifoFromIngredient(updated[ingIndex], qty);
          updated[ingIndex] = updatedIngredient;
        }
      };

      // 1. Descontar ítems de orden (productos regulares o combos)
      items.forEach(item => {
        // Regla estricta: si el cliente eligió Sin Azúcar, anula el 100% del consumo de azúcar
        const hasSinAzucar = item.selectedModifiers?.some(
          m => m.id === 'mod-sin-azucar' || m.label.toLowerCase().includes('sin azucar') || m.label.toLowerCase().includes('sin azúcar')
        );

        // Si el operario de KDS seleccionó Pulpa de Rescate para este ítem o fruta:
        const isUsingRescuePulp = item.selectedSourceType === 'pulpa_rescate';
        const getEffectiveIngredientAndQty = (origId: string, origQty: number) => {
          const fruitSelection = item.selectedFruitSources?.[origId];
          const usePulp = fruitSelection !== undefined ? fruitSelection === 'pulpa_rescate' : isUsingRescuePulp;
          if (!usePulp) return { targetId: origId, quantity: origQty };

          if (origId === 'sub-mix-surtido-fresco' || origId.includes('surtid')) {
            return { targetId: 'ing-pulpa-mixta', quantity: 0.150 };
          }
          if (origId === 'sub-porcion-mango-fresco' || origId === 'ing-mango' || origId.includes('mango')) {
            return { targetId: 'ing-pulpa-mango', quantity: 0.180 };
          }
          if (origId === 'sub-porcion-fresa-limpia' || origId === 'ing-fresa' || origId.includes('fresa')) {
            return { targetId: 'ing-pulpa-fresa', quantity: 0.150 };
          }
          if (origId === 'sub-porcion-papaya-limpia' || origId === 'ing-papaya' || origId.includes('papaya')) {
            return { targetId: 'ing-pulpa-papaya', quantity: 0.150 };
          }
          if (origId === 'sub-porcion-pina-limpia' || origId === 'ing-pina' || origId.includes('pina') || origId.includes('piña')) {
            return { targetId: 'ing-pulpa-pina', quantity: 0.150 };
          }
          return { targetId: origId, quantity: origQty };
        };

        if (item.isCombo && item.comboItems) {
          const allProducts = menuConfig.lines.flatMap(l => l.categories.flatMap(c => c.products));
          item.comboItems.forEach(ci => {
            const prod = allProducts.find(p => p.id === ci.productId);
            if (prod) {
              prod.recipeBom.forEach(bom => {
                const { targetId: targetIngId, quantity: effectiveQty } = getEffectiveIngredientAndQty(bom.ingredientId, bom.quantity);
                const ing = updated.find(i => i.id === targetIngId);
                const isItemDisposable = bom.isDisposable || ing?.itemType === 'descartable';
                if (isItemDisposable && !enableDisposables) {
                  return;
                }
                const isSugar = targetIngId.includes('azucar') || ing?.name.toLowerCase().includes('azucar') || ing?.name.toLowerCase().includes('azúcar');
                if (hasSinAzucar && isSugar) {
                  return;
                }
                applyDeduction(targetIngId, effectiveQty * ci.quantity * item.quantity);
              });
            }
          });
        } else {
          item.recipeBom.forEach(bom => {
            const { targetId: targetIngId, quantity: effectiveQty } = getEffectiveIngredientAndQty(bom.ingredientId, bom.quantity);
            const ing = updated.find(i => i.id === targetIngId);
            const isItemDisposable = bom.isDisposable || ing?.itemType === 'descartable';
            if (isItemDisposable && !enableDisposables) {
              return;
            }
            const isSugar = targetIngId.includes('azucar') || ing?.name.toLowerCase().includes('azucar') || ing?.name.toLowerCase().includes('azúcar');
            if (hasSinAzucar && isSugar) {
              return;
            }
            applyDeduction(targetIngId, effectiveQty * item.quantity);
          });
        }

        // Descuento estricto de Toppings vinculados a insumos o subrecetas
        item.selectedModifiers.forEach(mod => {
          // 1. Modificador con descuento directo de insumo y porción
          if (mod.ingredientId && mod.quantity && mod.quantity > 0) {
            applyDeduction(mod.ingredientId, mod.quantity * item.quantity);
            return;
          }
          // 2. Modificador registrado en catálogo maestro de toppings
          if (mod.toppingMasterId) {
            const masterTop = toppingsMaster.find(t => t.id === mod.toppingMasterId);
            if (masterTop) {
              applyDeduction(masterTop.ingredientId, masterTop.portionQuantity * item.quantity);
              return;
            }
          }
          // 3. Fallback: buscar en modificadores de la receta del producto
          const allProducts = menuConfig.lines.flatMap(l => l.categories.flatMap(c => c.products));
          const prod = allProducts.find(p => p.id === item.productId);
          const foundMod = prod?.quickModifiers.find(m => m.id === mod.id);
          if (foundMod?.ingredientId && foundMod.quantity) {
            applyDeduction(foundMod.ingredientId, foundMod.quantity * item.quantity);
          } else if (foundMod?.inventoryImpact) {
            foundMod.inventoryImpact.forEach(impact => {
              applyDeduction(impact.ingredientId, impact.qtyDelta * item.quantity);
            });
          }
        });
      });

      // 2. Descontar descartables manuales libres
      if (manualDisposables && manualDisposables.length > 0) {
        manualDisposables.forEach(manual => {
          applyDeduction(manual.ingredientId, manual.quantity);
        });
      }

      saveIngredients(updated).catch(() => {});
      return updated;
    });
  };

  // Cobrar y Cerrar / Liberar Mesa
  // Lógica mixta descartables: si costo real ≤ S/1.50 → cobra S/1.00; si supera → cobra costo real
  const DISPOSABLES_STD_CHARGE = 1.00;  // Cobro estándar fijo
  const DISPOSABLES_THRESHOLD = 1.50;   // Umbral: si el costo real supera esto, se cobra costo real

  const checkoutAndCloseTable = (
    tableId: string,
    paymentMethod: 'efectivo' | 'yape_plin' | 'tarjeta'
  ): Order => {
    const targetTable = tables.find(t => t.tableId === tableId);
    if (!targetTable || (targetTable.items.length === 0 && targetTable.manualDisposables.length === 0)) {
      throw new Error("Mesa vacía");
    }

    const allProducts = menuConfig.lines.flatMap(l => l.categories.flatMap(c => c.products));

    // Calcular costo real de descartables automáticos del BOM
    let realDisposablesCost = 0;
    if (targetTable.enableDisposables) {
      targetTable.items.forEach(item => {
        item.recipeBom.forEach(bom => {
          const ing = ingredients.find(i => i.id === bom.ingredientId);
          const isItemDisposable = bom.isDisposable || ing?.itemType === 'descartable';
          if (isItemDisposable && ing) {
            realDisposablesCost += ing.costPerUnit * bom.quantity * item.quantity;
          }
        });
      });
    }

    // Costo real de descartables manuales libres (taper, bolsa, etc.)
    const manualDisposablesCost = targetTable.manualDisposables.reduce(
      (acc, m) => acc + m.quantity * m.unitPrice,
      0
    );

    // Lógica de cobro mixto: S/1.00 estándar, o costo real si supera el umbral
    const autoDisposablesCharge = !targetTable.enableDisposables
      ? 0
      : realDisposablesCost > DISPOSABLES_THRESHOLD
      ? Number(realDisposablesCost.toFixed(2))
      : DISPOSABLES_STD_CHARGE;

    // Total de ítems sin descartables manuales
    const itemsOnlyTotal = targetTable.items.reduce((acc, curr) => acc + curr.itemTotal, 0);
    // Total con cobro de descartables
    const grandTotal = Number((itemsOnlyTotal + autoDisposablesCharge + manualDisposablesCost).toFixed(2));

    const itemsWithCost: OrderItem[] = targetTable.items.map(curr => {
      let unitCost = 0;
      if (curr.isCombo && curr.comboItems) {
        unitCost = curr.comboItems.reduce((acc, ci) => {
          const p = allProducts.find(prod => prod.id === ci.productId);
          if (!p) return acc;
          const pCost = p.recipeBom.reduce((bomAcc, b) => {
            const ing = ingredients.find(i => i.id === b.ingredientId);
            return bomAcc + (ing ? ing.costPerUnit * b.quantity : 0);
          }, 0);
          return acc + pCost * ci.quantity;
        }, 0);
      } else {
        const prod = allProducts.find(p => p.id === curr.productId);
        if (curr.recipeBom && curr.recipeBom.length > 0) {
          unitCost = curr.recipeBom.reduce((bomAcc, b) => {
            const ing = ingredients.find(i => i.id === b.ingredientId);
            return bomAcc + (ing ? ing.costPerUnit * b.quantity : 0);
          }, 0);
        } else if (prod) {
          unitCost = prod.targetCost;
        }
      }
      const totalCost = Number((unitCost * curr.quantity).toFixed(2));
      return {
        ...curr,
        unitCost: Number(unitCost.toFixed(2)),
        totalCost
      };
    });

    const projectedCost = Number(itemsWithCost.reduce((acc, curr) => acc + (curr.totalCost || 0), 0).toFixed(2));

    const newTicketNumber = orders.length > 0 ? orders[0].ticketNumber + 1 : 101;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      ticketNumber: newTicketNumber,
      createdAt: new Date().toISOString(),
      tableId: targetTable.tableId,
      tableName: targetTable.tableName,
      items: itemsWithCost,
      manualDisposables: targetTable.manualDisposables,
      subtotal: grandTotal,
      tax: Number((grandTotal * 0.18).toFixed(2)),
      total: grandTotal,
      totalFoodCost: projectedCost,
      paymentMethod,
      customerName: targetTable.customerName,
      orderType: targetTable.tableId.startsWith('llevar') ? 'para_llevar' : 'para_mesa',
      status: 'completado',
      disposablesCostReal: Number((realDisposablesCost + manualDisposablesCost).toFixed(2)),
      disposablesCharged: Number((autoDisposablesCharge + manualDisposablesCost).toFixed(2))
    };

    deductInventoryWithFifo(
      targetTable.items,
      targetTable.enableDisposables,
      targetTable.manualDisposables
    );

    setOrders(prev => [newOrder, ...prev]);
    saveOrder(newOrder).catch(() => {});

    setTables(prev => {
      let nextTables: TableOrder[];
      if (tableId.startsWith('llevar-')) {
        nextTables = prev.filter(tbl => tbl.tableId !== tableId);
      } else {
        nextTables = prev.map(tbl =>
          tbl.tableId === tableId
            ? {
                ...tbl,
                status: 'libre',
                items: [],
                manualDisposables: [],
                customerName: '',
                total: 0,
                sentToKitchenAt: undefined
              }
            : tbl
        );
      }
      saveTables(nextTables).catch(() => {});
      return nextTables;
    });

    if (tableId.startsWith('llevar-') && activeTableId === tableId) {
      setActiveTableId('mesa-1');
    }

    return newOrder;
  };


  // Cancelar mesa o cerrar orden para llevar dinámica
  const cancelTable = (tableId: string) => {
    setTables(prev => {
      let nextTables: TableOrder[];
      if (tableId.startsWith('llevar-')) {
        nextTables = prev.filter(tbl => tbl.tableId !== tableId);
        if (activeTableId === tableId) {
          setActiveTableId('mesa-1');
        }
      } else {
        nextTables = prev.map(tbl =>
          tbl.tableId === tableId
            ? {
                ...tbl,
                status: 'libre',
                items: [],
                manualDisposables: [],
                customerName: '',
                total: 0,
                sentToKitchenAt: undefined
              }
            : tbl
        );
      }
      saveTables(nextTables).catch(() => {});
      return nextTables;
    });
  };

  // Agregar nuevo pedido para llevar paralelo
  const addTakeoutTable = (): string => {
    const takeoutCount = tables.filter(t => t.tableId === 'llevar' || t.tableId.startsWith('llevar-')).length;
    const newId = `llevar-${Date.now()}`;
    const newName = `Para Llevar ${takeoutCount + 1}`;
    const newTable: TableOrder = {
      tableId: newId,
      tableName: newName,
      status: 'libre',
      items: [],
      enableDisposables: true,
      manualDisposables: [],
      total: 0
    };
    setTables(prev => {
      const next = [...prev, newTable];
      saveTables(next).catch(() => {});
      return next;
    });
    setActiveTableId(newId);
    return newId;
  };

  const removeTakeoutTable = (tableId: string) => {
    if (tableId === 'llevar') {
      cancelTable('llevar');
      return;
    }
    cancelTable(tableId);
  };

  // KDS: Comandas en preparación
  const kdsOrders = tables.filter(t => t.status === 'en_preparacion' && t.items.length > 0);

  const markKdsItemsReady = (tableId: string) => {
    setTables(prev => {
      const updatedTables = prev.map(tbl => {
        if (tbl.tableId === tableId) {
          const updatedItems: OrderItem[] = tbl.items.map(item => ({
            ...item,
            kitchenStatus: 'entregado' as const
          }));
          return {
            ...tbl,
            items: updatedItems,
            status: 'por_cobrar' as const
          };
        }
        return tbl;
      });

      saveTables(updatedTables).catch(() => {});
      return updatedTables;
    });
  };

  // Crear orden directa desde POS
  const createOrder = (orderData: Omit<Order, 'id' | 'ticketNumber' | 'createdAt' | 'status'>): Order => {
    const newTicketNumber = orders.length > 0 ? orders[0].ticketNumber + 1 : 101;
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      ticketNumber: newTicketNumber,
      createdAt: new Date().toISOString(),
      status: 'completado'
    };

    deductInventoryWithFifo(orderData.items, true, orderData.manualDisposables);
    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  // Compras Detalladas (ERP) con registro de Lotes FIFO e impacto ponderado
  const addDetailedInvoice = (invoice: DetailedPurchaseInvoice) => {
    setIngredients(prev => {
      const updated = [...prev];
      invoice.items.forEach(item => {
        const idx = updated.findIndex(i => i.id === item.ingredientId || i.code === item.code);
        if (idx !== -1) {
          const currentIng = updated[idx];
          const newBatch: InventoryBatch = {
            id: `batch-${currentIng.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            purchaseInvoiceId: invoice.id,
            date: invoice.purchaseDate || new Date().toISOString(),
            initialQty: item.quantity,
            remainingQty: item.quantity,
            unitCost: item.unitValue
          };

          const existingBatches = currentIng.batches && currentIng.batches.length > 0
            ? currentIng.batches
            : currentIng.stock > 0
            ? [{
                id: `batch-${currentIng.id}-legacy`,
                date: new Date().toISOString(),
                initialQty: currentIng.stock,
                remainingQty: currentIng.stock,
                unitCost: currentIng.costPerUnit
              }]
            : [];

          const updatedBatches = [...existingBatches, newBatch];
          const totalVal = updatedBatches.reduce((acc, b) => acc + b.remainingQty * b.unitCost, 0);
          const totalQty = updatedBatches.reduce((acc, b) => acc + b.remainingQty, 0);
          const newAvgCost = totalQty > 0 ? Number((totalVal / totalQty).toFixed(2)) : item.unitValue;

          updated[idx] = {
            ...currentIng,
            stock: Number((currentIng.stock + item.quantity).toFixed(3)),
            costPerUnit: newAvgCost,
            batches: updatedBatches,
            lastUpdated: new Date().toISOString()
          };
        }
      });
      saveIngredients(updated).catch(() => {});
      return updated;
    });

    setDetailedInvoices(prev => [invoice, ...prev]);
  };

  // Compras Rápidas Móvil (Unificada en detailedInvoices)
  const addPurchase = (purchaseData: Omit<PurchaseRecord, 'id' | 'costPerUnit'>) => {
    const costPerUnit = Number((purchaseData.totalAmount / purchaseData.quantity).toFixed(2));
    const targetIng = ingredients.find(i => i.id === purchaseData.ingredientId);

    const newRecord: PurchaseRecord = {
      ...purchaseData,
      id: `pur-${Date.now()}`,
      costPerUnit
    };
    setPurchases(prev => [newRecord, ...prev]);

    const nextCode = (8500 + detailedInvoices.length).toString();
    const isTax = targetIng?.isTaxAffected ?? false;
    const taxAmt = isTax ? Number((purchaseData.totalAmount * 0.18).toFixed(2)) : 0;

    const detailedItem: DetailedPurchaseItem = {
      id: `dpi-${Date.now()}`,
      ingredientId: purchaseData.ingredientId,
      code: targetIng?.code || 'S/C',
      name: (targetIng?.name || purchaseData.ingredientName).toUpperCase(),
      itemType: targetIng?.itemType || 'insumo',
      presentation: purchaseData.unit === 'kg' ? 'KILOS' : purchaseData.unit === 'L' ? 'LITROS' : 'UNIDADES',
      quantity: purchaseData.quantity,
      warehouse: 'Almacén Principal',
      isTaxAffected: isTax,
      unitValue: costPerUnit,
      costVariationPercent: 0,
      discount: 0,
      subtotal: purchaseData.totalAmount,
      taxAmount: taxAmt,
      total: purchaseData.totalAmount
    };

    const newInvoice: DetailedPurchaseInvoice = {
      id: `inv-movil-${Date.now()}`,
      codeNumber: nextCode,
      registerDate: new Date().toLocaleDateString('es-PE') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      purchaseDate: new Date().toLocaleDateString('es-PE') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      documentType: 'Boleta',
      series: 'BOL-MÓVIL',
      number: nextCode,
      local: 'Sabor & Fruta - Carabayllo',
      supplier: (purchaseData.supplier || 'MERCADO MAYORISTA').toUpperCase(),
      paymentType: 'Contado',
      currency: 'PEN',
      taxOption: 'IMPUESTOS INCLUIDOS',
      items: [detailedItem],
      subtotal: purchaseData.totalAmount,
      globalDiscount: 0,
      taxableOperation: isTax ? purchaseData.totalAmount : 0,
      unaffectedOperation: !isTax ? purchaseData.totalAmount : 0,
      taxes: taxAmt,
      total: purchaseData.totalAmount,
      notes: `Compra rápida desde móvil (${purchaseData.supplier})`,
      status: 'Activo'
    };

    addDetailedInvoice(newInvoice);
  };

  // Batches y Mermas con salida FIFO
  const addBatch = (batchData: Omit<BatchProduction, 'id'>) => {
    const newBatch: BatchProduction = { ...batchData, id: `batch-${Date.now()}` };
    setIngredients(prev => {
      let updated = [...prev];
      batchData.consumedIngredients.forEach(ci => {
        const idx = updated.findIndex(i => i.id === ci.ingredientId);
        if (idx !== -1) {
          const { updatedIngredient } = deductFifoFromIngredient(updated[idx], ci.quantity);
          updated[idx] = updatedIngredient;
        }
      });
      const outIdx = updated.findIndex(i => i.id === batchData.outputIngredientId);
      if (outIdx !== -1) {
        const producedBatch: InventoryBatch = {
          id: `batch-prod-${Date.now()}`,
          date: new Date().toISOString(),
          initialQty: batchData.outputQuantity,
          remainingQty: batchData.outputQuantity,
          unitCost: Number((batchData.costEstimate / batchData.outputQuantity).toFixed(2))
        };
        updated[outIdx] = {
          ...updated[outIdx],
          stock: Number((updated[outIdx].stock + batchData.outputQuantity).toFixed(3)),
          batches: [...(updated[outIdx].batches || []), producedBatch],
          lastUpdated: new Date().toISOString()
        };
      }
      saveIngredients(updated).catch(() => {});
      return updated;
    });
    setBatches(prev => [newBatch, ...prev]);
  };

  const addWaste = (wasteData: Omit<WasteRecord, 'id' | 'costLost'>) => {
    const targetIng = ingredients.find(i => i.id === wasteData.ingredientId);
    let costLost = 0;

    setIngredients(prev => {
      const updated = prev.map(ing => {
        if (ing.id === wasteData.ingredientId) {
          const { updatedIngredient, costOfDeduction } = deductFifoFromIngredient(ing, wasteData.quantity);
          costLost = costOfDeduction;
          return updatedIngredient;
        }
        return ing;
      });
      saveIngredients(updated).catch(() => {});
      return updated;
    });

    const newWaste: WasteRecord = {
      ...wasteData,
      id: `waste-${Date.now()}`,
      costLost: Number(costLost.toFixed(2)) || (targetIng ? Number((wasteData.quantity * targetIng.costPerUnit).toFixed(2)) : 0)
    };
    setWastes(prev => [newWaste, ...prev]);
  };

  // Gestión de Proveedores
  const addSupplier = (supplierData: Omit<Supplier, 'id' | 'code' | 'createdAt'>) => {
    const nextNum = suppliers.length + 1;
    const code = `PRV-${String(nextNum).padStart(3, '0')}`;
    const newSupplier: Supplier = {
      ...supplierData,
      id: `prv-${Date.now()}`,
      code,
      createdAt: new Date().toISOString()
    };
    setSuppliers(prev => {
      const next = [...prev, newSupplier];
      saveSuppliers(next).catch(() => {});
      return next;
    });
  };

  const updateSupplier = (updated: Supplier) => {
    setSuppliers(prev => {
      const next = prev.map(s => (s.id === updated.id ? updated : s));
      saveSuppliers(next).catch(() => {});
      return next;
    });
  };

  // Gestión de Combos
  const addCombo = (comboData: Omit<Combo, 'id' | 'createdAt'>) => {
    const newCombo: Combo = {
      ...comboData,
      id: `combo-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setCombos(prev => [newCombo, ...prev]);
  };

  const updateCombo = (updated: Combo) => {
    setCombos(prev => prev.map(c => (c.id === updated.id ? updated : c)));
  };

  const deleteCombo = (id: string) => {
    setCombos(prev => prev.filter(c => c.id !== id));
  };

  const toggleComboActive = (id: string) => {
    setCombos(prev => prev.map(c => (c.id === id ? { ...c, isActive: !c.isActive } : c)));
  };

  // KDS: Decisión Operativa de Insumo vs Pulpa de Rescate (Global o por Fruta)
  const updateItemSourceType = (
    tableId: string,
    itemId: string,
    sourceType: 'fruta_fresca' | 'pulpa_rescate',
    fruitIngredientId?: string
  ) => {
    setTables(prev => {
      const next = prev.map(tbl => {
        if (tbl.tableId === tableId) {
          return {
            ...tbl,
            items: tbl.items.map(it => {
              if (it.id === itemId) {
                const nextFruitSources = fruitIngredientId
                  ? { ...(it.selectedFruitSources || {}), [fruitIngredientId]: sourceType }
                  : it.selectedFruitSources;
                return {
                  ...it,
                  selectedSourceType: sourceType,
                  selectedFruitSources: nextFruitSources
                };
              }
              return it;
            })
          };
        }
        return tbl;
      });
      saveTables(next).catch(() => {});
      return next;
    });
  };

  // Configuración de Empresa
  const updateCompanyConfig = (updated: Partial<CompanyConfig>) => {
    setCompanyConfig(prev => {
      const next = { ...prev, ...updated };
      saveCompanyConfig(next).catch(() => {});
      return next;
    });
  };

  // Órdenes de Compra (OC)
  const addPurchaseOrder = (poData: Omit<PurchaseOrder, 'id' | 'createdAt'>) => {
    const newPo: PurchaseOrder = {
      ...poData,
      id: `po-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setPurchaseOrders(prev => {
      const next = [newPo, ...prev];
      savePurchaseOrders(next).catch(() => {});
      return next;
    });
  };

  const updatePurchaseOrderStatus = (
    poId: string,
    status: PurchaseOrderStatus,
    extraUpdates?: { convertedToInvoiceId?: string; convertedInvoiceNumber?: string }
  ) => {
    setPurchaseOrders(prev => {
      const next = prev.map(p => p.id === poId ? { ...p, status, ...extraUpdates } : p);
      savePurchaseOrders(next).catch(() => {});
      return next;
    });
  };

  const convertPoToInvoice = (poId: string) => {
    const po = purchaseOrders.find(p => p.id === poId);
    if (!po) return;

    const invoiceId = `inv-po-${Date.now()}`;
    const now = new Date().toISOString();

    const invoiceItems: DetailedPurchaseItem[] = po.items.map((item, idx) => {
      const ing = ingredients.find(i => i.id === item.ingredientId);
      return {
        id: `poi-${idx}-${Date.now()}`,
        ingredientId: item.ingredientId,
        code: item.ingredientCode,
        name: item.ingredientName,
        itemType: ing?.itemType || 'insumo',
        presentation: item.unit === 'kg' ? 'KILOS' : item.unit === 'L' ? 'LITROS' : 'UNIDADES',
        quantity: item.quantity,
        warehouse: 'Almacén Principal Carabayllo',
        isTaxAffected: (ing?.isTaxAffected ?? false),
        unitValue: item.unitPrice,
        costVariationPercent: 0,
        discount: 0,
        subtotal: item.subtotal,
        taxAmount: ing?.isTaxAffected ? Number((item.subtotal * 0.18).toFixed(2)) : 0,
        total: ing?.isTaxAffected ? Number((item.subtotal * 1.18).toFixed(2)) : item.subtotal
      };
    });

    const newInvoice: DetailedPurchaseInvoice = {
      id: invoiceId,
      codeNumber: `FAC-${po.poNumber.replace('OC-', '')}`,
      registerDate: now,
      purchaseDate: po.issueDate,
      documentType: 'Factura',
      series: 'F001',
      number: String(Math.floor(Math.random() * 90000) + 10000),
      local: companyConfig.tradeName,
      supplier: po.supplierName,
      paymentType: 'Contado',
      currency: 'PEN',
      taxOption: 'IMPUESTOS INCLUIDOS',
      items: invoiceItems,
      subtotal: po.subtotal,
      globalDiscount: 0,
      taxableOperation: po.taxAmount > 0 ? po.subtotal : 0,
      unaffectedOperation: po.taxAmount === 0 ? po.subtotal : 0,
      taxes: po.taxAmount,
      total: po.total,
      notes: `Generado automáticamente desde ${po.poNumber}`,
      status: 'Activo'
    };

    addDetailedInvoice(newInvoice);

    setPurchaseOrders(prev => {
      const next = prev.map(p => p.id === poId ? { ...p, status: 'recibida' as const, convertedToInvoiceId: invoiceId } : p);
      savePurchaseOrders(next).catch(() => {});
      return next;
    });
  };

  // Catálogo Maestro de Toppings
  const addToppingMaster = (topData: Omit<ToppingMaster, 'id'>) => {
    const newTop: ToppingMaster = {
      ...topData,
      id: `top-${Date.now()}`
    };
    setToppingsMaster(prev => {
      const next = [...prev, newTop];
      saveToppingsMaster(next).catch(() => {});
      return next;
    });
  };

  const updateToppingMaster = (updated: ToppingMaster) => {
    setToppingsMaster(prev => {
      const next = prev.map(t => t.id === updated.id ? updated : t);
      saveToppingsMaster(next).catch(() => {});
      return next;
    });
  };

  const deleteToppingMaster = (id: string) => {
    setToppingsMaster(prev => {
      const next = prev.filter(t => t.id !== id);
      saveToppingsMaster(next).catch(() => {});
      return next;
    });
  };

  // Configuración de Mesas del Local
  const addTableConfig = (tblData: Omit<TableConfig, 'id'>) => {
    const newId = `mesa-${Date.now()}`;
    const newConfig: TableConfig = { ...tblData, id: newId };
    setTablesConfig(prev => {
      const next = [...prev, newConfig];
      saveTablesConfig(next).catch(() => {});
      return next;
    });
    setTables(prev => [
      ...prev,
      {
        tableId: newId,
        tableName: tblData.numberName,
        status: 'libre',
        items: [],
        enableDisposables: tblData.zone === 'llevar',
        manualDisposables: [],
        total: 0
      }
    ]);
  };

  const updateTableConfig = (tbl: TableConfig) => {
    setTablesConfig(prev => {
      const next = prev.map(t => t.id === tbl.id ? tbl : t);
      saveTablesConfig(next).catch(() => {});
      return next;
    });
    setTables(prev =>
      prev.map(t => t.tableId === tbl.id ? { ...t, tableName: tbl.numberName } : t)
    );
  };

  const deleteTableConfig = (id: string) => {
    setTablesConfig(prev => {
      const next = prev.filter(t => t.id !== id);
      saveTablesConfig(next).catch(() => {});
      return next;
    });
    setTables(prev => prev.filter(t => t.tableId !== id));
  };

  // 15. Órdenes de Producción (Preparar Recetas / Subrecetas)
  const addProductionOrder = (op: ProductionOrder) => {
    // 1. Descontar insumos requeridos con FIFO
    setIngredients(prevIngredients => {
      let updated = [...prevIngredients];

      op.requiredIngredients.forEach(req => {
        const idx = updated.findIndex(i => i.id === req.ingredientId);
        if (idx !== -1) {
          const qtyToDeduct = req.quantityReal !== undefined && req.quantityReal > 0 ? req.quantityReal : req.quantityRequired;
          const { updatedIngredient } = deductFifoFromIngredient(updated[idx], qtyToDeduct);
          updated[idx] = updatedIngredient;
        }
      });

      // 2. Incrementar stock del producto/subreceta producido con un nuevo lote FIFO
      op.items.forEach(prodItem => {
        const targetId = prodItem.targetIngredientId || prodItem.recipeId;
        const targetIdx = updated.findIndex(i => i.id === targetId || i.code === prodItem.recipeCode);
        if (targetIdx !== -1) {
          const currentTarget = updated[targetIdx];
          const newBatch: InventoryBatch = {
            id: `batch-${op.orderNumber}-${Date.now()}`,
            purchaseInvoiceId: op.orderNumber,
            date: op.preparedAt,
            initialQty: prodItem.resultQuantity,
            remainingQty: prodItem.resultQuantity,
            unitCost: prodItem.unitCost
          };
          const nextBatches = currentTarget.batches ? [...currentTarget.batches, newBatch] : [newBatch];
          const nextStock = Number((currentTarget.stock + prodItem.resultQuantity).toFixed(3));
          updated[targetIdx] = {
            ...currentTarget,
            stock: nextStock,
            batches: nextBatches
          };
        }
      });

      saveIngredients(updated).catch(() => {});
      return updated;
    });

    // 3. Registrar mermas si hubo diferencia entre cantidad estimada y resultante
    op.items.forEach(prodItem => {
      if (prodItem.wasteQuantity > 0) {
        addWaste({
          ingredientId: prodItem.targetIngredientId || prodItem.recipeId,
          ingredientName: prodItem.recipeName,
          quantity: prodItem.wasteQuantity,
          unit: prodItem.unit,
          reason: 'merma_corte',
          notes: `Merma en ${op.orderNumber} (${prodItem.wastePercent.toFixed(1)}%)`,
          date: op.preparedAt
        });
      }
    });

    // 4. Guardar orden de producción
    setProductionOrders(prev => {
      const next = [op, ...prev];
      saveProductionOrder(op).catch(() => {});
      return next;
    });
  };

  const updateProductionOrderStatus = (id: string, status: ProductionOrderStatus) => {
    setProductionOrders(prev => {
      const next = prev.map(p => p.id === id ? { ...p, status } : p);
      const updatedOp = next.find(p => p.id === id);
      if (updatedOp) saveProductionOrder(updatedOp).catch(() => {});
      return next;
    });
  };

  const deleteProductionOrder = (id: string) => {
    setProductionOrders(prev => {
      const next = prev.filter(p => p.id !== id);
      deleteProductionOrderApi(id).catch(() => {});
      return next;
    });
  };

  // Métricas
  const totalSalesToday = orders.reduce((acc, curr) => acc + curr.total, 0);
  const ordersCountToday = orders.length;
  const averageFoodCostToday = orders.length > 0
    ? Number(
        (
          (orders.reduce((acc, curr) => acc + curr.totalFoodCost, 0) /
            Math.max(1, totalSalesToday)) *
          100
        ).toFixed(1)
      )
    : 45.0;

  // Métricas de descartables: costo real vs. cobrado (para control de márgenes)
  const disposablesCostToday = orders.reduce((acc, curr) => acc + (curr.disposablesCostReal || 0), 0);
  const disposablesRevenueToday = orders.reduce((acc, curr) => acc + (curr.disposablesCharged || 0), 0);

  return (
    <AppContext.Provider
      value={{
        themeMode,
        toggleTheme,
        menuConfig,
        updateMenuConfig,
        addNewProductRecipe,
        updateProductRecipe,
        addRecipeCategory,
        ingredients,
        updateIngredientStock,
        updateIngredient,
        addIngredient,
        customIngredientCategories,
        addIngredientCategory,
        tables,
        activeTableId,
        setActiveTableId,
        updateTableItems,
        addManualDisposableToTable,
        removeManualDisposableFromTable,
        sendTableToKitchen,
        checkoutAndCloseTable,
        cancelTable,
        addTakeoutTable,
        removeTakeoutTable,
        kdsOrders,
        markKdsItemsReady,
        orders,
        createOrder,
        detailedInvoices,
        addDetailedInvoice,
        purchases,
        addPurchase,
        batches,
        addBatch,
        wastes,
        addWaste,
        suppliers,
        addSupplier,
        updateSupplier,
        combos,
        addCombo,
        updateCombo,
        deleteCombo,
        toggleComboActive,
        companyConfig,
        updateCompanyConfig,
        purchaseOrders,
        addPurchaseOrder,
        updatePurchaseOrderStatus,
        convertPoToInvoice,
        toppingsMaster,
        addToppingMaster,
        updateToppingMaster,
        deleteToppingMaster,
        tablesConfig,
        addTableConfig,
        updateTableConfig,
        deleteTableConfig,
        productionOrders,
        addProductionOrder,
        updateProductionOrderStatus,
        deleteProductionOrder,
        updateItemSourceType,
        totalSalesToday,
        ordersCountToday,
        averageFoodCostToday,
        disposablesCostToday,
        disposablesRevenueToday
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser usado dentro de un AppProvider');
  }
  return context;
};
