import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import type { NavTabType } from './components/Navbar';
import { PosModule } from './components/PosModule';
import { KdsModule } from './components/KdsModule';
import { RecipesModule } from './components/RecipesModule';
import { IngredientsModule } from './components/IngredientsModule';
import { DetailedPurchasesModule } from './components/DetailedPurchasesModule';
import { PurchasesModule } from './components/PurchasesModule';
import { ProductionWasteModule } from './components/ProductionWasteModule';
import { SuppliersModule } from './components/SuppliersModule';
import { KardexModule } from './components/KardexModule';
import { CombosModule } from './components/CombosModule';
import { SalesHistoryModule } from './components/SalesHistoryModule';
import { PurchaseOrdersModule } from './components/PurchaseOrdersModule';
import { ToppingsMasterModule } from './components/ToppingsMasterModule';
import { SettingsModule } from './components/SettingsModule';
import { ShoppingCart, Clock, Layers, Sparkles, Menu, Database, RefreshCw } from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState<NavTabType>('pos');
  const { themeMode, isInitialLoading, syncError, retrySync } = useApp();
  const isLight = themeMode === 'light';

  // Pantalla de arranque y conexión con SQLite
  if (isInitialLoading) {
    return (
      <div className={`h-screen w-screen flex flex-col items-center justify-center p-6 select-none ${
        isLight ? 'bg-slate-100 text-slate-800' : 'bg-slate-950 text-slate-100'
      }`}>
        <div className="flex flex-col items-center max-w-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mb-4">
            <Database className="w-8 h-8 text-orange-500 animate-pulse" />
          </div>
          <h2 className="text-xl font-black mb-1 tracking-tight">Cargando Base de Datos ERP</h2>
          <p className="text-xs text-slate-500 mb-6">
            Sincronizando recetas, inventario y mesas en tiempo real desde SQLite...
          </p>

          {syncError && (
            <div className="w-full p-4 mb-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-left animate-in fade-in">
              <p className="font-bold flex items-center gap-1.5">
                <span>⚠️</span> Conexión pendiente con el servidor local
              </p>
              <p className="font-mono mt-1 text-[11px] text-rose-300/80">{syncError}</p>
              <button
                type="button"
                onClick={retrySync}
                className="mt-3 w-full py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Reintentar Conexión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen max-h-screen flex flex-col font-sans select-none antialiased transition-colors overflow-hidden ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'}`}>
      {/* Barra superior de navegación y métricas */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Contenedor dinámico según el módulo seleccionado */}
      <main className="flex-1 flex flex-col overflow-hidden min-h-0">
        {activeTab === 'pos' && <PosModule />}
        {activeTab === 'kds' && <KdsModule />}
        {activeTab === 'recipes' && <RecipesModule />}
        {activeTab === 'toppings-master' && <ToppingsMasterModule />}
        {activeTab === 'combos' && <CombosModule />}
        {activeTab === 'sales-history' && <SalesHistoryModule />}
        {activeTab === 'ingredients' && <IngredientsModule onNavigateKardex={() => setActiveTab('kardex')} />}
        {activeTab === 'kardex' && <KardexModule />}
        {activeTab === 'purchase-orders' && <PurchaseOrdersModule />}
        {activeTab === 'purchases-erp' && <DetailedPurchasesModule />}
        {activeTab === 'purchases-mobile' && <PurchasesModule />}
        {activeTab === 'production' && <ProductionWasteModule />}
        {activeTab === 'suppliers' && <SuppliersModule />}
        {activeTab === 'settings' && <SettingsModule />}
      </main>

      {/* Barra de navegación inferior fija para móviles (Mozo / Cocina rápido) */}
      <nav className={`sm:hidden fixed bottom-0 left-0 right-0 h-14 border-t flex items-center justify-around z-30 px-2 ${
        isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-300'
      }`}>
        <button
          onClick={() => setActiveTab('pos')}
          className={`flex flex-col items-center justify-center flex-1 py-1 ${
            activeTab === 'pos' ? 'text-orange-500 font-bold' : 'text-slate-400'
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">POS</span>
        </button>

        <button
          onClick={() => setActiveTab('kds')}
          className={`flex flex-col items-center justify-center flex-1 py-1 ${
            activeTab === 'kds' ? 'text-orange-500 font-bold' : 'text-slate-400'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">KDS Barra</span>
        </button>

        <button
          onClick={() => setActiveTab('combos')}
          className={`flex flex-col items-center justify-center flex-1 py-1 ${
            activeTab === 'combos' ? 'text-orange-500 font-bold' : 'text-slate-400'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Combos</span>
        </button>

        <button
          onClick={() => setActiveTab('production')}
          className={`flex flex-col items-center justify-center flex-1 py-1 ${
            activeTab === 'production' ? 'text-orange-500 font-bold' : 'text-slate-400'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Producción</span>
        </button>
      </nav>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;

