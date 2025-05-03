import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../app/lib/auth';

const prisma = new PrismaClient();

async function main() {
  // Delete existing data
  await prisma.reservation.deleteMany();
  await prisma.creditCard.deleteMany();
  await prisma.highTrafficDate.deleteMany();
  await prisma.table.deleteMany();
  await prisma.user.deleteMany();
  await prisma.address.deleteMany();

  // Create tables with different capacities
  const tables = [
    { tableNumber: 1, capacity: 2 },
    { tableNumber: 2, capacity: 2 },
    { tableNumber: 3, capacity: 4 },
    { tableNumber: 4, capacity: 4 },
    { tableNumber: 5, capacity: 6 },
    { tableNumber: 6, capacity: 6 },
    { tableNumber: 7, capacity: 8 },
    { tableNumber: 8, capacity: 8 },
  ];

  for (const table of tables) {
    await prisma.table.upsert({
      where: { tableNumber: table.tableNumber },
      update: {},
      create: {
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        isAvailable: true,
      },
    });
  }

  // Create some high traffic dates
  const highTrafficDates = await Promise.all([
    prisma.highTrafficDate.create({
      data: {
        date: new Date('2024-07-04'),
        description: 'Independence Day',
      },
    }),
    prisma.highTrafficDate.create({
      data: {
        date: new Date('2024-12-31'),
        description: 'New Year\'s Eve',
      },
    }),
  ]);

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@fibonaccisflame.com',
      password: await hashPassword('admin'),
      name: 'Admin',
      isAdmin: true,
      phone: '1234567890',
    },
  });

  console.log('Created admin user:', adminUser);
  console.log('Database has been seeded. 🌱');
  console.log('Created tables:', tables);
  console.log('Created high traffic dates:', highTrafficDates);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 