const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');
const { successResponse, paginatedResponse } = require('../utils/response');

router.use(authenticate);

// GET /api/v1/notifications
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const filter = { userId: req.user._id };
    if (req.query.read !== undefined) filter.read = req.query.read === 'true';
    if (req.query.severity) filter.severity = req.query.severity;
    const [notifications, total] = await Promise.all([
      Notification.find(filter).skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }),
      Notification.countDocuments(filter),
    ]);
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, read: false });
    paginatedResponse(res, 'Notifications retrieved', { notifications, unreadCount }, { page, limit, total, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

// PATCH /api/v1/notifications/read — mark all as read
router.patch('/read', async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true, readAt: new Date() });
    successResponse(res, 'All notifications marked as read');
  } catch (err) { next(err); }
});

// PATCH /api/v1/notifications/:id/read — mark single as read
router.patch('/:id/read', async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { read: true, readAt: new Date() });
    successResponse(res, 'Notification marked as read');
  } catch (err) { next(err); }
});

module.exports = router;
