/**
 * Database Seed Script
 * Creates initial admin user and subscription plans for the system
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Free plan features configuration
const FREE_PLAN_FEATURES = {
  translation: {
    dailyLimit: 100,
    maxRatio: 30,
    languages: ['zh', 'en', 'ja', 'ko', 'es'],
    levels: ['a1', 'b1', 'b2'],
    styles: ['default', 'subtle', 'bold'],
    positionControl: false,
    bracketControl: false,
    lengthControl: false,
  },
  pronunciation: {
    webSpeechTTS: true,
    youdaoTTS: false,
    accentSwitch: false,
    aiDefinition: false,
    nestedTooltip: false,
    hotkey: false,
  },
  vocabulary: {
    maxWords: 100,
    lists: false,
    tags: false,
    masteryLevel: false,
    cloudSync: false,
  },
  review: {
    dailyLimit: 20,
    smartRecommend: false,
    reviewPlan: false,
  },
  website: {
    maxRules: 10,
    whitelist: false,
  },
  features: {
    floatingBall: true,
    hotkeys: false,
    contextMenu: false,
    multiApi: false,
    customCSS: false,
  },
  gamification: {
    achievements: false,
    goals: false,
    reminders: false,
  },
  statistics: {
    basic: true,
    advanced: false,
    trends: false,
  },
  export: {
    json: true,
    csv: false,
    anki: false,
    custom: false,
  },
};

// Premium plan features configuration
const PREMIUM_PLAN_FEATURES = {
  translation: {
    dailyLimit: 0, // unlimited
    maxRatio: 100,
    languages: ['zh', 'en', 'ja', 'ko', 'es', 'fr', 'de', 'ru', 'it', 'pt', 'nl', 'sv', 'no', 'da', 'fi', 'pl', 'cs', 'tr', 'el', 'ar', 'th', 'vi'],
    levels: ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'],
    styles: ['default', 'subtle', 'bold', 'italic', 'underlined', 'highlighted', 'learning', 'custom'],
    positionControl: true,
    bracketControl: true,
    lengthControl: true,
  },
  pronunciation: {
    webSpeechTTS: true,
    youdaoTTS: true,
    accentSwitch: true,
    aiDefinition: true,
    nestedTooltip: true,
    hotkey: true,
  },
  vocabulary: {
    maxWords: 0, // unlimited
    lists: true,
    tags: true,
    masteryLevel: true,
    cloudSync: true,
  },
  review: {
    dailyLimit: 200,
    smartRecommend: true,
    reviewPlan: true,
  },
  website: {
    maxRules: 0, // unlimited
    whitelist: true,
  },
  features: {
    floatingBall: true,
    hotkeys: true,
    contextMenu: true,
    multiApi: true,
    customCSS: true,
  },
  gamification: {
    achievements: true,
    goals: true,
    reminders: true,
  },
  statistics: {
    basic: true,
    advanced: true,
    trends: true,
  },
  export: {
    json: true,
    csv: true,
    anki: true,
    custom: true,
  },
};

async function seedSubscriptionPlans() {
  console.log('📋 Seeding subscription plans...');

  // Create free plan
  const freePlan = await prisma.subscriptionPlan.upsert({
    where: { name: 'free' },
    update: {
      displayName: '免费版',
      description: '基础功能，适合入门学习者',
      price: 0,
      duration: 0, // lifetime
      features: FREE_PLAN_FEATURES,
      isActive: true,
      sortOrder: 1,
    },
    create: {
      name: 'free',
      displayName: '免费版',
      description: '基础功能，适合入门学习者',
      price: 0,
      duration: 0, // lifetime
      features: FREE_PLAN_FEATURES,
      isActive: true,
      sortOrder: 1,
    },
  });

  console.log('   ✅ Free plan created/updated');

  // Create premium plan
  const premiumPlan = await prisma.subscriptionPlan.upsert({
    where: { name: 'premium' },
    update: {
      displayName: '高级版',
      description: '完整功能，无限制使用',
      price: 99.00,
      duration: 365, // 1 year
      features: PREMIUM_PLAN_FEATURES,
      isActive: true,
      sortOrder: 2,
    },
    create: {
      name: 'premium',
      displayName: '高级版',
      description: '完整功能，无限制使用',
      price: 99.00,
      duration: 365, // 1 year
      features: PREMIUM_PLAN_FEATURES,
      isActive: true,
      sortOrder: 2,
    },
  });

  console.log('   ✅ Premium plan created/updated');

  return { freePlan, premiumPlan };
}

async function main() {
  console.log('🌱 Seeding database...');

  // Seed subscription plans first
  const { freePlan, premiumPlan } = await seedSubscriptionPlans();

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123456', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@one-language.com' },
    update: {},
    create: {
      email: 'admin@one-language.com',
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

  // Create premium subscription for admin
  const existingAdminSub = await prisma.subscription.findFirst({
    where: { userId: admin.id, status: 'active' },
  });
  if (!existingAdminSub) {
    await prisma.subscription.create({
      data: {
        userId: admin.id,
        planId: premiumPlan.id,
        status: 'active',
        startDate: new Date(),
        endDate: null, // lifetime for admin
      },
    });
    console.log('   ✅ Admin subscription created');
  }

  console.log('👤 Admin user created:');
  console.log('   Email: admin@one-language.com');
  console.log('   Password: admin123456');

  // Create a demo user
  const userPassword = await bcrypt.hash('user123456', 12);
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@one-language.com' },
    update: {},
    create: {
      email: 'demo@one-language.com',
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

  // Create free subscription for demo user
  const existingUserSub = await prisma.subscription.findFirst({
    where: { userId: user.id, status: 'active' },
  });
  if (!existingUserSub) {
    await prisma.subscription.create({
      data: {
        userId: user.id,
        planId: freePlan.id,
        status: 'active',
        startDate: new Date(),
        endDate: null, // lifetime for free plan
      },
    });
    console.log('   ✅ Demo user subscription created');
  }

  console.log('👤 Demo user created:');
  console.log('   Email: demo@one-language.com');
  console.log('   Password: user123456');

  console.log('\n🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('�?Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
