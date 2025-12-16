const { HRRequest } = require('../models');

module.exports = {
  createRequest: async (req, res) => {
    try {
      const payload = req.body || {};
      const created = await HRRequest.create(payload);
      return res.status(201).json(created);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  getMyRequests: async (req, res) => {
    try {
      const userId = req.user?.id || null;
      const items = await HRRequest.findAll({ where: { requestedBy: userId } });
      return res.json(items);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  getMyStats: async (req, res) => {
    try {
      const userId = req.user?.id || null;
      const count = await HRRequest.count({ where: { requestedBy: userId } });
      return res.json({ count });
    } catch (err) {
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
  }
};
