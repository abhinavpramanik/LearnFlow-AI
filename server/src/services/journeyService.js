const Journey = require('../models/Journey');
const Profile = require('../models/Profile');
const { NotFoundError, AuthorizationError } = require('../utils/errors');
const { ROLES } = require('../constants');

const getPaginationOptions = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, parseInt(query.limit) || 20);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const getJourneys = async (profileId, query, requestingUser) => {
  const { page, limit, skip } = getPaginationOptions(query);
  const filter = { profileId };
  if (query.stage) filter.stage = query.stage;
  if (query.status) filter.status = query.status;

  const [journeys, total] = await Promise.all([
    Journey.find(filter).populate('owner', 'firstName lastName').skip(skip).limit(limit).sort({ createdAt: -1 }),
    Journey.countDocuments(filter),
  ]);
  return { journeys, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

const createJourney = async (data, actorId) => {
  const profile = await Profile.findById(data.profileId);
  if (!profile) throw new NotFoundError('Profile not found');
  const journey = await Journey.create({ ...data, owner: actorId });
  return journey;
};

const updateJourney = async (id, data) => {
  const journey = await Journey.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!journey) throw new NotFoundError('Journey not found');
  return journey;
};

module.exports = { getJourneys, createJourney, updateJourney };
