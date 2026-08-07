require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Role = require('../models/Role');
const Profile = require('../models/Profile');
const Setting = require('../models/Setting');
const connectDB = require('./db');
const { ROLES } = require('../constants');

const PERMISSIONS_MAP = {
  [ROLES.ADMIN]: ['users:create','users:update','users:delete','users:read','tickets:create','tickets:update','tickets:read','campaigns:create','campaigns:update','campaigns:delete','campaigns:read','reports:view','audit:read','settings:update','ai:use'],
  [ROLES.SERVICE_AGENT]: ['tickets:create','tickets:update','tickets:read','profiles:read','ai:use'],
  [ROLES.MARKETING_MANAGER]: ['campaigns:create','campaigns:update','campaigns:delete','campaigns:read','segments:create','segments:update','segments:delete','reports:view','ai:use'],
  [ROLES.SALES_MANAGER]: ['reports:view','profiles:read','campaigns:read'],
  [ROLES.CUSTOMER]: ['tickets:create','tickets:read','profiles:read'],
};

const DEFAULT_SETTINGS = [
  { key: 'ai.churnThreshold', value: 0.7, description: 'Churn score threshold for alerts', category: 'ai' },
  { key: 'ai.confidenceThreshold', value: 0.8, description: 'Minimum confidence for auto-recommendations', category: 'ai' },
  { key: 'notification.maxPerDay', value: 10, description: 'Max notifications per user per day', category: 'notifications' },
  { key: 'campaign.defaultFrequency', value: 'Weekly', description: 'Default campaign frequency', category: 'campaigns' },
];

const seed = async () => {
  await connectDB();
  console.log('[Seed] Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Role.deleteMany({}),
    Profile.deleteMany({}),
    Setting.deleteMany({}),
  ]);
  console.log('[Seed] Cleared existing data');

  // Create roles
  const roleDocuments = await Promise.all(
    Object.entries(ROLES).map(([, name]) =>
      Role.create({ name, description: `${name} role`, permissions: PERMISSIONS_MAP[name] || [] })
    )
  );
  console.log('[Seed] Roles created:', roleDocuments.map(r => r.name).join(', '));

  const roleMap = {};
  roleDocuments.forEach(r => { roleMap[r.name] = r._id; });

  // Create seed users
  const seedUsers = [
    { firstName: 'Admin', lastName: 'User', email: 'admin@learnflow.ai', password: 'Admin@1234', role: ROLES.ADMIN },
    { firstName: 'Sarah', lastName: 'Agent', email: 'agent@learnflow.ai', password: 'Agent@1234', role: ROLES.SERVICE_AGENT },
    { firstName: 'Mark', lastName: 'Marketing', email: 'marketing@learnflow.ai', password: 'Mark@1234', role: ROLES.MARKETING_MANAGER },
    { firstName: 'Sam', lastName: 'Sales', email: 'sales@learnflow.ai', password: 'Sales@1234', role: ROLES.SALES_MANAGER },
    { firstName: 'Alex', lastName: 'Learner', email: 'customer@learnflow.ai', password: 'Customer@1234', role: ROLES.CUSTOMER },
  ];

  for (const userData of seedUsers) {
    const user = await User.create({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      passwordHash: userData.password, // Will be hashed by pre-save hook
      role: roleMap[userData.role],
    });
    await Profile.create({ userId: user._id, department: 'General', designation: userData.role });
    console.log(`[Seed] Created user: ${user.email} (${userData.role})`);
  }

  // Create default settings
  await Promise.all(DEFAULT_SETTINGS.map(s => Setting.create(s)));
  console.log('[Seed] Default settings created');

  console.log('\n[Seed] ✅ Database seeded successfully!');
  console.log('\n[Seed] Test Credentials:');
  seedUsers.forEach(u => console.log(`  ${u.role}: ${u.email} / ${u.password}`));

  process.exit(0);
};

seed().catch(err => {
  console.error('[Seed] Error:', err.message);
  process.exit(1);
});
