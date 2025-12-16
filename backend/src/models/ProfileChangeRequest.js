const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ProfileChangeRequest = sequelize.define('ProfileChangeRequest', {
  employeeId: { type: DataTypes.INTEGER, allowNull: false },
  reviewedBy: { type: DataTypes.INTEGER, allowNull: true },
  status: { type: DataTypes.ENUM('pending','approved','rejected'), defaultValue: 'pending' },
  currentValues: { type: DataTypes.JSON, allowNull: true },
  requestedChanges: { type: DataTypes.JSON, allowNull: true },
  changedFields: { type: DataTypes.JSON, allowNull: true },
  reason: { type: DataTypes.TEXT, allowNull: true },
  remarks: { type: DataTypes.TEXT, allowNull: true },
}, { timestamps: true });

module.exports = ProfileChangeRequest;
