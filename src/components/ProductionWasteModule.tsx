import React, { useState, useMemo } from 'react';
import {
  Layers,
  Trash2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Search,
  Eye,
  X,
  Factory,
  ChevronRight,
  BarChart3,
  AlertTriangle,
  RefreshCw,
  FileText,
  Calendar,
  Warehouse,
  User,
  Hash
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import type {
  ProductionOrder,
  ProductionOrderItem,
  ProductionOrderIngredient,
  MeasurementUnit,
  Product,
  BomItem
} from '../types';

interface RecipeOption {
  id: string;
  code: string;
  name: string;
  unit: MeasurementUnit;
  recipeBom: BomItem[];
  targetIngredientId?: string;
  isSubrecipe: boolean;
}

interface FormRecipeItem {
  recipeId: string;
  recipeCode: string;
  recipeName: string;
  unit: MeasurementUnit;
  estimatedQuantity: number;
  resultQuantity: number;
  bom: BomItem[];
  targetIngredientId?: string;
}

export const ProductionWasteModule: React.FC = () => {
  const {
    ingredients,
    menuConfig,
    wastes,
    addWaste,
    productionOrders,
    addProductionOrder,
    themeMode
  } = useApp();

  const isLight = themeMode === 'light';
  const [activeSubTab, setActiveSubTab] = useState<'prepare' | 'history' | 'wastes'>('prepare');

  // =========================================================================
  // 1. PREPARAR RECETAS (NUEVA ORDEN DE PRODUCCIÓN)
  // =========================================================================
  const [opWarehouse, setOpWarehouse] = useState<string>('Barra Central / Zumos');
  const [opDate, setOpDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [opResponsible, setOpResponsible] = useState<string>('Operario Barra / Bruno');
  const [opNotes, setOpNotes] = useState<string>('');
  const [recipeSearch, setRecipeSearch] = useState<string>('');
  const [viewingOpDetail, setViewingOpDetail] = useState<ProductionOrder | null>(null);
  const [opDetailTab, setOpDetailTab] = useState<'byRecipe' | 'byCategory'>('byRecipe');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const [ingredientWasteInput, setIngredientWasteInput] = useState<Record<string, number>>({});
  const [ingredientRealInput, setIngredientRealInput] = useState<Record<string, number>>({});
  const [viewingRecipeDetail, setViewingRecipeDetail] = useState<FormRecipeItem | null>(null);

  const showNotice = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // Recopilar catálogo de todas las recetas y subrecetas disponibles para producción
  const availableRecipes: RecipeOption[] = useMemo(() => {
    const list: RecipeOption[] = [];

    // 1. Subrecetas del menú (SUB-xxx)
    menuConfig.lines.forEach(line => {
      line.categories.forEach(cat => {
        cat.products.forEach(p => {
          if (p.recipeType === 'base' || p.sku.startsWith('SUB-')) {
            const matchingIng = ingredients.find(
              i => i.code === p.sku || i.id === `ing-${p.id.replace('prod-', '').replace('rec-', '')}`
            );
            list.push({
              id: p.id,
              code: p.sku,
              name: p.name,
              unit: (p.yieldUnit as MeasurementUnit) || 'kg',
              recipeBom: p.recipeBom,
              targetIngredientId: matchingIng?.id,
              isSubrecipe: true
            });
          }
        });
      });
    });

    // 2. Subrecetas registradas en inventario de insumos (ej. pulpas de rescate)
    ingredients
      .filter(i => i.itemType === 'subreceta')
      .forEach(sub => {
        if (!list.some(r => r.code === sub.code || r.targetIngredientId === sub.id)) {
          // Asociar un BOM estándar según la fruta y subreceta
          let bom: BomItem[] = [];
          if (sub.code === 'SUB-010') {
            // Pack Mix Surtido Fresco (270g) por pack individual (con merma técnica de pelado)
            bom = [
              { ingredientId: 'ing-papaya', quantity: 0.140, unit: 'kg' },
              { ingredientId: 'ing-pina', quantity: 0.130, unit: 'kg' },
              { ingredientId: 'ing-platano', quantity: 0.075, unit: 'kg' },
              { ingredientId: 'ing-fresa', quantity: 0.045, unit: 'kg' }
            ];
          } else if (sub.code === 'SUB-011') {
            // Pack Mango Limpio Porcionado (180g)
            bom = [{ ingredientId: 'ing-mango', quantity: 0.260, unit: 'kg' }];
          } else if (sub.code === 'SUB-012') {
            // Pack Fresa Limpia Porcionada (150g)
            bom = [{ ingredientId: 'ing-fresa', quantity: 0.165, unit: 'kg' }];
          } else if (sub.code === 'SUB-013') {
            // Pack Papaya Limpia Porcionada (200g)
            bom = [{ ingredientId: 'ing-papaya', quantity: 0.285, unit: 'kg' }];
          } else if (sub.code === 'SUB-014') {
            // Pack Piña Limpia Porcionada (180g)
            bom = [{ ingredientId: 'ing-pina', quantity: 0.300, unit: 'kg' }];
          } else if (sub.code === 'SUB-005') {
            bom = [{ ingredientId: 'ing-papaya', quantity: 0.950, unit: 'kg' }, { ingredientId: 'ing-azucar', quantity: 0.050, unit: 'kg' }];
          } else if (sub.code === 'SUB-006') {
            bom = [{ ingredientId: 'ing-fresa', quantity: 0.950, unit: 'kg' }, { ingredientId: 'ing-azucar', quantity: 0.050, unit: 'kg' }];
          } else if (sub.code === 'SUB-007') {
            bom = [{ ingredientId: 'ing-pina', quantity: 0.950, unit: 'kg' }, { ingredientId: 'ing-azucar', quantity: 0.050, unit: 'kg' }];
          } else if (sub.code === 'SUB-008') {
            bom = [{ ingredientId: 'ing-mango', quantity: 0.950, unit: 'kg' }, { ingredientId: 'ing-azucar', quantity: 0.050, unit: 'kg' }];
          } else if (sub.code === 'SUB-001') {
            bom = [
              { ingredientId: 'ing-papaya', quantity: 0.450, unit: 'kg' },
              { ingredientId: 'ing-pina', quantity: 0.350, unit: 'kg' },
              { ingredientId: 'ing-fresa', quantity: 0.150, unit: 'kg' },
              { ingredientId: 'ing-azucar', quantity: 0.050, unit: 'kg' }
            ];
          } else if (sub.code === 'SUB-020') {
            // Base Neutra para Frappés Lácteos (por cada 1 kg producido)
            bom = [
              { ingredientId: 'ing-crema-no-lactea', quantity: 0.298, unit: 'kg' },
              { ingredientId: 'ing-leche-polvo', quantity: 0.358, unit: 'kg' },
              { ingredientId: 'ing-azucar-glass', quantity: 0.298, unit: 'kg' },
              { ingredientId: 'ing-cmc', quantity: 0.046, unit: 'kg' }
            ];
          } else if (sub.code === 'SUB-021') {
            // Base Cristal para Frappés al Agua (por cada 1 kg producido)
            bom = [
              { ingredientId: 'ing-azucar', quantity: 0.978, unit: 'kg' },
              { ingredientId: 'ing-cmc', quantity: 0.022, unit: 'kg' }
            ];
          } else {
            bom = [{ ingredientId: 'ing-papaya', quantity: 1.0, unit: 'kg' }];
          }

          list.push({
            id: `rec-${sub.id}`,
            code: sub.code,
            name: sub.name,
            unit: sub.unit,
            recipeBom: bom,
            targetIngredientId: sub.id,
            isSubrecipe: true
          });
        }
      });

    return list;
  }, [menuConfig, ingredients]);

  // Recetas seleccionadas en la orden de preparación actual (comienza en blanco según solicitud del usuario)
  const [selectedRecipes, setSelectedRecipes] = useState<FormRecipeItem[]>([]);

  // Número de orden autogenerado
  const nextOrderNumber = useMemo(() => {
    return `OP-${3635 + productionOrders.length}`;
  }, [productionOrders.length]);

  // Lote autogenerado
  const nextBatchNumber = useMemo(() => {
    const dateClean = opDate.replace(/-/g, '');
    const firstCode = selectedRecipes[0]?.recipeCode || 'BATCH';
    return `LOTE-${firstCode}-${dateClean}`;
  }, [opDate, selectedRecipes]);

  // Añadir receta a la tabla de preparación
  const handleAddRecipeToForm = (recipe: RecipeOption) => {
    if (selectedRecipes.some(r => r.recipeId === recipe.id)) {
      showNotice(`La receta "${recipe.name}" ya está en la lista.`);
      return;
    }
    const isUnit = recipe.unit === 'und';
    const defaultQty = recipe.code === 'SUB-020'
      ? 0.670
      : recipe.code === 'SUB-021'
      ? 0.920
      : isUnit
      ? 10
      : 5.0;

    setSelectedRecipes(prev => [
      ...prev,
      {
        recipeId: recipe.id,
        recipeCode: recipe.code,
        recipeName: recipe.name,
        unit: recipe.unit,
        estimatedQuantity: defaultQty,
        resultQuantity: defaultQty,
        bom: recipe.recipeBom,
        targetIngredientId: recipe.targetIngredientId
      }
    ]);
    setRecipeSearch('');
  };

  const handleUpdateRecipeQuantities = (
    index: number,
    field: 'estimatedQuantity' | 'resultQuantity',
    value: number
  ) => {
    setSelectedRecipes(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleRemoveRecipeFromForm = (index: number) => {
    setSelectedRecipes(prev => prev.filter((_, i) => i !== index));
  };

  // Explosión BOM de Insumos requeridos calculados en tiempo real
  const explodedRequiredIngredients = useMemo(() => {
    const map = new Map<string, {
      ingredient: typeof ingredients[0];
      quantityRequired: number;
      unit: MeasurementUnit;
    }>();

    selectedRecipes.forEach(rec => {
      rec.bom.forEach(bomItem => {
        const ing = ingredients.find(i => i.id === bomItem.ingredientId);
        if (!ing) return;

        const needed = bomItem.quantity * rec.estimatedQuantity;

        if (map.has(ing.id)) {
          const curr = map.get(ing.id)!;
          curr.quantityRequired += needed;
        } else {
          map.set(ing.id, {
            ingredient: ing,
            quantityRequired: needed,
            unit: bomItem.unit
          });
        }
      });
    });

    const result: ProductionOrderIngredient[] = [];
    map.forEach(entry => {
      const ing = entry.ingredient;
      const reqQty = Number(entry.quantityRequired.toFixed(3));
      // Cantidad real retirada del almacén (editable por el operario, por defecto igual al requerimiento teórico)
      const realQty = ingredientRealInput[ing.id] !== undefined
        ? ingredientRealInput[ing.id]
        : reqQty;
      // Merma real reportada durante el proceso de preparación (opcional, 0 por defecto)
      const wasteQty = ingredientWasteInput[ing.id] || 0;
      // % Merma real calculado en base a lo retirado: (Merma / Cant. Real) * 100
      const wastePercent = realQty > 0 ? Number(((wasteQty / realQty) * 100).toFixed(2)) : 0;
      // La cantidad a descontar del almacén es EXACTAMENTE la cantidad real retirada
      const totalToDeduct = Number(realQty.toFixed(3));
      const totalCost = Number((totalToDeduct * ing.costPerUnit).toFixed(2));

      result.push({
        ingredientId: ing.id,
        ingredientName: ing.name,
        ingredientCode: ing.code || 'INS-00',
        category: ing.category || 'general',
        quantityRequired: reqQty,
        quantityReal: realQty,
        unit: entry.unit,
        wastePercent,
        wasteQuantity: Number(wasteQty.toFixed(3)),
        unitCost: ing.costPerUnit,
        totalCost: totalCost,
        currentStock: ing.stock
      });
    });

    return result;
  }, [selectedRecipes, ingredients, ingredientWasteInput, ingredientRealInput]);

  const totalExplodedCost = useMemo(() => {
    return explodedRequiredIngredients.reduce((acc, curr) => acc + curr.totalCost, 0);
  }, [explodedRequiredIngredients]);

  // Finalizar y Registrar Orden de Producción
  const handleFinalizeProduction = () => {
    if (selectedRecipes.length === 0) {
      alert('Por favor agrega al menos una receta a la orden de producción.');
      return;
    }

    const invalidItem = selectedRecipes.find(r => r.estimatedQuantity <= 0 || r.resultQuantity <= 0);
    if (invalidItem) {
      alert(`La receta ${invalidItem.recipeName} tiene una cantidad estimada o resultante inválida.`);
      return;
    }

    // Construir ProductionOrder
    const finalItems: ProductionOrderItem[] = selectedRecipes.map(rec => {
      const wasteQty = Math.max(0, rec.estimatedQuantity - rec.resultQuantity);
      const wastePct = rec.estimatedQuantity > 0 ? (wasteQty / rec.estimatedQuantity) * 100 : 0;
      // Costo proporcional de insumos asignado a esta receta
      const portionCost = totalExplodedCost / selectedRecipes.length;
      const unitCost = rec.resultQuantity > 0 ? portionCost / rec.resultQuantity : 0;

      return {
        recipeId: rec.recipeId,
        recipeName: rec.recipeName,
        recipeCode: rec.recipeCode,
        estimatedQuantity: rec.estimatedQuantity,
        resultQuantity: rec.resultQuantity,
        unit: rec.unit,
        wastePercent: Number(wastePct.toFixed(1)),
        wasteQuantity: Number(wasteQty.toFixed(3)),
        unitCost: Number(unitCost.toFixed(2)),
        totalCost: Number(portionCost.toFixed(2)),
        targetIngredientId: rec.targetIngredientId
      };
    });

    const newOp: ProductionOrder = {
      id: `op-${Date.now()}`,
      orderNumber: nextOrderNumber,
      batchNumber: nextBatchNumber,
      warehouseName: opWarehouse,
      preparedAt: opDate,
      status: 'completado',
      responsibleName: opResponsible,
      items: finalItems,
      requiredIngredients: explodedRequiredIngredients,
      totalEstimatedCost: totalExplodedCost,
      totalActualCost: totalExplodedCost,
      notes: opNotes || undefined,
      createdAt: new Date().toISOString()
    };

    addProductionOrder(newOp);
    confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });
    showNotice(`¡Orden de Producción ${newOp.orderNumber} finalizada con éxito! Stock actualizado en almacén.`);
    setActiveSubTab('history');
  };

  // =========================================================================
  // 2. HISTORIAL DE ÓRDENES DE PRODUCCIÓN
  // =========================================================================
  const [historySearch, setHistorySearch] = useState<string>('');

  const filteredProductionOrders = useMemo(() => {
    return productionOrders.filter(op => {
      if (!historySearch.trim()) return true;
      const term = historySearch.toLowerCase();
      return (
        op.orderNumber.toLowerCase().includes(term) ||
        op.responsibleName.toLowerCase().includes(term) ||
        op.items.some(it => it.recipeName.toLowerCase().includes(term))
      );
    });
  }, [productionOrders, historySearch]);

  // Agrupación para modal detalle: Insumos por categoría
  const ingredientsByCategoryInModal = useMemo(() => {
    if (!viewingOpDetail) return [];
    const grouped = new Map<string, { category: string; items: ProductionOrderIngredient[]; total: number }>();

    viewingOpDetail.requiredIngredients.forEach(ing => {
      const cat = ing.category || 'Otros';
      if (!grouped.has(cat)) {
        grouped.set(cat, { category: cat, items: [], total: 0 });
      }
      const g = grouped.get(cat)!;
      g.items.push(ing);
      g.total += ing.totalCost;
    });

    return Array.from(grouped.values());
  }, [viewingOpDetail]);

  // =========================================================================
  // 3. REGISTRO DE MERMAS DIRECTAS
  // =========================================================================
  const [wasteIngId, setWasteIngId] = useState<string>(ingredients[0]?.id || '');
  const [wasteSearchInput, setWasteSearchInput] = useState<string>('');
  const [wasteQty, setWasteQty] = useState<string>('');
  const [wasteReason, setWasteReason] = useState<'vencimiento' | 'deterioro_frio' | 'error_preparacion' | 'merma_corte'>('deterioro_frio');
  const [wasteTimeRange, setWasteTimeRange] = useState<'today' | '7days' | 'month' | 'all'>('today');

  const filteredWasteIngSuggestions = ingredients.filter(ing => {
    if (!wasteSearchInput.trim()) return true;
    const term = wasteSearchInput.toLowerCase();
    return ing.name.toLowerCase().includes(term) || (ing.code && ing.code.toLowerCase().includes(term));
  }).slice(0, 6);

  const handleRecordDirectWaste = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(wasteQty) || 0;
    if (qty <= 0) return;

    const ing = ingredients.find(i => i.id === wasteIngId);
    if (!ing) return;

    addWaste({
      ingredientId: ing.id,
      ingredientName: ing.name,
      quantity: qty,
      unit: ing.unit,
      reason: wasteReason,
      notes: `Merma manual directa: ${wasteReason.replace('_', ' ')}`,
      date: new Date().toISOString()
    });

    showNotice(`Merma de ${qty} ${ing.unit} de ${ing.name} registrada y descontada de inventario.`);
    setWasteQty('');
  };

  const filteredWastes = wastes.filter(w => {
    if (wasteTimeRange === 'all') return true;
    const wasteDate = new Date(w.date).getTime();
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    if (wasteTimeRange === 'today') {
      return new Date(w.date).toDateString() === new Date().toDateString();
    }
    if (wasteTimeRange === '7days') return now - wasteDate <= 7 * oneDayMs;
    if (wasteTimeRange === 'month') return now - wasteDate <= 30 * oneDayMs;
    return true;
  });

  const totalWasteLossSol = filteredWastes.reduce((acc, curr) => acc + curr.costLost, 0);

  return (
    <div className={'flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col ' + (isLight ? 'bg-slate-100 text-slate-800' : 'bg-slate-950 text-slate-100')}>
      {/* Notificación Toast */}
      {notificationMsg && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-black animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Cabecera Principal del Módulo */}
      <div className={`flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b ${isLight ? 'border-slate-300' : 'border-slate-800'}`}>
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full font-bold border ${
              isLight ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            }`}>
              Módulo de Producción & Mermas
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              Control de Rendimiento BOM y Trazabilidad por Lote
            </span>
          </div>
          <h1 className={`text-2xl font-black mt-1 flex items-center gap-2.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <Factory className="w-6 h-6 text-orange-500" />
            <span>Gestión de Producción</span>
          </h1>
        </div>

        {/* Selector de Subpestañas */}
        <div className={`flex items-center gap-2 p-1 rounded-2xl border ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <button
            onClick={() => setActiveSubTab('prepare')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeSubTab === 'prepare'
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Preparar Recetas (Nueva OP)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeSubTab === 'history'
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Historial de OPs ({productionOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('wastes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeSubTab === 'wastes'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Mermas Directas</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VISTA 1: PREPARAR RECETAS (NUEVA OP) — EXACTO A LA FOTO REFERENCIA */}
      {/* ========================================================================= */}
      {activeSubTab === 'prepare' && (
        <div className="space-y-4">
          {/* Tarjeta de Metadatos de la Orden */}
          <div className={`p-4 rounded-3xl border shadow-sm ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Local</label>
                <div className="font-black text-slate-900 dark:text-white truncate">Sabor & Fruta Carabayllo</div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Almacén Producción</label>
                <select
                  value={opWarehouse}
                  onChange={e => setOpWarehouse(e.target.value)}
                  className={`w-full p-1.5 rounded-xl border text-xs font-bold ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                >
                  <option value="Barra Central / Zumos">Barra Central / Zumos</option>
                  <option value="Producción Cocina TV">Producción Cocina TV</option>
                  <option value="Almacén Principal">Almacén Principal</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Código OP</label>
                <div className="font-mono font-black text-orange-500 bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/20 w-fit">
                  {nextOrderNumber}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Fecha</label>
                <input
                  type="date"
                  value={opDate}
                  onChange={e => setOpDate(e.target.value)}
                  className={`w-full p-1.5 rounded-xl border text-xs font-bold ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Lote Generado</label>
                <div className={`font-mono text-[11px] font-bold p-1.5 rounded-xl border truncate ${
                  isLight ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-slate-950/60 text-slate-400 border-slate-800'
                }`}>
                  {nextBatchNumber}
                </div>
              </div>

              <div>
                <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Responsable</label>
                <input
                  type="text"
                  value={opResponsible}
                  onChange={e => setOpResponsible(e.target.value)}
                  className={`w-full p-1.5 rounded-xl border text-xs font-bold ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                  placeholder="Operario a cargo..."
                />
              </div>
            </div>
          </div>

          {/* Grid Principal Dividido: Panel Izquierdo (Recetas) + Panel Derecho (Resultantes + Insumos) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* PANEL IZQUIERDO: RECETAS A PREPARAR (6 columnas) */}
            <div className={`lg:col-span-6 p-4 rounded-3xl border flex flex-col justify-between ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/80 border-slate-800'
            }`}>
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className="text-sm font-black flex items-center gap-2 text-slate-900 dark:text-white">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                    <span>Recetas a preparar</span>
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">
                    {selectedRecipes.length} recetas en orden
                  </span>
                </div>

                {/* Buscador de recetas */}
                <div className="relative mb-3">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={recipeSearch}
                    onChange={e => setRecipeSearch(e.target.value)}
                    placeholder="Busca por código o nombre de receta..."
                    className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border font-semibold ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                    }`}
                  />
                  {recipeSearch.trim() && (
                    <div className={`absolute left-0 right-0 top-full mt-1 border rounded-xl shadow-2xl z-20 max-h-48 overflow-y-auto divide-y ${
                      isLight ? 'bg-white border-slate-200 divide-slate-100' : 'bg-slate-900 border-slate-800 divide-slate-800'
                    }`}>
                      {availableRecipes
                        .filter(r => r.name.toLowerCase().includes(recipeSearch.toLowerCase()) || r.code.toLowerCase().includes(recipeSearch.toLowerCase()))
                        .map(r => (
                          <div
                            key={r.id}
                            onClick={() => handleAddRecipeToForm(r)}
                            className={`p-2 cursor-pointer flex items-center justify-between text-xs transition-colors ${
                              isLight ? 'hover:bg-slate-100 text-slate-900' : 'hover:bg-slate-800 text-white'
                            }`}
                          >
                            <div>
                              <span className="font-mono text-orange-600 dark:text-orange-400 font-bold mr-2">{r.code}</span>
                              <span className="font-bold">{r.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">+{r.unit}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Accesos Rápidos de Preparación Frecuente */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 no-scrollbar">
                  <span className={`text-[10px] font-bold uppercase whitespace-nowrap ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Rápidos:</span>
                  {availableRecipes.slice(0, 5).map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleAddRecipeToForm(r)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold border whitespace-nowrap transition-all ${
                        isLight
                          ? 'bg-slate-100 hover:bg-orange-100 text-slate-700 hover:text-orange-700 border-slate-300'
                          : 'bg-slate-800/80 hover:bg-orange-600/30 text-slate-300 hover:text-orange-300 border-slate-700'
                      }`}
                    >
                      + {r.name.replace('Pulpa Congelada de ', 'Pulpa ')}
                    </button>
                  ))}
                </div>

                {/* Tabla de Recetas Seleccionadas */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className={`border-b ${isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800 text-slate-400'}`}>
                        <th className="pb-2 font-mono text-[10px]">CÓDIGO</th>
                        <th className="pb-2 font-bold">RECETA</th>
                        <th className="pb-2 text-center font-bold">BOM</th>
                        <th className="pb-2 text-center font-bold">CANT. ESTIMADA</th>
                        <th className="pb-2 text-center font-bold">CANT. RESULTANTE</th>
                        <th className="pb-2 text-center font-bold">UNIDAD</th>
                        <th className="pb-2 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {selectedRecipes.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                            No has agregado recetas a preparar aún. Usa el buscador superior.
                          </td>
                        </tr>
                      ) : (
                        selectedRecipes.map((rec, idx) => (
                          <tr key={idx} className={isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/20'}>
                            <td className="py-2.5 font-mono text-orange-600 dark:text-orange-400 font-bold whitespace-nowrap">
                              {rec.recipeCode}
                            </td>
                            <td className="py-2.5 font-bold text-slate-900 dark:text-white pr-2">
                              {rec.recipeName}
                            </td>
                            <td className="py-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => setViewingRecipeDetail(rec)}
                                title="Ver composición y fórmula BOM de esta receta"
                                className={`p-1.5 rounded-lg border transition-all inline-flex items-center justify-center ${
                                  isLight
                                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-300 hover:border-amber-400 shadow-sm'
                                    : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30'
                                }`}
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </td>
                            <td className="py-2.5 text-center">
                              <input
                                type="number"
                                step="0.1"
                                min="0.1"
                                value={rec.estimatedQuantity}
                                onChange={e => handleUpdateRecipeQuantities(idx, 'estimatedQuantity', parseFloat(e.target.value) || 0)}
                                className={`w-16 p-1 text-center font-mono font-black rounded-lg border text-xs ${
                                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                                }`}
                              />
                            </td>
                            <td className="py-2.5 text-center">
                              <input
                                type="number"
                                step="0.1"
                                min="0.1"
                                value={rec.resultQuantity}
                                onChange={e => handleUpdateRecipeQuantities(idx, 'resultQuantity', parseFloat(e.target.value) || 0)}
                                className={`w-16 p-1 text-center font-mono font-black rounded-lg border text-xs ${
                                  isLight ? 'bg-emerald-50 border-emerald-400 text-emerald-800 font-black' : 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300'
                                }`}
                              />
                            </td>
                            <td className="py-2.5 text-center font-mono text-[11px] text-slate-500 dark:text-slate-400">
                              {rec.unit}
                            </td>
                            <td className="py-2.5 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveRecipeFromForm(idx)}
                                className="p-1 rounded-md text-slate-400 hover:text-rose-500 transition-all"
                                title="Quitar receta"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Input opcional de notas */}
              <div className="mt-4 pt-3 border-t border-slate-800/60">
                <input
                  type="text"
                  value={opNotes}
                  onChange={e => setOpNotes(e.target.value)}
                  placeholder="Observaciones de la preparación (ej. frutas de rescate maduras de refrigerador)..."
                  className={`w-full p-2 rounded-xl text-xs border ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                />
              </div>
            </div>

            {/* PANEL DERECHO: RESULTANTES + INSUMOS REQUERIDOS BOM (6 columnas) */}
            <div className="lg:col-span-6 space-y-4">
              
              {/* CAJA SUPERIOR: CANTIDADES RESULTANTES PREPARADOS */}
              <div className={`p-4 rounded-3xl border ${
                isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/80 border-slate-800'
              }`}>
                <h3 className="text-sm font-black flex items-center gap-2 text-slate-900 dark:text-white mb-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>Cantidades resultantes preparados</span>
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className={`border-b ${isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800 text-slate-400'}`}>
                        <th className="pb-1.5 font-bold">RECETA</th>
                        <th className="pb-1.5 text-center font-bold">CANTIDAD RESULTANTE</th>
                        <th className="pb-1.5 text-center font-bold">PRESENTACIÓN</th>
                        <th className="pb-1.5 text-right font-bold">% MERMA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {selectedRecipes.map((rec, idx) => {
                        const wasteQty = Math.max(0, rec.estimatedQuantity - rec.resultQuantity);
                        const wastePercent = rec.estimatedQuantity > 0 ? (wasteQty / rec.estimatedQuantity) * 100 : 0;
                        return (
                          <tr key={idx}>
                            <td className="py-2 font-bold text-slate-800 dark:text-slate-200">{rec.recipeName}</td>
                            <td className="py-2 text-center font-mono font-black text-emerald-600 dark:text-emerald-400">
                              {rec.resultQuantity.toFixed(2)}
                            </td>
                            <td className="py-2 text-center font-mono text-slate-400">{rec.unit}</td>
                            <td className="py-2 text-right font-mono font-black">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                                wastePercent > 10
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  : wastePercent > 0
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              }`}>
                                {wastePercent.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CAJA INFERIOR: INSUMOS QUE NECESITAS (EXPLOSIÓN BOM) */}
              <div className={`p-4 rounded-3xl border flex flex-col justify-between ${
                isLight ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/80 border-slate-800'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-black flex items-center gap-2 text-slate-900 dark:text-white">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
                      <span>Insumos que necesitas</span>
                      <span className="text-[11px] font-normal text-slate-400">({explodedRequiredIngredients.length} insumos requeridos)</span>
                    </h3>
                    <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                      Total Costo: S/ {totalExplodedCost.toFixed(2)}
                    </span>
                  </div>

                  {/* Vista Desktop / Tablet: Tabla responsiva con scroll horizontal contenido y scroll vertical */}
                  <div className="hidden sm:block overflow-x-auto max-h-72 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-inner">
                    <table className="w-full text-left text-xs min-w-[700px]">
                      <thead className={`sticky top-0 z-10 ${isLight ? 'bg-slate-100/95 text-slate-600' : 'bg-slate-950/95 text-slate-400'} backdrop-blur-sm`}>
                        <tr className="border-b border-slate-200 dark:border-slate-800">
                          <th className="py-2.5 px-3 font-bold">INSUMO</th>
                          <th className="py-2.5 px-2 text-center font-bold">CANT. TEÓRICA (BOM)</th>
                          <th className="py-2.5 px-2 text-center font-bold text-cyan-600 dark:text-cyan-400">CANT. REAL RETIRADA</th>
                          <th className="py-2.5 px-2 text-center font-bold text-amber-600 dark:text-amber-400">MERMA REPORTADA</th>
                          <th className="py-2.5 px-2 text-center font-bold">% MERMA REAL</th>
                          <th className="py-2.5 px-2 text-center font-bold text-orange-600 dark:text-orange-400">TOTAL A DESCONTAR</th>
                          <th className="py-2.5 px-2 text-center font-bold">STOCK ALMACÉN</th>
                          <th className="py-2.5 px-3 text-right font-bold">VALORIZACIÓN S/</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800/40">
                        {explodedRequiredIngredients.map((item, idx) => {
                          const realQty = item.quantityReal ?? item.quantityRequired;
                          const hasStock = item.currentStock >= realQty;

                          return (
                            <tr key={idx} className={isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/30'}>
                              <td className="py-2 px-3">
                                <span className="font-bold text-slate-900 dark:text-slate-100 block truncate">{item.ingredientName}</span>
                                <span className="text-[10px] font-mono text-slate-400">{item.ingredientCode}</span>
                              </td>
                              <td className="py-2 px-2 text-center font-mono font-semibold text-slate-600 dark:text-slate-400">
                                {item.quantityRequired.toFixed(3)} {item.unit}
                              </td>
                              {/* Cantidad Real Retirada del Almacén */}
                              <td className="py-2 px-2 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <input
                                    type="number"
                                    step="0.001"
                                    min="0"
                                    value={ingredientRealInput[item.ingredientId] !== undefined ? ingredientRealInput[item.ingredientId] : item.quantityRequired}
                                    onChange={e => {
                                      const val = parseFloat(e.target.value) || 0;
                                      setIngredientRealInput(prev => ({
                                        ...prev,
                                        [item.ingredientId]: val
                                      }));
                                    }}
                                    className={`w-20 p-1 text-center font-mono font-black rounded-lg border text-xs ${
                                      isLight ? 'bg-cyan-50 border-cyan-300 text-cyan-900 focus:bg-white' : 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300'
                                    }`}
                                  />
                                  <span className="text-[10px] text-slate-400 font-mono">{item.unit}</span>
                                </div>
                              </td>
                              {/* Merma Reportada */}
                              <td className="py-2 px-2 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <input
                                    type="number"
                                    step="0.001"
                                    min="0"
                                    placeholder="0.000"
                                    value={ingredientWasteInput[item.ingredientId] !== undefined ? ingredientWasteInput[item.ingredientId] : ''}
                                    onChange={e => {
                                      const val = parseFloat(e.target.value) || 0;
                                      setIngredientWasteInput(prev => ({
                                        ...prev,
                                        [item.ingredientId]: val
                                      }));
                                    }}
                                    className={`w-18 p-1 text-center font-mono font-bold rounded-lg border text-xs ${
                                      (ingredientWasteInput[item.ingredientId] || 0) > 0
                                        ? 'bg-amber-500/15 border-amber-500/50 text-amber-500 font-black'
                                        : isLight ? 'bg-slate-50 border-slate-300 text-slate-700' : 'bg-slate-950 border-slate-700 text-slate-300'
                                    }`}
                                  />
                                  <span className="text-[10px] text-slate-400 font-mono">{item.unit}</span>
                                </div>
                              </td>
                              {/* % Merma Real */}
                              <td className="py-2 px-2 text-center">
                                <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-black ${
                                  item.wastePercent > 10
                                    ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30'
                                    : item.wastePercent > 0
                                    ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                                    : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                }`}>
                                  {item.wastePercent.toFixed(2)}%
                                </span>
                              </td>
                              {/* Total a Descontar (= Cantidad Real) */}
                              <td className="py-2 px-2 text-center font-mono font-black text-orange-600 dark:text-orange-400">
                                {realQty.toFixed(3)} {item.unit}
                              </td>
                              {/* Stock en Almacén */}
                              <td className="py-2 px-2 text-center font-mono">
                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                                  hasStock 
                                    ? isLight ? 'text-emerald-700 bg-emerald-100 border border-emerald-200' : 'text-emerald-400 bg-emerald-500/10'
                                    : 'text-rose-500 bg-rose-500/15 font-bold border border-rose-500/30'
                                }`}>
                                  {item.currentStock} {item.unit}
                                </span>
                              </td>
                              {/* Valorización Soles */}
                              <td className="py-2 px-3 text-right font-mono font-black text-slate-900 dark:text-white">
                                S/ {item.totalCost.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Vista Móvil: Tarjetas individuales en lugar de tabla horizontal apretada */}
                  <div className="sm:hidden space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {explodedRequiredIngredients.map((item, idx) => {
                      const realQty = item.quantityReal ?? item.quantityRequired;
                      const hasStock = item.currentStock >= realQty;

                      return (
                        <div key={idx} className={`p-3 rounded-2xl border text-xs space-y-2 ${
                          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white block">{item.ingredientName}</span>
                              <span className="text-[10px] font-mono text-slate-400">{item.ingredientCode} • Teórico: {item.quantityRequired.toFixed(3)} {item.unit}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold ${
                              hasStock ? 'text-emerald-600 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/15'
                            }`}>
                              Stock: {item.currentStock} {item.unit}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200 dark:border-slate-800/80">
                            <div>
                              <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 block mb-0.5">Cant. Real Retirada:</span>
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  step="0.001"
                                  min="0"
                                  value={ingredientRealInput[item.ingredientId] !== undefined ? ingredientRealInput[item.ingredientId] : item.quantityRequired}
                                  onChange={e => {
                                    const val = parseFloat(e.target.value) || 0;
                                    setIngredientRealInput(prev => ({ ...prev, [item.ingredientId]: val }));
                                  }}
                                  className={`w-full p-1.5 text-center font-mono font-black rounded-lg border text-xs ${
                                    isLight ? 'bg-white border-cyan-300 text-cyan-900' : 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300'
                                  }`}
                                />
                                <span className="text-[10px] text-slate-400">{item.unit}</span>
                              </div>
                            </div>

                            <div>
                              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block mb-0.5">Merma Reportada:</span>
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  step="0.001"
                                  min="0"
                                  placeholder="0.000"
                                  value={ingredientWasteInput[item.ingredientId] !== undefined ? ingredientWasteInput[item.ingredientId] : ''}
                                  onChange={e => {
                                    const val = parseFloat(e.target.value) || 0;
                                    setIngredientWasteInput(prev => ({ ...prev, [item.ingredientId]: val }));
                                  }}
                                  className={`w-full p-1.5 text-center font-mono font-bold rounded-lg border text-xs ${
                                    (ingredientWasteInput[item.ingredientId] || 0) > 0
                                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-500 font-black'
                                      : isLight ? 'bg-white border-slate-300 text-slate-700' : 'bg-slate-950 border-slate-700 text-slate-300'
                                  }`}
                                />
                                <span className="text-[10px] text-slate-400">{item.unit}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800/80 text-[11px]">
                            <span className="text-slate-500">Descuento: <b className="text-orange-500 font-mono">{realQty.toFixed(3)} {item.unit}</b></span>
                            <span className="font-mono font-bold text-slate-900 dark:text-white">Costo: S/ {item.totalCost.toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* BOTÓN DE ACCIÓN: FINALIZAR Y REGISTRAR PRODUCCIÓN */}
                <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                  <div className="text-xs">
                    <span className="text-slate-400 block text-[10px]">Costo Valorizado Estimado</span>
                    <span className="text-base font-mono font-black text-emerald-500">
                      S/ {totalExplodedCost.toFixed(2)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleFinalizeProduction}
                    className="px-6 py-3 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs shadow-xl shadow-orange-600/30 flex items-center gap-2 active:scale-95 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>FINALIZAR Y REGISTRAR PRODUCCIÓN</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 2: HISTORIAL DE ÓRDENES DE PRODUCCIÓN — EXACTO A LA FOTO REFERENCIA */}
      {/* ========================================================================= */}
      {activeSubTab === 'history' && (
        <div className="space-y-4">
          {/* Barra de Filtro */}
          <div className={`p-4 rounded-3xl border flex items-center justify-between gap-3 ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
          }`}>
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={historySearch}
                onChange={e => setHistorySearch(e.target.value)}
                placeholder="Buscar por código OP, responsable o receta..."
                className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border font-semibold ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                }`}
              />
            </div>
            <button
              onClick={() => setActiveSubTab('prepare')}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black rounded-xl shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Nueva Orden de Producción</span>
            </button>
          </div>

          {/* Tabla de OPs */}
          <div className={`rounded-3xl border overflow-hidden shadow-sm ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className={`border-b ${isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-950/60 border-slate-800 text-slate-400'}`}>
                    <th className="py-3 px-4 font-mono"># ORDEN</th>
                    <th className="py-3 px-3 font-bold">FECHA</th>
                    <th className="py-3 px-4 font-bold">RECETAS PRODUCIDAS</th>
                    <th className="py-3 px-3 font-bold">ALMACÉN</th>
                    <th className="py-3 px-3 font-bold">RESPONSABLE</th>
                    <th className="py-3 px-3 text-right font-bold">TOTAL INSUMOS</th>
                    <th className="py-3 px-3 text-center font-bold">ESTADO</th>
                    <th className="py-3 px-4 text-right">ACCIONES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {filteredProductionOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        No se encontraron órdenes de producción registradas.
                      </td>
                    </tr>
                  ) : (
                    filteredProductionOrders.map(op => (
                      <tr key={op.id} className="hover:bg-slate-800/20">
                        <td className="py-3 px-4 font-mono font-black text-orange-400 whitespace-nowrap">
                          {op.orderNumber}
                        </td>
                        <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                          {op.preparedAt}
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
                            {op.items.map((it, idx) => (
                              <div key={idx} className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                <span>{it.resultQuantity} {it.unit} {it.recipeName}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                          {op.warehouseName}
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {op.responsibleName}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-black text-emerald-500 whitespace-nowrap">
                          S/ {op.totalActualCost.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Completada
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => {
                              setViewingOpDetail(op);
                              setOpDetailTab('byRecipe');
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-orange-400 hover:bg-slate-700 transition-all"
                            title="Ver detalle de explosión e insumos"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 3: REGISTRO DE MERMAS DIRECTAS */}
      {/* ========================================================================= */}
      {activeSubTab === 'wastes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Formulario Registro de Merma */}
          <div className={`lg:col-span-5 p-5 rounded-3xl border shadow-sm ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
          }`}>
            <h3 className="text-sm font-black flex items-center gap-2 text-rose-500 mb-3">
              <Trash2 className="w-4 h-4" />
              <span>Registrar Merma Puntual</span>
            </h3>

            <form onSubmit={handleRecordDirectWaste} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Buscar Insumo</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={wasteSearchInput}
                    onChange={e => setWasteSearchInput(e.target.value)}
                    placeholder="Filtrar insumo..."
                    className={`w-full pl-8 pr-3 py-1.5 rounded-xl text-xs border ${
                      isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-800'
                    }`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-1.5 mt-2 max-h-36 overflow-y-auto">
                  {filteredWasteIngSuggestions.map(ing => (
                    <button
                      key={ing.id}
                      type="button"
                      onClick={() => setWasteIngId(ing.id)}
                      className={`p-2 rounded-xl text-left border text-xs transition-all ${
                        wasteIngId === ing.id
                          ? 'border-rose-500 bg-rose-500/15 text-rose-400 font-black'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="truncate font-bold">{ing.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Stock: {ing.stock} {ing.unit}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Cantidad a Mermar</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={wasteQty}
                    onChange={e => setWasteQty(e.target.value)}
                    placeholder="0.00"
                    required
                    className={`w-full p-2 rounded-xl text-xs border font-mono font-black ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Motivo</label>
                  <select
                    value={wasteReason}
                    onChange={e => setWasteReason(e.target.value as any)}
                    className={`w-full p-2 rounded-xl text-xs border font-bold ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                    }`}
                  >
                    <option value="deterioro_frio">Deterioro en Frío</option>
                    <option value="vencimiento">Vencimiento Fecha</option>
                    <option value="error_preparacion">Error en Barra/Cocina</option>
                    <option value="merma_corte">Merma Excesiva en Corte</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-600/30 transition-all"
              >
                Registrar y Descontar Merma de Inventario
              </button>
            </form>
          </div>

          {/* Historial de Mermas Directas */}
          <div className={`lg:col-span-7 p-5 rounded-3xl border shadow-sm ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black flex items-center gap-2 text-slate-900 dark:text-white">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Historial de Mermas Directas</span>
              </h3>
              <div className="text-xs font-mono font-black text-rose-500">
                Total Pérdida: S/ {totalWasteLossSol.toFixed(2)}
              </div>
            </div>

            <div className="flex items-center gap-1.5 mb-3">
              {(['today', '7days', 'month', 'all'] as const).map(rng => (
                <button
                  key={rng}
                  onClick={() => setWasteTimeRange(rng)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                    wasteTimeRange === rng
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {rng === 'today' ? 'Hoy' : rng === '7days' ? '7 Días' : rng === 'month' ? 'Mes' : 'Todos'}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className={`border-b ${isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800 text-slate-400'}`}>
                    <th className="pb-2 font-bold">FECHA</th>
                    <th className="pb-2 font-bold">INSUMO</th>
                    <th className="pb-2 font-bold">MOTIVO</th>
                    <th className="pb-2 text-center font-bold">CANTIDAD</th>
                    <th className="pb-2 text-right font-bold">COSTO S/</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {filteredWastes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        No hay registros de merma en el rango seleccionado.
                      </td>
                    </tr>
                  ) : (
                    filteredWastes.map(w => (
                      <tr key={w.id}>
                        <td className="py-2 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                          {new Date(w.date).toLocaleDateString()}
                        </td>
                        <td className="py-2 font-bold text-slate-800 dark:text-slate-200">
                          {w.ingredientName}
                        </td>
                        <td className="py-2 text-[11px] capitalize text-slate-400">
                          {w.reason.replace('_', ' ')}
                        </td>
                        <td className="py-2 text-center font-mono font-bold text-rose-400">
                          {w.quantity} {w.unit}
                        </td>
                        <td className="py-2 text-right font-mono font-black text-rose-500">
                          S/ {w.costLost.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DETALLE DE ORDEN DE PRODUCCIÓN — EXACTO A LA FOTO REFERENCIA */}
      {/* ========================================================================= */}
      {viewingOpDetail && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-4xl max-h-[90vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden ${
            isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-800'
          }`}>
            {/* Cabecera del Modal */}
            <div className={`p-4 border-b flex items-center justify-between ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
            }`}>
              <div>
                <span className="text-[10px] font-mono uppercase text-orange-500 font-black tracking-wider">
                  Detalle de Órden de Producción
                </span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Órden de producción #{viewingOpDetail.orderNumber}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Completada
                  </span>
                </h2>
              </div>
              <button
                onClick={() => setViewingOpDetail(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Subcabecera con metadatos y pestañas del modal */}
            <div className={`px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3 text-xs ${
              isLight ? 'bg-slate-100/60 border-slate-200' : 'bg-slate-950/40 border-slate-800'
            }`}>
              <div className="flex items-center gap-4 text-slate-400">
                <div>
                  <span className="font-bold text-slate-300">Fecha:</span> {viewingOpDetail.preparedAt}
                </div>
                <div>
                  <span className="font-bold text-slate-300">Responsable:</span> {viewingOpDetail.responsibleName}
                </div>
                <div>
                  <span className="font-bold text-slate-300">Almacén:</span> {viewingOpDetail.warehouseName}
                </div>
                <div>
                  <span className="font-bold text-slate-300">Lote:</span> {viewingOpDetail.batchNumber}
                </div>
              </div>

              {/* Pestañas: Insumos por receta vs Insumos por categoría */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setOpDetailTab('byRecipe')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    opDetailTab === 'byRecipe'
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Insumos por receta
                </button>
                <button
                  type="button"
                  onClick={() => setOpDetailTab('byCategory')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    opDetailTab === 'byCategory'
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Insumos por categoría
                </button>
              </div>
            </div>

            {/* Contenido del Modal */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              
              {/* TAB 1: INSUMOS POR RECETA */}
              {opDetailTab === 'byRecipe' && (
                <div className="space-y-4">
                  {viewingOpDetail.items.map((prodItem, idx) => (
                    <div key={idx} className={`p-4 rounded-2xl border ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                    }`}>
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/40">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-orange-400 font-bold">{prodItem.recipeCode}</span>
                          <span className="font-black text-sm text-slate-900 dark:text-white">{prodItem.recipeName}</span>
                        </div>
                        <div className="text-xs font-mono font-bold text-slate-400">
                          Resultante: <span className="text-emerald-400 font-black">{prodItem.resultQuantity} {prodItem.unit}</span> (Estimado: {prodItem.estimatedQuantity} {prodItem.unit})
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="text-slate-500 font-bold border-b border-slate-800/40">
                              <th className="pb-1.5">INSUMO</th>
                              <th className="pb-1.5 text-center">CANT. REQUERIDA</th>
                              <th className="pb-1.5 text-center">% MERMA</th>
                              <th className="pb-1.5 text-center">TOTAL DESCONTADO</th>
                              <th className="pb-1.5 text-right">COSTO UNITARIO</th>
                              <th className="pb-1.5 text-right">TOTAL</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/30">
                            {viewingOpDetail.requiredIngredients.map((ing, ingIdx) => (
                              <tr key={ingIdx}>
                                <td className="py-1.5 font-semibold text-slate-300">{ing.ingredientName}</td>
                                <td className="py-1.5 text-center font-mono">{ing.quantityRequired} {ing.unit}</td>
                                <td className="py-1.5 text-center font-mono text-slate-400">{ing.wastePercent}%</td>
                                <td className="py-1.5 text-center font-mono font-bold text-orange-400">
                                  {(ing.quantityReal ?? (ing.quantityRequired + (ing.wasteQuantity || 0))).toFixed(3)} {ing.unit}
                                </td>
                                <td className="py-1.5 text-right font-mono text-slate-400">S/ {ing.unitCost.toFixed(2)}</td>
                                <td className="py-1.5 text-right font-mono font-black text-slate-200">S/ {ing.totalCost.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 2: INSUMOS POR CATEGORÍA */}
              {opDetailTab === 'byCategory' && (
                <div className="space-y-4">
                  {ingredientsByCategoryInModal.map((group, idx) => (
                    <div key={idx} className={`p-4 rounded-2xl border ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                    }`}>
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/40">
                        <span className="font-bold uppercase tracking-wider text-xs text-orange-400">
                          {group.category}
                        </span>
                        <span className="text-xs font-mono font-black text-emerald-400">
                          Subtotal: S/ {group.total.toFixed(2)}
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="text-slate-500 font-bold border-b border-slate-800/40">
                              <th className="pb-1.5">INSUMO</th>
                              <th className="pb-1.5 text-center">CANT. CONSUMIDA</th>
                              <th className="pb-1.5 text-right">COSTO UNITARIO</th>
                              <th className="pb-1.5 text-right">VALORIZADO S/</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/30">
                            {group.items.map((ing, ingIdx) => (
                              <tr key={ingIdx}>
                                <td className="py-1.5 font-semibold text-slate-300">{ing.ingredientName}</td>
                                <td className="py-1.5 text-center font-mono font-bold text-orange-400">
                                  {(ing.quantityReal ?? (ing.quantityRequired + (ing.wasteQuantity || 0))).toFixed(3)} {ing.unit}
                                </td>
                                <td className="py-1.5 text-right font-mono text-slate-400">S/ {ing.unitCost.toFixed(2)}</td>
                                <td className="py-1.5 text-right font-mono font-black text-slate-200">S/ {ing.totalCost.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Observaciones Registradas */}
              {viewingOpDetail.notes && (
                <div className={`p-3.5 rounded-2xl border text-xs ${
                  isLight ? 'bg-amber-50/80 border-amber-200 text-amber-950' : 'bg-amber-500/10 border-amber-500/20 text-amber-200'
                }`}>
                  <span className="font-bold text-[10px] uppercase block text-amber-500 mb-0.5 tracking-wider">
                    📝 Observaciones Registradas en Almacén:
                  </span>
                  <p className="font-medium italic leading-relaxed">{viewingOpDetail.notes}</p>
                </div>
              )}

              {/* Resumen Total al Pie del Modal */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-950 border-slate-800'
              }`}>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Lote Asignado a Almacén</span>
                  <span className="text-xs font-mono font-black text-orange-400">{viewingOpDetail.batchNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Insumos Valorizados</span>
                  <span className="text-xl font-mono font-black text-emerald-500">
                    S/ {viewingOpDetail.totalActualCost.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL VISTA RÁPIDA: COMPOSICIÓN INDIVIDUAL DE RECETA (OJITO BOM) */}
      {/* ========================================================================= */}
      {viewingRecipeDetail && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-3xl border shadow-2xl flex flex-col overflow-hidden animate-in fade-in duration-200 ${
            isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-100'
          }`}>
            {/* Header del Modal */}
            <div className={`p-4 border-b flex items-center justify-between ${
              isLight ? 'bg-amber-50/80 border-slate-200' : 'bg-slate-950/80 border-slate-800'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-amber-500 block">
                    Ficha Técnica de Composición (BOM)
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="font-mono text-orange-500">{viewingRecipeDetail.recipeCode}</span>
                    <span>{viewingRecipeDetail.recipeName}</span>
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingRecipeDetail(null)}
                className={`p-1.5 rounded-xl border transition-all ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Metadatos de la orden de producción actual para esta receta */}
            <div className={`px-4 py-2.5 border-b grid grid-cols-3 gap-2 text-xs ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-800'
            }`}>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Cant. a Producir:</span>
                <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                  {viewingRecipeDetail.resultQuantity || viewingRecipeDetail.estimatedQuantity} {viewingRecipeDetail.unit}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Presentación Base:</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                  1.00 {viewingRecipeDetail.unit}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Líneas de Insumos:</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                  {viewingRecipeDetail.bom.length} componentes
                </span>
              </div>
            </div>

            {/* Tabla de Insumos requeridos por receta individual */}
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className={`border-b ${isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800 text-slate-400'}`}>
                    <th className="pb-2 font-bold">INSUMO COMPONENTE</th>
                    <th className="pb-2 text-center font-bold">DOSIS UNITARIA (1 {viewingRecipeDetail.unit})</th>
                    <th className="pb-2 text-center font-bold text-orange-600 dark:text-orange-400">TOTAL ESTA OP</th>
                    <th className="pb-2 text-right font-bold">COSTO S/</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/40">
                  {viewingRecipeDetail.bom.map((bomItem, bIdx) => {
                    const ing = ingredients.find(i => i.id === bomItem.ingredientId);
                    const qtyMultiplier = viewingRecipeDetail.resultQuantity || viewingRecipeDetail.estimatedQuantity || 1;
                    const totalQty = bomItem.quantity * qtyMultiplier;
                    const unitCost = ing?.costPerUnit || 0;
                    const totalCost = totalQty * unitCost;

                    return (
                      <tr key={bIdx} className={isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/20'}>
                        <td className="py-2.5 pr-2">
                          <span className="font-bold text-slate-900 dark:text-slate-100 block">
                            {ing ? ing.name : bomItem.ingredientId}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {ing ? ing.code : ''} • Stock: {ing ? `${ing.stock} ${ing.unit}` : '-'}
                          </span>
                        </td>
                        <td className="py-2.5 text-center font-mono text-slate-600 dark:text-slate-300">
                          {bomItem.quantity.toFixed(3)} {bomItem.unit}
                        </td>
                        <td className="py-2.5 text-center font-mono font-black text-orange-600 dark:text-orange-400">
                          {totalQty.toFixed(3)} {bomItem.unit}
                        </td>
                        <td className="py-2.5 text-right font-mono font-black text-slate-900 dark:text-white">
                          S/ {totalCost.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {viewingRecipeDetail.bom.length === 0 && (
                <div className="py-6 text-center text-slate-400 text-xs italic">
                  Esta receta no tiene insumos vinculados en su fórmula BOM.
                </div>
              )}
            </div>

            {/* Footer con Costo Total individual */}
            <div className={`p-4 border-t flex items-center justify-between ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Costo Estimado de esta receta</span>
                <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                  {viewingRecipeDetail.resultQuantity} {viewingRecipeDetail.unit} preparados
                </span>
              </div>
              <div className="text-right">
                <span className="text-lg font-mono font-black text-emerald-600 dark:text-emerald-400">
                  S/ {viewingRecipeDetail.bom.reduce((acc, b) => {
                    const ing = ingredients.find(i => i.id === b.ingredientId);
                    const qtyMultiplier = viewingRecipeDetail.resultQuantity || viewingRecipeDetail.estimatedQuantity || 1;
                    return acc + (b.quantity * qtyMultiplier * (ing?.costPerUnit || 0));
                  }, 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
