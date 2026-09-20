import { Router } from 'express';
import { prisma } from '../db';
import { getIO } from '../sockets/socketManager';

const router = Router();

router.get('/', async (req, res) => {
  const { severity } = req.query;
  const where = severity ? { severity: String(severity) } : {};
  const alerts = await prisma.alert.findMany({ where, orderBy: { createdAt: 'desc' } });
  res.json(alerts);
});

router.post('/', async (req, res) => {
  const data = req.body;
  const alert = await prisma.alert.create({ data });
  const io = getIO();
  if (io) io.emit('alert:new', alert);
  res.json(alert);
});

export default router;
