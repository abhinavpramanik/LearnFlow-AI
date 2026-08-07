const userService = require('../services/userService');
const { successResponse, createdResponse, paginatedResponse } = require('../utils/response');

const getUsers = async (req, res, next) => {
  try {
    const { users, pagination } = await userService.getUsers(req.query);
    paginatedResponse(res, 'Users retrieved', users, pagination);
  } catch (err) { next(err); }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    successResponse(res, 'User retrieved', user);
  } catch (err) { next(err); }
};

const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body, req.user._id, req.ip);
    createdResponse(res, 'User created successfully', user);
  } catch (err) { next(err); }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body, req.user._id, req.ip);
    successResponse(res, 'User updated successfully', user);
  } catch (err) { next(err); }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const user = await userService.updateUserStatus(req.params.id, req.body.status, req.user._id, req.ip);
    successResponse(res, 'User status updated', user);
  } catch (err) { next(err); }
};

const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id, req.user._id, req.ip);
    successResponse(res, 'User deleted successfully');
  } catch (err) { next(err); }
};

module.exports = { getUsers, getUserById, createUser, updateUser, updateUserStatus, deleteUser };
