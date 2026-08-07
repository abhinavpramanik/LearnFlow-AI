const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const Setting = require('../models/Setting');
const { successResponse, createdResponse } = require('../utils/response');
const { auditLog } = require('../services/auditService');

router.use(authenticate);
router.use(authorize('Admin'));

router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    const settings = await Setting.find(filter).select('-__v');
    successResponse(res, 'Settings retrieved', settings);
  } catch (err) { next(err); }
});

router.put('/:key', async (req, res, next) => {
  try {
    const setting = await Setting.findOneAndUpdate(
      { key: req.params.key },
      { value: req.body.value, updatedBy: req.user._id },
      { new: true, upsert: true, runValidators: true }
    );
    await auditLog({ actor: req.user._id, action: 'settings:update', entity: 'Setting', entityId: setting._id, newValue: req.body.value, outcome: 'success', ipAddress: req.ip });
    successResponse(res, 'Setting updated', setting);
  } catch (err) { next(err); }
});

module.exports = router;
