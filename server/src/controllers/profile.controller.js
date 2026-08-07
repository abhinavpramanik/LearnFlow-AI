const profileService = require('../services/profileService');
const { successResponse, paginatedResponse } = require('../utils/response');

const getProfiles = async (req, res, next) => {
  try {
    const { profiles, pagination } = await profileService.getProfiles(req.query, req.user);
    paginatedResponse(res, 'Profiles retrieved', profiles, pagination);
  } catch (err) { next(err); }
};

const getProfileById = async (req, res, next) => {
  try {
    const profile = await profileService.getProfileById(req.params.id, req.user);
    successResponse(res, 'Profile retrieved', profile);
  } catch (err) { next(err); }
};

const getMyProfile = async (req, res, next) => {
  try {
    const profile = await profileService.getMyProfile(req.user._id);
    successResponse(res, 'My profile retrieved', profile);
  } catch (err) { next(err); }
};

const updateProfile = async (req, res, next) => {
  try {
    const profile = await profileService.updateProfile(req.params.id, req.body, req.user);
    successResponse(res, 'Profile updated successfully', profile);
  } catch (err) { next(err); }
};

module.exports = { getProfiles, getProfileById, getMyProfile, updateProfile };
