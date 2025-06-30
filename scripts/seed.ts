import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.show.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.googleToken.deleteMany();

  // Create venues (must match src/data/venues.ts)
  await prisma.venue.createMany({
    data: [
      { id: 'venue-1', name: 'Carson Creek Ranch', city: 'Austin' },
      { id: 'venue-2', name: 'The Concourse Project', city: 'Austin' },
      { id: 'venue-3', name: 'Kingdom', city: 'Austin' },
      { id: 'venue-4', name: 'Vulcan Gas Company', city: 'Austin' },
      { id: 'venue-5', name: 'Deep Ellum Art Co.', city: 'Dallas' },
      { id: 'venue-6', name: 'The Green Elephant', city: 'Dallas' },
      { id: 'venue-7', name: 'Silo Dallas', city: 'Dallas' },
      { id: 'venue-8', name: '9PM Music Venue', city: 'Houston' },
      { id: 'venue-9', name: 'LowBrau', city: 'Sacramento' },
      { id: 'venue-10', name: 'The Marc', city: 'San Marcos' },
    ],
  });

  // Create sample shows
  await prisma.show.createMany({
    data: [
      {
        id: uuidv4(),
        artist: 'deadmau5',
        venueId: 'venue-2', // The Concourse Project
        city: 'Austin',
        date: new Date('2025-07-15T21:00:00-05:00'),
        status: 'CONFIRMED',
        description: 'Austin warehouse vibes with deadmau5',
      },
      {
        id: uuidv4(),
        artist: 'RL Grime',
        venueId: 'venue-5', // Deep Ellum Art Co.
        city: 'Dallas',
        date: new Date('2025-07-20T22:00:00-05:00'),
        status: 'PENDING',
        description: 'Trap night in Dallas with RL Grime',
      },
    ],
  });

  // Optionally seed a dummy Google token for testing
  await prisma.googleToken.create({
    data: {
      id: uuidv4(),
      email: 'princekevinprince@gmail.com',
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      scope: 'https://www.googleapis.com/auth/calendar',
      tokenType: 'Bearer',
      expiryDate: BigInt(Date.now() + 3600 * 1000), // 1 hour from now
    },
  });

  console.log('✅ Database seeded');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
