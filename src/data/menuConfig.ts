import type { MenuConfig } from '../types';

export const initialMenuConfig: MenuConfig = {
  version: "1.0.0",
  currency: "S/",
  globalModifiers: [
    { id: "gmod-llevar", label: "🛍️ Para Llevar", type: "toggle" },
    { id: "gmod-mesa", label: "🍽️ En Mesa", type: "toggle" },
    { id: "gmod-urgente", label: "⚡ Prioritario (<2min)", type: "flag" }
  ],
  lines: [
    {
      id: "linea-fria",
      name: "Línea Fría",
      theme: {
        accentColor: "#06b6d4", // Cyan
        badgeColor: "bg-cyan-600 text-white",
        activeTabClass: "border-cyan-500 text-cyan-400 bg-cyan-950/40"
      },
      categories: [
        {
          id: "cat-jugos",
          name: "Jugos Naturales & Especiales",
          icon: "GlassWater",
          products: [
            {
              id: "prod-jugo-surtido",
              sku: "JUG-01",
              name: "Jugo Surtido Especial",
              shortName: "Surtido Especial",
              description: "Papaya, piña, plátano, fresa y toque de algarrobina",
              price: 11.00,
              targetCost: 4.80,
              ui: {
                color: "amber",
                bgClass: "bg-gradient-to-br from-amber-500/20 to-orange-600/30 hover:from-amber-500/30 hover:to-orange-600/40",
                borderClass: "border-amber-500/40 hover:border-amber-400",
                textClass: "text-amber-100",
                badgeClass: "bg-amber-500/20 text-amber-300"
              },
              quickModifiers: [
                { id: "m-sin-azucar", label: "Sin Azúcar", priceDelta: 0.00, inventoryImpact: [{ ingredientId: "ing-azucar", qtyDelta: -0.025 }] },
                { id: "m-leche-extra", label: "+ Con Leche", priceDelta: 2.00, inventoryImpact: [{ ingredientId: "ing-leche-entera", qtyDelta: 0.120 }] },
                { id: "m-algarrobina-plus", label: "+ Algarrobina", priceDelta: 1.50, inventoryImpact: [{ ingredientId: "ing-algarrobina", qtyDelta: 0.020 }] }
              ],
              recipeBom: [
                { ingredientId: "ing-papaya", quantity: 0.100, unit: "kg" },
                { ingredientId: "ing-pina", quantity: 0.080, unit: "kg" },
                { ingredientId: "ing-platano", quantity: 0.050, unit: "kg" },
                { ingredientId: "ing-fresa", quantity: 0.040, unit: "kg" },
                { ingredientId: "ing-azucar", quantity: 0.025, unit: "kg" },
                { ingredientId: "ing-vaso-domo-16oz", quantity: 1, unit: "und" }
              ]
            },
            {
              id: "prod-fresa-leche",
              sku: "JUG-02",
              name: "Jugo de Fresa con Leche",
              shortName: "Fresa con Leche",
              description: "Fresas Huacho seleccionadas y leche fresca batida",
              price: 12.00,
              targetCost: 5.20,
              ui: {
                color: "rose",
                bgClass: "bg-gradient-to-br from-rose-500/20 to-pink-600/30 hover:from-rose-500/30 hover:to-pink-600/40",
                borderClass: "border-rose-500/40 hover:border-rose-400",
                textClass: "text-rose-100",
                badgeClass: "bg-rose-500/20 text-rose-300"
              },
              quickModifiers: [
                { id: "m-sin-azucar", label: "Sin Azúcar", priceDelta: 0.00 },
                { id: "m-deslactosada", label: "Deslactosada", priceDelta: 1.50, toppingMasterId: "top-leche-deslact", ingredientId: "ing-leche-deslact", quantity: 0.200, unit: "L" }
              ],
              recipeBom: [
                { ingredientId: "ing-fresa", quantity: 0.150, unit: "kg" },
                { ingredientId: "ing-leche-entera", quantity: 0.200, unit: "L" },
                { ingredientId: "ing-azucar", quantity: 0.025, unit: "kg" },
                { ingredientId: "ing-vaso-domo-16oz", quantity: 1, unit: "und" }
              ]
            },
            {
              id: "prod-jugo-mango",
              sku: "JUG-03",
              name: "Jugo de Mango Pasión",
              shortName: "Mango Pasión",
              description: "Puro mango Kent cremoso y refrescante",
              price: 10.50,
              targetCost: 4.20,
              ui: {
                color: "yellow",
                bgClass: "bg-gradient-to-br from-yellow-500/20 to-amber-600/30 hover:from-yellow-500/30 hover:to-amber-600/40",
                borderClass: "border-yellow-500/40 hover:border-yellow-400",
                textClass: "text-yellow-100",
                badgeClass: "bg-yellow-500/20 text-yellow-300"
              },
              quickModifiers: [
                { id: "m-sin-azucar", label: "Sin Azúcar", priceDelta: 0.00, inventoryImpact: [{ ingredientId: "ing-azucar", qtyDelta: -0.020 }] },
                { id: "m-al-tiempo", label: "Al Tiempo", priceDelta: 0.00 }
              ],
              recipeBom: [
                { ingredientId: "ing-mango", quantity: 0.180, unit: "kg" },
                { ingredientId: "ing-azucar", quantity: 0.020, unit: "kg" },
                { ingredientId: "ing-vaso-domo-16oz", quantity: 1, unit: "und" }
              ]
            }
          ]
        },
        {
          id: "cat-frappes-helados",
          name: "Frappés & Helados",
          icon: "IceCream",
          products: [
            {
              id: "prod-frap-moka",
              sku: "FRP-01",
              name: "Frappé Moka Chanchamayo",
              shortName: "Frappé Moka",
              description: "Espresso doble, salsa moka, leche batida con hielo y chantilly",
              price: 13.50,
              targetCost: 5.60,
              ui: {
                color: "teal",
                bgClass: "bg-gradient-to-br from-teal-500/20 to-cyan-600/30 hover:from-teal-500/30 hover:to-cyan-600/40",
                borderClass: "border-teal-500/40 hover:border-teal-400",
                textClass: "text-teal-100",
                badgeClass: "bg-teal-500/20 text-teal-300"
              },
              quickModifiers: [
                { id: "m-extra-chantilly", label: "+ Chantilly", priceDelta: 1.50, toppingMasterId: "top-chantilly", ingredientId: "ing-crema-chantilly", quantity: 0.030, unit: "L" },
                { id: "m-extra-shot", label: "+ Shot Café", priceDelta: 2.00, toppingMasterId: "top-shot-cafe", ingredientId: "ing-cafe-espresso", quantity: 0.030, unit: "L" }
              ],
              recipeBom: [
                { ingredientId: "ing-cafe-espresso", quantity: 0.040, unit: "L" },
                { ingredientId: "ing-base-moka", quantity: 0.035, unit: "kg" },
                { ingredientId: "ing-leche-entera", quantity: 0.140, unit: "L" },
                { ingredientId: "ing-crema-chantilly", quantity: 0.025, unit: "L" },
                { ingredientId: "ing-vaso-domo-16oz", quantity: 1, unit: "und" }
              ]
            },
            {
              id: "prod-copa-helada",
              sku: "HEL-01",
              name: "Copa Artesanal Vainilla & Fresa",
              shortName: "Copa Helada",
              description: "Helado cremoso con fresas Huacho picadas y fudge",
              price: 11.50,
              targetCost: 4.80,
              ui: {
                color: "indigo",
                bgClass: "bg-gradient-to-br from-indigo-500/20 to-purple-600/30 hover:from-indigo-500/30 hover:to-purple-600/40",
                borderClass: "border-indigo-500/40 hover:border-indigo-400",
                textClass: "text-indigo-100",
                badgeClass: "bg-indigo-500/20 text-indigo-300"
              },
              quickModifiers: [
                { id: "m-extra-fudge", label: "+ Fudge Casero", priceDelta: 1.00, toppingMasterId: "top-fudge", ingredientId: "ing-fudge-chocolate", quantity: 0.025, unit: "kg" }
              ],
              recipeBom: [
                { ingredientId: "ing-base-helado-vainilla", quantity: 0.160, unit: "L" },
                { ingredientId: "ing-fresa", quantity: 0.060, unit: "kg" },
                { ingredientId: "ing-fudge-chocolate", quantity: 0.030, unit: "kg" },
                { ingredientId: "ing-vaso-domo-16oz", quantity: 1, unit: "und" }
              ]
            },
            {
              id: "prod-frap-tropical",
              sku: "FRP-02",
              name: "Frappé Tropical con Pulpa de Rescate",
              shortName: "Frappé Tropical",
              description: "Elaborado con pulpa congelada surtida (rescate de fruta), helado y chantilly",
              price: 12.50,
              targetCost: 4.90,
              ui: {
                color: "amber",
                bgClass: "bg-gradient-to-br from-amber-500/20 to-orange-600/30 hover:from-amber-500/30 hover:to-orange-600/40",
                borderClass: "border-amber-500/40 hover:border-amber-400",
                textClass: "text-amber-100",
                badgeClass: "bg-amber-500/20 text-amber-300"
              },
              quickModifiers: [
                { id: "m-extra-chantilly", label: "+ Chantilly", priceDelta: 1.50, toppingMasterId: "top-chantilly", ingredientId: "ing-crema-chantilly", quantity: 0.030, unit: "L" },
                { id: "m-fudge-drizzle", label: "+ Hilo de Fudge", priceDelta: 1.00, toppingMasterId: "top-fudge", ingredientId: "ing-fudge-chocolate", quantity: 0.020, unit: "kg" }
              ],
              recipeBom: [
                { ingredientId: "ing-pulpa-mixta", quantity: 0.150, unit: "kg" },
                { ingredientId: "ing-base-helado-vainilla", quantity: 0.080, unit: "L" },
                { ingredientId: "ing-crema-chantilly", quantity: 0.020, unit: "L" },
                { ingredientId: "ing-vaso-domo-16oz", quantity: 1, unit: "und" }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "linea-caliente",
      name: "Línea Caliente",
      theme: {
        accentColor: "#f43f5e", // Rose
        badgeColor: "bg-rose-600 text-white",
        activeTabClass: "border-rose-500 text-rose-400 bg-rose-950/40"
      },
      categories: [
        {
          id: "cat-sandwiches",
          name: "Sándwiches Clásicos",
          icon: "Sandwich",
          products: [
            {
              id: "prod-sand-pollo",
              sku: "SAN-01",
              name: "Sándwich Pollo Deshilachado",
              shortName: "Sándwich Pollo",
              description: "Pan ciabatta crocante, pechuga deshilachada y mayonesa casera",
              price: 8.50,
              targetCost: 3.60,
              ui: {
                color: "amber",
                bgClass: "bg-gradient-to-br from-amber-600/25 to-yellow-600/30 hover:from-amber-600/35 hover:to-yellow-600/45",
                borderClass: "border-amber-600/50 hover:border-amber-400",
                textClass: "text-amber-100",
                badgeClass: "bg-amber-600/25 text-amber-300"
              },
              quickModifiers: [
                { id: "m-sin-crema", label: "Sin Mayonesa", priceDelta: 0.00, inventoryImpact: [{ ingredientId: "ing-mayonesa", qtyDelta: -0.020 }] },
                { id: "m-queso-melt", label: "+ Queso Edam", priceDelta: 2.00, inventoryImpact: [{ ingredientId: "ing-queso-edam", qtyDelta: 0.035 }] }
              ],
              recipeBom: [
                { ingredientId: "ing-pan-ciabatta", quantity: 1, unit: "und" },
                { ingredientId: "ing-pollo-pechuga", quantity: 0.080, unit: "kg" },
                { ingredientId: "ing-mayonesa", quantity: 0.020, unit: "kg" },
                { ingredientId: "ing-caja-biodegradable", quantity: 1, unit: "und" }
              ]
            },
            {
              id: "prod-sand-mixto",
              sku: "SAN-02",
              name: "Sándwich Mixto Caliente",
              shortName: "Mixto Caliente",
              description: "Pan ciabatta a la plancha con doble queso Edam y jamón inglés",
              price: 7.50,
              targetCost: 3.10,
              ui: {
                color: "orange",
                bgClass: "bg-gradient-to-br from-orange-600/25 to-rose-600/30 hover:from-orange-600/35 hover:to-rose-600/45",
                borderClass: "border-orange-600/50 hover:border-orange-400",
                textClass: "text-orange-100",
                badgeClass: "bg-orange-600/25 text-orange-300"
              },
              quickModifiers: [
                { id: "m-extra-queso", label: "+ Extra Queso", priceDelta: 2.00, inventoryImpact: [{ ingredientId: "ing-queso-edam", qtyDelta: 0.035 }] }
              ],
              recipeBom: [
                { ingredientId: "ing-pan-ciabatta", quantity: 1, unit: "und" },
                { ingredientId: "ing-queso-edam", quantity: 0.050, unit: "kg" },
                { ingredientId: "ing-jamon-ingles", quantity: 0.040, unit: "kg" },
                { ingredientId: "ing-caja-biodegradable", quantity: 1, unit: "und" }
              ]
            }
          ]
        },
        {
          id: "cat-waffles-crepes",
          name: "Waffles & Crepes Rápidos",
          icon: "Flame",
          products: [
            {
              id: "prod-waffle-fresa",
              sku: "WAF-01",
              name: "Waffle Belga con Fresas y Fudge",
              shortName: "Waffle Fresa-Fudge",
              description: "Waffle dorado al momento, fresas frescas y abundante fudge artesanal",
              price: 13.00,
              targetCost: 5.20,
              ui: {
                color: "rose",
                bgClass: "bg-gradient-to-br from-rose-600/25 to-red-700/30 hover:from-rose-600/35 hover:to-red-700/45",
                borderClass: "border-rose-600/50 hover:border-rose-400",
                textClass: "text-rose-100",
                badgeClass: "bg-rose-600/25 text-rose-300"
              },
              quickModifiers: [
                { id: "m-con-helado", label: "+ Bola de Helado", priceDelta: 3.00, toppingMasterId: "top-helado-vainilla", ingredientId: "ing-base-helado-vainilla", quantity: 0.070, unit: "L" },
                { id: "m-extra-fudge", label: "+ Extra Fudge", priceDelta: 1.00, toppingMasterId: "top-fudge", ingredientId: "ing-fudge-chocolate", quantity: 0.025, unit: "kg" }
              ],
              recipeBom: [
                { ingredientId: "ing-masa-waffle", quantity: 0.120, unit: "L" },
                { ingredientId: "ing-fresa", quantity: 0.070, unit: "kg" },
                { ingredientId: "ing-caja-biodegradable", quantity: 1, unit: "und" }
              ]
            },
            {
              id: "prod-crepe-platano",
              sku: "CRP-01",
              name: "Crepe Francés con Plátano y Fudge",
              shortName: "Crepe Plátano-Fudge",
              description: "Crepe fino hecho al instante con masa artesanal, plátano de seda y fudge casero",
              price: 11.50,
              targetCost: 4.60,
              ui: {
                color: "amber",
                bgClass: "bg-gradient-to-br from-amber-600/25 to-yellow-600/30 hover:from-amber-600/35 hover:to-yellow-600/45",
                borderClass: "border-amber-600/50 hover:border-amber-400",
                textClass: "text-amber-100",
                badgeClass: "bg-amber-600/25 text-amber-300"
              },
              quickModifiers: [
                { id: "m-con-helado", label: "+ Bola de Helado", priceDelta: 3.00, toppingMasterId: "top-helado-vainilla", ingredientId: "ing-base-helado-vainilla", quantity: 0.070, unit: "L" },
                { id: "m-extra-fudge", label: "+ Extra Fudge", priceDelta: 1.00, toppingMasterId: "top-fudge", ingredientId: "ing-fudge-chocolate", quantity: 0.025, unit: "kg" }
              ],
              recipeBom: [
                { ingredientId: "ing-masa-waffle", quantity: 0.090, unit: "L" },
                { ingredientId: "ing-platano", quantity: 0.080, unit: "kg" },
                { ingredientId: "ing-fudge-chocolate", quantity: 0.030, unit: "kg" },
                { ingredientId: "ing-caja-biodegradable", quantity: 1, unit: "und" }
              ]
            }
          ]
        },
        {
          id: "cat-subrecetas-base",
          name: "Subrecetas & Preparaciones Base",
          icon: "Layers",
          products: [
            {
              id: "rec-sub-pulpa",
              sku: "SUB-001",
              name: "Pulpa Congelada Surtida (Rescate)",
              shortName: "Pulpa Rescate",
              description: "Pre-elaborado de fruta madura seleccionada y procesada al vacío para jugos y frappés",
              price: 0.00,
              targetCost: 3.10,
              recipeType: "base",
              yieldUnit: "kg",
              isActive: true,
              ui: {
                color: "amber",
                bgClass: "bg-amber-500/10 hover:bg-amber-500/20",
                borderClass: "border-amber-500/40",
                textClass: "text-amber-300",
                badgeClass: "bg-amber-500/20 text-amber-300"
              },
              quickModifiers: [],
              recipeBom: [
                { ingredientId: "ing-papaya", quantity: 0.400, unit: "kg" },
                { ingredientId: "ing-pina", quantity: 0.300, unit: "kg" },
                { ingredientId: "ing-platano", quantity: 0.200, unit: "kg" },
                { ingredientId: "ing-azucar", quantity: 0.080, unit: "kg" }
              ]
            },
            {
              id: "rec-sub-pulpa-papaya",
              sku: "SUB-005",
              name: "Pulpa Congelada de Papaya (Rescate)",
              shortName: "Pulpa Papaya",
              description: "Procesado y congelado de papaya madura para jugos especiales y mixtos",
              price: 0.00,
              targetCost: 3.20,
              recipeType: "base",
              yieldUnit: "kg",
              isActive: true,
              ui: {
                color: "amber",
                bgClass: "bg-amber-500/10 hover:bg-amber-500/20",
                borderClass: "border-amber-500/40",
                textClass: "text-amber-300",
                badgeClass: "bg-amber-500/20 text-amber-300"
              },
              quickModifiers: [],
              recipeBom: [
                { ingredientId: "ing-papaya", quantity: 0.950, unit: "kg" },
                { ingredientId: "ing-azucar", quantity: 0.050, unit: "kg" }
              ]
            },
            {
              id: "rec-sub-pulpa-fresa",
              sku: "SUB-006",
              name: "Pulpa Congelada de Fresa (Rescate)",
              shortName: "Pulpa Fresa",
              description: "Pulpa de fresa madura seleccionada y pasteurizada para frappés y batidos",
              price: 0.00,
              targetCost: 7.50,
              recipeType: "base",
              yieldUnit: "kg",
              isActive: true,
              ui: {
                color: "rose",
                bgClass: "bg-rose-500/10 hover:bg-rose-500/20",
                borderClass: "border-rose-500/40",
                textClass: "text-rose-300",
                badgeClass: "bg-rose-500/20 text-rose-300"
              },
              quickModifiers: [],
              recipeBom: [
                { ingredientId: "ing-fresa", quantity: 0.950, unit: "kg" },
                { ingredientId: "ing-azucar", quantity: 0.050, unit: "kg" }
              ]
            },
            {
              id: "rec-sub-pulpa-pina",
              sku: "SUB-007",
              name: "Pulpa Congelada de Piña (Rescate)",
              shortName: "Pulpa Piña",
              description: "Concentrado y pulpa de piña golden madura",
              price: 0.00,
              targetCost: 3.40,
              recipeType: "base",
              yieldUnit: "kg",
              isActive: true,
              ui: {
                color: "yellow",
                bgClass: "bg-yellow-500/10 hover:bg-yellow-500/20",
                borderClass: "border-yellow-500/40",
                textClass: "text-yellow-300",
                badgeClass: "bg-yellow-500/20 text-yellow-300"
              },
              quickModifiers: [],
              recipeBom: [
                { ingredientId: "ing-pina", quantity: 0.950, unit: "kg" },
                { ingredientId: "ing-azucar", quantity: 0.050, unit: "kg" }
              ]
            },
            {
              id: "rec-sub-pulpa-mango",
              sku: "SUB-008",
              name: "Pulpa Congelada de Mango (Rescate)",
              shortName: "Pulpa Mango",
              description: "Pulpa dulce de mango kent maduro para granizados y batidos",
              price: 0.00,
              targetCost: 8.50,
              recipeType: "base",
              yieldUnit: "kg",
              isActive: true,
              ui: {
                color: "orange",
                bgClass: "bg-orange-500/10 hover:bg-orange-500/20",
                borderClass: "border-orange-500/40",
                textClass: "text-orange-300",
                badgeClass: "bg-orange-500/20 text-orange-300"
              },
              quickModifiers: [],
              recipeBom: [
                { ingredientId: "ing-mango", quantity: 0.950, unit: "kg" },
                { ingredientId: "ing-azucar", quantity: 0.050, unit: "kg" }
              ]
            },
            {
              id: "rec-sub-waffle",
              sku: "SUB-002",
              name: "Mix Batido Masa Waffles/Crepes",
              shortName: "Mix Masa Waffle",
              description: "Batido base pre-elaborado para despacho ultra rápido (<3 min) en plancha de waffles",
              price: 0.00,
              targetCost: 7.20,
              recipeType: "base",
              yieldUnit: "L",
              isActive: true,
              ui: {
                color: "purple",
                bgClass: "bg-purple-500/10 hover:bg-purple-500/20",
                borderClass: "border-purple-500/40",
                textClass: "text-purple-300",
                badgeClass: "bg-purple-500/20 text-purple-300"
              },
              quickModifiers: [],
              recipeBom: [
                { ingredientId: "ing-harina-trigo", quantity: 0.400, unit: "kg" },
                { ingredientId: "ing-leche-entera", quantity: 0.500, unit: "L" },
                { ingredientId: "ing-huevo-fresco", quantity: 2, unit: "und" },
                { ingredientId: "ing-azucar", quantity: 0.060, unit: "kg" }
              ]
            },
            {
              id: "rec-sub-fudge",
              sku: "SUB-003",
              name: "Fudge Artesanal Juguería",
              shortName: "Fudge Artesanal",
              description: "Reducción artesanal de leche entera, azúcar rubia y cacao moka concentrado",
              price: 0.00,
              targetCost: 15.00,
              recipeType: "base",
              yieldUnit: "kg",
              isActive: true,
              ui: {
                color: "orange",
                bgClass: "bg-orange-500/10 hover:bg-orange-500/20",
                borderClass: "border-orange-500/40",
                textClass: "text-orange-300",
                badgeClass: "bg-orange-500/20 text-orange-300"
              },
              quickModifiers: [],
              recipeBom: [
                { ingredientId: "ing-leche-entera", quantity: 0.600, unit: "L" },
                { ingredientId: "ing-azucar", quantity: 0.250, unit: "kg" },
                { ingredientId: "ing-base-moka", quantity: 0.150, unit: "kg" }
              ]
            },
            {
              id: "rec-sub-mayo",
              sku: "SUB-004",
              name: "Mayonesa Casera Juguería",
              shortName: "Mayonesa Casera",
              description: "Emulsión fresca de huevos de granja y aceite vegetal para sándwiches",
              price: 0.00,
              targetCost: 12.00,
              recipeType: "base",
              yieldUnit: "kg",
              isActive: true,
              ui: {
                color: "yellow",
                bgClass: "bg-yellow-500/10 hover:bg-yellow-500/20",
                borderClass: "border-yellow-500/40",
                textClass: "text-yellow-300",
                badgeClass: "bg-yellow-500/20 text-yellow-300"
              },
              quickModifiers: [],
              recipeBom: [
                { ingredientId: "ing-aceite-vegetal", quantity: 0.750, unit: "L" },
                { ingredientId: "ing-huevo-fresco", quantity: 4, unit: "und" }
              ]
            }
          ]
        }
      ]
    }
  ]
};
