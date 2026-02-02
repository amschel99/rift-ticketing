import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Parse DATABASE_URL and add connection pool parameters if not present
function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL || '';
  
  // If URL already has query parameters, append to them; otherwise add them
  if (url.includes('?')) {
    // Check if pool parameters already exist
    if (!url.includes('connection_limit') && !url.includes('pool_timeout')) {
      return `${url}&connection_limit=10&pool_timeout=20&connect_timeout=10`;
    }
    return url;
  } else {
    return `${url}?connection_limit=10&pool_timeout=20&connect_timeout=10`;
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Handle connection errors gracefully
prisma.$on('error' as never, (e: any) => {
  console.error('Prisma error:', e);
});

// Ensure connections are properly closed on process termination
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}
