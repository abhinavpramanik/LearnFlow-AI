const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/me', profileController.getMyProfile);
router.get('/', profileController.getProfiles);
router.get('/:id', profileController.getProfileById);
router.put('/:id', profileController.updateProfile);

module.exports = router;
