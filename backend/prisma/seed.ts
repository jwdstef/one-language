/**
 * Database Seed Script
 * Creates initial admin user for the system
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123456', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@illa-helper.com' },
    update: {},
    create: {
      email: 'admin@illa-helper.com',
      passwordHash: adminPassword,
      name: 'Admin',
      role: 'admin',
      status: 'active',
      subscriptionTier: 'premium',
    },
  });

  // Create user streak for admin
  await prisma.userStreak.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      currentStreak: 0,
      longestStreak: 0,
    },
  });

  console.log('✅ Admin user created:');
  console.log('   Email: admin@illa-helper.com');
  console.log('   Password: admin123456');

  // Create a demo user
  const userPassword = await bcrypt.hash('user123456', 12);
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@illa-helper.com' },
    update: {},
    create: {
      email: 'demo@illa-helper.com',
      passwordHash: userPassword,
      name: 'Demo User',
      role: 'user',
      status: 'active',
      subscriptionTier: 'free',
    },
  });

  // Create user streak for demo user
  await prisma.userStreak.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      currentStreak: 0,
      longestStreak: 0,
    },
  });

  console.log('✅ Demo user created:');
  console.log('   Email: demo@illa-helper.com');
  console.log('   Password: user123456');

  console.log('\n🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
