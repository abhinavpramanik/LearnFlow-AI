const Profile = require('../models/Profile');
const User = require('../models/User');
const { NotFoundError, AuthorizationError } = require('../utils/errors');
const { ROLES } = require('../constants');

const getPaginationOptions = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const getProfiles = async (query, requestingUser) => {
  const { page, limit, skip } = getPaginationOptions(query);
  const filter = {};

  // Role-based filter
  const roleName = requestingUser.role?.name;
  if (roleName === ROLES.CUSTOMER) {
    // Customers can only see their own profile
    filter.userId = requestingUser._id;
  }

  if (query.search) {
    const userIds = await User.find({
      $or: [
        { firstName: { $regex: query.search, $options: 'i' } },
        { lastName: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
      ],
    }).distinct('_id');
    filter.userId = { $in: userIds };
  }

  const [profiles, total] = await Promise.all([
    Profile.find(filter).populate('userId', 'firstName lastName email status').skip(skip).limit(limit).sort({ createdAt: -1 }),
    Profile.countDocuments(filter),
  ]);

  return { profiles, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

const getProfileById = async (id, requestingUser) => {
  const profile = await Profile.findById(id).populate('userId', 'firstName lastName email status role');
  if (!profile) throw new NotFoundError('Profile not found');

  const roleName = requestingUser.role?.name;
  if (roleName === ROLES.CUSTOMER && profile.userId._id.toString() !== requestingUser._id.toString()) {
    throw new AuthorizationError('You can only view your own profile');
  }

  return profile;
};

const getMyProfile = async (userId) => {
  const profile = await Profile.findOne({ userId }).populate('userId', 'firstName lastName email status');
  if (!profile) throw new NotFoundError('Profile not found');
  return profile;
};

const updateProfile = async (id, data, requestingUser) => {
  const profile = await Profile.findById(id);
  if (!profile) throw new NotFoundError('Profile not found');

  const roleName = requestingUser.role?.name;
  if (roleName === ROLES.CUSTOMER && profile.userId.toString() !== requestingUser._id.toString()) {
    throw new AuthorizationError('You can only update your own profile');
  }

  Object.assign(profile, data);
  await profile.save();
  return profile;
};

module.exports = { getProfiles, getProfileById, getMyProfile, updateProfile };
