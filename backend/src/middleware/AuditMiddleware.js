const AuditLog = require('../models/AuditLog');

// Middleware to log actions
const logAudit = (action) => {
  return async (req, res, next) => {
    try {
      // Log the action after the response is sent
      res.on('finish', async () => {
        try {
          // Only log successful requests (2xx status codes)
          if (res.statusCode >= 200 && res.statusCode < 300) {
            await AuditLog.create({
              userId: req.user?.id || null,
              role: req.user?.role || 'unknown',
              action: action,
              timestamp: new Date()
            });
          }
        } catch (error) {
          console.error('Error creating audit log:', error);
        }
      });
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Function to manually create audit logs
const createAuditLog = async (userId, role, action) => {
  try {
    const auditLog = await AuditLog.create({
      userId,
      role,
      action,
      timestamp: new Date()
    });
    return auditLog;
  } catch (error) {
    console.error('Error creating audit log:', error);
    return null;
  }
};

module.exports = { logAudit, createAuditLog };
