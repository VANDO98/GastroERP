import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Pencil,
  CheckCircle2,
  XCircle,
  Search,
  Phone,
  Mail,
  MapPin,
  Hash,
  Tag
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Supplier, SupplierCategory } from '../types';

// Mapa de categorías para etiquetas y colores
const categoryConfig: Record<SupplierCategory, { label: string; color: string }> = {
  frutas_verduras:      { label: '🍍 Frutas & Verduras',       color: 'bg-lime-500/15 text-lime-700 dark:text-lime-300 border-lime-500/30' },
  lacteos_derivados:    { label: '🥛 Lácteos & Derivados',     color: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30' },
  proteinas_carnes:     { label: '🍗 Proteínas & Carnes',      color: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30' },
  abarrotes_secos:      { label: '🌾 Abarrotes & Secos',       color: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30' },
  descartables_envases: { label: '📦 Descartables & Envases',  color: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30' },
  limpieza_consumibles: { label: '🧴 Limpieza & Consumibles',  color: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30' },
  otros:                { label: '📌 Otros',                   color: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30' }
};

const emptyForm = (): Omit<Supplier, 'id' | 'code' | 'createdAt'> => ({
  name: '',
  ruc: '',
  phone: '',
  email: '',
  address: '',
  category: 'otros',
  isActive: true,
  notes: ''
});

export const SuppliersModule: React.FC = () => {
  const { suppliers, addSupplier, updateSupplier, themeMode } = useApp();
  const isLight = themeMode === 'light';

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<SupplierCategory | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const showNotif = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Filtros
  const filtered = suppliers.filter(s => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.ruc || '').includes(search) ||
      s.code.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === 'all' || s.category === filterCategory;
    return matchSearch && matchCat;
  });

  const openNew = () => {
    setEditingSupplier(null);
    setForm(emptyForm());
    setShowModal(true);
  };

  const openEdit = (s: Supplier) => {
    setEditingSupplier(s);
    setForm({
      name: s.name,
      ruc: s.ruc || '',
      phone: s.phone || '',
      email: s.email || '',
      address: s.address || '',
      category: s.category,
      isActive: s.isActive,
      notes: s.notes || ''
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    if (editingSupplier) {
      updateSupplier({ ...editingSupplier, ...form });
      showNotif(`Proveedor "${form.name}" actualizado.`);
    } else {
      addSupplier(form);
      showNotif(`Proveedor "${form.name}" registrado con éxito.`);
    }
    setShowModal(false);
  };

  const toggleActive = (s: Supplier) => {
    updateSupplier({ ...s, isActive: !s.isActive });
    showNotif(`${s.name} ${s.isActive ? 'inactivado' : 'activado'}.`);
  };

  const field = (label: string, key: keyof typeof form, placeholder: string, type = 'text') => (
    <div>
      <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
        {label}
      </label>
      <input
        type={type}
        value={String(form[key] ?? '')}
        onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
        placeholder={placeholder}
        className={`w-full border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
          isLight ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400' : 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
        }`}
      />
    </div>
  );

  return (
    <div className={`flex-1 overflow-y-auto p-3 sm:p-6 ${isLight ? 'bg-slate-100' : 'bg-slate-950'}`}>
      <div className={`max-w-5xl mx-auto space-y-5`}>

        {/* Header */}
        <div className={`rounded-3xl border p-4 sm:p-5 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className={`text-[10px] font-mono uppercase tracking-wider font-bold ${isLight ? 'text-orange-600' : 'text-orange-400'}`}>
                Gestión Admin • Base de Datos
              </span>
              <h2 className={`text-xl font-black flex items-center gap-2 mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <Building2 className="w-5 h-5 text-orange-500" />
                Proveedores
              </h2>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {suppliers.filter(s => s.isActive).length} activos · {suppliers.length} total
              </p>
            </div>
            <button
              onClick={openNew}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-black shadow-md shadow-orange-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              Nuevo Proveedor
            </button>
          </div>

          {/* Notificación */}
          {feedbackMsg && (
            <div className="mt-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs p-3 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="font-semibold">{feedbackMsg}</span>
            </div>
          )}
        </div>

        {/* Filtros */}
        <div className={`rounded-2xl border p-3 flex flex-wrap gap-2 items-center ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
          {/* Buscador */}
          <div className={`flex items-center gap-2 border rounded-xl px-3 py-2 flex-1 min-w-48 ${isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'}`}>
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre, RUC o código..."
              className="flex-1 text-xs bg-transparent outline-none placeholder-slate-400"
            />
          </div>

          {/* Filtro Categoría */}
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value as SupplierCategory | 'all')}
            className={`border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none ${
              isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-white'
            }`}
          >
            <option value="all">Todos los rubros</option>
            {(Object.entries(categoryConfig) as [SupplierCategory, { label: string }][]).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
        </div>

        {/* Grid de tarjetas */}
        {filtered.length === 0 ? (
          <div className={`rounded-2xl border p-10 text-center ${isLight ? 'bg-white border-slate-200 text-slate-500' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
            <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-semibold text-sm">No hay proveedores que coincidan</p>
            <p className="text-xs mt-1">Ajusta los filtros o registra un nuevo proveedor.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(s => {
              const catCfg = categoryConfig[s.category];
              return (
                <div
                  key={s.id}
                  className={`rounded-2xl border p-4 space-y-3 transition-all ${
                    isLight
                      ? `bg-white border-slate-200 ${!s.isActive ? 'opacity-50' : ''}`
                      : `bg-slate-900 border-slate-800 ${!s.isActive ? 'opacity-50' : ''}`
                  }`}
                >
                  {/* Cabecera tarjeta */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded-md border ${isLight ? 'bg-slate-100 border-slate-300 text-slate-500' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                          {s.code}
                        </span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${catCfg.color}`}>
                          {catCfg.label}
                        </span>
                        {!s.isActive && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-500 border border-slate-500/30">
                            INACTIVO
                          </span>
                        )}
                      </div>
                      <h3 className={`text-sm font-black mt-1 leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {s.name}
                      </h3>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => openEdit(s)}
                        className={`p-1.5 rounded-lg transition-all ${isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-slate-800 text-slate-400'}`}
                        title="Editar"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleActive(s)}
                        className={`p-1.5 rounded-lg transition-all ${
                          s.isActive
                            ? isLight ? 'hover:bg-rose-50 text-emerald-600' : 'hover:bg-rose-900/20 text-emerald-400'
                            : isLight ? 'hover:bg-emerald-50 text-slate-400' : 'hover:bg-emerald-900/20 text-slate-500'
                        }`}
                        title={s.isActive ? 'Desactivar' : 'Activar'}
                      >
                        {s.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Detalles */}
                  <div className="space-y-1.5">
                    {s.ruc && (
                      <div className={`flex items-center gap-2 text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        <Hash className="w-3 h-3 shrink-0 text-slate-400" />
                        <span>RUC: <span className="font-bold font-mono">{s.ruc}</span></span>
                      </div>
                    )}
                    {s.phone && (
                      <div className={`flex items-center gap-2 text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        <Phone className="w-3 h-3 shrink-0 text-slate-400" />
                        <span>{s.phone}</span>
                      </div>
                    )}
                    {s.email && (
                      <div className={`flex items-center gap-2 text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        <Mail className="w-3 h-3 shrink-0 text-slate-400" />
                        <span className="truncate">{s.email}</span>
                      </div>
                    )}
                    {s.address && (
                      <div className={`flex items-center gap-2 text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                        <span className="line-clamp-1">{s.address}</span>
                      </div>
                    )}
                    {s.notes && (
                      <div className={`flex items-start gap-2 text-xs ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                        <Tag className="w-3 h-3 shrink-0 mt-0.5 text-slate-400" />
                        <span className="line-clamp-2 italic">{s.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ===== MODAL NUEVO / EDITAR ===== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-lg rounded-3xl border shadow-2xl ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700'}`}>
            {/* Modal Header */}
            <div className={`flex items-center justify-between px-5 py-4 border-b ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <div>
                <h3 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {editingSupplier ? 'Editar Proveedor' : 'Registrar Nuevo Proveedor'}
                </h3>
                {editingSupplier && (
                  <p className="text-xs text-slate-400 font-mono">{editingSupplier.code}</p>
                )}
              </div>
              <button
                onClick={() => setShowModal(false)}
                className={`p-2 rounded-xl transition-all ${isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-slate-800 text-slate-400'}`}
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-5 space-y-3 overflow-y-auto max-h-[70vh]">
              {/* Nombre Comercial */}
              <div>
                <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Nombre / Razón Social <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value.toUpperCase() }))}
                  placeholder="Ej: MERCADO MAYORISTA FRUTAS..."
                  required
                  className={`w-full border rounded-xl px-3 py-2 text-xs font-bold uppercase focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
                    isLight ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400' : 'bg-slate-950 border-slate-700 text-white placeholder-slate-500'
                  }`}
                />
              </div>

              {/* Rubro */}
              <div>
                <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Rubro
                </label>
                <select
                  value={form.category}
                  onChange={e => setForm(prev => ({ ...prev, category: e.target.value as SupplierCategory }))}
                  className={`w-full border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none ${
                    isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                >
                  {(Object.entries(categoryConfig) as [SupplierCategory, { label: string }][]).map(([key, cfg]) => (
                    <option key={key} value={key}>{cfg.label}</option>
                  ))}
                </select>
              </div>

              {/* Grid 2 columnas */}
              <div className="grid grid-cols-2 gap-3">
                {field('RUC', 'ruc', 'Ej: 20100047359')}
                {field('Teléfono', 'phone', 'Ej: 01-3621900 / 997...')}
              </div>

              {field('Email', 'email', 'ventas@proveedor.pe', 'email')}
              {field('Dirección', 'address', 'Av. / Jr. / Carretera...')}

              {/* Notas */}
              <div>
                <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Notas / Condiciones Comerciales
                </label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Ej: Entrega lunes y miércoles. Crédito 15 días..."
                  rows={3}
                  className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none resize-none ${
                    isLight ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400' : 'bg-slate-950 border-slate-700 text-white placeholder-slate-500'
                  }`}
                />
              </div>

              {/* Estado activo */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, isActive: !prev.isActive }))}
                  className={`w-10 h-5 rounded-full transition-all relative ${form.isActive ? 'bg-emerald-500' : 'bg-slate-600'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${form.isActive ? 'left-5' : 'left-0.5'}`} />
                </button>
                <span className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Proveedor {form.isActive ? 'activo' : 'inactivo'}
                </span>
              </div>

              {/* Botones */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    isLight ? 'border-slate-300 text-slate-700 hover:bg-slate-100' : 'border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-black shadow-md shadow-orange-600/30 transition-all"
                >
                  {editingSupplier ? 'Guardar Cambios' : 'Registrar Proveedor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
