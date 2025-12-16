const express = require('express');
const router = express.Router();
const MISController = require('../controllers/MISController');
const HRRequestController = require('../controllers/HRRequestController');
const { authenticateToken, authorizeRoles } = require('../middleware/AuthMiddleware');

// Audit logs
router.get('/audit-logs', authenticateToken, authorizeRoles('mis'), MISController.getAuditLogs);

// Backup system
router.post('/backups', authenticateToken, authorizeRoles('mis'), MISController.backupSystem);

// Account management
router.get('/accounts', authenticateToken, authorizeRoles('mis'), MISController.getAllAccounts);
router.put('/accounts/:id', authenticateToken, authorizeRoles('mis'), MISController.updateAccount);
router.patch('/accounts/:id/disable', authenticateToken, authorizeRoles('mis'), MISController.disableAccount);
router.patch('/accounts/:id/reactivate', authenticateToken, authorizeRoles('mis'), MISController.reactivateAccount);
router.post('/accounts/:id/reset-password', authenticateToken, authorizeRoles('mis'), MISController.resetPassword);

// Reports
router.get('/reports/system', authenticateToken, authorizeRoles('mis'), MISController.systemReport);

// System Notifications (MIS only)
router.get('/notifications', authenticateToken, authorizeRoles('mis'), MISController.getSystemNotifications);
router.post('/notifications', authenticateToken, authorizeRoles('mis'), MISController.createSystemNotification);
router.put('/notifications/:id/read', authenticateToken, authorizeRoles('mis'), MISController.markNotificationRead);
router.delete('/notifications/:id', authenticateToken, authorizeRoles('mis'), MISController.deleteNotification);

// Configuration Requests (MIS can view and manage all requests)
router.get('/config-requests', authenticateToken, authorizeRoles('mis'), HRRequestController.getAllRequests);
router.get('/config-requests/stats', authenticateToken, authorizeRoles('mis'), HRRequestController.getQueueStats);
router.get('/config-requests/:id', authenticateToken, authorizeRoles('mis'), HRRequestController.getRequestById);
router.put('/config-requests/:id/assign', authenticateToken, authorizeRoles('mis'), HRRequestController.assignRequest);
router.put('/config-requests/:id/approve', authenticateToken, authorizeRoles('mis'), HRRequestController.approveRequest);
router.put('/config-requests/:id/reject', authenticateToken, authorizeRoles('mis'), HRRequestController.rejectRequest);

module.exports = router;