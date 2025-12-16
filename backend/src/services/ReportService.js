const Employee = require('../models/Employee');
const Contract = require('../models/Contract');
const Document = require('../models/Document');
const Leave = require('../models/Leave');

async function generateReport(type) {
  switch (type) {
    case 'contracts':
      return await Contract.findAll();
    case 'leaves':
      return await Leave.findAll();
    case 'documents':
      return await Document.findAll();
    default:
      throw new Error('Invalid report type');
  }
}

module.exports = { generateReport };