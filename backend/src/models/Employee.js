const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Employee = sequelize.define('Employee', {
  employeeId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  surname: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  middleName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  contactNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  profileImage: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Personal Information (PDS Fields)
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  religion: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  placeOfBirth: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  sex: {
    type: DataTypes.ENUM('Male', 'Female'),
    allowNull: true,
  },
  civilStatus: {
    type: DataTypes.ENUM('Single', 'Married', 'Widowed', 'Separated', 'Annulled'),
    allowNull: true,
  },
  citizenship: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Filipino',
  },
  // Government IDs
  gsisIdNo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  pagibigIdNo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  philhealthNo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  sssNo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  tinNo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bloodType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Address
  residentialAddress: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  residentialZip: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  permanentAddress: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  permanentZip: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  contractNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Emergency Contact
  emergencyContactName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  emergencyContactNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  emergencyContactRelationship: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  emergencyContactAddress: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Family Background
  spouseName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  spouseContactNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  spouseOccupation: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  spouseAddress: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  fatherName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  motherName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  children: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  // Education, Work & Other complex sections stored as JSON arrays/objects
  education: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  eligibility: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  workExperience: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  communityInvolvement: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  learningAndDevelopment: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  trainings: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  otherInformation: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  legalResponses: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  references: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('Active', 'Inactive', 'Terminated', 'On Leave', 'Resigned', 'Retired'),
    defaultValue: 'Active',
    comment: 'Employment status - separate from contract type'
  },
  role: { type: DataTypes.ENUM('employee', 'hr', 'mis'), defaultValue: 'employee' },
  isSuspended: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
});

module.exports = Employee;