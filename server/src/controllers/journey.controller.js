const journeyService = require('../services/journeyService');
const { successResponse, createdResponse, paginatedResponse } = require('../utils/response');

const getJourneys = async (req, res, next) => {
  try {
    const { journeys, pagination } = await journeyService.getJourneys(req.params.profileId, req.query, req.user);
    paginatedResponse(res, 'Journeys retrieved', journeys, pagination);
  } catch (err) { next(err); }
};

const createJourney = async (req, res, next) => {
  try {
    const journey = await journeyService.createJourney({ ...req.body, profileId: req.params.profileId }, req.user._id);
    createdResponse(res, 'Journey event created', journey);
  } catch (err) { next(err); }
};

const updateJourney = async (req, res, next) => {
  try {
    const journey = await journeyService.updateJourney(req.params.id, req.body);
    successResponse(res, 'Journey event updated', journey);
  } catch (err) { next(err); }
};

module.exports = { getJourneys, createJourney, updateJourney };
