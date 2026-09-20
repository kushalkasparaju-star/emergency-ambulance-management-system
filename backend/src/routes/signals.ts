import { Router } from 'express';
import { prisma } from '../db';
import { getIO } from '../sockets/socketManager';

const router = Router();

router.get('/', async (req, res) => {
  const signals = await prisma.trafficSignal.findMany();
  res.json(signals);
});

router.post('/:id/priority', async (req, res) => {
  const { id } = req.params;
  const { priorityMode, triggeredBy } = req.body;
  const signal = await prisma.trafficSignal.update({
    where: { id: Number(id) },
    data: { priorityMode, status: priorityMode === 'PREEMPTION' ? 'GREEN' : 'AMBER' }
  });
  const io = getIO();
  if (io) io.emit('signal:status_change', { signalId: signal.id, status: signal.status, priorityMode, triggeredBy });
  res.json(signal);
});

export default router;
