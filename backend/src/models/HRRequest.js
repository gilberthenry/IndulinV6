const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const HRRequest = sequelize.define('HRRequest', {
  requestedBy: { type: DataTypes.INTEGER, allowNull: false },
  targetEmployeeId: { type: DataTypes.INTEGER, allowNull: true },
  assignedTo: { type: DataTypes.INTEGER, allowNull: true },
  reviewedBy: { type: DataTypes.INTEGER, allowNull: true },
  type: { type: DataTypes.STRING, allowNull: true },
  details: { type: DataTypes.JSON, allowNull: true },
  status: { type: DataTypes.ENUM('open','assigned','approved','rejected','closed'), defaultValue: 'open' },
}, { timestamps: true });

module.exports = HRRequest;
