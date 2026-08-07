const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const AuditLog = require('../models/AuditLog');
const { paginatedResponse, successResponse } = require('../utils/response');
const { NotFoundError } = require('../utils/errors');

router.use(authenticate);
router.use(authorize('Admin'));

router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const filter = {};
    if (req.query.action) filter.action = { $regex: req.query.action, $options: 'i' };
    if (req.query.entity) filter.entity = req.query.entity;
    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
      if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);
    }
    const [logs, total] = await Promise.all([
      AuditLog.find(filter).populate('actor', 'firstName lastName email').skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }),
      AuditLog.countDocuments(filter),
    ]);
    paginatedResponse(res, 'Audit logs retrieved', logs, { page, limit, total, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const log = await AuditLog.findById(req.params.id).populate('actor', 'firstName lastName email');
    if (!log) throw new NotFoundError('Audit log not found');
    successResponse(res, 'Audit log retrieved', log);
  } catch (err) { next(err); }
});

module.exports = router;
