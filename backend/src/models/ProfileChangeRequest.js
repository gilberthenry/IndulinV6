const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ProfileChangeRequest = sequelize.define('ProfileChangeRequest', {
  employeeId: { type: DataTypes.INTEGER, allowNull: false },
  reviewedBy: { type: DataTypes.INTEGER, allowNull: true },
  status: { type: DataTypes.ENUM('pending','approved','rejected'), defaultValue: 'pending' },
  changes: { type: DataTypes.JSON, allowNull: true },
  remarks: { type: DataTypes.TEXT, allowNull: true },
}, { timestamps: true });

module.exports = ProfileChangeRequest;
