const bcrypt = require('bcrypt');
const AuditLog = require('../models/AuditLog');
const Employee = require('../models/Employee');
const Notification = require('../models/Notification');
const { createBackup } = require('../services/BackupService');
const { createAuditLog } = require('../middleware/AuditMiddleware');

module.exports = {
  // View audit logs
  getAuditLogs: async (req, res) => {
    try {
      const logs = await AuditLog.findAll({ order: [['createdAt', 'DESC']] });
      res.json(logs);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Trigger backup
  backupSystem: async (req, res) => {
    try {
      const result = await createBackup();
      
      // Log backup creation
      await createAuditLog(req.user.id, req.user.role, 'System backup created');
      
      res.json({ message: 'Backup completed', result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Manage accounts (disable/activate, role assignment)
  updateAccount: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, role } = req.body;

      const employee = await Employee.findByPk(id);
      if (!employee) return res.status(404).json({ error: 'Employee not found' });

      const oldStatus = employee.status;
      const oldRole = employee.role;
      
      if (status) employee.status = status;
      if (role) employee.role = role;

      await employee.save();
      
      // Log account update
      const changes = [];
      if (status && status !== oldStatus) changes.push(`status from ${oldStatus} to ${status}`);
      if (role && role !== oldRole) changes.push(`role from ${oldRole} to ${role}`);
      await createAuditLog(req.user.id, req.user.role, `Updated account for ${employee.fullName} (${employee.employeeId}): ${changes.join(', ')}`);
      
      res.json({ message: 'Account updated successfully', employee });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  // System usage reports
  systemReport: async (req, res) => {
    try {
      const totalEmployees = await Employee.count();
      const activeEmployees = await Employee.count({ where: { status: 'active' } });
      res.json({ totalEmployees, activeEmployees });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Get all accounts
  getAllAccounts: async (req, res) => {
    try {
      console.log('[MISController] getAllAccounts called');
      const accounts = await Employee.findAll({
        attributes: ['id', 'employeeId', 'fullName', 'email', 'role', 'status', 'isSuspended', 'createdAt'],
        order: [['createdAt', 'DESC']],
      });
      
      console.log(`[MISController] Found ${accounts.length} accounts`);
      
      // Map accounts to include a computed status field
      const formattedAccounts = accounts.map(acc => ({
        ...acc.toJSON(),
        accountStatus: acc.isSuspended ? 'DEACTIVATED' : acc.status === 'active' ? 'ACTIVE' : 'SUSPENDED'
      }));
      
      console.log(`[MISController] Returning ${formattedAccounts.length} formatted accounts`);
      res.json(formattedAccounts);
    } catch (err) {
      console.error('[MISController] Error:', err);
      res.status(500).json({ error: err.message });
    }
  },

  // Disable account
  disableAccount: async (req, res) => {
    try {
      const { id } = req.params;

      const employee = await Employee.findByPk(id);
      if (!employee) return res.status(404).json({ error: 'Account not found' });

      employee.isSuspended = true;
      employee.status = 'terminated'; // Use 'terminated' to represent deactivated state
      await employee.save();

      // Log account disable
      await createAuditLog(req.user.id, req.user.role, `Disabled account for ${employee.fullName} (${employee.employeeId})`);

      res.json({ 
        message: 'Account disabled successfully', 
        account: {
          ...employee.toJSON(),
          accountStatus: 'DEACTIVATED'
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Reactivate account
  reactivateAccount: async (req, res) => {
    try {
      const { id } = req.params;

      const employee = await Employee.findByPk(id);
      if (!employee) return res.status(404).json({ error: 'Account not found' });

      employee.isSuspended = false;
      employee.status = 'active';
      await employee.save();

      // Log account reactivation
      await createAuditLog(req.user.id, req.user.role, `Reactivated account for ${employee.fullName} (${employee.employeeId})`);

      res.json({ 
        message: 'Account reactivated successfully', 
        account: {
          ...employee.toJSON(),
          accountStatus: 'ACTIVE'
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Get system notifications (for MIS dashboard)
  getSystemNotifications: async (req, res) => {
    try {
      // Get all notifications from the system
      const notifications = await Notification.findAll({
        order: [['createdAt', 'DESC']],
        limit: 100 // Limit to last 100 notifications
      });
      
      res.json(notifications);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Create system notification (for testing or manual alerts)
  createSystemNotification: async (req, res) => {
    try {
      const { message, userId, type, category, priority } = req.body;
      
      const notification = await Notification.create({
        message,
        userId: userId || null, // Can be null for system-wide notifications
        type: type || 'system',
        category: category || 'system',
        priority: priority || 'medium',
        read: false
      });

      // Emit socket event for real-time update
      const io = req.app.get('io');
      if (io) {
        io.emit('mis:notification', notification);
      }

      // Log notification creation
      await createAuditLog(req.user.id, req.user.role, `Created system notification: ${message}`);

      res.json({ message: 'Notification created successfully', notification });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Mark notification as read
  markNotificationRead: async (req, res) => {
    try {
      const { id } = req.params;
      
      const notification = await Notification.findByPk(id);
      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      notification.read = true;
      await notification.save();

      res.json({ message: 'Notification marked as read', notification });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Delete notification
  deleteNotification: async (req, res) => {
    try {
      const { id } = req.params;
      
      const notification = await Notification.findByPk(id);
      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      await notification.destroy();

      res.json({ message: 'Notification deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Reset password for any account (MIS only)
  resetPassword: async (req, res) => {
    try {
      console.log('Password reset request received for account ID:', req.params.id);
      console.log('Request body:', req.body);
      
      const { id } = req.params;
      const { newPassword } = req.body;

      if (!newPassword) {
        console.log('Error: New password is missing');
        return res.status(400).json({ error: 'New password is required' });
      }

      if (newPassword.length < 8) {
        console.log('Error: Password too short');
        return res.status(400).json({ error: 'Password must be at least 8 characters long' });
      }

      const employee = await Employee.findByPk(id);
      if (!employee) {
        console.log('Error: Employee not found');
        return res.status(404).json({ error: 'Account not found' });
      }

      console.log('Found employee:', employee.fullName, employee.email);
      console.log('Old password hash:', employee.password.substring(0, 20) + '...');

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      console.log('New password hash:', hashedPassword.substring(0, 20) + '...');
      
      employee.password = hashedPassword;
      await employee.save();
      
      console.log('Password updated successfully in database');

      // Create notification for the user
      await Notification.create({
        userId: employee.id,
        message: `Your password was changed by MIS Administrator. If you did not request this change, please contact the administrator immediately.`,
        read: false
      });
      
      console.log('Notification sent to user');

      // Emit socket event for real-time notification
      const io = req.app.get('io');
      if (io) {
        io.emit('notification', {
          userId: employee.id,
          message: `Your password was changed by MIS Administrator`,
          timestamp: new Date()
        });
      }

      // Log password reset
      await createAuditLog(
        req.user.id, 
        req.user.role, 
        `Reset password for ${employee.fullName} (${employee.employeeId})`
      );

      res.json({ 
        message: 'Password reset successfully',
        account: {
          id: employee.id,
          fullName: employee.fullName,
          email: employee.email
        }
      });
    } catch (err) {
      console.error('Password reset error:', err);
      res.status(500).json({ error: err.message });
    }
  }
};