import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.invoice.deleteMany();
  await prisma.rSVP.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleared existing data');

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.create({
    data: {
      externalId: 'john_doe',
      email: 'john@example.com',
      name: 'John Doe',
      password: hashedPassword,
      role: 'USER',
      bearerToken: 'token_user1',
      riftUserId: 'rift_user1',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      externalId: 'jane_organizer',
      email: 'organizer@example.com',
      name: 'Jane Organizer',
      password: hashedPassword,
      role: 'ORGANIZER',
      bearerToken: 'token_organizer1',
      riftUserId: 'rift_organizer1',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      externalId: 'crypto_labs',
      email: 'crypto@example.com',
      name: 'Crypto Labs',
      password: hashedPassword,
      role: 'ORGANIZER',
      bearerToken: 'token_crypto_labs',
      riftUserId: 'rift_crypto_labs',
    },
  });

  console.log('✅ Created users');

  // Create events
  const event1 = await prisma.event.create({
    data: {
      title: 'Web3 Developer Conference',
      description: 'Learn about the latest in blockchain and Web3 technologies from industry experts.',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      location: 'San Francisco, CA',
      price: 100,
      capacity: 500,
      category: 'TECH',
      isOnline: false,
      organizerId: user3.id,
    },
  });

  const event2 = await prisma.event.create({
    data: {
      title: 'Jazz Night Live',
      description: 'An evening of smooth jazz with local and international artists.',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      location: 'Blue Note Jazz Club, NYC',
      price: 50,
      capacity: 200,
      category: 'ENTERTAINMENT',
      isOnline: false,
      organizerId: user2.id,
    },
  });

  const event3 = await prisma.event.create({
    data: {
      title: 'React Advanced Patterns Workshop',
      description: 'Master advanced React patterns with hands-on exercises and real-world examples.',
      date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      location: 'Online',
      price: 75,
      capacity: 100,
      category: 'EDUCATION',
      isOnline: true,
      organizerId: user2.id,
    },
  });

  const event4 = await prisma.event.create({
    data: {
      title: 'Summer Music Festival',
      description: 'Three days of live music featuring top artists across multiple genres.',
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      location: 'Central Park, NYC',
      price: 150,
      capacity: 10000,
      category: 'ENTERTAINMENT',
      isOnline: false,
      organizerId: user2.id,
    },
  });

  const event5 = await prisma.event.create({
    data: {
      title: 'Startup Networking Brunch',
      description: 'Connect with founders, investors, and entrepreneurs in the startup ecosystem.',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      location: 'WeWork, San Francisco',
      price: 25,
      capacity: 150,
      category: 'BUSINESS',
      isOnline: false,
      organizerId: user2.id,
    },
  });

  const event6 = await prisma.event.create({
    data: {
      title: 'Digital Art Exhibition',
      description: 'Explore cutting-edge digital art installations and NFT collections.',
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      location: 'Modern Art Museum, LA',
      price: 35,
      capacity: 300,
      category: 'ARTS',
      isOnline: false,
      organizerId: user2.id,
    },
  });

  console.log('✅ Created events');

  // Create some RSVPs
  await prisma.rSVP.create({
    data: {
      userId: user1.id,
      eventId: event1.id,
      status: 'CONFIRMED',
    },
  });

  await prisma.rSVP.create({
    data: {
      userId: user1.id,
      eventId: event2.id,
      status: 'PENDING',
    },
  });

  console.log('✅ Created RSVPs');

  console.log('🎉 Database seed completed!');
  console.log('\n📝 Test credentials:');
  console.log('  User: john@example.com / password123');
  console.log('  Organizer: organizer@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
