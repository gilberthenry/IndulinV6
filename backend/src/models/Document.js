const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employeeId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: true  // Changed to true for HR requests
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'Requested'),
    defaultValue: 'Pending'
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  uploadedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  isHRRequested: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  requestedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'HR user ID who requested the document'
  },
  requestReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Reason for requesting the document from employee'
  },
  requestedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  processedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date when document was approved/rejected'
  },
  processedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'HR/MIS user who processed (approved/rejected) the document'
  }
}, {
  timestamps: true
});

module.exports = Document;