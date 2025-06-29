import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing shows
  await prisma.show.deleteMany();

  // Create sample shows
  await prisma.show.createMany({
    data: [
      {
        artist: 'Anderson .Paak',
        venue: 'The Echo',
        city: 'Los Angeles',
        date: new Date('2025-07-01T20:00:00-07:00'),
        status: 'PENDING',
        description: 'Kickoff party with Anderson .Paak!',
      },
      {
        artist: 'Tame Impala',
        venue: 'Brooklyn Mirage',
        city: 'New York',
        date: new Date('2025-07-05T21:00:00-04:00'),
        status: 'HOLD',
        description: 'Dreamy Brooklyn vibes',
      },
      {
        artist: 'Flying Lotus',
        venue: '1015 Folsom',
        city: 'San Francisco',
        date: new Date('2025-07-10T22:00:00-07:00'),
        status: 'CONFIRMED',
        description: 'AV show by FlyLo',
      },
    ],
  });

  await prisma.googleToken.upsert({
  where: { email: 'princekevinprince@gmail.com' },
  update: {},
  create: {
    email: 'princekevinprince@gmail.com,
    accessToken: 'your-access-token-here',
    refreshToken: 'your-refresh-token-here',
    scope: 'https://www.googleapis.com/auth/calendar',
    tokenType: 'Bearer',
    expiryDate: BigInt(Date.now() + 3600 * 1000), // 1 hour from now
  },
});

  console.log('✅ Seeded sample shows');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
