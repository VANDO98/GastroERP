import type { Ingredient } from '../types';

export const initialIngredients: Ingredient[] = [
  {
    "id": "ing-papaya",
    "code": "FRU-001",
    "name": "Papaya Selva Especial",
    "itemType": "insumo",
    "category": "frutas",
    "unit": "kg",
    "stock": 25,
    "minStock": 5,
    "costPerUnit": 3.2,
    "isTaxAffected": false,
    "batches": [
      {
        "id": "batch-papaya-1",
        "date": "2026-11-08T09:00:00Z",
        "initialQty": 10,
        "remainingQty": 10,
        "unitCost": 3.5
      },
      {
        "id": "batch-papaya-2",
        "date": "2026-11-10T10:00:00Z",
        "initialQty": 15,
        "remainingQty": 15,
        "unitCost": 3
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-fresa",
    "code": "FRU-002",
    "name": "Fresas Huacho Seleccionadas",
    "itemType": "insumo",
    "category": "frutas",
    "unit": "kg",
    "stock": 11.81,
    "minStock": 3,
    "costPerUnit": 7.5,
    "isTaxAffected": false,
    "batches": [
      {
        "id": "batch-fresa-1",
        "date": "2026-11-09T08:00:00Z",
        "initialQty": 12,
        "remainingQty": 11.81,
        "unitCost": 7.5
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-pina",
    "code": "FRU-003",
    "name": "Piña Golden Junín",
    "itemType": "insumo",
    "category": "frutas",
    "unit": "kg",
    "stock": 18,
    "minStock": 4,
    "costPerUnit": 3.4,
    "isTaxAffected": false,
    "batches": [
      {
        "id": "batch-pina-1",
        "date": "2026-11-09T08:00:00Z",
        "initialQty": 18,
        "remainingQty": 18,
        "unitCost": 3.4
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-platano",
    "code": "FRU-004",
    "name": "Plátano de Seda de Tingo María",
    "itemType": "insumo",
    "category": "frutas",
    "unit": "kg",
    "stock": 14,
    "minStock": 4,
    "costPerUnit": 2.8,
    "isTaxAffected": false,
    "batches": [
      {
        "id": "batch-platano-1",
        "date": "2026-11-09T08:00:00Z",
        "initialQty": 14,
        "remainingQty": 14,
        "unitCost": 2.8
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-mango",
    "code": "FRU-005",
    "name": "Mango Kent Dulce",
    "itemType": "insumo",
    "category": "frutas",
    "unit": "kg",
    "stock": 8,
    "minStock": 2.5,
    "costPerUnit": 8.5,
    "isTaxAffected": false,
    "batches": [
      {
        "id": "batch-mango-1",
        "date": "2026-11-10T08:00:00Z",
        "initialQty": 8,
        "remainingQty": 8,
        "unitCost": 8.5
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-pulpa-mixta",
    "code": "SUB-001",
    "name": "Pulpa Congelada Surtida (Rescate)",
    "itemType": "subreceta",
    "category": "jarabes_bases",
    "unit": "kg",
    "stock": 5.85,
    "minStock": 1.5,
    "costPerUnit": 3.1,
    "isTaxAffected": false,
    "batches": [
      {
        "id": "batch-pulpa-1",
        "date": "2026-11-09T18:00:00Z",
        "initialQty": 6,
        "remainingQty": 5.85,
        "unitCost": 3.1
      }
    ],
    "isIntermediateRecipe": true
  },
  {
    "id": "ing-pulpa-papaya",
    "code": "SUB-005",
    "name": "Pulpa Congelada de Papaya (Rescate)",
    "itemType": "subreceta",
    "category": "jarabes_bases",
    "unit": "kg",
    "stock": 3,
    "minStock": 1,
    "costPerUnit": 3.2,
    "isTaxAffected": false,
    "batches": [
      {
        "id": "batch-pulpa-papaya-1",
        "date": "2026-11-09T18:00:00Z",
        "initialQty": 3,
        "remainingQty": 3,
        "unitCost": 3.2
      }
    ],
    "isIntermediateRecipe": true
  },
  {
    "id": "ing-pulpa-fresa",
    "code": "SUB-006",
    "name": "Pulpa Congelada de Fresa (Rescate)",
    "itemType": "subreceta",
    "category": "jarabes_bases",
    "unit": "kg",
    "stock": 2.5,
    "minStock": 1,
    "costPerUnit": 7.5,
    "isTaxAffected": false,
    "batches": [
      {
        "id": "batch-pulpa-fresa-1",
        "date": "2026-11-09T18:00:00Z",
        "initialQty": 2.5,
        "remainingQty": 2.5,
        "unitCost": 7.5
      }
    ],
    "isIntermediateRecipe": true
  },
  {
    "id": "ing-pulpa-pina",
    "code": "SUB-007",
    "name": "Pulpa Congelada de Piña (Rescate)",
    "itemType": "subreceta",
    "category": "jarabes_bases",
    "unit": "kg",
    "stock": 4,
    "minStock": 1,
    "costPerUnit": 3.4,
    "isTaxAffected": false,
    "batches": [
      {
        "id": "batch-pulpa-pina-1",
        "date": "2026-11-09T18:00:00Z",
        "initialQty": 4,
        "remainingQty": 4,
        "unitCost": 3.4
      }
    ],
    "isIntermediateRecipe": true
  },
  {
    "id": "ing-pulpa-mango",
    "code": "SUB-008",
    "name": "Pulpa Congelada de Mango (Rescate)",
    "itemType": "subreceta",
    "category": "jarabes_bases",
    "unit": "kg",
    "stock": 2,
    "minStock": 1,
    "costPerUnit": 8.5,
    "isTaxAffected": false,
    "batches": [
      {
        "id": "batch-pulpa-mango-1",
        "date": "2026-11-09T18:00:00Z",
        "initialQty": 2,
        "remainingQty": 2,
        "unitCost": 8.5
      }
    ],
    "isIntermediateRecipe": true
  },
  {
    "id": "ing-leche-entera",
    "code": "LAC-001",
    "name": "Leche Fresca Entera Pasteurizada",
    "itemType": "insumo",
    "category": "lacteos",
    "unit": "L",
    "stock": 27.86,
    "minStock": 6,
    "costPerUnit": 4.8,
    "isTaxAffected": true,
    "batches": [
      {
        "id": "batch-leche-1",
        "date": "2026-11-10T07:00:00Z",
        "initialQty": 28,
        "remainingQty": 27.86,
        "unitCost": 4.8
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-leche-deslact",
    "code": "LAC-002",
    "name": "Leche Deslactosada UHT",
    "itemType": "insumo",
    "category": "lacteos",
    "unit": "L",
    "stock": 10,
    "minStock": 2,
    "costPerUnit": 5.8,
    "isTaxAffected": true,
    "batches": [
      {
        "id": "batch-deslact-1",
        "date": "2026-11-09T07:00:00Z",
        "initialQty": 10,
        "remainingQty": 10,
        "unitCost": 5.8
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-queso-edam",
    "code": "LAC-003",
    "name": "Queso Edam Tajado Sandwichero",
    "itemType": "insumo",
    "category": "lacteos",
    "unit": "kg",
    "stock": 6,
    "minStock": 1.5,
    "costPerUnit": 32,
    "isTaxAffected": true,
    "batches": [
      {
        "id": "batch-queso-1",
        "date": "2026-11-08T08:00:00Z",
        "initialQty": 6,
        "remainingQty": 6,
        "unitCost": 32
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-pollo-pechuga",
    "code": "PRO-001",
    "name": "Pechuga Pollo Sancochada Deshilachada",
    "itemType": "insumo",
    "category": "proteinas",
    "unit": "kg",
    "stock": 7,
    "minStock": 2,
    "costPerUnit": 17.5,
    "isTaxAffected": true,
    "batches": [
      {
        "id": "batch-pollo-1",
        "date": "2026-11-10T06:00:00Z",
        "initialQty": 7,
        "remainingQty": 7,
        "unitCost": 17.5
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-jamon-ingles",
    "code": "PRO-002",
    "name": "Jamón Inglés Especial Sandwichero",
    "itemType": "insumo",
    "category": "proteinas",
    "unit": "kg",
    "stock": 4.5,
    "minStock": 1,
    "costPerUnit": 24,
    "isTaxAffected": true,
    "batches": [
      {
        "id": "batch-jamon-1",
        "date": "2026-11-09T08:00:00Z",
        "initialQty": 4.5,
        "remainingQty": 4.5,
        "unitCost": 24
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-pan-ciabatta",
    "code": "ABA-001",
    "name": "Pan Ciabatta Artesanal Crujiente",
    "itemType": "insumo",
    "category": "abarrotes",
    "unit": "und",
    "stock": 70,
    "minStock": 15,
    "costPerUnit": 0.5,
    "isTaxAffected": true,
    "batches": [
      {
        "id": "batch-pan-1",
        "date": "2026-11-10T06:00:00Z",
        "initialQty": 70,
        "remainingQty": 70,
        "unitCost": 0.5
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-azucar",
    "code": "ABA-002",
    "name": "Azúcar Rubia Doméstica",
    "itemType": "insumo",
    "category": "abarrotes",
    "unit": "kg",
    "stock": 30,
    "minStock": 8,
    "costPerUnit": 3.9,
    "isTaxAffected": true,
    "batches": [
      {
        "id": "batch-azucar-1",
        "date": "2026-11-05T10:00:00Z",
        "initialQty": 30,
        "remainingQty": 30,
        "unitCost": 3.9
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-masa-waffle",
    "code": "SUB-002",
    "name": "Mix Batido Masa Waffles/Crepes",
    "itemType": "subreceta",
    "category": "jarabes_bases",
    "unit": "L",
    "stock": 7.88,
    "minStock": 2,
    "costPerUnit": 7.2,
    "isTaxAffected": true,
    "batches": [
      {
        "id": "batch-masa-1",
        "date": "2026-11-10T07:00:00Z",
        "initialQty": 8,
        "remainingQty": 7.88,
        "unitCost": 7.2
      }
    ],
    "isIntermediateRecipe": true
  },
  {
    "id": "ing-base-helado-vainilla",
    "code": "LAC-004",
    "name": "Base Helado Suave Vainilla",
    "itemType": "insumo",
    "category": "lacteos",
    "unit": "L",
    "stock": 11.6,
    "minStock": 3,
    "costPerUnit": 11.5,
    "isTaxAffected": true,
    "batches": [
      {
        "id": "batch-helado-1",
        "date": "2026-11-08T10:00:00Z",
        "initialQty": 12,
        "remainingQty": 11.6,
        "unitCost": 11.5
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-crema-chantilly",
    "code": "LAC-005",
    "name": "Crema Chantilly Batida para Topping",
    "itemType": "insumo",
    "category": "lacteos",
    "unit": "L",
    "stock": 4.925,
    "minStock": 1,
    "costPerUnit": 18,
    "isTaxAffected": true,
    "batches": [
      {
        "id": "batch-chantilly-1",
        "date": "2026-11-09T08:00:00Z",
        "initialQty": 5,
        "remainingQty": 4.925,
        "unitCost": 18
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-cafe-espresso",
    "code": "ABA-003",
    "name": "Concentrado Café Espresso Chanchamayo",
    "itemType": "insumo",
    "category": "abarrotes",
    "unit": "L",
    "stock": 4.46,
    "minStock": 1,
    "costPerUnit": 22,
    "isTaxAffected": true,
    "batches": [
      {
        "id": "batch-cafe-1",
        "date": "2026-11-09T08:00:00Z",
        "initialQty": 4.5,
        "remainingQty": 4.46,
        "unitCost": 22
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-algarrobina",
    "code": "ABA-004",
    "name": "Algarrobina Pura de Piura",
    "itemType": "insumo",
    "category": "abarrotes",
    "unit": "L",
    "stock": 3,
    "minStock": 1,
    "costPerUnit": 26,
    "isTaxAffected": true,
    "batches": [
      {
        "id": "batch-algarro-1",
        "date": "2026-11-08T09:00:00Z",
        "initialQty": 3,
        "remainingQty": 3,
        "unitCost": 26
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-base-moka",
    "code": "ABA-005",
    "name": "Salsa Concentrada Moka Chocolate",
    "itemType": "insumo",
    "category": "abarrotes",
    "unit": "kg",
    "stock": 3.965,
    "minStock": 1,
    "costPerUnit": 22,
    "isTaxAffected": true,
    "batches": [
      {
        "id": "batch-moka-1",
        "date": "2026-11-08T10:00:00Z",
        "initialQty": 4,
        "remainingQty": 3.965,
        "unitCost": 22
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-aceite-vegetal",
    "code": "ABA-006",
    "name": "Aceite Vegetal para Cocina",
    "itemType": "insumo",
    "category": "abarrotes",
    "unit": "L",
    "stock": 12,
    "minStock": 3,
    "costPerUnit": 8.5,
    "isTaxAffected": true,
    "batches": [
      {
        "id": "batch-aceite-1",
        "date": "2026-11-08T10:00:00Z",
        "initialQty": 12,
        "remainingQty": 12,
        "unitCost": 8.5
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-harina-trigo",
    "code": "ABA-007",
    "name": "Harina de Trigo Especial Panadería",
    "itemType": "insumo",
    "category": "abarrotes",
    "unit": "kg",
    "stock": 20,
    "minStock": 5,
    "costPerUnit": 3.8,
    "isTaxAffected": true,
    "batches": [
      {
        "id": "batch-harina-1",
        "date": "2026-11-08T10:00:00Z",
        "initialQty": 20,
        "remainingQty": 20,
        "unitCost": 3.8
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-huevo-fresco",
    "code": "PRO-003",
    "name": "Huevos Frescos de Granja Seleccionados",
    "itemType": "insumo",
    "category": "proteinas",
    "unit": "und",
    "stock": 90,
    "minStock": 20,
    "costPerUnit": 0.6,
    "isTaxAffected": true,
    "batches": [
      {
        "id": "batch-huevo-1",
        "date": "2026-11-10T06:00:00Z",
        "initialQty": 90,
        "remainingQty": 90,
        "unitCost": 0.6
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-fudge-chocolate",
    "code": "SUB-003",
    "name": "Fudge Artesanal Juguería",
    "itemType": "subreceta",
    "category": "jarabes_bases",
    "unit": "kg",
    "stock": 3.92,
    "minStock": 1,
    "costPerUnit": 15,
    "isTaxAffected": true,
    "batches": [
      {
        "id": "batch-fudge-1",
        "date": "2026-11-08T12:00:00Z",
        "initialQty": 4,
        "remainingQty": 3.92,
        "unitCost": 15
      }
    ],
    "isIntermediateRecipe": true
  },
  {
    "id": "ing-mayonesa",
    "code": "SUB-004",
    "name": "Mayonesa Casera Juguería",
    "itemType": "subreceta",
    "category": "jarabes_bases",
    "unit": "kg",
    "stock": 3,
    "minStock": 0.8,
    "costPerUnit": 12,
    "isTaxAffected": true,
    "batches": [
      {
        "id": "batch-mayo-1",
        "date": "2026-11-10T06:30:00Z",
        "initialQty": 3,
        "remainingQty": 3,
        "unitCost": 12
      }
    ],
    "isIntermediateRecipe": true
  },
  {
    "id": "ing-vaso-domo-16oz",
    "code": "DSC-001",
    "name": "Vaso Pet 16oz + Tapa Domo",
    "itemType": "descartable",
    "category": "",
    "unit": "und",
    "stock": 280,
    "minStock": 50,
    "costPerUnit": 0.38,
    "isTaxAffected": true,
    "batches": [
      {
        "id": "batch-vaso-1",
        "date": "2026-11-07T11:00:00Z",
        "initialQty": 280,
        "remainingQty": 280,
        "unitCost": 0.38
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-sorbete-kraft",
    "code": "DSC-002",
    "name": "Sorbete Papel Kraft Biodegradable",
    "itemType": "descartable",
    "category": "",
    "unit": "und",
    "stock": 450,
    "minStock": 100,
    "costPerUnit": 0.05,
    "isTaxAffected": true,
    "batches": [
      {
        "id": "batch-sorbete-1",
        "date": "2026-11-07T11:00:00Z",
        "initialQty": 450,
        "remainingQty": 450,
        "unitCost": 0.05
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-caja-biodegradable",
    "code": "DSC-003",
    "name": "Caja Kraft Sándwich/Waffle",
    "itemType": "descartable",
    "category": "",
    "unit": "und",
    "stock": 130,
    "minStock": 30,
    "costPerUnit": 0.45,
    "isTaxAffected": true,
    "batches": [
      {
        "id": "batch-caja-1",
        "date": "2026-11-07T11:00:00Z",
        "initialQty": 130,
        "remainingQty": 130,
        "unitCost": 0.45
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-taper-sobras",
    "code": "DSC-004",
    "name": "Táper Descartable para Sobras (Llevar)",
    "itemType": "descartable",
    "category": "",
    "unit": "und",
    "stock": 90,
    "minStock": 25,
    "costPerUnit": 0.6,
    "isTaxAffected": true,
    "batches": [
      {
        "id": "batch-taper-1",
        "date": "2026-11-07T11:00:00Z",
        "initialQty": 90,
        "remainingQty": 90,
        "unitCost": 0.6
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-bolsa-kraft",
    "code": "DSC-005",
    "name": "Bolsa Delivery Asa Troquelada",
    "itemType": "descartable",
    "category": "",
    "unit": "und",
    "stock": 180,
    "minStock": 40,
    "costPerUnit": 0.3,
    "isTaxAffected": true,
    "batches": [
      {
        "id": "batch-bolsa-1",
        "date": "2026-11-07T11:00:00Z",
        "initialQty": 180,
        "remainingQty": 180,
        "unitCost": 0.3
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-lejia-5",
    "code": "CON-001",
    "name": "Lejía Desinfectante 5% Cloro Activo",
    "itemType": "consumible",
    "category": "",
    "unit": "L",
    "stock": 15,
    "minStock": 4,
    "costPerUnit": 3.2,
    "isTaxAffected": true,
    "batches": [
      {
        "id": "batch-lejia-1",
        "date": "2026-11-06T14:00:00Z",
        "initialQty": 15,
        "remainingQty": 15,
        "unitCost": 3.2
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-detergente-industrial",
    "code": "CON-002",
    "name": "Detergente Enzimático Lavavajillas",
    "itemType": "consumible",
    "category": "",
    "unit": "kg",
    "stock": 10,
    "minStock": 3,
    "costPerUnit": 8.5,
    "isTaxAffected": true,
    "batches": [
      {
        "id": "batch-detergente-1",
        "date": "2026-11-06T14:00:00Z",
        "initialQty": 10,
        "remainingQty": 10,
        "unitCost": 8.5
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-papel-toalla",
    "code": "CON-003",
    "name": "Bobina Papel Toalla Industrial 200m",
    "itemType": "consumible",
    "category": "",
    "unit": "und",
    "stock": 8,
    "minStock": 2,
    "costPerUnit": 14.5,
    "isTaxAffected": true,
    "batches": [
      {
        "id": "batch-papel-1",
        "date": "2026-11-06T14:00:00Z",
        "initialQty": 8,
        "remainingQty": 8,
        "unitCost": 14.5
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-bolsa-basura",
    "code": "CON-004",
    "name": "Bolsas Negras Residuos 50L (Paquete x50)",
    "itemType": "consumible",
    "category": "",
    "unit": "und",
    "stock": 12,
    "minStock": 3,
    "costPerUnit": 9.8,
    "isTaxAffected": true,
    "batches": [
      {
        "id": "batch-bolsa-res-1",
        "date": "2026-11-06T14:00:00Z",
        "initialQty": 12,
        "remainingQty": 12,
        "unitCost": 9.8
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "sub-mix-surtido-fresco",
    "code": "SUB-010",
    "name": "Pack Mix Surtido Fresco (270g)",
    "itemType": "subreceta",
    "category": "jarabes_bases",
    "unit": "und",
    "stock": 35,
    "minStock": 10,
    "costPerUnit": 1.65,
    "isTaxAffected": false,
    "batches": [
      {
        "id": "batch-sub-mix-surtido-fresco-init",
        "date": "2026-11-16T02:14:54.364Z",
        "initialQty": 35,
        "remainingQty": 35,
        "unitCost": 1.65
      }
    ],
    "isIntermediateRecipe": true
  },
  {
    "id": "sub-porcion-mango-fresco",
    "code": "SUB-011",
    "name": "Pack Mango Limpio Porcionado (180g)",
    "itemType": "subreceta",
    "category": "jarabes_bases",
    "unit": "und",
    "stock": 20,
    "minStock": 5,
    "costPerUnit": 2.2,
    "isTaxAffected": false,
    "batches": [
      {
        "id": "batch-sub-porcion-mango-fresco-init",
        "date": "2026-11-16T02:14:54.367Z",
        "initialQty": 20,
        "remainingQty": 20,
        "unitCost": 2.2
      }
    ],
    "isIntermediateRecipe": true
  },
  {
    "id": "sub-porcion-fresa-limpia",
    "code": "SUB-012",
    "name": "Pack Fresa Limpia Porcionada (150g)",
    "itemType": "subreceta",
    "category": "jarabes_bases",
    "unit": "und",
    "stock": 25,
    "minStock": 8,
    "costPerUnit": 1.35,
    "isTaxAffected": false,
    "batches": [
      {
        "id": "batch-sub-porcion-fresa-limpia-init",
        "date": "2026-11-16T02:14:54.367Z",
        "initialQty": 25,
        "remainingQty": 25,
        "unitCost": 1.35
      }
    ],
    "isIntermediateRecipe": true
  },
  {
    "id": "sub-porcion-papaya-limpia",
    "code": "SUB-013",
    "name": "Pack Papaya Limpia Porcionada (200g)",
    "itemType": "subreceta",
    "category": "jarabes_bases",
    "unit": "und",
    "stock": 20,
    "minStock": 5,
    "costPerUnit": 0.95,
    "isTaxAffected": false,
    "batches": [
      {
        "id": "batch-sub-porcion-papaya-limpia-init",
        "date": "2026-11-16T02:14:54.367Z",
        "initialQty": 20,
        "remainingQty": 20,
        "unitCost": 0.95
      }
    ],
    "isIntermediateRecipe": true
  },
  {
    "id": "sub-porcion-pina-limpia",
    "code": "SUB-014",
    "name": "Pack Piña Limpia Porcionada (180g)",
    "itemType": "subreceta",
    "category": "jarabes_bases",
    "unit": "und",
    "stock": 20,
    "minStock": 5,
    "costPerUnit": 1.05,
    "isTaxAffected": false,
    "batches": [
      {
        "id": "batch-sub-porcion-pina-limpia-init",
        "date": "2026-11-16T02:14:54.367Z",
        "initialQty": 20,
        "remainingQty": 20,
        "unitCost": 1.05
      }
    ],
    "isIntermediateRecipe": true
  },
  {
    "id": "ing-crema-no-lactea",
    "code": "INS-030",
    "name": "Crema No Láctea en Polvo",
    "itemType": "insumo",
    "category": "abarrotes",
    "unit": "kg",
    "stock": 10,
    "minStock": 2,
    "costPerUnit": 18,
    "isTaxAffected": true,
    "batches": [
      {
        "id": "batch-ing-crema-no-lactea-init",
        "date": "2026-11-16T02:26:49.880Z",
        "initialQty": 10,
        "remainingQty": 10,
        "unitCost": 18
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-leche-polvo",
    "code": "INS-031",
    "name": "Leche Entera en Polvo",
    "itemType": "insumo",
    "category": "lacteos",
    "unit": "kg",
    "stock": 12,
    "minStock": 3,
    "costPerUnit": 22,
    "isTaxAffected": true,
    "batches": [
      {
        "id": "batch-ing-leche-polvo-init",
        "date": "2026-11-16T02:26:49.884Z",
        "initialQty": 12,
        "remainingQty": 12,
        "unitCost": 22
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-azucar-glass",
    "code": "INS-032",
    "name": "Azúcar Glass (Impalpable)",
    "itemType": "insumo",
    "category": "abarrotes",
    "unit": "kg",
    "stock": 10,
    "minStock": 2.5,
    "costPerUnit": 6.5,
    "isTaxAffected": true,
    "batches": [
      {
        "id": "batch-ing-azucar-glass-init",
        "date": "2026-11-16T02:26:49.884Z",
        "initialQty": 10,
        "remainingQty": 10,
        "unitCost": 6.5
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-cmc",
    "code": "INS-033",
    "name": "CMC Grado Alimenticio (Estabilizante)",
    "itemType": "insumo",
    "category": "abarrotes",
    "unit": "kg",
    "stock": 2,
    "minStock": 0.5,
    "costPerUnit": 45,
    "isTaxAffected": true,
    "batches": [
      {
        "id": "batch-ing-cmc-init",
        "date": "2026-11-16T02:26:49.884Z",
        "initialQty": 2,
        "remainingQty": 2,
        "unitCost": 45
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "sub-base-neutra",
    "code": "SUB-020",
    "name": "Base Neutra (Frappés Lácteos)",
    "itemType": "subreceta",
    "category": "jarabes_bases",
    "unit": "kg",
    "stock": 5,
    "minStock": 1,
    "costPerUnit": 17.65,
    "isTaxAffected": false,
    "batches": [
      {
        "id": "batch-sub-base-neutra-init",
        "date": "2026-11-16T02:26:49.884Z",
        "initialQty": 5,
        "remainingQty": 5,
        "unitCost": 17.65
      }
    ],
    "isIntermediateRecipe": true
  },
  {
    "id": "sub-base-cristal",
    "code": "SUB-021",
    "name": "Base Cristal (Frappés al Agua)",
    "itemType": "subreceta",
    "category": "jarabes_bases",
    "unit": "kg",
    "stock": 8,
    "minStock": 1.5,
    "costPerUnit": 4.7,
    "isTaxAffected": false,
    "batches": [
      {
        "id": "batch-sub-base-cristal-init",
        "date": "2026-11-16T02:26:49.884Z",
        "initialQty": 8,
        "remainingQty": 8,
        "unitCost": 4.7
      }
    ],
    "isIntermediateRecipe": true
  },
  {
    "id": "ing-pulpa-maracuya",
    "code": "CONG-001",
    "name": "Pulpa de Maracuyá Congelada",
    "itemType": "insumo",
    "category": "congelados",
    "unit": "kg",
    "stock": 8,
    "minStock": 2,
    "costPerUnit": 9,
    "isTaxAffected": false,
    "batches": [
      {
        "id": "batch-ing-pulpa-maracuya-init",
        "date": "2026-11-16T02:26:49.884Z",
        "initialQty": 8,
        "remainingQty": 8,
        "unitCost": 9
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-fresa-congelada",
    "code": "CONG-002",
    "name": "Fresa Congelada",
    "itemType": "insumo",
    "category": "congelados",
    "unit": "kg",
    "stock": 12,
    "minStock": 3,
    "costPerUnit": 7.5,
    "isTaxAffected": false,
    "batches": [
      {
        "id": "batch-ing-fresa-congelada-init",
        "date": "2026-11-16T02:26:49.884Z",
        "initialQty": 12,
        "remainingQty": 12,
        "unitCost": 7.5
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-mango-congelado",
    "code": "CONG-003",
    "name": "Mango en Cubos Congelado",
    "itemType": "insumo",
    "category": "congelados",
    "unit": "kg",
    "stock": 10,
    "minStock": 2.5,
    "costPerUnit": 8.5,
    "isTaxAffected": false,
    "batches": [
      {
        "id": "batch-ing-mango-congelado-init",
        "date": "2026-11-16T02:26:49.884Z",
        "initialQty": 10,
        "remainingQty": 10,
        "unitCost": 8.5
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-pina-congelada",
    "code": "CONG-004",
    "name": "Piña Congelada en Trozos",
    "itemType": "insumo",
    "category": "congelados",
    "unit": "kg",
    "stock": 10,
    "minStock": 2.5,
    "costPerUnit": 4,
    "isTaxAffected": false,
    "batches": [
      {
        "id": "batch-ing-pina-congelada-init",
        "date": "2026-11-16T02:26:49.885Z",
        "initialQty": 10,
        "remainingQty": 10,
        "unitCost": 4
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-platano-congelado",
    "code": "CONG-005",
    "name": "Plátano de Seda Congelado",
    "itemType": "insumo",
    "category": "congelados",
    "unit": "kg",
    "stock": 8,
    "minStock": 2,
    "costPerUnit": 3,
    "isTaxAffected": false,
    "batches": [
      {
        "id": "batch-ing-platano-congelado-init",
        "date": "2026-11-16T02:26:49.885Z",
        "initialQty": 8,
        "remainingQty": 8,
        "unitCost": 3
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-arandanos-congelados",
    "code": "CONG-006",
    "name": "Arándanos Congelados",
    "itemType": "insumo",
    "category": "congelados",
    "unit": "kg",
    "stock": 5,
    "minStock": 1.5,
    "costPerUnit": 16,
    "isTaxAffected": false,
    "batches": [
      {
        "id": "batch-ing-arandanos-congelados-init",
        "date": "2026-11-16T02:26:49.885Z",
        "initialQty": 5,
        "remainingQty": 5,
        "unitCost": 16
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-pulpa-lucuma",
    "code": "CONG-007",
    "name": "Pulpa de Lúcuma Congelada",
    "itemType": "insumo",
    "category": "congelados",
    "unit": "kg",
    "stock": 6,
    "minStock": 1.5,
    "costPerUnit": 14,
    "isTaxAffected": false,
    "batches": [
      {
        "id": "batch-ing-pulpa-lucuma-init",
        "date": "2026-11-16T02:26:49.885Z",
        "initialQty": 6,
        "remainingQty": 6,
        "unitCost": 14
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-hielo",
    "code": "CONG-008",
    "name": "Hielo Industrial en Cubos",
    "itemType": "insumo",
    "category": "congelados",
    "unit": "kg",
    "stock": 40,
    "minStock": 15,
    "costPerUnit": 0.6,
    "isTaxAffected": true,
    "batches": [
      {
        "id": "batch-ing-hielo-init",
        "date": "2026-11-16T02:26:49.886Z",
        "initialQty": 40,
        "remainingQty": 40,
        "unitCost": 0.6
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-agua-bidon",
    "code": "AB-010",
    "name": "Agua Purificada de Bidón",
    "itemType": "insumo",
    "category": "abarrotes",
    "unit": "L",
    "stock": 60,
    "minStock": 20,
    "costPerUnit": 0.3,
    "isTaxAffected": true,
    "batches": [
      {
        "id": "batch-ing-agua-bidon-init",
        "date": "2026-11-16T02:26:49.886Z",
        "initialQty": 60,
        "remainingQty": 60,
        "unitCost": 0.3
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-limon-sutil",
    "code": "FRU-010",
    "name": "Limón Sutil Fresco (para jugo)",
    "itemType": "insumo",
    "category": "frutas",
    "unit": "kg",
    "stock": 8,
    "minStock": 2,
    "costPerUnit": 4.5,
    "isTaxAffected": false,
    "batches": [
      {
        "id": "batch-ing-limon-sutil-init",
        "date": "2026-11-16T02:26:49.886Z",
        "initialQty": 8,
        "remainingQty": 8,
        "unitCost": 4.5
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-sirope-blue-curacao",
    "code": "SIR-001",
    "name": "Sirope Blue Curaçao",
    "itemType": "insumo",
    "category": "jarabes_bases",
    "unit": "L",
    "stock": 3,
    "minStock": 1,
    "costPerUnit": 32,
    "isTaxAffected": true,
    "batches": [
      {
        "id": "batch-ing-sirope-blue-curacao-init",
        "date": "2026-11-16T02:26:49.886Z",
        "initialQty": 3,
        "remainingQty": 3,
        "unitCost": 32
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-hierbabuena",
    "code": "FRU-011",
    "name": "Hojas de Hierbabuena / Menta",
    "itemType": "insumo",
    "category": "frutas",
    "unit": "kg",
    "stock": 2,
    "minStock": 0.5,
    "costPerUnit": 12,
    "isTaxAffected": false,
    "batches": [
      {
        "id": "batch-ing-hierbabuena-init",
        "date": "2026-11-16T02:26:49.886Z",
        "initialQty": 2,
        "remainingQty": 2,
        "unitCost": 12
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-jarabe-goma",
    "code": "SIR-002",
    "name": "Jarabe de Goma Simple",
    "itemType": "insumo",
    "category": "jarabes_bases",
    "unit": "L",
    "stock": 8,
    "minStock": 2,
    "costPerUnit": 6.5,
    "isTaxAffected": true,
    "batches": [
      {
        "id": "batch-ing-jarabe-goma-init",
        "date": "2026-11-16T02:26:49.887Z",
        "initialQty": 8,
        "remainingQty": 8,
        "unitCost": 6.5
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-concentrado-cafe",
    "code": "SIR-003",
    "name": "Concentrado de Café (Cold Brew)",
    "itemType": "insumo",
    "category": "jarabes_bases",
    "unit": "L",
    "stock": 5,
    "minStock": 1.5,
    "costPerUnit": 12,
    "isTaxAffected": false,
    "batches": [
      {
        "id": "batch-ing-concentrado-cafe-init",
        "date": "2026-11-16T02:26:49.887Z",
        "initialQty": 5,
        "remainingQty": 5,
        "unitCost": 12
      }
    ],
    "isIntermediateRecipe": true
  },
  {
    "id": "ing-leche-evaporada",
    "code": "LAC-005",
    "name": "Leche Evaporada Entera",
    "itemType": "insumo",
    "category": "lacteos",
    "unit": "L",
    "stock": 15,
    "minStock": 4,
    "costPerUnit": 6.8,
    "isTaxAffected": true,
    "batches": [
      {
        "id": "batch-ing-leche-evaporada-init",
        "date": "2026-11-16T02:26:49.887Z",
        "initialQty": 15,
        "remainingQty": 15,
        "unitCost": 6.8
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-manjar-blanco",
    "code": "PAS-002",
    "name": "Manjar Blanco Pastelero",
    "itemType": "insumo",
    "category": "pasteleria",
    "unit": "kg",
    "stock": 5,
    "minStock": 1.5,
    "costPerUnit": 14,
    "isTaxAffected": true,
    "batches": [
      {
        "id": "batch-ing-manjar-blanco-init",
        "date": "2026-11-16T02:26:49.887Z",
        "initialQty": 5,
        "remainingQty": 5,
        "unitCost": 14
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-galleta-oreo",
    "code": "AB-015",
    "name": "Galleta Oreo (Paquete x4)",
    "itemType": "insumo",
    "category": "abarrotes",
    "unit": "kg",
    "stock": 4,
    "minStock": 1,
    "costPerUnit": 25,
    "isTaxAffected": true,
    "batches": [
      {
        "id": "batch-ing-galleta-oreo-init",
        "date": "2026-11-16T02:26:49.887Z",
        "initialQty": 4,
        "remainingQty": 4,
        "unitCost": 25
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-yogurt-natural",
    "code": "LAC-006",
    "name": "Yogurt Natural / Bebible",
    "itemType": "insumo",
    "category": "lacteos",
    "unit": "L",
    "stock": 12,
    "minStock": 3,
    "costPerUnit": 6.5,
    "isTaxAffected": true,
    "batches": [
      {
        "id": "batch-ing-yogurt-natural-init",
        "date": "2026-11-16T02:26:49.887Z",
        "initialQty": 12,
        "remainingQty": 12,
        "unitCost": 6.5
      }
    ],
    "isIntermediateRecipe": false
  },
  {
    "id": "ing-leche-coco",
    "code": "LAC-007",
    "name": "Leche de Coco Gastronómica",
    "itemType": "insumo",
    "category": "lacteos",
    "unit": "L",
    "stock": 4,
    "minStock": 1,
    "costPerUnit": 9.5,
    "isTaxAffected": true,
    "batches": [
      {
        "id": "batch-ing-leche-coco-init",
        "date": "2026-11-16T02:26:49.887Z",
        "initialQty": 4,
        "remainingQty": 4,
        "unitCost": 9.5
      }
    ],
    "isIntermediateRecipe": false
  }
];
