import app from './app.js';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';

async function main(): Promise<void> {
  try {
    // Test database connection
    await prisma.$connect();
    console.warn('✅ Database connected');

    // Start server
    app.listen(env.PORT, () => {
      console.warn(`🚀 Server running on port ${env.PORT}`);
      console.warn(`📍 Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.warn('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.warn('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

main();
