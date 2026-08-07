const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Role = require('../models/Role');
const { auditLog } = require('./auditService');
const { AuthenticationError, NotFoundError, ConflictError, BusinessRuleError } = require('../utils/errors');

/**
 * Generate access + refresh JWT tokens
 */
const generateTokens = (user) => {
  const payload = {
    sub: user._id.toString(),
    email: user.email,
    role: user.role?.name,
    organizationId: user.organizationId,
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });

  const refreshToken = jwt.sign(
    { sub: user._id.toString() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

/**
 * Login service
 */
const login = async (email, password, ipAddress) => {
  const user = await User.findOne({ email }).select('+passwordHash').populate('role', 'name permissions');

  if (!user) {
    throw new AuthenticationError('Invalid email or password');
  }

  if (user.status !== 'Active') {
    throw new AuthenticationError('Account is inactive or suspended');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AuthenticationError('Invalid email or password');
  }

  const { accessToken, refreshToken } = generateTokens(user);

  // Persist refresh token
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  await auditLog({
    actor: user._id,
    action: 'auth:login',
    entity: 'User',
    entityId: user._id,
    outcome: 'success',
    ipAddress,
  });

  return {
    accessToken,
    refreshToken,
    user: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    },
  };
};

/**
 * Refresh access token
 */
const refreshAccessToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.sub).select('+refreshToken').populate('role', 'name permissions');

    if (!user || user.refreshToken !== refreshToken) {
      throw new AuthenticationError('Invalid refresh token');
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken: newRefreshToken };
  } catch (err) {
    if (err.isOperational) throw err;
    throw new AuthenticationError('Invalid or expired refresh token');
  }
};

/**
 * Logout — invalidate refresh token
 */
const logout = async (userId, ipAddress) => {
  const user = await User.findById(userId);
  if (user) {
    user.refreshToken = null;
    await user.save({ validateBeforeSave: false });

    await auditLog({
      actor: userId,
      action: 'auth:logout',
      entity: 'User',
      entityId: userId,
      outcome: 'success',
      ipAddress,
    });
  }
};

/**
 * Forgot password — generate reset token
 */
const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal if email exists
    return;
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
  await user.save({ validateBeforeSave: false });

  // In production, email the resetToken. For now, return it (dev only)
  return resetToken;
};

/**
 * Reset password
 */
const resetPassword = async (resetToken, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new BusinessRuleError('Password reset token is invalid or has expired');
  }

  user.passwordHash = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshToken = undefined;
  await user.save();
};

module.exports = { login, refreshAccessToken, logout, forgotPassword, resetPassword };
