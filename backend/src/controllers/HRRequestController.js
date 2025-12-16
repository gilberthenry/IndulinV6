const { HRRequest } = require('../models');

module.exports = {
  createRequest: async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      
      const payload = {
        requestedBy: userId,
        targetEmployeeId: req.body.targetEmployeeId || null,
        requestType: req.body.requestType,
        title: req.body.title,
        description: req.body.description,
        priority: req.body.priority || 'medium',
        status: 'open'
      };
      
      const created = await HRRequest.create(payload);
      return res.status(201).json(created);
    } catch (err) {
      console.error('Error in createRequest:', err);
      return res.status(500).json({ error: err.message });
    }
  },
  getMyRequests: async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      
      const items = await HRRequest.findAll({ 
        where: { requestedBy: userId },
        order: [['createdAt', 'DESC']]
      });
      return res.json(items);
    } catch (err) {
      console.error('Error in getMyRequests:', err);
      return res.status(500).json({ error: err.message });
    }
  },
  getMyStats: async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      
      const total = await HRRequest.count({ where: { requestedBy: userId } });
      const pending = await HRRequest.count({ where: { requestedBy: userId, status: 'open' } });
      const approved = await HRRequest.count({ where: { requestedBy: userId, status: 'approved' } });
      const rejected = await HRRequest.count({ where: { requestedBy: userId, status: 'rejected' } });
      
      return res.json({ total, pending, approved, rejected });
    } catch (err) {
      console.error('Error in getMyStats:', err);
      return res.status(500).json({ error: err.message });
    }
  },
  getRequestById: async (req, res) => {
    try {
      const id = req.params.id;
      const reqItem = await HRRequest.findByPk(id);
      if (!reqItem) return res.status(404).json({ error: 'Not found' });
      return res.json(reqItem);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  getAllRequests: async (req, res) => {
    try {
      const items = await HRRequest.findAll();
      return res.json(items);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  getQueueStats: async (req, res) => {
    try {
      const open = await HRRequest.count({ where: { status: 'open' } });
      return res.json({ open });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  assignRequest: async (req, res) => {
    try {
      const id = req.params.id;
      const assignedTo = req.body.assignedTo;
      const item = await HRRequest.findByPk(id);
      if (!item) return res.status(404).json({ error: 'Not found' });
      item.assignedTo = assignedTo;
      item.status = 'assigned';
      await item.save();
      return res.json(item);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  approveRequest: async (req, res) => {
    try {
      const id = req.params.id;
      const item = await HRRequest.findByPk(id);
      if (!item) return res.status(404).json({ error: 'Not found' });
      item.status = 'approved';
      await item.save();
      return res.json(item);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  rejectRequest: async (req, res) => {
    try {
      const id = req.params.id;
      const item = await HRRequest.findByPk(id);
      if (!item) return res.status(404).json({ error: 'Not found' });
      item.status = 'rejected';
      await item.save();
      return res.json(item);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  completeRequest: async (req, res) => {
    try {
      const id = req.params.id;
      const { completionNote } = req.body;
      const userId = req.user?.id;
      
      const item = await HRRequest.findByPk(id);
      if (!item) return res.status(404).json({ error: 'Not found' });
      
      item.status = 'completed';
      item.completionNote = completionNote || null;
      item.completedAt = new Date();
      item.reviewedBy = userId;
      await item.save();
      
      // Create notification for the requesting HR user
      const { Notification } = require('../models');
      await Notification.create({
        recipientId: item.requestedBy,
        title: 'Configuration Request Completed',
        message: `Your request "${item.title}" has been completed by MIS.${completionNote ? ' Note: ' + completionNote : ''}`,
        type: 'info',
        category: 'hr_request',
        relatedId: item.id
      });
      
      return res.json(item);
    } catch (err) {
      console.error('Error in completeRequest:', err);
      return res.status(500).json({ error: err.message });
    }
  }
};
