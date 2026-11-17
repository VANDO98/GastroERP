import React, { useState } from 'react';
import {
  Building2,
  Users,
  CheckCircle2,
  Plus,
  Trash2,
  Edit3,
  Save,
  Store,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Layers,
  Settings,
  Coffee,
  SunMedium,
  UtensilsCrossed,
  FolderPlus,
  Palette
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { CompanyConfig, TableConfig, MenuLine, Category } from '../types';

export const SettingsModule: React.FC = () => {
  const {
    companyConfig,
    updateCompanyConfig,
    tablesConfig,
    addTableConfig,
    updateTableConfig,
    deleteTableConfig,
    tables,
    menuConfig,
    updateMenuConfig,
    themeMode
  } = useApp();

  const isLight = themeMode === 'light';
  const [activeTab, setActiveTab] = useState<'company' | 'tables' | 'lines'>('company');

  // Estado local para formulario de datos de empresa
  const [companyForm, setCompanyForm] = useState<CompanyConfig>({ ...companyConfig });
  const [companySavedNotice, setCompanySavedNotice] = useState<boolean>(false);

  // Modal para agregar / editar mesa
  const [showTableModal, setShowTableModal] = useState<boolean>(false);
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [tableNumberName, setTableNumberName] = useState<string>('');
  const [tableZone, setTableZone] = useState<'salon' | 'terraza' | 'barra' | 'llevar'>('salon');
  const [tableCapacity, setTableCapacity] = useState<number>(4);

  // Modal para agregar / editar Línea de Menú
  const [showLineModal, setShowLineModal] = useState<boolean>(false);
  const [editingLineId, setEditingLineId] = useState<string | null>(null);
  const [lineFormName, setLineFormName] = useState<string>('');
  const [lineFormColor, setLineFormColor] = useState<string>('cyan'); // cyan, rose, amber, emerald, purple, orange

  // Modal para agregar Categoría a una Línea
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [targetLineIdForCat, setTargetLineIdForCat] = useState<string>('');
  const [catFormName, setCatFormName] = useState<string>('');
  const [catFormIcon, setCatFormIcon] = useState<string>('🍽️');

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyConfig(companyForm);
    setCompanySavedNotice(true);
    setTimeout(() => setCompanySavedNotice(false), 3000);
  };

  const handleOpenAddTable = () => {
    setEditingTableId(null);
    setTableNumberName(`Mesa ${tablesConfig.filter(t => t.zone === 'salon').length + 1}`);
    setTableZone('salon');
    setTableCapacity(4);
    setShowTableModal(true);
  };

  const handleOpenEditTable = (tbl: TableConfig) => {
    setEditingTableId(tbl.id);
    setTableNumberName(tbl.numberName);
    setTableZone(tbl.zone);
    setTableCapacity(tbl.capacity);
    setShowTableModal(true);
  };

  const handleSaveTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableNumberName.trim()) return;

    if (editingTableId) {
      const existing = tablesConfig.find(t => t.id === editingTableId);
      if (existing) {
        updateTableConfig({
          ...existing,
          numberName: tableNumberName.trim(),
          zone: tableZone,
          capacity: Number(tableCapacity) || 4
        });
      }
    } else {
      addTableConfig({
        numberName: tableNumberName.trim(),
        zone: tableZone,
        capacity: Number(tableCapacity) || 4,
        isActive: true
      });
    }

    setShowTableModal(false);
  };

  const handleDeleteTable = (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de eliminar la ${name}? Esta acción no se puede deshacer.`)) {
      deleteTableConfig(id);
    }
  };

  // Handlers para Líneas de Carta
  const handleOpenAddLine = () => {
    setEditingLineId(null);
    setLineFormName('');
    setLineFormColor('cyan');
    setShowLineModal(true);
  };

  const handleOpenEditLine = (line: MenuLine) => {
    setEditingLineId(line.id);
    setLineFormName(line.name);
    const color = line.id.includes('caliente') ? 'rose' : line.id.includes('fria') ? 'cyan' : 'orange';
    setLineFormColor(color);
    setShowLineModal(true);
  };

  const handleSaveLine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lineFormName.trim()) return;

    const colorStyles: Record<string, { accentColor: string; badgeColor: string; activeTabClass: string }> = {
      cyan: { accentColor: '#06b6d4', badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', activeTabClass: 'bg-cyan-600 text-white shadow-cyan-600/30' },
      rose: { accentColor: '#f43f5e', badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30', activeTabClass: 'bg-rose-600 text-white shadow-rose-600/30' },
      amber: { accentColor: '#f59e0b', badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30', activeTabClass: 'bg-amber-600 text-white shadow-amber-600/30' },
      emerald: { accentColor: '#10b981', badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', activeTabClass: 'bg-emerald-600 text-white shadow-emerald-600/30' },
      purple: { accentColor: '#8b5cf6', badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30', activeTabClass: 'bg-purple-600 text-white shadow-purple-600/30' },
      orange: { accentColor: '#ea580c', badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30', activeTabClass: 'bg-orange-600 text-white shadow-orange-600/30' }
    };

    const chosenTheme = colorStyles[lineFormColor] || colorStyles.orange;

    if (editingLineId) {
      const updatedLines = menuConfig.lines.map(line => {
        if (line.id !== editingLineId) return line;
        return {
          ...line,
          name: lineFormName.trim(),
          theme: chosenTheme
        };
      });
      updateMenuConfig({ ...menuConfig, lines: updatedLines });
    } else {
      const newLineId = `line-${Date.now().toString(36)}`;
      const newLine: MenuLine = {
        id: newLineId,
        name: lineFormName.trim(),
        theme: chosenTheme,
        categories: []
      };
      updateMenuConfig({ ...menuConfig, lines: [...menuConfig.lines, newLine] });
    }

    setShowLineModal(false);
  };

  const handleDeleteLine = (line: MenuLine) => {
    const totalProds = line.categories.reduce((acc, c) => acc + c.products.length, 0);
    if (totalProds > 0) {
      alert(`No se puede eliminar la línea "${line.name}" porque contiene ${totalProds} producto(s) en sus categorías. Mueve o elimina los productos primero.`);
      return;
    }
    if (window.confirm(`¿Estás seguro de eliminar la línea "${line.name}"?`)) {
      const updatedLines = menuConfig.lines.filter(l => l.id !== line.id);
      updateMenuConfig({ ...menuConfig, lines: updatedLines });
    }
  };

  // Handlers para Categorías de Carta
  const handleOpenAddCategory = (lineId: string) => {
    setTargetLineIdForCat(lineId);
    setCatFormName('');
    setCatFormIcon('🍽️');
    setShowCategoryModal(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catFormName.trim() || !targetLineIdForCat) return;

    const newCatId = `cat-${Date.now().toString(36)}`;
    const newCategory: Category = {
      id: newCatId,
      name: catFormName.trim(),
      icon: catFormIcon.trim() || '🍽️',
      products: []
    };

    const updatedLines = menuConfig.lines.map(line => {
      if (line.id !== targetLineIdForCat) return line;
      return {
        ...line,
        categories: [...line.categories, newCategory]
      };
    });

    updateMenuConfig({ ...menuConfig, lines: updatedLines });
    setShowCategoryModal(false);
  };

  const handleDeleteCategory = (lineId: string, category: Category) => {
    if (category.products.length > 0) {
      alert(`No se puede eliminar la categoría "${category.name}" porque tiene ${category.products.length} producto(s) registrados.`);
      return;
    }
    if (window.confirm(`¿Eliminar la categoría "${category.name}"?`)) {
      const updatedLines = menuConfig.lines.map(line => {
        if (line.id !== lineId) return line;
        return {
          ...line,
          categories: line.categories.filter(c => c.id !== category.id)
        };
      });
      updateMenuConfig({ ...menuConfig, lines: updatedLines });
    }
  };

  const zoneColors: Record<string, { label: string; badge: string; icon: string }> = {
    salon: { label: 'Salón Principal', badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30', icon: '🍽️' },
    terraza: { label: 'Terraza Aire Libre', badge: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/30', icon: '🌿' },
    barra: { label: 'Barra Rápida', badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30', icon: '☕' },
    llevar: { label: 'Para Llevar / Delivery', badge: 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30', icon: '🛍️' }
  };

  const totalCapacity = tablesConfig.reduce((acc, curr) => acc + (curr.capacity || 0), 0);

  return (
    <div className={`flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col space-y-5 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'}`}>
      {/* Header */}
      <div className={`flex flex-wrap items-center justify-between gap-3 pb-4 border-b ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
        <div>
          <span className={`text-[10px] font-mono uppercase tracking-wider font-bold ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>
            Módulo de Administración & Parámetros
          </span>
          <h2 className="text-xl font-black flex items-center gap-2 mt-0.5">
            <Settings className={`w-5 h-5 ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
            <span>Configuración General del Local</span>
          </h2>
        </div>

        {/* Pestañas de Navegación Interna */}
        <div className={`flex items-center p-1 rounded-2xl border ${isLight ? 'bg-slate-200/80 border-slate-300' : 'bg-slate-900 border-slate-800'}`}>
          <button
            onClick={() => setActiveTab('company')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'company'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : isLight
                ? 'text-slate-700 hover:text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Datos de la Empresa & OC</span>
          </button>

          <button
            onClick={() => setActiveTab('tables')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'tables'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : isLight
                ? 'text-slate-700 hover:text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Mesas del Local ({tablesConfig.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('lines')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'lines'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : isLight
                ? 'text-slate-700 hover:text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Líneas & Carta ({menuConfig.lines.length})</span>
          </button>
        </div>
      </div>

      {/* ================= PESTAÑA 1: DATOS DE LA EMPRESA ================= */}
      {activeTab === 'company' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl">
          {/* Formulario */}
          <div className={`lg:col-span-7 rounded-3xl border p-6 space-y-4 shadow-sm ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-black text-base flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-500" />
                  <span>Identidad Comercial & Fiscal</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Estos datos se imprimen automáticamente en el membrete de las Órdenes de Compra (OC) y comprobantes.
                </p>
              </div>

              {companySavedNotice && (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>¡Guardado!</span>
                </span>
              )}
            </div>

            <form onSubmit={handleSaveCompany} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Razón Social (Fiscal)</label>
                  <input
                    type="text"
                    required
                    value={companyForm.businessName}
                    onChange={e => setCompanyForm({ ...companyForm, businessName: e.target.value })}
                    className={`w-full p-2.5 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Nombre Comercial (Carta/Marca)</label>
                  <input
                    type="text"
                    required
                    value={companyForm.tradeName}
                    onChange={e => setCompanyForm({ ...companyForm, tradeName: e.target.value })}
                    className={`w-full p-2.5 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">RUC (11 dígitos)</label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      maxLength={11}
                      required
                      value={companyForm.ruc}
                      onChange={e => setCompanyForm({ ...companyForm, ruc: e.target.value.replace(/\D/g, '') })}
                      className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-mono font-bold border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Teléfono / WhatsApp de Compras</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={companyForm.phone}
                      onChange={e => setCompanyForm({ ...companyForm, phone: e.target.value })}
                      className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Dirección del Local / Almacén</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={companyForm.address}
                    onChange={e => setCompanyForm({ ...companyForm, address: e.target.value })}
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Correo Electrónico Comercial</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="email"
                      value={companyForm.email}
                      onChange={e => setCompanyForm({ ...companyForm, email: e.target.value })}
                      className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Moneda Operativa</label>
                  <input
                    type="text"
                    disabled
                    value="PEN (Soles Peruanos - S/)"
                    className={`w-full p-2.5 rounded-xl text-xs font-bold border opacity-70 ${
                      isLight ? 'bg-slate-100 border-slate-300 text-slate-600' : 'bg-slate-950 border-slate-700 text-slate-400'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Notas de Recepción / Condiciones para Proveedores
                </label>
                <textarea
                  rows={2}
                  value={companyForm.notes || ''}
                  onChange={e => setCompanyForm({ ...companyForm, notes: e.target.value })}
                  placeholder="Ej: Horario de recepción: Lunes a Sábado de 07:00 a 10:30 hrs..."
                  className={`w-full p-2.5 rounded-xl text-xs font-medium border resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4 stroke-[3]" />
                <span>GUARDAR DATOS DE LA EMPRESA</span>
              </button>
            </form>
          </div>

          {/* Tarjeta de Vista Previa del Membrete */}
          <div className={`lg:col-span-5 rounded-3xl border p-6 space-y-4 shadow-sm self-start ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
              Vista Previa Membrete Oficial (OC & Facturación)
            </span>

            <div className={`p-4 rounded-2xl border space-y-3 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-dashed border-slate-300 dark:border-slate-800">
                <div>
                  <h4 className="font-black text-sm text-amber-500 uppercase tracking-tight">
                    {companyForm.tradeName || 'FUENTE DE SODA'}
                  </h4>
                  <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    {companyForm.businessName || 'RAZÓN SOCIAL S.A.C.'}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500">
                    RUC: {companyForm.ruc || '20XXXXXXXXX'}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-lg font-black border border-amber-500/20">
                  🥤
                </div>
              </div>

              <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span className="line-clamp-1">{companyForm.address || 'Av. Universitaria, Carabayllo'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span>{companyForm.phone || '+51 999 999 999'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span>{companyForm.email || 'contacto@empresa.pe'}</span>
                </div>
              </div>

              {companyForm.notes && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] italic text-slate-400">
                  "{companyForm.notes}"
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              💡 Este membrete aparecerá automáticamente en el encabezado de todas las <strong>Órdenes de Compra (OC)</strong> que emitas a tus proveedores de frutas, abarrotes y lácteos.
            </p>
          </div>
        </div>
      )}

      {/* ================= PESTAÑA 2: CONFIGURACIÓN DE MESAS ================= */}
      {activeTab === 'tables' && (
        <div className="space-y-4 max-w-6xl">
          {/* Métricas y Botón Nueva Mesa */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`px-4 py-2.5 rounded-2xl border text-xs ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Mesas Activas:</span>
                <span className="text-lg font-black font-mono text-amber-500">{tablesConfig.length} mesas</span>
              </div>

              <div className={`px-4 py-2.5 rounded-2xl border text-xs ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Aforo Total Salón:</span>
                <span className="text-lg font-black font-mono text-emerald-500">{totalCapacity} comensales</span>
              </div>
            </div>

            <button
              onClick={handleOpenAddTable}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>CREAR NUEVA MESA</span>
            </button>
          </div>

          {/* Grilla Visual de Mesas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {tablesConfig.map(tbl => {
              const zoneInfo = zoneColors[tbl.zone] || zoneColors.salon;
              const currentTableState = tables.find(t => t.tableId === tbl.id);
              const isOccupied = currentTableState && currentTableState.items.length > 0;

              return (
                <div
                  key={tbl.id}
                  className={`p-4 rounded-3xl border transition-all space-y-3 relative group ${
                    isLight
                      ? 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg shadow-inner">
                        {zoneInfo.icon}
                      </div>
                      <div>
                        <h4 className="font-black text-sm leading-tight">{tbl.numberName}</h4>
                        <span className="text-[10px] font-mono text-slate-400 block">
                          Capacidad: {tbl.capacity} personas
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditTable(tbl)}
                        title="Editar mesa"
                        className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-amber-400 flex items-center justify-center transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTable(tbl.id, tbl.numberName)}
                        title="Eliminar mesa"
                        className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-400 flex items-center justify-center transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${zoneInfo.badge}`}>
                      {zoneInfo.label}
                    </span>

                    <span className={`font-bold text-[10px] ${isOccupied ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {isOccupied ? '🔴 Con Comanda' : '🟢 Libre'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= PESTAÑA 3: ESTRUCTURA DE CARTA & LÍNEAS ================= */}
      {activeTab === 'lines' && (
        <div className="space-y-6 max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl">
            <div>
              <h3 className="font-black text-sm text-amber-500 flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4" />
                <span>Gestión de Líneas y Secciones de Carta</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Crea, renombra o elimina las líneas del menú (ej. Línea Fría, Línea Caliente, Cafetería, Barra) y sus categorías internas.
              </p>
            </div>
            <button
              onClick={handleOpenAddLine}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>NUEVA LÍNEA DE MENÚ</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {menuConfig.lines.map(line => {
              const totalProducts = line.categories.reduce((acc, c) => acc + c.products.length, 0);

              return (
                <div
                  key={line.id}
                  className={`rounded-3xl border p-5 flex flex-col justify-between shadow-sm space-y-4 ${
                    isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full shadow-sm"
                          style={{ backgroundColor: line.theme?.accentColor || '#f59e0b' }}
                        />
                        <div>
                          <h4 className="font-black text-base flex items-center gap-2">
                            <span>{line.name}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                              {line.id}
                            </span>
                          </h4>
                          <span className="text-[11px] text-slate-400 font-semibold">
                            {line.categories.length} categoría(s) • {totalProducts} producto(s)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditLine(line)}
                          className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-amber-500/10 transition-colors"
                          title="Editar línea"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLine(line)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors"
                          title="Eliminar línea"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Categorías dentro de la línea */}
                    <div className="pt-3 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
                        <span>Categorías asignadas:</span>
                        <button
                          onClick={() => handleOpenAddCategory(line.id)}
                          className="text-[11px] text-amber-500 hover:text-amber-400 flex items-center gap-1 font-extrabold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Categoría</span>
                        </button>
                      </div>

                      {line.categories.length === 0 ? (
                        <div className="text-center py-4 text-xs text-slate-500 italic bg-slate-950/30 rounded-xl border border-dashed border-slate-800">
                          Sin categorías. Haz clic en "+ Categoría" para añadir una.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {line.categories.map(cat => (
                            <div
                              key={cat.id}
                              className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold ${
                                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/50 border-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="text-base">{cat.icon || '🍽️'}</span>
                                <span className="truncate">{cat.name}</span>
                                <span className="text-[10px] text-slate-500 font-mono">({cat.products.length})</span>
                              </div>
                              <button
                                onClick={() => handleDeleteCategory(line.id, cat)}
                                className="text-slate-500 hover:text-rose-400 p-1"
                                title="Eliminar categoría"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal para Crear / Editar Línea de Menú */}
      {showLineModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-black text-lg text-white flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-amber-500" />
                <span>{editingLineId ? 'Editar Línea de Menú' : 'Nueva Línea de Menú'}</span>
              </h3>
              <button
                onClick={() => setShowLineModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLine} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nombre de la Línea *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Cafetería & Pastelería, Tragos & Bar, Línea Caliente"
                  value={lineFormName}
                  onChange={e => setLineFormName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Color / Tema de la Pestaña</label>
                <select
                  value={lineFormColor}
                  onChange={e => setLineFormColor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-bold focus:outline-none"
                >
                  <option value="cyan">🔵 Cyan (Fríos / Bebidas)</option>
                  <option value="rose">🔴 Rosa / Rojo (Calientes / Cocina)</option>
                  <option value="amber">🟡 Ámbar (Cafetería / Dulces)</option>
                  <option value="emerald">🟢 Esmeralda (Saludable / Fresco)</option>
                  <option value="purple">🟣 Violeta (Bar / Cocteles)</option>
                  <option value="orange">🟠 Naranja (Platos / Fast Food)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLineModal(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/20 active:scale-95"
                >
                  {editingLineId ? 'ACTUALIZAR LÍNEA' : 'CREAR LÍNEA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Crear Categoría en Línea */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-black text-lg text-white flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-amber-500" />
                <span>Añadir Categoría</span>
              </h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nombre de la Categoría *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Jugos Naturales, Postres, Piqueos"
                  value={catFormName}
                  onChange={e => setCatFormName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Ícono / Emoji</label>
                <input
                  type="text"
                  placeholder="Ej: 🥤, 🥪, 🍰, ☕"
                  value={catFormIcon}
                  onChange={e => setCatFormIcon(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-bold text-center focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/20 active:scale-95"
                >
                  CREAR CATEGORÍA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL CREAR / EDITAR MESA ================= */}
      {showTableModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-black text-base text-white flex items-center gap-2">
                <Store className="w-5 h-5 text-amber-400" />
                <span>{editingTableId ? 'Editar Mesa' : 'Nueva Mesa del Local'}</span>
              </h3>
              <button
                onClick={() => setShowTableModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTable} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nombre o Número de Mesa</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Mesa 7, Terraza 3, Barra 2"
                  value={tableNumberName}
                  onChange={e => setTableNumberName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Zona del Local</label>
                  <select
                    value={tableZone}
                    onChange={e => setTableZone(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-semibold focus:outline-none"
                  >
                    <option value="salon">🍽️ Salón Principal</option>
                    <option value="terraza">🌿 Terraza</option>
                    <option value="barra">☕ Barra</option>
                    <option value="llevar">🛍️ Para Llevar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Capacidad (Sillas)</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    required
                    value={tableCapacity}
                    onChange={e => setTableCapacity(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowTableModal(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/20 active:scale-95"
                >
                  {editingTableId ? 'ACTUALIZAR MESA' : 'CREAR MESA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
