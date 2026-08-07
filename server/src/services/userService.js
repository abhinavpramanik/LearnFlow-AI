const User = require('../models/User');
const Role = require('../models/Role');
const Profile = require('../models/Profile');
const { auditLog } = require('./auditService');
const { NotFoundError, ConflictError, BusinessRuleError } = require('../utils/errors');

const getPaginationOptions = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const getUsers = async (query) => {
  const { page, limit, skip } = getPaginationOptions(query);
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.search) {
    filter.$or = [
      { firstName: { $regex: query.search, $options: 'i' } },
      { lastName: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
    ];
  }
  const [users, total] = await Promise.all([
    User.find(filter).populate('role', 'name').select('-passwordHash').skip(skip).limit(limit).sort({ createdAt: -1 }),
    User.countDocuments(filter),
  ]);
  return { users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

const getUserById = async (id) => {
  const user = await User.findById(id).populate('role', 'name permissions').select('-passwordHash');
  if (!user) throw new NotFoundError('User not found');
  return user;
};

const createUser = async (data, actorId, ipAddress) => {
  const existing = await User.findOne({ email: data.email });
  if (existing) throw new ConflictError('A user with this email already exists');

  const role = await Role.findOne({ name: data.role });
  if (!role) throw new BusinessRuleError(`Role '${data.role}' does not exist`);

  const user = await User.create({ ...data, role: role._id, passwordHash: data.password });

  // Create corresponding profile
  await Profile.create({ userId: user._id });

  await auditLog({ actor: actorId, action: 'users:create', entity: 'User', entityId: user._id, outcome: 'success', ipAddress });

  return User.findById(user._id).populate('role', 'name').select('-passwordHash');
};

const updateUser = async (id, data, actorId, ipAddress) => {
  const user = await User.findById(id);
  if (!user) throw new NotFoundError('User not found');

  if (data.role) {
    const role = await Role.findOne({ name: data.role });
    if (!role) throw new BusinessRuleError(`Role '${data.role}' does not exist`);
    data.role = role._id;
  }

  const previous = { firstName: user.firstName, lastName: user.lastName, email: user.email };
  Object.assign(user, data);
  await user.save();

  await auditLog({ actor: actorId, action: 'users:update', entity: 'User', entityId: id, previousValue: previous, newValue: data, outcome: 'success', ipAddress });
  return User.findById(id).populate('role', 'name').select('-passwordHash');
};

const updateUserStatus = async (id, status, actorId, ipAddress) => {
  const user = await User.findById(id);
  if (!user) throw new NotFoundError('User not found');
  const previous = user.status;
  user.status = status;
  await user.save({ validateBeforeSave: false });
  await auditLog({ actor: actorId, action: `users:status-change`, entity: 'User', entityId: id, previousValue: previous, newValue: status, outcome: 'success', ipAddress });
  return user;
};

const deleteUser = async (id, actorId, ipAddress) => {
  const user = await User.findById(id);
  if (!user) throw new NotFoundError('User not found');
  user.deletedAt = new Date();
  user.deletedBy = actorId;
  await user.save({ validateBeforeSave: false });
  await auditLog({ actor: actorId, action: 'users:delete', entity: 'User', entityId: id, outcome: 'success', ipAddress });
};

module.exports = { getUsers, getUserById, createUser, updateUser, updateUserStatus, deleteUser };
