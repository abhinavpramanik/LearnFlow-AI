const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const Ticket = require('../models/Ticket');
const Campaign = require('../models/Campaign');
const Journey = require('../models/Journey');
const AiRun = require('../models/AiRun');
const Enrollment = require('../models/Enrollment');
const { successResponse } = require('../utils/response');

router.use(authenticate);

// Journey analytics
router.get('/journey', authorize('Sales Manager', 'Admin', 'Marketing Manager'), async (req, res, next) => {
  try {
    const stats = await Journey.aggregate([
      { $group: { _id: '$stage', count: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } } } },
      { $sort: { count: -1 } },
    ]);
    const enrollmentStats = await Enrollment.aggregate([
      { $group: { _id: '$completionStatus', count: { $sum: 1 } } },
    ]);
    successResponse(res, 'Journey report', { stageBreakdown: stats, enrollmentStatus: enrollmentStats });
  } catch (err) { next(err); }
});

// Campaign analytics
router.get('/campaign', authorize('Sales Manager', 'Admin', 'Marketing Manager'), async (req, res, next) => {
  try {
    const stats = await Campaign.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const byChannel = await Campaign.aggregate([
      { $unwind: '$channels' },
      { $group: { _id: '$channels', count: { $sum: 1 } } },
    ]);
    successResponse(res, 'Campaign report', { statusBreakdown: stats, channelBreakdown: byChannel });
  } catch (err) { next(err); }
});

// Ticket analytics
router.get('/tickets', authorize('Sales Manager', 'Admin', 'Service Agent'), async (req, res, next) => {
  try {
    const stats = await Ticket.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const byPriority = await Ticket.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);
    successResponse(res, 'Ticket report', { statusBreakdown: stats, priorityBreakdown: byPriority });
  } catch (err) { next(err); }
});

// AI usage analytics
router.get('/ai', authorize('Admin'), async (req, res, next) => {
  try {
    const stats = await AiRun.aggregate([
      { $group: { _id: '$feature', count: { $sum: 1 }, avgConfidence: { $avg: '$confidence' }, avgLatency: { $avg: '$latencyMs' } } },
    ]);
    const byStatus = await AiRun.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    successResponse(res, 'AI usage report', { featureBreakdown: stats, statusBreakdown: byStatus });
  } catch (err) { next(err); }
});

module.exports = router;
