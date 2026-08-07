const express = require('express');
const router = express.Router();

// Module routes
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const profileRoutes = require('./profile.routes');
const journeyRoutes = require('./journey.routes');
const courseRoutes = require('./course.routes');
const ticketRoutes = require('./ticket.routes');
const campaignRoutes = require('./campaign.routes');
const segmentRoutes = require('./segment.routes');
const notificationRoutes = require('./notification.routes');
const reportRoutes = require('./report.routes');
const aiRoutes = require('./ai.routes');
const auditRoutes = require('./audit.routes');
const settingsRoutes = require('./settings.routes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/profiles', profileRoutes);
router.use('/journeys', journeyRoutes);
router.use('/courses', courseRoutes);
router.use('/tickets', ticketRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/segments', segmentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reports', reportRoutes);
router.use('/ai', aiRoutes);
router.use('/audit', auditRoutes);
router.use('/settings', settingsRoutes);

module.exports = router;
