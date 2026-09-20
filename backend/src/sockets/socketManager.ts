import { Server, Socket } from 'socket.io';
import { prisma } from '../db';

let ioInstance: Server | null = null;

export const initSocketManager = (io: Server) => {
  ioInstance = io;
  
  io.on('connection', (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);
    
    socket.on('ambulance:dispatch', async (data) => {
      const { unitId, incidentId, route } = data;
      const unitCode = unitId;
      await prisma.ambulance.update({
        where: { unitCode },
        data: { status: 'DISPATCHED' }
      });
      
      const amb = await prisma.ambulance.findUnique({where: {unitCode}});
      
      await prisma.incident.update({
        where: { id: incidentId },
        data: { status: 'ASSIGNED', assignedAmbulanceId: amb?.id || null }
      });
      // Save full route info locally if passed
      if (route && amb) {
         try {
           await prisma.route.create({
             data: {
               ambulanceId: amb.id,
               incidentId: incidentId,
               waypoints: JSON.stringify(route.waypoints),
               distanceKm: route.distanceKm,
               etaMin: route.etaMin
             }
           });
         } catch(e) {
           console.error('Failed saving route on dispatch', e);
         }
      }
      
      io.emit('ambulance:status_update', { unitId, status: 'DISPATCHED' });
      io.emit('incident:update', { incidentId, status: 'ASSIGNED', assignedUnit: unitId });
      
      const log = await prisma.systemLog.create({
        data: { level: 'INFO', message: `Dispatched unit ${unitId} to incident ${incidentId}`, unitId, module: 'Dispatch' }
      });
      io.emit('log:new', log);
    });
    
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

export const getIO = () => ioInstance;
