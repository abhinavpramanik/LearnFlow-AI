const campaignService = require('../services/campaignService');
const { successResponse, createdResponse, paginatedResponse } = require('../utils/response');

const getCampaigns = async (req, res, next) => {
  try {
    const { campaigns, pagination } = await campaignService.getCampaigns(req.query);
    paginatedResponse(res, 'Campaigns retrieved', campaigns, pagination);
  } catch (err) { next(err); }
};

const getCampaignById = async (req, res, next) => {
  try {
    const campaign = await campaignService.getCampaignById(req.params.id);
    successResponse(res, 'Campaign retrieved', campaign);
  } catch (err) { next(err); }
};

const createCampaign = async (req, res, next) => {
  try {
    const campaign = await campaignService.createCampaign(req.body, req.user._id, req.ip);
    createdResponse(res, 'Campaign created', campaign);
  } catch (err) { next(err); }
};

const updateCampaign = async (req, res, next) => {
  try {
    const campaign = await campaignService.updateCampaign(req.params.id, req.body, req.user._id, req.ip);
    successResponse(res, 'Campaign updated', campaign);
  } catch (err) { next(err); }
};

const publishCampaign = async (req, res, next) => {
  try {
    const campaign = await campaignService.publishCampaign(req.params.id, req.user._id, req.ip);
    successResponse(res, 'Campaign published', campaign);
  } catch (err) { next(err); }
};

const deleteCampaign = async (req, res, next) => {
  try {
    await campaignService.deleteCampaign(req.params.id, req.user._id, req.ip);
    successResponse(res, 'Campaign deleted');
  } catch (err) { next(err); }
};

module.exports = { getCampaigns, getCampaignById, createCampaign, updateCampaign, publishCampaign, deleteCampaign };
