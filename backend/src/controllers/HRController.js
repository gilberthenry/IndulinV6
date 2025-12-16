const Employee = require('../models/Employee');
const Contract = require('../models/Contract');
const Certificate = require('../models/Certificate');
const Document = require('../models/Document');
const Leave = require('../models/Leave');
const LeaveCredit = require('../models/LeaveCredit');
const Notification = require('../models/Notification');
const Department = require('../models/Department');
const Designation = require('../models/Designation');
const ProfileChangeRequest = require('../models/ProfileChangeRequest');
const { parseCSV } = require('../services/BulkUploadService');
const { createAuditLog } = require('../middleware/AuditMiddleware');
const { generateReport } = require('../services/ReportService');
const LeaveCreditService = require('../services/LeaveCreditService');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

module.exports = {
  // Get dashboard statistics
  getDashboardStats: async (req, res) => {
    try {
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);

      // Employee statistics
      const totalEmployees = await Employee.count();
      const activeEmployees = await Employee.count({ where: { status: 'active' } });
      const suspendedEmployees = await Employee.count({ where: { isSuspended: true } });
      const newEmployeesThisMonth = await Employee.count({
        where: {
          createdAt: {
            [Op.gte]: new Date(today.getFullYear(), today.getMonth(), 1)
          }
        }
      });

      // Contract statistics
      const totalContracts = await Contract.count();
      const activeContracts = await Contract.count({ where: { status: 'Active' } });
      const expiringContracts = await Contract.count({
        where: {
          status: 'Active',
          endDate: {
            [Op.between]: [today, thirtyDaysFromNow]
          }
        }
      });
      const contractsByType = await Contract.findAll({
        attributes: [
          'contractType',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
        ],
        where: { status: 'Active' },
        group: ['contractType'],
        raw: true
      });

      // Leave statistics
      const totalLeaves = await Leave.count();
      const pendingLeaves = await Leave.count({ where: { status: 'Pending' } });
      const approvedLeaves = await Leave.count({ where: { status: 'Approved' } });
      const rejectedLeaves = await Leave.count({ where: { status: 'Rejected' } });
      const leavesThisMonth = await Leave.count({
        where: {
          createdAt: {
            [Op.gte]: new Date(today.getFullYear(), today.getMonth(), 1)
          }
        }
      });

      // Document statistics
      const totalDocuments = await Document.count();
      const pendingDocuments = await Document.count({ where: { status: 'Pending' } });
      const verifiedDocuments = await Document.count({ where: { status: 'Approved' } });

      // Certificate statistics
      const totalCertificates = await Certificate.count();
      const pendingCertificates = await Certificate.count({ where: { status: 'Pending' } });

      // Department statistics
      const departments = await Department.count();
      const employeesByDepartment = await Contract.findAll({
        attributes: [
          'department',
          [require('sequelize').fn('COUNT', require('sequelize').col('Contract.id')), 'count']
        ],
        where: { status: 'Active' },
        group: ['department'],
        raw: true,
        limit: 10
      });

      // Recent activities (last 10 employees added)
      const recentEmployees = await Employee.findAll({
        attributes: ['id', 'employeeId', 'fullName', 'email', 'createdAt'],
        order: [['createdAt', 'DESC']],
        limit: 10
      });

      // Upcoming contract expirations
      const upcomingExpirations = await Contract.findAll({
        where: {
          status: 'Active',
          endDate: {
            [Op.between]: [today, thirtyDaysFromNow]
          }
        },
        include: [{
          model: Employee,
          attributes: ['id', 'employeeId', 'fullName']
        }],
        order: [['endDate', 'ASC']],
        limit: 10
      });

      // Recent leave requests
      const recentLeaves = await Leave.findAll({
        include: [{
          model: Employee,
          attributes: ['id', 'employeeId', 'fullName']
        }],
        order: [['createdAt', 'DESC']],
        limit: 10
      });

      res.json({
        employees: {
          total: totalEmployees,
          active: activeEmployees,
          suspended: suspendedEmployees,
          newThisMonth: newEmployeesThisMonth
        },
        contracts: {
          total: totalContracts,
          active: activeContracts,
          expiring: expiringContracts,
          byType: contractsByType
        },
        leaves: {
          total: totalLeaves,
          pending: pendingLeaves,
          approved: approvedLeaves,
          rejected: rejectedLeaves,
          thisMonth: leavesThisMonth
        },
        documents: {
          total: totalDocuments,
          pending: pendingDocuments,
          verified: verifiedDocuments
        },
        certificates: {
          total: totalCertificates,
          pending: pendingCertificates
        },
        departments: {
          total: departments,
          byDepartment: employeesByDepartment
        },
        recentActivities: {
          employees: recentEmployees,
          expiringContracts: upcomingExpirations,
          leaveRequests: recentLeaves
        }
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      res.status(500).json({ error: err.message });
    }
  },

  // List all employees with filters
  getEmployees: async (req, res) => {
    try {
      const { status, search, role } = req.query;
      const where = {
        // Ensure required fields are not null or empty
        employeeId: { [Op.ne]: null, [Op.ne]: '' },
        fullName: { [Op.ne]: null, [Op.ne]: '' },
        email: { [Op.ne]: null, [Op.ne]: '' }
      };
      
      if (status) where.status = status;
      if (role) where.role = role;
      
      if (search) {
        where[Op.or] = [
          { employeeId: { [Op.like]: `%${search}%` } },
          { fullName: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ];
      }
      
      const employees = await Employee.findAll({
        where,
        attributes: ['id', 'employeeId', 'fullName', 'email', 'contactNumber', 'status', 'role', 'isSuspended', 'createdAt', 'profileImage'],
        include: [{
          model: Contract,
          where: { status: 'Active' },
          required: false,
          attributes: ['id', 'contractType', 'position', 'department', 'startDate', 'endDate', 'status']
        }],
        order: [['createdAt', 'DESC']]
      });
      
      // Additional filter to exclude any incomplete records that might have passed
      const validEmployees = employees.filter(emp => 
        emp.employeeId && emp.employeeId.trim() !== '' &&
        emp.fullName && emp.fullName.trim() !== '' &&
        emp.email && emp.email.trim() !== ''
      );
      
      res.json(validEmployees);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Get single employee details
  getEmployeeById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const employee = await Employee.findByPk(id, {
        include: [
          {
            model: Contract,
            as: 'Contracts',
            attributes: ['id', 'contractType', 'type', 'position', 'department', 'startDate', 'endDate', 'status', 'terminationReason', 'salary', 'renewalCount']
          }
        ]
      });
      
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      
      res.json(employee);
    } catch (err) {
      console.error('Error fetching employee:', err);
      res.status(500).json({ error: err.message });
    }
  },

  // Update employee information
  updateEmployee: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Find employee
      const employee = await Employee.findByPk(id);
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      // Remove fields that shouldn't be updated directly
      delete updateData.id;
      delete updateData.password;
      delete updateData.role;
      delete updateData.employeeId;
      delete updateData.profileImage;
      delete updateData.createdAt;
      delete updateData.updatedAt;

      // Update employee
      await employee.update(updateData);

      // Create audit log
      await createAuditLog(
        req.user.id,
        'UPDATE',
        'Employee',
        id,
        { updatedFields: Object.keys(updateData) },
        `Employee ${employee.fullName} information updated by HR`
      );

      // Fetch updated employee with associations
      const updatedEmployee = await Employee.findByPk(id, {
        include: [
          {
            model: Contract,
            as: 'Contracts',
            attributes: ['id', 'contractType', 'type', 'position', 'department', 'startDate', 'endDate', 'status', 'terminationReason', 'salary', 'renewalCount']
          }
        ]
      });

      res.json({
        message: 'Employee information updated successfully',
        employee: updatedEmployee
      });
    } catch (err) {
      console.error('Error updating employee:', err);
      res.status(500).json({ error: err.message });
    }
  },

  // Create a new employee
  createEmployee: async (req, res) => {
    const bcrypt = require('bcrypt');
    try {
      const { employeeId, fullName, email, password, contactNumber, role, contract } = req.body;

      // Validate required fields
      if (!employeeId || !fullName || !email || !password) {
        return res.status(400).json({ error: 'Employee ID, full name, email, and password are required' });
      }

      // Check if employee ID already exists
      const existingEmployeeId = await Employee.findOne({ where: { employeeId } });
      if (existingEmployeeId) {
        return res.status(400).json({ error: 'Employee ID already exists' });
      }

      // Check if email already exists
      const existingEmail = await Employee.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create employee
      const employee = await Employee.create({
        employeeId,
        fullName,
        email,
        password: hashedPassword,
        contactNumber: contactNumber || null,
        role: role || 'employee',
        status: 'Active',
        isSuspended: false
      });

      // Create contract if provided
      if (contract) {
        await Contract.create({
          employeeId: employee.id,
          contractType: contract.contractType,
          position: contract.position,
          department: contract.department,
          startDate: contract.startDate,
          endDate: contract.endDate || null,
          status: 'Active'
        });
        
        // Employee status remains 'Active' - contract type is separate
      }

      // Log employee creation
      await createAuditLog(req.user.id, req.user.role, `Created new employee: ${fullName} (ID: ${employeeId})`);

      res.status(201).json({ 
        message: 'Employee created successfully', 
        employee: {
          id: employee.id,
          employeeId: employee.employeeId,
          fullName: employee.fullName,
          email: employee.email,
          role: employee.role
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Bulk upload employees via CSV/Excel
  bulkUpload: async (req, res) => {
    try {
      const employees = await parseCSV(req.file.path);
      const saved = await Employee.bulkCreate(employees, { validate: true });
      res.status(201).json({ message: 'Bulk upload successful', count: saved.length });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  previewBulkUpload: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const csv = require('csv-parser');
      const results = [];
      const errors = [];
      let rowNumber = 0;

      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => {
          rowNumber++;
          const employee = {
            fullName: data.fullName || data.name || '',
            email: data.email || '',
            employeeId: data.employeeId || data.employee_id || '',
            contactNumber: data.contactNumber || data.contact || '',
            department: data.department || '',
            position: data.position || '',
            dateOfBirth: data.dateOfBirth || data.birthday || '',
            gender: data.gender || '',
            address: data.address || '',
            city: data.city || '',
            province: data.province || '',
            zipCode: data.zipCode || data.zip || '',
            civilStatus: data.civilStatus || data.civil_status || '',
            sss: data.sss || '',
            philhealth: data.philhealth || '',
            pagibig: data.pagibig || '',
            tin: data.tin || '',
            emergencyContact: data.emergencyContact || data.emergency_contact || '',
            contractType: data.contractType || data.contract_type || '',
            contractStartDate: data.contractStartDate || data.contract_start || '',
            contractEndDate: data.contractEndDate || data.contract_end || '',
            salary: data.salary || '',
            hasError: false
          };

          if (!employee.fullName) {
            errors.push(`Row ${rowNumber}: Full name is required`);
            employee.hasError = true;
          }
          if (!employee.email) {
            errors.push(`Row ${rowNumber}: Email is required`);
            employee.hasError = true;
          }
          if (!employee.employeeId) {
            errors.push(`Row ${rowNumber}: Employee ID is required`);
            employee.hasError = true;
          }

          results.push(employee);
        })
        .on('end', () => {
          fs.unlinkSync(req.file.path);
          res.json({ data: results, errors: errors, totalRows: results.length });
        })
        .on('error', (error) => {
          res.status(500).json({ error: 'Failed to parse CSV file: ' + error.message });
        });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  confirmBulkUpload: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const csv = require('csv-parser');
      const bcrypt = require('bcryptjs');
      const results = [];
      const errors = [];
      let rowNumber = 0;
      let successCount = 0;
      const autoCreateContracts = req.body.autoCreateContracts === 'true';

      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => {
          rowNumber++;
          results.push({ row: rowNumber, data: data });
        })
        .on('end', async () => {
          fs.unlinkSync(req.file.path);

          for (const item of results) {
            try {
              const data = item.data;
              const employeeData = {
                fullName: data.fullName || data.name || '',
                email: data.email || '',
                employeeId: data.employeeId || data.employee_id || '',
                contactNumber: data.contactNumber || data.contact || '',
                department: data.department || '',
                position: data.position || '',
                dateOfBirth: data.dateOfBirth || data.birthday || null,
                gender: data.gender || null,
                address: data.address || '',
                city: data.city || '',
                province: data.province || '',
                zipCode: data.zipCode || data.zip || '',
                civilStatus: data.civilStatus || data.civil_status || null,
                sss: data.sss || '',
                philhealth: data.philhealth || '',
                pagibig: data.pagibig || '',
                tin: data.tin || '',
                emergencyContact: data.emergencyContact || data.emergency_contact || '',
                password: await bcrypt.hash('password123', 10),
                role: 'employee',
                status: 'active'
              };

              if (!employeeData.fullName || !employeeData.email || !employeeData.employeeId) {
                errors.push(`Row ${item.row}: Missing required fields`);
                continue;
              }

              const existingEmployee = await Employee.findOne({
                where: { [Op.or]: [{ email: employeeData.email }, { employeeId: employeeData.employeeId }] }
              });

              if (existingEmployee) {
                errors.push(`Row ${item.row}: Employee already exists`);
                continue;
              }

              const employee = await Employee.create(employeeData);
              successCount++;

              if (autoCreateContracts && data.contractType) {
                await Contract.create({
                  employeeId: employee.id,
                  contractType: data.contractType || data.contract_type,
                  startDate: data.contractStartDate || data.contract_start || new Date(),
                  endDate: data.contractEndDate || data.contract_end || null,
                  position: data.position || '',
                  department: data.department || '',
                  salary: data.salary || null,
                  status: 'Active'
                });
              }
            } catch (error) {
              errors.push(`Row ${item.row}: ${error.message}`);
            }
          }

          res.json({ success: true, successCount, errors, message: `Successfully imported ${successCount} employee(s)` });
        })
        .on('error', (error) => {
          res.status(500).json({ error: 'Failed to parse CSV file: ' + error.message });
        });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  downloadEmployeeTemplate: async (req, res) => {
    try {
      const headers = ['fullName','email','employeeId','contactNumber','dateOfBirth','gender','civilStatus','address','city','province','zipCode','emergencyContact','sss','philhealth','pagibig','tin','department','position','contractType','contractStartDate','contractEndDate','salary'];
      const sampleData = ['DELA CRUZ, JUAN PEDRO','juan.delacruz@company.com','EMP-2024-001','09123456789','1990-01-15','Male','Single','123 Main St, Brgy. Sample','Manila','Metro Manila','1000','09987654321','12-3456789-0','12-345678901-2','1234-567890-123','12-3456789-0123','IT Department','Software Developer','permanent','2024-01-01','','30000'];
      const csvContent = [headers.join(','), sampleData.join(','), headers.map(() => '').join(',')].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=employee_bulk_upload_template.csv');
      res.send(csvContent);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Contract management
  listContracts: async (req, res) => {
    try {
      const { status, contractType, department, search } = req.query;
      const where = {};
      const includeOptions = {
        model: Employee,
        attributes: ['id', 'employeeId', 'fullName', 'email']
      };
      
      // Only add filters if they have a value (not empty string)
      if (status && status.trim() !== '') {
        where.status = status;
      }
      if (contractType && contractType.trim() !== '') {
        where.contractType = contractType;
      }
      if (department && department.trim() !== '') {
        where.department = { [Op.like]: `%${department}%` };
      }
      
      // Add search filter for employee name or ID
      if (search && search.trim() !== '') {
        includeOptions.where = {
          [Op.or]: [
            { fullName: { [Op.like]: `%${search}%` } },
            { employeeId: { [Op.like]: `%${search}%` } }
          ]
        };
        includeOptions.required = true; // Inner join when searching
      }
      
      const contracts = await Contract.findAll({ 
        where,
        include: [includeOptions],
        order: [
          ['endDate', 'ASC NULLS LAST'],
          ['createdAt', 'DESC']
        ] 
      });
      res.json(contracts);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  createContract: async (req, res) => {
    try {
      const { 
        employeeId, 
        contractType, 
        type, 
        startDate, 
        endDate, 
        position, 
        department,
        workSchedule,
        projectDetails
      } = req.body;

      // Validation based on contract type
      if (contractType === 'permanent' && endDate) {
        return res.status(400).json({ error: 'Permanent contracts should not have an end date' });
      }
      
      if (['contractual', 'part-time', 'job-order'].includes(contractType) && !endDate) {
        return res.status(400).json({ error: `${contractType} contracts must have an end date` });
      }

      // Check if employee exists
      const employee = await Employee.findByPk(employeeId);
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      // Terminate any existing active contracts for this employee
      await Contract.update(
        { status: 'Terminated', terminationReason: 'New contract created' },
        { 
          where: { 
            employeeId, 
            status: 'Active' 
          } 
        }
      );

      // Create new contract
      const contract = await Contract.create({
        employeeId,
        contractType,
        type,
        startDate,
        endDate,
        position,
        department,
        workSchedule: contractType === 'part-time' ? workSchedule : null,
        projectDetails: contractType === 'job-order' ? projectDetails : null,
        status: 'Active'
      });

      // Employee status is independent of contract type
      // Contract type is stored in the Contract record

      // Log contract creation
      await createAuditLog(req.user.id, req.user.role, `Created ${contractType} contract for employee ${employee.fullName} (ID: ${employee.employeeId})`);

      res.status(201).json({ 
        message: 'Contract created successfully', 
        contract 
      });
    } catch (err) {
      console.error('Error creating contract:', err);
      res.status(400).json({ error: err.message });
    }
  },

  renewContract: async (req, res) => {
    try {
      const { id } = req.params;
      const { startDate, endDate, workSchedule, projectDetails } = req.body;

      const oldContract = await Contract.findByPk(id);
      if (!oldContract) {
        return res.status(404).json({ error: 'Contract not found' });
      }

      if (oldContract.contractType === 'permanent') {
        return res.status(400).json({ error: 'Permanent contracts cannot be renewed' });
      }

      if (oldContract.status !== 'Active' && oldContract.status !== 'Expired') {
        return res.status(400).json({ error: 'Only active or expired contracts can be renewed' });
      }

      // Mark old contract as terminated
      await oldContract.update({ 
        status: 'Terminated',
        terminationReason: 'Contract renewed'
      });

      // Create new contract
      const newContract = await Contract.create({
        employeeId: oldContract.employeeId,
        contractType: oldContract.contractType,
        type: oldContract.type,
        position: oldContract.position,
        department: oldContract.department,
        startDate: startDate || new Date(),
        endDate,
        workSchedule: workSchedule || oldContract.workSchedule,
        projectDetails: projectDetails || oldContract.projectDetails,
        renewalCount: oldContract.renewalCount + 1,
        previousContractId: oldContract.id,
        status: 'Active'
      });

      res.json({ 
        message: 'Contract renewed successfully', 
        contract: newContract 
      });
    } catch (err) {
      console.error('Error renewing contract:', err);
      res.status(400).json({ error: err.message });
    }
  },

  terminateContract: async (req, res) => {
    try {
      const { id } = req.params;
      const { terminationReason } = req.body;

      const contract = await Contract.findByPk(id);
      if (!contract) {
        return res.status(404).json({ error: 'Contract not found' });
      }

      if (contract.status !== 'Active') {
        return res.status(400).json({ error: 'Only active contracts can be terminated' });
      }

      await contract.update({ 
        status: 'Terminated',
        terminationReason: terminationReason || 'Terminated by HR'
      });

      // Update employee status when contract is terminated
      const employee = await Employee.findByPk(contract.employeeId);
      await employee.update({ status: 'Terminated' });

      // Log contract termination
      await createAuditLog(req.user.id, req.user.role, `Terminated contract for employee ${employee.fullName} (ID: ${employee.employeeId}). Reason: ${terminationReason || 'Not specified'}`);

      res.json({ 
        message: 'Contract terminated successfully', 
        contract 
      });
    } catch (err) {
      console.error('Error terminating contract:', err);
      res.status(500).json({ error: err.message });
    }
  },

  getExpiringContracts: async (req, res) => {
    try {
      const { days = 30 } = req.query; // Default to 30 days
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + parseInt(days));

      const expiringContracts = await Contract.findAll({
        where: {
          status: 'Active',
          endDate: {
            [Op.between]: [today, futureDate]
          }
        },
        include: [{
          model: Employee,
          attributes: ['id', 'employeeId', 'fullName', 'email']
        }],
        order: [['endDate', 'ASC']]
      });

      res.json(expiringContracts);
    } catch (err) {
      console.error('Error fetching expiring contracts:', err);
      res.status(500).json({ error: err.message });
    }
  },

  updateContract: async (req, res) => {
    try {
      const { id } = req.params;
      const contract = await Contract.findByPk(id);
      if (!contract) return res.status(404).json({ error: 'Contract not found' });

      await contract.update(req.body);
      res.json({ message: 'Contract updated successfully', contract });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  // Reports (contracts, leaves, documents)
  contractReport: async (req, res) => {
    try {
      const contracts = await Contract.findAll({
        include: [{
          model: Employee,
          attributes: ['id', 'employeeId', 'fullName', 'email']
        }],
        order: [['createdAt', 'DESC']]
      });
      res.json(contracts);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  leaveReport: async (req, res) => {
    try {
      const leaves = await Leave.findAll({
        include: [{
          model: Employee,
          attributes: ['id', 'employeeId', 'fullName', 'email']
        }],
        order: [['startDate', 'DESC']]
      });
      res.json(leaves);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  documentReport: async (req, res) => {
    try {
      const documents = await Document.findAll({
        include: [{
          model: Employee,
          attributes: ['id', 'employeeId', 'fullName', 'email']
        }],
        order: [['uploadedAt', 'DESC']]
      });
      res.json(documents);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Certificate management
  getCertificateRequests: async (req, res) => {
    try {
      const requests = await Certificate.findAll({
        include: [{
          model: Employee,
          attributes: ['id', 'employeeId', 'fullName', 'email']
        }],
        order: [['requestedAt', 'DESC']]
      });
      res.json(requests);
    } catch (err) {
      console.error('Error fetching certificate requests:', err);
      res.status(500).json({ error: err.message });
    }
  },

  approveCertificate: async (req, res) => {
    try {
      const { id } = req.params;
      const certificate = await Certificate.findByPk(id);
      
      if (!certificate) {
        return res.status(404).json({ error: 'Certificate request not found' });
      }

      await certificate.update({
        status: 'Approved',
        processedAt: new Date(),
        processedBy: req.user.id
      });

      // Create notification for employee
      await Notification.create({
        message: `Your certificate request for "${certificate.certificateType}" has been approved.`,
        userId: certificate.employeeId,
      });

      res.json({ message: 'Certificate request approved', certificate });
    } catch (err) {
      console.error('Error approving certificate:', err);
      res.status(500).json({ error: err.message });
    }
  },

  rejectCertificate: async (req, res) => {
    try {
      const { id } = req.params;
      const { remarks } = req.body;
      const certificate = await Certificate.findByPk(id);
      
      if (!certificate) {
        return res.status(404).json({ error: 'Certificate request not found' });
      }

      await certificate.update({
        status: 'Rejected',
        processedAt: new Date(),
        processedBy: req.user.id,
        remarks
      });

      // Create notification for employee
      await Notification.create({
        message: `Your certificate request for "${certificate.certificateType}" has been rejected. ${remarks ? 'Reason: ' + remarks : ''}`,
        userId: certificate.employeeId,
      });

      res.json({ message: 'Certificate request rejected', certificate });
    } catch (err) {
      console.error('Error rejecting certificate:', err);
      res.status(500).json({ error: err.message });
    }
  },

  uploadCertificateFile: async (req, res) => {
    try {
      const { id } = req.params;
      const certificate = await Certificate.findByPk(id);
      
      if (!certificate) {
        return res.status(404).json({ error: 'Certificate request not found' });
      }

      if (certificate.status !== 'Approved') {
        return res.status(400).json({ error: 'Certificate must be approved first' });
      }

      const filePath = req.file.path;
      await certificate.update({ filePath });

      res.json({ message: 'Certificate file uploaded', certificate });
    } catch (err) {
      console.error('Error uploading certificate file:', err);
      res.status(500).json({ error: err.message });
    }
  },

  // Document management
  getDocuments: async (req, res) => {
    try {
      const documents = await Document.findAll({
        include: [
          {
            model: Employee,
            as: 'Employee',
            attributes: ['id', 'employeeId', 'fullName', 'email']
          },
          {
            model: Employee,
            as: 'Processor',
            foreignKey: 'processedBy',
            attributes: ['id', 'fullName', 'role'],
            required: false
          }
        ],
        order: [['uploadedAt', 'DESC']]
      });
      res.json(documents);
    } catch (err) {
      console.error('Error fetching documents:', err);
      res.status(500).json({ error: err.message });
    }
  },

  viewDocument: async (req, res) => {
    try {
      const { id } = req.params;
      const document = await Document.findByPk(id);
      
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      const filePath = path.resolve(document.filePath);
      
      if (!fs.existsSync(filePath)) {
        console.error('File not found at path:', filePath);
        return res.status(404).json({ error: 'File not found' });
      }

      // Get file extension to determine content type
      const ext = path.extname(filePath).toLowerCase();
      let contentType = 'application/octet-stream';
      
      if (ext === '.pdf') {
        contentType = 'application/pdf';
      } else if (['.jpg', '.jpeg'].includes(ext)) {
        contentType = 'image/jpeg';
      } else if (ext === '.png') {
        contentType = 'image/png';
      } else if (ext === '.doc') {
        contentType = 'application/msword';
      } else if (ext === '.docx') {
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      }

      // Set proper headers for document viewing
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', 'inline');
      
      // Send the file
      res.sendFile(filePath, (err) => {
        if (err) {
          console.error('Error sending file:', err);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Error sending file' });
          }
        }
      });
    } catch (err) {
      console.error('Error viewing document:', err);
      res.status(500).json({ error: err.message });
    }
  },

  approveDocument: async (req, res) => {
    try {
      const { id } = req.params;
      const document = await Document.findByPk(id, {
        include: [{ model: Employee, attributes: ['fullName', 'employeeId'] }]
      });
      
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      await document.update({ 
        status: 'Approved',
        processedAt: new Date(),
        processedBy: req.user.id
      });
      
      // Create notification for employee
      await Notification.create({
        message: `Your ${document.type} document has been approved.`,
        userId: document.employeeId,
      });
      
      // Log document approval
      const auditLog = await createAuditLog(
        req.user.id, 
        req.user.role, 
        `Approved ${document.type} document for ${document.Employee?.fullName || 'Unknown'} (ID: ${document.employeeId})`
      );
      
      // Emit socket event for realtime audit log update
      const io = req.app.get('io');
      if (io) {
        io.emit('auditLog:new', auditLog);
      }
      
      res.json({ message: 'Document approved', document });
    } catch (err) {
      console.error('Error approving document:', err);
      res.status(500).json({ error: err.message });
    }
  },

  rejectDocument: async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const document = await Document.findByPk(id, {
        include: [{ model: Employee, attributes: ['fullName', 'employeeId'] }]
      });
      
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      await document.update({ 
        status: 'Rejected',
        rejectionReason: reason,
        processedAt: new Date(),
        processedBy: req.user.id
      });
      
      // Create notification for employee
      await Notification.create({
        message: `Your ${document.type} document has been rejected. ${reason ? 'Reason: ' + reason : ''}`,
        userId: document.employeeId,
      });
      
      // Log document rejection
      const auditLog = await createAuditLog(
        req.user.id, 
        req.user.role, 
        `Rejected ${document.type} document for ${document.Employee?.fullName || 'Unknown'} (ID: ${document.employeeId}). Reason: ${reason}`
      );
      
      // Emit socket event for realtime audit log update
      const io = req.app.get('io');
      if (io) {
        io.emit('auditLog:new', auditLog);
      }
      
      res.json({ message: 'Document rejected', document });
    } catch (err) {
      console.error('Error rejecting document:', err);
      res.status(500).json({ error: err.message });
    }
  },

  requestDocument: async (req, res) => {
    try {
      const { employeeId, documentType, reason } = req.body;
      
      if (!employeeId || !documentType) {
        return res.status(400).json({ error: 'Employee ID and document type are required' });
      }

      // Check if employee exists
      const employee = await Employee.findOne({ where: { id: employeeId } });
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      // Create document request
      const document = await Document.create({
        employeeId: employeeId,
        type: documentType,
        status: 'Requested',
        isHRRequested: true,
        requestedBy: req.user.id,
        requestReason: reason,
        requestedAt: new Date()
      });

      // Create notification for employee
      await Notification.create({
        message: `HR has requested you to upload: ${documentType}. ${reason ? 'Reason: ' + reason : ''}`,
        userId: employeeId,
      });

      // Log document request
      const auditLog = await createAuditLog(
        req.user.id,
        req.user.role,
        `Requested ${documentType} from ${employee.fullName} (ID: ${employee.employeeId})`
      );

      // Emit socket event
      const io = req.app.get('io');
      if (io) {
        io.emit('auditLog:new', auditLog);
        io.emit('document:requested', { employeeId, document });
      }

      res.json({ message: 'Document request sent successfully', document });
    } catch (err) {
      console.error('Error requesting document:', err);
      res.status(500).json({ error: err.message });
    }
  },

  // Leave management
  getLeaves: async (req, res) => {
    try {
      const { status, employeeId, startDate, endDate, type } = req.query;
      const where = {};
      
      if (status) where.status = status;
      if (employeeId) where.employeeId = employeeId;
      if (type) where.type = type;
      
      if (startDate || endDate) {
        where.startDate = {};
        if (startDate) where.startDate[Op.gte] = new Date(startDate);
        if (endDate) where.startDate[Op.lte] = new Date(endDate);
      }
      
      const leaves = await Leave.findAll({
        where,
        include: [{
          model: Employee,
          attributes: ['id', 'employeeId', 'fullName', 'email', 'contactNumber']
        }],
        order: [['startDate', 'DESC']]
      });
      
      res.json(leaves);
    } catch (err) {
      console.error('Error fetching leaves:', err);
      res.status(500).json({ error: err.message });
    }
  },

  getLeaveCalendar: async (req, res) => {
    try {
      const { month, year } = req.query;
      const currentDate = new Date();
      const targetYear = year ? parseInt(year) : currentDate.getFullYear();
      const targetMonth = month ? parseInt(month) - 1 : currentDate.getMonth();
      
      // Get first and last day of the month
      const firstDay = new Date(targetYear, targetMonth, 1);
      const lastDay = new Date(targetYear, targetMonth + 1, 0);
      
      const leaves = await Leave.findAll({
        where: {
          [Op.or]: [
            {
              startDate: {
                [Op.between]: [firstDay, lastDay]
              }
            },
            {
              endDate: {
                [Op.between]: [firstDay, lastDay]
              }
            },
            {
              [Op.and]: [
                { startDate: { [Op.lte]: firstDay } },
                { endDate: { [Op.gte]: lastDay } }
              ]
            }
          ]
        },
        include: [{
          model: Employee,
          attributes: ['id', 'employeeId', 'fullName', 'email', 'contactNumber']
        }],
        order: [['startDate', 'ASC']]
      });
      
      res.json({
        month: targetMonth + 1,
        year: targetYear,
        leaves
      });
    } catch (err) {
      console.error('Error fetching leave calendar:', err);
      res.status(500).json({ error: err.message });
    }
  },

  createLeave: async (req, res) => {
    try {
      const { employeeId, type, startDate, endDate, reason, schoolYear } = req.body;
      
      // Validate required fields
      if (!employeeId || !type || !startDate || !endDate) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Check if employee exists
      const employee = await Employee.findByPk(employeeId);
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      // Calculate days
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      // Determine school year
      const sy = schoolYear || (() => {
        const year = start.getFullYear();
        const month = start.getMonth() + 1;
        return month >= 6 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
      })();
      
      // Create leave
      const leave = await Leave.create({
        employeeId,
        type,
        startDate,
        endDate,
        reason,
        schoolYear: sy,
        daysCount,
        status: 'Approved' // HR creates leave directly as approved
      });

      // Update leave credits
      try {
        await LeaveCreditService.updateCreditsOnLeaveApproval(leave.id);
      } catch (creditError) {
        console.error('Error updating leave credits:', creditError);
      }
      
      // Create notification for employee
      await Notification.create({
        message: `A leave (${type}) has been set for you from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}.`,
        userId: employeeId,
      });
      
      const leaveWithEmployee = await Leave.findByPk(leave.id, {
        include: [{
          model: Employee,
          attributes: ['id', 'employeeId', 'fullName', 'email']
        }]
      });
      
      res.status(201).json({ message: 'Leave created successfully', leave: leaveWithEmployee });
    } catch (err) {
      console.error('Error creating leave:', err);
      res.status(500).json({ error: err.message });
    }
  },

  approveLeave: async (req, res) => {
    try {
      const { id } = req.params;
      const leave = await Leave.findByPk(id);
      
      if (!leave) {
        return res.status(404).json({ error: 'Leave not found' });
      }
      
      await leave.update({ status: 'Approved' });
      
      // Update leave credits automatically
      try {
        await LeaveCreditService.updateCreditsOnLeaveApproval(id);
      } catch (creditError) {
        console.error('Error updating leave credits:', creditError);
        // Continue even if credit update fails
      }
      
      // Create notification for employee
      await Notification.create({
        message: `Your leave request (${leave.type}) has been approved.`,
        userId: leave.employeeId,
      });
      
      // Log leave approval
      const employee = await Employee.findByPk(leave.employeeId);
      await createAuditLog(req.user.id, req.user.role, `Approved ${leave.type} leave for employee ${employee?.fullName || leave.employeeId}`);
      
      res.json({ message: 'Leave approved successfully', leave });
    } catch (err) {
      console.error('Error approving leave:', err);
      res.status(500).json({ error: err.message });
    }
  },

  rejectLeave: async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const leave = await Leave.findByPk(id);
      
      if (!leave) {
        return res.status(404).json({ error: 'Leave not found' });
      }
      
      await leave.update({ 
        status: 'Rejected',
        rejectionReason: reason 
      });
      
      // Create notification for employee
      await Notification.create({
        message: `Your leave request (${leave.type}) has been rejected. Reason: ${reason || 'Not specified'}`,
        userId: leave.employeeId,
      });
      
      // Log leave rejection
      const employee = await Employee.findByPk(leave.employeeId);
      await createAuditLog(req.user.id, req.user.role, `Rejected ${leave.type} leave for employee ${employee?.fullName || leave.employeeId}`);
      
      res.json({ message: 'Leave rejected successfully', leave });
    } catch (err) {
      console.error('Error rejecting leave:', err);
      res.status(500).json({ error: err.message });
    }
  },

  deleteLeave: async (req, res) => {
    try {
      const { id } = req.params;
      console.log('Delete leave request for ID:', id);
      
      const leave = await Leave.findByPk(id);
      
      if (!leave) {
        console.log('Leave not found:', id);
        return res.status(404).json({ error: 'Leave not found' });
      }

      console.log('Leave found:', { id: leave.id, status: leave.status, employeeId: leave.employeeId });

      // Optional: Only allow deleting rejected leaves
      if (leave.status !== 'Rejected') {
        console.log('Cannot delete - leave status is:', leave.status);
        return res.status(400).json({ error: 'Only rejected leaves can be deleted' });
      }
      
      await leave.destroy();
      console.log('Leave deleted successfully:', id);
      
      res.json({ message: 'Leave deleted successfully' });
    } catch (err) {
      console.error('Error deleting leave:', err);
      res.status(500).json({ error: err.message });
    }
  },

  // Leave Credits Management
  getLeaveCredits: async (req, res) => {
    try {
      const { schoolYear } = req.query;
      const credits = await LeaveCreditService.getAllLeaveCredits(schoolYear);
      res.json(credits);
    } catch (err) {
      console.error('Error fetching leave credits:', err);
      res.status(500).json({ error: err.message });
    }
  },

  getEmployeeLeaveCredits: async (req, res) => {
    try {
      const { employeeId } = req.params;
      const { schoolYear } = req.query;
      const credits = await LeaveCreditService.getLeaveCredits(employeeId, schoolYear);
      res.json(credits);
    } catch (err) {
      console.error('Error fetching employee leave credits:', err);
      res.status(500).json({ error: err.message });
    }
  },

  resetLeaveCredits: async (req, res) => {
    try {
      const { schoolYear } = req.body;
      
      if (!schoolYear) {
        return res.status(400).json({ error: 'School year is required (e.g., "2024-2025")' });
      }

      const result = await LeaveCreditService.resetCreditsForNewSchoolYear(schoolYear);
      
      res.json({
        message: 'Leave credits reset successfully',
        ...result
      });
    } catch (err) {
      console.error('Error resetting leave credits:', err);
      res.status(500).json({ error: err.message });
    }
  },

  updateEmployeeCredits: async (req, res) => {
    try {
      const { employeeId } = req.params;
      const { employmentType, schoolYear } = req.body;

      if (!employmentType) {
        return res.status(400).json({ error: 'Employment type is required' });
      }

      const validTypes = ['permanent', 'contractual', 'job-order', 'part-time'];
      if (!validTypes.includes(employmentType)) {
        return res.status(400).json({ 
          error: 'Invalid employment type. Must be: permanent, contractual, job-order, or part-time' 
        });
      }

      const credits = await LeaveCreditService.updateEmploymentType(
        employeeId, 
        employmentType, 
        schoolYear
      );

      res.json({
        message: 'Employee leave credits updated successfully',
        credits
      });
    } catch (err) {
      console.error('Error updating employee credits:', err);
      res.status(500).json({ error: err.message });
    }
  },

  getCreditSummary: async (req, res) => {
    try {
      const { schoolYear } = req.query;
      const summary = await LeaveCreditService.getCreditSummaryByType(schoolYear);
      res.json(summary);
    } catch (err) {
      console.error('Error fetching credit summary:', err);
      res.status(500).json({ error: err.message });
    }
  },

  // Department Management
  getDepartments: async (req, res) => {
    try {
      const { status } = req.query;
      const where = {};
      
      if (status) where.status = status;
      
      const departments = await Department.findAll({
        where,
        include: [{
          model: Designation,
          where: { status: 'Active' },
          required: false
        }],
        order: [['name', 'ASC']]
      });
      
      res.json(departments);
    } catch (err) {
      console.error('Error fetching departments:', err);
      res.status(500).json({ error: err.message });
    }
  },

  getDepartmentById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const department = await Department.findByPk(id, {
        include: [{
          model: Designation,
          order: [['title', 'ASC']]
        }]
      });
      
      if (!department) {
        return res.status(404).json({ error: 'Department not found' });
      }
      
      res.json(department);
    } catch (err) {
      console.error('Error fetching department:', err);
      res.status(500).json({ error: err.message });
    }
  },

  createDepartment: async (req, res) => {
    try {
      const { name, code, description } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Department name is required' });
      }
      
      // Check if department already exists
      const existing = await Department.findOne({ where: { name } });
      if (existing) {
        return res.status(400).json({ error: 'Department already exists' });
      }
      
      const department = await Department.create({
        name,
        code,
        description,
        status: 'Active'
      });
      
      res.status(201).json({ 
        message: 'Department created successfully', 
        department 
      });
    } catch (err) {
      console.error('Error creating department:', err);
      res.status(500).json({ error: err.message });
    }
  },

  updateDepartment: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, code, description } = req.body;
      
      const department = await Department.findByPk(id);
      if (!department) {
        return res.status(404).json({ error: 'Department not found' });
      }
      
      // Check if new name conflicts with another department
      if (name && name !== department.name) {
        const existing = await Department.findOne({ 
          where: { 
            name,
            id: { [Op.ne]: id }
          } 
        });
        if (existing) {
          return res.status(400).json({ error: 'Department name already exists' });
        }
      }
      
      await department.update({ name, code, description });
      
      res.json({ 
        message: 'Department updated successfully', 
        department 
      });
    } catch (err) {
      console.error('Error updating department:', err);
      res.status(500).json({ error: err.message });
    }
  },

  archiveDepartment: async (req, res) => {
    try {
      const { id } = req.params;
      
      const department = await Department.findByPk(id);
      if (!department) {
        return res.status(404).json({ error: 'Department not found' });
      }
      
      await department.update({ status: 'Archived' });
      
      // Also archive all designations under this department
      await Designation.update(
        { status: 'Archived' },
        { where: { departmentId: id } }
      );
      
      res.json({ 
        message: 'Department archived successfully', 
        department 
      });
    } catch (err) {
      console.error('Error archiving department:', err);
      res.status(500).json({ error: err.message });
    }
  },

  unarchiveDepartment: async (req, res) => {
    try {
      const { id } = req.params;
      
      const department = await Department.findByPk(id);
      if (!department) {
        return res.status(404).json({ error: 'Department not found' });
      }
      
      await department.update({ status: 'Active' });
      
      res.json({ 
        message: 'Department unarchived successfully', 
        department 
      });
    } catch (err) {
      console.error('Error unarchiving department:', err);
      res.status(500).json({ error: err.message });
    }
  },

  // Designation Management
  getDesignations: async (req, res) => {
    try {
      const { status, departmentId } = req.query;
      const where = {};
      
      if (status) where.status = status;
      if (departmentId) where.departmentId = departmentId;
      
      const designations = await Designation.findAll({
        where,
        include: [{
          model: Department,
          attributes: ['id', 'name', 'code']
        }],
        order: [['title', 'ASC']]
      });
      
      res.json(designations);
    } catch (err) {
      console.error('Error fetching designations:', err);
      res.status(500).json({ error: err.message });
    }
  },

  getDesignationById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const designation = await Designation.findByPk(id, {
        include: [{
          model: Department,
          attributes: ['id', 'name', 'code']
        }]
      });
      
      if (!designation) {
        return res.status(404).json({ error: 'Designation not found' });
      }
      
      res.json(designation);
    } catch (err) {
      console.error('Error fetching designation:', err);
      res.status(500).json({ error: err.message });
    }
  },

  createDesignation: async (req, res) => {
    try {
      const { title, departmentId, description } = req.body;
      
      if (!title) {
        return res.status(400).json({ error: 'Designation title is required' });
      }
      
      // Verify department exists if provided
      if (departmentId) {
        const department = await Department.findByPk(departmentId);
        if (!department) {
          return res.status(404).json({ error: 'Department not found' });
        }
      }
      
      const designation = await Designation.create({
        title,
        departmentId: departmentId || null,
        description,
        status: 'Active'
      });
      
      const designationWithDept = await Designation.findByPk(designation.id, {
        include: [{
          model: Department,
          attributes: ['id', 'name', 'code']
        }]
      });
      
      res.status(201).json({ 
        message: 'Designation created successfully', 
        designation: designationWithDept 
      });
    } catch (err) {
      console.error('Error creating designation:', err);
      res.status(500).json({ error: err.message });
    }
  },

  updateDesignation: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, departmentId, description } = req.body;
      
      const designation = await Designation.findByPk(id);
      if (!designation) {
        return res.status(404).json({ error: 'Designation not found' });
      }
      
      // Verify department exists if changing
      if (departmentId && departmentId !== designation.departmentId) {
        const department = await Department.findByPk(departmentId);
        if (!department) {
          return res.status(404).json({ error: 'Department not found' });
        }
      }
      
      await designation.update({ title, departmentId, description });
      
      const updatedDesignation = await Designation.findByPk(id, {
        include: [{
          model: Department,
          attributes: ['id', 'name', 'code']
        }]
      });
      
      res.json({ 
        message: 'Designation updated successfully', 
        designation: updatedDesignation 
      });
    } catch (err) {
      console.error('Error updating designation:', err);
      res.status(500).json({ error: err.message });
    }
  },

  archiveDesignation: async (req, res) => {
    try {
      const { id } = req.params;
      
      const designation = await Designation.findByPk(id);
      if (!designation) {
        return res.status(404).json({ error: 'Designation not found' });
      }
      
      await designation.update({ status: 'Archived' });
      
      res.json({ 
        message: 'Designation archived successfully', 
        designation 
      });
    } catch (err) {
      console.error('Error archiving designation:', err);
      res.status(500).json({ error: err.message });
    }
  },

  unarchiveDesignation: async (req, res) => {
    try {
      const { id } = req.params;
      
      const designation = await Designation.findByPk(id);
      if (!designation) {
        return res.status(404).json({ error: 'Designation not found' });
      }
      
      await designation.update({ status: 'Active' });
      
      res.json({ 
        message: 'Designation unarchived successfully', 
        designation 
      });
    } catch (err) {
      console.error('Error unarchiving designation:', err);
      res.status(500).json({ error: err.message });
    }
  },

  // Profile change request management
  getProfileChangeRequests: async (req, res) => {
    try {
      const { status } = req.query;
      
      const whereClause = status ? { status } : {};
      
      const requests = await ProfileChangeRequest.findAll({
        where: whereClause,
        include: [
          {
            model: Employee,
            as: 'employee',
            attributes: ['id', 'fullName', 'email', 'employeeId', 'profileImage']
          },
          {
            model: Employee,
            as: 'reviewer',
            attributes: ['id', 'fullName']
          }
        ],
        order: [
          ['status', 'ASC'], // pending first
          ['createdAt', 'DESC']
        ]
      });

      res.json(requests);
    } catch (error) {
      console.error('Error fetching profile change requests:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getProfileChangeRequestById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const request = await ProfileChangeRequest.findByPk(id, {
        include: [
          {
            model: Employee,
            as: 'employee',
            attributes: ['id', 'fullName', 'email', 'employeeId', 'contactNumber', 'profileImage']
          },
          {
            model: Employee,
            as: 'reviewer',
            attributes: ['id', 'fullName']
          }
        ]
      });

      if (!request) {
        return res.status(404).json({ message: 'Profile change request not found' });
      }

      res.json(request);
    } catch (error) {
      console.error('Error fetching profile change request:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  approveProfileChange: async (req, res) => {
    try {
      const { id } = req.params;
      const { reviewNotes } = req.body;
      
      const request = await ProfileChangeRequest.findByPk(id, {
        include: [{ model: Employee, as: 'employee' }]
      });

      if (!request) {
        return res.status(404).json({ message: 'Profile change request not found' });
      }

      if (request.status !== 'pending') {
        return res.status(400).json({ message: 'This request has already been reviewed' });
      }

      // Apply the changes to employee profile
      await Employee.update(
        request.requestedChanges,
        { where: { id: request.employeeId } }
      );

      // Update request status
      await request.update({
        status: 'approved',
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
        reviewNotes
      });

      // Create notification for employee
      await Notification.create({
        message: 'Your profile change request has been approved by HR',
        userId: request.employeeId
      });

      // Create audit log
      await createAuditLog({
        userId: req.user.id,
        action: 'APPROVE_PROFILE_CHANGE',
        entity: 'ProfileChangeRequest',
        entityId: request.id,
        changes: { status: 'approved' },
        ipAddress: req.ip
      });

      const updatedRequest = await ProfileChangeRequest.findByPk(id, {
        include: [
          { model: Employee, as: 'employee' },
          { model: Employee, as: 'reviewer' }
        ]
      });

      res.json({ 
        message: 'Profile change request approved successfully',
        request: updatedRequest
      });
    } catch (error) {
      console.error('Error approving profile change:', error);
      res.status(500).json({ message: 'Failed to approve profile change' });
    }
  },

  rejectProfileChange: async (req, res) => {
    try {
      const { id } = req.params;
      const { reviewNotes } = req.body;
      
      const request = await ProfileChangeRequest.findByPk(id, {
        include: [{ model: Employee, as: 'employee' }]
      });

      if (!request) {
        return res.status(404).json({ message: 'Profile change request not found' });
      }

      if (request.status !== 'pending') {
        return res.status(400).json({ message: 'This request has already been reviewed' });
      }

      // Update request status
      await request.update({
        status: 'rejected',
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
        reviewNotes: reviewNotes || 'Request rejected by HR'
      });

      // Create notification for employee
      await Notification.create({
        message: `Your profile change request has been rejected. Reason: ${reviewNotes || 'No reason provided'}`,
        userId: request.employeeId
      });

      // Create audit log
      await createAuditLog({
        userId: req.user.id,
        action: 'REJECT_PROFILE_CHANGE',
        entity: 'ProfileChangeRequest',
        entityId: request.id,
        changes: { status: 'rejected' },
        ipAddress: req.ip
      });

      const updatedRequest = await ProfileChangeRequest.findByPk(id, {
        include: [
          { model: Employee, as: 'employee' },
          { model: Employee, as: 'reviewer' }
        ]
      });

      res.json({ 
        message: 'Profile change request rejected',
        request: updatedRequest
      });
    } catch (error) {
      console.error('Error rejecting profile change:', error);
      res.status(500).json({ message: 'Failed to reject profile change' });
    }
  }
};