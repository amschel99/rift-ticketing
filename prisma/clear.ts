import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Clearing all database data...\n');

  try {
    // Delete in correct order (respecting foreign key constraints)
    console.log('Deleting invoices...');
    const invoiceCount = await prisma.invoice.deleteMany({});
    console.log(`✅ Cleared ${invoiceCount.count} invoices`);

    console.log('Deleting RSVPs...');
    const rsvpCount = await prisma.rSVP.deleteMany({});
    console.log(`✅ Cleared ${rsvpCount.count} RSVPs`);

    console.log('Deleting events...');
    const eventCount = await prisma.event.deleteMany({});
    console.log(`✅ Cleared ${eventCount.count} events`);

    console.log('Deleting users...');
    const userCount = await prisma.user.deleteMany({});
    console.log(`✅ Cleared ${userCount.count} users`);

    console.log('\n🎉 Database cleared successfully! All tables are now empty.');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Clear failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
