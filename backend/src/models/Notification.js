const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Notification = sequelize.define('Notification', {
  message: { type: DataTypes.STRING, allowNull: false },
  time: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  read: { type: DataTypes.BOOLEAN, defaultValue: false },
  archived: { type: DataTypes.BOOLEAN, defaultValue: false },
  userId: { type: DataTypes.INTEGER, allowNull: false }, // link to Employee
}, { timestamps: true });

module.exports = Notification;
