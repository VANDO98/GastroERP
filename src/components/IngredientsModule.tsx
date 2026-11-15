import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  Edit2,
  Check,
  Filter,
  DollarSign,
  ClipboardList,
  BarChart2,
  TrendingUp,
  PieChart,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Ingredient, MeasurementUnit, ItemType } from '../types';

interface IngredientsModuleProps {
  onNavigateKardex?: () => void;
}

export const IngredientsModule: React.FC<IngredientsModuleProps> = ({ onNavigateKardex }) => {
  const { ingredients, updateIngredient, addIngredient, customIngredientCategories, addIngredientCategory, themeMode } = useApp();
  const isLight = themeMode === 'light';

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingIngId, setEditingIngId] = useState<string | null>(null);
  const [showValuationModal, setShowValuationModal] = useState<boolean>(false);

  // Totales valorizados para reporte general
  const valuationMetrics = useMemo(() => {
    let totalValue = 0;
    let lowStockCount = 0;
    const byCategory: Record<string, { label: string; value: number; count: number }> = {};

    ingredients.forEach(ing => {
      const val = ing.stock * ing.costPerUnit;
      totalValue += val;
      if (ing.stock <= ing.minStock) lowStockCount++;

      let catKey = ing.itemType === 'subreceta'
        ? 'subrecetas'
        : ing.itemType === 'descartable'
        ? 'descartables'
        : ing.itemType === 'consumible'
        ? 'consumibles'
        : (ing.category || 'otros');

      let catLabel = ing.itemType === 'subreceta'
        ? '🥣 Subrecetas / Pulpas'
        : ing.itemType === 'descartable'
        ? '📦 Empaques & Descartables'
        : ing.itemType === 'consumible'
        ? '🧼 Consumibles & Limpieza'
        : ing.category === 'frutas'
        ? '🍓 Frutas Frescas'
        : ing.category === 'lacteos'
        ? '🥛 Lácteos'
        : ing.category === 'abarrotes'
        ? '🌾 Abarrotes'
        : ing.category === 'verduras'
        ? '🥬 Verduras'
        : `🏷️ ${catKey.toUpperCase()}`;

      if (!byCategory[catKey]) {
        byCategory[catKey] = { label: catLabel, value: 0, count: 0 };
      }
      byCategory[catKey].value += val;
      byCategory[catKey].count += 1;
    });

    const categoryList = Object.entries(byCategory).map(([key, data]) => ({
      key,
      label: data.label,
      value: data.value,
      count: data.count,
      percent: totalValue > 0 ? (data.value / totalValue) * 100 : 0
    })).sort((a, b) => b.value - a.value);

    // Top 5 insumos con mayor capital invertido
    const topInvested = [...ingredients]
      .map(i => ({ ...i, totalVal: i.stock * i.costPerUnit }))
      .sort((a, b) => b.totalVal - a.totalVal)
      .slice(0, 5);

    // Insumos críticos por reponer
    const criticalStock = ingredients
      .filter(i => i.stock <= i.minStock)
      .sort((a, b) => (a.stock / (a.minStock || 1)) - (b.stock / (b.minStock || 1)));

    return {
      totalValue,
      itemCount: ingredients.length,
      lowStockCount,
      categoryList,
      topInvested,
      criticalStock
    };
  }, [ingredients]);

  // Nueva categoría dinámica
  const [showAddCategoryInput, setShowAddCategoryInput] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState<string>('');

  // Formulario en línea de edición
  const [editStock, setEditStock] = useState<string>('');
  const [editMinStock, setEditMinStock] = useState<string>('');
  const [editCost, setEditCost] = useState<string>('');

  // Modal para nuevo insumo
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newCode, setNewCode] = useState<string>('');
  const [newItemType, setNewItemType] = useState<ItemType>('insumo');
  const [newCategory, setNewCategory] = useState<string>('frutas');
  const [newUnit, setNewUnit] = useState<MeasurementUnit>('kg');
  const [newStock, setNewStock] = useState<string>('10.0');
  const [newMinStock, setNewMinStock] = useState<string>('2.0');
  const [newCost, setNewCost] = useState<string>('5.00');
  const [newIsTaxAffected, setNewIsTaxAffected] = useState<boolean>(false);

  const startEdit = (ing: Ingredient) => {
    setEditingIngId(ing.id);
    setEditStock(ing.stock.toString());
    setEditMinStock(ing.minStock.toString());
    setEditCost(ing.costPerUnit.toString());
  };

  const saveEdit = (ing: Ingredient) => {
    const updated: Ingredient = {
      ...ing,
      stock: parseFloat(editStock) || ing.stock,
      minStock: parseFloat(editMinStock) || ing.minStock,
      costPerUnit: parseFloat(editCost) || ing.costPerUnit,
      lastUpdated: new Date().toISOString()
    };
    updateIngredient(updated);
    setEditingIngId(null);
  };

  const handleCreateIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    addIngredient({
      code: newCode.trim() || `ART-${Math.floor(100 + Math.random() * 900)}`,
      name: newName.trim(),
      itemType: newItemType,
      category: newItemType === 'insumo' ? newCategory : undefined,
      unit: newUnit,
      stock: parseFloat(newStock) || 0,
      minStock: parseFloat(newMinStock) || 0,
      costPerUnit: parseFloat(newCost) || 0,
      isTaxAffected: newIsTaxAffected,
      lastUpdated: new Date().toISOString()
    });

    setShowAddModal(false);
    setNewName('');
    setNewCode('');
  };

  const filteredIngredients = ingredients.filter(ing => {
    const matchesSearch =
      ing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ing.code && ing.code.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory =
      selectedCategory === 'all'
        ? true
        : selectedCategory === 'subrecetas'
        ? (ing.itemType === 'subreceta' || ing.isIntermediateRecipe || (ing.code && ing.code.startsWith('SUB-')))
        : selectedCategory === 'descartables'
        ? ing.itemType === 'descartable'
        : selectedCategory === 'consumibles'
        ? ing.itemType === 'consumible'
        : ing.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={`flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col ${isLight ? 'bg-slate-100 text-slate-800' : 'bg-slate-950 text-slate-100'}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-700/50">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
            Módulo Maestro de Insumos & Empaques
          </span>
          <h2 className="text-xl font-black flex items-center gap-2 mt-0.5">
            <Package className="w-5 h-5 text-cyan-400" />
            <span>Inventario de Materias Primas & Subrecetas (Kg, L, Und)</span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowValuationModal(true)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl font-black text-xs border shadow transition-all active:scale-95 ${
              isLight
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100 shadow-emerald-100'
                : 'bg-emerald-950/40 border-emerald-600/40 text-emerald-400 hover:bg-emerald-900/40 shadow-black/40'
            }`}
          >
            <BarChart2 className="w-4 h-4 text-emerald-500" />
            <span>📊 REPORTE VALORIZADO GENERAL</span>
          </button>

          {onNavigateKardex && (
            <button
              onClick={onNavigateKardex}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl font-black text-xs border shadow transition-all active:scale-95 ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100 shadow-slate-200'
                  : 'bg-slate-900 border-slate-700 text-cyan-400 hover:bg-slate-800 shadow-black/40'
              }`}
            >
              <ClipboardList className="w-4 h-4 text-cyan-500" />
              <span>KÁRDEX VALORIZADO (FIFO)</span>
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs shadow-lg shadow-cyan-600/25 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>NUEVO INSUMO / DESCARTABLE</span>
          </button>
        </div>
      </div>

      {/* Barra de Métricas Ejecutivas del Inventario */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/80 border-slate-800'
        }`}>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Valor Total del Inventario
            </span>
            <span className="text-lg font-mono font-black text-emerald-500">
              S/ {valuationMetrics.totalValue.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/80 border-slate-800'
        }`}>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Insumos & Empaques Totales
            </span>
            <span className="text-lg font-mono font-black text-cyan-400">
              {valuationMetrics.itemCount} <span className="text-xs font-normal text-slate-400">artículos</span>
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/80 border-slate-800'
        }`}>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Alertas por Bajo Stock
            </span>
            <span className={`text-lg font-mono font-black ${
              valuationMetrics.lowStockCount > 0 ? 'text-amber-400' : 'text-slate-400'
            }`}>
              {valuationMetrics.lowStockCount} <span className="text-xs font-normal text-slate-400">por reponer</span>
            </span>
          </div>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
            valuationMetrics.lowStockCount > 0 ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-800 text-slate-500'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Layout Master-Detail (Categorías a la Izquierda vs Tabla a la Derecha) */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Panel Lateral Izquierdo de Categorías (Master) */}
        <div className={`w-full lg:w-64 shrink-0 rounded-3xl border p-4 space-y-3 ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'}`}>
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-cyan-500" />
              <span>Categorías</span>
            </h3>
            <button
              onClick={() => setShowAddCategoryInput(!showAddCategoryInput)}
              className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-0.5"
            >
              <Plus className="w-3 h-3 stroke-[3]" />
              <span>Nueva</span>
            </button>
          </div>

          {/* Formulario rápido para nueva categoría */}
          {showAddCategoryInput && (
            <div className={`p-2.5 rounded-2xl border space-y-2 ${isLight ? 'bg-slate-50 border-cyan-200' : 'bg-slate-950 border-cyan-500/30'}`}>
              <input
                type="text"
                placeholder="Nombre de categoría..."
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded-xl text-xs font-semibold border focus:outline-none focus:ring-1 focus:ring-cyan-500 ${
                  isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-900 border-slate-700 text-white'
                }`}
              />
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    if (newCatName.trim()) {
                      addIngredientCategory(newCatName.trim());
                      setNewCatName('');
                      setShowAddCategoryInput(false);
                    }
                  }}
                  className="flex-1 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-[11px]"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCategoryInput(false);
                    setNewCatName('');
                  }}
                  className="px-2 py-1 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-[11px]"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Lista Vertical de Categorías con Contadores */}
          <div className="space-y-1 max-h-[550px] overflow-y-auto pr-1">
            {[
              { id: 'all', label: 'Todos los Insumos', icon: '📦' },
              { id: 'subrecetas', label: 'Subrecetas / Batches', icon: '🥣' },
              { id: 'frutas', label: 'Frutas y Frescos', icon: '🍎' },
              { id: 'lacteos', label: 'Lácteos y Derivados', icon: '🥛' },
              { id: 'abarrotes', label: 'Abarrotes y Secos', icon: '🍞' },
              { id: 'proteinas', label: 'Proteínas y Fiambres', icon: '🥩' },
              { id: 'jarabes_bases', label: 'Jarabes y Bases', icon: '🍯' },
              { id: 'descartables', label: 'Descartables / Empaque', icon: '🥡' },
              { id: 'consumibles', label: 'Limpieza y Otros', icon: '🧹' },
              ...customIngredientCategories.map(c => ({
                id: c,
                label: c,
                icon: '🏷️'
              }))
            ].map(cat => {
              const count =
                cat.id === 'all'
                  ? ingredients.length
                  : cat.id === 'subrecetas'
                  ? ingredients.filter(i => i.itemType === 'subreceta' || i.isIntermediateRecipe || (i.code && i.code.startsWith('SUB-'))).length
                  : cat.id === 'descartables'
                  ? ingredients.filter(i => i.itemType === 'descartable').length
                  : cat.id === 'consumibles'
                  ? ingredients.filter(i => i.itemType === 'consumible').length
                  : ingredients.filter(i => i.category === cat.id).length;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all text-left ${
                    isSelected
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20 font-black'
                      : isLight
                      ? 'text-slate-700 hover:bg-slate-100'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span>{cat.icon}</span>
                    <span className="truncate">{cat.label}</span>
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold shrink-0 ${
                      isSelected
                        ? 'bg-white/20 text-white'
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

        {/* Panel Principal Derecho: Buscador + Tabla de Insumos */}
        <div className="flex-1 min-w-0 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o código (ej. Papaya, SUB-001, DSC001)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-4 py-2.5 rounded-2xl text-xs font-semibold border focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                isLight ? 'bg-white border-slate-300 text-slate-800 shadow-sm' : 'bg-slate-900 border-slate-700 text-white'
              }`}
            />
          </div>

      {/* Tabla Maestra de Insumos */}
      <div className={`rounded-3xl border overflow-hidden shadow-xl ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className={`text-[11px] uppercase tracking-wider font-extrabold border-b ${isLight ? 'bg-slate-100 text-slate-800 border-slate-200' : 'bg-slate-950/80 text-slate-400 border-slate-800'}`}>
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Insumo / Empaque</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3 text-center">Impuesto</th>
                <th className="px-4 py-3 text-center">Unidad</th>
                <th className="px-4 py-3 text-right">Stock Actual</th>
                <th className="px-4 py-3 text-right">Stock Mínimo</th>
                <th className="px-4 py-3 text-right">Costo Unitario</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-slate-800/40'}`}>
              {filteredIngredients.map(ing => {
                const isEditing = editingIngId === ing.id;
                const isLow = ing.stock <= ing.minStock;

                return (
                  <tr
                    key={ing.id}
                    className={`transition-colors ${
                      isLow ? (isLight ? 'bg-rose-50/70' : 'bg-rose-500/10') : isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/30'
                    }`}
                  >
                    <td className={`px-4 py-3 font-mono font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      {ing.code || 'S/C'}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-extrabold flex items-center gap-1.5">
                        <span className={isLight ? 'text-slate-900' : 'text-white'}>{ing.name}</span>
                        {(ing.itemType === 'subreceta' || ing.isIntermediateRecipe || (ing.code && ing.code.startsWith('SUB-'))) && (
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold border ${
                            isLight ? 'bg-purple-100 text-purple-800 border-purple-300' : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                          }`}>
                            Subreceta / Batch
                          </span>
                        )}
                        {ing.itemType === 'descartable' && (
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold border ${
                            isLight ? 'bg-cyan-100 text-cyan-800 border-cyan-300' : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                          }`}>
                            Descartable
                          </span>
                        )}
                        {ing.itemType === 'consumible' && (
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold border ${
                            isLight ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          }`}>
                            Consumible
                          </span>
                        )}
                      </div>
                    </td>

                    <td className={`px-4 py-3 capitalize font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      {ing.itemType === 'insumo' ? (ing.category?.replace('_', ' ') || 'Alimento') : ing.itemType}
                    </td>

                    <td className="px-4 py-3 text-center">
                      {ing.isTaxAffected ? (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                          isLight ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        }`}>
                          18% IGV
                        </span>
                      ) : (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                          isLight ? 'bg-slate-200 text-slate-700 border-slate-300' : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                        }`}>
                          Inafecto
                        </span>
                      )}
                    </td>

                    <td className={`px-4 py-3 text-center font-black font-mono uppercase ${isLight ? 'text-cyan-800' : 'text-cyan-400'}`}>
                      {ing.unit}
                    </td>

                    <td className="px-4 py-3 text-right font-black">
                      {isEditing ? (
                        <input
                          type="number"
                          step="any"
                          value={editStock}
                          onChange={e => setEditStock(e.target.value)}
                          className={`w-20 border rounded px-2 py-1 text-right text-xs focus:outline-none ${
                            isLight ? 'bg-white border-cyan-500 text-slate-900 font-black' : 'bg-slate-950 border-cyan-500 text-white'
                          }`}
                        />
                      ) : (
                        <span className={`text-sm font-black ${isLow ? 'text-rose-600 font-black' : isLight ? 'text-slate-900' : 'text-white'}`}>
                          {ing.stock} {ing.unit}
                        </span>
                      )}
                    </td>

                    <td className={`px-4 py-3 text-right font-mono font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      {isEditing ? (
                        <input
                          type="number"
                          step="any"
                          value={editMinStock}
                          onChange={e => setEditMinStock(e.target.value)}
                          className={`w-20 border rounded px-2 py-1 text-right text-xs focus:outline-none ${
                            isLight ? 'bg-white border-cyan-500 text-slate-900 font-bold' : 'bg-slate-950 border-cyan-500 text-white'
                          }`}
                        />
                      ) : (
                        <span>{ing.minStock} {ing.unit}</span>
                      )}
                    </td>

                    <td className={`px-4 py-3 text-right font-mono font-black ${isLight ? 'text-amber-800' : 'text-amber-400'}`}>
                      {isEditing ? (
                        <input
                          type="number"
                          step="any"
                          value={editCost}
                          onChange={e => setEditCost(e.target.value)}
                          className={`w-20 border rounded px-2 py-1 text-right text-xs focus:outline-none ${
                            isLight ? 'bg-white border-cyan-500 text-slate-900 font-bold' : 'bg-slate-950 border-cyan-500 text-white'
                          }`}
                        />
                      ) : (
                        <span>S/ {ing.costPerUnit.toFixed(2)}</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-center">
                      {isEditing ? (
                        <button
                          onClick={() => saveEdit(ing)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 mx-auto"
                        >
                          <Check className="w-3.5 h-3.5" /> Guardar
                        </button>
                      ) : (
                        <button
                          onClick={() => startEdit(ing)}
                          className="text-slate-400 hover:text-cyan-400 p-1 rounded transition-colors"
                          title="Editar stock y costo"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

      {/* ================= MODAL NUEVO INSUMO ================= */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-black text-lg text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-cyan-400" />
                <span>Registrar Nuevo Insumo</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateIngredient} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Maracuyá Criollo"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-bold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Tipo de Artículo</label>
                  <select
                    value={newItemType}
                    onChange={e => {
                      const val = e.target.value as ItemType;
                      setNewItemType(val);
                      if (val === 'descartable' || val === 'consumible') {
                        setNewUnit('und');
                        setNewIsTaxAffected(true);
                      } else {
                        setNewUnit('kg');
                        setNewIsTaxAffected(false);
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-semibold focus:outline-none"
                  >
                    <option value="insumo">Insumo (Alimento)</option>
                    <option value="descartable">Descartable (Empaque)</option>
                    <option value="consumible">Consumible (Limpieza/Operativo)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Código</label>
                  <input
                    type="text"
                    placeholder="Ej. FRU-009, DSC-001"
                    value={newCode}
                    onChange={e => setNewCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-bold focus:outline-none"
                  />
                </div>
              </div>

              {newItemType === 'insumo' && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Categoría</label>
                  <select
                    value={newCategory}
                    onChange={e => {
                      const c = e.target.value as any;
                      setNewCategory(c);
                      if (c === 'lacteos' || c === 'abarrotes' || c === 'jarabes_bases') {
                        setNewIsTaxAffected(true);
                      } else {
                        setNewIsTaxAffected(false);
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-semibold focus:outline-none"
                  >
                    <option value="frutas">Frutas Frescas (Inafecto)</option>
                    <option value="lacteos">Lácteos (Afecto 18%)</option>
                    <option value="proteinas">Proteínas / Carnes</option>
                    <option value="abarrotes">Abarrotes</option>
                    <option value="jarabes_bases">Jarabes y Bases</option>
                    {customIngredientCategories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Checkbox Afecto a IGV */}
              <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Afecto a IGV (18%)</span>
                  <span className="text-[10px] text-slate-400">Marcar si paga 18% en compras</span>
                </div>
                <input
                  type="checkbox"
                  checked={newIsTaxAffected}
                  onChange={e => setNewIsTaxAffected(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Unidad</label>
                  <select
                    value={newUnit}
                    onChange={e => setNewUnit(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-bold focus:outline-none"
                  >
                    <option value="kg">Kilos (kg)</option>
                    <option value="L">Litros (L)</option>
                    <option value="und">Unidades (und)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Stock Inicial</label>
                  <input
                    type="number"
                    step="any"
                    value={newStock}
                    onChange={e => setNewStock(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Costo Unit.</label>
                  <input
                    type="number"
                    step="any"
                    value={newCost}
                    onChange={e => setNewCost(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-xl text-xs shadow-lg shadow-cyan-600/25"
                >
                  Guardar Insumo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL REPORTE VALORIZADO GENERAL ================= */}
      {showValuationModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-3xl w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/15 rounded-xl text-emerald-400">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-white">Reporte Valorizado General de Inventario</h3>
                  <span className="text-xs text-slate-400">Auditoría de Capital Inmovilizado & Existencias Reales</span>
                </div>
              </div>
              <button
                onClick={() => setShowValuationModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Tarjetas de Resumen Ejecutivo Superior */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Capital Total Valorizado</span>
                <span className="text-2xl font-mono font-black text-emerald-400">
                  S/ {valuationMetrics.totalValue.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">Costo ponderado de adquisición</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total Artículos Activos</span>
                <span className="text-2xl font-mono font-black text-cyan-400">
                  {valuationMetrics.itemCount}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">Insumos, pulpas y empaques</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Ítems Bajo Stock Mínimo</span>
                <span className={`text-2xl font-mono font-black ${valuationMetrics.lowStockCount > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                  {valuationMetrics.lowStockCount}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">Requieren reposición en compras</span>
              </div>
            </div>

            {/* Desglose de Inversión por Categoría */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <PieChart className="w-4 h-4" />
                <span>Distribución del Capital por Categoría de Insumos</span>
              </h4>

              <div className="space-y-2.5">
                {valuationMetrics.categoryList.map(cat => (
                  <div key={cat.key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{cat.label}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({cat.count} ítems)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-400">
                          S/ {cat.value.toFixed(2)}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                          {cat.percent.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    {/* Barra de progreso visual */}
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.max(2, cat.percent))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dos Columnas: Top 5 Inversión vs Críticos de Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Top 5 Mayor Capital */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  <span>Top 5 Insumos con Mayor Valor Invertido</span>
                </h4>
                <div className="divide-y divide-slate-800/60">
                  {valuationMetrics.topInvested.map((ing, idx) => (
                    <div key={ing.id} className="py-2 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white">{idx + 1}. {ing.name}</span>
                        <span className="block text-[10px] text-slate-400 font-mono">
                          Stock: {ing.stock.toFixed(2)} {ing.unit} • S/ {ing.costPerUnit.toFixed(2)}/{ing.unit}
                        </span>
                      </div>
                      <span className="font-mono font-black text-emerald-400">
                        S/ {ing.totalVal.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Insumos Críticos por Reponer */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Insumos Críticos (Bajo Stock Mínimo)</span>
                </h4>
                {valuationMetrics.criticalStock.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-3">Todos los insumos superan el stock mínimo de seguridad.</p>
                ) : (
                  <div className="divide-y divide-slate-800/60 max-h-48 overflow-y-auto pr-1">
                    {valuationMetrics.criticalStock.map(ing => (
                      <div key={ing.id} className="py-2 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-white">{ing.name}</span>
                          <span className="block text-[10px] text-rose-400 font-mono">
                            Stock: {ing.stock.toFixed(2)} {ing.unit} (Mínimo: {ing.minStock.toFixed(2)} {ing.unit})
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          Reponer
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowValuationModal(false)}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs"
              >
                Cerrar Reporte
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
