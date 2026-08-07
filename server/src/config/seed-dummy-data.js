require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const connectDB = require('./db');

// Models
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const Campaign = require('../models/Campaign');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const Journey = require('../models/Journey');
const AiRun = require('../models/AiRun');
const Profile = require('../models/Profile');

const seedDummyData = async () => {
  try {
    await connectDB();
    console.log('[Dummy Seed] Connected to MongoDB');

    // 1. Fetch Users and Profiles to associate data
    const users = await User.find({});
    if (users.length === 0) {
      console.error('[Dummy Seed] No users found. Please run "npm run seed" first.');
      process.exit(1);
    }
    
    const profiles = await Profile.find({});
    const getProfile = (userId) => profiles.find(p => p.userId.toString() === userId.toString());

    const admin = users.find(u => u.email === 'admin@learnflow.ai');
    const customer = users.find(u => u.email === 'customer@learnflow.ai');
    const agent = users.find(u => u.email === 'agent@learnflow.ai');
    const marketer = users.find(u => u.email === 'marketing@learnflow.ai');

    // 2. Clear old dummy data
    console.log('[Dummy Seed] Clearing old dummy data...');
    await Promise.all([
      Ticket.deleteMany({}),
      Campaign.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
      Journey.deleteMany({}),
      AiRun.deleteMany({})
    ]);

    // 3. Generate Tickets
    const ticketPromises = [];
    const ticketTitles = ['Cannot access course', 'Payment failed', 'Need refund', 'Course material missing', 'Account locked'];
    for (let i = 0; i < 15; i++) {
      const creator = customer || users[0];
      const creatorProfile = getProfile(creator._id);
      
      ticketPromises.push(Ticket.create({
        title: ticketTitles[i % ticketTitles.length] + ' - ' + i,
        description: 'Detailed description for ticket ' + i,
        status: i % 3 === 0 ? 'Closed' : (i % 2 === 0 ? 'Open' : 'In Progress'),
        priority: i % 4 === 0 ? 'High' : 'Medium',
        category: 'Support',
        createdBy: creator._id,
        profileId: creatorProfile ? creatorProfile._id : null,
        assignedTo: agent ? agent._id : null,
      }));
    }
    await Promise.all(ticketPromises);
    console.log('[Dummy Seed] Inserted 15 Tickets');

    // 4. Generate Segments & Campaigns
    const Segment = require('../models/Segment');
    await Segment.deleteMany({});
    const dummySegment = await Segment.create({
      name: 'All Users (Dummy)',
      description: 'Dummy segment containing all users',
      criteria: { role: 'Customer' },
      createdBy: marketer ? marketer._id : admin._id
    });
    
    const campaignPromises = [];
    for (let i = 0; i < 8; i++) {
      campaignPromises.push(Campaign.create({
        name: `Q${(i%4)+1} Marketing Push ${2023 + Math.floor(i/4)}`,
        status: i % 2 === 0 ? 'Running' : 'Draft',
        type: 'Email',
        segmentId: dummySegment._id,
        startDate: new Date(Date.now() - i * 86400000 * 10),
        endDate: new Date(Date.now() + i * 86400000 * 5),
        metrics: {
          sent: 1000 + (i * 150),
          opened: 400 + (i * 50),
          clicked: 100 + (i * 20)
        },
        createdBy: marketer ? marketer._id : admin._id
      }));
    }
    await Promise.all(campaignPromises);
    console.log('[Dummy Seed] Inserted 8 Campaigns');

    // 5. Generate Notifications
    const notifPromises = [];
    for (let i = 0; i < 20; i++) {
      notifPromises.push(Notification.create({
        userId: admin._id,
        title: `System Alert ${i}`,
        body: `This is a dummy system notification number ${i}`,
        severity: i % 2 === 0 ? 'System' : 'Warning',
        read: i % 3 === 0,
        createdAt: new Date(Date.now() - i * 3600000)
      }));
    }
    await Promise.all(notifPromises);
    console.log('[Dummy Seed] Inserted 20 Notifications for Admin');

    // 6. Generate Audit Logs
    const auditPromises = [];
    for (let i = 0; i < 30; i++) {
      auditPromises.push(AuditLog.create({
        actor: users[i % users.length]._id,
        action: ['LOGIN', 'UPDATE_PROFILE', 'CREATE_TICKET', 'DELETE_CAMPAIGN'][i % 4],
        entity: ['User', 'Profile', 'Ticket', 'Campaign'][i % 4],
        newValue: { dummy: true, iteration: i },
        ipAddress: '192.168.1.' + i,
        createdAt: new Date(Date.now() - i * 7200000)
      }));
    }
    await Promise.all(auditPromises);
    console.log('[Dummy Seed] Inserted 30 Audit Logs');

    // 7. Generate Journey Events
    const journeyPromises = [];
    for (let i = 0; i < 12; i++) {
      const creator = customer || users[0];
      const creatorProfile = getProfile(creator._id);
      
      journeyPromises.push(Journey.create({
        userId: creator._id,
        profileId: creatorProfile ? creatorProfile._id : null,
        title: `Customer Onboarding Journey ${i}`,
        stage: ['Assessment', 'Learning Path', 'Course', 'Practice', 'Coaching', 'Certification', 'Workforce Planning'][i % 7],
        status: i % 3 === 0 ? 'Completed' : 'Active',
        milestones: [
          { name: 'Signed Up', completed: true, date: new Date() },
          { name: 'First Login', completed: i % 2 === 0, date: new Date() }
        ],
        lastActivity: new Date()
      }));
    }
    await Promise.all(journeyPromises);
    console.log('[Dummy Seed] Inserted 12 Journey events');

    // 8. Generate AI Runs
    const aiPromises = [];
    for (let i = 0; i < 10; i++) {
      aiPromises.push(AiRun.create({
        createdBy: admin._id,
        feature: ['intent', 'sentiment', 'summarize', 'recommend', 'draft'][i % 5],
        status: i % 5 === 0 ? 'failure' : 'success',
        inputSnapshot: { sample: 'dummy input data ' + i },
        output: { result: 'dummy output result ' + i },
        confidence: 0.7 + (i * 0.02),
        latencyMs: 150 + (i * 45)
      }));
    }
    await Promise.all(aiPromises);
    console.log('[Dummy Seed] Inserted 10 AI Runs');

    console.log('\n[Dummy Seed] ✅ Successfully populated all buckets with dummy data!');
    process.exit(0);

  } catch (error) {
    console.error('[Dummy Seed] Error generating data:', error);
    process.exit(1);
  }
};

seedDummyData();
