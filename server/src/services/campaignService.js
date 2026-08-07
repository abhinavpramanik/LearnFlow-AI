const Campaign = require('../models/Campaign');
const { NotFoundError } = require('../utils/errors');
const { auditLog } = require('./auditService');
const { CAMPAIGN_STATUS } = require('../constants');

const getPaginationOptions = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, parseInt(query.limit) || 20);
  return { page, limit, skip: (page - 1) * limit };
};

const getCampaigns = async (query) => {
  const { page, limit, skip } = getPaginationOptions(query);
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.search) filter.name = { $regex: query.search, $options: 'i' };
  const [campaigns, total] = await Promise.all([
    Campaign.find(filter).populate('segmentId', 'name audienceCount').populate('createdBy', 'firstName lastName').skip(skip).limit(limit).sort({ createdAt: -1 }),
    Campaign.countDocuments(filter),
  ]);
  return { campaigns, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

const getCampaignById = async (id) => {
  const campaign = await Campaign.findById(id).populate('segmentId').populate('createdBy', 'firstName lastName');
  if (!campaign) throw new NotFoundError('Campaign not found');
  return campaign;
};

const createCampaign = async (data, actorId, ipAddress) => {
  const campaign = await Campaign.create({ ...data, createdBy: actorId });
  await auditLog({ actor: actorId, action: 'campaigns:create', entity: 'Campaign', entityId: campaign._id, outcome: 'success', ipAddress });
  return campaign;
};

const updateCampaign = async (id, data, actorId, ipAddress) => {
  const campaign = await Campaign.findById(id);
  if (!campaign) throw new NotFoundError('Campaign not found');
  Object.assign(campaign, data);
  await campaign.save();
  await auditLog({ actor: actorId, action: 'campaigns:update', entity: 'Campaign', entityId: id, outcome: 'success', ipAddress });
  return campaign;
};

const publishCampaign = async (id, actorId, ipAddress) => {
  const campaign = await Campaign.findById(id);
  if (!campaign) throw new NotFoundError('Campaign not found');
  campaign.status = CAMPAIGN_STATUS.SCHEDULED;
  campaign.publishedAt = new Date();
  await campaign.save();
  await auditLog({ actor: actorId, action: 'campaigns:publish', entity: 'Campaign', entityId: id, outcome: 'success', ipAddress });
  return campaign;
};

const deleteCampaign = async (id, actorId, ipAddress) => {
  const campaign = await Campaign.findById(id);
  if (!campaign) throw new NotFoundError('Campaign not found');
  campaign.deletedAt = new Date();
  await campaign.save();
  await auditLog({ actor: actorId, action: 'campaigns:delete', entity: 'Campaign', entityId: id, outcome: 'success', ipAddress });
};

module.exports = { getCampaigns, getCampaignById, createCampaign, updateCampaign, publishCampaign, deleteCampaign };
