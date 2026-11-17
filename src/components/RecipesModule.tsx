import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  TrendingUp,
  Percent,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  Layers,
  Sparkles,
  Search,
  Edit3,
  Filter
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Product, BomItem, QuickModifier, FlavorSlotConfig, ServingOptionConfig } from '../types';
import { SearchableSelect, type SearchableOption } from './SearchableSelect';

export const RecipesModule: React.FC = () => {
  const {
    menuConfig,
    ingredients,
    ingredientCategories,
    addNewProductRecipe,
    updateProductRecipe,
    addRecipeCategory,
    themeMode,
    toppingsMaster
  } = useApp();
  const isLight = themeMode === 'light';

  // Insumos ordenados alfabéticamente A-Z para el BOM
  const sortedIngredients = useMemo(() => {
    return [...ingredients].sort((a, b) =>
      a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
    );
  }, [ingredients]);

  // Opciones de insumos para SearchableSelect (con código, unidad y costo)
  const ingredientOptions: SearchableOption[] = useMemo(() => {
    return sortedIngredients.map(ing => ({
      id: ing.id,
      code: ing.code,
      label: ing.name,
      subtitle: `S/ ${ing.costPerUnit.toFixed(2)} / ${ing.unit}`,
      badge: `${ing.unit}`,
      category: ing.category
    }));
  }, [sortedIngredients]);

  // Opciones de toppings maestros para SearchableSelect
  const toppingOptions: SearchableOption[] = useMemo(() => {
    return toppingsMaster.map(tm => {
      const linkedIng = ingredients.find(i => i.id === tm.ingredientId);
      return {
        id: tm.id,
        code: 'TOP',
        label: tm.name,
        subtitle: `${tm.portionQuantity} ${tm.portionUnit} de ${linkedIng?.name || tm.ingredientId}`,
        badge: `+ S/ ${tm.defaultPriceDelta.toFixed(2)}`
      };
    });
  }, [toppingsMaster, ingredients]);

  // Todas las recetas activas del catálogo (incluye recetas de carta y subrecetas pre-elaboradas)
  const allProducts = menuConfig.lines.flatMap(l =>
    l.categories.flatMap(c =>
      c.products.map(p => ({
        ...p,
        lineId: l.id,
        categoryId: c.id,
        categoryName: c.name,
        isActive: p.isActive !== false
      }))
    )
  );

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'final' | 'base'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedProductId, setSelectedProductId] = useState<string>(allProducts[0]?.id || '');

  // Nueva Categoría de Receta
  const [showAddCatModal, setShowAddCatModal] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState<string>('');
  const [newCatLine, setNewCatLine] = useState<'linea-fria' | 'linea-caliente'>('linea-fria');

  // Modal para Crear Nueva Receta
  const [showNewRecipeModal, setShowNewRecipeModal] = useState<boolean>(false);
  const [newProductName, setNewProductName] = useState<string>('');
  const [newProductShortName, setNewProductShortName] = useState<string>('');
  const [newProductSku, setNewProductSku] = useState<string>('');
  const [newProductLine, setNewProductLine] = useState<string>(menuConfig.lines[0]?.id || 'linea-fria');
  const [newProductCategoryId, setNewProductCategoryId] = useState<string>(
    menuConfig.lines[0]?.categories[0]?.id || ''
  );
  const [newProductPrice, setNewProductPrice] = useState<string>('12.00');
  const [newProductType, setNewProductType] = useState<'final' | 'intermedia' | 'base'>('final');
  const [newProductYieldUnit, setNewProductYieldUnit] = useState<'kg' | 'L' | 'und'>('kg');
  const [newBomItems, setNewBomItems] = useState<BomItem[]>([]);
  const [newFlavorSlots, setNewFlavorSlots] = useState<FlavorSlotConfig[]>([]);
  const [newServingOptions, setNewServingOptions] = useState<ServingOptionConfig[]>([]);

  // Modal para Editar Receta Existente
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editProductName, setEditProductName] = useState<string>('');
  const [editProductShortName, setEditProductShortName] = useState<string>('');
  const [editProductPrice, setEditProductPrice] = useState<string>('');
  const [editProductDescription, setEditProductDescription] = useState<string>('');
  const [editBomItems, setEditBomItems] = useState<BomItem[]>([]);
  const [editFlavorSlots, setEditFlavorSlots] = useState<FlavorSlotConfig[]>([]);
  const [editServingOptions, setEditServingOptions] = useState<ServingOptionConfig[]>([]);
  const [editQuickModifiers, setEditQuickModifiers] = useState<QuickModifier[]>([]);
  const [newModLabel, setNewModLabel] = useState<string>('');
  const [newModPriceDelta, setNewModPriceDelta] = useState<string>('1.50');
  const [editTempIngId, setEditTempIngId] = useState<string>(ingredients[0]?.id || '');
  const [editTempQty, setEditTempQty] = useState<string>('0.100');
  const [selectedToppingId, setSelectedToppingId] = useState<string>(toppingsMaster[0]?.id || '');

  // Selector para añadir insumo a la nueva receta
  const [tempIngId, setTempIngId] = useState<string>(ingredients[0]?.id || '');
  const [tempQty, setTempQty] = useState<string>('0.150');

  // Función para autogenerar correlativo secuencial de SKU
  const generateNextSku = (type: 'final' | 'intermedia' | 'base', line: string) => {
    if (type === 'base' || type === 'intermedia') {
      const subList = allProducts.filter(p => p.sku.startsWith('SUB-'));
      const maxNum = subList.reduce((max, p) => {
        const num = parseInt(p.sku.replace('SUB-', ''), 10);
        return !isNaN(num) && num > max ? num : max;
      }, 0);
      return `SUB-${String(maxNum + 1).padStart(3, '0')}`;
    }
    const prefix = line === 'linea-fria' ? 'JUG' : line === 'linea-caliente' ? 'SAN' : 'REC';
    const list = allProducts.filter(p => p.sku.startsWith(prefix + '-'));
    const maxNum = list.reduce((max, p) => {
      const num = parseInt(p.sku.replace(prefix + '-', ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    return `${prefix}-${String(maxNum + 1).padStart(2, '0')}`;
  };

  // Toggle de activación / inactivación de receta
  const handleToggleProductActive = (prod: Product) => {
    const updated: Product = {
      ...prod,
      isActive: prod.isActive === false ? true : false
    };
    updateProductRecipe(updated);
  };

  // Insumos elegibles para ranuras de helados o lácteos
  const iceCreamIngredients = useMemo(() => {
    return ingredients.filter(i =>
      i.name.toLowerCase().includes('helado') ||
      i.category?.toLowerCase() === 'lacteos' ||
      i.category?.toLowerCase() === 'helados'
    );
  }, [ingredients]);

  // Calcular el costo BOM total de cualquier receta
  const calculateBomCost = (bomItems: BomItem[]) => {
    return bomItems.reduce((acc, bom) => {
      const ing = ingredients.find(i => i.id === bom.ingredientId);
      return acc + (ing ? ing.costPerUnit * bom.quantity : 0);
    }, 0);
  };

  // Categorías de insumos disponibles para vincular a los slots dinámicos (FILTRADAS EXCLUSIVAMENTE POR isSlotCategory === true)
  const availableIngredientCategories = useMemo(() => {
    const slotCats = (ingredientCategories || []).filter(c => c.isSlotCategory);
    const activeCats = slotCats.length > 0
      ? slotCats
      : (ingredientCategories || []).filter(c => ['helados', 'panaderia', 'jarabes_bases'].includes(c.id));

    return activeCats.map(c => ({
      id: c.id,
      label: `${c.icon || '🏷️'} ${c.label}`,
      defaultUnit: c.defaultUnit || 'und',
      defaultQty: Number(c.defaultQty) || 1
    }));
  }, [ingredientCategories]);

  // Calcular el costo proyectado individual de un slot según los insumos permitidos o su categoría
  const calculateSlotCost = (slot: FlavorSlotConfig) => {
    let allowed: typeof ingredients = [];
    if (slot.allowedIngredientIds && slot.allowedIngredientIds.length > 0) {
      allowed = ingredients.filter(i => slot.allowedIngredientIds!.includes(i.id));
    } else if (slot.category && slot.category !== 'todas') {
      allowed = ingredients.filter(i => i.category === slot.category);
    } else {
      allowed = ingredients.filter(i => i.category === 'helados');
    }
    const avg = allowed.length > 0
      ? allowed.reduce((sum, ing) => sum + ing.costPerUnit, 0) / allowed.length
      : (slot.unit === 'und' ? 0.50 : 11.0);
    return Number((avg * slot.quantity).toFixed(2));
  };

  // Costo proyectado total de ranuras de sabores variables
  const calculateSlotsCost = (slots: FlavorSlotConfig[] = []) => {
    return slots.reduce((acc, slot) => acc + calculateSlotCost(slot), 0);
  };

  // Categorías completas del menú (con iconos y pertenencia a línea)
  const menuCategories = useMemo(() => {
    const list: { id: string; name: string; lineId: string; icon: string }[] = [];
    menuConfig.lines.forEach(l => {
      l.categories.forEach(c => {
        list.push({
          id: c.id,
          name: c.name,
          lineId: l.id,
          icon: c.icon || (l.id === 'linea-fria' ? '🥤' : '🥪')
        });
      });
    });
    return list;
  }, [menuConfig]);

  const getRecipeCategoryCount = (catId: string) => {
    if (catId === 'all') return allProducts.length;
    if (catId === 'base') {
      return allProducts.filter(p => p.recipeType === 'base' || p.recipeType === 'intermedia' || p.sku.startsWith('SUB-')).length;
    }
    return allProducts.filter(p => p.categoryId === catId).length;
  };

  // Filtrado de recetas
  const filteredProducts = allProducts.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const isBase = p.recipeType === 'base' || p.recipeType === 'intermedia' || p.sku.startsWith('SUB-');

    let matchesCategory = true;
    if (filterCategory === 'all') {
      matchesCategory = true;
    } else if (filterCategory === 'base') {
      matchesCategory = isBase;
    } else {
      matchesCategory = p.categoryId === filterCategory;
    }

    return matchesSearch && matchesCategory;
  });

  const selectedProduct = allProducts.find(p => p.id === selectedProductId) || filteredProducts[0] || allProducts[0];

  // Separación técnica: Insumos Comestibles (Salón) vs Descartables Asociados (Llevar)
  const edibleBomItems = selectedProduct
    ? selectedProduct.recipeBom.filter(b => {
        const ing = ingredients.find(i => i.id === b.ingredientId);
        return !b.isDisposable && ing?.itemType !== 'descartable';
      })
    : [];

  const disposableBomItems = selectedProduct
    ? selectedProduct.recipeBom.filter(b => {
        const ing = ingredients.find(i => i.id === b.ingredientId);
        return b.isDisposable || ing?.itemType === 'descartable';
      })
    : [];

  const slotsCost = calculateSlotsCost(selectedProduct?.flavorSlots || []);
  const edibleCost = calculateBomCost(edibleBomItems) + slotsCost;
  const disposablesCost = calculateBomCost(disposableBomItems);
  const totalBOMCost = edibleCost + disposablesCost;

  // Food Cost Real de Salón (Solo comestibles sobre precio de carta)
  const currentFoodCostPercent =
    selectedProduct && selectedProduct.price > 0
      ? Number(((edibleCost / selectedProduct.price) * 100).toFixed(1))
      : 0;

  // Precio Sugerido Comercial (Meta óptima 30% FC)
  const suggestedMinPrice30 = edibleCost > 0 ? Number((edibleCost / 0.30).toFixed(2)) : 0;
  // Precio Piso de Quiebre (Techo máximo 45% FC)
  const floorPrice45 = edibleCost > 0 ? Number((edibleCost / 0.45).toFixed(2)) : 0;

  // Iniciar edición de receta existente
  const openEditModal = (prod: Product) => {
    setEditProductName(prod.name);
    setEditProductShortName(prod.shortName || prod.name);
    setEditProductPrice(prod.price.toString());
    setEditProductDescription(prod.description || '');
    setEditBomItems([...prod.recipeBom]);
    setEditFlavorSlots(prod.flavorSlots ? [...prod.flavorSlots] : []);
    setEditServingOptions(prod.servingOptions ? [...prod.servingOptions] : []);
    setEditQuickModifiers(prod.quickModifiers ? [...prod.quickModifiers] : []);
    setShowEditModal(true);
  };

  const handleAddEditBomItem = () => {
    const qty = parseFloat(editTempQty) || 0;
    if (qty <= 0) return;
    const ing = ingredients.find(i => i.id === editTempIngId);
    if (!ing) return;

    setEditBomItems(prev => [
      ...prev,
      {
        ingredientId: ing.id,
        quantity: qty,
        unit: ing.unit,
        isDisposable: ing.itemType === 'descartable'
      }
    ]);
    setEditTempQty('0.100');
  };

  const handleRemoveEditBomItem = (index: number) => {
    setEditBomItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveEditedRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !editProductName.trim() || (editBomItems.length === 0 && editFlavorSlots.length === 0)) return;

    const newEdibleItems = editBomItems.filter(b => {
      const ing = ingredients.find(i => i.id === b.ingredientId);
      return !b.isDisposable && ing?.itemType !== 'descartable';
    });
    const editSlotsCost = calculateSlotsCost(editFlavorSlots);
    const newCost = calculateBomCost(newEdibleItems) + editSlotsCost;
    const updatedProd: Product = {
      ...selectedProduct,
      name: editProductName.trim(),
      shortName: editProductShortName.trim() || editProductName.trim(),
      description: editProductDescription.trim(),
      price: parseFloat(editProductPrice) || selectedProduct.price,
      targetCost: newCost,
      quickModifiers: editQuickModifiers,
      recipeBom: editBomItems,
      flavorSlots: editFlavorSlots.length > 0 ? editFlavorSlots : undefined,
      servingOptions: editServingOptions.length > 0 ? editServingOptions : undefined
    };

    updateProductRecipe(updatedProd);
    setShowEditModal(false);
  };

  // Añadir insumo temporal al constructor de receta
  const handleAddBomItem = () => {
    const qty = parseFloat(tempQty) || 0;
    if (qty <= 0) return;
    const ing = ingredients.find(i => i.id === tempIngId);
    if (!ing) return;

    setNewBomItems(prev => [
      ...prev,
      {
        ingredientId: ing.id,
        quantity: qty,
        unit: ing.unit,
        isDisposable: ing.itemType === 'descartable'
      }
    ]);
    setTempQty('0.100');
  };

  const handleRemoveBomItem = (index: number) => {
    setNewBomItems(prev => prev.filter((_, i) => i !== index));
  };

  const newRecipeEdibleItems = newBomItems.filter(b => {
    const ing = ingredients.find(i => i.id === b.ingredientId);
    return !b.isDisposable && ing?.itemType !== 'descartable';
  });
  const newRecipeSlotsCost = calculateSlotsCost(newFlavorSlots);
  const newRecipeEdibleCost = calculateBomCost(newRecipeEdibleItems) + newRecipeSlotsCost;
  const newRecipeCost = calculateBomCost(newBomItems) + newRecipeSlotsCost;
  const newRecipeSuggestedPrice30 = newRecipeEdibleCost > 0 ? Number((newRecipeEdibleCost / 0.30).toFixed(2)) : 0;
  const newRecipeFloorPrice45 = newRecipeEdibleCost > 0 ? Number((newRecipeEdibleCost / 0.45).toFixed(2)) : 0;

  // Abrir modal de nueva receta preconfigurando SKU secuencial
  const handleOpenNewRecipeModal = () => {
    setNewProductSku(generateNextSku('final', 'linea-fria'));
    setNewProductName('');
    setNewProductShortName('');
    setNewProductPrice('12.00');
    setNewProductType('final');
    setNewBomItems([]);
    setNewFlavorSlots([]);
    setNewServingOptions([]);
    setShowNewRecipeModal(true);
  };

  // Guardar nueva receta y añadirla al menú
  const handleSaveRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim() || (newBomItems.length === 0 && newFlavorSlots.length === 0)) return;

    const isSub = newProductType === 'base' || newProductType === 'intermedia';
    const finalSku = newProductSku.trim() || generateNextSku(newProductType, newProductLine);

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      sku: finalSku,
      name: newProductName.trim(),
      shortName: newProductShortName.trim() || newProductName.trim(),
      price: isSub ? 0 : (parseFloat(newProductPrice) || newRecipeSuggestedPrice30),
      targetCost: newRecipeEdibleCost,
      category: isSub ? 'cat-subrecetas-base' : newProductCategoryId,
      recipeType: newProductType,
      yieldUnit: isSub ? newProductYieldUnit : undefined,
      isActive: true,
      ui: {
        color: isSub ? 'purple' : newProductLine === 'linea-fria' ? 'cyan' : 'rose',
        bgClass: isSub
          ? 'bg-purple-500/10 hover:bg-purple-500/20'
          : newProductLine === 'linea-fria'
          ? 'bg-gradient-to-br from-cyan-500/20 to-blue-600/30'
          : 'bg-gradient-to-br from-rose-600/25 to-red-700/30',
        borderClass: isSub
          ? 'border-purple-500/40'
          : newProductLine === 'linea-fria' ? 'border-cyan-500/40' : 'border-rose-600/50',
        textClass: isSub ? 'text-purple-300' : newProductLine === 'linea-fria' ? 'text-cyan-100' : 'text-rose-100'
      },
      quickModifiers: isSub ? [] : [
        { id: 'm-sin-azucar', label: 'Sin Azúcar', priceDelta: 0 },
        { id: 'm-llevar', label: 'Para Llevar', priceDelta: 0.5 }
      ],
      recipeBom: newBomItems,
      flavorSlots: newFlavorSlots.length > 0 ? newFlavorSlots : undefined,
      servingOptions: newServingOptions.length > 0 ? newServingOptions : undefined
    };

    addNewProductRecipe(newProd, isSub ? 'linea-caliente' : newProductLine, isSub ? 'cat-subrecetas-base' : newProductCategoryId);
    setShowNewRecipeModal(false);
    setSelectedProductId(newProd.id);
  };

  return (
    <div className={`flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'}`}>
      {/* Header */}
      <div className={`flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
        <div>
          <span className={`text-[10px] font-mono uppercase tracking-wider font-bold ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>
            Módulo de Ingeniería de Menú & Recetas
          </span>
          <h2 className="text-xl font-black flex items-center gap-2 mt-0.5">
            <BookOpen className={`w-5 h-5 ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
            <span>Recetas (BOM) & Calculadora de Food Cost (45%)</span>
          </h2>
        </div>

        <button
          onClick={handleOpenNewRecipeModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>CREAR NUEVA RECETA</span>
        </button>
      </div>

      {/* Master-Detail Layout de Recetas (3 Columnas: Categorías a la Izquierda, Catálogo al Centro, Receta Detallada a la Derecha) */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* COLUMNA 1: Panel Lateral de Categorías (Master) */}
        <div className={`w-full lg:w-60 xl:w-64 shrink-0 rounded-3xl border p-4 space-y-3 ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'}`}>
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-amber-500" />
              <span>Categorías</span>
            </h3>
            <button
              onClick={() => setShowAddCatModal(!showAddCatModal)}
              className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-0.5"
            >
              <Plus className="w-3 h-3 stroke-[3]" />
              <span>Nueva</span>
            </button>
          </div>

          {/* Formulario rápido para nueva categoría de receta */}
          {showAddCatModal && (
            <div className={`p-2.5 rounded-2xl border space-y-2 ${isLight ? 'bg-slate-50 border-amber-200' : 'bg-slate-950 border-amber-500/30'}`}>
              <input
                type="text"
                placeholder="Nombre de categoría..."
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded-xl text-xs font-semibold border focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                  isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-900 border-slate-700 text-white'
                }`}
              />
              <select
                value={newCatLine}
                onChange={e => setNewCatLine(e.target.value as any)}
                className={`w-full px-2 py-1 rounded-xl text-xs font-bold border ${
                  isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-900 border-slate-700 text-white'
                }`}
              >
                <option value="linea-fria">🥤 Línea Fría</option>
                <option value="linea-caliente">🥪 Línea Caliente</option>
              </select>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    if (newCatName.trim()) {
                      addRecipeCategory(newCatName.trim(), newCatLine);
                      setNewCatName('');
                      setShowAddCatModal(false);
                    }
                  }}
                  className="flex-1 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-[11px]"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCatModal(false);
                    setNewCatName('');
                  }}
                  className="px-2 py-1 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-[11px]"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Lista Vertical de Categorías de Receta */}
          <div className="space-y-1 max-h-[550px] overflow-y-auto pr-1">
            {[
              { id: 'all', name: 'Todas las Recetas', icon: '🍽️' },
              { id: 'base', name: 'Subrecetas Base', icon: '🥣' },
              ...menuCategories
            ].map(cat => {
              const count = getRecipeCategoryCount(cat.id);
              const isSelected = filterCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setFilterCategory(cat.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all text-left ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                      : isLight
                      ? 'text-slate-700 hover:bg-slate-100'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span>{cat.icon}</span>
                    <span className="truncate">{cat.name}</span>
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold shrink-0 ${
                      isSelected
                        ? 'bg-slate-950/20 text-slate-950'
                        : isLight
                        ? 'bg-slate-200 text-slate-700'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* COLUMNA 2: Lista Filtrada de Recetas (Centro) */}
        <div className={`w-full lg:w-72 xl:w-80 shrink-0 rounded-3xl border p-4 space-y-3 ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'}`}>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar receta o SKU..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-semibold border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                isLight ? 'bg-slate-50 border-slate-300 text-slate-900 shadow-sm placeholder:text-slate-400' : 'bg-slate-950 border-slate-700 text-white placeholder:text-slate-500'
              }`}
            />
          </div>

          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Platos ({filteredProducts.length})
            </span>
          </div>

          <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
            {filteredProducts.map(prod => {
              const bomCost = calculateBomCost(prod.recipeBom);
              const fcPercent = prod.price > 0 ? Number(((bomCost / prod.price) * 100).toFixed(1)) : 0;
              const isSelected = prod.id === selectedProduct?.id;
              const isBase = prod.recipeType === 'base' || prod.recipeType === 'intermedia' || prod.sku.startsWith('SUB-');
              const isProdActive = prod.isActive !== false;

              return (
                <div
                  key={prod.id}
                  onClick={() => setSelectedProductId(prod.id)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? isLight
                        ? 'bg-amber-50 border-amber-500 shadow-md ring-2 ring-amber-500/30'
                        : 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-md ring-1 ring-amber-500'
                      : isLight
                      ? 'bg-slate-50/80 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] font-mono font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{prod.sku}</span>
                        {isBase && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 font-mono font-bold">
                            Subreceta
                          </span>
                        )}
                        {!isProdActive && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-bold">
                            Pausado
                          </span>
                        )}
                      </div>
                      <h4 className={`font-black text-xs truncate mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>{prod.name}</h4>
                    </div>
                    <span className={`font-black text-xs shrink-0 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                      {isBase ? `1 ${prod.yieldUnit || 'kg'}` : `S/ ${prod.price.toFixed(2)}`}
                    </span>
                  </div>

                  <div className={`flex items-center justify-between text-[11px] mt-2 pt-1 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                    <span className={`font-mono text-[10px] ${isLight ? 'text-slate-600 font-semibold' : 'text-slate-400'}`}>Costo: S/ {bomCost.toFixed(2)}</span>
                    {!isBase && (
                      <span
                        className={`font-black text-[10px] px-1.5 py-0.2 rounded ${
                          fcPercent <= 30
                            ? isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/20 text-emerald-400'
                            : fcPercent <= 45
                            ? isLight ? 'bg-amber-100 text-amber-800' : 'bg-amber-500/20 text-amber-400'
                            : isLight ? 'bg-rose-100 text-rose-800' : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        FC: {fcPercent}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUMNA 3: Receta Detallada (Derecha) */}
        {selectedProduct && (
          <div className={`flex-1 min-w-0 rounded-3xl border p-5 sm:p-6 space-y-6 ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'}`}>
            {/* Header del Producto con Botón de Edición y Toggle Activo */}
            <div className={`flex flex-wrap items-start justify-between gap-3 pb-4 border-b ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono font-bold uppercase ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>
                    Receta Oficial (BOM)
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${isLight ? 'bg-slate-100 text-slate-700 border border-slate-200' : 'bg-slate-800 text-slate-300'}`}>
                    {selectedProduct.sku}
                  </span>
                  {(selectedProduct.recipeType === 'base' || selectedProduct.recipeType === 'intermedia' || selectedProduct.sku.startsWith('SUB-')) && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold border border-purple-500/30">
                      Subreceta Pre-elaborada
                    </span>
                  )}
                  {selectedProduct.isActive === false ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/30">
                      Inactiva (Oculta en POS)
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/30">
                      Activa en POS
                    </span>
                  )}
                </div>
                <h3 className={`text-2xl font-black mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>{selectedProduct.name}</h3>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>{selectedProduct.description}</p>
              </div>

              <div className="flex items-center gap-3">
                {selectedProduct.recipeType !== 'base' && !selectedProduct.sku.startsWith('SUB-') ? (
                  <div className="text-right">
                    <span className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Precio Carta</span>
                    <div className={`text-2xl font-black ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                      S/ {selectedProduct.price.toFixed(2)}
                    </div>
                  </div>
                ) : (
                  <div className="text-right">
                    <span className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Rendimiento Batch</span>
                    <div className={`text-xl font-black ${isLight ? 'text-purple-700' : 'text-purple-400'}`}>
                      1.0 {selectedProduct.yieldUnit || 'kg'}
                    </div>
                  </div>
                )}

                {/* Botón Activar / Inactivar Receta */}
                <button
                  type="button"
                  onClick={() => handleToggleProductActive(selectedProduct)}
                  className={`px-3 py-2.5 rounded-2xl text-xs font-black border transition-all active:scale-95 ${
                    selectedProduct.isActive !== false
                      ? isLight
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-rose-500/20 hover:text-rose-300'
                      : isLight
                      ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-emerald-50 hover:text-emerald-800'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-emerald-500/20 hover:text-emerald-300'
                  }`}
                  title={selectedProduct.isActive !== false ? "Pausar receta para que no salga en mesas POS" : "Activar receta para venta en mesas POS"}
                >
                  {selectedProduct.isActive !== false ? '● Activa' : '○ Pausada'}
                </button>

                <button
                  onClick={() => openEditModal(selectedProduct)}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md active:scale-95"
                  title="Editar receta, ingredientes BOM y precio"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>EDITAR RECETA</span>
                </button>
              </div>
            </div>

            {/* Tarjetas de Métricas de Costeo Automático */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                <span className={`text-[10px] font-bold uppercase ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Costo Insumos Salón</span>
                <div className={`text-xl font-black mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>S/ {edibleCost.toFixed(2)}</div>
                <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>Food Cost puro (sin empaque)</span>
              </div>

              <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                <span className={`text-[10px] font-bold uppercase ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Food Cost Real (Salón)</span>
                <div
                  className={`text-xl font-black mt-0.5 ${
                    currentFoodCostPercent <= 30
                      ? isLight ? 'text-emerald-700' : 'text-emerald-400'
                      : currentFoodCostPercent <= 45
                      ? isLight ? 'text-amber-700' : 'text-amber-400'
                      : isLight ? 'text-rose-700' : 'text-rose-400'
                  }`}
                >
                  {selectedProduct.recipeType === 'base' || selectedProduct.sku.startsWith('SUB-') ? 'N/A (Base)' : `${currentFoodCostPercent}%`}
                </div>
                <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>Meta: ≤ 30% | Techo: 45%</span>
              </div>

              <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-amber-50/70 border-amber-200 text-amber-900' : 'bg-amber-500/10 border-amber-500/30'}`}>
                <span className={`text-[10px] font-bold uppercase flex items-center gap-1 ${isLight ? 'text-amber-800' : 'text-amber-300'}`}>
                  <Sparkles className="w-3 h-3" /> Precio Sugerido (30%)
                </span>
                <div className={`text-xl font-black mt-0.5 ${isLight ? 'text-amber-900' : 'text-amber-400'}`}>
                  {selectedProduct.recipeType === 'base' || selectedProduct.sku.startsWith('SUB-') ? 'N/A (Pre-elaborado)' : `S/ ${suggestedMinPrice30.toFixed(2)}`}
                </div>
                <span className={`text-[10px] font-mono ${isLight ? 'text-amber-700/80' : 'text-amber-200/70'}`}>
                  Piso Quiebre (45%): S/ {floorPrice45.toFixed(2)}
                </span>
              </div>

              <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-cyan-50/70 border-cyan-200 text-cyan-900' : 'bg-cyan-500/10 border-cyan-500/30'}`}>
                <span className={`text-[10px] font-bold uppercase flex items-center gap-1 ${isLight ? 'text-cyan-800' : 'text-cyan-300'}`}>
                  🛍️ Descartables Llevar
                </span>
                <div className={`text-xl font-black mt-0.5 ${isLight ? 'text-cyan-900' : 'text-cyan-400'}`}>
                  S/ {disposablesCost.toFixed(2)}
                </div>
                <span className={`text-[10px] font-mono ${isLight ? 'text-cyan-700/80' : 'text-cyan-200/70'}`}>
                  Total Llevar: S/ {totalBOMCost.toFixed(2)}
                </span>
              </div>
            </div>

            {/* SECCIÓN 1: Insumos Comestibles (Receta Base de Salón) */}
            <div className="space-y-2">
              <h4 className={`text-xs font-black uppercase tracking-wider flex items-center justify-between ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                <span className="flex items-center gap-1.5">
                  <span>🍽️</span> Insumos Comestibles (Receta Base de Salón)
                </span>
                <span className={`text-[11px] font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {edibleBomItems.length} insumos | Subtotal: S/ {edibleCost.toFixed(2)}
                </span>
              </h4>

              <div className={`border rounded-2xl overflow-hidden divide-y ${isLight ? 'border-slate-200 divide-slate-200' : 'border-slate-800 divide-slate-800'}`}>
                <div className={`px-4 py-2 text-[11px] font-bold grid grid-cols-12 gap-2 ${isLight ? 'bg-slate-100 text-slate-700 font-extrabold' : 'bg-slate-950/80 text-slate-400'}`}>
                  <span className="col-span-5">Insumo Comestible</span>
                  <span className="col-span-2 text-center">Cantidad</span>
                  <span className="col-span-2 text-right">Costo Unit.</span>
                  <span className="col-span-3 text-right">Costo Parcial</span>
                </div>

                {edibleBomItems.map((bom, idx) => {
                  const ing = ingredients.find(i => i.id === bom.ingredientId);
                  const partialCost = ing ? ing.costPerUnit * bom.quantity : 0;

                  return (
                    <div
                      key={idx}
                      className={`px-4 py-2.5 text-xs grid grid-cols-12 gap-2 items-center transition-colors ${
                        isLight ? 'bg-white hover:bg-slate-50 text-slate-800' : 'bg-slate-950/40 hover:bg-slate-800/30 text-white'
                      }`}
                    >
                      <div className="col-span-5">
                        <div className={`font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          <span>{ing?.name || bom.ingredientId}</span>
                          {(ing?.itemType === 'subreceta' || ing?.isIntermediateRecipe) && (
                            <span className="text-[9px] bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded font-mono font-bold">
                              Subreceta
                            </span>
                          )}
                        </div>
                        <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          Cód: {ing?.code || 'N/A'}
                        </span>
                      </div>

                      <div className={`col-span-2 text-center font-black ${isLight ? 'text-amber-800' : 'text-amber-300'}`}>
                        {bom.quantity} {bom.unit}
                      </div>

                      <div className={`col-span-2 text-right font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        S/ {ing ? ing.costPerUnit.toFixed(2) : '0.00'}/{ing?.unit || bom.unit}
                      </div>

                      <div className={`col-span-3 text-right font-black font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        S/ {partialCost.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECCIÓN INTERMEDIA: Ranuras de Insumo Variable / A Elección (si aplica) */}
            {selectedProduct.flavorSlots && selectedProduct.flavorSlots.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    <span>✨</span> Opciones & Variantes a Elección ({selectedProduct.flavorSlots.length} ranuras)
                  </h4>
                  <span className="text-[11px] font-bold text-cyan-400 font-mono">
                    Costo Proyectado: S/ {slotsCost.toFixed(2)}
                  </span>
                </div>

                <div className={`border rounded-2xl overflow-hidden divide-y ${isLight ? 'border-cyan-200 divide-cyan-100' : 'border-cyan-900/40 divide-cyan-900/30'}`}>
                  {selectedProduct.flavorSlots.map((slot, sIdx) => {
                    const slotCost = calculateSlotCost(slot);
                    return (
                      <div
                        key={sIdx}
                        className={`px-4 py-2.5 text-xs flex items-center justify-between transition-colors ${
                          isLight ? 'bg-white hover:bg-cyan-50/50 text-slate-800' : 'bg-slate-950/40 hover:bg-slate-800/30 text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-[10px]">
                            {slot.slotIndex + 1}
                          </span>
                          <div>
                            <div className="font-bold flex items-center gap-1.5">
                              <span>{slot.label}</span>
                              <span className="text-[9px] bg-cyan-500/15 text-cyan-400 px-1.5 py-0.2 rounded font-mono font-semibold">
                                {slot.category === 'panaderia' ? '🥖 Panadería' : slot.category === 'lacteos' ? '🍨 Helados/Lácteos' : slot.category || 'Variantes'}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Elección obligatoria en la comanda del POS
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-bold text-cyan-400 font-mono">
                            {slot.quantity} {slot.unit}
                          </span>
                          <span className="text-[11px] font-mono text-emerald-400 font-bold">
                            ~S/ {slotCost.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SECCIÓN 2: Descartables Asociados (Para Llevar / Delivery) */}
            <div className="space-y-2 pt-2">
              <h4 className={`text-xs font-black uppercase tracking-wider flex items-center justify-between ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                <span className="flex items-center gap-1.5">
                  <span>🛍️</span> Descartables Asociados (Para Llevar / Delivery)
                </span>
                <span className={`text-[11px] font-semibold ${isLight ? 'text-cyan-800' : 'text-cyan-300'}`}>
                  {disposableBomItems.length} descartables | Costo Empaque: S/ {disposablesCost.toFixed(2)}
                </span>
              </h4>

              {disposableBomItems.length === 0 ? (
                <div className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2 ${isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-900/50 border-slate-800 text-slate-400'}`}>
                  <span>📦</span>
                  <span>Sin descartables específicos asignados. Si el cliente pide para llevar, el sistema usará los descartables estándar por defecto.</span>
                </div>
              ) : (
                <div className={`border rounded-2xl overflow-hidden divide-y ${isLight ? 'border-cyan-200 divide-cyan-100' : 'border-cyan-900/40 divide-cyan-900/30'}`}>
                  <div className={`px-4 py-2 text-[11px] font-bold grid grid-cols-12 gap-2 ${isLight ? 'bg-cyan-50 text-cyan-900 font-extrabold' : 'bg-cyan-950/40 text-cyan-300'}`}>
                    <span className="col-span-5">Empaque / Envase</span>
                    <span className="col-span-2 text-center">Cantidad</span>
                    <span className="col-span-2 text-right">Costo Unit.</span>
                    <span className="col-span-3 text-right">Costo Parcial</span>
                  </div>

                  {disposableBomItems.map((bom, idx) => {
                    const ing = ingredients.find(i => i.id === bom.ingredientId);
                    const partialCost = ing ? ing.costPerUnit * bom.quantity : 0;

                    return (
                      <div
                        key={idx}
                        className={`px-4 py-2.5 text-xs grid grid-cols-12 gap-2 items-center transition-colors ${
                          isLight ? 'bg-white hover:bg-cyan-50/50 text-slate-800' : 'bg-slate-950/40 hover:bg-slate-800/30 text-white'
                        }`}
                      >
                        <div className="col-span-5">
                          <div className={`font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            <span>{ing?.name || bom.ingredientId}</span>
                            <span className="text-[9px] bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 px-1.5 py-0.2 rounded font-mono font-bold">
                              Descartable
                            </span>
                          </div>
                          <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            Cód: {ing?.code || 'N/A'}
                          </span>
                        </div>

                        <div className={`col-span-2 text-center font-black ${isLight ? 'text-cyan-800' : 'text-cyan-300'}`}>
                          {bom.quantity} {bom.unit}
                        </div>

                        <div className={`col-span-2 text-right font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                          S/ {ing ? ing.costPerUnit.toFixed(2) : '0.00'}/{ing?.unit || bom.unit}
                        </div>

                        <div className={`col-span-3 text-right font-black font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          S/ {partialCost.toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SECCIÓN 3: Personalizaciones & Toppings de la Carta (Modificadores) */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  <span>✨</span> Personalizaciones & Toppings de Carta
                </h4>
                <button
                  type="button"
                  onClick={() => openEditModal(selectedProduct)}
                  className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Configurar Toppings</span>
                </button>
              </div>

              {(!selectedProduct.quickModifiers || selectedProduct.quickModifiers.length === 0) ? (
                <div className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between ${isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-950/50 border-slate-800 text-slate-400'}`}>
                  <span>Sin personalizaciones asignadas. Puedes agregar opciones como Sin Azúcar, Chantilly o Helado.</span>
                  <button
                    type="button"
                    onClick={() => openEditModal(selectedProduct)}
                    className="text-amber-500 font-bold text-[11px] hover:underline"
                  >
                    + Añadir Modificadores
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {selectedProduct.quickModifiers.map(mod => {
                    const isSinAzucar = mod.id === 'mod-sin-azucar' || mod.label.toLowerCase().includes('sin azucar') || mod.label.toLowerCase().includes('sin azúcar');
                    return (
                      <div
                        key={mod.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                          isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-white'
                        }`}
                      >
                        <div>
                          <div className="font-bold flex items-center gap-1">
                            <span>{mod.label}</span>
                            {isSinAzucar && (
                              <span className="text-[9px] px-1 rounded bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold border border-cyan-500/30">
                                Anula azúcar
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-mono text-emerald-600 font-bold">
                            {mod.priceDelta > 0 ? `+S/ ${mod.priceDelta.toFixed(2)}` : 'Sin recargo'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SECCIÓN 4: Notas de Preparación / Descripción de Carta */}
            {selectedProduct.description && (
              <div className={`p-3.5 rounded-2xl border text-xs space-y-1 ${isLight ? 'bg-amber-50/50 border-amber-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                  📝 Notas de Preparación & Servicio:
                </span>
                <p className="text-xs leading-relaxed italic">
                  "{selectedProduct.description}"
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= MODAL DE NUEVA RECETA ================= */}
      {showNewRecipeModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-3xl w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-black text-lg text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <span>{newProductType === 'base' || newProductType === 'intermedia' ? 'Crear Subreceta / Pre-elaborado' : 'Crear Nueva Receta / Plato'}</span>
              </h3>
              <button
                onClick={() => setShowNewRecipeModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRecipe} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Tipo de Creación</label>
                  <select
                    value={newProductType}
                    onChange={e => {
                      const val = e.target.value as any;
                      setNewProductType(val);
                      setNewProductSku(generateNextSku(val, newProductLine));
                    }}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-semibold focus:outline-none"
                  >
                    <option value="final">🍽️ Receta Final (Plato en Carta)</option>
                    <option value="base">🥣 Subreceta / Pre-elaborado (Stock)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Código SKU (Secuencial)</label>
                  <input
                    type="text"
                    required
                    value={newProductSku}
                    onChange={e => setNewProductSku(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white font-mono rounded-xl p-2.5 text-xs font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="min-w-0">
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {newProductType === 'base' || newProductType === 'intermedia' ? 'Nombre de la Subreceta' : 'Nombre Completo (Carta / Clientes)'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={newProductType === 'base' || newProductType === 'intermedia' ? 'Ej. Pulpa de Mango Congelada' : 'Ej. Sándwich Mixto Caliente'}
                    value={newProductName}
                    onChange={e => setNewProductName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-bold focus:outline-none"
                  />
                </div>

                {newProductType === 'final' && (
                  <div className="min-w-0">
                    <label className="block text-xs font-bold text-amber-400 mb-1 flex items-center justify-between">
                      <span>Nombre Corto (Comanda / KDS)</span>
                      <span className="text-[10px] text-slate-400 font-normal">Para barra (&lt; 3 min)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Mixto Caliente"
                      value={newProductShortName}
                      onChange={e => setNewProductShortName(e.target.value)}
                      className="w-full bg-slate-950 border border-amber-500/50 text-amber-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none placeholder-amber-400/30"
                    />
                  </div>
                )}
              </div>

              {/* Si es subreceta, NO pedir línea operativa ni precio de carta */}
              {newProductType === 'final' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="min-w-0">
                    <label className="block text-xs font-bold text-slate-300 mb-1">Línea Operativa</label>
                    <select
                      value={newProductLine}
                      onChange={e => {
                        const l = e.target.value;
                        setNewProductLine(l);
                        setNewProductSku(generateNextSku('final', l));
                      }}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-semibold focus:outline-none"
                    >
                      {menuConfig.lines.map(line => (
                        <option key={line.id} value={line.id}>
                          {line.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="min-w-0">
                    <label className="block text-xs font-bold text-slate-300 mb-1">Precio Carta (S/)</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={newProductPrice}
                      onChange={e => setNewProductPrice(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-bold focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-purple-950/30 border border-purple-500/30 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-purple-300">Unidad de Rendimiento del Batch:</span>
                      <p className="text-[11px] text-purple-200/70">
                        Las subrecetas no tienen precio de carta ni línea de despacho; se almacenan en inventario por kg o L.
                      </p>
                    </div>
                    <select
                      value={newProductYieldUnit}
                      onChange={e => setNewProductYieldUnit(e.target.value as any)}
                      className="bg-purple-900 border border-purple-500 text-white rounded-xl px-3 py-1.5 text-xs font-bold"
                    >
                      <option value="kg">Kilos (kg)</option>
                      <option value="L">Litros (L)</option>
                      <option value="und">Unidades (und)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Constructor de Insumos BOM con layout anti-desborde y autocompletado */}
              <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2.5">
                <label className="block text-xs font-bold text-amber-300">
                  Agregar Insumos o Subrecetas Componentes (BOM) — Búsqueda Inteligente
                </label>
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                  <div className="flex-1 min-w-0">
                    <SearchableSelect
                      options={ingredientOptions}
                      value={tempIngId}
                      onChange={setTempIngId}
                      placeholder="Escribe para buscar insumo o subreceta..."
                      searchPlaceholder="Buscar por nombre, código o categoría..."
                      isLight={isLight}
                    />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="number"
                      step="any"
                      placeholder="Cant."
                      value={tempQty}
                      onChange={e => setTempQty(e.target.value)}
                      className="w-20 bg-slate-900 border border-slate-700 text-white font-bold rounded-xl p-2 text-xs focus:outline-none text-center"
                    />

                    <button
                      type="button"
                      onClick={handleAddBomItem}
                      className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs whitespace-nowrap active:scale-95 shadow transition-all"
                    >
                      + Añadir
                    </button>
                  </div>
                </div>

                {/* Lista de Insumos Añadidos */}
                <div className="space-y-1 mt-2 h-auto">
                  {newBomItems.map((b, i) => {
                    const ing = ingredients.find(ing => ing.id === b.ingredientId);
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded-lg text-xs"
                      >
                        <span className="text-white font-medium">
                          {ing?.name} ({b.quantity} {b.unit})
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 font-mono">
                            S/ {((ing?.costPerUnit || 0) * b.quantity).toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveBomItem(i)}
                            className="text-rose-400 hover:text-rose-300"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECCIÓN OPCIONAL: Ranuras de Insumo Variable / A Elección del Cliente (Panes, Helados, Leches, Jarabes, etc.) */}
              {newProductType === 'final' && (
                <div className="p-3.5 bg-cyan-950/30 border border-cyan-500/30 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-cyan-300 flex items-center gap-1.5">
                        <span>✨</span> Ranuras de Insumo Variable / A Elección (Panes, Helados, Leches, etc.)
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Configura qué opciones elegirá el mesero al tomar el pedido (ej. Tipo de Pan, Bola de Helado, Sabor de Jarabe).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const nextIdx = newFlavorSlots.length;
                        const defaultCat = availableIngredientCategories[0]?.id || 'helados';
                        const catConfig = availableIngredientCategories[0] || { label: 'Opción a Elección', defaultQty: 1, defaultUnit: 'und' };
                        const defaultAllowed = defaultCat ? ingredients.filter(i => i.category === defaultCat).map(i => i.id) : [];

                        setNewFlavorSlots(prev => [
                          ...prev,
                          {
                            slotIndex: nextIdx,
                            label: `Opción ${nextIdx + 1} (${catConfig.label || 'Elección'})`,
                            category: defaultCat,
                            quantity: catConfig.defaultQty || 1,
                            unit: (catConfig.defaultUnit as any) || 'und',
                            required: true,
                            allowedIngredientIds: defaultAllowed.length > 0 ? defaultAllowed : undefined
                          }
                        ]);
                      }}
                      className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 shadow transition-all active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Añadir Opción Variable</span>
                    </button>
                  </div>

                  {newFlavorSlots.length > 0 && (
                    <div className="space-y-3 pt-1">
                      {newFlavorSlots.map((slot, sIdx) => {
                        const slotCost = calculateSlotCost(slot);
                        const currentCat = slot.category || 'todas';
                        const categoryIngredients = currentCat === 'todas'
                          ? ingredients
                          : ingredients.filter(i => i.category === currentCat);

                        return (
                          <div key={sIdx} className="bg-slate-900 border border-cyan-500/20 rounded-xl p-3 space-y-2.5 text-xs">
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                              {/* Nombre de la Ranura */}
                              <div className="flex items-center gap-2 flex-1">
                                <span className="font-bold text-cyan-400 shrink-0">Opción {sIdx + 1}:</span>
                                <input
                                  type="text"
                                  value={slot.label}
                                  onChange={e => {
                                    const val = e.target.value;
                                    setNewFlavorSlots(prev => prev.map((s, i) => i === sIdx ? { ...s, label: val } : s));
                                  }}
                                  className="bg-slate-950 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs font-semibold flex-1 focus:border-cyan-500 focus:outline-none"
                                  placeholder="Ej. Tipo de Pan, Bola 1, Tipo de Leche"
                                />
                              </div>

                              {/* Selector de Categoría Vinculada */}
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-400 shrink-0">Categoría:</span>
                                <select
                                  value={currentCat}
                                  onChange={e => {
                                    const newCat = e.target.value;
                                    const catConf = availableIngredientCategories.find(c => c.id === newCat);
                                    const allowed = newCat === 'todas'
                                      ? undefined
                                      : ingredients.filter(i => i.category === newCat).map(i => i.id);

                                    setNewFlavorSlots(prev => prev.map((s, i) => {
                                      if (i !== sIdx) return s;
                                      return {
                                        ...s,
                                        category: newCat,
                                        quantity: catConf?.defaultQty || s.quantity,
                                        unit: (catConf?.defaultUnit as any) || s.unit,
                                        label: s.label.startsWith('Opción') ? `Opción ${sIdx + 1} (${catConf?.label || 'Elección'})` : s.label,
                                        allowedIngredientIds: allowed && allowed.length > 0 ? allowed : undefined
                                      };
                                    }));
                                  }}
                                  className="bg-slate-950 border border-slate-700 text-cyan-300 font-bold rounded-lg px-2 py-1 text-xs focus:border-cyan-500 focus:outline-none"
                                >
                                  {availableIngredientCategories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                      {cat.label}
                                    </option>
                                  ))}
                                </select>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setNewFlavorSlots(prev => prev.filter((_, i) => i !== sIdx).map((s, idx) => ({ ...s, slotIndex: idx })));
                                  }}
                                  className="text-rose-400 hover:text-rose-300 font-bold px-2 py-1 hover:bg-rose-500/10 rounded"
                                  title="Eliminar ranura"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>

                            {/* Porción, Unidad y Resumen de Opciones */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-[11px]">
                              <div className="flex items-center gap-2">
                                <span className="text-slate-400">Porción descontada:</span>
                                <input
                                  type="number"
                                  step="any"
                                  value={slot.quantity}
                                  onChange={e => {
                                    const val = parseFloat(e.target.value) || 0;
                                    setNewFlavorSlots(prev => prev.map((s, i) => i === sIdx ? { ...s, quantity: val } : s));
                                  }}
                                  className="w-16 bg-slate-950 border border-slate-700 text-white rounded-lg px-2 py-0.5 text-xs text-center font-bold"
                                />
                                <select
                                  value={slot.unit}
                                  onChange={e => {
                                    const u = e.target.value as any;
                                    setNewFlavorSlots(prev => prev.map((s, i) => i === sIdx ? { ...s, unit: u } : s));
                                  }}
                                  className="bg-slate-950 border border-slate-700 text-amber-400 font-mono rounded-lg px-1.5 py-0.5 text-xs font-bold"
                                >
                                  <option value="und">und</option>
                                  <option value="L">L</option>
                                  <option value="kg">kg</option>
                                  <option value="ml">ml</option>
                                  <option value="g">g</option>
                                </select>
                                <span className="text-emerald-400 font-mono font-bold">
                                  ~S/ {slotCost.toFixed(2)} / porción
                                </span>
                              </div>

                              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                <span className="text-cyan-400 font-bold">
                                  {categoryIngredients.length} insumos elegibles:
                                </span>
                                <span className="truncate max-w-[200px] text-slate-300">
                                  {categoryIngredients.map(i => i.name.replace(/^(Helado |Pan )/i, '')).slice(0, 3).join(', ')}
                                  {categoryIngredients.length > 3 ? '...' : ''}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Calculadora en vivo del Precio Sugerido */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400">Costo Comestible (Salón):</span>
                  <div className="font-black text-white text-sm">S/ {newRecipeEdibleCost.toFixed(2)}</div>
                  <span className="text-[10px] text-slate-500">Total con empaques: S/ {newRecipeCost.toFixed(2)}</span>
                </div>

                <div className="text-right">
                  <span className="text-amber-300 font-bold">Precio Sugerido (30% FC):</span>
                  <div className="font-black text-amber-400 text-lg">S/ {newRecipeSuggestedPrice30.toFixed(2)}</div>
                  <span className="text-[10px] text-slate-400 font-mono">Piso 45%: S/ {newRecipeFloorPrice45.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewRecipeModal(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newProductName.trim() || (newBomItems.length === 0 && newFlavorSlots.length === 0)}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/20"
                >
                  GUARDAR & PUBLICAR RECETA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL DE EDICIÓN DE RECETA EXISTENTE ================= */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-3xl w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-black text-lg text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <span>Editar Receta: {selectedProduct.name}</span>
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditedRecipe} className="space-y-4">
              {/* Nombres y Precios en Cuadrícula Responsiva de 2 Columnas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="min-w-0">
                  <label className="block text-xs font-bold text-slate-300 mb-1">Nombre Completo (Carta / Clientes)</label>
                  <input
                    type="text"
                    required
                    value={editProductName}
                    onChange={e => setEditProductName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="min-w-0">
                  <label className="block text-xs font-bold text-amber-400 mb-1 flex items-center justify-between">
                    <span>Nombre Corto (Comanda / KDS)</span>
                    <span className="text-[10px] text-slate-400 font-normal">Para barra (&lt; 3 min)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Mixto Caliente"
                    value={editProductShortName}
                    onChange={e => setEditProductShortName(e.target.value)}
                    className="w-full bg-slate-950 border border-amber-500/50 text-amber-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none placeholder-amber-400/30"
                  />
                </div>

                <div className="min-w-0">
                  <label className="block text-xs font-bold text-slate-300 mb-1">Precio Carta (S/)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editProductPrice}
                    onChange={e => setEditProductPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="min-w-0 flex flex-col justify-end">
                  <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">SKU Operativo:</span>
                    <span className="font-mono font-bold text-amber-400">{selectedProduct.sku}</span>
                  </div>
                </div>
              </div>

              {/* Notas de Preparación & Descripción de Carta */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Notas de Preparación / Descripción de Carta (Opcional)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Instrucciones para barra o detalle en carta</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Licuar a velocidad media. Servir con sorbete de papel y rodaja de limón..."
                  value={editProductDescription}
                  onChange={e => setEditProductDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              {/* SECCIÓN DE PERSONALIZACIONES & TOPPINGS (MODIFICADORES) */}
              <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <span>✨</span> Personalizaciones Base & Toppings Maestros
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Personalizaciones de preparación (ej. Sin Azúcar) y Toppings con descuento estricto de inventario.
                    </p>
                  </div>
                </div>

                {/* 1. PERSONALIZACIONES BASE (Modificadores de preparación) */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    1. Modificadores Base de Preparación:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'mod-sin-azucar', label: 'Sin Azúcar', priceDelta: 0, cancelsSugar: true },
                      { id: 'mod-poco-dulce', label: 'Poco Dulce', priceDelta: 0 },
                      { id: 'mod-al-tiempo', label: 'Al Tiempo', priceDelta: 0 },
                      { id: 'mod-con-hielo', label: 'Bien Helado', priceDelta: 0 },
                    ].map(preset => {
                      const alreadyAdded = editQuickModifiers.some(m => m.id === preset.id || m.label.toLowerCase() === preset.label.toLowerCase());
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          disabled={alreadyAdded}
                          onClick={() => {
                            if (!alreadyAdded) {
                              setEditQuickModifiers(prev => [
                                ...prev,
                                {
                                  id: preset.id,
                                  label: preset.label,
                                  priceDelta: preset.priceDelta
                                }
                              ]);
                            }
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1 ${
                            alreadyAdded
                              ? 'bg-slate-800/50 border-slate-800 text-slate-500 cursor-not-allowed'
                              : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-amber-500 hover:text-amber-300 active:scale-95'
                          }`}
                        >
                          <span>+</span>
                          <span>{preset.label}</span>
                          {preset.cancelsSugar && <span className="text-[9px] text-cyan-400 font-mono">[Anula azúcar]</span>}
                        </button>
                      );
                    })}
                  </div>

                  {/* Instrucción personalizada libre (S/ 0.00) */}
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Otra instrucción base (ej. Sin sorbete, Poco hielo, Tibio)..."
                      value={newModLabel}
                      onChange={e => setNewModLabel(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      disabled={!newModLabel.trim()}
                      onClick={() => {
                        if (newModLabel.trim()) {
                          setEditQuickModifiers(prev => [
                            ...prev,
                            {
                              id: `mod-custom-${Date.now()}`,
                              label: newModLabel.trim(),
                              priceDelta: 0
                            }
                          ]);
                          setNewModLabel('');
                        }
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-bold rounded-xl text-xs whitespace-nowrap active:scale-95"
                    >
                      + Añadir Base
                    </button>
                  </div>
                </div>

                {/* 2. TOPPINGS MAESTROS OFICIALES (Vinculados a Insumos / Subrecetas) */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                      2. Toppings Maestros (Descuentan Inventario por Porción):
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Solo desde Catálogo Maestro
                    </span>
                  </div>

                  {toppingsMaster.length === 0 ? (
                    <div className="p-2 bg-slate-900 rounded-xl text-center text-xs text-slate-400">
                      No hay toppings registrados en el Catálogo Maestro de Toppings.
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                      <div className="flex-1 min-w-0">
                        <SearchableSelect
                          options={toppingOptions}
                          value={selectedToppingId}
                          onChange={setSelectedToppingId}
                          placeholder="Buscar topping por nombre o porción..."
                          searchPlaceholder="Escribe: leche deslactosada, chantilly, fudge..."
                          isLight={isLight}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const tm = toppingsMaster.find(t => t.id === selectedToppingId) || toppingsMaster[0];
                          if (tm) {
                            const alreadyAdded = editQuickModifiers.some(
                              m => m.toppingMasterId === tm.id || m.label.toLowerCase() === `+ ${tm.name.toLowerCase()}`
                            );
                            if (!alreadyAdded) {
                              setEditQuickModifiers(prev => [
                                ...prev,
                                {
                                  id: `mod-top-${tm.id}`,
                                  label: `+ ${tm.name}`,
                                  priceDelta: tm.defaultPriceDelta,
                                  toppingMasterId: tm.id,
                                  ingredientId: tm.ingredientId,
                                  quantity: tm.portionQuantity,
                                  unit: tm.portionUnit
                                }
                              ]);
                            }
                          }
                        }}
                        className="shrink-0 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-xs whitespace-nowrap active:scale-95 shadow transition-all flex items-center justify-center gap-1"
                      >
                        <span>+ Añadir Topping</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. LISTA DE MODIFICADORES ASIGNADOS */}
                <div className="space-y-1.5 h-auto pr-1 pt-1 border-t border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Modificadores Asignados ({editQuickModifiers.length}):
                  </span>
                  {editQuickModifiers.length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic py-1">
                      No hay modificadores ni toppings asignados a esta receta.
                    </p>
                  ) : (
                    editQuickModifiers.map((mod, idx) => {
                      const isSinAzucar = mod.id === 'mod-sin-azucar' || mod.label.toLowerCase().includes('sin azucar') || mod.label.toLowerCase().includes('sin azúcar');
                      const linkedIng = mod.ingredientId ? ingredients.find(i => i.id === mod.ingredientId) : undefined;
                      const hasPortion = Boolean(mod.quantity && mod.quantity > 0);

                      return (
                        <div
                          key={mod.id || idx}
                          className="flex items-center justify-between bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs"
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white">{mod.label}</span>
                            {isSinAzucar && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30">
                                🚫 Anula consumo de azúcar en almacén
                              </span>
                            )}
                            {hasPortion && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 font-mono">
                                📦 Descuenta: {mod.quantity} {mod.unit || linkedIng?.unit} de {linkedIng?.name || 'almacén'}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="font-mono text-emerald-400 font-bold">
                              {mod.priceDelta > 0 ? `+ S/ ${mod.priceDelta.toFixed(2)}` : 'S/ 0.00'}
                            </span>
                            <button
                              type="button"
                              onClick={() => setEditQuickModifiers(prev => prev.filter((_, i) => i !== idx))}
                              className="text-rose-400 hover:text-rose-300 font-bold px-1"
                              title="Quitar modificador"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Insumos BOM de la Receta */}
              <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
                <label className="block text-xs font-bold text-amber-300">
                  Composición de Insumos & Descartables (BOM) — Búsqueda Inteligente
                </label>
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                  <div className="flex-1 min-w-0">
                    <SearchableSelect
                      options={ingredientOptions}
                      value={editTempIngId}
                      onChange={setEditTempIngId}
                      placeholder="Escribe para buscar insumo o subreceta..."
                      searchPlaceholder="Buscar: fresa, leche, cmc, base..."
                      isLight={isLight}
                    />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="number"
                      step="any"
                      placeholder="Cant."
                      value={editTempQty}
                      onChange={e => setEditTempQty(e.target.value)}
                      className="w-24 bg-slate-900 border border-slate-700 text-white font-bold rounded-xl p-2 text-xs focus:outline-none text-center"
                    />

                    <button
                      type="button"
                      onClick={handleAddEditBomItem}
                      className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs whitespace-nowrap active:scale-95 shadow transition-all"
                    >
                      + Añadir
                    </button>
                  </div>
                </div>

                {/* Lista de Insumos en la Edición */}
                <div className="space-y-1.5 mt-2 h-auto pr-1">
                  {editBomItems.map((b, i) => {
                    const ing = ingredients.find(ing => ing.id === b.ingredientId);
                    const cost = (ing?.costPerUnit || 0) * b.quantity;
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-xl text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold">{ing?.name || b.ingredientId}</span>
                          <span className="text-amber-400 font-mono font-bold">
                            {b.quantity} {b.unit}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400 font-mono">S/ {cost.toFixed(2)}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveEditBomItem(i)}
                            className="text-rose-400 hover:text-rose-300 font-bold px-1"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECCIÓN OPCIONAL: Ranuras de Insumo Variable / A Elección del Cliente (Panes, Helados, Leches, Jarabes, etc.) */}
              <div className="p-3.5 bg-cyan-950/30 border border-cyan-500/30 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-cyan-300 flex items-center gap-1.5">
                      <span>✨</span> Ranuras de Insumo Variable / A Elección (Panes, Helados, Leches, etc.)
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Configura qué opciones elegirá el mesero al tomar el pedido (ej. Tipo de Pan, Bola de Helado, Sabor de Jarabe).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const nextIdx = editFlavorSlots.length;
                      const defaultCat = availableIngredientCategories[0]?.id || 'helados';
                      const catConfig = availableIngredientCategories[0] || { label: 'Opción a Elección', defaultQty: 1, defaultUnit: 'und' };
                      const defaultAllowed = defaultCat ? ingredients.filter(i => i.category === defaultCat).map(i => i.id) : [];

                      setEditFlavorSlots(prev => [
                        ...prev,
                        {
                          slotIndex: nextIdx,
                          label: `Opción ${nextIdx + 1} (${catConfig.label || 'Elección'})`,
                          category: defaultCat,
                          quantity: catConfig.defaultQty || 1,
                          unit: (catConfig.defaultUnit as any) || 'und',
                          required: true,
                          allowedIngredientIds: defaultAllowed.length > 0 ? defaultAllowed : undefined
                        }
                      ]);
                    }}
                    className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 shadow transition-all active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Añadir Opción Variable</span>
                  </button>
                </div>

                {editFlavorSlots.length > 0 && (
                  <div className="space-y-3 pt-1">
                    {editFlavorSlots.map((slot, sIdx) => {
                      const slotCost = calculateSlotCost(slot);
                      const currentCat = slot.category || 'todas';
                      const categoryIngredients = currentCat === 'todas'
                        ? ingredients
                        : ingredients.filter(i => i.category === currentCat);

                      return (
                        <div key={sIdx} className="bg-slate-900 border border-cyan-500/20 rounded-xl p-3 space-y-2.5 text-xs">
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                            {/* Nombre de la Ranura */}
                            <div className="flex items-center gap-2 flex-1">
                              <span className="font-bold text-cyan-400 shrink-0">Opción {sIdx + 1}:</span>
                              <input
                                type="text"
                                value={slot.label}
                                onChange={e => {
                                  const val = e.target.value;
                                  setEditFlavorSlots(prev => prev.map((s, i) => i === sIdx ? { ...s, label: val } : s));
                                }}
                                className="bg-slate-950 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs font-semibold flex-1 focus:border-cyan-500 focus:outline-none"
                                placeholder="Ej. Tipo de Pan, Bola 1, Tipo de Leche"
                              />
                            </div>

                            {/* Selector de Categoría Vinculada */}
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400 shrink-0">Categoría:</span>
                              <select
                                value={currentCat}
                                onChange={e => {
                                  const newCat = e.target.value;
                                  const catConf = availableIngredientCategories.find(c => c.id === newCat);
                                  const allowed = newCat === 'todas'
                                    ? undefined
                                    : ingredients.filter(i => i.category === newCat).map(i => i.id);

                                  setEditFlavorSlots(prev => prev.map((s, i) => {
                                    if (i !== sIdx) return s;
                                    return {
                                      ...s,
                                      category: newCat,
                                      quantity: catConf?.defaultQty || s.quantity,
                                      unit: (catConf?.defaultUnit as any) || s.unit,
                                      label: s.label.startsWith('Opción') ? `Opción ${sIdx + 1} (${catConf?.label || 'Elección'})` : s.label,
                                      allowedIngredientIds: allowed && allowed.length > 0 ? allowed : undefined
                                    };
                                  }));
                                }}
                                className="bg-slate-950 border border-slate-700 text-cyan-300 font-bold rounded-lg px-2 py-1 text-xs focus:border-cyan-500 focus:outline-none"
                              >
                                {availableIngredientCategories.map(cat => (
                                  <option key={cat.id} value={cat.id}>
                                    {cat.label}
                                  </option>
                                ))}
                              </select>

                              <button
                                type="button"
                                onClick={() => {
                                  setEditFlavorSlots(prev => prev.filter((_, i) => i !== sIdx).map((s, idx) => ({ ...s, slotIndex: idx })));
                                }}
                                className="text-rose-400 hover:text-rose-300 font-bold px-2 py-1 hover:bg-rose-500/10 rounded"
                                title="Eliminar ranura"
                              >
                                ✕
                              </button>
                            </div>
                          </div>

                          {/* Porción, Unidad y Resumen de Opciones */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-[11px]">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400">Porción descontada:</span>
                              <input
                                type="number"
                                step="any"
                                value={slot.quantity}
                                onChange={e => {
                                  const val = parseFloat(e.target.value) || 0;
                                  setEditFlavorSlots(prev => prev.map((s, i) => i === sIdx ? { ...s, quantity: val } : s));
                                }}
                                className="w-16 bg-slate-950 border border-slate-700 text-white rounded-lg px-2 py-0.5 text-xs text-center font-bold"
                              />
                              <select
                                value={slot.unit}
                                onChange={e => {
                                  const u = e.target.value as any;
                                  setEditFlavorSlots(prev => prev.map((s, i) => i === sIdx ? { ...s, unit: u } : s));
                                }}
                                className="bg-slate-950 border border-slate-700 text-amber-400 font-mono rounded-lg px-1.5 py-0.5 text-xs font-bold"
                              >
                                <option value="und">und</option>
                                <option value="L">L</option>
                                <option value="kg">kg</option>
                                <option value="ml">ml</option>
                                <option value="g">g</option>
                              </select>
                              <span className="text-emerald-400 font-mono font-bold">
                                ~S/ {slotCost.toFixed(2)} / porción
                              </span>
                            </div>

                            <div className="text-[10px] text-slate-400 flex items-center gap-1">
                              <span className="text-cyan-400 font-bold">
                                {categoryIngredients.length} insumos elegibles:
                              </span>
                              <span className="truncate max-w-[200px] text-slate-300">
                                {categoryIngredients.map(i => i.name.replace(/^(Helado |Pan )/i, '')).slice(0, 3).join(', ')}
                                {categoryIngredients.length > 3 ? '...' : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Métricas Recalculadas en la Edición */}
              {(() => {
                const editedEdibleItems = editBomItems.filter(b => {
                  const ing = ingredients.find(i => i.id === b.ingredientId);
                  return !b.isDisposable && ing?.itemType !== 'descartable';
                });
                const editSlotsCost = calculateSlotsCost(editFlavorSlots);
                const editedEdibleCost = calculateBomCost(editedEdibleItems) + editSlotsCost;
                const editedCost = calculateBomCost(editBomItems) + editSlotsCost;
                const editedSuggested30 = editedEdibleCost > 0 ? Number((editedEdibleCost / 0.30).toFixed(2)) : 0;
                const editedFloor45 = editedEdibleCost > 0 ? Number((editedEdibleCost / 0.45).toFixed(2)) : 0;
                const editedPriceNum = parseFloat(editProductPrice) || 0;
                const editedFc = editedPriceNum > 0 ? Number(((editedEdibleCost / editedPriceNum) * 100).toFixed(1)) : 0;

                return (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400">Costo Comestible (Salón):</span>
                      <div className="font-black text-white text-sm">S/ {editedEdibleCost.toFixed(2)}</div>
                      <span className="text-[10px] text-slate-500">Total Llevar: S/ {editedCost.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Food Cost Salón:</span>
                      <div className={`font-black text-sm ${editedFc <= 30 ? 'text-emerald-400' : editedFc <= 45 ? 'text-amber-400' : 'text-rose-400'}`}>
                        {editedFc}%
                      </div>
                      <span className="text-[10px] text-slate-500">Meta: ≤30%</span>
                    </div>
                    <div className="text-right">
                      <span className="text-amber-300 font-bold">Precio Sugerido (30%):</span>
                      <div className="font-black text-amber-400 text-base">S/ {editedSuggested30.toFixed(2)}</div>
                      <span className="text-[10px] text-slate-400 font-mono">Piso 45%: S/ {editedFloor45.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })()}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!editProductName.trim() || (editBomItems.length === 0 && editFlavorSlots.length === 0)}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/20"
                >
                  ACTUALIZAR RECETA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
