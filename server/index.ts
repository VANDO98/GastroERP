import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './db/database.js';
import { seedDatabaseIfEmpty } from './db/seed.js';
import { createApiRouter } from './routes/api.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Habilitar CORS para peticiones desde tablets o PCs en la misma red local
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '15mb' }));

// Configurar WebSockets para tiempo real (KDS de cocina y Mesas)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Inicializar y sembrar BD si está vacía
initDatabase();
seedDatabaseIfEmpty();

// Montar rutas de la API REST
app.use('/api', createApiRouter(io));

// Manejador de eventos WebSocket
io.on('connection', (socket) => {
  console.log(`[Socket.io] Dispositivo conectado: ${socket.id}`);

  // Evento cuando se despacha un pedido desde cocina KDS
  socket.on('kds:item_dispatched', (data) => {
    io.emit('kds:item_dispatched', data);
  });

  // Notificación de nuevo pedido
  socket.on('order:new', (order) => {
    io.emit('order:created', order);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Dispositivo desconectado: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 Servidor ERP Local Activo en Puerto: ${PORT}`);
  console.log(`📡 Sincronización en tiempo real vía WebSockets: OK`);
  console.log(`💾 Base de datos SQLite inicializada: data/erp_database.sqlite`);
  console.log(`=======================================================`);
});
