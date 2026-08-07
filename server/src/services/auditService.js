const AuditLog = require('../models/AuditLog');

/**
 * Audit logging service — records every critical user action
 */
const auditLog = async ({ actor, action, entity, entityId, previousValue, newValue, outcome, ipAddress }) => {
  try {
    await AuditLog.create({
      actor,
      action,
      entity,
      entityId,
      previousValue,
      newValue,
      outcome: outcome || 'success',
      ipAddress,
    });
  } catch (err) {
    // Audit failures should never break the main request
    console.error('[AuditLog] Failed to write audit record:', err.message);
  }
};

module.exports = { auditLog };
