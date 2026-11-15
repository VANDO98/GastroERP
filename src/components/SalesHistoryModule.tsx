import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Search,
  Calendar,
  DollarSign,
  TrendingUp,
  Percent,
  ShoppingBag,
  Layers,
  Clock,
  Eye,
  Filter,
  CreditCard,
  Smartphone,
  Banknote,
  CheckCircle2,
  ChevronRight,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Order, OrderItem } from '../types';

type DateFilterType = 'hoy' | 'ayer' | '7dias' | 'mes' | 'todos' | 'custom';
type ChannelFilterType = 'todos' | 'para_mesa' | 'para_llevar';
type PaymentFilterType = 'todos' | 'efectivo' | 'yape_plin' | 'tarjeta';

export const SalesHistoryModule: React.FC = () => {
  const { orders, themeMode, ingredients, menuConfig } = useApp();
  const isLight = themeMode === 'light';

  // Filtros
  const [dateFilter, setDateFilter] = useState<DateFilterType>('hoy');
  const [channelFilter, setChannelFilter] = useState<ChannelFilterType>('todos');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilterType>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Modal de Detalle Profundo
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Lista de todos los productos para resolver costos si una orden antigua no los traía
  const allProducts = useMemo(() => {
    return menuConfig.lines.flatMap(l => l.categories.flatMap(c => c.products));
  }, [menuConfig]);

  // Filtrado de órdenes
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      const orderDateStr = order.createdAt.split('T')[0];

      // 1. Filtro de fecha
      let matchesDate = true;
      if (dateFilter === 'hoy') {
        matchesDate = orderDateStr === todayStr;
      } else if (dateFilter === 'ayer') {
        matchesDate = orderDateStr === yesterdayStr;
      } else if (dateFilter === '7dias') {
        matchesDate = orderDate >= sevenDaysAgo;
      } else if (dateFilter === 'mes') {
        matchesDate = orderDate >= firstDayOfMonth;
      } else if (dateFilter === 'custom') {
        if (customStartDate && orderDateStr < customStartDate) matchesDate = false;
        if (customEndDate && orderDateStr > customEndDate) matchesDate = false;
      }

      // 2. Filtro de canal
      const matchesChannel = channelFilter === 'todos' || order.orderType === channelFilter;

      // 3. Filtro de método de pago
      const matchesPayment = paymentFilter === 'todos' || order.paymentMethod === paymentFilter;

      // 4. Búsqueda por texto
      const searchLower = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !searchLower ||
        order.ticketNumber.toString().includes(searchLower) ||
        (order.customerName && order.customerName.toLowerCase().includes(searchLower)) ||
        (order.tableName && order.tableName.toLowerCase().includes(searchLower)) ||
        order.items.some(i => i.name.toLowerCase().includes(searchLower));

      return matchesDate && matchesChannel && matchesPayment && matchesSearch;
    });
  }, [orders, dateFilter, channelFilter, paymentFilter, searchTerm, customStartDate, customEndDate]);

  // Métricas Consolidadas del período seleccionado
  const metrics = useMemo(() => {
    const totalSales = Number(filteredOrders.reduce((acc, o) => acc + o.total, 0).toFixed(2));
    const totalCost = Number(filteredOrders.reduce((acc, o) => acc + o.totalFoodCost, 0).toFixed(2));
    const grossProfit = Number((totalSales - totalCost).toFixed(2));
    const grossMarginPercent = totalSales > 0 ? Number(((grossProfit / totalSales) * 100).toFixed(1)) : 0;
    const foodCostPercent = totalSales > 0 ? Number(((totalCost / totalSales) * 100).toFixed(1)) : 0;
    const ticketCount = filteredOrders.length;
    const averageTicket = ticketCount > 0 ? Number((totalSales / ticketCount).toFixed(2)) : 0;

    return {
      totalSales,
      totalCost,
      grossProfit,
      grossMarginPercent,
      foodCostPercent,
      ticketCount,
      averageTicket
    };
  }, [filteredOrders]);

  // Función auxiliar para obtener el costo BOM real de un ítem si no fue guardado previamente
  const getItemCost = (item: OrderItem): { unitCost: number; totalCost: number } => {
    if (item.unitCost !== undefined && item.totalCost !== undefined) {
      return { unitCost: item.unitCost, totalCost: item.totalCost };
    }
    const prod = allProducts.find(p => p.id === item.productId);
    let unitCost = prod ? prod.targetCost : 0;
    if (item.recipeBom && item.recipeBom.length > 0) {
      unitCost = item.recipeBom.reduce((acc, b) => {
        const ing = ingredients.find(i => i.id === b.ingredientId);
        return acc + (ing ? ing.costPerUnit * b.quantity : 0);
      }, 0);
    }
    unitCost = Number(unitCost.toFixed(2));
    const totalCost = Number((unitCost * item.quantity).toFixed(2));
    return { unitCost, totalCost };
  };

  return (
    <div className={`p-4 md:p-6 space-y-6 max-w-7xl mx-auto transition-colors ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-500 text-slate-950 font-black shadow-md">
              <Receipt className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black tracking-tight">Historial de Ventas & Auditoría de Costos</h1>
          </div>
          <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Auditoría pormenorizada de tickets cerrados, costo real de alimentos (COGS), márgenes de ganancia y trazabilidad de empaques.
          </p>
        </div>
      </div>

      {/* Tarjetas de Resumen Ejecutivo (KPIs en Vivo) */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Ventas Totales
          </span>
          <div className="text-xl md:text-2xl font-black mt-1 text-emerald-600 dark:text-emerald-400">
            S/ {metrics.totalSales.toFixed(2)}
          </div>
          <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
            Ingresos brutos cobrados
          </span>
        </div>

        <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Costo Ventas (COGS)
          </span>
          <div className="text-xl md:text-2xl font-black mt-1 text-rose-600 dark:text-rose-400">
            S/ {metrics.totalCost.toFixed(2)}
          </div>
          <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
            Insumos gastados (FIFO)
          </span>
        </div>

        <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Utilidad Bruta
          </span>
          <div className="text-xl md:text-2xl font-black mt-1 text-cyan-600 dark:text-cyan-400">
            S/ {metrics.grossProfit.toFixed(2)}
          </div>
          <span className={`text-[10px] font-semibold ${isLight ? 'text-cyan-800' : 'text-cyan-300'}`}>
            {metrics.grossMarginPercent}% Margen Líquido
          </span>
        </div>

        <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Food Cost Ponderado
          </span>
          <div
            className={`text-xl md:text-2xl font-black mt-1 ${
              metrics.foodCostPercent <= 30
                ? isLight ? 'text-emerald-700' : 'text-emerald-400'
                : metrics.foodCostPercent <= 45
                ? isLight ? 'text-amber-700' : 'text-amber-400'
                : isLight ? 'text-rose-700' : 'text-rose-400'
            }`}
          >
            {metrics.foodCostPercent}%
          </div>
          <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
            Meta: ≤ 30% | Techo: 45%
          </span>
        </div>

        <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Tickets Cerrados
          </span>
          <div className="text-xl md:text-2xl font-black mt-1">
            {metrics.ticketCount}
          </div>
          <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
            Comandas despachadas
          </span>
        </div>

        <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Ticket Promedio
          </span>
          <div className="text-xl md:text-2xl font-black mt-1 text-amber-600 dark:text-amber-400">
            S/ {metrics.averageTicket.toFixed(2)}
          </div>
          <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
            Gasto medio por orden
          </span>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className={`p-4 rounded-3xl border space-y-3 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Botones de Período Rápido */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'hoy', label: 'Hoy' },
              { id: 'ayer', label: 'Ayer' },
              { id: '7dias', label: 'Últimos 7 días' },
              { id: 'mes', label: 'Este mes' },
              { id: 'todos', label: 'Histórico' },
              { id: 'custom', label: 'Personalizado' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setDateFilter(tab.id as DateFilterType)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  dateFilter === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Buscador */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar ticket, mesa, plato..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-3 py-1.5 rounded-xl text-xs font-semibold border transition-all focus:outline-none ${
                isLight
                  ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'
                  : 'bg-slate-800 border-slate-700 text-white focus:border-blue-400'
              }`}
            />
          </div>
        </div>

        {/* Filtros Secundarios: Fechas personalizadas, Canal, Método de Pago */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
          {dateFilter === 'custom' && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Desde:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={e => setCustomStartDate(e.target.value)}
                className={`px-2 py-1 rounded-lg border text-xs ${
                  isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-800 border-slate-700 text-white'
                }`}
              />
              <span className="text-slate-500">Hasta:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={e => setCustomEndDate(e.target.value)}
                className={`px-2 py-1 rounded-lg border text-xs ${
                  isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-800 border-slate-700 text-white'
                }`}
              />
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">Canal:</span>
            <select
              value={channelFilter}
              onChange={e => setChannelFilter(e.target.value as ChannelFilterType)}
              className={`px-2.5 py-1 rounded-xl border text-xs font-bold ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-800 border-slate-700 text-white'
              }`}
            >
              <option value="todos">Todos los Canales</option>
              <option value="para_mesa">Salón (Mesas)</option>
              <option value="para_llevar">Para Llevar / Delivery</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">Medio de Pago:</span>
            <select
              value={paymentFilter}
              onChange={e => setPaymentFilter(e.target.value as PaymentFilterType)}
              className={`px-2.5 py-1 rounded-xl border text-xs font-bold ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-800 border-slate-700 text-white'
              }`}
            >
              <option value="todos">Todos los Métodos</option>
              <option value="efectivo">Efectivo</option>
              <option value="yape_plin">Yape / Plin</option>
              <option value="tarjeta">Tarjeta (POS)</option>
            </select>
          </div>

          <div className="ml-auto text-[11px] text-slate-400 font-mono">
            {filteredOrders.length} tickets encontrados
          </div>
        </div>
      </div>

      {/* Tabla Cronológica de Ventas */}
      <div className={`border rounded-3xl overflow-hidden shadow-sm ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`text-[11px] font-extrabold uppercase border-b ${
              isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-950/80 text-slate-300 border-slate-800'
            }`}>
              <tr>
                <th className="py-3 px-4">Ticket # / Hora</th>
                <th className="py-3 px-3">Canal</th>
                <th className="py-3 px-3">Cliente / Mesa</th>
                <th className="py-3 px-3">Medio de Pago</th>
                <th className="py-3 px-3">Resumen de Ítems</th>
                <th className="py-3 px-3 text-right">Venta Total</th>
                <th className="py-3 px-3 text-right">Costo COGS</th>
                <th className="py-3 px-3 text-right">Ganancia S/</th>
                <th className="py-3 px-3 text-center">Food Cost %</th>
                <th className="py-3 px-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-slate-100 text-slate-800' : 'divide-slate-800/60 text-slate-200'}`}>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500">
                    No se encontraron órdenes registradas para los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const dateObj = new Date(order.createdAt);
                  const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const formattedDate = dateObj.toLocaleDateString([], { day: '2-digit', month: '2-digit' });

                  const profit = Number((order.total - order.totalFoodCost).toFixed(2));
                  const fc = order.total > 0 ? Number(((order.totalFoodCost / order.total) * 100).toFixed(1)) : 0;

                  return (
                    <tr
                      key={order.id}
                      className={`transition-colors ${
                        isLight ? 'hover:bg-slate-50/80' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Ticket & Hora */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono font-black text-blue-600 dark:text-blue-400">
                          #{order.ticketNumber}
                        </div>
                        <div className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          {formattedDate} • {formattedTime}
                        </div>
                      </td>

                      {/* Canal */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            order.orderType === 'para_llevar'
                              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {order.orderType === 'para_llevar' ? '🛍️ Llevar' : '🍽️ Salón'}
                        </span>
                      </td>

                      {/* Cliente / Mesa */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-xs">
                          {order.tableName || 'Mesa'}
                        </div>
                        {order.customerName && (
                          <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            {order.customerName}
                          </div>
                        )}
                      </td>

                      {/* Medio de Pago */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="flex items-center gap-1 font-semibold text-[11px]">
                          {order.paymentMethod === 'yape_plin' ? (
                            <>
                              <Smartphone className="w-3.5 h-3.5 text-purple-500" />
                              <span>Yape / Plin</span>
                            </>
                          ) : order.paymentMethod === 'tarjeta' ? (
                            <>
                              <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                              <span>Tarjeta</span>
                            </>
                          ) : (
                            <>
                              <Banknote className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Efectivo</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Resumen de Ítems */}
                      <td className="py-3 px-3 max-w-xs truncate" title={order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}>
                        <div className="font-medium truncate">
                          {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                        </div>
                        <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          {order.items.reduce((acc, i) => acc + i.quantity, 0)} ítems totales
                        </div>
                      </td>

                      {/* Venta Total */}
                      <td className="py-3 px-3 text-right font-black font-mono text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        S/ {order.total.toFixed(2)}
                      </td>

                      {/* Costo Total */}
                      <td className="py-3 px-3 text-right font-bold font-mono text-rose-600 dark:text-rose-400 whitespace-nowrap">
                        S/ {order.totalFoodCost.toFixed(2)}
                      </td>

                      {/* Ganancia */}
                      <td className="py-3 px-3 text-right font-black font-mono text-cyan-600 dark:text-cyan-400 whitespace-nowrap">
                        S/ {profit.toFixed(2)}
                      </td>

                      {/* Food Cost */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-block font-mono font-bold text-[11px] px-2 py-0.5 rounded-full ${
                            fc <= 30
                              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                              : fc <= 45
                              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                              : 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {fc}%
                        </span>
                      </td>

                      {/* Botón Auditar */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all ${
                            isLight
                              ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                              : 'bg-blue-950/60 text-blue-300 hover:bg-blue-900/60 border border-blue-800'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Auditar</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL DE AUDITORÍA PROFUNDA DE LA ORDEN ================= */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto text-slate-100">
            {/* Cabecera del Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-lg text-blue-400">
                    Ticket #{selectedOrder.ticketNumber}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedOrder.orderType === 'para_llevar'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {selectedOrder.orderType === 'para_llevar' ? '🛍️ Para Llevar' : '🍽️ En Mesa'}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {selectedOrder.tableName} • {new Date(selectedOrder.createdAt).toLocaleString()}
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Resumen Financiero del Ticket */}
            <div className="grid grid-cols-4 gap-2.5 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Venta</span>
                <div className="text-lg font-black text-emerald-400">
                  S/ {selectedOrder.total.toFixed(2)}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Costo Alimentos</span>
                <div className="text-lg font-black text-rose-400">
                  S/ {selectedOrder.totalFoodCost.toFixed(2)}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Ganancia Bruta</span>
                <div className="text-lg font-black text-cyan-400">
                  S/ {(selectedOrder.total - selectedOrder.totalFoodCost).toFixed(2)}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Food Cost</span>
                <div
                  className={`text-lg font-black ${
                    (selectedOrder.totalFoodCost / selectedOrder.total) <= 0.30
                      ? 'text-emerald-400'
                      : (selectedOrder.totalFoodCost / selectedOrder.total) <= 0.45
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {selectedOrder.total > 0
                    ? ((selectedOrder.totalFoodCost / selectedOrder.total) * 100).toFixed(1)
                    : 0}
                  %
                </div>
              </div>
            </div>

            {/* Desglose Ítem por Ítem */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>Desglose de Ítems, Costos y Margen Unitario</span>
              </h4>

              <div className="border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800">
                <div className="px-3.5 py-2 text-[10px] font-extrabold uppercase bg-slate-950 text-slate-400 grid grid-cols-12 gap-2">
                  <span className="col-span-4">Plato / Combo</span>
                  <span className="col-span-2 text-center">Cant. / Venta</span>
                  <span className="col-span-2 text-right">Costo BOM</span>
                  <span className="col-span-2 text-right">Margen S/</span>
                  <span className="col-span-2 text-center">FC %</span>
                </div>

                {selectedOrder.items.map((item, idx) => {
                  const { unitCost, totalCost } = getItemCost(item);
                  const itemProfit = Number((item.itemTotal - totalCost).toFixed(2));
                  const itemFc = item.itemTotal > 0 ? Number(((totalCost / item.itemTotal) * 100).toFixed(1)) : 0;

                  return (
                    <div
                      key={idx}
                      className="px-3.5 py-2.5 text-xs grid grid-cols-12 gap-2 items-center bg-slate-900/60 hover:bg-slate-800/40"
                    >
                      <div className="col-span-4">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{item.name}</span>
                          {item.isCombo && (
                            <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-bold">
                              COMBO
                            </span>
                          )}
                        </div>
                        {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                          <div className="text-[10px] text-amber-300">
                            + {item.selectedModifiers.map(m => m.label).join(', ')}
                          </div>
                        )}
                      </div>

                      <div className="col-span-2 text-center font-mono">
                        <span className="font-bold text-white">{item.quantity}x</span>{' '}
                        <span className="text-slate-400 text-[11px]">(S/ {item.price.toFixed(2)})</span>
                        <div className="text-[10px] text-emerald-400 font-bold">
                          = S/ {item.itemTotal.toFixed(2)}
                        </div>
                      </div>

                      <div className="col-span-2 text-right font-mono">
                        <div className="text-slate-300">S/ {totalCost.toFixed(2)}</div>
                        <div className="text-[10px] text-slate-500">
                          (S/ {unitCost.toFixed(2)} c/u)
                        </div>
                      </div>

                      <div className="col-span-2 text-right font-mono font-bold text-cyan-400">
                        + S/ {itemProfit.toFixed(2)}
                      </div>

                      <div className="col-span-2 text-center font-mono font-bold">
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            itemFc <= 30
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : itemFc <= 45
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'text-rose-400 bg-rose-500/20'
                          }`}
                        >
                          {itemFc}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Auditoría de Descartables si aplica */}
            {(selectedOrder.orderType === 'para_llevar' || (selectedOrder.disposablesCharged || 0) > 0) && (
              <div className="p-3.5 bg-cyan-950/30 border border-cyan-800/40 rounded-2xl space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-bold text-cyan-300">
                  <span className="flex items-center gap-1.5">
                    <span>🛍️</span> Control de Descartables y Empaques:
                  </span>
                  <span className="font-mono">
                    Cobrado al Cliente: S/ {(selectedOrder.disposablesCharged || 0).toFixed(2)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                  <div>
                    Costo real descontado del almacén:{' '}
                    <span className="font-mono font-bold text-white">
                      S/ {(selectedOrder.disposablesCostReal || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="text-right">
                    Balance Empaque:{' '}
                    <span
                      className={`font-mono font-bold ${
                        (selectedOrder.disposablesCharged || 0) >= (selectedOrder.disposablesCostReal || 0)
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {((selectedOrder.disposablesCharged || 0) - (selectedOrder.disposablesCostReal || 0)) >= 0
                        ? `+ S/ ${((selectedOrder.disposablesCharged || 0) - (selectedOrder.disposablesCostReal || 0)).toFixed(2)}`
                        : `- S/ ${(Math.abs((selectedOrder.disposablesCharged || 0) - (selectedOrder.disposablesCostReal || 0))).toFixed(2)} (Subvencionado)`}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
