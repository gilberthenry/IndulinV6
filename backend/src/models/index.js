const sequelize = require('../config/db');
const Employee = require('./Employee');
const Contract = require('./Contract');
const Document = require('./Document');
const Leave = require('./Leave');
const LeaveCredit = require('./LeaveCredit');
const AuditLog = require('./AuditLog');
const Certificate = require('./Certificate');
const Department = require('./Department');
const Designation = require('./Designation');
const Notification = require('./Notification');
const ProfileChangeRequest = require('./ProfileChangeRequest');
const HRRequest = require('./HRRequest');

// Associations
Contract.belongsTo(Employee, { foreignKey: 'employeeId' });
Employee.hasMany(Contract, { foreignKey: 'employeeId' });

Document.belongsTo(Employee, { foreignKey: 'employeeId' });
Employee.hasMany(Document, { foreignKey: 'employeeId' });
Document.belongsTo(Employee, { as: 'Processor', foreignKey: 'processedBy' });

Leave.belongsTo(Employee, { foreignKey: 'employeeId' });
Employee.hasMany(Leave, { foreignKey: 'employeeId' });

LeaveCredit.belongsTo(Employee, { foreignKey: 'employeeId' });
Employee.hasMany(LeaveCredit, { foreignKey: 'employeeId' });

AuditLog.belongsTo(Employee, { foreignKey: 'userId' });
Employee.hasMany(AuditLog, { foreignKey: 'userId' });

Certificate.belongsTo(Employee, { foreignKey: 'employeeId' });
Employee.hasMany(Certificate, { foreignKey: 'employeeId' });

ProfileChangeRequest.belongsTo(Employee, { as: 'employee', foreignKey: 'employeeId' });
ProfileChangeRequest.belongsTo(Employee, { as: 'reviewer', foreignKey: 'reviewedBy' });
Employee.hasMany(ProfileChangeRequest, { foreignKey: 'employeeId' });

// HRRequest associations
HRRequest.belongsTo(Employee, { as: 'Requester', foreignKey: 'requestedBy' });
HRRequest.belongsTo(Employee, { as: 'TargetEmployee', foreignKey: 'targetEmployeeId' });
HRRequest.belongsTo(Employee, { as: 'AssignedMIS', foreignKey: 'assignedTo' });
HRRequest.belongsTo(Employee, { as: 'Reviewer', foreignKey: 'reviewedBy' });
Employee.hasMany(HRRequest, { foreignKey: 'requestedBy' });

// Department and Designation associations
Designation.belongsTo(Department, { foreignKey: 'departmentId' });
Department.hasMany(Designation, { foreignKey: 'departmentId' });

module.exports = { 
  sequelize,
  Employee, 
  Contract, 
  Document, 
  Leave,
  LeaveCredit, 
  AuditLog, 
  Certificate,
  Department,
  Designation,
  Notification,
  ProfileChangeRequest,
  HRRequest
};