import { Router } from 'express';
import { prisma } from '../db';
import axios from 'axios';

const router = Router();

router.get('/:incidentId', async (req, res) => {
  const { incidentId } = req.params;
  const route = await prisma.route.findFirst({
    where: { incidentId: Number(incidentId) },
    orderBy: { id: 'desc' }
  });
  if (route) {
    res.json({ ...route, waypoints: JSON.parse(route.waypoints) });
  } else {
    res.json(null);
  }
});

router.post('/optimize', async (req, res) => {
  const { from, to, avoidTraffic } = req.body;
  try {
    const url = `http://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
    const response = await axios.get(url);
    const data = response.data.routes[0];
    
    const waypoints = data.geometry.coordinates.map((coord: number[]) => ({ lat: coord[1], lng: coord[0] }));
    const distanceKm = data.distance / 1000;
    const etaMin = data.duration / 60;
    
    res.json({
      waypoints,
      distanceKm,
      etaMin
    });
  } catch (error) {
    console.error('OSRM API Error:', error);
    res.status(500).json({ error: 'Routing failed' });
  }
});

export default router;
