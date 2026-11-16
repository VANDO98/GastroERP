import React, { useState } from 'react';
import {
  Clock,
  Check,
  AlertTriangle,
  Flame,
  Snowflake,
  PackageCheck,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { OrderItem } from '../types';

export const KdsModule: React.FC = () => {
  const { kdsOrders, markKdsItemsReady, themeMode, updateItemSourceType, ingredients } = useApp();
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Actualizar temporizador cada segundo
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getElapsedTimeSeconds = (sentAt?: string) => {
    if (!sentAt) return 0;
    const diff = Math.floor((currentTime - new Date(sentAt).getTime()) / 1000);
    return Math.max(0, diff);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  interface FruitPulpPair {
    fruitId: string;
    fruitName: string;
    fruitEmoji: string;
    freshStock: string;
    freshNum: number;
    pulpId: string;
    pulpName: string;
    pulpStock: string;
    pulpNum: number;
    currentSource: 'fruta_fresca' | 'pulpa_rescate';
  }

  // Detectar todas las frutas presentes en el ítem (BOM o por nombre) con su respectiva pulpa y stock
  const getFruitPulpPairs = (item: OrderItem): FruitPulpPair[] => {
    const fruitIngs: typeof ingredients = [];

    if (item.recipeBom && item.recipeBom.length > 0) {
      item.recipeBom.forEach(b => {
        const ing = ingredients.find(i => i.id === b.ingredientId);
        if (
          ing &&
          (ing.category === 'frutas' ||
            (ing.unit === 'kg' &&
              ing.itemType === 'insumo' &&
              (ing.name.toLowerCase().includes('fruta') ||
                ing.name.toLowerCase().includes('mango') ||
                ing.name.toLowerCase().includes('fresa') ||
                ing.name.toLowerCase().includes('papaya') ||
                ing.name.toLowerCase().includes('piña') ||
                ing.name.toLowerCase().includes('pina') ||
                ing.name.toLowerCase().includes('maracuyá') ||
                ing.name.toLowerCase().includes('plátano'))))
        ) {
          if (!fruitIngs.some(f => f.id === ing.id)) {
            fruitIngs.push(ing);
          }
        }
      });
    }

    // Inferencia por nombre si no tiene ingredientes de fruta explícitos en el BOM
    if (fruitIngs.length === 0) {
      const lower = item.name.toLowerCase();
      if (lower.includes('mango')) {
        const m = ingredients.find(i => i.id === 'ing-mango');
        if (m && !fruitIngs.some(f => f.id === m.id)) fruitIngs.push(m);
      }
      if (lower.includes('fresa')) {
        const f = ingredients.find(i => i.id === 'ing-fresa');
        if (f && !fruitIngs.some(f => f.id === f.id)) fruitIngs.push(f);
      }
      if (lower.includes('papaya')) {
        const p = ingredients.find(i => i.id === 'ing-papaya');
        if (p && !fruitIngs.some(f => f.id === p.id)) fruitIngs.push(p);
      }
      if (lower.includes('piña') || lower.includes('pina')) {
        const pi = ingredients.find(i => i.id === 'ing-pina');
        if (pi && !fruitIngs.some(f => f.id === pi.id)) fruitIngs.push(pi);
      }
      if (lower.includes('surtido')) {
        ['ing-papaya', 'ing-pina', 'ing-fresa'].forEach(id => {
          const ing = ingredients.find(i => i.id === id);
          if (ing && !fruitIngs.some(f => f.id === ing.id)) fruitIngs.push(ing);
        });
      }
    }

    const pairs: FruitPulpPair[] = [];

    fruitIngs.forEach(freshIng => {
      let pulpIng: typeof ingredients[0] | undefined;
      const lower = freshIng.name.toLowerCase();

      if (freshIng.id === 'ing-papaya' || lower.includes('papaya')) {
        pulpIng = ingredients.find(i => i.id === 'ing-pulpa-papaya');
      } else if (freshIng.id === 'ing-fresa' || lower.includes('fresa')) {
        pulpIng = ingredients.find(i => i.id === 'ing-pulpa-fresa');
      } else if (freshIng.id === 'ing-mango' || lower.includes('mango')) {
        pulpIng = ingredients.find(i => i.id === 'ing-pulpa-mango');
      } else if (freshIng.id === 'ing-pina' || lower.includes('pina') || lower.includes('piña')) {
        pulpIng = ingredients.find(i => i.id === 'ing-pulpa-pina');
      }

      // Si la fruta no tiene contraparte de pulpa en inventario (ej. plátano), se consume 100% fresca y no se genera toggle
      if (!pulpIng) {
        return;
      }

      const fruitEmoji = lower.includes('fresa')
        ? '🍓'
        : lower.includes('mango')
        ? '🥭'
        : lower.includes('papaya')
        ? '🍈'
        : lower.includes('piña') || lower.includes('pina')
        ? '🍍'
        : lower.includes('plátano')
        ? '🍌'
        : '🍎';

      let shortFruitName = freshIng.name;
      if (lower.includes('papaya')) shortFruitName = 'Papaya';
      else if (lower.includes('fresa')) shortFruitName = 'Fresa';
      else if (lower.includes('mango')) shortFruitName = 'Mango';
      else if (lower.includes('piña') || lower.includes('pina')) shortFruitName = 'Piña';
      else if (lower.includes('plátano')) shortFruitName = 'Plátano';

      // Fuente actual seleccionada para esta fruta individual
      const currentSource =
        item.selectedFruitSources?.[freshIng.id] ||
        item.selectedSourceType ||
        'fruta_fresca';

      pairs.push({
        fruitId: freshIng.id,
        fruitName: shortFruitName,
        fruitEmoji,
        freshStock: `${freshIng.stock} ${freshIng.unit}`,
        freshNum: freshIng.stock,
        pulpId: pulpIng.id,
        pulpName: pulpIng.name,
        pulpStock: `${pulpIng.stock} ${pulpIng.unit}`,
        pulpNum: pulpIng.stock,
        currentSource
      });
    });

    return pairs;
  };

  const isLight = themeMode === 'light';

  return (
    <div className={'flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col ' + (isLight ? 'bg-slate-100 text-slate-800' : 'bg-slate-950 text-slate-100')}>
      {/* Header KDS */}
      <div className={`flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b ${isLight ? 'border-slate-300' : 'border-slate-800'}`}>
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full font-bold border ${
              isLight ? 'bg-cyan-100 text-cyan-900 border-cyan-300' : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
            }`}>
              KDS • Pantalla de Barra & Cocina
            </span>
            <span className={`text-xs ${isLight ? 'text-slate-600 font-semibold' : 'text-slate-400'}`}>
              Meta innegociable: &lt; 3 minutos por comanda
            </span>
          </div>
          <h2 className={`text-xl font-black mt-1 flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <span>Comandas en Preparación</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-500 text-white font-mono">
              {kdsOrders.length} activas
            </span>
          </h2>
        </div>

        {/* Leyenda Semafórica */}
        <div className="flex items-center gap-3 text-xs font-bold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span className={isLight ? 'text-slate-700' : 'text-slate-400'}>&lt; 2 min (A tiempo)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span className={isLight ? 'text-slate-700' : 'text-slate-400'}>2 - 3 min (Límite)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
            <span className={isLight ? 'text-rose-700 font-black' : 'text-rose-400 font-black'}>&gt; 3 min (Alerta)</span>
          </div>
        </div>
      </div>

      {/* Grid de Comandas Activas */}
      {kdsOrders.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-500">
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl mb-3 ${isLight ? 'bg-slate-200 text-slate-600' : 'bg-slate-800/40 text-white'}`}>
            ☕
          </div>
          <p className={`text-lg font-black ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>Barra libre de comandas</p>
          <p className={`text-xs mt-1 max-w-sm ${isLight ? 'text-slate-600' : 'text-slate-500'}`}>
            Cuando se tome un pedido o se agreguen nuevos ítems a una mesa y se presione <b>"Enviar Comanda a Barra"</b>, aparecerán aquí discriminados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {kdsOrders.map(order => {
            const elapsed = getElapsedTimeSeconds(order.sentToKitchenAt);
            const isLate = elapsed > 180;
            const isWarning = elapsed > 120 && !isLate;

            const timerColor = isLate
              ? 'bg-rose-500 text-white animate-pulse'
              : isWarning
              ? 'bg-amber-500 text-slate-950 font-black'
              : 'bg-emerald-600 text-white';

            // Discriminación: Ítems pendientes (nuevos) vs Ítems ya entregados previamente
            const pendingItems = order.items.filter(i => i.kitchenStatus !== 'entregado');
            const deliveredItems = order.items.filter(i => i.kitchenStatus === 'entregado');

            return (
              <div
                key={order.tableId}
                className={'rounded-3xl border flex flex-col justify-between overflow-hidden shadow-xl transition-all ' +
                  (isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800') +
                  (isLate ? ' ring-2 ring-rose-500' : '')}
              >
                {/* Cabecera */}
                <div className={'p-3.5 border-b flex items-center justify-between ' + (isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800')}>
                  <div>
                    <h3 className="font-black text-base flex items-center gap-1.5">
                      <span>{order.tableName}</span>
                      {order.customerName && (
                        <span className="text-xs font-semibold text-slate-400">
                          ({order.customerName})
                        </span>
                      )}
                    </h3>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {order.enableDisposables ? (
                        <span className="text-amber-400 font-bold">🥤 Descartables ON</span>
                      ) : (
                        <span className="text-slate-400">🍽️ Vajilla Mesa</span>
                      )}
                    </div>
                  </div>

                  {/* Cronómetro */}
                  <div className={'px-2.5 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shadow ' + timerColor}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatSeconds(elapsed)}</span>
                  </div>
                </div>

                {/* Contenido con discriminación de ítems */}
                <div className="p-3.5 space-y-3 flex-1 overflow-y-auto max-h-72">
                  
                  {/* SECCIÓN 1: NUEVOS ÍTEMS A PREPARAR (PENDIENTES) */}
                  {pendingItems.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-md border border-orange-500/20">
                        <Flame className="w-3 h-3 text-orange-400" />
                        <span>🔔 NUEVOS A PREPARAR ({pendingItems.length})</span>
                      </div>

                      {pendingItems.map((item, idx) => {
                        const hasFruit = (
                          (item.recipeBom && item.recipeBom.some(b => {
                            const ing = ingredients.find(i => i.id === b.ingredientId);
                            return ing?.category === 'frutas' || b.ingredientId.includes('fruta') || b.ingredientId.includes('papaya') || b.ingredientId.includes('fresa') || b.ingredientId.includes('mango') || b.ingredientId.includes('pina');
                          })) ||
                          item.name.toLowerCase().includes('jugo') ||
                          item.name.toLowerCase().includes('papaya') ||
                          item.name.toLowerCase().includes('fresa') ||
                          item.name.toLowerCase().includes('mango') ||
                          item.name.toLowerCase().includes('piña') ||
                          item.name.toLowerCase().includes('surtido')
                        );
                        const isPulp = item.selectedSourceType === 'pulpa_rescate';

                        return (
                          <div key={item.id || idx} className="pl-1 border-l-2 border-orange-500 space-y-1">
                            <div className="flex items-baseline justify-between gap-1">
                              <span className="font-black text-sm text-white flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-md bg-orange-600 text-white flex items-center justify-center text-xs font-mono font-black">
                                  {item.quantity}x
                                </span>
                                <span>{item.name}</span>
                                {item.isCombo && (
                                  <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-bold">
                                    COMBO
                                  </span>
                                )}
                              </span>
                            </div>

                            {item.isCombo && item.comboItems && (
                              <div className="pl-6 mt-1 space-y-0.5">
                                {item.comboItems.map((ci, i) => (
                                  <div key={i} className="text-xs text-amber-200 font-bold flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                    <span>{ci.quantity * item.quantity}x {ci.name}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {item.selectedModifiers.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1 pl-6">
                                {item.selectedModifiers.map(mod => (
                                  <span
                                    key={mod.id}
                                    className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                  >
                                    ★ {mod.label}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* DECISIÓN OPERATIVA BARRA: ¿Fruta Fresca o Pulpa de Rescate (Pastilla Compacta por Fruta)? */}
                            {hasFruit && (() => {
                              const fruitPairs = getFruitPulpPairs(item);
                              if (fruitPairs.length === 0) return null;

                              return (
                                <div className="pl-6 pt-1.5 space-y-1">
                                  {fruitPairs.map(p => {
                                    const isPulpForThisFruit = p.currentSource === 'pulpa_rescate';
                                    return (
                                      <div
                                        key={p.fruitId}
                                        className="flex items-center justify-between gap-2 max-w-[280px] bg-slate-900/60 border border-slate-800/80 rounded-lg px-2 py-0.5"
                                      >
                                        <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1 truncate">
                                          <span>{p.fruitEmoji}</span>
                                          <span>{p.fruitName}</span>
                                        </span>
                                        <div className="inline-flex items-center p-0.5 rounded-md bg-slate-950 border border-slate-700/60 shrink-0">
                                          <button
                                            type="button"
                                            onClick={() => updateItemSourceType(order.tableId, item.id, 'fruta_fresca', p.fruitId)}
                                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all flex items-center gap-1 ${
                                              !isPulpForThisFruit
                                                ? 'bg-emerald-600 text-white shadow-sm'
                                                : 'text-slate-400 hover:text-slate-200'
                                            }`}
                                            title={`Preparado con fruta fresca (${p.fruitName}). Stock disponible: ${p.freshStock}`}
                                          >
                                            <span>Fresca</span>
                                            <span className="text-[9px] font-mono opacity-80 font-normal">
                                              {p.freshNum}k
                                            </span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => updateItemSourceType(order.tableId, item.id, 'pulpa_rescate', p.fruitId)}
                                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all flex items-center gap-1 ${
                                              isPulpForThisFruit
                                                ? 'bg-purple-600 text-white shadow-sm'
                                                : 'text-slate-400 hover:text-purple-300'
                                            }`}
                                            title={`Preparado con pulpa de rescate (${p.fruitName}). Stock disponible: ${p.pulpStock}`}
                                          >
                                            <span>Pulpa</span>
                                            <span className="text-[9px] font-mono opacity-80 font-normal">
                                              {p.pulpNum}k
                                            </span>
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })()}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center text-xs text-emerald-400 font-bold">
                      ✓ Todos los ítems actuales ya fueron despachados
                    </div>
                  )}

                  {/* SECCIÓN 2: ÍTEMS YA ENTREGADOS PREVIAMENTE (DISCRIMINADOS) */}
                  {deliveredItems.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-800">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>Ya servidos en mesa ({deliveredItems.length}):</span>
                      </div>
                      <div className="space-y-1 pl-1 opacity-60">
                        {deliveredItems.map((item, idx) => (
                          <div key={item.id || idx} className="text-xs text-slate-400 flex items-center justify-between line-through">
                            <span>{item.quantity}x {item.name}</span>
                            <span className="text-[10px] text-emerald-500 font-sans font-bold">✓ Servido</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Botón de Despacho */}
                <div className="p-3 bg-slate-950/40 border-t border-slate-800">
                  <button
                    onClick={() => markKdsItemsReady(order.tableId)}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>MARCAR LISTO / DESPACHADO</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
