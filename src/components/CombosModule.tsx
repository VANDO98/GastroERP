import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  TrendingDown,
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Combo, ComboItem } from '../types';
import { SearchableSelect, type SearchableOption } from './SearchableSelect';

export const CombosModule: React.FC = () => {
  const {
    combos,
    addCombo,
    updateCombo,
    deleteCombo,
    toggleComboActive,
    menuConfig,
    ingredients,
    themeMode
  } = useApp();

  const isLight = themeMode === 'light';

  // Obtener todas las recetas finales de carta (excluyendo subrecetas base)
  const allFinalProducts = menuConfig.lines
    .flatMap(line => line.categories.flatMap(cat => cat.products))
    .filter(p => p.recipeType !== 'base' && p.recipeType !== 'intermedia' && !p.sku.startsWith('SUB-'));

  // Opciones para autocompletado inteligente
  const comboProductOptions: SearchableOption[] = useMemo(() => {
    return allFinalProducts.map(p => ({
      id: p.id,
      code: p.sku,
      label: p.name,
      subtitle: `Precio regular: S/ ${p.price.toFixed(2)}`,
      badge: `S/ ${p.price.toFixed(2)}`
    }));
  }, [allFinalProducts]);

  // Estados de modal
  const [showModal, setShowModal] = useState(false);
  const [editingComboId, setEditingComboId] = useState<string | null>(null);

  // Formulario
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [selectedItems, setSelectedItems] = useState<ComboItem[]>([]);

  // Selector temporal de receta para añadir
  const [tempProductId, setTempProductId] = useState<string>(allFinalProducts[0]?.id || '');
  const [tempQty, setTempQty] = useState<number>(1);

  // Generador de siguiente SKU para combos
  const generateNextComboSku = (): string => {
    const existingNums = combos
      .map(c => {
        const match = c.sku.match(/CMB-(\d+)/i);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(n => !isNaN(n));
    const maxNum = existingNums.length > 0 ? Math.max(...existingNums) : 0;
    return `CMB-${String(maxNum + 1).padStart(3, '0')}`;
  };

  // Abrir modal de creación
  const openCreateModal = () => {
    setEditingComboId(null);
    setSku(generateNextComboSku());
    setName('');
    setShortName('');
    setDescription('');
    setPrice('');
    setSelectedItems([]);
    setTempProductId(allFinalProducts[0]?.id || '');
    setTempQty(1);
    setShowModal(true);
  };

  // Abrir modal de edición
  const openEditModal = (combo: Combo) => {
    setEditingComboId(combo.id);
    setSku(combo.sku);
    setName(combo.name);
    setShortName(combo.shortName || combo.name);
    setDescription(combo.description || '');
    setPrice(combo.price.toString());
    setSelectedItems([...combo.items]);
    setTempProductId(allFinalProducts[0]?.id || '');
    setTempQty(1);
    setShowModal(true);
  };

  // Añadir ítem a la lista del combo
  const handleAddItem = () => {
    if (!tempProductId || tempQty <= 0) return;
    const prod = allFinalProducts.find(p => p.id === tempProductId);
    if (!prod) return;

    const existingIdx = selectedItems.findIndex(i => i.productId === tempProductId);
    if (existingIdx >= 0) {
      const updated = [...selectedItems];
      updated[existingIdx].quantity += tempQty;
      setSelectedItems(updated);
    } else {
      setSelectedItems(prev => [
        ...prev,
        {
          productId: prod.id,
          name: prod.name,
          quantity: tempQty
        }
      ]);
    }
    setTempQty(1);
  };

  const handleRemoveItem = (idx: number) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== idx));
  };

  // Cálculos en vivo para cualquier lista de ComboItem
  const computeComboMetrics = (items: ComboItem[], salePrice: number) => {
    let regularPriceSum = 0;
    let totalBomCost = 0;

    items.forEach(item => {
      const prod = allFinalProducts.find(p => p.id === item.productId);
      if (prod) {
        regularPriceSum += prod.price * item.quantity;
        // Costo BOM de la receta
        const prodCost = prod.recipeBom.reduce((acc, bom) => {
          const ing = ingredients.find(i => i.id === bom.ingredientId);
          return acc + (ing ? ing.costPerUnit * bom.quantity : 0);
        }, 0);
        totalBomCost += prodCost * item.quantity;
      }
    });

    const suggestedPrice30 = totalBomCost > 0 ? Number((totalBomCost / 0.30).toFixed(2)) : 0;
    const floorPrice45 = totalBomCost > 0 ? Number((totalBomCost / 0.45).toFixed(2)) : 0;
    const clientSavings = regularPriceSum > salePrice ? Number((regularPriceSum - salePrice).toFixed(2)) : 0;
    const discountPercent = regularPriceSum > 0 ? Number(((clientSavings / regularPriceSum) * 100).toFixed(1)) : 0;
    const grossMargin = salePrice > totalBomCost ? Number((salePrice - totalBomCost).toFixed(2)) : 0;
    const foodCostPercent = salePrice > 0 ? Number(((totalBomCost / salePrice) * 100).toFixed(1)) : 0;

    return {
      regularPriceSum: Number(regularPriceSum.toFixed(2)),
      totalBomCost: Number(totalBomCost.toFixed(2)),
      suggestedPrice30,
      floorPrice45,
      clientSavings,
      discountPercent,
      grossMargin,
      foodCostPercent
    };
  };

  // Guardar combo
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || selectedItems.length === 0) return;

    const salePriceNum = parseFloat(price) || 0;
    const finalSku = sku.trim() || generateNextComboSku();

    if (editingComboId) {
      const existing = combos.find(c => c.id === editingComboId);
      if (existing) {
        updateCombo({
          ...existing,
          sku: finalSku,
          name: name.trim(),
          shortName: shortName.trim() || name.trim(),
          description: description.trim(),
          price: salePriceNum,
          items: selectedItems
        });
      }
    } else {
      addCombo({
        sku: finalSku,
        name: name.trim(),
        shortName: shortName.trim() || name.trim(),
        description: description.trim(),
        price: salePriceNum,
        items: selectedItems,
        isActive: true
      });
    }

    setShowModal(false);
  };

  // Métricas agregadas de todos los combos
  const activeCombos = combos.filter(c => c.isActive);
  const avgDiscount =
    combos.length > 0
      ? Number(
          (
            combos.reduce((acc, c) => acc + computeComboMetrics(c.items, c.price).discountPercent, 0) /
            combos.length
          ).toFixed(1)
        )
      : 0;

  const avgFc =
    combos.length > 0
      ? Number(
          (
            combos.reduce((acc, c) => acc + computeComboMetrics(c.items, c.price).foodCostPercent, 0) /
            combos.length
          ).toFixed(1)
        )
      : 0;

  // Métricas en vivo del modal
  const modalPriceNum = parseFloat(price) || 0;
  const modalMetrics = computeComboMetrics(selectedItems, modalPriceNum);

  return (
    <div className={`p-4 md:p-6 space-y-6 max-w-7xl mx-auto transition-colors ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
      {/* Encabezado y Acción */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 font-black shadow-md">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black tracking-tight">Gestión de Combos & Packs Promocionales</h1>
          </div>
          <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Arma promociones uniendo platos finales de la carta, calcula su costo compuesto y fija precios que maximicen ventas y margen.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>CREAR NUEVO COMBO</span>
        </button>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Combos Configurados
          </span>
          <div className="text-2xl font-black mt-1">{combos.length}</div>
          <span className={`text-[10px] ${isLight ? 'text-emerald-700 font-semibold' : 'text-emerald-400 font-semibold'}`}>
            {activeCombos.length} activos en POS
          </span>
        </div>

        <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Descuento Promedio al Cliente
          </span>
          <div className="text-2xl font-black mt-1 text-emerald-600 dark:text-emerald-400">
            {avgDiscount}% OFF
          </div>
          <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Ahorro atractivo para el cliente
          </span>
        </div>

        <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Food Cost Promedio Combos
          </span>
          <div
            className={`text-2xl font-black mt-1 ${
              avgFc <= 30
                ? isLight ? 'text-emerald-700' : 'text-emerald-400'
                : avgFc <= 45
                ? isLight ? 'text-amber-700' : 'text-amber-400'
                : isLight ? 'text-rose-700' : 'text-rose-400'
            }`}
          >
            {avgFc}%
          </div>
          <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Meta: ≤ 30% | Techo: 45%
          </span>
        </div>

        <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Impacto Operativo KDS
          </span>
          <div className="text-2xl font-black mt-1 text-cyan-600 dark:text-cyan-400">Automático</div>
          <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Desglosa bebidas y platos a barra/cocina
          </span>
        </div>
      </div>

      {/* Listado de Combos */}
      <div className="space-y-4">
        <h2 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
          <Layers className="w-4 h-4 text-amber-500" />
          <span>Catálogo de Combos Registrados ({combos.length})</span>
        </h2>

        {combos.length === 0 ? (
          <div className={`p-8 text-center rounded-3xl border ${isLight ? 'bg-white border-slate-200 text-slate-500' : 'bg-slate-900/40 border-slate-800 text-slate-400'}`}>
            <Sparkles className="w-10 h-10 mx-auto text-amber-500/50 mb-2" />
            <p className="font-bold">No hay combos registrados todavía.</p>
            <p className="text-xs mt-1">Haz clic en "CREAR NUEVO COMBO" para diseñar tu primera promoción.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {combos.map(combo => {
              const metrics = computeComboMetrics(combo.items, combo.price);

              return (
                <div
                  key={combo.id}
                  className={`rounded-3xl border p-5 flex flex-col justify-between transition-all shadow-sm hover:shadow-md ${
                    isLight
                      ? 'bg-white border-slate-200 hover:border-amber-300'
                      : 'bg-slate-900/70 border-slate-800 hover:border-amber-500/40'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header del Combo */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30">
                            {combo.sku}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              combo.isActive
                                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-500/20 text-slate-600 dark:text-slate-400 border border-slate-500/30'
                            }`}
                          >
                            {combo.isActive ? 'Activo en POS' : 'Inactivo'}
                          </span>
                        </div>
                        <h3 className={`font-black text-base mt-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {combo.name}
                        </h3>
                        {combo.shortName && combo.shortName !== combo.name && (
                          <div className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            KDS: {combo.shortName}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(combo)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Editar Combo"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Seguro que deseas eliminar el combo ${combo.name}?`)) {
                              deleteCombo(combo.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Eliminar Combo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {combo.description && (
                      <p className={`text-xs line-clamp-2 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        {combo.description}
                      </p>
                    )}

                    {/* Platos que Componen el Combo */}
                    <div className={`p-3 rounded-2xl border text-xs space-y-1.5 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800/80'}`}>
                      <div className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        Recetas que lo Componen:
                      </div>
                      {combo.items.map((it, idx) => {
                        const prod = allFinalProducts.find(p => p.id === it.productId);
                        return (
                          <div key={idx} className="flex items-center justify-between">
                            <span className="font-semibold flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              <span>{it.quantity}x {it.name || prod?.name}</span>
                            </span>
                            <span className={`font-mono text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                              S/ {((prod?.price || 0) * it.quantity).toFixed(2)}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Tarjeta de Rentabilidad y Precios */}
                    <div className={`p-3.5 rounded-2xl border space-y-2.5 ${isLight ? 'bg-amber-50/50 border-amber-200/80' : 'bg-amber-500/10 border-amber-500/20'}`}>
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            Precio Combo
                          </span>
                          <div className={`text-2xl font-black ${isLight ? 'text-amber-900' : 'text-amber-400'}`}>
                            S/ {combo.price.toFixed(2)}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            Carta Separada
                          </span>
                          <div className={`text-sm font-bold line-through ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            S/ {metrics.regularPriceSum.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {/* Ahorro al cliente */}
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-amber-500/20">
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                          <TrendingDown className="w-3.5 h-3.5" />
                          <span>Ahorro Cliente:</span>
                        </span>
                        <span className="font-black text-emerald-600 dark:text-emerald-400">
                          S/ {metrics.clientSavings.toFixed(2)} ({metrics.discountPercent}%)
                        </span>
                      </div>

                      {/* Costo BOM y Food Cost */}
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-amber-500/20 text-xs">
                        <div>
                          <span className={`text-[10px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Costo BOM Total:</span>
                          <div className="font-bold">S/ {metrics.totalBomCost.toFixed(2)}</div>
                        </div>
                        <div className="text-right">
                          <span className={`text-[10px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Food Cost:</span>
                          <div
                            className={`font-black ${
                              metrics.foodCostPercent <= 30
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : metrics.foodCostPercent <= 45
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {metrics.foodCostPercent}%
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-amber-500/20">
                        <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>Precio Sugerido (30% FC):</span>
                        <span className="font-black text-amber-600 dark:text-amber-400">
                          S/ {metrics.suggestedPrice30.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botón de activar/inactivar */}
                  <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Estado de Venta:</span>
                    <button
                      onClick={() => toggleComboActive(combo.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        combo.isActive
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/30'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
                      }`}
                    >
                      {combo.isActive ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Habilitado en POS</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-slate-400" />
                          <span>Inactivo</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= MODAL DE CREACIÓN / EDICIÓN ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-black text-lg text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>{editingComboId ? 'Editar Combo Promocional' : 'Crear Nuevo Combo Promocional'}</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Código SKU</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={e => setSku(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-amber-300 font-mono font-bold rounded-xl p-2.5 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">Nombre Comercial del Combo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Combo Mañanero Sabor"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white font-bold rounded-xl p-2.5 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Nombre Corto (KDS / Comanda)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Combo Mañanero"
                    value={shortName}
                    onChange={e => setShortName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white font-bold rounded-xl p-2.5 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Precio Venta del Combo (S/)
                  </label>
                  <input
                    type="number"
                    step="0.10"
                    required
                    placeholder="0.00"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-amber-400 font-mono font-black text-base rounded-xl p-2.5 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Descripción de la Oferta</label>
                <textarea
                  rows={2}
                  placeholder="Detalla qué incluye el combo para el cliente..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 text-xs focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              {/* Selector de Recetas para Armar el Combo */}
              <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Recetas Finales que Integran el Combo</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {selectedItems.length} seleccionadas
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                  <div className="flex-1 min-w-0">
                    <SearchableSelect
                      options={comboProductOptions}
                      value={tempProductId}
                      onChange={setTempProductId}
                      placeholder="Buscar receta para el combo..."
                      searchPlaceholder="Escribe: frappé, sándwich, jugo, waffle..."
                      isLight={isLight}
                    />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={tempQty}
                      onChange={e => setTempQty(parseInt(e.target.value, 10) || 1)}
                      className="w-16 bg-slate-900 border border-slate-700 text-white font-bold text-center rounded-xl p-2 text-xs focus:outline-none"
                      title="Cantidad de unidades"
                    />

                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs whitespace-nowrap active:scale-95 shadow transition-all"
                    >
                      + Añadir
                    </button>
                  </div>
                </div>

                {/* Lista de Recetas Añadidas */}
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {selectedItems.length === 0 ? (
                    <div className="text-center py-3 text-slate-500 text-xs italic">
                      Añade al menos 2 recetas finales para armar el pack.
                    </div>
                  ) : (
                    selectedItems.map((item, idx) => {
                      const prod = allFinalProducts.find(p => p.id === item.productId);
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-xl text-xs border border-slate-800"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{item.quantity}x</span>
                            <span className="text-slate-300">{item.name || prod?.name}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-slate-400 font-mono">
                              S/ {((prod?.price || 0) * item.quantity).toFixed(2)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-rose-400 hover:text-rose-300 font-bold px-1"
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

              {/* Métricas y Calculadora en Vivo */}
              {selectedItems.length > 0 && (
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-slate-400">Suma Precios de Carta:</span>
                      <div className="font-bold text-white text-sm">
                        S/ {modalMetrics.regularPriceSum.toFixed(2)}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400">Costo BOM Total:</span>
                      <div className="font-bold text-white text-sm">
                        S/ {modalMetrics.totalBomCost.toFixed(2)}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-amber-300 font-bold">Precio Sugerido (30% FC):</span>
                      <div className="font-black text-amber-400 text-base">
                        S/ {modalMetrics.suggestedPrice30.toFixed(2)}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Piso 45%: S/ {modalMetrics.floorPrice45.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {modalPriceNum > 0 && (
                    <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-emerald-400 font-bold">
                        <TrendingDown className="w-3.5 h-3.5" />
                        <span>Ahorro: S/ {modalMetrics.clientSavings.toFixed(2)} ({modalMetrics.discountPercent}%)</span>
                      </div>
                      <div>
                        <span className="text-slate-400 mr-1.5">Food Cost:</span>
                        <span
                          className={`font-black ${
                            modalMetrics.foodCostPercent <= 30
                              ? 'text-emerald-400'
                              : modalMetrics.foodCostPercent <= 45
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {modalMetrics.foodCostPercent}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!name.trim() || selectedItems.length === 0}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/20"
                >
                  {editingComboId ? 'ACTUALIZAR COMBO' : 'GUARDAR & ACTIVAR COMBO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
