const express = require('express');
const router = express.Router({ mergeParams: true });
const journeyController = require('../controllers/journey.controller');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

// /api/v1/journeys/:profileId/events
router.get('/:profileId/events', journeyController.getJourneys);
router.post('/:profileId/events', journeyController.createJourney);
router.put('/events/:id', journeyController.updateJourney);

module.exports = router;
