const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Contract = sequelize.define('Contract', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employeeId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  contractType: {
    type: DataTypes.ENUM('permanent', 'contractual', 'part-time', 'job-order'),
    allowNull: false,
    comment: 'Employment contract type'
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Position type or contract title'
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Null for permanent contracts'
  },
  status: {
    type: DataTypes.ENUM('Active', 'Expired', 'Terminated'),
    defaultValue: 'Active'
  },
  position: {
    type: DataTypes.STRING,
    allowNull: true
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true
  },
  salary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  renewalCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of times contract has been renewed'
  },
  previousContractId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Reference to previous contract if this is a renewal'
  },
  terminationReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  workSchedule: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Work schedule for part-time employees'
  },
  projectDetails: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Project details for job-order contracts'
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Path to contract PDF file'
  }
}, {
  timestamps: true
});

module.exports = Contract;