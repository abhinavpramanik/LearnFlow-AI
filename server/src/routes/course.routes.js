const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const Course = require('../models/Course');
const { successResponse, createdResponse, paginatedResponse } = require('../utils/response');
const { NotFoundError } = require('../utils/errors');

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const filter = {};
    if (req.query.level) filter.level = req.query.level;
    if (req.query.search) filter.title = { $regex: req.query.search, $options: 'i' };
    const [courses, total] = await Promise.all([Course.find(filter).populate('skills', 'name').skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }), Course.countDocuments(filter)]);
    paginatedResponse(res, 'Courses retrieved', courses, { page, limit, total, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

router.post('/', authorize('Admin'), async (req, res, next) => {
  try {
    const course = await Course.create(req.body);
    createdResponse(res, 'Course created', course);
  } catch (err) { next(err); }
});

router.put('/:id', authorize('Admin'), async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!course) throw new NotFoundError('Course not found');
    successResponse(res, 'Course updated', course);
  } catch (err) { next(err); }
});

router.delete('/:id', authorize('Admin'), async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) throw new NotFoundError('Course not found');
    course.deletedAt = new Date();
    await course.save();
    successResponse(res, 'Course deleted');
  } catch (err) { next(err); }
});

module.exports = router;
