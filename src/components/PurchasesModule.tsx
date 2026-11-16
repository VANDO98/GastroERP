import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  CheckCircle2,
  Package,
  Layers,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { MeasurementUnit, ItemType } from '../types';
import { SearchableSelect, type SearchableOption } from './SearchableSelect';

export const PurchasesModule: React.FC = () => {
  const { ingredients, purchases, addPurchase, suppliers, themeMode } = useApp();
  const isLight = themeMode === 'light';

  // Filtro por tipo de artículo (insumos, descartables, consumibles)
  const [activeTypeTab, setActiveTypeTab] = useState<ItemType | 'all'>('all');

  // Formulario móvil
  const [selectedIngredientId, setSelectedIngredientId] = useState<string>(ingredients[0]?.id || '');
  const [quantityStr, setQuantityStr] = useState<string>('');
  const [totalAmountStr, setTotalAmountStr] = useState<string>('');
  const [supplier, setSupplier] = useState<string>(suppliers && suppliers.length > 0 ? suppliers[0].name : 'Mercado Mayorista');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const filteredIngredients = ingredients.filter(i =>
    activeTypeTab === 'all' ? true : i.itemType === activeTypeTab
  );

  const purchaseOptions: SearchableOption[] = useMemo(() => {
    return filteredIngredients.map(ing => ({
      id: ing.id,
      code: ing.code || ing.itemType.toUpperCase(),
      label: ing.name,
      subtitle: `S/ ${ing.costPerUnit.toFixed(2)} por ${ing.unit}`,
      badge: ing.unit,
      category: ing.category
    }));
  }, [filteredIngredients]);

  const currentIngredient = ingredients.find(i => i.id === selectedIngredientId) || filteredIngredients[0] || ingredients[0];

  const quantityNum = parseFloat(quantityStr) || 0;
  const totalAmountNum = parseFloat(totalAmountStr) || 0;
  const calculatedCostPerUnit = quantityNum > 0 ? Number((totalAmountNum / quantityNum).toFixed(2)) : 0;

  const previousCost = currentIngredient?.costPerUnit || 0;
  const costDifference = calculatedCostPerUnit > 0 ? Number((calculatedCostPerUnit - previousCost).toFixed(2)) : 0;
  const costDifferencePercent = previousCost > 0 && calculatedCostPerUnit > 0
    ? Number(((costDifference / previousCost) * 100).toFixed(1))
    : 0;

  const handleQuickAddQty = (amount: number) => {
    setQuantityStr(prev => {
      const current = parseFloat(prev) || 0;
      return (current + amount).toFixed(1).replace('.0', '');
    });
  };

  const handleSavePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentIngredient || quantityNum <= 0 || totalAmountNum <= 0) return;

    addPurchase({
      ingredientId: currentIngredient.id,
      ingredientName: currentIngredient.name,
      quantity: quantityNum,
      unit: currentIngredient.unit as MeasurementUnit,
      totalAmount: totalAmountNum,
      date: new Date().toISOString(),
      supplier
    });

    setSuccessMsg(`Compra registrada en BD unificada: +${quantityNum} ${currentIngredient.unit} de ${currentIngredient.name}`);
    setQuantityStr('');
    setTotalAmountStr('');

    setTimeout(() => {
      setSuccessMsg(null);
    }, 4000);
  };

  return (
    <div className={'flex-1 overflow-y-auto p-3 sm:p-6 flex flex-col items-center ' + (isLight ? 'bg-slate-100 text-slate-800' : 'bg-slate-950 text-slate-100')}>
      <div className={'w-full max-w-md rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col gap-4 border ' + (isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800')}>
        
        {/* Header móvil */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
              Móvil Rápido • BD Central
            </span>
            <h2 className="text-lg font-black mt-0.5 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <span>Ingreso Rápido de Compras</span>
            </h2>
          </div>
          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold">
            1 Mano UX
          </span>
        </div>

        {/* Pestañas de Clasificación de Artículos */}
        <div className={'grid grid-cols-4 gap-1 p-1 rounded-2xl border text-[11px] font-bold ' + (isLight ? 'bg-slate-200 border-slate-300' : 'bg-slate-950 border-slate-800')}>
          <button
            type="button"
            onClick={() => setActiveTypeTab('all')}
            className={'py-1.5 rounded-xl transition-all ' + (activeTypeTab === 'all' ? 'bg-orange-600 text-white shadow' : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setActiveTypeTab('insumo')}
            className={'py-1.5 rounded-xl transition-all ' + (activeTypeTab === 'insumo' ? 'bg-cyan-600 text-white shadow' : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')}
          >
            Insumos
          </button>
          <button
            type="button"
            onClick={() => setActiveTypeTab('descartable')}
            className={'py-1.5 rounded-xl transition-all ' + (activeTypeTab === 'descartable' ? 'bg-purple-600 text-white shadow' : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')}
          >
            Empaques
          </button>
          <button
            type="button"
            onClick={() => setActiveTypeTab('consumible')}
            className={'py-1.5 rounded-xl transition-all ' + (activeTypeTab === 'consumible' ? 'bg-emerald-600 text-white shadow' : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')}
          >
            Limpieza
          </button>
        </div>

        {successMsg && (
          <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs p-3 rounded-2xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSavePurchase} className="flex flex-col gap-3.5">
          {/* Selector de Insumo con Autocompletado */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400">Seleccionar Artículo (Búsqueda Inteligente)</label>
            <div className="mt-1">
              <SearchableSelect
                options={purchaseOptions}
                value={currentIngredient?.id || ''}
                onChange={setSelectedIngredientId}
                placeholder="Escribe para buscar insumo..."
                searchPlaceholder="Buscar por nombre, código o categoría..."
                isLight={isLight}
              />
            </div>
          </div>

          {/* Proveedor */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase font-bold text-slate-400">Proveedor / Mercado</label>
              <span className="text-[9px] text-slate-400">De la BD o escriba uno nuevo</span>
            </div>
            <input
              type="text"
              list="suppliers-list"
              value={supplier}
              onChange={e => setSupplier(e.target.value)}
              className={'w-full mt-1 px-3 py-2 rounded-2xl text-xs font-semibold border ' + (isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-white')}
            />
            <datalist id="suppliers-list">
              {(suppliers || []).filter(s => s.isActive).map(s => (
                <option key={s.id} value={s.name}>
                  {s.code} • {s.category.replace('_', ' ')}
                </option>
              ))}
            </datalist>

            {/* Chips rápidos de proveedores */}
            <div className="flex flex-wrap gap-1 mt-1.5">
              {(suppliers || []).filter(s => s.isActive).slice(0, 4).map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSupplier(s.name)}
                  className={`text-[9px] px-2 py-0.5 rounded-lg border font-bold transition-all ${
                    supplier === s.name
                      ? 'bg-orange-600 text-white border-orange-600'
                      : isLight
                      ? 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {s.name.length > 22 ? s.name.substring(0, 20) + '...' : s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Cantidad y Atajos */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase font-bold text-slate-400">
                Cantidad Comprada ({currentIngredient?.unit ? currentIngredient.unit.toUpperCase() : 'UND'})
              </label>
              <div className="flex gap-1">
                {[1, 5, 10, 20].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleQuickAddQty(amt)}
                    className={'px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors ' + (isLight ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-slate-800 text-slate-300 hover:text-white')}
                  >
                    +{amt}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="number"
              step="0.01"
              placeholder={'0.00 ' + (currentIngredient?.unit || 'und')}
              value={quantityStr}
              onChange={e => setQuantityStr(e.target.value)}
              className={'w-full mt-1 px-3 py-2.5 rounded-2xl text-base font-black font-mono border focus:outline-none focus:ring-2 focus:ring-emerald-500 ' + (isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-white')}
              required
            />
          </div>

          {/* Monto Total */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400">Monto Total Pagado (S/ PEN)</label>
            <input
              type="number"
              step="0.01"
              placeholder="S/ 0.00"
              value={totalAmountStr}
              onChange={e => setTotalAmountStr(e.target.value)}
              className={'w-full mt-1 px-3 py-2.5 rounded-2xl text-base font-black font-mono text-emerald-600 dark:text-emerald-400 border focus:outline-none focus:ring-2 focus:ring-emerald-500 ' + (isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800')}
              required
            />
          </div>

          {/* Comparador de Costo Ponderado en Vivo */}
          {quantityNum > 0 && totalAmountNum > 0 && (
            <div className={'p-3 rounded-2xl border space-y-1.5 text-xs ' + (isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-950/80 border-slate-800')}>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Costo unitario nuevo:</span>
                <span className={'font-mono font-black ' + (isLight ? 'text-slate-900' : 'text-white')}>S/ {calculatedCostPerUnit.toFixed(2)} /{currentIngredient?.unit || 'und'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Costo promedio anterior:</span>
                <span className={'font-mono ' + (isLight ? 'text-slate-700' : 'text-slate-300')}>S/ {previousCost.toFixed(2)} /{currentIngredient?.unit || 'und'}</span>
              </div>
              <div className={'flex items-center justify-between pt-1 border-t ' + (isLight ? 'border-slate-300' : 'border-slate-800')}>
                <span className="text-slate-500">Impacto dinámico:</span>
                <span className={'font-mono font-black ' + (costDifferencePercent > 0 ? 'text-rose-500' : costDifferencePercent < 0 ? 'text-emerald-500' : 'text-slate-400')}>
                  {costDifferencePercent > 0 ? `▲ +${costDifferencePercent}% (Más caro)` : costDifferencePercent < 0 ? `▼ ${costDifferencePercent}% (Ahorro)` : '═ Igual'}
                </span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={quantityNum <= 0 || totalAmountNum <= 0}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-black text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 mt-1"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>REGISTRAR COMPRA (BD CENTRAL)</span>
          </button>
        </form>
      </div>
    </div>
  );
};
