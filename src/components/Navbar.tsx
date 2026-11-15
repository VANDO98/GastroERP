import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  ShoppingCart,
  Clock,
  BookOpen,
  Package,
  FileSpreadsheet,
  Smartphone,
  Layers,
  Sun,
  Moon,
  Zap,
  TrendingUp,
  Settings,
  Building2,
  ClipboardList,
  Receipt,
  Sparkles,
  FileText,
  Cherry,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export type NavTabType =
  | 'pos'
  | 'kds'
  | 'production'
  | 'recipes'
  | 'combos'
  | 'sales-history'
  | 'ingredients'
  | 'purchases-erp'
  | 'purchases-mobile'
  | 'suppliers'
  | 'kardex'
  | 'purchase-orders'
  | 'toppings-master'
  | 'settings';

interface NavbarProps {
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;
}

interface MenuItem {
  id: NavTabType;
  label: string;
  desc: string;
  icon: React.ReactNode;
  badge?: number | string;
}

interface MenuColumn {
  title: string;
  icon: string;
  colorClass: string;
  items: MenuItem[];
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const {
    totalSalesToday,
    ordersCountToday,
    averageFoodCostToday,
    kdsOrders,
    themeMode,
    toggleTheme,
    companyConfig
  } = useApp();

  const isLight = themeMode === 'light';
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);

  // Cerrar menú con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMegaMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Columnas del Mega Menú (Módulos de Ventas y Producción completamente aislados)
  const menuColumns: MenuColumn[] = [
    {
      title: 'PRODUCTOS & RECETAS',
      icon: '🥑',
      colorClass: 'text-amber-400 border-amber-500/30',
      items: [
        {
          id: 'ingredients',
          label: 'Insumos & Catálogo',
          desc: 'Maestro de insumos, unidades y costos base',
          icon: <Package className="w-4 h-4 text-amber-400" />
        },
        {
          id: 'recipes',
          label: 'Recetas (BOM) & Food Cost',
          desc: 'Escandallos oficiales, costo real y empaques',
          icon: <BookOpen className="w-4 h-4 text-purple-400" />
        },
        {
          id: 'toppings-master',
          label: 'Catálogo Maestro de Toppings',
          desc: 'Toppings oficiales con porción y descuento de stock',
          icon: <Cherry className="w-4 h-4 text-rose-400" />
        },
        {
          id: 'combos',
          label: 'Combos & Promociones',
          desc: 'Packs promocionales y recetas compuestas',
          icon: <Sparkles className="w-4 h-4 text-cyan-400" />
        }
      ]
    },
    {
      title: 'COMPRAS & PROVEEDORES',
      icon: '📋',
      colorClass: 'text-blue-400 border-blue-500/30',
      items: [
        {
          id: 'purchase-orders',
          label: 'Órdenes de Compra (OC)',
          desc: 'Generación formal, membrete y recepción en almacén',
          icon: <FileText className="w-4 h-4 text-blue-400" />
        },
        {
          id: 'purchases-erp',
          label: 'Facturas de Compra (ERP)',
          desc: 'Registro detallado con impuestos y lotes FIFO',
          icon: <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
        },
        {
          id: 'purchases-mobile',
          label: 'Compras Rápidas (Móvil)',
          desc: 'Ingreso veloz para compras diarias del mercado',
          icon: <Smartphone className="w-4 h-4 text-amber-400" />
        },
        {
          id: 'suppliers',
          label: 'Proveedores',
          desc: 'Directorio de proveedores y RUCs',
          icon: <Building2 className="w-4 h-4 text-orange-400" />
        }
      ]
    },
    {
      title: 'ALMACENES & KÁRDEX',
      icon: '📦',
      colorClass: 'text-cyan-400 border-cyan-500/30',
      items: [
        {
          id: 'ingredients',
          label: 'Stock de Insumos & Lotes',
          desc: 'Inventario físico, mínimos y trazabilidad FIFO',
          icon: <Package className="w-4 h-4 text-cyan-400" />
        },
        {
          id: 'kardex',
          label: 'Kárdex Valorizado (FIFO)',
          desc: 'Entradas, salidas y saldos valorizados de inventario',
          icon: <ClipboardList className="w-4 h-4 text-teal-400" />
        }
      ]
    },
    {
      title: 'PRODUCCIÓN (AISLADO)',
      icon: '🥣',
      colorClass: 'text-orange-400 border-orange-500/30',
      items: [
        {
          id: 'production',
          label: 'Mermas & Rescate de Fruta',
          desc: 'Transformación de fruta madura en pulpa y control de mermas',
          icon: <Layers className="w-4 h-4 text-orange-400" />
        }
      ]
    },
    {
      title: 'VENTAS (AISLADO)',
      icon: '💵',
      colorClass: 'text-emerald-400 border-emerald-500/30',
      items: [
        {
          id: 'pos',
          label: 'POS Mesas & Salón',
          desc: 'Toma de pedidos en mesa, salón, terraza y llevar',
          icon: <ShoppingCart className="w-4 h-4 text-emerald-400" />
        },
        {
          id: 'kds',
          label: 'KDS Pantalla de Barra',
          desc: 'Comandas en cola, tiempos < 3 min y elección de pulpa/fruta',
          icon: <Clock className="w-4 h-4 text-orange-400" />,
          badge: kdsOrders.length > 0 ? `${kdsOrders.length} activas` : undefined
        },
        {
          id: 'sales-history',
          label: 'Historial de Ventas',
          desc: 'Auditoría de tickets, costo de venta y Food Cost real',
          icon: <Receipt className="w-4 h-4 text-cyan-400" />
        }
      ]
    },
    {
      title: 'CONFIGURACIÓN',
      icon: '⚙️',
      colorClass: 'text-indigo-400 border-indigo-500/30',
      items: [
        {
          id: 'settings',
          label: 'Datos de Empresa & Membrete OC',
          desc: 'Razón social, RUC, dirección y datos para órdenes',
          icon: <Settings className="w-4 h-4 text-indigo-400" />
        },
        {
          id: 'settings',
          label: 'Configuración de Mesas',
          desc: 'Salón Principal, Terraza, Barra y capacidad',
          icon: <SlidersHorizontal className="w-4 h-4 text-purple-400" />
        }
      ]
    }
  ];

  // Identificar el nombre y descripción del módulo actual
  const currentTabTitle = (() => {
    switch (activeTab) {
      case 'pos': return { name: 'POS Mesas & Salón', icon: '🛒', group: 'Ventas' };
      case 'kds': return { name: 'KDS Pantalla de Barra', icon: '⏱️', group: 'Ventas' };
      case 'production': return { name: 'Rescate de Frutas & Mermas', icon: '🥣', group: 'Producción' };
      case 'recipes': return { name: 'Recetas (BOM) & Food Cost', icon: '📖', group: 'Productos' };
      case 'toppings-master': return { name: 'Catálogo Maestro de Toppings', icon: '🍒', group: 'Productos' };
      case 'combos': return { name: 'Combos & Promociones', icon: '✨', group: 'Productos' };
      case 'ingredients': return { name: 'Insumos y Stock', icon: '📦', group: 'Almacenes' };
      case 'kardex': return { name: 'Kárdex Valorizado (FIFO)', icon: '📋', group: 'Almacenes' };
      case 'purchase-orders': return { name: 'Órdenes de Compra (OC)', icon: '📝', group: 'Compras' };
      case 'purchases-erp': return { name: 'Facturas de Compra (ERP)', icon: '📊', group: 'Compras' };
      case 'purchases-mobile': return { name: 'Compras Rápidas (Móvil)', icon: '📱', group: 'Compras' };
      case 'suppliers': return { name: 'Proveedores', icon: '🏢', group: 'Compras' };
      case 'sales-history': return { name: 'Historial de Ventas', icon: '🧾', group: 'Ventas' };
      case 'settings': return { name: 'Configuración General & Mesas', icon: '⚙️', group: 'Sistema' };
      default: return { name: 'ERP Sabor & Fruta', icon: '🥤', group: 'General' };
    }
  })();

  const handleSelectTab = (tab: NavTabType) => {
    setActiveTab(tab);
    setIsMegaMenuOpen(false);
  };

  return (
    <>
      <header
        className={`border-b px-3 py-2 flex flex-wrap items-center justify-between gap-2.5 sticky top-0 z-40 backdrop-blur-md transition-colors ${
          isLight
            ? 'bg-white/95 border-slate-200 text-slate-900 shadow-sm'
            : 'bg-slate-950/95 border-slate-800 text-slate-100'
        }`}
      >
        {/* Lado Izquierdo: Botón Menú ≡ (Tres Rayitas) + Logo Empresa + Módulo Activo */}
        <div className="flex items-center gap-3">
          {/* Botón Hamburguesa ≡ */}
          <button
            onClick={() => setIsMegaMenuOpen(prev => !prev)}
            aria-label="Abrir Menú de Navegación"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95 border ${
              isMegaMenuOpen
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                : isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
            }`}
          >
            {isMegaMenuOpen ? <X className="w-4 h-4 stroke-[2.5]" /> : <Menu className="w-4 h-4 stroke-[2.5]" />}
            <span className="hidden sm:inline uppercase tracking-wider font-extrabold text-[11px]">
              Menú ≡
            </span>
          </button>

          {/* Logo y Razón Social */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center shadow-md font-black text-base text-slate-950 shrink-0">
              🥤
            </div>
            <div className="hidden md:block">
              <div className="flex items-center gap-1.5 leading-tight">
                <h1 className="font-black text-sm tracking-tight text-white dark:text-white">
                  {companyConfig?.tradeName || 'Sabor & Fruta'}
                </h1>
                <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Carabayllo
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                RUC {companyConfig?.ruc || '20608945123'}
              </p>
            </div>
          </div>

          {/* Badge del Módulo Actual */}
          <div className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${
            isLight ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-slate-900/80 border-slate-800 text-slate-300'
          }`}>
            <span className="text-slate-400 text-[10px] uppercase font-mono">{currentTabTitle.group} /</span>
            <span>{currentTabTitle.icon}</span>
            <span className="font-extrabold">{currentTabTitle.name}</span>
          </div>
        </div>

        {/* Centro: Accesos Directos Operativos de Alta Frecuencia (Piso de Ventas & Barra) */}
        <nav className={`flex items-center p-1 rounded-2xl border gap-1 ${
          isLight ? 'bg-slate-200/80 border-slate-300' : 'bg-slate-900/60 border-slate-800'
        }`}>
          {/* POS Mesas */}
          <button
            onClick={() => setActiveTab('pos')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${
              activeTab === 'pos'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                : isLight
                ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/70'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>POS Mesas</span>
          </button>

          {/* KDS Barra */}
          <button
            onClick={() => setActiveTab('kds')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${
              activeTab === 'kds'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                : isLight
                ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/70'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>KDS Barra</span>
            {kdsOrders.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-mono animate-bounce font-bold">
                {kdsOrders.length}
              </span>
            )}
          </button>

          {/* Producción / Rescate */}
          <button
            onClick={() => setActiveTab('production')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${
              activeTab === 'production'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                : isLight
                ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/70'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">Producción</span>
          </button>
        </nav>

        {/* Lado Derecho: Configuración + Switch Día/Noche + KPIs Rápidos */}
        <div className="flex items-center gap-2">
          {/* Botón directo a Configuración */}
          <button
            onClick={() => setActiveTab('settings')}
            title="Configuración General & Mesas"
            className={`p-2 rounded-xl border flex items-center justify-center transition-all ${
              activeTab === 'settings'
                ? 'bg-indigo-600 text-white border-indigo-500'
                : isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Switch Día / Noche */}
          <button
            onClick={toggleTheme}
            title={isLight ? 'Cambiar a Modo Noche' : 'Cambiar a Modo Día (Sol Carabayllo)'}
            className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all ${
              isLight
                ? 'bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-200'
                : 'bg-slate-900 border-slate-700 text-amber-400 hover:bg-slate-800'
            }`}
          >
            {isLight ? (
              <>
                <Sun className="w-4 h-4 text-amber-600" />
                <span className="hidden xl:inline">Día</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-amber-400" />
                <span className="hidden xl:inline">Noche</span>
              </>
            )}
          </button>

          {/* KPIs de Hoy */}
          <div className="hidden xl:flex items-center gap-3 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
            <div className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">Tickets:</span>
              <span className="font-bold text-white font-mono">{ordersCountToday}</span>
            </div>
            <div className="w-px h-3 bg-slate-800"></div>
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Ventas:</span>
              <span className="font-bold text-emerald-400 font-mono">S/ {totalSalesToday.toFixed(2)}</span>
            </div>
            <div className="w-px h-3 bg-slate-800"></div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">FC:</span>
              <span className="font-bold text-emerald-400 font-mono">{averageFoodCostToday}%</span>
            </div>
          </div>
        </div>
      </header>

      {/* MEGA MENÚ DESPLEGABLE CON MÓDULOS AISLADOS (TRES RAYITAS ≡) */}
      {isMegaMenuOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 flex flex-col items-center justify-start p-3 sm:p-6">
          <div className={`w-full max-w-7xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col ${
            isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-100'
          }`}>
            {/* Header del Mega Menú */}
            <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-amber-500/20">
                  ≡
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                    <span>Navegación del Sistema ERP</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      Sabor & Fruta Carabayllo
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Módulos operativos y de gestión organizados por departamentos independientes.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsMegaMenuOpen(false)}
                className={`p-2.5 rounded-2xl border transition-all flex items-center gap-1.5 text-xs font-bold ${
                  isLight
                    ? 'bg-slate-200 hover:bg-slate-300 text-slate-700 border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Cerrar (Esc)</span>
              </button>
            </div>

            {/* Grid de Columnas (Módulos Aislados) */}
            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
              {menuColumns.map((col, cIdx) => (
                <div
                  key={cIdx}
                  className={`rounded-2xl border p-3.5 flex flex-col space-y-2.5 transition-all ${
                    isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-950/50 border-slate-800/80'
                  }`}
                >
                  {/* Encabezado de la Columna */}
                  <div className={`pb-2 border-b flex items-center gap-2 ${col.colorClass}`}>
                    <span className="text-base">{col.icon}</span>
                    <h3 className="text-[11px] font-black uppercase tracking-wider">
                      {col.title}
                    </h3>
                  </div>

                  {/* Lista de Ítems de la Columna */}
                  <div className="space-y-1.5 flex-1">
                    {col.items.map(item => {
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id + item.label}
                          onClick={() => handleSelectTab(item.id)}
                          className={`w-full text-left p-2.5 rounded-xl transition-all flex flex-col gap-0.5 border ${
                            isActive
                              ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-sm'
                              : isLight
                              ? 'bg-white hover:bg-slate-100 border-slate-200/80 text-slate-800'
                              : 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-800/60 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1.5 font-bold text-xs">
                              {item.icon}
                              <span>{item.label}</span>
                            </div>
                            {item.badge && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-500 text-white font-bold">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <span className={`text-[10px] leading-tight ${
                            isActive ? 'text-amber-400/80' : 'text-slate-400'
                          }`}>
                            {item.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Pie del Mega Menú */}
            <div className={`p-3.5 border-t flex flex-wrap items-center justify-between gap-2 text-xs ${
              isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>ERP Sabor & Fruta • Arquitectura Multicapa (Ventas, Producción y Logística Aisladas)</span>
              </div>
              <span className="font-mono text-[11px]">
                {companyConfig?.address || 'Av. Universitaria 4520, Carabayllo'}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


