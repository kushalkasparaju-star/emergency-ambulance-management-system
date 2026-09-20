import { Router } from 'express';
import { prisma } from '../db';
import { getIO } from '../sockets/socketManager';

const router = Router();

router.get('/', async (req, res) => {
  const incidents = await prisma.incident.findMany();
  res.json(incidents);
});

router.post('/', async (req, res) => {
  const data = req.body;
  const incident = await prisma.incident.create({ data });
  const io = getIO();
  if (io) io.emit('incident:update', { incidentId: incident.id, status: incident.status });
  res.json(incident);
});

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const incident = await prisma.incident.update({
    where: { id: Number(id) },
    data
  });
  const io = getIO();
  if (io) io.emit('incident:update', { incidentId: incident.id, status: incident.status, assignedUnit: incident.assignedAmbulanceId });
  res.json(incident);
});

export default router;
