const { AuthorizationError } = require('../utils/errors');

/**
 * Middleware: Restrict access to specific roles
 * Usage: authorize('Admin', 'Service Agent')
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(new AuthorizationError('Access denied: no role assigned'));
    }

    const userRole = req.user.role.name;

    if (!allowedRoles.includes(userRole)) {
      return next(
        new AuthorizationError(
          `Access denied: role '${userRole}' is not permitted for this action`
        )
      );
    }

    next();
  };
};

/**
 * Middleware: Restrict access based on granular permission
 * Usage: requirePermission('tickets:update')
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(new AuthorizationError('Access denied'));
    }

    const userPermissions = req.user.role.permissions || [];

    if (!userPermissions.includes(permission)) {
      return next(
        new AuthorizationError(
          `Access denied: missing permission '${permission}'`
        )
      );
    }

    next();
  };
};

module.exports = { authorize, requirePermission };
