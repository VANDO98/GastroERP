import { io } from 'socket.io-client';

// Detecta automáticamente la IP del host desde el navegador del dispositivo (PC, Tablet o Móvil)
const serverHost = window.location.hostname || 'localhost';
export const API_URL = `http://${serverHost}:3001/api`;
export const SOCKET_URL = `http://${serverHost}:3001`;

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
});

export async function fetchBootstrap() {
  const res = await fetch(`${API_URL}/bootstrap`);
  if (!res.ok) throw new Error('Error al cargar datos del servidor');
  return res.json();
}

export async function saveCompanyConfig(config: any) {
  return fetch(`${API_URL}/company-config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
}

export async function saveMenuConfig(menu: any) {
  return fetch(`${API_URL}/menu-config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(menu)
  });
}

export async function saveIngredients(ingredients: any[]) {
  return fetch(`${API_URL}/ingredients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ingredients)
  });
}

export async function saveTables(tables: any[]) {
  return fetch(`${API_URL}/tables`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-socket-id': socket.id || ''
    },
    body: JSON.stringify(tables)
  });
}

export async function saveOrder(order: any) {
  return fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order)
  });
}

export async function saveInvoice(invoice: any) {
  return fetch(`${API_URL}/invoices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invoice)
  });
}

export async function saveSuppliers(suppliers: any[]) {
  return fetch(`${API_URL}/suppliers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(suppliers)
  });
}

export async function saveWaste(waste: any) {
  return fetch(`${API_URL}/wastes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(waste)
  });
}

export async function saveProductionOrder(op: any) {
  return fetch(`${API_URL}/production-orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(op)
  });
}

