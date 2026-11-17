import type { MenuConfig } from '../types';

export const initialMenuConfig: MenuConfig = {
  "version": "2.1.0",
  "currency": "S/",
  "globalModifiers": [
    {
      "id": "gmod-llevar",
      "label": "🛍️ Para Llevar",
      "type": "toggle"
    },
    {
      "id": "gmod-mesa",
      "label": "🍽️ En Mesa",
      "type": "toggle"
    },
    {
      "id": "gmod-urgente",
      "label": "⚡ Prioritario (<2min)",
      "type": "flag"
    }
  ],
  "lines": [
    {
      "id": "linea-fria",
      "name": "Línea Fría",
      "theme": {
        "accentColor": "#06b6d4",
        "badgeColor": "bg-cyan-600 text-white",
        "activeTabClass": "border-cyan-500 text-cyan-400 bg-cyan-950/40"
      },
      "categories": [
        {
          "id": "cat-jugos",
          "name": "Jugos Naturales & Especiales",
          "icon": "GlassWater",
          "products": [
            {
              "id": "prod-jugo-surtido",
              "sku": "JUG-01",
              "name": "Jugo Surtido Especial",
              "shortName": "Surtido Especial",
              "description": "Pack mix de fruta fresca porcionada (papaya, piña, plátano, fresa) y toque de algarrobina",
              "price": 11,
              "targetCost": 4.8,
              "ui": {
                "color": "amber",
                "bgClass": "bg-gradient-to-br from-amber-500/20 to-orange-600/30 hover:from-amber-500/30 hover:to-orange-600/40",
                "borderClass": "border-amber-500/40 hover:border-amber-400",
                "textClass": "text-amber-100",
                "badgeClass": "bg-amber-500/20 text-amber-300"
              },
              "quickModifiers": [
                {
                  "id": "m-sin-azucar",
                  "label": "Sin Azúcar",
                  "priceDelta": 0,
                  "inventoryImpact": [
                    {
                      "ingredientId": "ing-azucar",
                      "qtyDelta": -0.025
                    }
                  ]
                },
                {
                  "id": "m-leche-extra",
                  "label": "+ Con Leche",
                  "priceDelta": 2,
                  "inventoryImpact": [
                    {
                      "ingredientId": "ing-leche-entera",
                      "qtyDelta": 0.12
                    }
                  ]
                },
                {
                  "id": "m-algarrobina-plus",
                  "label": "+ Algarrobina",
                  "priceDelta": 1.5,
                  "inventoryImpact": [
                    {
                      "ingredientId": "ing-algarrobina",
                      "qtyDelta": 0.02
                    }
                  ]
                }
              ],
              "recipeBom": [
                {
                  "ingredientId": "sub-mix-surtido-fresco",
                  "quantity": 1,
                  "unit": "und"
                },
                {
                  "ingredientId": "ing-azucar",
                  "quantity": 0.025,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-vaso-domo-16oz",
                  "quantity": 1,
                  "unit": "und"
                }
              ]
            },
            {
              "id": "prod-fresa-leche",
              "sku": "JUG-02",
              "name": "Jugo de Fresa con Leche",
              "shortName": "Fresa con Leche",
              "description": "Pack porcionado de fresas Huacho seleccionadas y leche batida",
              "price": 12,
              "targetCost": 5.2,
              "ui": {
                "color": "rose",
                "bgClass": "bg-gradient-to-br from-rose-500/20 to-pink-600/30 hover:from-rose-500/30 hover:to-pink-600/40",
                "borderClass": "border-rose-500/40 hover:border-rose-400",
                "textClass": "text-rose-100",
                "badgeClass": "bg-rose-500/20 text-rose-300"
              },
              "quickModifiers": [
                {
                  "id": "m-sin-azucar",
                  "label": "Sin Azúcar",
                  "priceDelta": 0
                },
                {
                  "id": "m-deslactosada",
                  "label": "Deslactosada",
                  "priceDelta": 1.5,
                  "toppingMasterId": "top-leche-deslact",
                  "ingredientId": "ing-leche-deslact",
                  "quantity": 0.2,
                  "unit": "L"
                }
              ],
              "recipeBom": [
                {
                  "ingredientId": "sub-porcion-fresa-limpia",
                  "quantity": 1,
                  "unit": "und"
                },
                {
                  "ingredientId": "ing-leche-entera",
                  "quantity": 0.2,
                  "unit": "L"
                },
                {
                  "ingredientId": "ing-azucar",
                  "quantity": 0.025,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-vaso-domo-16oz",
                  "quantity": 1,
                  "unit": "und"
                }
              ]
            },
            {
              "id": "prod-jugo-mango",
              "sku": "JUG-03",
              "name": "Jugo de Mango Pasión",
              "shortName": "Mango Pasión",
              "description": "Pack porcionado de mango Kent cremoso y refrescante",
              "price": 10.5,
              "targetCost": 4.2,
              "ui": {
                "color": "yellow",
                "bgClass": "bg-gradient-to-br from-yellow-500/20 to-amber-600/30 hover:from-yellow-500/30 hover:to-amber-600/40",
                "borderClass": "border-yellow-500/40 hover:border-yellow-400",
                "textClass": "text-yellow-100",
                "badgeClass": "bg-yellow-500/20 text-yellow-300"
              },
              "quickModifiers": [
                {
                  "id": "m-sin-azucar",
                  "label": "Sin Azúcar",
                  "priceDelta": 0,
                  "inventoryImpact": [
                    {
                      "ingredientId": "ing-azucar",
                      "qtyDelta": -0.02
                    }
                  ]
                },
                {
                  "id": "m-al-tiempo",
                  "label": "Al Tiempo",
                  "priceDelta": 0
                }
              ],
              "recipeBom": [
                {
                  "ingredientId": "sub-porcion-mango-fresco",
                  "quantity": 1,
                  "unit": "und"
                },
                {
                  "ingredientId": "ing-azucar",
                  "quantity": 0.02,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-vaso-domo-16oz",
                  "quantity": 1,
                  "unit": "und"
                }
              ]
            }
          ]
        },
        {
          "id": "cat-frappes-agua",
          "name": "Frappés al Agua (Base Cristal)",
          "icon": "Sparkles",
          "products": [
            {
              "id": "prod-frap-maracuya",
              "sku": "FRP-AG-01",
              "name": "Frappé de Maracuyá 16oz",
              "shortName": "Frappé Maracuyá",
              "description": "Pulpa de maracuyá, Base Cristal (antisinéresis), agua purificada y hielo frappé",
              "price": 11.5,
              "targetCost": 2.8,
              "ui": {
                "color": "amber",
                "bgClass": "bg-amber-600/20 hover:bg-amber-600/30",
                "borderClass": "border-amber-500/40",
                "textClass": "text-amber-200",
                "badgeClass": "bg-amber-500/20 text-amber-300"
              },
              "quickModifiers": [],
              "recipeBom": [
                {
                  "ingredientId": "ing-pulpa-maracuya",
                  "quantity": 0.1,
                  "unit": "kg"
                },
                {
                  "ingredientId": "sub-base-cristal",
                  "quantity": 0.016,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-agua-bidon",
                  "quantity": 0.09,
                  "unit": "L"
                },
                {
                  "ingredientId": "ing-hielo",
                  "quantity": 0.25,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-vaso-domo-16oz",
                  "quantity": 1,
                  "unit": "und"
                }
              ]
            },
            {
              "id": "prod-frap-fresa-agua",
              "sku": "FRP-AG-02",
              "name": "Frappé de Fresa al Agua 16oz",
              "shortName": "Frappé Fresa Agua",
              "description": "Fresas congeladas, Base Cristal homogénea, agua purificada y hielo",
              "price": 12,
              "targetCost": 3.1,
              "ui": {
                "color": "rose",
                "bgClass": "bg-rose-600/20 hover:bg-rose-600/30",
                "borderClass": "border-rose-500/40",
                "textClass": "text-rose-200",
                "badgeClass": "bg-rose-500/20 text-rose-300"
              },
              "quickModifiers": [],
              "recipeBom": [
                {
                  "ingredientId": "ing-fresa-congelada",
                  "quantity": 0.11,
                  "unit": "kg"
                },
                {
                  "ingredientId": "sub-base-cristal",
                  "quantity": 0.016,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-agua-bidon",
                  "quantity": 0.085,
                  "unit": "L"
                },
                {
                  "ingredientId": "ing-hielo",
                  "quantity": 0.25,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-vaso-domo-16oz",
                  "quantity": 1,
                  "unit": "und"
                }
              ]
            },
            {
              "id": "prod-frap-mango-agua",
              "sku": "FRP-AG-03",
              "name": "Frappé de Mango al Agua 16oz",
              "shortName": "Frappé Mango Agua",
              "description": "Mango en cubos congelado, Base Cristal, agua purificada y hielo en cubos",
              "price": 12,
              "targetCost": 3.2,
              "ui": {
                "color": "yellow",
                "bgClass": "bg-yellow-600/20 hover:bg-yellow-600/30",
                "borderClass": "border-yellow-500/40",
                "textClass": "text-yellow-200",
                "badgeClass": "bg-yellow-500/20 text-yellow-300"
              },
              "quickModifiers": [],
              "recipeBom": [
                {
                  "ingredientId": "ing-mango-congelado",
                  "quantity": 0.11,
                  "unit": "kg"
                },
                {
                  "ingredientId": "sub-base-cristal",
                  "quantity": 0.016,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-agua-bidon",
                  "quantity": 0.085,
                  "unit": "L"
                },
                {
                  "ingredientId": "ing-hielo",
                  "quantity": 0.25,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-vaso-domo-16oz",
                  "quantity": 1,
                  "unit": "und"
                }
              ]
            },
            {
              "id": "prod-frap-limonada-azul",
              "sku": "FRP-AG-04",
              "name": "Frappé Limonada Azul (Blue Curaçao) 16oz",
              "shortName": "Limonada Azul Frappé",
              "description": "Limón sutil exprimido, sirope Blue Curaçao, Base Cristal, agua y hielo",
              "price": 11.5,
              "targetCost": 2.7,
              "ui": {
                "color": "blue",
                "bgClass": "bg-blue-600/20 hover:bg-blue-600/30",
                "borderClass": "border-blue-500/40",
                "textClass": "text-blue-200",
                "badgeClass": "bg-blue-500/20 text-blue-300"
              },
              "quickModifiers": [],
              "recipeBom": [
                {
                  "ingredientId": "ing-limon-sutil",
                  "quantity": 0.07,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-sirope-blue-curacao",
                  "quantity": 0.03,
                  "unit": "L"
                },
                {
                  "ingredientId": "sub-base-cristal",
                  "quantity": 0.016,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-agua-bidon",
                  "quantity": 0.08,
                  "unit": "L"
                },
                {
                  "ingredientId": "ing-hielo",
                  "quantity": 0.26,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-vaso-domo-16oz",
                  "quantity": 1,
                  "unit": "und"
                }
              ]
            },
            {
              "id": "prod-frap-limonada-hierbabuena",
              "sku": "FRP-AG-05",
              "name": "Frappé Limonada Hierbabuena 16oz",
              "shortName": "Limonada Hierbabuena",
              "description": "Limón sutil fresco, hierbabuena seleccionada, jarabe de goma, Base Cristal y hielo",
              "price": 11.5,
              "targetCost": 2.5,
              "ui": {
                "color": "emerald",
                "bgClass": "bg-emerald-600/20 hover:bg-emerald-600/30",
                "borderClass": "border-emerald-500/40",
                "textClass": "text-emerald-200",
                "badgeClass": "bg-emerald-500/20 text-emerald-300"
              },
              "quickModifiers": [],
              "recipeBom": [
                {
                  "ingredientId": "ing-limon-sutil",
                  "quantity": 0.07,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-hierbabuena",
                  "quantity": 0.008,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-jarabe-goma",
                  "quantity": 0.02,
                  "unit": "L"
                },
                {
                  "ingredientId": "sub-base-cristal",
                  "quantity": 0.016,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-agua-bidon",
                  "quantity": 0.08,
                  "unit": "L"
                },
                {
                  "ingredientId": "ing-hielo",
                  "quantity": 0.26,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-vaso-domo-16oz",
                  "quantity": 1,
                  "unit": "und"
                }
              ]
            }
          ]
        },
        {
          "id": "cat-frappes-leche",
          "name": "Frappés Cremosos (Base Neutra)",
          "icon": "IceCream",
          "products": [
            {
              "id": "prod-frap-cafe",
              "sku": "FRP-LC-01",
              "name": "Frappé de Café (Cold Brew) 16oz",
              "shortName": "Frappé Cold Brew",
              "description": "Concentrado de café Cold Brew, leche, Base Neutra emulsionante, fudge y corona de chantilly",
              "price": 13.5,
              "targetCost": 4.2,
              "ui": {
                "color": "amber",
                "bgClass": "bg-amber-800/25 hover:bg-amber-800/35",
                "borderClass": "border-amber-700/50",
                "textClass": "text-amber-200",
                "badgeClass": "bg-amber-700/30 text-amber-200"
              },
              "quickModifiers": [
                {
                  "id": "m-extra-chantilly",
                  "label": "+ Chantilly",
                  "priceDelta": 1.5,
                  "ingredientId": "ing-crema-chantilly",
                  "quantity": 0.025,
                  "unit": "kg"
                }
              ],
              "recipeBom": [
                {
                  "ingredientId": "ing-concentrado-cafe",
                  "quantity": 0.06,
                  "unit": "L"
                },
                {
                  "ingredientId": "ing-leche-evaporada",
                  "quantity": 0.1,
                  "unit": "L"
                },
                {
                  "ingredientId": "sub-base-neutra",
                  "quantity": 0.016,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-jarabe-goma",
                  "quantity": 0.015,
                  "unit": "L"
                },
                {
                  "ingredientId": "ing-hielo",
                  "quantity": 0.22,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-fudge-chocolate",
                  "quantity": 0.02,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-crema-chantilly",
                  "quantity": 0.025,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-vaso-domo-16oz",
                  "quantity": 1,
                  "unit": "und"
                }
              ]
            },
            {
              "id": "prod-frap-moccaccino",
              "sku": "FRP-LC-02",
              "name": "Frappé Moccaccino 16oz",
              "shortName": "Frappé Moccaccino",
              "description": "Concentrado Cold Brew, leche entera, Base Neutra, fudge de chocolate y chantilly",
              "price": 14,
              "targetCost": 4.6,
              "ui": {
                "color": "amber",
                "bgClass": "bg-stone-800/30 hover:bg-stone-800/40",
                "borderClass": "border-amber-600/40",
                "textClass": "text-stone-200",
                "badgeClass": "bg-stone-700/40 text-amber-300"
              },
              "quickModifiers": [],
              "recipeBom": [
                {
                  "ingredientId": "ing-concentrado-cafe",
                  "quantity": 0.05,
                  "unit": "L"
                },
                {
                  "ingredientId": "ing-leche-evaporada",
                  "quantity": 0.1,
                  "unit": "L"
                },
                {
                  "ingredientId": "sub-base-neutra",
                  "quantity": 0.016,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-fudge-chocolate",
                  "quantity": 0.03,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-hielo",
                  "quantity": 0.22,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-crema-chantilly",
                  "quantity": 0.025,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-vaso-domo-16oz",
                  "quantity": 1,
                  "unit": "und"
                }
              ]
            },
            {
              "id": "prod-frap-oreo",
              "sku": "FRP-LC-03",
              "name": "Frappé de Oreo 16oz",
              "shortName": "Frappé Oreo",
              "description": "Galleta Oreo original triturada, leche, Base Neutra cremosa, fudge y chantilly",
              "price": 14.5,
              "targetCost": 4.8,
              "ui": {
                "color": "slate",
                "bgClass": "bg-slate-800/40 hover:bg-slate-800/50",
                "borderClass": "border-slate-600/50",
                "textClass": "text-slate-100",
                "badgeClass": "bg-slate-700/50 text-slate-200"
              },
              "quickModifiers": [],
              "recipeBom": [
                {
                  "ingredientId": "ing-galleta-oreo",
                  "quantity": 0.036,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-leche-evaporada",
                  "quantity": 0.12,
                  "unit": "L"
                },
                {
                  "ingredientId": "sub-base-neutra",
                  "quantity": 0.016,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-hielo",
                  "quantity": 0.22,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-fudge-chocolate",
                  "quantity": 0.025,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-crema-chantilly",
                  "quantity": 0.025,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-vaso-domo-16oz",
                  "quantity": 1,
                  "unit": "und"
                }
              ]
            },
            {
              "id": "prod-frap-lucuma",
              "sku": "FRP-LC-04",
              "name": "Frappé de Lúcuma 16oz",
              "shortName": "Frappé Lúcuma",
              "description": "Pura pulpa de lúcuma seda, leche, Base Neutra, hilo de fudge y chantilly",
              "price": 14.5,
              "targetCost": 4.7,
              "ui": {
                "color": "amber",
                "bgClass": "bg-amber-700/25 hover:bg-amber-700/35",
                "borderClass": "border-amber-600/50",
                "textClass": "text-amber-200",
                "badgeClass": "bg-amber-600/30 text-amber-200"
              },
              "quickModifiers": [],
              "recipeBom": [
                {
                  "ingredientId": "ing-pulpa-lucuma",
                  "quantity": 0.11,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-leche-evaporada",
                  "quantity": 0.09,
                  "unit": "L"
                },
                {
                  "ingredientId": "sub-base-neutra",
                  "quantity": 0.016,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-azucar",
                  "quantity": 0.015,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-hielo",
                  "quantity": 0.22,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-fudge-chocolate",
                  "quantity": 0.015,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-crema-chantilly",
                  "quantity": 0.025,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-vaso-domo-16oz",
                  "quantity": 1,
                  "unit": "und"
                }
              ]
            },
            {
              "id": "prod-frap-fresa-cremoso",
              "sku": "FRP-LC-05",
              "name": "Frappé de Fresa Cremoso 16oz",
              "shortName": "Frappé Fresa Cream",
              "description": "Fresas congeladas, leche, Base Neutra emulsionada, fudge y corona de chantilly",
              "price": 14,
              "targetCost": 4.3,
              "ui": {
                "color": "rose",
                "bgClass": "bg-rose-700/25 hover:bg-rose-700/35",
                "borderClass": "border-rose-600/50",
                "textClass": "text-rose-200",
                "badgeClass": "bg-rose-600/30 text-rose-200"
              },
              "quickModifiers": [],
              "recipeBom": [
                {
                  "ingredientId": "ing-fresa-congelada",
                  "quantity": 0.12,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-leche-evaporada",
                  "quantity": 0.09,
                  "unit": "L"
                },
                {
                  "ingredientId": "sub-base-neutra",
                  "quantity": 0.016,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-azucar",
                  "quantity": 0.015,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-hielo",
                  "quantity": 0.22,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-fudge-chocolate",
                  "quantity": 0.015,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-crema-chantilly",
                  "quantity": 0.025,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-vaso-domo-16oz",
                  "quantity": 1,
                  "unit": "und"
                }
              ]
            },
            {
              "id": "prod-frap-mango-cremoso",
              "sku": "FRP-LC-06",
              "name": "Frappé de Mango Cremoso 16oz",
              "shortName": "Frappé Mango Cream",
              "description": "Mango Kent congelado, leche entera, Base Neutra, manjar blanco y chantilly",
              "price": 14,
              "targetCost": 4.4,
              "ui": {
                "color": "yellow",
                "bgClass": "bg-yellow-700/25 hover:bg-yellow-700/35",
                "borderClass": "border-yellow-600/50",
                "textClass": "text-yellow-200",
                "badgeClass": "bg-yellow-600/30 text-yellow-200"
              },
              "quickModifiers": [],
              "recipeBom": [
                {
                  "ingredientId": "ing-mango-congelado",
                  "quantity": 0.12,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-leche-evaporada",
                  "quantity": 0.09,
                  "unit": "L"
                },
                {
                  "ingredientId": "sub-base-neutra",
                  "quantity": 0.016,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-azucar",
                  "quantity": 0.015,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-hielo",
                  "quantity": 0.22,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-manjar-blanco",
                  "quantity": 0.015,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-crema-chantilly",
                  "quantity": 0.025,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-vaso-domo-16oz",
                  "quantity": 1,
                  "unit": "und"
                }
              ]
            }
          ]
        },
        {
          "id": "cat-smoothies",
          "name": "Smoothies Frutales & Fit",
          "icon": "Flame",
          "products": [
            {
              "id": "prod-smoothie-fresa-platano",
              "sku": "SMO-01",
              "name": "Smoothie Fresa Plátano 16oz",
              "shortName": "Smoothie Fresa-Plátano",
              "description": "Fresas y plátano congelados batidos con yogurt natural bebible, toque de miel y hielo",
              "price": 12.5,
              "targetCost": 3.5,
              "ui": {
                "color": "pink",
                "bgClass": "bg-pink-600/25 hover:bg-pink-600/35",
                "borderClass": "border-pink-500/50",
                "textClass": "text-pink-100",
                "badgeClass": "bg-pink-600/30 text-pink-200"
              },
              "quickModifiers": [],
              "recipeBom": [
                {
                  "ingredientId": "ing-fresa-congelada",
                  "quantity": 0.12,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-platano-congelado",
                  "quantity": 0.06,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-yogurt-natural",
                  "quantity": 0.15,
                  "unit": "L"
                },
                {
                  "ingredientId": "ing-jarabe-goma",
                  "quantity": 0.02,
                  "unit": "L"
                },
                {
                  "ingredientId": "ing-hielo",
                  "quantity": 0.06,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-vaso-domo-16oz",
                  "quantity": 1,
                  "unit": "und"
                }
              ]
            },
            {
              "id": "prod-smoothie-tropical",
              "sku": "SMO-02",
              "name": "Smoothie Tropical Mango Piña 16oz",
              "shortName": "Smoothie Mango-Piña",
              "description": "Mango y piña congelados batidos con yogurt natural y miel",
              "price": 13,
              "targetCost": 3.7,
              "ui": {
                "color": "amber",
                "bgClass": "bg-amber-600/25 hover:bg-amber-600/35",
                "borderClass": "border-amber-500/50",
                "textClass": "text-amber-100",
                "badgeClass": "bg-amber-600/30 text-amber-200"
              },
              "quickModifiers": [],
              "recipeBom": [
                {
                  "ingredientId": "ing-mango-congelado",
                  "quantity": 0.14,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-pina-congelada",
                  "quantity": 0.05,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-yogurt-natural",
                  "quantity": 0.14,
                  "unit": "L"
                },
                {
                  "ingredientId": "ing-jarabe-goma",
                  "quantity": 0.02,
                  "unit": "L"
                },
                {
                  "ingredientId": "ing-hielo",
                  "quantity": 0.06,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-vaso-domo-16oz",
                  "quantity": 1,
                  "unit": "und"
                }
              ]
            },
            {
              "id": "prod-smoothie-frutos-rojos",
              "sku": "SMO-03",
              "name": "Smoothie Frutos Rojos 16oz",
              "shortName": "Smoothie Frutos Rojos",
              "description": "Fresas y arándanos congelados batidos con yogurt natural y miel de abeja",
              "price": 14,
              "targetCost": 4.1,
              "ui": {
                "color": "purple",
                "bgClass": "bg-purple-600/25 hover:bg-purple-600/35",
                "borderClass": "border-purple-500/50",
                "textClass": "text-purple-100",
                "badgeClass": "bg-purple-600/30 text-purple-200"
              },
              "quickModifiers": [],
              "recipeBom": [
                {
                  "ingredientId": "ing-fresa-congelada",
                  "quantity": 0.12,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-arandanos-congelados",
                  "quantity": 0.06,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-yogurt-natural",
                  "quantity": 0.15,
                  "unit": "L"
                },
                {
                  "ingredientId": "ing-jarabe-goma",
                  "quantity": 0.02,
                  "unit": "L"
                },
                {
                  "ingredientId": "ing-hielo",
                  "quantity": 0.06,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-vaso-domo-16oz",
                  "quantity": 1,
                  "unit": "und"
                }
              ]
            },
            {
              "id": "prod-smoothie-pina-colada",
              "sku": "SMO-04",
              "name": "Smoothie Piña Colada Fit 16oz",
              "shortName": "Piña Colada Fit",
              "description": "Piña y plátano congelados batidos con leche de coco y yogurt natural",
              "price": 13,
              "targetCost": 3.6,
              "ui": {
                "color": "teal",
                "bgClass": "bg-teal-600/25 hover:bg-teal-600/35",
                "borderClass": "border-teal-500/50",
                "textClass": "text-teal-100",
                "badgeClass": "bg-teal-600/30 text-teal-200"
              },
              "quickModifiers": [],
              "recipeBom": [
                {
                  "ingredientId": "ing-pina-congelada",
                  "quantity": 0.14,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-platano-congelado",
                  "quantity": 0.04,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-leche-coco",
                  "quantity": 0.15,
                  "unit": "L"
                },
                {
                  "ingredientId": "ing-jarabe-goma",
                  "quantity": 0.02,
                  "unit": "L"
                },
                {
                  "ingredientId": "ing-hielo",
                  "quantity": 0.06,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-vaso-domo-16oz",
                  "quantity": 1,
                  "unit": "und"
                }
              ]
            }
          ]
        },
        {
          "id": "cat-helados",
          "name": "Copas Artesanales & Helados",
          "icon": "Sparkles",
          "products": [
            {
              "id": "prod-copa-helada",
              "sku": "HEL-01",
              "name": "Copa Artesanal Vainilla & Fresa",
              "shortName": "Copa Helada",
              "description": "Helado cremoso con fresas Huacho picadas al momento y fudge",
              "price": 11.5,
              "targetCost": 3.15,
              "recipeType": "final",
              "isActive": true,
              "ui": {
                "color": "indigo",
                "bgClass": "bg-indigo-500/20 hover:bg-indigo-500/30",
                "borderClass": "border-indigo-500/40",
                "textClass": "text-indigo-100",
                "badgeClass": "bg-indigo-500/20 text-indigo-300"
              },
              "quickModifiers": [
                {
                  "id": "m-extra-fudge",
                  "label": "+ Fudge Casero",
                  "priceDelta": 1,
                  "toppingMasterId": "top-fudge",
                  "ingredientId": "ing-fudge-chocolate",
                  "quantity": 0.025,
                  "unit": "kg"
                },
                {
                  "id": "m-bola-extra",
                  "label": "+ Bola Extra Helado",
                  "priceDelta": 3,
                  "toppingMasterId": "top-helado-vainilla",
                  "ingredientId": "ing-base-helado-vainilla",
                  "quantity": 0.07,
                  "unit": "L",
                  "hasVariants": true,
                  "allowedIngredientIds": [
                    "ing-base-helado-vainilla",
                    "ing-helado-chocolate",
                    "ing-helado-fresa",
                    "ing-helado-lucuma",
                    "ing-helado-mango",
                    "ing-helado-maracuya"
                  ]
                }
              ],
              "recipeBom": [
                {
                  "ingredientId": "ing-base-helado-vainilla",
                  "quantity": 0.16,
                  "unit": "L"
                },
                {
                  "ingredientId": "ing-fresa",
                  "quantity": 0.06,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-fudge-chocolate",
                  "quantity": 0.03,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-vaso-domo-16oz",
                  "quantity": 1,
                  "unit": "und"
                }
              ]
            },
            {
              "id": "prod-helado-simple",
              "sku": "HEL-02",
              "name": "Helado Simple (1 Bola)",
              "shortName": "Helado Simple",
              "description": "1 bola generosa de helado artesanal a elección (70ml) en barquillo o vasito",
              "price": 5.0,
              "targetCost": 1.09,
              "recipeType": "final",
              "isActive": true,
              "ui": {
                "color": "cyan",
                "bgClass": "bg-cyan-500/20 hover:bg-cyan-500/30",
                "borderClass": "border-cyan-500/40",
                "textClass": "text-cyan-100",
                "badgeClass": "bg-cyan-500/20 text-cyan-300"
              },
              "flavorSlots": [
                {
                  "slotIndex": 1,
                  "label": "Sabor de Helado",
                  "category": "lacteos",
                  "allowedIngredientIds": [
                    "ing-base-helado-vainilla",
                    "ing-helado-chocolate",
                    "ing-helado-fresa",
                    "ing-helado-lucuma",
                    "ing-helado-mango",
                    "ing-helado-maracuya"
                  ],
                  "quantity": 0.07,
                  "unit": "L",
                  "required": true
                }
              ],
              "servingOptions": [
                { "id": "srv-cono", "name": "En Cono Barquillo", "ingredientId": "ing-cono-barquillo", "priceDelta": 0 },
                { "id": "srv-vaso", "name": "En Vasito + Cucharita", "ingredientId": "ing-vaso-helado", "priceDelta": 0 }
              ],
              "quickModifiers": [
                {
                  "id": "m-extra-fudge",
                  "label": "+ Fudge Casero",
                  "priceDelta": 1,
                  "toppingMasterId": "top-fudge",
                  "ingredientId": "ing-fudge-chocolate",
                  "quantity": 0.025,
                  "unit": "kg"
                },
                {
                  "id": "m-chantilly",
                  "label": "+ Corona Chantilly",
                  "priceDelta": 1.5,
                  "toppingMasterId": "top-chantilly",
                  "ingredientId": "ing-crema-chantilly",
                  "quantity": 0.03,
                  "unit": "kg"
                }
              ],
              "recipeBom": []
            },
            {
              "id": "prod-helado-doble",
              "sku": "HEL-03",
              "name": "Helado Doble (2 Bolas)",
              "shortName": "Helado Doble",
              "description": "2 bolas de helado artesanal combinables a elección (140ml) en barquillo o vasito",
              "price": 9.0,
              "targetCost": 1.86,
              "recipeType": "final",
              "isActive": true,
              "ui": {
                "color": "amber",
                "bgClass": "bg-amber-500/20 hover:bg-amber-500/30",
                "borderClass": "border-amber-500/40",
                "textClass": "text-amber-100",
                "badgeClass": "bg-amber-500/20 text-amber-300"
              },
              "flavorSlots": [
                {
                  "slotIndex": 1,
                  "label": "Bola 1",
                  "category": "lacteos",
                  "allowedIngredientIds": [
                    "ing-base-helado-vainilla",
                    "ing-helado-chocolate",
                    "ing-helado-fresa",
                    "ing-helado-lucuma",
                    "ing-helado-mango",
                    "ing-helado-maracuya"
                  ],
                  "quantity": 0.07,
                  "unit": "L",
                  "required": true
                },
                {
                  "slotIndex": 2,
                  "label": "Bola 2",
                  "category": "lacteos",
                  "allowedIngredientIds": [
                    "ing-base-helado-vainilla",
                    "ing-helado-chocolate",
                    "ing-helado-fresa",
                    "ing-helado-lucuma",
                    "ing-helado-mango",
                    "ing-helado-maracuya"
                  ],
                  "quantity": 0.07,
                  "unit": "L",
                  "required": true
                }
              ],
              "servingOptions": [
                { "id": "srv-cono", "name": "En Cono Barquillo", "ingredientId": "ing-cono-barquillo", "priceDelta": 0 },
                { "id": "srv-vaso", "name": "En Vasito + Cucharita", "ingredientId": "ing-vaso-helado", "priceDelta": 0 }
              ],
              "quickModifiers": [
                {
                  "id": "m-extra-fudge",
                  "label": "+ Fudge Casero",
                  "priceDelta": 1,
                  "toppingMasterId": "top-fudge",
                  "ingredientId": "ing-fudge-chocolate",
                  "quantity": 0.025,
                  "unit": "kg"
                },
                {
                  "id": "m-chantilly",
                  "label": "+ Corona Chantilly",
                  "priceDelta": 1.5,
                  "toppingMasterId": "top-chantilly",
                  "ingredientId": "ing-crema-chantilly",
                  "quantity": 0.03,
                  "unit": "kg"
                }
              ],
              "recipeBom": []
            },
            {
              "id": "prod-helado-triple",
              "sku": "HEL-04",
              "name": "Helado Triple (3 Bolas)",
              "shortName": "Helado Triple",
              "description": "3 bolas de helado artesanal combinables a elección (210ml) en vasito o cono",
              "price": 12.5,
              "targetCost": 2.71,
              "recipeType": "final",
              "isActive": true,
              "ui": {
                "color": "rose",
                "bgClass": "bg-rose-500/20 hover:bg-rose-500/30",
                "borderClass": "border-rose-500/40",
                "textClass": "text-rose-100",
                "badgeClass": "bg-rose-500/20 text-rose-300"
              },
              "flavorSlots": [
                {
                  "slotIndex": 1,
                  "label": "Bola 1",
                  "category": "lacteos",
                  "allowedIngredientIds": [
                    "ing-base-helado-vainilla",
                    "ing-helado-chocolate",
                    "ing-helado-fresa",
                    "ing-helado-lucuma",
                    "ing-helado-mango",
                    "ing-helado-maracuya"
                  ],
                  "quantity": 0.07,
                  "unit": "L",
                  "required": true
                },
                {
                  "slotIndex": 2,
                  "label": "Bola 2",
                  "category": "lacteos",
                  "allowedIngredientIds": [
                    "ing-base-helado-vainilla",
                    "ing-helado-chocolate",
                    "ing-helado-fresa",
                    "ing-helado-lucuma",
                    "ing-helado-mango",
                    "ing-helado-maracuya"
                  ],
                  "quantity": 0.07,
                  "unit": "L",
                  "required": true
                },
                {
                  "slotIndex": 3,
                  "label": "Bola 3",
                  "category": "lacteos",
                  "allowedIngredientIds": [
                    "ing-base-helado-vainilla",
                    "ing-helado-chocolate",
                    "ing-helado-fresa",
                    "ing-helado-lucuma",
                    "ing-helado-mango",
                    "ing-helado-maracuya"
                  ],
                  "quantity": 0.07,
                  "unit": "L",
                  "required": true
                }
              ],
              "servingOptions": [
                { "id": "srv-vaso", "name": "En Vasito + Cucharita", "ingredientId": "ing-vaso-helado", "priceDelta": 0 },
                { "id": "srv-cono", "name": "En Cono Barquillo", "ingredientId": "ing-cono-barquillo", "priceDelta": 0 }
              ],
              "quickModifiers": [
                {
                  "id": "m-extra-fudge",
                  "label": "+ Fudge Casero",
                  "priceDelta": 1,
                  "toppingMasterId": "top-fudge",
                  "ingredientId": "ing-fudge-chocolate",
                  "quantity": 0.025,
                  "unit": "kg"
                },
                {
                  "id": "m-chantilly",
                  "label": "+ Corona Chantilly",
                  "priceDelta": 1.5,
                  "toppingMasterId": "top-chantilly",
                  "ingredientId": "ing-crema-chantilly",
                  "quantity": 0.03,
                  "unit": "kg"
                }
              ],
              "recipeBom": []
            },
            {
              "id": "prod-banana-split",
              "sku": "HEL-05",
              "name": "Banana Split Clásica Sabor & Fruta",
              "shortName": "Banana Split",
              "description": "Plátano de seda entero con 3 bolas de helado a elección, fudge casero, corona de chantilly y barquillo",
              "price": 16.5,
              "targetCost": 4.35,
              "recipeType": "final",
              "isActive": true,
              "ui": {
                "color": "amber",
                "bgClass": "bg-yellow-500/20 hover:bg-yellow-500/30",
                "borderClass": "border-yellow-500/40",
                "textClass": "text-yellow-100",
                "badgeClass": "bg-yellow-500/20 text-yellow-300"
              },
              "flavorSlots": [
                {
                  "slotIndex": 1,
                  "label": "Bola 1",
                  "category": "lacteos",
                  "allowedIngredientIds": [
                    "ing-base-helado-vainilla",
                    "ing-helado-chocolate",
                    "ing-helado-fresa",
                    "ing-helado-lucuma",
                    "ing-helado-mango",
                    "ing-helado-maracuya"
                  ],
                  "quantity": 0.07,
                  "unit": "L",
                  "required": true
                },
                {
                  "slotIndex": 2,
                  "label": "Bola 2",
                  "category": "lacteos",
                  "allowedIngredientIds": [
                    "ing-base-helado-vainilla",
                    "ing-helado-chocolate",
                    "ing-helado-fresa",
                    "ing-helado-lucuma",
                    "ing-helado-mango",
                    "ing-helado-maracuya"
                  ],
                  "quantity": 0.07,
                  "unit": "L",
                  "required": true
                },
                {
                  "slotIndex": 3,
                  "label": "Bola 3",
                  "category": "lacteos",
                  "allowedIngredientIds": [
                    "ing-base-helado-vainilla",
                    "ing-helado-chocolate",
                    "ing-helado-fresa",
                    "ing-helado-lucuma",
                    "ing-helado-mango",
                    "ing-helado-maracuya"
                  ],
                  "quantity": 0.07,
                  "unit": "L",
                  "required": true
                }
              ],
              "quickModifiers": [
                {
                  "id": "m-extra-fudge",
                  "label": "+ Extra Fudge",
                  "priceDelta": 1,
                  "toppingMasterId": "top-fudge",
                  "ingredientId": "ing-fudge-chocolate",
                  "quantity": 0.025,
                  "unit": "kg"
                }
              ],
              "recipeBom": [
                {
                  "ingredientId": "ing-platano",
                  "quantity": 0.18,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-fudge-chocolate",
                  "quantity": 0.03,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-crema-chantilly",
                  "quantity": 0.025,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-vaso-domo-16oz",
                  "quantity": 1,
                  "unit": "und"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "linea-caliente",
      "name": "Línea Caliente",
      "theme": {
        "accentColor": "#f43f5e",
        "badgeColor": "bg-rose-600 text-white",
        "activeTabClass": "border-rose-500 text-rose-400 bg-rose-950/40"
      },
      "categories": [
        {
          "id": "cat-sandwiches",
          "name": "Sándwiches Clásicos",
          "icon": "Sandwich",
          "products": [
            {
              "id": "prod-sand-pollo",
              "sku": "SAN-01",
              "name": "Sándwich Pollo Deshilachado",
              "shortName": "Sándwich Pollo",
              "description": "Pan ciabatta crocante, pechuga deshilachada y mayonesa casera",
              "price": 8.5,
              "targetCost": 3.6,
              "ui": {
                "color": "amber",
                "bgClass": "bg-amber-600/25 hover:bg-amber-600/35",
                "borderClass": "border-amber-600/50",
                "textClass": "text-amber-100",
                "badgeClass": "bg-amber-600/25 text-amber-300"
              },
              "quickModifiers": [
                {
                  "id": "m-sin-crema",
                  "label": "Sin Mayonesa",
                  "priceDelta": 0,
                  "inventoryImpact": [
                    {
                      "ingredientId": "ing-mayonesa",
                      "qtyDelta": -0.02
                    }
                  ]
                },
                {
                  "id": "m-queso-melt",
                  "label": "+ Queso Edam",
                  "priceDelta": 2,
                  "inventoryImpact": [
                    {
                      "ingredientId": "ing-queso-edam",
                      "qtyDelta": 0.035
                    }
                  ]
                }
              ],
              "recipeBom": [
                {
                  "ingredientId": "ing-pan-ciabatta",
                  "quantity": 1,
                  "unit": "und"
                },
                {
                  "ingredientId": "ing-pollo-pechuga",
                  "quantity": 0.08,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-mayonesa",
                  "quantity": 0.02,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-caja-biodegradable",
                  "quantity": 1,
                  "unit": "und"
                }
              ]
            },
            {
              "id": "prod-sand-mixto",
              "sku": "SAN-02",
              "name": "Sándwich Mixto Caliente",
              "shortName": "Mixto Caliente",
              "description": "Pan ciabatta a la plancha con doble queso Edam y jamón inglés",
              "price": 7.5,
              "targetCost": 3.1,
              "ui": {
                "color": "orange",
                "bgClass": "bg-orange-600/25 hover:bg-orange-600/35",
                "borderClass": "border-orange-600/50",
                "textClass": "text-orange-100",
                "badgeClass": "bg-orange-600/25 text-orange-300"
              },
              "quickModifiers": [
                {
                  "id": "m-extra-queso",
                  "label": "+ Extra Queso",
                  "priceDelta": 2,
                  "inventoryImpact": [
                    {
                      "ingredientId": "ing-queso-edam",
                      "qtyDelta": 0.035
                    }
                  ]
                }
              ],
              "recipeBom": [
                {
                  "ingredientId": "ing-pan-ciabatta",
                  "quantity": 1,
                  "unit": "und"
                },
                {
                  "ingredientId": "ing-queso-edam",
                  "quantity": 0.05,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-jamon-ingles",
                  "quantity": 0.04,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-caja-biodegradable",
                  "quantity": 1,
                  "unit": "und"
                }
              ]
            }
          ]
        },
        {
          "id": "cat-waffles-crepes",
          "name": "Waffles & Crepes Rápidos",
          "icon": "Flame",
          "products": [
            {
              "id": "prod-waffle-fresa",
              "sku": "WAF-01",
              "name": "Waffle Belga con Fresas y Fudge",
              "shortName": "Waffle Fresa-Fudge",
              "description": "Waffle dorado al momento, fresas frescas en rodajas y abundante fudge artesanal",
              "price": 13,
              "targetCost": 5.2,
              "ui": {
                "color": "rose",
                "bgClass": "bg-rose-600/25 hover:bg-rose-600/35",
                "borderClass": "border-rose-600/50",
                "textClass": "text-rose-100",
                "badgeClass": "bg-rose-600/25 text-rose-300"
              },
              "quickModifiers": [
                {
                  "id": "m-con-helado",
                  "label": "+ Bola de Helado",
                  "priceDelta": 3,
                  "toppingMasterId": "top-helado-vainilla",
                  "ingredientId": "ing-base-helado-vainilla",
                  "quantity": 0.07,
                  "unit": "L"
                },
                {
                  "id": "m-extra-fudge",
                  "label": "+ Extra Fudge",
                  "priceDelta": 1,
                  "toppingMasterId": "top-fudge",
                  "ingredientId": "ing-fudge-chocolate",
                  "quantity": 0.025,
                  "unit": "kg"
                }
              ],
              "recipeBom": [
                {
                  "ingredientId": "ing-masa-waffle",
                  "quantity": 0.12,
                  "unit": "L"
                },
                {
                  "ingredientId": "ing-fresa",
                  "quantity": 0.07,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-caja-biodegradable",
                  "quantity": 1,
                  "unit": "und"
                }
              ]
            },
            {
              "id": "prod-crepe-platano",
              "sku": "CRP-01",
              "name": "Crepe Francés con Plátano y Fudge",
              "shortName": "Crepe Plátano-Fudge",
              "description": "Crepe fino hecho al instante con masa artesanal, plátano de seda cortado al momento y fudge",
              "price": 11.5,
              "targetCost": 4.6,
              "ui": {
                "color": "amber",
                "bgClass": "bg-amber-600/25 hover:bg-amber-600/35",
                "borderClass": "border-amber-600/50",
                "textClass": "text-amber-100",
                "badgeClass": "bg-amber-600/25 text-amber-300"
              },
              "quickModifiers": [
                {
                  "id": "m-con-helado",
                  "label": "+ Bola de Helado",
                  "priceDelta": 3,
                  "toppingMasterId": "top-helado-vainilla",
                  "ingredientId": "ing-base-helado-vainilla",
                  "quantity": 0.07,
                  "unit": "L"
                },
                {
                  "id": "m-extra-fudge",
                  "label": "+ Extra Fudge",
                  "priceDelta": 1,
                  "toppingMasterId": "top-fudge",
                  "ingredientId": "ing-fudge-chocolate",
                  "quantity": 0.025,
                  "unit": "kg"
                }
              ],
              "recipeBom": [
                {
                  "ingredientId": "ing-masa-waffle",
                  "quantity": 0.09,
                  "unit": "L"
                },
                {
                  "ingredientId": "ing-platano",
                  "quantity": 0.08,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-fudge-chocolate",
                  "quantity": 0.03,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-caja-biodegradable",
                  "quantity": 1,
                  "unit": "und"
                }
              ]
            }
          ]
        },
        {
          "id": "cat-subrecetas-base",
          "name": "Subrecetas & Premezclas de Barra",
          "icon": "Layers",
          "products": [
            {
              "id": "rec-base-neutra",
              "sku": "SUB-020",
              "name": "Base Neutra (Frappés Lácteos)",
              "shortName": "Base Neutra",
              "description": "Premezcla emulsionante para frappés lácteos (dosis 16g por vaso)",
              "price": 0,
              "targetCost": 17.65,
              "recipeType": "base",
              "yieldUnit": "kg",
              "isActive": true,
              "ui": {
                "color": "amber",
                "bgClass": "bg-amber-500/10",
                "borderClass": "border-amber-500/40",
                "textClass": "text-amber-300",
                "badgeClass": "bg-amber-500/20 text-amber-300"
              },
              "quickModifiers": [],
              "recipeBom": [
                {
                  "ingredientId": "ing-crema-no-lactea",
                  "quantity": 0.2,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-leche-polvo",
                  "quantity": 0.24,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-azucar-glass",
                  "quantity": 0.2,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-cmc",
                  "quantity": 0.03,
                  "unit": "kg"
                }
              ]
            },
            {
              "id": "rec-base-cristal",
              "sku": "SUB-021",
              "name": "Base Cristal (Frappés al Agua)",
              "shortName": "Base Cristal",
              "description": "Premezcla antisinéresis para frappés al agua (dosis 16g por vaso)",
              "price": 0,
              "targetCost": 4.7,
              "recipeType": "base",
              "yieldUnit": "kg",
              "isActive": true,
              "ui": {
                "color": "cyan",
                "bgClass": "bg-cyan-500/10",
                "borderClass": "border-cyan-500/40",
                "textClass": "text-cyan-300",
                "badgeClass": "bg-cyan-500/20 text-cyan-300"
              },
              "quickModifiers": [],
              "recipeBom": [
                {
                  "ingredientId": "ing-azucar",
                  "quantity": 0.9,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-cmc",
                  "quantity": 0.02,
                  "unit": "kg"
                }
              ]
            },
            {
              "id": "rec-mix-surtido-fresco",
              "sku": "SUB-010",
              "name": "Pack Mix Surtido Fresco (270g)",
              "shortName": "Pack Surtido",
              "description": "Mise en place porcionado en bolsas herméticas (papaya 100g, piña 80g, plátano 50g, fresa 40g)",
              "price": 0,
              "targetCost": 1.65,
              "recipeType": "base",
              "yieldUnit": "und",
              "isActive": true,
              "ui": {
                "color": "emerald",
                "bgClass": "bg-emerald-500/10",
                "borderClass": "border-emerald-500/40",
                "textClass": "text-emerald-300",
                "badgeClass": "bg-emerald-500/20 text-emerald-300"
              },
              "quickModifiers": [],
              "recipeBom": [
                {
                  "ingredientId": "ing-papaya",
                  "quantity": 0.14,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-pina",
                  "quantity": 0.13,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-platano",
                  "quantity": 0.075,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-fresa",
                  "quantity": 0.045,
                  "unit": "kg"
                }
              ]
            },
            {
              "id": "rec-sub-pulpa-mixta",
              "sku": "SUB-001",
              "name": "Pulpa Congelada Surtida (Rescate)",
              "shortName": "Pulpa Rescate",
              "description": "Pulpa congelada de fruta madura surtida",
              "price": 0,
              "targetCost": 3.1,
              "recipeType": "base",
              "yieldUnit": "kg",
              "isActive": true,
              "ui": {
                "color": "purple",
                "bgClass": "bg-purple-500/10",
                "borderClass": "border-purple-500/40",
                "textClass": "text-purple-300",
                "badgeClass": "bg-purple-500/20 text-purple-300"
              },
              "quickModifiers": [],
              "recipeBom": [
                {
                  "ingredientId": "ing-papaya",
                  "quantity": 0.4,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-pina",
                  "quantity": 0.3,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-platano",
                  "quantity": 0.2,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-azucar",
                  "quantity": 0.08,
                  "unit": "kg"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};
