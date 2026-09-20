import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/auth';
import ambulanceRoutes from './routes/ambulances';
import incidentRoutes from './routes/incidents';
import routeRoutes from './routes/routes';
import signalRoutes from './routes/signals';
import alertRoutes from './routes/alerts';
import logRoutes from './routes/logs';

import { initSocketManager } from './sockets/socketManager';
import { startSimulation } from './services/simulation';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});


app.use(cors());
app.use(express.json());

// Init Sockets
initSocketManager(io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ambulances', ambulanceRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/signals', signalRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/logs', logRoutes);

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Start simulation
  startSimulation();
});
