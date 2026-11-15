import React, { useState, useMemo } from 'react';
import {
  ClipboardList,
  Search,
  ArrowDownRight,
  ArrowUpRight,
  Package,
  Calendar,
  Layers,
  Building2,
  DollarSign
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export interface KardexMovement {
  id: string;
  date: string;
  timestamp: number;
  type: 'compra' | 'produccion_entrada' | 'venta_salida' | 'merma_salida' | 'batch_consumo';
  typeLabel: string;
  referenceDoc: string; // "Factura F001-8501", "Ticket #102", "Batch Pulpa", etc.
  quantityIn: number;
  quantityOut: number;
  unitCost: number;
  balanceQty: number;
  balanceValue: number;
  notes?: string;
}

export const KardexModule: React.FC = () => {
  const {
    ingredients,
    detailedInvoices,
    orders,
    batches,
    wastes,
    themeMode
  } = useApp();
  const isLight = themeMode === 'light';

  // Insumo seleccionado para consultar su Kárdex
  const [selectedIngId, setSelectedIngId] = useState<string>(ingredients[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [timeFilter, setTimeFilter] = useState<'today' | '7days' | 'month' | 'all'>('all');

  const selectedIng = ingredients.find(i => i.id === selectedIngId) || ingredients[0];

  // Construir cronológicamente todos los movimientos del insumo
  const allMovements = useMemo(() => {
    if (!selectedIng) return [];
    const targetId = selectedIng.id;
    const moves: Omit<KardexMovement, 'balanceQty' | 'balanceValue'>[] = [];

    // 1. Entradas por Compras Detalladas
    detailedInvoices.forEach(inv => {
      inv.items.forEach(item => {
        if (item.ingredientId === targetId) {
          const moveDate = inv.purchaseDate || inv.registerDate;
          const ts = new Date(inv.registerDate).getTime() || Date.now();
          moves.push({
            id: `mov-pur-${inv.id}-${item.id}`,
            date: moveDate,
            timestamp: isNaN(ts) ? Date.now() : ts,
            type: 'compra',
            typeLabel: 'Entrada por Compra',
            referenceDoc: `${inv.documentType} ${inv.series}-${inv.number} (${inv.supplier})`,
            quantityIn: item.quantity,
            quantityOut: 0,
            unitCost: item.unitValue,
            notes: `Proveedor: ${inv.supplier}`
          });
        }
      });
    });

    // 2. Entradas por Batches o Rescates (cuando este insumo fue el producto terminado)
    batches.forEach(b => {
      if (b.outputIngredientId === targetId) {
        const ts = new Date(b.date).getTime();
        moves.push({
          id: `mov-batch-in-${b.id}`,
          date: new Date(b.date).toLocaleDateString('es-PE') + ' ' + new Date(b.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: ts,
          type: 'produccion_entrada',
          typeLabel: 'Entrada Producción / Rescate',
          referenceDoc: b.name,
          quantityIn: b.outputQuantity,
          quantityOut: 0,
          unitCost: b.outputQuantity > 0 ? Number((b.costEstimate / b.outputQuantity).toFixed(2)) : 0,
          notes: 'Transformación interna de cocina'
        });
      }

      // 3. Salidas por Consumo de insumos al preparar otro Batch
      b.consumedIngredients.forEach(ci => {
        if (ci.ingredientId === targetId) {
          const ts = new Date(b.date).getTime();
          moves.push({
            id: `mov-batch-out-${b.id}-${ci.ingredientId}`,
            date: new Date(b.date).toLocaleDateString('es-PE') + ' ' + new Date(b.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: ts,
            type: 'batch_consumo',
            typeLabel: 'Salida Consumo en Batch',
            referenceDoc: `Consumo para: ${b.name}`,
            quantityIn: 0,
            quantityOut: ci.quantity,
            unitCost: selectedIng.costPerUnit,
            notes: 'Materia prima procesada'
          });
        }
      });
    });

    // 4. Salidas por Ventas de Salón / Para Llevar (Recetas BOM consumidas)
    orders.forEach(order => {
      let qtyConsumed = 0;
      const isTargetSugar = targetId.includes('azucar') || selectedIng.name.toLowerCase().includes('azucar') || selectedIng.name.toLowerCase().includes('azúcar');

      order.items.forEach(orderItem => {
        const hasSinAzucar = orderItem.selectedModifiers?.some(
          m => m.id === 'mod-sin-azucar' || m.label.toLowerCase().includes('sin azucar') || m.label.toLowerCase().includes('sin azúcar')
        );

        orderItem.recipeBom.forEach(bom => {
          if (bom.ingredientId === targetId) {
            // Regla estricta: si el cliente pidió Sin Azúcar, anula el consumo de azúcar
            if (hasSinAzucar && isTargetSugar) {
              return;
            }
            qtyConsumed += bom.quantity * orderItem.quantity;
          }
        });
      });

      // Descartables manuales libres si aplican a este insumo
      if (order.manualDisposables) {
        order.manualDisposables.forEach(m => {
          if (m.ingredientId === targetId) {
            qtyConsumed += m.quantity;
          }
        });
      }

      if (qtyConsumed > 0) {
        const ts = new Date(order.createdAt).getTime();
        moves.push({
          id: `mov-sale-${order.id}`,
          date: new Date(order.createdAt).toLocaleDateString('es-PE') + ' ' + new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: ts,
          type: 'venta_salida',
          typeLabel: 'Salida por Venta',
          referenceDoc: `Ticket #${order.ticketNumber} (${order.tableName || 'Mostrador'})`,
          quantityIn: 0,
          quantityOut: Number(qtyConsumed.toFixed(3)),
          unitCost: selectedIng.costPerUnit,
          notes: `Cliente: ${order.customerName || 'Cliente general'}`
        });
      }
    });

    // 5. Salidas por Mermas Registradas
    wastes.forEach(w => {
      if (w.ingredientId === targetId) {
        const ts = new Date(w.date).getTime();
        moves.push({
          id: `mov-waste-${w.id}`,
          date: new Date(w.date).toLocaleDateString('es-PE') + ' ' + new Date(w.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: ts,
          type: 'merma_salida',
          typeLabel: 'Salida por Merma',
          referenceDoc: `Merma: ${w.reason.replace('_', ' ')}`,
          quantityIn: 0,
          quantityOut: w.quantity,
          unitCost: selectedIng.costPerUnit,
          notes: `Pérdida registrada: -S/ ${w.costLost.toFixed(2)}`
        });
      }
    });

    // Ordenar de más antiguo a más reciente para calcular saldos continuos
    moves.sort((a, b) => a.timestamp - b.timestamp);

    // Si no hay movimientos históricos o hay stock inicial, inicializar con saldo
    let currentBalance = selectedIng.stock;
    // Si la suma de entradas - salidas no iguala el stock actual, ajustar movimiento inicial
    const totalIn = moves.reduce((acc, m) => acc + m.quantityIn, 0);
    const totalOut = moves.reduce((acc, m) => acc + m.quantityOut, 0);
    const initialOpeningStock = Number((selectedIng.stock - (totalIn - totalOut)).toFixed(3));

    const finalMoves: KardexMovement[] = [];

    // Saldo inicial si existe
    let runningQty = 0;
    if (initialOpeningStock > 0) {
      runningQty = initialOpeningStock;
      finalMoves.push({
        id: `mov-initial-${targetId}`,
        date: 'Saldo Inicial de Apertura',
        timestamp: 0,
        type: 'compra',
        typeLabel: 'Inventario Inicial',
        referenceDoc: 'Apertura de Almacén',
        quantityIn: initialOpeningStock,
        quantityOut: 0,
        unitCost: selectedIng.costPerUnit,
        balanceQty: runningQty,
        balanceValue: Number((runningQty * selectedIng.costPerUnit).toFixed(2)),
        notes: 'Stock de apertura'
      });
    }

    // Calcular saldos acumulados paso a paso
    moves.forEach(m => {
      runningQty = Number((runningQty + m.quantityIn - m.quantityOut).toFixed(3));
      finalMoves.push({
        ...m,
        balanceQty: runningQty,
        balanceValue: Number((runningQty * (m.unitCost || selectedIng.costPerUnit)).toFixed(2))
      });
    });

    // Invertir para mostrar el más reciente arriba en la vista del usuario
    return finalMoves.reverse();
  }, [selectedIng, detailedInvoices, orders, batches, wastes]);

  // Filtrado temporal
  const filteredMovements = useMemo(() => {
    if (timeFilter === 'all') return allMovements;
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    return allMovements.filter(m => {
      if (m.timestamp === 0) return true; // Mantener siempre saldo inicial si aplica
      if (timeFilter === 'today') {
        return new Date(m.timestamp).toDateString() === new Date().toDateString();
      }
      if (timeFilter === '7days') {
        return now - m.timestamp <= 7 * oneDay;
      }
      if (timeFilter === 'month') {
        return now - m.timestamp <= 30 * oneDay;
      }
      return true;
    });
  }, [allMovements, timeFilter]);

  // Métricas acumuladas del insumo
  const totalEntries = filteredMovements.reduce((acc, m) => acc + m.quantityIn, 0);
  const totalExits = filteredMovements.reduce((acc, m) => acc + m.quantityOut, 0);
  const totalValuation = selectedIng ? Number((selectedIng.stock * selectedIng.costPerUnit).toFixed(2)) : 0;

  // Filtrado del selector de insumos (Ordenado estrictamente A-Z)
  const filteredIngList = useMemo(() => {
    return [...ingredients]
      .filter(i => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        return (
          i.name.toLowerCase().includes(term) ||
          (i.code && i.code.toLowerCase().includes(term))
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
  }, [ingredients, searchTerm]);

  // Si el usuario escribe y el insumo actual no está entre los resultados, auto-seleccionar el primer match
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      const match = ingredients.find(
        i =>
          i.name.toLowerCase().includes(term.toLowerCase()) ||
          (i.code && i.code.toLowerCase().includes(term.toLowerCase()))
      );
      if (match) {
        setSelectedIngId(match.id);
      }
    }
  };

  return (
    <div className={`flex-1 overflow-y-auto p-4 sm:p-6 ${isLight ? 'bg-slate-100 text-slate-800' : 'bg-slate-950 text-slate-100'}`}>
      <div className="max-w-6xl mx-auto space-y-5">

        {/* Encabezado Kárdex */}
        <div className={`p-5 rounded-3xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className={`text-[10px] font-mono uppercase tracking-wider font-bold ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`}>
                Control Contable & Valuación de Existencias
              </span>
              <h2 className={`text-xl font-black flex items-center gap-2 mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <ClipboardList className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <span>Kárdex Físico - Valorizado (Método FIFO)</span>
              </h2>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Trazabilidad detallada de entradas por compras, salidas por ventas en salón, mermas y traslados a batches.
              </p>
            </div>

            {/* Filtros de Tiempo */}
            <div className={`flex p-1 rounded-2xl border ${isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-950 border-slate-800'}`}>
              {[
                { id: 'today', label: 'Hoy' },
                { id: '7days', label: '7 días' },
                { id: 'month', label: 'Este mes' },
                { id: 'all', label: 'Histórico' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTimeFilter(t.id as any)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    timeFilter === t.id
                      ? 'bg-cyan-600 text-white shadow-md'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Selector de Insumo con Buscador Rápido Interactivo */}
          <div className="mt-4 pt-4 border-t border-dashed border-slate-200 dark:border-slate-800 space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar insumo o código (ej. Papaya, DSC-001)..."
                  value={searchTerm}
                  onChange={e => handleSearchChange(e.target.value)}
                  className={`w-full pl-9 pr-8 py-2 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                    }}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs font-black"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="md:col-span-2">
                <select
                  value={selectedIng?.id || ''}
                  onChange={e => setSelectedIngId(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-black border focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                >
                  {filteredIngList.length === 0 ? (
                    <option value="">Sin coincidencias para "{searchTerm}"</option>
                  ) : (
                    filteredIngList.map(ing => (
                      <option key={ing.id} value={ing.id}>
                        [{ing.code || 'S/C'}] {ing.name} ({ing.unit.toUpperCase()}) • Stock: {ing.stock} • S/ {ing.costPerUnit.toFixed(2)}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Sugerencias Rápidas al Tipear */}
            {searchTerm.trim() && filteredIngList.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 font-bold">Coincidencias ({filteredIngList.length}):</span>
                {filteredIngList.slice(0, 6).map(ing => (
                  <button
                    key={ing.id}
                    onClick={() => {
                      setSelectedIngId(ing.id);
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border transition-all ${
                      selectedIng?.id === ing.id
                        ? 'bg-cyan-600 text-white border-cyan-500 shadow-sm'
                        : isLight
                        ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {ing.name} ({ing.stock} {ing.unit})
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tarjetas de Resumen del Insumo Seleccionado */}
        {selectedIng && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                <span>Stock Actual</span>
                <Package className="w-4 h-4 text-cyan-500" />
              </div>
              <div className={`text-2xl font-black mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {selectedIng.stock} <span className="text-sm font-bold text-slate-400">{selectedIng.unit}</span>
              </div>
              <span className={`text-[10px] font-mono ${selectedIng.stock <= selectedIng.minStock ? 'text-rose-500 font-bold' : 'text-slate-400'}`}>
                Mínimo de seguridad: {selectedIng.minStock} {selectedIng.unit}
              </span>
            </div>

            <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                <span>Costo Unitario (FIFO)</span>
                <DollarSign className="w-4 h-4 text-amber-500" />
              </div>
              <div className={`text-2xl font-black mt-1 ${isLight ? 'text-amber-800' : 'text-amber-400'}`}>
                S/ {selectedIng.costPerUnit.toFixed(2)}
              </div>
              <span className="text-[10px] text-slate-400">Por {selectedIng.unit} de medida</span>
            </div>

            <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                <span>Total Entradas</span>
                <ArrowDownRight className="w-4 h-4 text-emerald-500" />
              </div>
              <div className={`text-2xl font-black mt-1 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                +{totalEntries.toFixed(2)} <span className="text-sm font-bold text-slate-400">{selectedIng.unit}</span>
              </div>
              <span className="text-[10px] text-slate-400">Compras + Batches en período</span>
            </div>

            <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                <span>Valorización Total</span>
                <Layers className="w-4 h-4 text-purple-500" />
              </div>
              <div className={`text-2xl font-black mt-1 ${isLight ? 'text-purple-700' : 'text-purple-400'}`}>
                S/ {totalValuation.toFixed(2)}
              </div>
              <span className="text-[10px] text-slate-400">Existencias valorizadas en almacén</span>
            </div>
          </div>
        )}

        {/* Tabla Kárdex de Movimientos */}
        <div className={`rounded-3xl border overflow-hidden shadow-2xl ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
          <div className="p-4 border-b flex flex-wrap items-center justify-between gap-2 bg-slate-500/5">
            <div>
              <h3 className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Libro de Movimientos de Almacén: {selectedIng?.name}
              </h3>
              <p className="text-[11px] text-slate-400">
                Mostrando {filteredMovements.length} transacciones registradas
              </p>
            </div>
            <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full font-bold border ${
              selectedIng?.isTaxAffected
                ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
            }`}>
              {selectedIng?.isTaxAffected ? 'Afecto IGV (18%)' : 'Inafecto IGV'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className={`text-[11px] uppercase tracking-wider font-extrabold border-b ${
                isLight ? 'bg-slate-100 text-slate-800 border-slate-200' : 'bg-slate-950/80 text-slate-400 border-slate-800'
              }`}>
                <tr>
                  <th className="px-4 py-3">Fecha y Hora</th>
                  <th className="px-4 py-3">Tipo de Operación</th>
                  <th className="px-4 py-3">Comprobante / Referencia</th>
                  <th className="px-4 py-3 text-right">Entrada</th>
                  <th className="px-4 py-3 text-right">Salida</th>
                  <th className="px-4 py-3 text-right">Costo Unit.</th>
                  <th className="px-4 py-3 text-right">Saldo Físico</th>
                  <th className="px-4 py-3 text-right">Saldo Valorizado</th>
                </tr>
              </thead>
              <tbody className={`divide-y font-mono ${isLight ? 'divide-slate-200 text-slate-700' : 'divide-slate-800 text-slate-300'}`}>
                {filteredMovements.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400 font-sans">
                      No se registran movimientos para este insumo en el período seleccionado.
                    </td>
                  </tr>
                ) : (
                  filteredMovements.map(m => {
                    const isEntry = m.quantityIn > 0;
                    return (
                      <tr key={m.id} className={isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'}>
                        <td className="px-4 py-3 text-[11px] font-sans text-slate-400 whitespace-nowrap">
                          {m.date}
                        </td>

                        <td className="px-4 py-3 font-sans">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            m.type === 'compra'
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                              : m.type === 'produccion_entrada'
                              ? 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30'
                              : m.type === 'venta_salida'
                              ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30'
                              : m.type === 'merma_salida'
                              ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30'
                              : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
                          }`}>
                            {isEntry ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                            {m.typeLabel}
                          </span>
                        </td>

                        <td className="px-4 py-3 font-sans font-semibold text-xs">
                          <div>{m.referenceDoc}</div>
                          {m.notes && <div className="text-[10px] text-slate-400 font-normal">{m.notes}</div>}
                        </td>

                        <td className="px-4 py-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                          {m.quantityIn > 0 ? `+${m.quantityIn.toFixed(2)} ${selectedIng?.unit}` : '—'}
                        </td>

                        <td className="px-4 py-3 text-right font-black text-rose-600 dark:text-rose-400">
                          {m.quantityOut > 0 ? `-${m.quantityOut.toFixed(2)} ${selectedIng?.unit}` : '—'}
                        </td>

                        <td className="px-4 py-3 text-right">
                          S/ {m.unitCost.toFixed(2)}
                        </td>

                        <td className={`px-4 py-3 text-right font-black text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {m.balanceQty.toFixed(2)} <span className="text-[10px] font-normal text-slate-400">{selectedIng?.unit}</span>
                        </td>

                        <td className={`px-4 py-3 text-right font-black ${isLight ? 'text-slate-900' : 'text-cyan-400'}`}>
                          S/ {m.balanceValue.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
