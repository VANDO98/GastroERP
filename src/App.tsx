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
import { ShoppingCart, Clock, Layers, Sparkles, Menu } from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState<NavTabType>('pos');
  const { themeMode } = useApp();
  const isLight = themeMode === 'light';

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

