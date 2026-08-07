const authService = require('../services/authService');
const { successResponse } = require('../utils/response');

/**
 * POST /api/v1/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password, req.ip);
    successResponse(res, 'Login successful', result);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    await authService.logout(req.user._id, req.ip);
    successResponse(res, 'Logout successful');
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/auth/refresh
 */
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshAccessToken(refreshToken);
    successResponse(res, 'Token refreshed', tokens);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/auth/forgot-password
 */
const forgotPassword = async (req, res, next) => {
  try {
    const token = await authService.forgotPassword(req.body.email);
    // Always return 200 to prevent email enumeration
    successResponse(res, 'If that email exists, a reset link has been sent', {
      // Return token in dev only
      ...(process.env.NODE_ENV !== 'production' && { resetToken: token }),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/auth/reset-password
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    await authService.resetPassword(token, password);
    successResponse(res, 'Password has been reset successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { login, logout, refresh, forgotPassword, resetPassword };
