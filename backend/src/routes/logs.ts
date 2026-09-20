import { Router } from 'express';
import { prisma } from '../db';

const router = Router();

router.get('/', async (req, res) => {
  const { level, page = 1 } = req.query;
  const take = 20;
  const skip = (Number(page) - 1) * take;
  const where = level ? { level: String(level) } : {};
  
  const logs = await prisma.systemLog.findMany({
    where,
    take,
    skip,
    orderBy: { createdAt: 'desc' }
  });
  const total = await prisma.systemLog.count({ where });
  
  res.json({ logs, total, pages: Math.ceil(total / take) });
});

export default router;
