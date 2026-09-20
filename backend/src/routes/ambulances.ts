import { Router } from 'express';
import { prisma } from '../db';
import { getIO } from '../sockets/socketManager';

const router = Router();

router.get('/', async (req, res) => {
  const ambulances = await prisma.ambulance.findMany();
  res.json(ambulances);
});

router.post('/', async (req, res) => {
  const data = req.body;
  const ambulance = await prisma.ambulance.create({ data });
  res.json(ambulance);
});

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const ambulance = await prisma.ambulance.update({
    where: { id: Number(id) },
    data
  });
  const io = getIO();
  if (io) {
    if (data.status) io.emit('ambulance:status_update', ambulance);
    if (data.lat && data.lng) io.emit('ambulance:location_update', { unitId: ambulance.unitCode, lat: data.lat, lng: data.lng });
  }
  res.json(ambulance);
});

export default router;
