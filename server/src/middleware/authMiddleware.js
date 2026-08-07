const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AuthenticationError } = require('../utils/errors');

/**
 * Middleware: Verifies JWT access token and loads current user onto req.user
 */
const authenticate = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AuthenticationError('Access token is missing'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.sub).populate('role', 'name permissions');

    if (!user) {
      return next(new AuthenticationError('User no longer exists'));
    }

    if (user.status !== 'Active') {
      return next(new AuthenticationError('Account is inactive or suspended'));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AuthenticationError('Access token has expired'));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new AuthenticationError('Invalid access token'));
    }
    next(error);
  }
};

module.exports = { authenticate };
