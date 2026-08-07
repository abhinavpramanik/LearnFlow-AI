const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { createUserSchema, updateUserSchema, updateStatusSchema } = require('../validators/user.validator');

// All user routes require authentication
router.use(authenticate);

router.get('/', authorize('Admin', 'Sales Manager'), userController.getUsers);
router.get('/:id', authorize('Admin'), userController.getUserById);
router.post('/', authorize('Admin'), validate(createUserSchema), userController.createUser);
router.put('/:id', authorize('Admin'), validate(updateUserSchema), userController.updateUser);
router.patch('/:id/status', authorize('Admin'), validate(updateStatusSchema), userController.updateUserStatus);
router.delete('/:id', authorize('Admin'), userController.deleteUser);

module.exports = router;
