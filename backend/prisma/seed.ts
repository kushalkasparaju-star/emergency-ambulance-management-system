import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: 'admin@ems.com' },
    update: {},
    create: {
      email: 'admin@ems.com',
      password: bcrypt.hashSync('password123', 10),
      role: 'ADMIN',
    },
  });

  const miamiCenter = { lat: 25.7617, lng: -80.1918 };

  for (const a of [
      { unitCode: 'ENG-01', lat: miamiCenter.lat + 0.01, lng: miamiCenter.lng, driverName: 'John Smith', hospitalId: 1 },
      { unitCode: 'ENG-02', lat: miamiCenter.lat - 0.01, lng: miamiCenter.lng + 0.01, driverName: 'Jane Doe', hospitalId: 2 },
      { unitCode: 'MED-03', lat: miamiCenter.lat, lng: miamiCenter.lng - 0.02, driverName: 'Bob Vance', hospitalId: 1 },
  ]) {
    await prisma.ambulance.upsert({ where: { unitCode: a.unitCode }, update: {}, create: a });
  }

  await prisma.incident.createMany({
    data: [
      { type: 'CAR_CRASH', lat: miamiCenter.lat + 0.02, lng: miamiCenter.lng + 0.02, severity: 'CRITICAL', status: 'OPEN' },
      { type: 'HEART_ATTACK', lat: miamiCenter.lat - 0.02, lng: miamiCenter.lng - 0.01, severity: 'CRITICAL', status: 'OPEN' },
      { type: 'FIRE', lat: miamiCenter.lat + 0.015, lng: miamiCenter.lng - 0.015, severity: 'MEDIUM', status: 'OPEN' }
    ]
  });

  await prisma.trafficSignal.createMany({
    data: [
      { intersectionName: '1st & Main', lat: miamiCenter.lat + 0.005, lng: miamiCenter.lng + 0.005, status: 'RED' },
      { intersectionName: '2nd & Broad', lat: miamiCenter.lat - 0.005, lng: miamiCenter.lng - 0.005, status: 'GREEN' },
      { intersectionName: '3rd & Oak', lat: miamiCenter.lat + 0.01, lng: miamiCenter.lng - 0.01, status: 'RED' },
      { intersectionName: '4th & Pine', lat: miamiCenter.lat - 0.01, lng: miamiCenter.lng + 0.01, status: 'GREEN' },
    ]
  });

  console.log('Database seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
