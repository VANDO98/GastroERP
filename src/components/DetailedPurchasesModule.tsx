import React, { useState } from 'react';
import {
  FileText, Plus, Search, Calendar, Trash2, Eye, X, Building, CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { DetailedPurchaseInvoice, DetailedPurchaseItem } from '../types';

export const DetailedPurchasesModule: React.FC = () => {
  const { detailedInvoices, addDetailedInvoice, ingredients, suppliers, themeMode } = useApp();
  const isLight = themeMode === 'light';

  const [viewMode, setViewMode] = useState<'list' | 'create'>('list');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedInvoiceForDetail, setSelectedInvoiceForDetail] = useState<DetailedPurchaseInvoice | null>(null);

  const [supplier, setSupplier] = useState<string>('');
  const [showSupplierSuggestions, setShowSupplierSuggestions] = useState<boolean>(false);
  const [docType, setDocType] = useState<'Factura' | 'Boleta'>('Factura');
  const [series, setSeries] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [paymentType, setPaymentType] = useState<'Contado' | 'Al crédito (1 cuotas pend.)'>('Contado');
  const [notes, setNotes] = useState<string>('');

  const [gridItems, setGridItems] = useState<DetailedPurchaseItem[]>([]);

  // Autocomplete buscador para añadir materia prima
  const [ingSearchInput, setIngSearchInput] = useState<string>('');
  const [showIngSuggestions, setShowIngSuggestions] = useState<boolean>(false);

  // Filtrado de proveedores sugeridos según lo escrito
  const filteredSupplierSuggestions = (suppliers || []).filter(s => {
    if (!s.isActive) return false;
    if (!supplier.trim()) return true; // Si está vacío muestra los primeros
    const term = supplier.toLowerCase();
    return s.name.toLowerCase().includes(term) || (s.ruc && s.ruc.includes(term));
  }).slice(0, 6);

  const filteredIngSuggestions = ingredients.filter(ing => {
    if (!ingSearchInput.trim()) return false;
    const term = ingSearchInput.toLowerCase();
    return (
      ing.name.toLowerCase().includes(term) ||
      (ing.code && ing.code.toLowerCase().includes(term))
    );
  }).slice(0, 8);

  const handleSelectAutocompleteIng = (ing: typeof ingredients[0]) => {
    const newItem: DetailedPurchaseItem = {
      id: 'g-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      ingredientId: ing.id,
      code: ing.code || 'S/C',
      name: ing.name.toUpperCase(),
      itemType: ing.itemType,
      presentation: ing.unit === 'kg' ? 'KILOS' : ing.unit === 'L' ? 'LITROS' : 'UNIDADES',
      quantity: 1.0,
      warehouse: 'Almacén Principal',
      isTaxAffected: ing.isTaxAffected ?? false,
      unitValue: ing.costPerUnit || 0,
      costVariationPercent: 0.0,
      discount: 0.0,
      subtotal: ing.costPerUnit || 0,
      taxAmount: ing.isTaxAffected ? Number(((ing.costPerUnit || 0) * 0.18).toFixed(2)) : 0,
      total: ing.costPerUnit || 0
    };

    setGridItems(prev => [...prev, newItem]);
    setIngSearchInput('');
    setShowIngSuggestions(false);
  };

  const handleUpdateGridRow = (
    id: string,
    field: 'quantity' | 'unitValue' | 'discount' | 'warehouse' | 'isTaxAffected',
    val: any
  ) => {
    setGridItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          const qty = field === 'quantity' ? parseFloat(val) || 0 : item.quantity;
          const unitVal = field === 'unitValue' ? parseFloat(val) || 0 : item.unitValue;
          const disc = field === 'discount' ? parseFloat(val) || 0 : item.discount;
          const wh = field === 'warehouse' ? val : item.warehouse;
          const isTax = field === 'isTaxAffected' ? Boolean(val) : item.isTaxAffected;

          const rawSubtotal = qty * unitVal;
          const subtotalAfterDisc = Math.max(0, rawSubtotal - disc);
          const taxAmt = isTax ? Number((subtotalAfterDisc * 0.18).toFixed(2)) : 0;
          const totalRow = subtotalAfterDisc;

          const masterIng = ingredients.find(i => i.id === item.ingredientId);
          const oldCost = masterIng?.costPerUnit || unitVal;
          const varPercent = oldCost > 0 ? Number((((unitVal - oldCost) / oldCost) * 100).toFixed(1)) : 0;

          return {
            ...item,
            quantity: qty,
            unitValue: unitVal,
            discount: disc,
            warehouse: wh,
            isTaxAffected: isTax,
            subtotal: Number(subtotalAfterDisc.toFixed(2)),
            taxAmount: taxAmt,
            total: Number(totalRow.toFixed(2)),
            costVariationPercent: varPercent
          };
        }
        return item;
      })
    );
  };

  const handleRemoveGridRow = (id: string) => {
    setGridItems(prev => prev.filter(item => item.id !== id));
  };

  const totalSubtotal = gridItems.reduce((acc, curr) => acc + curr.subtotal, 0);
  const totalTaxes = gridItems.reduce((acc, curr) => acc + curr.taxAmount, 0);
  const totalInvoice = totalSubtotal;
  const taxableOp = gridItems.filter(i => i.isTaxAffected).reduce((acc, curr) => acc + curr.subtotal, 0);
  const unaffectedOp = gridItems.filter(i => !i.isTaxAffected).reduce((acc, curr) => acc + curr.subtotal, 0);

  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (gridItems.length === 0) return;

    const newCode = (8500 + detailedInvoices.length).toString();
    const newInvoice: DetailedPurchaseInvoice = {
      id: 'inv-' + Date.now(),
      codeNumber: newCode,
      registerDate: new Date().toLocaleDateString('es-PE') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      purchaseDate: new Date().toLocaleDateString('es-PE') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      documentType: docType,
      series: series.toUpperCase(),
      number: invoiceNumber,
      local: 'Sabor & Fruta - Carabayllo',
      supplier: supplier.toUpperCase(),
      paymentType,
      currency: 'PEN',
      taxOption: 'IMPUESTOS INCLUIDOS',
      items: gridItems,
      subtotal: totalSubtotal,
      globalDiscount: 0.0,
      taxableOperation: taxableOp,
      unaffectedOperation: unaffectedOp,
      taxes: totalTaxes,
      total: totalInvoice,
      notes,
      status: 'Activo'
    };

    addDetailedInvoice(newInvoice);
    setViewMode('list');
  };

  const totalSpentPurchases = detailedInvoices.reduce((acc, curr) => acc + curr.total, 0);
  const averagePurchase = detailedInvoices.length > 0 ? totalSpentPurchases / detailedInvoices.length : 0;
  const totalTaxable = detailedInvoices.reduce((acc, curr) => acc + curr.taxableOperation, 0);
  const totalUnaffected = detailedInvoices.reduce((acc, curr) => acc + curr.unaffectedOperation, 0);

  const filteredInvoices = detailedInvoices.filter(inv => {
    const matchesSearch =
      inv.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.series.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.codeNumber.includes(searchTerm);

    let matchesDate = true;
    if (startDate) {
      matchesDate = matchesDate && inv.purchaseDate >= startDate;
    }
    if (endDate) {
      matchesDate = matchesDate && inv.purchaseDate <= endDate + ' 23:59';
    }

    return matchesSearch && matchesDate;
  });

  return (
    <div className={'flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col ' + (isLight ? 'bg-slate-100 text-slate-800' : 'bg-slate-950 text-slate-100')}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className={'p-4 rounded-2xl border ' + (isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800')}>
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">▲ Histórico Total</span>
          <div className="text-xl font-black text-emerald-400 mt-1">S/ {totalSpentPurchases.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <span className="text-xs text-slate-400">Total compras abastecidas</span>
        </div>

        <div className={'p-4 rounded-2xl border ' + (isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800')}>
          <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">📊 Promedio</span>
          <div className="text-xl font-black text-cyan-400 mt-1">S/ {averagePurchase.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <span className="text-xs text-slate-400">Ticket promedio</span>
        </div>

        <div className={'p-4 rounded-2xl border ' + (isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800')}>
          <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">📦 Desglose SUNAT</span>
          <div className="text-sm font-black text-purple-300 mt-1">Gravadas: S/ {totalTaxable.toFixed(2)}</div>
          <span className="text-[11px] text-slate-400">Inafectas: S/ {totalUnaffected.toFixed(2)}</span>
        </div>

        <div className={'p-4 rounded-2xl border ' + (isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800')}>
          <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">🧾 Comprobantes</span>
          <div className="text-xl font-black text-amber-400 mt-1">{detailedInvoices.length}</div>
          <span className="text-xs text-slate-400">Facturas / Boletas</span>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5" /> Local: Sabor & Fruta - Carabayllo
              </span>

              <div className={'flex items-center gap-2 px-3 py-1 rounded-2xl border ' + (isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-800')}>
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-400 font-semibold">Desde:</span>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-transparent text-xs font-mono focus:outline-none" />
                <span className="text-xs text-slate-400 font-semibold">Hasta:</span>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-transparent text-xs font-mono focus:outline-none" />
                {(startDate || endDate) && (
                  <button onClick={() => { setStartDate(''); setEndDate(''); }} className="text-[11px] text-rose-400 hover:text-rose-300 font-bold ml-1">✕</button>
                )}
              </div>

              <div className={'flex items-center gap-2 px-3 py-1.5 rounded-2xl border ' + (isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-800')}>
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input type="text" placeholder="Buscar proveedor o número..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-transparent text-xs placeholder-slate-500 focus:outline-none w-44" />
              </div>
            </div>

            <button
              onClick={() => setViewMode('create')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs shadow-lg shadow-cyan-600/30 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>REGISTRAR COMPRA DETALLADA</span>
            </button>
          </div>

          <div className={'rounded-3xl border shadow-2xl flex flex-col ' + (isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800')}>
            <div className="overflow-auto max-h-[62vh] rounded-3xl">
              <table className="w-full text-xs text-left relative">
                <thead className={'text-[11px] uppercase tracking-wider font-bold border-b sticky top-0 z-10 shadow-sm backdrop-blur-md ' + (isLight ? 'bg-slate-100/95 text-slate-700 border-slate-200' : 'bg-slate-950/95 text-slate-300 border-slate-800')}>
                  <tr>
                    <th className="px-4 py-3">Cód.</th>
                    <th className="px-4 py-3">Registro</th>
                    <th className="px-4 py-3">Compra</th>
                    <th className="px-3 py-3 text-center">Docs. vinc.</th>
                    <th className="px-4 py-3">Comprobante</th>
                    <th className="px-4 py-3">Serie</th>
                    <th className="px-4 py-3">Nro.</th>
                    <th className="px-4 py-3">Local</th>
                    <th className="px-4 py-3">Proveedor</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3">Pago</th>
                    <th className="px-4 py-3 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className={'divide-y font-mono ' + (isLight ? 'divide-slate-200 text-slate-700' : 'divide-slate-800 text-slate-300')}>
                  {filteredInvoices.map(inv => (
                    <tr
                      key={inv.id}
                      className={'transition-colors cursor-pointer ' + (isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40')}
                      onClick={() => setSelectedInvoiceForDetail(inv)}
                    >
                      <td className="px-4 py-3 font-bold text-cyan-400">{inv.codeNumber}</td>
                      <td className="px-4 py-3 text-[11px] font-sans text-slate-400">{inv.registerDate}</td>
                      <td className="px-4 py-3 text-[11px] font-sans">{inv.purchaseDate}</td>
                      <td className="px-3 py-3 text-center">
                        {inv.linkedPoNumber ? (
                          <span
                            title={`Canjeada desde Orden de Compra: ${inv.linkedPoNumber}`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 font-mono"
                          >
                            <FileText className="w-3 h-3" />
                            <span>1</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-sans font-semibold">
                        <span className={'px-2 py-0.5 rounded-full text-[10px] ' + (inv.documentType === 'Factura' ? 'bg-blue-500/20 text-blue-300' : 'bg-amber-500/20 text-amber-300')}>
                          {inv.documentType}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-300">{inv.series}</td>
                      <td className="px-4 py-3 font-bold text-white">{inv.number}</td>
                      <td className="px-4 py-3 font-sans text-[11px] text-slate-400">{inv.local}</td>
                      <td className="px-4 py-3 font-sans font-bold text-white">{inv.supplier}</td>
                      <td className="px-4 py-3 text-right font-black text-emerald-400 text-sm">S/ {inv.total.toFixed(2)}</td>
                      <td className="px-4 py-3 font-sans text-[11px]">{inv.paymentType}</td>
                      <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedInvoiceForDetail(inv)}
                          className="px-2.5 py-1 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 font-bold text-[11px] transition-all flex items-center gap-1 mx-auto"
                        >
                          <Eye className="w-3 h-3" /> Ver Detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSaveInvoice} className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-500 font-bold">Módulo ERP de Abastecimiento</span>
              <h2 className={'text-xl font-black mt-0.5 ' + (isLight ? 'text-slate-900' : 'text-white')}>Ingreso Detallado de Factura / Boleta</h2>
            </div>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={'px-4 py-2 rounded-xl text-xs font-bold transition-colors ' + (isLight ? 'bg-slate-200 text-slate-800 hover:bg-slate-300' : 'bg-slate-800 text-slate-300 hover:bg-slate-700')}
            >
              ← Volver al Listado
            </button>
          </div>

          <div className={'p-4 rounded-3xl border grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 ' + (isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800')}>
            <div className="lg:col-span-2 relative">
              <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
                <span>Proveedor</span>
                <span className="text-[9px] text-cyan-500 font-semibold cursor-pointer" onClick={() => setShowSupplierSuggestions(true)}>
                  Ver catálogo ({suppliers.filter(s => s.isActive).length})
                </span>
              </label>
              <input
                type="text"
                placeholder="Escriba o seleccione de la BD..."
                value={supplier}
                onChange={e => {
                  setSupplier(e.target.value);
                  setShowSupplierSuggestions(true);
                }}
                onFocus={() => setShowSupplierSuggestions(true)}
                className={'w-full mt-1 px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-cyan-500 ' + (isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-white')}
                required
              />

              {/* Desplegable de sugerencias de proveedores */}
              {showSupplierSuggestions && (
                <div
                  className={`absolute top-full left-0 right-0 mt-1 z-40 rounded-2xl border shadow-2xl max-h-52 overflow-y-auto divide-y ${
                    isLight ? 'bg-white border-slate-200 divide-slate-100' : 'bg-slate-900 border-slate-700 divide-slate-800'
                  }`}
                >
                  <div className="px-3 py-1.5 flex items-center justify-between text-[10px] font-mono text-slate-400 bg-slate-500/5">
                    <span>PROVEEDORES REGISTRADOS</span>
                    <button type="button" onClick={() => setShowSupplierSuggestions(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕ Cerrar</button>
                  </div>
                  {filteredSupplierSuggestions.length === 0 ? (
                    <div className="p-3 text-xs text-slate-400 text-center">
                      No hay coincidencias en la BD (puede escribir un nombre nuevo)
                    </div>
                  ) : (
                    filteredSupplierSuggestions.map(s => (
                      <div
                        key={s.id}
                        onClick={() => {
                          setSupplier(s.name);
                          setShowSupplierSuggestions(false);
                        }}
                        className={`p-2.5 cursor-pointer flex items-center justify-between transition-colors ${
                          isLight ? 'hover:bg-cyan-50 text-slate-800' : 'hover:bg-cyan-950/40 text-slate-200'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs">{s.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {s.code} {s.ruc ? `• RUC: ${s.ruc}` : ''}
                          </div>
                        </div>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400">
                          {s.category.replace('_', ' ')}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400">Tipo Doc.</label>
              <select value={docType} onChange={e => setDocType(e.target.value as any)} className={'w-full mt-1 px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-cyan-500 ' + (isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-white')}>
                <option value="Factura">Factura</option>
                <option value="Boleta">Boleta</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400">Serie</label>
              <input type="text" value={series} onChange={e => setSeries(e.target.value)} className={'w-full mt-1 px-3 py-2 rounded-xl text-xs font-bold border font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500 ' + (isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-white')} required />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400">Número</label>
              <input type="text" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} className={'w-full mt-1 px-3 py-2 rounded-xl text-xs font-bold border font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500 ' + (isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-white')} required />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400">Pago</label>
              <select value={paymentType} onChange={e => setPaymentType(e.target.value as any)} className={'w-full mt-1 px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-cyan-500 ' + (isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-white')}>
                <option value="Contado">Contado</option>
                <option value="Al crédito (1 cuotas pend.)">Al crédito (1 cuota)</option>
              </select>
            </div>
          </div>

          {/* Buscador Autocomplete para Añadir Insumo / Empaque / Consumible */}
          <div className="relative p-3 bg-cyan-950/20 border border-cyan-500/30 rounded-2xl">
            <label className="block text-xs font-bold text-cyan-400 mb-1.5">
              Buscador de Insumos / Empaques (Escriba para autocompletar):
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-cyan-500" />
              <input
                type="text"
                placeholder="Escriba el nombre o código del insumo (ej. Papaya, Crema, Caja, Fresa)..."
                value={ingSearchInput}
                onChange={e => {
                  setIngSearchInput(e.target.value);
                  setShowIngSuggestions(true);
                }}
                onFocus={() => setShowIngSuggestions(true)}
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                  isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-900 border-slate-700 text-white'
                }`}
              />

              {/* Menú desplegable de sugerencias mientras escribe */}
              {showIngSuggestions && ingSearchInput.trim().length > 0 && (
                <div className={`absolute top-full left-0 right-0 mt-1 z-30 rounded-2xl border shadow-2xl max-h-60 overflow-y-auto divide-y ${
                  isLight ? 'bg-white border-slate-200 divide-slate-100' : 'bg-slate-900 border-slate-700 divide-slate-800'
                }`}>
                  {filteredIngSuggestions.length === 0 ? (
                    <div className="p-3 text-xs text-slate-400 text-center">
                      No se encontraron insumos que coincidan con "{ingSearchInput}"
                    </div>
                  ) : (
                    filteredIngSuggestions.map(ing => (
                      <div
                        key={ing.id}
                        onClick={() => handleSelectAutocompleteIng(ing)}
                        className={`p-3 cursor-pointer flex items-center justify-between transition-colors ${
                          isLight ? 'hover:bg-cyan-50 text-slate-800' : 'hover:bg-cyan-950/40 text-slate-200'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400">
                              {ing.code}
                            </span>
                            <span className="font-black text-xs">{ing.name}</span>
                            <span className="text-[10px] text-slate-400 capitalize">({ing.itemType})</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Stock actual: {ing.stock} {ing.unit} • {ing.isTaxAffected ? 'Afecto IGV (18%)' : 'Inafecto'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-xs text-emerald-500">
                            S/ {ing.costPerUnit.toFixed(2)}/{ing.unit}
                          </span>
                          <span className="block text-[10px] text-cyan-400 font-bold">+ Seleccionar</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className={'rounded-3xl border shadow-2xl flex flex-col ' + (isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800')}>
            <div className="overflow-auto max-h-[62vh] rounded-3xl">
              <table className="w-full text-xs text-left relative">
                <thead className={'text-[11px] uppercase tracking-wider font-bold border-b sticky top-0 z-10 shadow-sm backdrop-blur-md ' + (isLight ? 'bg-slate-100/95 text-slate-700 border-slate-200' : 'bg-slate-950/95 text-slate-300 border-slate-800')}>
                  <tr>
                    <th className="px-3 py-2.5">Código</th>
                    <th className="px-3 py-2.5">Descripción de Materia Prima</th>
                    <th className="px-3 py-2.5">Presentación</th>
                    <th className="px-3 py-2.5 w-24">Cantidad</th>
                    <th className="px-3 py-2.5 w-24">V. Unit (S/)</th>
                    <th className="px-3 py-2.5 text-center">IGV (18%)</th>
                    <th className="px-3 py-2.5 text-center">Variación %</th>
                    <th className="px-3 py-2.5 text-right">Subtotal</th>
                    <th className="px-3 py-2.5 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className={'divide-y ' + (isLight ? 'divide-slate-200 text-slate-800' : 'divide-slate-800 text-slate-200')}>
                  {gridItems.map(item => (
                    <tr key={item.id} className={isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'}>
                      <td className="px-3 py-2 font-mono font-bold text-cyan-400">{item.code}</td>
                      <td className="px-3 py-2 font-black">{item.name}</td>
                      <td className="px-3 py-2 font-semibold text-slate-400">{item.presentation}</td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          step="0.01"
                          value={item.quantity}
                          onChange={e => handleUpdateGridRow(item.id, 'quantity', e.target.value)}
                          className={'w-20 px-2 py-1 rounded-lg border font-mono font-bold text-right ' + (isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-white')}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          step="0.01"
                          value={item.unitValue}
                          onChange={e => handleUpdateGridRow(item.id, 'unitValue', e.target.value)}
                          className={'w-20 px-2 py-1 rounded-lg border font-mono font-bold text-right text-emerald-400 ' + (isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-800')}
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={item.isTaxAffected}
                          onChange={e => handleUpdateGridRow(item.id, 'isTaxAffected', e.target.checked)}
                          className="w-4 h-4 rounded text-cyan-600 cursor-pointer"
                        />
                      </td>
                      <td className="px-3 py-2 text-center font-mono font-bold">
                        <span className={item.costVariationPercent > 0 ? 'text-rose-400' : item.costVariationPercent < 0 ? 'text-emerald-400' : 'text-slate-400'}>
                          {item.costVariationPercent > 0 ? `+${item.costVariationPercent}%` : `${item.costVariationPercent}%`}
                        </span>
                      </td>
                      <td className={'px-3 py-2 text-right font-mono font-black text-sm ' + (isLight ? 'text-slate-900' : 'text-white')}>
                        S/ {item.subtotal.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveGridRow(item.id)}
                          className="text-rose-400 hover:text-rose-300 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={'flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl border shadow-lg ' + (isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800')}>
            <div className="flex items-center gap-6">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Gravadas (18%)</span>
                <div className={'text-sm font-mono font-bold ' + (isLight ? 'text-slate-800' : 'text-slate-300')}>S/ {taxableOp.toFixed(2)}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Inafectas</span>
                <div className={'text-sm font-mono font-bold ' + (isLight ? 'text-slate-800' : 'text-slate-300')}>S/ {unaffectedOp.toFixed(2)}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">IGV Total</span>
                <div className="text-sm font-mono font-bold text-cyan-600 dark:text-cyan-400">S/ {totalTaxes.toFixed(2)}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">TOTAL COMPROBANTE</span>
                <div className="text-xl font-mono font-black text-emerald-600 dark:text-emerald-400">S/ {totalInvoice.toFixed(2)}</div>
              </div>
            </div>

            <button
              type="submit"
              disabled={gridItems.length === 0}
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-black text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>GUARDAR Y ACTUALIZAR COSTOS DINÁMICOS FIFO</span>
            </button>
          </div>
        </form>
      )}

      {selectedInvoiceForDetail && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={'border rounded-3xl p-5 max-w-2xl w-full shadow-2xl animate-in fade-in zoom-in-95 ' + (isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-white')}>
            <div className="flex items-start justify-between pb-3 border-b border-slate-700">
              <div>
                <span className="text-xs font-mono uppercase font-bold text-cyan-400">
                  Comprobante Cód. {selectedInvoiceForDetail.codeNumber}
                </span>
                <h3 className="text-lg font-black mt-0.5">
                  {selectedInvoiceForDetail.documentType} {selectedInvoiceForDetail.series}-{selectedInvoiceForDetail.number}
                </h3>
                <p className="text-xs text-slate-400">Proveedor: <b>{selectedInvoiceForDetail.supplier}</b></p>
              </div>
              <button
                onClick={() => setSelectedInvoiceForDetail(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              {selectedInvoiceForDetail.linkedPoNumber && (
                <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-800/60 text-xs">
                  <div className="font-bold text-cyan-400 mb-1.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Órdenes de compra vinculadas (1)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px] text-slate-300">
                    <div>Cód. OC: <b className="text-amber-400">{selectedInvoiceForDetail.linkedPoNumber}</b></div>
                    <div>Fecha Registro: {selectedInvoiceForDetail.purchaseDate}</div>
                    <div>Importe: <b className="text-emerald-400">S/ {selectedInvoiceForDetail.total.toFixed(2)}</b></div>
                  </div>
                </div>
              )}

              <div className="text-xs font-bold text-slate-400">Detalle de Insumos Comprados:</div>
              <div className="border border-slate-800 rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-2.5">Insumo</th>
                      <th className="p-2.5 text-right">Cant.</th>
                      <th className="p-2.5 text-right">Costo Unit.</th>
                      <th className="p-2.5 text-center">IGV</th>
                      <th className="p-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono">
                    {selectedInvoiceForDetail.items.map(item => (
                      <tr key={item.id}>
                        <td className="p-2.5 font-sans font-semibold text-white">{item.name}</td>
                        <td className="p-2.5 text-right">{item.quantity} {item.presentation}</td>
                        <td className="p-2.5 text-right text-emerald-400">S/ {item.unitValue.toFixed(2)}</td>
                        <td className="p-2.5 text-center">{item.isTaxAffected ? '18%' : 'Inafecto'}</td>
                        <td className="p-2.5 text-right font-black text-white">S/ {item.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-2xl flex items-center justify-between text-xs">
                <span className="text-slate-400">Fecha de compra: <b>{selectedInvoiceForDetail.purchaseDate}</b></span>
                <span className="text-sm font-black text-emerald-400">Total: S/ {selectedInvoiceForDetail.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedInvoiceForDetail(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
