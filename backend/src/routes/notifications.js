const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/NotificationController');

// Routes
router.get('/:userId', NotificationController.getNotifications);
router.put('/:id/read', NotificationController.markAsRead);
router.put('/:id/archive', NotificationController.archiveNotification);
router.put('/:id/restore', NotificationController.restoreNotification);
router.delete('/:id', NotificationController.deleteNotification);
router.post('/', NotificationController.createNotification);

module.exports = router;
