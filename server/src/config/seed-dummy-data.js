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
const Message = require('../models/Message');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

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
      Message.deleteMany({}),
      Campaign.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
      Journey.deleteMany({}),
      AiRun.deleteMany({}),
      Course.deleteMany({}),
      Enrollment.deleteMany({})
    ]);

    // 3. Generate Rich Tickets & Messages
    const ticketScenarios = [
      {
        title: "Platform extremely slow and courses not loading",
        priority: "High", status: "In Progress",
        messages: [
          { sender: 'customer', text: "Hi, I have been trying to complete my mandatory compliance training all morning but the video player keeps buffering and then failing with an 'Error 504' code. This is very frustrating as the deadline is tomorrow. Can someone please look into this?" },
          { sender: 'agent', text: "Hello! We apologize for the inconvenience. Our engineering team is currently investigating some latency issues in the US-East region. Could you please let me know which specific course you are trying to access?" },
          { sender: 'customer', text: "It is the 'Cybersecurity Basics 2026' module. It's still not working for me. I've cleared my cache and tried three different browsers." }
        ]
      },
      {
        title: "Request for a refund on duplicate subscription charge",
        priority: "Critical", status: "Open",
        messages: [
          { sender: 'customer', text: "I just checked my credit card statement and I was billed twice this month for the enterprise Pro plan. The charge is $499 each. Please refund one of these immediately and fix my account billing!" }
        ]
      },
      {
        title: "I can't find my certification after completing the final exam",
        priority: "Medium", status: "Open",
        messages: [
          { sender: 'customer', text: "Good afternoon. I just finished the Leadership Advanced course and scored 95% on the final exam. However, the system says I haven't completed it and my certificate is nowhere to be found. I need this to show my manager for my performance review." },
          { sender: 'agent', text: "Hi there. Let me check your account. It looks like the final module on 'Ethics' is marked as 99% complete, which is preventing the certificate generation. Could you try re-opening that specific module and letting the video play to the very end?" },
          { sender: 'customer', text: "I did that, and it still says 99%. There is no more video left to watch." },
          { sender: 'agent', text: "I see. I will escalate this to our L2 support team so they can manually override the completion status for you. Please allow 24 hours." },
          { sender: 'customer', text: "Thank you, I appreciate the quick response. Please let me know once it's fixed." }
        ]
      },
      {
        title: "How do I invite team members to my organization?",
        priority: "Low", status: "Closed",
        messages: [
          { sender: 'customer', text: "Hi, I recently upgraded to the Team tier, but I cannot figure out how to add my 5 team members. Is there a dashboard for this? I want to assign them the 'Sales 101' learning path." },
          { sender: 'agent', text: "Hi! Yes, you can add them by going to 'Settings' > 'Team Management' > 'Invite Users'. Let me know if you need further help!" },
          { sender: 'customer', text: "Found it. Thanks!" }
        ]
      },
      {
        title: "Terrible experience with the mobile app",
        priority: "High", status: "Open",
        messages: [
          { sender: 'customer', text: "Your new iOS app update is absolute garbage! It crashes every time I try to download a course for offline viewing. I'm paying for this service and I expect it to work on my commute. Fix this now or I'm cancelling!" }
        ]
      }
    ];

    const creator = customer || users[0];
    const creatorProfile = getProfile(creator._id);
    const assignedAgent = agent || users[0];

    for (let scenario of ticketScenarios) {
      const ticket = await Ticket.create({
        title: scenario.title,
        description: scenario.messages[0].text,
        status: scenario.status,
        priority: scenario.priority,
        category: 'Support',
        createdBy: creator._id,
        profileId: creatorProfile ? creatorProfile._id : null,
        assignedTo: assignedAgent._id,
      });

      for (let msg of scenario.messages) {
        await Message.create({
          ticketId: ticket._id,
          sender: msg.sender === 'customer' ? creator._id : assignedAgent._id,
          message: msg.text
        });
      }
    }
    console.log('[Dummy Seed] Inserted Rich Tickets and Conversation Threads');

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
        channels: [['Email'], ['Push', 'In-App'], ['SMS', 'Email'], ['In-App']][i % 4],
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

    // 9. Generate Courses & Enrollments
    const coursePromises = [];
    const courseTitles = ['Leadership 101', 'Cybersecurity Basics', 'Sales Mastery', 'Advanced React', 'AI Ethics'];
    for (let i = 0; i < courseTitles.length; i++) {
      coursePromises.push(Course.create({
        title: courseTitles[i],
        description: `Learn all about ${courseTitles[i]}`,
        status: 'Active'
      }));
    }
    const createdCourses = await Promise.all(coursePromises);
    console.log(`[Dummy Seed] Inserted ${createdCourses.length} Courses`);

    const enrollmentPromises = [];
    const targetProfile = getProfile(customer._id);
    if (targetProfile) {
      for (let i = 0; i < createdCourses.length; i++) {
        enrollmentPromises.push(Enrollment.create({
          profileId: targetProfile._id,
          courseId: createdCourses[i]._id,
          progress: [0, 50, 100, 25, 90][i % 5],
          completionStatus: ['Not Started', 'In Progress', 'Completed', 'Failed', 'In Progress'][i % 5]
        }));
      }
      await Promise.all(enrollmentPromises);
      console.log(`[Dummy Seed] Inserted ${createdCourses.length} Enrollments`);
    }

    console.log('\n[Dummy Seed] ✅ Successfully populated all buckets with dummy data!');
    process.exit(0);

  } catch (error) {
    console.error('[Dummy Seed] Error generating data:', error);
    process.exit(1);
  }
};

seedDummyData();
