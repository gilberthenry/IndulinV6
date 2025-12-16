const Notification = require('../models/Notification');

module.exports = {
  // Get notifications for a user
  getNotifications: async (req, res) => {
    try {
      const { userId } = req.params;
      const notifications = await Notification.findAll({ where: { userId }, order: [['time', 'DESC']] });
      res.json(notifications);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Mark notification as read
  markAsRead: async (req, res) => {
    try {
      const { id } = req.params;
      const notification = await Notification.findByPk(id);
      if (!notification) return res.status(404).json({ error: 'Notification not found' });

      await notification.update({ read: true });
      res.json({ message: 'Notification marked as read' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Create new notification
  createNotification: async (req, res) => {
    try {
      const { message, userId } = req.body;
      const newNotif = await Notification.create({ message, userId });

      // Emit real-time event to frontend
      if (global.io) {
        global.io.emit(`notification:${userId}`, newNotif);
      }

      res.status(201).json(newNotif);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  // Archive notification
  archiveNotification: async (req, res) => {
    try {
      const { id } = req.params;
      const notification = await Notification.findByPk(id);
      if (!notification) return res.status(404).json({ error: 'Notification not found' });

      await notification.update({ archived: true, read: true });
      res.json({ message: 'Notification archived successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Delete notification
  deleteNotification: async (req, res) => {
    try {
      const { id } = req.params;
      const notification = await Notification.findByPk(id);
      if (!notification) return res.status(404).json({ error: 'Notification not found' });

      await notification.destroy();
      res.json({ message: 'Notification deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Restore archived notification
  restoreNotification: async (req, res) => {
    try {
      const { id } = req.params;
      const notification = await Notification.findByPk(id);
      if (!notification) return res.status(404).json({ error: 'Notification not found' });

      await notification.update({ archived: false });
      res.json({ message: 'Notification restored successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
