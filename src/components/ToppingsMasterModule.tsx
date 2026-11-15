import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Edit3,
  Package,
  Layers,
  Scale,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { ToppingMaster, MeasurementUnit } from '../types';

export const ToppingsMasterModule: React.FC = () => {
  const {
    toppingsMaster,
    addToppingMaster,
    updateToppingMaster,
    deleteToppingMaster,
    ingredients,
    themeMode
  } = useApp();

  const isLight = themeMode === 'light';

  // Insumos aptos para toppings ordenados alfabéticamente A-Z (excluye estrictamente descartables y productos de limpieza)
  const sortedIngredients = useMemo(() => {
    return ingredients
      .filter(i => {
        if (i.itemType === 'descartable') return false;
        const cat = (i.category || '').toLowerCase();
        if (cat === 'limpieza' || cat.includes('limpieza')) return false;
        const nm = i.name.toLowerCase();
        if (
          nm.includes('lejía') || nm.includes('lejia') || nm.includes('cloro') ||
          nm.includes('detergente') || nm.includes('lavavajilla') || nm.includes('desinfectante') ||
          nm.includes('bolsa') || nm.includes('vaso') || nm.includes('taper') || nm.includes('táper') ||
          nm.includes('servilleta') || nm.includes('cubierto') || nm.includes('sorbete') || nm.includes('cañita')
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) =>
        a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
      );
  }, [ingredients]);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'insumo' | 'subreceta'>('all');

  // Modales
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState<string>('');
  const [ingredientId, setIngredientId] = useState<string>(sortedIngredients[0]?.id || '');
  const [portionQuantity, setPortionQuantity] = useState<string>('0.010');
  const [portionUnit, setPortionUnit] = useState<MeasurementUnit>('kg');
  const [defaultPriceDelta, setDefaultPriceDelta] = useState<string>('1.50');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [ingSearchInput, setIngSearchInput] = useState<string>('');
  const [showIngSuggestions, setShowIngSuggestions] = useState<boolean>(false);

  // Insumos filtrados por sugerencia de búsqueda
  const filteredIngSuggestions = useMemo(() => {
    if (!ingSearchInput.trim()) return sortedIngredients.slice(0, 10);
    const term = ingSearchInput.toLowerCase();
    return sortedIngredients
      .filter(i => i.name.toLowerCase().includes(term) || (i.code && i.code.toLowerCase().includes(term)))
      .slice(0, 10);
  }, [sortedIngredients, ingSearchInput]);

  // Detección automática del tipo de origen según el insumo seleccionado
  const selectedIng = useMemo(() => {
    return ingredients.find(i => i.id === ingredientId) || sortedIngredients[0];
  }, [ingredients, ingredientId, sortedIngredients]);

  const detectedOriginType: 'insumo' | 'subreceta' =
    selectedIng?.itemType === 'subreceta' ? 'subreceta' : 'insumo';

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    const firstIng = sortedIngredients[0];
    if (firstIng) {
      setIngredientId(firstIng.id);
      setPortionUnit(firstIng.unit);
      setIngSearchInput(firstIng.name);
    } else {
      setIngSearchInput('');
    }
    setPortionQuantity('0.010');
    setDefaultPriceDelta('1.50');
    setIsActive(true);
    setShowIngSuggestions(false);
    setShowModal(true);
  };

  const handleOpenEdit = (top: ToppingMaster) => {
    setEditingId(top.id);
    setName(top.name);
    setIngredientId(top.ingredientId);
    setPortionQuantity(top.portionQuantity.toString());
    setPortionUnit(top.portionUnit);
    setDefaultPriceDelta(top.defaultPriceDelta.toString());
    setIsActive(top.isActive !== false);
    const linked = ingredients.find(i => i.id === top.ingredientId);
    setIngSearchInput(linked ? linked.name : '');
    setShowIngSuggestions(false);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !ingredientId) return;

    const qty = parseFloat(portionQuantity) || 0.010;
    const priceDelta = parseFloat(defaultPriceDelta) || 0;
    const originType = detectedOriginType;

    if (editingId) {
      const existing = toppingsMaster.find(t => t.id === editingId);
      if (existing) {
        updateToppingMaster({
          ...existing,
          name: name.trim(),
          linkedItemType: originType,
          ingredientId,
          portionQuantity: qty,
          portionUnit,
          defaultPriceDelta: priceDelta,
          isActive
        });
      }
    } else {
      addToppingMaster({
        name: name.trim(),
        linkedItemType: originType,
        ingredientId,
        portionQuantity: qty,
        portionUnit,
        defaultPriceDelta: priceDelta,
        isActive
      });
    }

    setShowModal(false);
  };

  const handleDelete = (id: string, topName: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el topping "${topName}" del catálogo maestro?`)) {
      deleteToppingMaster(id);
    }
  };

  // Filtrado
  const filteredToppings = toppingsMaster.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || t.linkedItemType === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className={`flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col space-y-5 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'}`}>
      {/* Header */}
      <div className={`flex flex-wrap items-center justify-between gap-3 pb-4 border-b ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
        <div>
          <span className={`text-[10px] font-mono uppercase tracking-wider font-bold ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>
            Módulo de Recetas & Control de Inventario
          </span>
          <h2 className="text-xl font-black flex items-center gap-2 mt-0.5">
            <Sparkles className={`w-5 h-5 ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
            <span>Catálogo Maestro de Toppings (Con Descuento de Stock)</span>
          </h2>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>CREAR NUEVO TOPPING</span>
        </button>
      </div>

      {/* Banner Explicativo */}
      <div className={`p-4 rounded-3xl border text-xs flex items-start gap-3 ${
        isLight ? 'bg-amber-50/70 border-amber-200 text-amber-950' : 'bg-amber-500/10 border-amber-500/20 text-amber-200'
      }`}>
        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-xs uppercase tracking-tight">Control Riguroso de Porciones y Mermas</h4>
          <p className="text-[11px] leading-relaxed opacity-90">
            A diferencia de las personalizaciones base (*Sin Azúcar*, *Al Tiempo*), cada <strong>Topping</strong> debe existir previamente en este catálogo maestro enlazado a un insumo o subreceta del inventario con su porción exacta (ej. <em>Mango en cubitos $\to$ 10g de Mango</em>). Al venderse en el POS, el ERP descuenta automáticamente el stock real y computa el costo en el Kárdex.
          </p>
        </div>
      </div>

      {/* Buscador y Filtros */}
      <div className={`p-3.5 rounded-3xl border flex flex-wrap items-center justify-between gap-3 ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 ml-1" />
          <input
            type="text"
            placeholder="Buscar topping por nombre..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={`w-full py-1.5 px-2 rounded-xl text-xs font-semibold focus:outline-none ${
              isLight ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-white'
            }`}
          />
        </div>

        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value as any)}
          className={`py-1.5 px-3 rounded-xl text-xs font-semibold border focus:outline-none ${
            isLight ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-white'
          }`}
        >
          <option value="all">Todos los Tipos</option>
          <option value="insumo">Insumos Frescos / Abarrotes</option>
          <option value="subreceta">Subrecetas / Pulpas de Rescate</option>
        </select>
      </div>

      {/* Tabla del Catálogo Maestro */}
      <div className={`rounded-3xl border overflow-hidden shadow-sm ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`border-b text-[10px] font-black uppercase tracking-wider ${
                isLight ? 'bg-slate-100/80 border-slate-200 text-slate-600' : 'bg-slate-950/80 border-slate-800 text-slate-400'
              }`}>
                <th className="py-3 px-4">Nombre del Topping</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Insumo / Subreceta de Almacén</th>
                <th className="py-3 px-3 text-center">Porción por Pedido</th>
                <th className="py-3 px-3 text-right">Recargo al Cliente</th>
                <th className="py-3 px-3 text-center">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-slate-800'}`}>
              {filteredToppings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No se encontraron toppings registrados en el catálogo maestro.
                  </td>
                </tr>
              ) : (
                filteredToppings.map(top => {
                  const ing = ingredients.find(i => i.id === top.ingredientId);
                  const portionCost = ing ? (ing.costPerUnit * top.portionQuantity) : 0;

                  return (
                    <tr
                      key={top.id}
                      className={`transition-colors ${
                        isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-500">✨</span>
                          <span>{top.name}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          top.linkedItemType === 'subreceta'
                            ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30'
                            : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                        }`}>
                          {top.linkedItemType === 'subreceta' ? '🥣 Subreceta / Pulpa' : '📦 Insumo Fresco'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {ing?.name || top.ingredientId}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          Cód: {ing?.code || 'N/A'} • Stock: {ing?.stock.toFixed(2)} {ing?.unit}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center font-mono font-bold text-amber-600 dark:text-amber-400">
                        {top.portionQuantity} {top.portionUnit}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          Costo: S/ {portionCost.toFixed(2)}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-black text-emerald-600 dark:text-emerald-400">
                        + S/ {top.defaultPriceDelta.toFixed(2)}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => updateToppingMaster({ ...top, isActive: top.isActive === false ? true : false })}
                          title="Alternar estado Activo / Inactivo"
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all active:scale-95 cursor-pointer ${
                            top.isActive !== false
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                              : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'
                          }`}
                        >
                          <span>{top.isActive !== false ? '● Activo' : '○ Inactivo'}</span>
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(top)}
                            title="Editar topping"
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-400 transition-all"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(top.id, top.name)}
                            title="Eliminar topping"
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-400 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL CREAR / EDITAR TOPPING ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-black text-base text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>{editingId ? 'Editar Topping' : 'Nuevo Topping Maestro'}</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nombre Comercial del Topping</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Mango en Cubitos (10g)"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-amber-300">
                    Insumo o Subreceta a Descontar (Búsqueda predictiva)
                  </label>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                    detectedOriginType === 'subreceta'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}>
                    {detectedOriginType === 'subreceta' ? '🥣 Subreceta / Base' : '🌱 Insumo de Almacén'}
                  </span>
                </div>

                <div className="relative">
                  <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 focus-within:border-amber-500">
                    <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                    <input
                      type="text"
                      placeholder="Escribe para buscar insumo o pulpa..."
                      value={ingSearchInput}
                      onChange={e => {
                        setIngSearchInput(e.target.value);
                        setShowIngSuggestions(true);
                      }}
                      onFocus={() => setShowIngSuggestions(true)}
                      className="w-full bg-transparent text-white text-xs font-semibold focus:outline-none"
                    />
                    {ingredientId && (
                      <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shrink-0">
                        Seleccionado
                      </span>
                    )}
                  </div>

                  {showIngSuggestions && filteredIngSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl z-20 max-h-48 overflow-y-auto divide-y divide-slate-800">
                      {filteredIngSuggestions.map(ing => (
                        <button
                          key={ing.id}
                          type="button"
                          onClick={() => {
                            setIngredientId(ing.id);
                            setIngSearchInput(ing.name);
                            setPortionUnit(ing.unit);
                            setShowIngSuggestions(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800/80 transition-colors ${
                            ingredientId === ing.id ? 'bg-amber-500/10 text-amber-300' : 'text-slate-200'
                          }`}
                        >
                          <div>
                            <span className="font-bold">{ing.name}</span>
                            <span className="text-[10px] text-slate-400 ml-2">
                              ({ing.itemType === 'subreceta' ? '🥣 Subreceta' : '🌱 Insumo'})
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">
                            Stock: {ing.stock.toFixed(2)} {ing.unit} • S/ {ing.costPerUnit.toFixed(2)}/{ing.unit}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {selectedIng && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    Seleccionado: <strong className="text-white">{selectedIng.name}</strong> • Stock actual: <strong className="text-amber-400">{selectedIng.stock.toFixed(2)} {selectedIng.unit}</strong>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Recargo en Carta (S/)</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={defaultPriceDelta}
                  onChange={e => setDefaultPriceDelta(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white font-mono rounded-xl p-2.5 text-xs font-bold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Porción a Descontar</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="Ej. 0.010 para 10g"
                    value={portionQuantity}
                    onChange={e => setPortionQuantity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white font-mono rounded-xl p-2.5 text-xs font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Unidad</label>
                  <select
                    value={portionUnit}
                    onChange={e => setPortionUnit(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-semibold focus:outline-none"
                  >
                    <option value="kg">Kilos (kg)</option>
                    <option value="L">Litros (L)</option>
                    <option value="und">Unidades (und)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">Estado del Topping</span>
                  <span className="text-[10px] text-slate-400">Si está inactivo, no aparecerá en el POS</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition-all ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {isActive ? '● Activo' : '○ Inactivo'}
                </button>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/20 active:scale-95"
                >
                  {editingId ? 'ACTUALIZAR TOPPING' : 'GUARDAR TOPPING'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
