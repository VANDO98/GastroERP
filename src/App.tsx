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

function AppContent() {
  const [activeTab, setActiveTab] = useState<NavTabType>('pos');
  const { themeMode } = useApp();
  const isLight = themeMode === 'light';

  return (
    <div className={`min-h-screen flex flex-col font-sans select-none antialiased transition-colors ${isLight ? 'bg-slate-100 text-slate-800' : 'bg-slate-950 text-slate-100'}`}>
      {/* Barra superior de navegación y métricas */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Contenedor dinámico según el módulo seleccionado */}
      <main className="flex-1 flex flex-col overflow-hidden">
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

