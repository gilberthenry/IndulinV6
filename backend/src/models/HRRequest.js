const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const HRRequest = sequelize.define('HRRequest', {
  requestedBy: { type: DataTypes.INTEGER, allowNull: false },
  targetEmployeeId: { type: DataTypes.INTEGER, allowNull: true },
  assignedTo: { type: DataTypes.INTEGER, allowNull: true },
  reviewedBy: { type: DataTypes.INTEGER, allowNull: true },
  type: { type: DataTypes.STRING, allowNull: true },
  requestType: { type: DataTypes.STRING, allowNull: true },
  title: { type: DataTypes.STRING, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  priority: { type: DataTypes.STRING, defaultValue: 'medium' },
  details: { type: DataTypes.JSON, allowNull: true },
  status: { type: DataTypes.ENUM('open','assigned','approved','rejected','closed','completed'), defaultValue: 'open' },
  completionNote: { type: DataTypes.TEXT, allowNull: true },
  completedAt: { type: DataTypes.DATE, allowNull: true },
}, { timestamps: true });

module.exports = HRRequest;
