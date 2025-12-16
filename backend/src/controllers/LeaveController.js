// src/controllers/LeaveController.js
const Leave = require('../models/Leave');
const Notification = require('../models/Notification');

module.exports = {
  approveLeave: async (req, res) => {
    try {
      const { leaveId } = req.params;
      const leave = await Leave.findByPk(leaveId);
      if (!leave) return res.status(404).json({ error: 'Leave not found' });

      await leave.update({ status: 'approved' });

      // Create notification for employee
      await Notification.create({
        message: `Your leave request (${leave.leaveType}) has been approved.`,
        userId: leave.employeeId,
      });

      res.json({ message: 'Leave approved and notification sent' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
