function haversine(coord1: {lat: number, lng: number}, coord2: {lat: number, lng: number}) {
  const R = 6371e3; 
  const phi1 = coord1.lat * Math.PI/180;
  const phi2 = coord2.lat * Math.PI/180;
  const deltaPhi = (coord2.lat-coord1.lat) * Math.PI/180;
  const deltaLambda = (coord2.lng-coord1.lng) * Math.PI/180;
  const a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
import { getIO } from '../sockets/socketManager';
import { prisma } from '../db';

export const startSimulation = () => {
  setInterval(async () => {
    const io = getIO();
    if (!io) return;
    
    const activeRoutes = await prisma.route.findMany({
      include: {
        ambulance: true,
        incident: true
      }
    });

    for (const route of activeRoutes) {
      if (route.ambulance.status !== 'DISPATCHED' && route.ambulance.status !== 'EN_ROUTE') continue;
      
      const waypoints = route.waypoints ? JSON.parse(route.waypoints) as any[] : [];
      if (!waypoints || waypoints.length === 0) continue;
      
      const target = waypoints[Math.floor(waypoints.length / 2)]; 
      
      const newLat = route.ambulance.lat + (target.lat - route.ambulance.lat) * 0.1;
      const newLng = route.ambulance.lng + (target.lng - route.ambulance.lng) * 0.1;
      
      await prisma.ambulance.update({
        where: { id: route.ambulanceId },
        data: { lat: newLat, lng: newLng, status: 'EN_ROUTE' }
      });

      const signals = await prisma.trafficSignal.findMany();
      for (const sig of signals) {
        const dist = haversine({ lat: newLat, lng: newLng }, { lat: sig.lat, lng: sig.lng });
        if (dist < 250 && sig.status === 'RED') {
          await prisma.trafficSignal.update({
            where: { id: sig.id },
            data: { priorityMode: dist < 100 ? 'PREEMPTION' : 'PRIORITY', status: 'GREEN' }
          });
          io.emit('signal:status_change', { signalId: sig.id, status: 'GREEN', priorityMode: dist < 100 ? 'PREEMPTION' : 'PRIORITY', triggeredBy: route.ambulance.unitCode });
        }
      }

      io.emit('ambulance:location_update', {
        unitId: route.ambulance.unitCode,
        lat: newLat,
        lng: newLng,
        speed: 60,
        heading: 90
      });
    }
    
    if (Math.random() < 0.1) {
      const alert = await prisma.alert.create({
         data: {
           type: 'TRAFFIC_DELAY',
           message: 'Unexpected traffic buildup.',
           severity: 'WARNING',
         }
      });
      io.emit('alert:new', alert);
    }
  }, 2000);
};
