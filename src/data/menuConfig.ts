import type { MenuConfig } from '../types';

export const initialMenuConfig: MenuConfig = {
  "version": "2.5.0",
  "currency": "PEN",
  "lines": [
    {
      "id": "linea-fria",
      "name": "Línea Fría",
      "theme": {
        "accentColor": "#06b6d4",
        "badgeColor": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
        "activeTabClass": "bg-cyan-600 text-white shadow-cyan-600/30"
      },
      "categories": [
        {
          "id": "cat-jugos",
          "name": "Jugos Naturales & Especiales",
          "icon": "🥤",
          "products": [
            {
              "id": "prod-jugo-surtido",
              "sku": "JUG-01",
              "name": "Jugo Surtido Especial",
              "shortName": "Surtido Especial",
              "price": 11,
              "targetCost": 2.5,
              "category": "cat-jugos",
              "recipeType": "final",
              "isActive": true,
              "ui": {
                "color": "cyan",
                "bgClass": "bg-cyan-950/40",
                "borderClass": "border-cyan-500/30",
                "textClass": "text-cyan-200"
              },
              "quickModifiers": [
                {
                  "id": "mod-sin-azucar",
                  "label": "Sin Azúcar",
                  "priceDelta": 0
                },
                {
                  "id": "mod-con-leche",
                  "label": "+ Con Leche",
                  "priceDelta": 2,
                  "toppingMasterId": "top-leche",
                  "ingredientId": "ing-leche-entera",
                  "quantity": 0.15,
                  "unit": "L"
                },
                {
                  "id": "mod-algarrobina",
                  "label": "+ Algarrobina",
                  "priceDelta": 1.5,
                  "toppingMasterId": "top-algarrobina",
                  "ingredientId": "ing-algarrobina",
                  "quantity": 0.03,
                  "unit": "L"
                }
              ],
              "recipeBom": [
                {
                  "ingredientId": "ing-papaya",
                  "quantity": 0.1,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-pina",
                  "quantity": 0.08,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-platano",
                  "quantity": 0.05,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-fresa",
                  "quantity": 0.04,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-azucar",
                  "quantity": 0.025,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-vaso-16oz",
                  "quantity": 1,
                  "unit": "und",
                  "isDisposable": true
                },
                {
                  "ingredientId": "ing-sorbete",
                  "quantity": 1,
                  "unit": "und",
                  "isDisposable": true
                },
                {
                  "ingredientId": "ing-servilleta",
                  "quantity": 2,
                  "unit": "und",
                  "isDisposable": true
                }
              ]
            },
            {
              "id": "prod-jugo-papaya",
              "sku": "JUG-02",
              "name": "Jugo de Papaya al Natural",
              "shortName": "Jugo Papaya",
              "price": 8.5,
              "targetCost": 1.8,
              "category": "cat-jugos",
              "recipeType": "final",
              "isActive": true,
              "ui": {
                "color": "amber",
                "bgClass": "bg-amber-950/40",
                "borderClass": "border-amber-500/30",
                "textClass": "text-amber-200"
              },
              "quickModifiers": [
                {
                  "id": "mod-sin-azucar",
                  "label": "Sin Azúcar",
                  "priceDelta": 0
                },
                {
                  "id": "mod-con-leche",
                  "label": "+ Con Leche",
                  "priceDelta": 2,
                  "toppingMasterId": "top-leche",
                  "ingredientId": "ing-leche-entera",
                  "quantity": 0.15,
                  "unit": "L"
                }
              ],
              "recipeBom": [
                {
                  "ingredientId": "ing-papaya",
                  "quantity": 0.25,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-azucar",
                  "quantity": 0.025,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-vaso-16oz",
                  "quantity": 1,
                  "unit": "und",
                  "isDisposable": true
                },
                {
                  "ingredientId": "ing-sorbete",
                  "quantity": 1,
                  "unit": "und",
                  "isDisposable": true
                },
                {
                  "ingredientId": "ing-servilleta",
                  "quantity": 2,
                  "unit": "und",
                  "isDisposable": true
                }
              ]
            }
          ]
        },
        {
          "id": "cat-helados",
          "name": "Copas de Helado & Especiales",
          "icon": "🍨",
          "products": [
            {
              "id": "prod-banana-split",
              "sku": "HEL-05",
              "name": "Banana Split Clásica Sabor & Fruta",
              "shortName": "Banana Split",
              "price": 16.5,
              "targetCost": 4.2,
              "category": "cat-helados",
              "recipeType": "final",
              "isActive": true,
              "ui": {
                "color": "cyan",
                "bgClass": "bg-cyan-950/40",
                "borderClass": "border-cyan-500/30",
                "textClass": "text-cyan-200"
              },
              "quickModifiers": [
                {
                  "id": "mod-extra-fudge",
                  "label": "+ Extra Fudge",
                  "priceDelta": 1,
                  "toppingMasterId": "top-extra-fudge",
                  "ingredientId": "ing-fudge-chocolate",
                  "quantity": 0.03,
                  "unit": "kg"
                },
                {
                  "id": "mod-chantilly",
                  "label": "+ Crema Chantilly",
                  "priceDelta": 2,
                  "toppingMasterId": "top-chantilly",
                  "ingredientId": "ing-crema-chantilly",
                  "quantity": 0.04,
                  "unit": "kg"
                }
              ],
              "flavorSlots": [
                {
                  "slotIndex": 0,
                  "label": "Bola 1",
                  "category": "helados",
                  "quantity": 0.07,
                  "unit": "L",
                  "required": true
                },
                {
                  "slotIndex": 1,
                  "label": "Bola 2",
                  "category": "helados",
                  "quantity": 0.07,
                  "unit": "L",
                  "required": true
                },
                {
                  "slotIndex": 2,
                  "label": "Bola 3",
                  "category": "helados",
                  "quantity": 0.07,
                  "unit": "L",
                  "required": true
                }
              ],
              "recipeBom": [
                {
                  "ingredientId": "ing-platano",
                  "quantity": 0.12,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-fudge-chocolate",
                  "quantity": 0.03,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-vaso-helado",
                  "quantity": 1,
                  "unit": "und",
                  "isDisposable": true
                },
                {
                  "ingredientId": "ing-servilleta",
                  "quantity": 2,
                  "unit": "und",
                  "isDisposable": true
                }
              ]
            },
            {
              "id": "prod-copa-2-bolas",
              "sku": "HEL-02",
              "name": "Copa de Helado Artesanal (2 Bolas)",
              "shortName": "Helado 2 Bolas",
              "price": 10,
              "targetCost": 2.8,
              "category": "cat-helados",
              "recipeType": "final",
              "isActive": true,
              "ui": {
                "color": "cyan",
                "bgClass": "bg-cyan-950/40",
                "borderClass": "border-cyan-500/30",
                "textClass": "text-cyan-200"
              },
              "quickModifiers": [
                {
                  "id": "mod-extra-fudge",
                  "label": "+ Extra Fudge",
                  "priceDelta": 1,
                  "toppingMasterId": "top-extra-fudge",
                  "ingredientId": "ing-fudge-chocolate",
                  "quantity": 0.03,
                  "unit": "kg"
                }
              ],
              "servingOptions": [
                {
                  "id": "srv-vasito",
                  "name": "En Vasito + Cucharita",
                  "ingredientId": "ing-vaso-helado",
                  "priceDelta": 0
                },
                {
                  "id": "srv-cono",
                  "name": "En Cono Barquillo",
                  "ingredientId": "ing-cono-barquillo",
                  "priceDelta": 0
                }
              ],
              "flavorSlots": [
                {
                  "slotIndex": 0,
                  "label": "Bola 1",
                  "category": "helados",
                  "quantity": 0.07,
                  "unit": "L",
                  "required": true
                },
                {
                  "slotIndex": 1,
                  "label": "Bola 2",
                  "category": "helados",
                  "quantity": 0.07,
                  "unit": "L",
                  "required": true
                }
              ],
              "recipeBom": [
                {
                  "ingredientId": "ing-fudge-chocolate",
                  "quantity": 0.02,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-servilleta",
                  "quantity": 2,
                  "unit": "und",
                  "isDisposable": true
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
        "badgeColor": "bg-rose-500/20 text-rose-400 border-rose-500/30",
        "activeTabClass": "bg-rose-600 text-white shadow-rose-600/30"
      },
      "categories": [
        {
          "id": "cat-sandwiches",
          "name": "Sándwiches Clásicos",
          "icon": "🥪",
          "products": [
            {
              "id": "prod-san-pollo",
              "sku": "SAN-01",
              "name": "Sándwich Pollo Deshilachado",
              "shortName": "Sándwich Pollo",
              "price": 8.5,
              "targetCost": 2.6,
              "category": "cat-sandwiches",
              "recipeType": "final",
              "isActive": true,
              "ui": {
                "color": "rose",
                "bgClass": "bg-rose-950/40",
                "borderClass": "border-rose-500/30",
                "textClass": "text-rose-200"
              },
              "flavorSlots": [
                {
                  "slotIndex": 0,
                  "label": "Tipo de Pan",
                  "category": "panaderia",
                  "quantity": 1,
                  "unit": "und",
                  "required": true
                }
              ],
              "quickModifiers": [
                {
                  "id": "mod-sin-mayonesa",
                  "label": "Sin Mayonesa",
                  "priceDelta": 0
                },
                {
                  "id": "mod-queso-edam",
                  "label": "+ Queso Edam",
                  "priceDelta": 2,
                  "toppingMasterId": "top-queso-edam",
                  "ingredientId": "ing-queso-edam",
                  "quantity": 0.03,
                  "unit": "kg"
                }
              ],
              "recipeBom": [
                {
                  "ingredientId": "ing-pollo-pechuga",
                  "quantity": 0.09,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-mayonesa",
                  "quantity": 0.02,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-caja-sandwich",
                  "quantity": 1,
                  "unit": "und",
                  "isDisposable": true
                },
                {
                  "ingredientId": "ing-servilleta",
                  "quantity": 2,
                  "unit": "und",
                  "isDisposable": true
                }
              ]
            },
            {
              "id": "prod-san-mixto",
              "sku": "SAN-02",
              "name": "Mixto Caliente Jamón & Queso",
              "shortName": "Mixto Caliente",
              "price": 7.5,
              "targetCost": 2.1,
              "category": "cat-sandwiches",
              "recipeType": "final",
              "isActive": true,
              "ui": {
                "color": "rose",
                "bgClass": "bg-rose-950/40",
                "borderClass": "border-rose-500/30",
                "textClass": "text-rose-200"
              },
              "flavorSlots": [
                {
                  "slotIndex": 0,
                  "label": "Tipo de Pan",
                  "category": "panaderia",
                  "quantity": 1,
                  "unit": "und",
                  "required": true
                }
              ],
              "quickModifiers": [
                {
                  "id": "mod-sin-mantequilla",
                  "label": "Sin Mantequilla",
                  "priceDelta": 0
                }
              ],
              "recipeBom": [
                {
                  "ingredientId": "ing-jamon-ingles",
                  "quantity": 0.05,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-queso-edam",
                  "quantity": 0.05,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-mantequilla",
                  "quantity": 0.01,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-caja-sandwich",
                  "quantity": 1,
                  "unit": "und",
                  "isDisposable": true
                },
                {
                  "ingredientId": "ing-servilleta",
                  "quantity": 2,
                  "unit": "und",
                  "isDisposable": true
                }
              ]
            }
          ]
        },
        {
          "id": "cat-waffles",
          "name": "Waffles & Crepes Rápidos",
          "icon": "🥞",
          "products": [
            {
              "id": "prod-waffle-fresa",
              "sku": "WAF-01",
              "name": "Waffle Belga con Fresas y Fudge",
              "shortName": "Waffle Fresa-Fudge",
              "price": 13,
              "targetCost": 3.5,
              "category": "cat-waffles",
              "recipeType": "final",
              "isActive": true,
              "ui": {
                "color": "amber",
                "bgClass": "bg-amber-950/40",
                "borderClass": "border-amber-500/30",
                "textClass": "text-amber-200"
              },
              "quickModifiers": [
                {
                  "id": "mod-top-helado",
                  "label": "+ Bola de Helado",
                  "priceDelta": 3,
                  "toppingMasterId": "top-bola-helado",
                  "hasVariants": true,
                  "variantCategory": "helados",
                  "ingredientId": "ing-base-helado-vainilla",
                  "quantity": 0.07,
                  "unit": "L"
                },
                {
                  "id": "mod-extra-fudge",
                  "label": "+ Extra Fudge",
                  "priceDelta": 1,
                  "toppingMasterId": "top-extra-fudge",
                  "ingredientId": "ing-fudge-chocolate",
                  "quantity": 0.03,
                  "unit": "kg"
                }
              ],
              "recipeBom": [
                {
                  "ingredientId": "ing-mix-waffle",
                  "quantity": 0.18,
                  "unit": "L"
                },
                {
                  "ingredientId": "ing-fresa",
                  "quantity": 0.08,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-fudge-chocolate",
                  "quantity": 0.035,
                  "unit": "kg"
                },
                {
                  "ingredientId": "ing-plato-waffle",
                  "quantity": 1,
                  "unit": "und",
                  "isDisposable": true
                },
                {
                  "ingredientId": "ing-servilleta",
                  "quantity": 2,
                  "unit": "und",
                  "isDisposable": true
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  "globalModifiers": [
    {
      "id": "gmod-llevar",
      "label": "Para Llevar",
      "type": "toggle"
    }
  ]
};
