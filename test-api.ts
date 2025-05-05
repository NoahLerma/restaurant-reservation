import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testApi() {
  try {
    // Test getting all tables
    const tables = await prisma.table.findMany();
    console.log('All tables:', tables);

    // Test getting available tables for a specific date
    const date = new Date('2024-05-01T17:00:00.000Z');
    const reservations = await prisma.reservation.findMany({
      where: {
        date: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lte: new Date(date.setHours(23, 59, 59, 999)),
        },
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
      include: {
        table: true,
      },
    });

    console.log('Reservations for date:', reservations);

    const reservedTableIds = new Set(
      reservations.map(reservation => reservation.table.id)
    );

    const availableTables = tables.filter(table => 
      !reservedTableIds.has(table.id)
    );

    console.log('Available tables:', availableTables);
  } catch (error) {
    console.error('Error testing API:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testApi(); 