import React, { useState, useMemo } from 'react';
import {
  Plus, Minus, Trash2, CheckCircle2, CreditCard, Banknote, QrCode, User, Coffee, Send, Package, Sparkles, AlertTriangle,
  ArrowLeft, Eye, Clock, UtensilsCrossed, ChevronRight, ShoppingBag, X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import type { Product, QuickModifier, OrderItem, OrderItemModifier, ManualDisposable, Combo, BomItem, TableOrder, SelectedFlavorSlot, SelectedServing } from '../types';

export const PosModule: React.FC = () => {
  const {
    menuConfig, ingredients, ingredientCategories, tables, activeTableId, setActiveTableId,
    updateTableItems, addManualDisposableToTable, removeManualDisposableFromTable,
    sendTableToKitchen, checkoutAndCloseTable, addTakeoutTable, removeTakeoutTable, themeMode, combos,
    toppingsMaster
  } = useApp();

  const isLight = themeMode === 'light';
  // Modo de visualización: 'tables' (Salón de mesas con tarjetas grandes) | 'order' (Toma de pedidos en mesa)
  const [posViewMode, setPosViewMode] = useState<'tables' | 'order'>('tables');
  // Modal de inspección rápida de comanda desde la tarjeta de mesa
  const [inspectingTable, setInspectingTable] = useState<TableOrder | null>(null);

  const activeTable = tables.find(t => t.tableId === activeTableId) || tables[0];
  const [selectedLineId, setSelectedLineId] = useState<string>(menuConfig.lines[0]?.id || 'linea-fria');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [activeProductForModal, setActiveProductForModal] = useState<Product | null>(null);
  const [tempModifiers, setTempModifiers] = useState<(QuickModifier & { selectedVariantIngredientId?: string; selectedVariantName?: string })[]>([]);
  const [tempSlotSelections, setTempSlotSelections] = useState<Record<number, string>>({});
  const [tempServingSelection, setTempServingSelection] = useState<string>('');
  const [variantPickingMod, setVariantPickingMod] = useState<QuickModifier | null>(null);
  const [mobileTab, setMobileTab] = useState<'menu' | 'comanda'>('menu');
  const [showManualDisposablesModal, setShowManualDisposablesModal] = useState<boolean>(false);

  const disposableOptions = ingredients.filter(i => i.itemType === 'descartable');
  const [selectedManualIngId, setSelectedManualIngId] = useState<string>(disposableOptions[0]?.id || '');
  const [manualQty, setManualQty] = useState<number>(1);
  const [manualPrice, setManualPrice] = useState<number>(0.00);

  // Cálculo en vivo del costo real de descartables automáticos según BOM
  const autoDisposablesCost = useMemo(() => {
    if (!activeTable.enableDisposables || activeTable.items.length === 0) return 0;
    let cost = 0;
    activeTable.items.forEach(item => {
      item.recipeBom.forEach(bom => {
        const ing = ingredients.find(i => i.id === bom.ingredientId);
        const isItemDisposable = bom.isDisposable || ing?.itemType === 'descartable';
        if (isItemDisposable && ing) {
          cost += ing.costPerUnit * bom.quantity * item.quantity;
        }
      });
    });
    return Number(cost.toFixed(2));
  }, [activeTable.enableDisposables, activeTable.items, ingredients]);

  const autoDisposablesCharge = autoDisposablesCost > 1.50
    ? autoDisposablesCost
    : (activeTable.enableDisposables && activeTable.items.length > 0 ? 1.00 : 0);

  const activeLine = menuConfig.lines.find(l => l.id === selectedLineId) || menuConfig.lines[0];
  const rawProducts = selectedCategoryId === 'all'
    ? (activeLine ? activeLine.categories.flatMap(c => c.products) : [])
    : (activeLine ? activeLine.categories.find(c => c.id === selectedCategoryId)?.products || [] : []);

  // En el POS de salón/mesas NO deben salir subrecetas de producción (SUB-xxx / recipeType==='base') ni recetas inactivas/pausadas
  const displayedProducts = rawProducts.filter(p => {
    const isBase = p.recipeType === 'base' || p.recipeType === 'intermedia' || p.sku.startsWith('SUB-');
    const isActive = p.isActive !== false;
    return !isBase && isActive;
  });

  const allProducts = useMemo(() => {
    return menuConfig.lines.flatMap(l => l.categories.flatMap(c => c.products));
  }, [menuConfig]);

  // Comprobación de stock teórico para recetas e insumos (Alerta informativa sin bloqueo de venta)
  const getProductStockAlert = (product: Product): { isLow: boolean; missingDetails: string[] } => {
    const missing: string[] = [];
    if (!product.recipeBom || product.recipeBom.length === 0) {
      return { isLow: false, missingDetails: [] };
    }

    product.recipeBom.forEach(bom => {
      const ing = ingredients.find(i => i.id === bom.ingredientId);
      if (!ing) return;
      if (ing.stock < bom.quantity || ing.stock <= 0) {
        missing.push(`${ing.name} (${ing.stock} ${ing.unit})`);
      }
    });

    return {
      isLow: missing.length > 0,
      missingDetails: missing
    };
  };

  const getComboStockAlert = (combo: Combo): { isLow: boolean; missingDetails: string[] } => {
    const missing: string[] = [];
    combo.items.forEach(ci => {
      const prod = allProducts.find(p => p.id === ci.productId);
      if (prod) {
        const alertInfo = getProductStockAlert(prod);
        if (alertInfo.isLow) {
          missing.push(...alertInfo.missingDetails);
        }
      }
    });
    const uniqueMissing = Array.from(new Set(missing));
    return {
      isLow: uniqueMissing.length > 0,
      missingDetails: uniqueMissing
    };
  };

  const addComboToActiveTable = (combo: Combo) => {
    const existingIndex = activeTable.items.findIndex(
      item => item.isCombo && item.comboId === combo.id && item.kitchenStatus === 'pendiente'
    );

    const combinedBom: BomItem[] = [];
    combo.items.forEach(ci => {
      const prod = allProducts.find(p => p.id === ci.productId);
      if (prod) {
        prod.recipeBom.forEach(b => {
          combinedBom.push({
            ingredientId: b.ingredientId,
            quantity: b.quantity * ci.quantity,
            unit: b.unit,
            isDisposable: b.isDisposable
          });
        });
      }
    });

    let newItems: OrderItem[];
    if (existingIndex >= 0) {
      newItems = activeTable.items.map((item, idx) => {
        if (idx === existingIndex) {
          const newQty = item.quantity + 1;
          return {
            ...item,
            quantity: newQty,
            itemTotal: Number((newQty * item.price).toFixed(2))
          };
        }
        return item;
      });
    } else {
      const newComboItem: OrderItem = {
        id: `citem-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        productId: combo.id,
        name: combo.name,
        price: combo.price,
        quantity: 1,
        selectedModifiers: [],
        itemTotal: combo.price,
        recipeBom: combinedBom,
        kitchenStatus: 'pendiente',
        addedAt: new Date().toISOString(),
        isCombo: true,
        comboId: combo.id,
        comboItems: combo.items.map(ci => ({
          productId: ci.productId,
          name: ci.name,
          quantity: ci.quantity
        }))
      };
      newItems = [...activeTable.items, newComboItem];
    }

    updateTableItems(
      activeTable.tableId,
      newItems,
      activeTable.enableDisposables,
      activeTable.customerName,
      activeTable.manualDisposables
    );
  };

  const getFlavorInfo = (ingredientId: string, requiredQuantity: number = 0.001) => {
    const ing = ingredients.find(i => i.id === ingredientId);
    const cat = ing?.category ? ingredientCategories.find(c => c.id === ing.category || c.name === ing.category) : null;
    const emoji = ing?.icon || cat?.icon || '📦';
    return {
      ing,
      id: ingredientId,
      name: ing?.name || ingredientId,
      fullName: ing?.name || ingredientId,
      emoji,
      stock: ing?.stock || 0,
      unit: ing?.unit || 'und',
      cost: ing?.costPerUnit || 0,
      isAvailable: (ing?.stock || 0) >= Math.max(requiredQuantity, 0.001)
    };
  };

  const addItemToActiveTable = (
    product: Product,
    modifiers: (QuickModifier & { selectedVariantIngredientId?: string; selectedVariantName?: string })[],
    selectedSlots?: SelectedFlavorSlot[],
    selectedServing?: SelectedServing
  ) => {
    const modTotal = modifiers.reduce((acc, m) => acc + m.priceDelta, 0);
    const servingDelta = selectedServing?.priceDelta || 0;
    const unitPrice = product.price + modTotal + servingDelta;
    const formattedMods: OrderItemModifier[] = modifiers.map(m => ({
      id: m.id,
      label: m.label,
      priceDelta: m.priceDelta,
      toppingMasterId: m.toppingMasterId,
      ingredientId: m.ingredientId,
      quantity: m.quantity,
      unit: m.unit,
      selectedVariantIngredientId: m.selectedVariantIngredientId,
      selectedVariantName: m.selectedVariantName
    }));

    const modKey = formattedMods.map(m => `${m.id}:${m.selectedVariantIngredientId || ''}`).sort().join(',');
    const slotsKey = (selectedSlots || []).map(s => `${s.slotIndex}:${s.ingredientId}`).sort().join(',');
    const servingKey = selectedServing?.id || '';

    // Buscar si ya existe un ítem idéntico y con kitchenStatus === 'pendiente'
    const existingIndex = activeTable.items.findIndex(item => {
      if (item.productId !== product.id) return false;
      if (item.kitchenStatus !== 'pendiente') return false;
      const itemModKey = (item.selectedModifiers || []).map(m => `${m.id}:${m.selectedVariantIngredientId || ''}`).sort().join(',');
      const itemSlotsKey = (item.selectedSlots || []).map(s => `${s.slotIndex}:${s.ingredientId}`).sort().join(',');
      const itemServingKey = item.selectedServing?.id || '';
      return itemModKey === modKey && itemSlotsKey === slotsKey && itemServingKey === servingKey;
    });

    let newItems: OrderItem[];

    if (existingIndex >= 0) {
      newItems = activeTable.items.map((item, idx) => {
        if (idx === existingIndex) {
          const newQty = item.quantity + 1;
          return {
            ...item,
            quantity: newQty,
            itemTotal: Number((newQty * item.price).toFixed(2))
          };
        }
        return item;
      });
    } else {
      const newItem: OrderItem = {
        id: `${product.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        productId: product.id,
        name: product.shortName || product.name,
        price: unitPrice,
        quantity: 1,
        selectedModifiers: formattedMods,
        selectedSlots,
        selectedServing,
        itemTotal: unitPrice,
        recipeBom: product.recipeBom,
        kitchenStatus: 'pendiente'
      };
      newItems = [...activeTable.items, newItem];
    }

    updateTableItems(activeTable.tableId, newItems, activeTable.enableDisposables, activeTable.customerName, activeTable.manualDisposables);
  };

  const handleFastAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.flavorSlots && product.flavorSlots.length > 0) {
      handleOpenModifiers(product);
    } else {
      addItemToActiveTable(product, []);
    }
  };

  const handleOpenModifiers = (product: Product) => {
    setActiveProductForModal(product);
    setTempModifiers([]);
    setVariantPickingMod(null);

    // Inicializar slots de opciones y variantes
    const initialSlots: Record<number, string> = {};
    if (product.flavorSlots) {
      product.flavorSlots.forEach(slot => {
        let allowed: string[] = [];
        if (slot.allowedIngredientIds && slot.allowedIngredientIds.length > 0) {
          allowed = slot.allowedIngredientIds;
        } else if (slot.category && slot.category !== 'todas') {
          allowed = ingredients.filter(i => i.category === slot.category).map(i => i.id);
        } else {
          allowed = ingredients.filter(i => i.category === 'helados').map(i => i.id);
        }

        const firstAvail = allowed.find(id => {
          const ing = ingredients.find(i => i.id === id);
          return ing && ing.stock >= (slot.quantity || 0.05);
        }) || allowed[0] || '';

        if (firstAvail) {
          initialSlots[slot.slotIndex] = firstAvail;
        }
      });
    }
    setTempSlotSelections(initialSlots);

    // Inicializar opción de presentación
    if (product.servingOptions && product.servingOptions.length > 0) {
      setTempServingSelection(product.servingOptions[0].id);
    } else {
      setTempServingSelection('');
    }
  };

  const toggleModalModifier = (mod: QuickModifier) => {
    const masterTop = mod.toppingMasterId
      ? toppingsMaster.find(t => t.id === mod.toppingMasterId)
      : toppingsMaster.find(t => t.name.toLowerCase() === mod.label.toLowerCase());

    const hasVariants = Boolean(mod.hasVariants || masterTop?.hasVariants);

    // Si el modificador tiene variantes de sabor (ej. + Bola de Helado), abrir selector de sabor
    if (hasVariants) {
      // Si ya estaba seleccionado, al presionar de nuevo se desmarca
      const alreadySelected = tempModifiers.some(m => m.id === mod.id);
      if (alreadySelected && variantPickingMod?.id !== mod.id) {
        setTempModifiers(prev => prev.filter(m => m.id !== mod.id));
        setVariantPickingMod(null);
        return;
      }

      let allowedIngredientIds = mod.allowedIngredientIds || masterTop?.allowedIngredientIds;
      if (!allowedIngredientIds || allowedIngredientIds.length === 0) {
        const targetCategory = mod.variantCategory || masterTop?.variantCategory || masterTop?.category || (mod.label.toLowerCase().includes('helado') ? 'helados' : mod.label.toLowerCase().includes('pan') ? 'panaderia' : undefined);
        if (targetCategory) {
          allowedIngredientIds = ingredients.filter(i => i.category === targetCategory).map(i => i.id);
        } else {
          allowedIngredientIds = ingredients.filter(i => i.category === 'helados').map(i => i.id);
        }
      }

      setVariantPickingMod({
        ...mod,
        hasVariants: true,
        allowedIngredientIds
      });
      return;
    }

    if (tempModifiers.some(m => m.id === mod.id)) {
      setTempModifiers(prev => prev.filter(m => m.id !== mod.id));
    } else {
      setTempModifiers(prev => [...prev, mod]);
    }
  };

  const handleSelectModifierVariant = (mod: QuickModifier, variantIngId: string) => {
    const info = getFlavorInfo(variantIngId);
    const existingIndex = tempModifiers.findIndex(m => m.id === mod.id);

    const updatedMod = {
      ...mod,
      label: `+ ${mod.label.replace(/^\+\s*/, '')} (${info.name})`,
      selectedVariantIngredientId: variantIngId,
      selectedVariantName: info.name
    };

    if (existingIndex >= 0) {
      setTempModifiers(prev => prev.map((m, idx) => idx === existingIndex ? updatedMod : m));
    } else {
      setTempModifiers(prev => [...prev, updatedMod]);
    }
    setVariantPickingMod(null);
  };

  const confirmModalAdd = () => {
    if (!activeProductForModal) return;

    // Validar que todos los slots requeridos tengan un sabor seleccionado
    if (activeProductForModal.flavorSlots) {
      for (const slot of activeProductForModal.flavorSlots) {
        if (slot.required && !tempSlotSelections[slot.slotIndex]) {
          alert(`Por favor selecciona el sabor para ${slot.label}.`);
          return;
        }
      }
    }

    // Construir lista de slots formateados
    const formattedSlots: SelectedFlavorSlot[] = (activeProductForModal.flavorSlots || []).map(slot => {
      const ingId = tempSlotSelections[slot.slotIndex];
      const info = getFlavorInfo(ingId);
      return {
        slotIndex: slot.slotIndex,
        slotLabel: slot.label,
        ingredientId: ingId,
        ingredientName: info.name,
        quantity: slot.quantity,
        unit: slot.unit
      };
    });

    // Construir serving seleccionado
    let selectedServingObj: SelectedServing | undefined;
    if (activeProductForModal.servingOptions && tempServingSelection) {
      const foundServing = activeProductForModal.servingOptions.find(s => s.id === tempServingSelection);
      if (foundServing) {
        selectedServingObj = {
          id: foundServing.id,
          name: foundServing.name,
          ingredientId: foundServing.ingredientId,
          priceDelta: foundServing.priceDelta
        };
      }
    }

    addItemToActiveTable(activeProductForModal, tempModifiers, formattedSlots.length > 0 ? formattedSlots : undefined, selectedServingObj);
    setActiveProductForModal(null);
    setTempModifiers([]);
    setTempSlotSelections({});
    setTempServingSelection('');
    setVariantPickingMod(null);
  };

  const updateItemQuantity = (cartItemId: string, delta: number) => {
    const targetItem = activeTable.items.find(i => i.id === cartItemId);
    if (!targetItem) return;

    // Si el ítem ya fue servido/entregado y se le quiere sumar (+1), no mutar la línea entregada
    // sino crear una nueva línea como 'pendiente' para enviarse a barra
    if (targetItem.kitchenStatus === 'entregado' && delta > 0) {
      const newLine: OrderItem = {
        ...targetItem,
        id: `${targetItem.productId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        quantity: delta,
        itemTotal: Number((delta * targetItem.price).toFixed(2)),
        kitchenStatus: 'pendiente'
      };
      updateTableItems(activeTable.tableId, [...activeTable.items, newLine], activeTable.enableDisposables, activeTable.customerName, activeTable.manualDisposables);
      return;
    }

    const updated = activeTable.items.map(item => {
      if (item.id === cartItemId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty, itemTotal: Number((newQty * item.price).toFixed(2)) } : null;
      }
      return item;
    }).filter(Boolean) as OrderItem[];

    updateTableItems(activeTable.tableId, updated, activeTable.enableDisposables, activeTable.customerName, activeTable.manualDisposables);
  };

  const removeItemFromTable = (cartItemId: string) => {
    const updated = activeTable.items.filter(i => i.id !== cartItemId);
    updateTableItems(activeTable.tableId, updated, activeTable.enableDisposables, activeTable.customerName, activeTable.manualDisposables);
  };

  const clearActiveTable = () => {
    updateTableItems(activeTable.tableId, [], activeTable.enableDisposables, '', []);
  };

  const handleToggleDisposables = () => {
    updateTableItems(activeTable.tableId, activeTable.items, !activeTable.enableDisposables, activeTable.customerName, activeTable.manualDisposables);
  };

  const handleAddManualDisposable = () => {
    const target = disposableOptions.find(d => d.id === selectedManualIngId) || disposableOptions[0];
    if (!target) return;
    addManualDisposableToTable(activeTable.tableId, {
      ingredientId: target.id,
      name: target.name,
      quantity: manualQty,
      unitPrice: manualPrice
    });
    setShowManualDisposablesModal(false);
    setManualQty(1);
    setManualPrice(0.00);
  };

  const handleSendToKitchen = () => {
    if (activeTable.items.length === 0) return;
    sendTableToKitchen(activeTable.tableId);
    // Retorno automático al salón de mesas tras enviar la comanda
    setPosViewMode('tables');
  };

  const handleCheckoutTable = (paymentMethod: 'efectivo' | 'yape_plin' | 'tarjeta') => {
    if (activeTable.items.length === 0 && (activeTable.manualDisposables || []).length === 0) return;
    checkoutAndCloseTable(activeTable.tableId, paymentMethod);
    try {
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.85 } });
    } catch {}
    // Retorno automático al salón de mesas tras cobrar
    setPosViewMode('tables');
  };

  // Ítems pendientes que aún no han sido enviados a barra (kitchenStatus === 'pendiente' o undefined)
  const unsentItemsCount = activeTable.items.filter(i => !i.kitchenStatus || i.kitchenStatus === 'pendiente').length;
  // Ítems en preparación activa en barra
  const inPrepItemsCount = activeTable.items.filter(i => i.kitchenStatus === 'en_preparacion').length;
  // El botón solo se activa si hay productos y al menos uno está pendiente de envío a barra
  const canSendToKitchen = unsentItemsCount > 0;
  return (
    <div className={'flex-1 flex flex-col h-full overflow-hidden min-h-0 ' + (isLight ? 'bg-slate-100 text-slate-900 font-sans' : 'bg-slate-950 text-slate-100')}>
      
      {/* ========================================================================= */}
      {/* MODO 1: MAPA GENERAL DE MESAS EN TARJETAS GRANDES */}
      {/* ========================================================================= */}
      {posViewMode === 'tables' && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in">
          {/* Header y Métricas Rápidas del Salón */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-orange-500 font-bold">
                  Piso de Ventas & Salón
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {tables.filter(t => t.status === 'libre').length} Libres
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                  {tables.filter(t => t.status === 'en_preparacion').length} En Barra
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  {tables.filter(t => t.status === 'por_cobrar').length} Por Cobrar
                </span>
              </div>
              <h2 className={`text-2xl font-black mt-1 flex items-center gap-2.5 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                <UtensilsCrossed className="w-6 h-6 text-orange-500" />
                <span>Salón de Mesas & Barra</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Selecciona una mesa para tomar comanda, consultar consumos o gestionar el cobro inmediato.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  const newTableId = addTakeoutTable();
                  setActiveTableId(newTableId);
                  setPosViewMode('order');
                }}
                className="px-4 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs shadow-lg shadow-cyan-600/20 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Nuevo Pedido Para Llevar</span>
              </button>
            </div>
          </div>

          {/* Cuadrícula de Tarjetas Grandes de Mesas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
            {tables.map(tbl => {
              const inKitchen = tbl.status === 'en_preparacion';
              const toPay = tbl.status === 'por_cobrar';
              const isFree = tbl.status === 'libre';
              const isTaking = tbl.status === 'en_toma' || (!isFree && !inKitchen && !toPay);
              const isTakeout = tbl.tableId.startsWith('llevar');

              // Estilos y badges según estado
              let borderStyle = isLight ? 'border-slate-300 hover:border-emerald-500' : 'border-slate-800 hover:border-emerald-500';
              let badgeBg = isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
              let statusLabel = 'Libre';

              if (inKitchen) {
                borderStyle = 'border-cyan-500 ring-2 ring-cyan-500/20 shadow-cyan-500/10 shadow-lg';
                badgeBg = isLight ? 'bg-cyan-100 text-cyan-800 border-cyan-300' : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
                statusLabel = 'En Preparación';
              } else if (toPay) {
                borderStyle = 'border-purple-500 ring-2 ring-purple-500/20 shadow-purple-500/10 shadow-lg';
                badgeBg = isLight ? 'bg-purple-100 text-purple-800 border-purple-300' : 'bg-purple-500/20 text-purple-400 border-purple-500/30';
                statusLabel = 'Por Cobrar';
              } else if (isTaking) {
                borderStyle = 'border-amber-500 ring-2 ring-amber-500/20 shadow-amber-500/10 shadow-lg';
                badgeBg = isLight ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-amber-500/20 text-amber-400 border-amber-500/30';
                statusLabel = 'En Toma';
              }

              return (
                <div
                  key={tbl.tableId}
                  onClick={() => {
                    setActiveTableId(tbl.tableId);
                    setPosViewMode('order');
                  }}
                  className={`rounded-3xl border p-5 sm:p-6 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all cursor-pointer group relative ${
                    isLight ? 'bg-white' : 'bg-slate-900/95'
                  } ${borderStyle}`}
                >
                  {/* Cabecera de la Tarjeta */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-3.5 h-3.5 rounded-full ${
                          inKitchen ? 'bg-cyan-400 animate-pulse' : toPay ? 'bg-purple-400' : isFree ? 'bg-emerald-500' : 'bg-amber-400'
                        }`} />
                        <h3 className={`text-lg font-black group-hover:text-orange-500 transition-colors ${
                          isLight ? 'text-slate-900' : 'text-white'
                        }`}>
                          {tbl.tableName}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold border ${badgeBg}`}>
                          {statusLabel}
                        </span>
                        {isTakeout && tbl.tableId !== 'llevar' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeTakeoutTable(tbl.tableId);
                            }}
                            className="p-1 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                            title="Eliminar este pedido para llevar"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Subtítulo o nombre de cliente */}
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-3.5 flex items-center justify-between">
                      <span>{tbl.customerName ? `Cliente: ${tbl.customerName}` : isTakeout ? 'Para Llevar / Empaque' : 'Servicio en Salón'}</span>
                      {tbl.items.length > 0 && (
                        <span className="font-mono text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          {tbl.items.length} {tbl.items.length === 1 ? 'producto' : 'productos'}
                        </span>
                      )}
                    </div>

                    {/* Resumen de ítems si tiene comanda activa */}
                    {tbl.items.length > 0 ? (
                      <div className={`p-3 rounded-2xl border text-xs mb-3 space-y-1.5 ${
                        isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                      }`}>
                        {tbl.items.slice(0, 4).map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                            <span className="truncate pr-1">
                              <strong className="text-orange-500 font-mono">{item.quantity}x</strong> {item.name}
                            </span>
                            <span className="font-mono text-[11px] font-bold text-slate-500">
                              S/ {item.itemTotal.toFixed(2)}
                            </span>
                          </div>
                        ))}
                        {tbl.items.length > 4 && (
                          <div className="text-[10px] text-slate-500 font-bold italic pt-1 text-center">
                            + {tbl.items.length - 4} productos más...
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className={`p-4 rounded-2xl border border-dashed text-center text-xs text-slate-400 mb-3 ${
                        isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950/40 border-slate-800/70'
                      }`}>
                        <Coffee className="w-5 h-5 mx-auto mb-1.5 opacity-50 text-emerald-500" />
                        <span className="font-semibold text-slate-600 dark:text-slate-300">Mesa disponible para comanda</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">Toca para abrir y tomar pedido</p>
                      </div>
                    )}
                  </div>

                  {/* Pie de la Tarjeta con Total y Acción directa */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80">
                    {tbl.items.length > 0 ? (
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Acumulado:</span>
                          <span className={`text-2xl font-mono font-black ${
                            isLight ? 'text-emerald-700' : 'text-emerald-400'
                          }`}>
                            S/ {tbl.total.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-black text-orange-600 dark:text-orange-400 group-hover:translate-x-1 transition-transform">
                          <span>Modificar</span>
                          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400">Sin consumos</span>
                        <div className="flex items-center gap-1 text-xs font-black text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                          <span>Tomar Pedido</span>
                          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODO 2: TOMA DE PEDIDOS (CATÁLOGO + COMANDA LATERAL) */}
      {/* ========================================================================= */}
      {posViewMode === 'order' && (
        <div className="flex-1 flex flex-col h-full overflow-hidden min-h-0 animate-in fade-in">
          {/* Barra Superior de Navegación: Botón Regresar a Mesas + Estado de Mesa Activa */}
          <div className={'px-3 py-2 border-b flex items-center justify-between gap-2 ' + (isLight ? 'bg-white border-slate-300' : 'bg-slate-900/90 border-slate-800')}>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPosViewMode('tables')}
                className={`px-3.5 py-1.5 rounded-xl border font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 shadow-sm'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                }`}
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                <span>← Volver a Salón de Mesas</span>
              </button>

              <div className="flex items-center gap-2">
                <span className={`text-xs font-black px-3 py-1 rounded-xl border ${
                  isLight ? 'bg-orange-50 border-orange-200 text-orange-800' : 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                }`}>
                  Mesa: {activeTable.tableName}
                </span>
                <span className={`text-xs font-mono font-black ${
                  activeTable.total > 0 ? (isLight ? 'text-emerald-700' : 'text-emerald-400') : 'text-slate-400'
                }`}>
                  Total: S/ {activeTable.total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Badge de Estado en barra */}
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-mono uppercase px-2.5 py-1 rounded-xl font-bold border ${
                activeTable.status === 'en_preparacion'
                  ? (isLight ? 'bg-cyan-100 text-cyan-800 border-cyan-300' : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30')
                  : activeTable.status === 'por_cobrar'
                  ? (isLight ? 'bg-purple-100 text-purple-800 border-purple-300' : 'bg-purple-500/20 text-purple-400 border-purple-500/30')
                  : (isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30')
              }`}>
                {activeTable.status === 'en_preparacion' ? 'En Preparación' : activeTable.status === 'por_cobrar' ? 'Por Cobrar' : 'Libre'}
              </span>
            </div>
          </div>

          {/* Barra de pestañas móviles (Catálogo / Comanda) solo visible en pantallas < lg */}
          <div className="lg:hidden flex border-b bg-slate-900 border-slate-800">
            <button
              onClick={() => setMobileTab('menu')}
              className={`flex-1 py-2.5 text-center text-xs font-black transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                mobileTab === 'menu'
                  ? 'border-orange-500 text-orange-400 bg-orange-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🍽️ Carta / Menú</span>
            </button>
            <button
              onClick={() => setMobileTab('comanda')}
              className={`flex-1 py-2.5 text-center text-xs font-black transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                mobileTab === 'comanda'
                  ? 'border-orange-500 text-orange-400 bg-orange-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>📋 Comanda ({activeTable.items.length})</span>
              {activeTable.total > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                  S/{activeTable.total.toFixed(0)}
                </span>
              )}
            </button>
          </div>

          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        <div className={`flex-1 flex flex-col overflow-hidden min-h-0 border-r ${
          isLight ? 'border-slate-300' : 'border-slate-800'
        } ${mobileTab === 'comanda' ? 'hidden lg:flex' : 'flex'}`}>
          <div className={'p-3 border-b flex items-center justify-between gap-3 ' + (isLight ? 'bg-slate-200/70 border-slate-300' : 'bg-slate-900/60 border-slate-800')}>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {menuConfig.lines.map(line => {
                const isSelected = selectedLineId === line.id;
                const defaultActiveStyle = line.id === 'linea-fria'
                  ? 'bg-cyan-600 text-white shadow-cyan-600/30 ring-2 ring-cyan-400'
                  : line.id === 'linea-caliente'
                  ? 'bg-rose-600 text-white shadow-rose-600/30 ring-2 ring-rose-400'
                  : 'bg-orange-600 text-white shadow-orange-600/30 ring-2 ring-orange-400';

                return (
                  <button
                    key={line.id}
                    onClick={() => { setSelectedLineId(line.id); setSelectedCategoryId('all'); }}
                    className={'flex items-center gap-2 px-3.5 py-2 rounded-2xl font-black text-xs md:text-sm tracking-wide transition-all shadow shrink-0 ' +
                      (isSelected
                        ? (line.theme?.activeTabClass || defaultActiveStyle)
                        : isLight
                        ? 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700')}
                  >
                    <span>{line.name}</span>
                  </button>
                );
              })}
              {combos.filter(c => c.isActive).length > 0 && (
                <button
                  onClick={() => { setSelectedLineId('combos'); setSelectedCategoryId('all'); }}
                  className={'flex items-center gap-2 px-3.5 py-2 rounded-2xl font-black text-xs md:text-sm tracking-wide transition-all shadow shrink-0 ' +
                    (selectedLineId === 'combos' ? 'bg-amber-600 text-white shadow-amber-600/30 ring-2 ring-amber-400' : isLight ? 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300' : 'bg-slate-800 text-slate-300 hover:bg-slate-700')}
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>✨ Combos & Promos</span>
                </button>
              )}
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Despacho Lean: &lt; 3 min</span>
            </div>
          </div>

          {selectedLineId !== 'combos' && (
            <div className={'px-3 py-2 border-b flex items-center gap-2 overflow-x-auto no-scrollbar ' + (isLight ? 'bg-white border-slate-300' : 'bg-slate-950/40 border-slate-800')}>
              <button
                onClick={() => setSelectedCategoryId('all')}
                className={'px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ' +
                  (selectedCategoryId === 'all' ? 'bg-orange-600 text-white shadow-sm' : isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700')}
              >
                Todos los productos
              </button>
              {activeLine.categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={'px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ' +
                    (selectedCategoryId === cat.id ? 'bg-orange-600 text-white shadow-sm' : isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700')}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-2 sm:p-4">
            {selectedLineId === 'combos' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
                {combos.filter(c => c.isActive).length === 0 ? (
                  <div className="col-span-full text-center py-10 text-slate-500 text-xs">
                    No hay combos activos en este momento.
                  </div>
                ) : (
                  combos.filter(c => c.isActive).map(combo => {
                    const comboAlert = getComboStockAlert(combo);
                    return (
                    <button
                      key={combo.id}
                      type="button"
                      onClick={() => addComboToActiveTable(combo)}
                      className={`h-24 sm:h-28 rounded-2xl p-2.5 border transition-all text-left flex flex-col justify-between shadow-sm active:scale-95 select-none ${
                        comboAlert.isLow ? 'ring-2 ring-amber-400 border-amber-400 ' : ''
                      } ${
                        isLight
                          ? 'bg-amber-50 hover:bg-amber-100/70 border-amber-300 text-slate-900'
                          : 'bg-amber-950/30 hover:bg-amber-900/40 border-amber-500/40 text-amber-100'
                      }`}
                    >
                      <div className="flex-1 overflow-hidden w-full">
                        <span className="text-[9px] font-mono font-black uppercase text-amber-500 block truncate">
                          {combo.sku}
                        </span>
                        <h3 className="text-xs sm:text-sm font-black leading-tight line-clamp-2 mt-0.5">
                          {combo.shortName || combo.name}
                        </h3>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-amber-500/20 w-full">
                        <span className="font-mono text-xs sm:text-sm font-black text-amber-500">
                          S/ {combo.price.toFixed(2)}
                        </span>
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-xs font-black flex items-center justify-center">
                          +
                        </span>
                      </div>
                    </button>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
                {displayedProducts.map(product => {
                  const hasSlots = product.flavorSlots && product.flavorSlots.length > 0;
                  const hasModifiers = (product.quickModifiers && product.quickModifiers.length > 0) || hasSlots;
                  const stockAlert = getProductStockAlert(product);
                  const isDrink = selectedLineId === 'linea-fria';

                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => hasModifiers ? handleOpenModifiers(product) : addItemToActiveTable(product, [])}
                      className={`h-24 sm:h-28 rounded-2xl p-2.5 border transition-all text-left flex flex-col justify-between shadow-sm active:scale-95 select-none relative ${
                        stockAlert.isLow ? 'ring-2 ring-amber-400 border-amber-400 ' : ''
                      } ${
                        isLight
                          ? isDrink
                            ? 'bg-cyan-50/80 hover:bg-cyan-100/80 border-cyan-200 text-slate-900'
                            : 'bg-orange-50/80 hover:bg-orange-100/80 border-orange-200 text-slate-900'
                          : isDrink
                          ? 'bg-slate-900/90 hover:bg-slate-800 border-cyan-500/30 text-white'
                          : 'bg-slate-900/90 hover:bg-slate-800 border-orange-500/30 text-white'
                      }`}
                    >
                      <div className="flex-1 overflow-hidden w-full">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[9px] font-mono uppercase font-bold text-slate-400 truncate">
                            {product.sku}
                          </span>
                          {hasSlots ? (
                            <span className="text-[8px] font-bold px-1 rounded bg-cyan-500/20 text-cyan-500 flex items-center gap-0.5">
                              🍨 SABORES
                            </span>
                          ) : hasModifiers ? (
                            <span className="text-[8px] font-bold px-1 rounded bg-orange-500/20 text-orange-400">
                              OPC
                            </span>
                          ) : null}
                        </div>
                        <h3 className="text-xs sm:text-sm font-black leading-tight line-clamp-2 mt-1">
                          {product.shortName || product.name}
                        </h3>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800 w-full">
                        <span className="font-mono text-xs sm:text-sm font-black text-emerald-500">
                          S/ {product.price.toFixed(2)}
                        </span>
                        <div
                          onClick={(e) => handleFastAdd(product, e)}
                          className="w-5 h-5 rounded-full bg-orange-600 hover:bg-orange-500 text-white text-xs font-black flex items-center justify-center shadow"
                        >
                          +
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div className={`w-full lg:w-96 flex flex-col justify-between border-t lg:border-t-0 lg:border-l shadow-2xl h-full min-h-0 shrink-0 ${
          isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-800'
        } ${mobileTab === 'menu' ? 'hidden lg:flex' : 'flex'}`}>
          <div className={'p-3 border-b flex items-center justify-between ' + (isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950/60 border-slate-800')}>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse"></div>
              <div>
                <h2 className={'font-black text-sm flex items-center gap-2 ' + (isLight ? 'text-slate-900' : 'text-white')}>
                  <span>Comanda {activeTable.tableName}</span>
                  <span className={'text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ' + (isLight ? 'bg-slate-200 text-slate-800' : 'bg-slate-800 text-slate-300')}>
                    {activeTable.status.replace('_', ' ')}
                  </span>
                </h2>
                <span className="text-[10px] text-slate-500 font-semibold">
                  {activeTable.items.length} {activeTable.items.length === 1 ? 'producto' : 'productos'}
                </span>
              </div>
            </div>
            {activeTable.items.length > 0 && (
              <button onClick={clearActiveTable} className="text-xs text-rose-500 hover:text-rose-600 p-1 flex items-center gap-1 font-bold">
                <Trash2 className="w-3.5 h-3.5" /> Vaciar
              </button>
            )}
          </div>

          <div className={'px-3 py-2 border-b flex items-center justify-between ' + (isLight ? 'bg-slate-50/70 border-slate-300' : 'bg-slate-950/40 border-slate-800')}>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-purple-500" />
              <div>
                <span className={'text-xs font-bold ' + (isLight ? 'text-slate-900' : 'text-white')}>Descartables Pedido</span>
                <p className="text-[10px] text-slate-500">Vasos y cajas de receta</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowManualDisposablesModal(true)}
                className="px-2 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 text-purple-700 dark:text-purple-300 text-[11px] font-bold border border-purple-500/30"
              >
                + Táper/Bolsa
              </button>
              <button
                onClick={handleToggleDisposables}
                className={'w-11 h-6 rounded-full p-1 transition-all flex items-center ' + (activeTable.enableDisposables ? 'bg-purple-600 justify-end' : 'bg-slate-400 dark:bg-slate-700 justify-start')}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
              </button>
            </div>
          </div>

          <div className={'px-3 py-2 border-b flex items-center gap-2 ' + (isLight ? 'bg-white border-slate-300' : 'bg-slate-950/20 border-slate-800/60')}>
            <User className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cliente / Nota de mesa..."
              value={activeTable.customerName || ''}
              onChange={e => updateTableItems(activeTable.tableId, activeTable.items, activeTable.enableDisposables, e.target.value, activeTable.manualDisposables)}
              className={'w-full bg-transparent text-xs placeholder-slate-400 focus:outline-none font-semibold ' + (isLight ? 'text-slate-900' : 'text-white')}
            />
          </div>

          <div className={'flex-1 overflow-y-auto p-2 space-y-1.5 divide-y ' + (isLight ? 'divide-slate-200' : 'divide-slate-800/40')}>
            {activeTable.items.length === 0 && (activeTable.manualDisposables || []).length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                <Coffee className="w-10 h-10 text-slate-400 mb-2" />
                <p className={'text-sm font-bold ' + (isLight ? 'text-slate-700' : 'text-slate-400')}>Mesa libre</p>
                <p className="text-xs text-slate-500 mt-1">Toca productos del menú para tomar pedido.</p>
              </div>
            ) : (
              <>
                {activeTable.items.map(item => {
                  const missingIngBom = item.recipeBom?.find(b => {
                    const ing = ingredients.find(i => i.id === b.ingredientId);
                    return ing && (ing.stock < (b.quantity * item.quantity) || ing.stock <= 0);
                  });
                  const missingIng = missingIngBom ? ingredients.find(i => i.id === missingIngBom.ingredientId) : null;

                  return (
                  <div key={item.id} className="pt-2 flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-baseline justify-between">
                        <span className={'font-black text-xs flex items-center gap-1.5 ' + (isLight ? 'text-slate-900' : 'text-slate-100')}>
                          <span>{item.name}</span>
                          {item.isCombo && (
                            <span className="text-[9px] bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded font-bold">
                              COMBO
                            </span>
                          )}
                        </span>
                        <span className={'text-xs font-black ' + (isLight ? 'text-emerald-700' : 'text-amber-300')}>S/ {item.itemTotal.toFixed(2)}</span>
                      </div>
                      {item.isCombo && item.comboItems && (
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {item.comboItems.map(ci => `${ci.quantity}x ${ci.name}`).join(' + ')}
                        </div>
                      )}
                      {item.selectedSlots && item.selectedSlots.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="text-[10px] bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 px-2 py-0.5 rounded-lg border border-cyan-500/30 font-bold flex items-center gap-1">
                            <span>🍨</span>
                            <span>Bolas: {item.selectedSlots.map(s => s.ingredientName).join(' + ')}</span>
                          </span>
                        </div>
                      )}
                      {item.selectedServing && (
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5 flex items-center gap-1">
                          <span>📦</span>
                          <span>Servir: {item.selectedServing.name}</span>
                        </div>
                      )}
                      {item.selectedModifiers.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.selectedModifiers.map(mod => (
                            <span key={mod.id} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.2 rounded border border-slate-300 dark:border-slate-700 font-medium">
                              {mod.label} {mod.priceDelta > 0 && ('(+S/' + mod.priceDelta + ')')}
                            </span>
                          ))}
                        </div>
                      )}

                      {missingIng && (
                        <div className="flex items-center gap-1.5 text-[10px] text-amber-700 dark:text-amber-400 font-bold bg-amber-500/15 px-2 py-1 rounded-lg border border-amber-500/30 mt-1.5">
                          <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0" />
                          <span>Kárdex: {missingIng.name} ({missingIng.stock} {missingIng.unit}) — Verificar con barra</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-1.5">
                        <div className={'flex items-center rounded-lg p-0.5 border ' + (isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-800 border-slate-700')}>
                          <button onClick={() => updateItemQuantity(item.id, -1)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold"><Minus className="w-3 h-3" /></button>
                          <span className={'px-2 text-xs font-black min-w-[20px] text-center ' + (isLight ? 'text-slate-900' : 'text-white')}>{item.quantity}</span>
                          <button onClick={() => updateItemQuantity(item.id, 1)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold"><Plus className="w-3 h-3" /></button>
                        </div>
                        <button onClick={() => removeItemFromTable(item.id)} className="text-[10px] text-slate-400 hover:text-rose-500 p-1 font-semibold">Quitar</button>
                      </div>
                    </div>
                  </div>
                );
              })}

                {activeTable.enableDisposables && activeTable.items.length > 0 && (
                  <div className="pt-2 flex items-center justify-between text-xs bg-cyan-50 dark:bg-cyan-950/20 p-2 rounded-xl border border-cyan-200 dark:border-cyan-900/40">
                    <div>
                      <span className="font-bold text-cyan-700 dark:text-cyan-300 flex items-center gap-1">
                        <Package className="w-3.5 h-3.5" />
                        Descartables Pedido
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {autoDisposablesCost > 1.50
                          ? `Costo real: S/ ${autoDisposablesCost.toFixed(2)} (> S/ 1.50)`
                          : `Tarifa estándar (costo real S/ ${autoDisposablesCost.toFixed(2)})`}
                      </span>
                    </div>
                    <span className="font-mono font-black text-cyan-600">
                      +S/ {autoDisposablesCharge.toFixed(2)}
                    </span>
                  </div>
                )}

                {(activeTable.manualDisposables || []).map(manual => (
                  <div key={manual.ingredientId} className="pt-2 flex items-center justify-between text-xs bg-purple-50 dark:bg-purple-950/20 p-2 rounded-xl border border-purple-200 dark:border-purple-900/40">
                    <div>
                      <span className="font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1"><Package className="w-3.5 h-3.5" />{manual.quantity}x {manual.name}</span>
                      <span className="text-[10px] text-slate-500">{manual.unitPrice > 0 ? ('S/ ' + manual.unitPrice.toFixed(2) + ' c/u') : 'Cortesía (S/ 0.00)'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-purple-600">S/ {(manual.quantity * manual.unitPrice).toFixed(2)}</span>
                      <button onClick={() => removeManualDisposableFromTable(activeTable.tableId, manual.ingredientId)} className="text-rose-500 hover:text-rose-600 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          <div className={'p-3 border-t space-y-2 shrink-0 ' + (isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-950/80 border-slate-800')}>
            <div className="flex items-baseline justify-between px-1">
              <span className={'text-sm font-black ' + (isLight ? 'text-slate-700' : 'text-slate-300')}>TOTAL MESA</span>
              <span className={'text-2xl font-black ' + (isLight ? 'text-emerald-700' : 'text-emerald-400')}>S/ {activeTable.total.toFixed(2)}</span>
            </div>

            <button
              disabled={!canSendToKitchen}
              onClick={handleSendToKitchen}
              className={`w-full py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all ${
                canSendToKitchen
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/30 cursor-pointer active:scale-95'
                  : 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-400 opacity-60 cursor-not-allowed shadow-none'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>
                {activeTable.status === 'en_preparacion'
                  ? unsentItemsCount > 0
                    ? `ENVIAR ${unsentItemsCount} NUEVOS ÍTEMS A BARRA`
                    : 'EN PREPARACIÓN EN BARRA (<3 MIN)'
                  : activeTable.items.length === 0
                  ? 'SIN ÍTEMS EN COMANDA'
                  : unsentItemsCount > 0
                  ? 'ENVIAR COMANDA A BARRA'
                  : 'ENVIADO A BARRA'}
              </span>
            </button>

            {/* Botón rápido para mozo al momento de cobrar */}
            <button
              type="button"
              onClick={() => {
                setSelectedManualIngId(disposableOptions[0]?.id || '');
                setManualQty(1);
                setManualPrice(0.00);
                setShowManualDisposablesModal(true);
              }}
              className="w-full py-1.5 px-3 rounded-xl border border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Package className="w-3.5 h-3.5" />
              <span>+ Añadir Táper/Bolsa Libre al Cobrar</span>
            </button>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                disabled={activeTable.items.length === 0 && (activeTable.manualDisposables || []).length === 0}
                onClick={() => handleCheckoutTable('yape_plin')}
                className="flex flex-col items-center justify-center py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-extrabold text-xs gap-1 shadow transition-all active:scale-95"
              >
                <QrCode className="w-4 h-4" />
                <span>YAPE / PLIN</span>
              </button>
              <button
                disabled={activeTable.items.length === 0 && (activeTable.manualDisposables || []).length === 0}
                onClick={() => handleCheckoutTable('efectivo')}
                className="flex flex-col items-center justify-center py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-extrabold text-xs gap-1 shadow transition-all active:scale-95"
              >
                <Banknote className="w-4 h-4" />
                <span>EFECTIVO</span>
              </button>
              <button
                disabled={activeTable.items.length === 0 && (activeTable.manualDisposables || []).length === 0}
                onClick={() => handleCheckoutTable('tarjeta')}
                className="flex flex-col items-center justify-center py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-extrabold text-xs gap-1 shadow transition-all active:scale-95"
              >
                <CreditCard className="w-4 h-4" />
                <span>TARJETA</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )}

      {/* Botón flotante de acceso a Comanda en Móviles cuando se está explorando el Menú */}
      {posViewMode === 'order' && mobileTab === 'menu' && activeTable.items.length > 0 && (
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
          <button
            onClick={() => setMobileTab('comanda')}
            className="w-full py-3.5 px-5 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-black text-sm shadow-2xl shadow-orange-600/50 flex items-center justify-between active:scale-95 transition-all border border-orange-400/40"
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-white text-orange-600 text-xs flex items-center justify-center font-bold">
                {activeTable.items.length}
              </span>
              <span>Ver Comanda {activeTable.tableName}</span>
            </div>
            <span className="font-mono text-base font-extrabold">
              S/ {activeTable.total.toFixed(2)} →
            </span>
          </button>
        </div>
      )}

      {activeProductForModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className={'border rounded-3xl p-5 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 flex flex-col justify-between ' + (isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-white')}>
            <div>
              {/* Header del Modal */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-orange-500 uppercase font-black">
                      {activeProductForModal.flavorSlots?.length ? '✨ Personalizar Receta / Opciones' : 'Personalizar Receta'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">({activeProductForModal.sku})</span>
                  </div>
                  <h3 className="text-xl font-black mt-0.5">{activeProductForModal.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm">
                      Precio Base: S/ {activeProductForModal.price.toFixed(2)}
                    </span>
                    {activeProductForModal.flavorSlots && activeProductForModal.flavorSlots.length > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-500 font-bold">
                        {activeProductForModal.flavorSlots.length} {activeProductForModal.flavorSlots.length === 1 ? 'opción requerida' : 'opciones requeridas'}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveProductForModal(null);
                    setVariantPickingMod(null);
                  }}
                  className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>

              {/* 1. SELECCIÓN DE OPCIONES Y VARIANTES DINÁMICAS (PANES, HELADOS, LECHES, ETC.) */}
              {activeProductForModal.flavorSlots && activeProductForModal.flavorSlots.length > 0 && (
                <div className="mb-5 space-y-4 bg-cyan-500/5 p-4 rounded-2xl border border-cyan-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
                      <span>✨</span>
                      <span>1. Opciones & Variantes a Elección (Obligatorio)</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {activeProductForModal.flavorSlots.length} {activeProductForModal.flavorSlots.length === 1 ? 'opción requerida' : 'opciones requeridas'}
                    </span>
                  </div>

                  <div className="space-y-3.5">
                    {activeProductForModal.flavorSlots.map(slot => {
                      const selectedIngId = tempSlotSelections[slot.slotIndex];
                      const selectedInfo = selectedIngId ? getFlavorInfo(selectedIngId, slot.quantity) : null;

                      // Obtener los insumos permitidos: de allowedIngredientIds o de su categoría vinculada
                      let allowedIds: string[] = [];
                      if (slot.allowedIngredientIds && slot.allowedIngredientIds.length > 0) {
                        allowedIds = slot.allowedIngredientIds;
                      } else if (slot.category && slot.category !== 'todas') {
                        allowedIds = ingredients.filter(i => i.category === slot.category).map(i => i.id);
                      } else {
                        allowedIds = ingredients.map(i => i.id);
                      }

                      return (
                        <div key={slot.slotIndex} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-500 text-[10px] flex items-center justify-center font-bold">
                                {slot.slotIndex + 1}
                              </span>
                              <span>{slot.label}:</span>
                              <span className="text-[10px] font-normal text-slate-400 font-mono">
                                ({slot.quantity} {slot.unit})
                              </span>
                            </span>
                            <span className="text-cyan-600 dark:text-cyan-400 font-black flex items-center gap-1">
                              {selectedInfo ? `${selectedInfo.emoji} ${selectedInfo.name} ✓` : 'Toca una opción'}
                            </span>
                          </div>

                          {/* Chips de Opciones para este Slot */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                            {allowedIds.map(ingId => {
                              const info = getFlavorInfo(ingId, slot.quantity);
                              const isSlotSelected = selectedIngId === ingId;

                              return (
                                <button
                                  key={ingId}
                                  type="button"
                                  disabled={!info.isAvailable}
                                  onClick={() => {
                                    setTempSlotSelections(prev => ({
                                      ...prev,
                                      [slot.slotIndex]: ingId
                                    }));
                                  }}
                                  className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                                    !info.isAvailable
                                      ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800'
                                      : isSlotSelected
                                      ? 'bg-cyan-500 text-slate-950 font-black border-cyan-400 shadow-md ring-2 ring-cyan-400'
                                      : isLight
                                      ? 'bg-white hover:bg-cyan-50 border-slate-300 text-slate-800'
                                      : 'bg-slate-800/90 hover:bg-slate-700 border-slate-700 text-slate-200'
                                  }`}
                                >
                                  <span className="text-base leading-none">{info.emoji}</span>
                                  <span className="text-[11px] font-bold truncate max-w-full">{info.name}</span>
                                  <span className={`text-[9px] font-mono ${isSlotSelected ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                                    {info.isAvailable ? `Stock: ${info.stock.toFixed(info.unit === 'und' ? 0 : 1)} ${info.unit}` : 'Agotado'}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. OPCIÓN DE SERVIR / PRESENTACIÓN */}
              {activeProductForModal.servingOptions && activeProductForModal.servingOptions.length > 0 && (
                <div className="mb-5 space-y-2">
                  <span className="text-xs font-black uppercase text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <span>📦</span>
                    <span>2. Presentación / Servido</span>
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    {activeProductForModal.servingOptions.map(srv => {
                      const isSelected = tempServingSelection === srv.id;
                      return (
                        <button
                          key={srv.id}
                          type="button"
                          onClick={() => setTempServingSelection(srv.id)}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                            isSelected
                              ? 'bg-orange-600 text-white border-orange-500 shadow-md ring-2 ring-orange-400'
                              : isLight
                              ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700'
                              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                          }`}
                        >
                          <span>{srv.name.includes('Cono') ? '🍦' : '🍨'}</span>
                          <span>{srv.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. MODIFICADORES & TOPPINGS ADICIONALES */}
              {activeProductForModal.quickModifiers.length > 0 && (
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <span>✨</span>
                      <span>3. Toppings & Adicionales (Opcional)</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Toppings con costo extra</span>
                  </div>

                  {/* Sub-selector flotante si se pulsó un topping polimórfico con variantes (ej. + Bola de Helado) */}
                  {variantPickingMod && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/40 rounded-2xl mb-3 space-y-2 animate-in fade-in">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-500 flex items-center gap-1">
                          <span>✨</span>
                          <span>¿Qué variedad / opción deseas para "{variantPickingMod.label}"?</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setVariantPickingMod(null)}
                          className="text-[10px] text-slate-400 hover:text-white"
                        >
                          Cancelar
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto no-scrollbar">
                        {(variantPickingMod.allowedIngredientIds && variantPickingMod.allowedIngredientIds.length > 0
                          ? variantPickingMod.allowedIngredientIds
                          : ingredients.filter(i => i.category === 'helados').map(i => i.id)
                        ).map(ingId => {
                          const info = getFlavorInfo(ingId);
                          return (
                            <button
                              key={ingId}
                              type="button"
                              disabled={!info.isAvailable}
                              onClick={() => handleSelectModifierVariant(variantPickingMod, ingId)}
                              className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                                !info.isAvailable
                                  ? 'opacity-40 cursor-not-allowed bg-slate-800 border-slate-700'
                                  : 'bg-slate-900 hover:bg-amber-500 hover:text-slate-950 border-amber-500/30 text-slate-200'
                              }`}
                            >
                              <span className="text-base">{info.emoji}</span>
                              <span className="text-[11px] font-bold truncate max-w-full">{info.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeProductForModal.quickModifiers.map(mod => {
                      const isSelected = tempModifiers.some(m => m.id === mod.id);
                      const selectedVariant = tempModifiers.find(m => m.id === mod.id);

                      // Buscar topping maestro asociado para validar stock
                      const masterTop = mod.toppingMasterId
                        ? toppingsMaster.find(t => t.id === mod.toppingMasterId)
                        : toppingsMaster.find(t => t.name.toLowerCase() === mod.label.toLowerCase());

                      const hasVariants = Boolean(mod.hasVariants || masterTop?.hasVariants);
                      const targetIngId = selectedVariant?.selectedVariantIngredientId || masterTop?.ingredientId;
                      const linkedIng = targetIngId ? ingredients.find(i => i.id === targetIngId) : null;
                      const isLowStock = linkedIng && (linkedIng.stock <= 0 || linkedIng.stock < (masterTop?.portionQuantity || 0.001));

                      return (
                        <button
                          key={mod.id}
                          type="button"
                          onClick={() => toggleModalModifier(mod)}
                          className={'p-3 rounded-xl border text-left flex items-center justify-between transition-all ' +
                            (isSelected ? 'bg-orange-500/20 border-orange-500 text-orange-600 dark:text-orange-200 shadow-md ring-1 ring-orange-500' : isLight ? 'bg-slate-50 border-slate-300 text-slate-700 hover:border-slate-400' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-500')}
                        >
                          <div className="flex-1 pr-2">
                            <div className="text-xs font-bold flex items-center gap-1">
                              <span>{selectedVariant?.label || mod.label}</span>
                              {hasVariants && !selectedVariant && (
                                <span className="text-[9px] bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-1 rounded font-mono">🍨 [Elige sabor]</span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-emerald-600 font-semibold">{mod.priceDelta > 0 ? ('+S/ ' + mod.priceDelta.toFixed(2)) : 'Sin recargo'}</div>
                            {isLowStock && (
                              <div className="mt-1 inline-flex items-center gap-1 text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                <AlertTriangle className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                                <span>Kárdex: {linkedIng?.stock.toFixed(2)} {linkedIng?.unit}</span>
                              </div>
                            )}
                          </div>
                          <div className={'w-5 h-5 rounded-md border flex items-center justify-center text-xs font-bold shrink-0 ' + (isSelected ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-400')}>
                            {isSelected ? '✓' : ''}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer del Modal con Total Calculado y Botones */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-2">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold text-slate-400">Total a Pagar Ítem:</span>
                <span className="text-xl font-mono font-black text-emerald-600 dark:text-emerald-400">
                  S/ {(
                    activeProductForModal.price +
                    tempModifiers.reduce((acc, m) => acc + m.priceDelta, 0)
                  ).toFixed(2)}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveProductForModal(null);
                    setVariantPickingMod(null);
                  }}
                  className="flex-1 py-3 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmModalAdd}
                  className="flex-1 py-3 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs shadow-lg shadow-orange-600/30 active:scale-95 transition-all"
                >
                  Añadir al Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showManualDisposablesModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={'border rounded-3xl p-5 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 ' + (isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-white')}>
            <div className="flex items-start justify-between pb-3 border-b border-slate-300 dark:border-slate-800 mb-3">
              <div>
                <span className="text-xs font-mono uppercase font-bold text-purple-500">Descartable Libre</span>
                <h3 className="text-base font-black">Añadir Táper / Bolsa / Extra</h3>
              </div>
              <button onClick={() => setShowManualDisposablesModal(false)} className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center font-bold">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400">Tipo de Empaque</label>
                <select
                  value={selectedManualIngId || (disposableOptions[0]?.id || '')}
                  onChange={e => setSelectedManualIngId(e.target.value)}
                  className={'w-full mt-1 px-3 py-2 rounded-xl text-xs font-bold border ' + (isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-white')}
                >
                  {disposableOptions.map(disp => (
                    <option key={disp.id} value={disp.id}>{disp.name} (Stock: {disp.stock} und)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400">Cantidad (Unidades)</label>
                <div className="flex items-center gap-2 mt-1">
                  <button type="button" onClick={() => setManualQty(prev => Math.max(1, prev - 1))} className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-black text-sm">-</button>
                  <span className="flex-1 text-center font-mono font-black text-base">{manualQty}</span>
                  <button type="button" onClick={() => setManualQty(prev => prev + 1)} className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-black text-sm">+</button>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400">Precio a Cobrar al Cliente (S/ PEN)</label>
                <input
                  type="number"
                  step="0.10"
                  value={manualPrice}
                  onChange={e => setManualPrice(parseFloat(e.target.value) || 0)}
                  placeholder="0.00 Cortesía"
                  className={'w-full mt-1 px-3 py-2 rounded-xl text-xs font-bold font-mono border ' + (isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-white')}
                />
                <span className="text-[10px] text-slate-500">Dejar en 0.00 si se entrega como cortesía</span>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button type="button" onClick={() => setShowManualDisposablesModal(false)} className="flex-1 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs">Cancelar</button>
              <button type="button" onClick={handleAddManualDisposable} className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow">Añadir Descartable</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};