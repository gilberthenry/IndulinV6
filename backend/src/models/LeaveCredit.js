const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const LeaveCredit = sequelize.define('LeaveCredit', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employeeId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  schoolYear: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'e.g., "2024-2025"'
  },
  employmentType: {
    type: DataTypes.ENUM('permanent', 'contractual', 'job-order', 'part-time'),
    allowNull: false
  },
  totalCredits: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Total leave credits allocated for the school year'
  },
  usedCredits: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Leave credits used in this school year'
  },
  carriedOverCredits: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Unused credits carried over from previous school year'
  },
  monetizableCredits: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Credits that can be monetized'
  },
  forfeitedCredits: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Credits that were forfeited (expired)'
  },
  remainingCredits: {
    type: DataTypes.VIRTUAL,
    get() {
      return parseFloat(this.totalCredits) + parseFloat(this.carriedOverCredits) - parseFloat(this.usedCredits);
    }
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['employeeId', 'schoolYear']
    }
  ]
});

module.exports = LeaveCredit;
