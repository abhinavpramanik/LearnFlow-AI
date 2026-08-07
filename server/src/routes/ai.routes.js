const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const aiService = require('../ai/aiService');
const Ticket = require('../models/Ticket');
const Message = require('../models/Message');
const Profile = require('../models/Profile');
const Journey = require('../models/Journey');
const Interaction = require('../models/Interaction');
const Recommendation = require('../models/Recommendation');
const Approval = require('../models/Approval');
const AiRun = require('../models/AiRun');
const { successResponse, createdResponse, paginatedResponse } = require('../utils/response');
const { NotFoundError } = require('../utils/errors');
const { auditLog } = require('../services/auditService');

// Strict rate limit for AI endpoints
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, message: 'AI rate limit exceeded. Please wait before trying again.' },
});

router.use(authenticate);
router.use(aiLimiter);

// POST /api/v1/ai/intent — classify intent of a message
router.post('/intent', async (req, res, next) => {
  try {
    const result = await aiService.classifyIntent(req.body, req.user._id);
    successResponse(res, 'Intent classified', result);
  } catch (err) { next(err); }
});

// POST /api/v1/ai/sentiment — analyze sentiment of a message
router.post('/sentiment', async (req, res, next) => {
  try {
    const result = await aiService.analyzeSentiment(req.body, req.user._id);
    successResponse(res, 'Sentiment analyzed', result);
  } catch (err) { next(err); }
});

// POST /api/v1/ai/summarize — summarize ticket conversation
router.post('/summarize', async (req, res, next) => {
  try {
    const { ticketId } = req.body;
    const messages = await Message.find({ ticketId }).populate('sender', 'firstName lastName').sort({ createdAt: 1 }).limit(50);
    const result = await aiService.summarizeConversation({ messages }, req.user._id);
    successResponse(res, 'Conversation summarized', result);
  } catch (err) { next(err); }
});

// POST /api/v1/ai/recommend — next best action for a profile
router.post('/recommend', authorize('Service Agent', 'Marketing Manager', 'Sales Manager', 'Admin'), async (req, res, next) => {
  try {
    const { profileId } = req.body;
    const profile = await Profile.findById(profileId);
    if (!profile) throw new NotFoundError('Profile not found');

    const [journey, recentInteractions] = await Promise.all([
      Journey.find({ profileId }).sort({ createdAt: -1 }).limit(10),
      Interaction.find({ profileId }).sort({ createdAt: -1 }).limit(5),
    ]);

    const result = await aiService.getNextBestAction({ profile, journey, recentInteractions }, req.user._id);

    // Save as recommendation for review
    const recommendation = await Recommendation.create({
      profileId,
      recommendation: result.result,
      confidence: result.confidence,
      explanation: result.explanation,
      modelVersion: result.modelVersion,
      aiRunId: result.aiRunId,
    });

    successResponse(res, 'Next best action generated', { ...result, recommendationId: recommendation._id });
  } catch (err) { next(err); }
});

// POST /api/v1/ai/draft — draft a reply for a ticket
router.post('/draft', authorize('Service Agent', 'Admin'), async (req, res, next) => {
  try {
    const { ticketId } = req.body;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) throw new NotFoundError('Ticket not found');

    const [profile, recentMessages] = await Promise.all([
      Profile.findById(ticket.profileId).populate('userId', 'firstName lastName'),
      Message.find({ ticketId }).populate('sender', 'firstName lastName').sort({ createdAt: -1 }).limit(10),
    ]);

    const result = await aiService.draftResponse({ ticket, profile, recentMessages }, req.user._id);
    successResponse(res, 'Draft reply generated', result);
  } catch (err) { next(err); }
});

// POST /api/v1/ai/recommendations/:id/review — Approve / Reject / Override
router.post('/recommendations/:id/review', authorize('Service Agent', 'Marketing Manager', 'Sales Manager', 'Admin'), async (req, res, next) => {
  try {
    const { decision, reason } = req.body;
    const recommendation = await Recommendation.findById(req.params.id);
    if (!recommendation) throw new NotFoundError('Recommendation not found');

    recommendation.status = decision;
    recommendation.reviewer = req.user._id;
    recommendation.reviewedAt = new Date();
    recommendation.reviewNote = reason;
    await recommendation.save();

    await Approval.create({ entityType: 'Recommendation', entityId: recommendation._id, decision, reviewer: req.user._id, reason });
    await auditLog({ actor: req.user._id, action: `ai:recommendation:${decision.toLowerCase()}`, entity: 'Recommendation', entityId: recommendation._id, outcome: 'success', ipAddress: req.ip });

    successResponse(res, `Recommendation ${decision.toLowerCase()}`, recommendation);
  } catch (err) { next(err); }
});

// GET /api/v1/ai/runs — AI run history (Admin only)
router.get('/runs', authorize('Admin'), async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const filter = {};
    if (req.query.feature) filter.feature = req.query.feature;
    const [runs, total] = await Promise.all([
      AiRun.find(filter).populate('createdBy', 'firstName lastName').skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }),
      AiRun.countDocuments(filter),
    ]);
    paginatedResponse(res, 'AI runs retrieved', runs, { page, limit, total, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

// GET /api/v1/ai/recommendations — list AI recommendations
router.get('/recommendations', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const filter = {};
    if (req.query.profileId) filter.profileId = req.query.profileId;
    if (req.query.status) filter.status = req.query.status;
    const [recs, total] = await Promise.all([
      Recommendation.find(filter).populate('profileId').populate('reviewer', 'firstName lastName').skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }),
      Recommendation.countDocuments(filter),
    ]);
    paginatedResponse(res, 'Recommendations retrieved', recs, { page, limit, total, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

module.exports = router;
