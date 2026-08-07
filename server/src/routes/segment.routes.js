const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const Segment = require('../models/Segment');
const { successResponse, createdResponse, paginatedResponse } = require('../utils/response');
const { NotFoundError } = require('../utils/errors');

router.use(authenticate);

router.get('/', authorize('Marketing Manager', 'Admin', 'Sales Manager'), async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const filter = {};
    if (req.query.search) filter.name = { $regex: req.query.search, $options: 'i' };
    const [segments, total] = await Promise.all([Segment.find(filter).populate('createdBy', 'firstName lastName').skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }), Segment.countDocuments(filter)]);
    paginatedResponse(res, 'Segments retrieved', segments, { page, limit, total, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

router.get('/:id', authorize('Marketing Manager', 'Admin', 'Sales Manager'), async (req, res, next) => {
  try {
    const segment = await Segment.findById(req.params.id).populate('createdBy', 'firstName lastName');
    if (!segment) throw new NotFoundError('Segment not found');
    successResponse(res, 'Segment retrieved', segment);
  } catch (err) { next(err); }
});

router.post('/', authorize('Marketing Manager', 'Admin'), async (req, res, next) => {
  try {
    const segment = await Segment.create({ ...req.body, createdBy: req.user._id });
    createdResponse(res, 'Segment created', segment);
  } catch (err) { next(err); }
});

router.put('/:id', authorize('Marketing Manager', 'Admin'), async (req, res, next) => {
  try {
    const segment = await Segment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!segment) throw new NotFoundError('Segment not found');
    successResponse(res, 'Segment updated', segment);
  } catch (err) { next(err); }
});

router.delete('/:id', authorize('Marketing Manager', 'Admin'), async (req, res, next) => {
  try {
    const segment = await Segment.findById(req.params.id);
    if (!segment) throw new NotFoundError('Segment not found');
    segment.deletedAt = new Date();
    await segment.save();
    successResponse(res, 'Segment deleted');
  } catch (err) { next(err); }
});

module.exports = router;
