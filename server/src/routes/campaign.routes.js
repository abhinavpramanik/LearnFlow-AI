const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaign.controller');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

router.use(authenticate);

router.get('/', authorize('Marketing Manager', 'Sales Manager', 'Admin'), campaignController.getCampaigns);
router.get('/:id', authorize('Marketing Manager', 'Sales Manager', 'Admin'), campaignController.getCampaignById);
router.post('/', authorize('Marketing Manager', 'Admin'), campaignController.createCampaign);
router.put('/:id', authorize('Marketing Manager', 'Admin'), campaignController.updateCampaign);
router.post('/:id/publish', authorize('Marketing Manager', 'Admin'), campaignController.publishCampaign);
router.delete('/:id', authorize('Marketing Manager', 'Admin'), campaignController.deleteCampaign);

module.exports = router;
