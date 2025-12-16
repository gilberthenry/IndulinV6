const Employee = require('../models/Employee');
const Document = require('../models/Document');
const Leave = require('../models/Leave');
const LeaveCredit = require('../models/LeaveCredit');
const Contract = require('../models/Contract');
const Certificate = require('../models/Certificate');
const Notification = require('../models/Notification');
const ProfileChangeRequest = require('../models/ProfileChangeRequest');
const { Op } = require('sequelize');

class EmployeeController {
  async getProfile(req, res) {
    try {
      const employee = await Employee.findByPk(req.user.id);
      res.json(employee);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  async uploadProfileImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' });
      }

      const fs = require('fs');
      const path = require('path');
      
      // Get current employee to check for old image
      const employee = await Employee.findByPk(req.user.id);
      
      // Delete old profile image if exists
      if (employee.profileImage) {
        const oldImagePath = path.join(__dirname, '../..', employee.profileImage);
        if (fs.existsSync(oldImagePath)) {
          try {
            fs.unlinkSync(oldImagePath);
          } catch (err) {
            console.log('Could not delete old image:', err);
          }
        }
      }

      const imagePath = `/uploads/${req.file.filename}`;
      
      await Employee.update(
        { profileImage: imagePath },
        { where: { id: req.user.id } }
      );

      const updatedEmployee = await Employee.findByPk(req.user.id);
      res.json({ 
        message: 'Profile image uploaded successfully', 
        profileImage: imagePath,
        employee: updatedEmployee 
      });
    } catch (error) {
      console.error('Error uploading profile image:', error);
      res.status(500).json({ message: 'Failed to upload profile image' });
    }
  }

  async updateProfile(req, res) {
    try {
      const {
        name, email, contactNumber,
        dateOfBirth, placeOfBirth, sex, civilStatus, citizenship,
        gsisIdNo, pagibigIdNo, philhealthNo, sssNo, tinNo,
        residentialAddress, permanentAddress,
        residentialZip, permanentZip,
        surname, firstName, middleName, age, religion, contractNumber, bloodType,
        emergencyContactName, emergencyContactNumber, emergencyContactRelationship, emergencyContactAddress,
        spouseName, spouseContactNumber, spouseOccupation, spouseAddress,
        fatherName, motherName, children
        ,
        education, eligibility, workExperience, communityInvolvement,
        learningAndDevelopment, trainings, otherInformation, legalResponses, references
      } = req.body;
      
      const updateData = {};
      
      // Basic fields
      if (name) updateData.fullName = name;
      if (email) updateData.email = email;
      if (contactNumber !== undefined) updateData.contactNumber = contactNumber;
      
      // Personal Information
      if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth || null;
      if (placeOfBirth !== undefined) updateData.placeOfBirth = placeOfBirth;
      if (sex !== undefined) updateData.sex = sex || null;
      if (civilStatus !== undefined) updateData.civilStatus = civilStatus || null;
      if (citizenship !== undefined) updateData.citizenship = citizenship;
      if (surname !== undefined) updateData.surname = surname;
      if (firstName !== undefined) updateData.firstName = firstName;
      if (middleName !== undefined) updateData.middleName = middleName;
      if (age !== undefined) updateData.age = age || null;
      if (religion !== undefined) updateData.religion = religion;
      if (contractNumber !== undefined) updateData.contractNumber = contractNumber;
      if (bloodType !== undefined) updateData.bloodType = bloodType;
      
      // Government IDs
      if (gsisIdNo !== undefined) updateData.gsisIdNo = gsisIdNo;
      if (pagibigIdNo !== undefined) updateData.pagibigIdNo = pagibigIdNo;
      if (philhealthNo !== undefined) updateData.philhealthNo = philhealthNo;
      if (sssNo !== undefined) updateData.sssNo = sssNo;
      if (tinNo !== undefined) updateData.tinNo = tinNo;
      
      // Address
      if (residentialAddress !== undefined) updateData.residentialAddress = residentialAddress;
      if (permanentAddress !== undefined) updateData.permanentAddress = permanentAddress;
      if (residentialZip !== undefined) updateData.residentialZip = residentialZip;
      if (permanentZip !== undefined) updateData.permanentZip = permanentZip;
      
      // Emergency Contact
      if (emergencyContactName !== undefined) updateData.emergencyContactName = emergencyContactName;
      if (emergencyContactNumber !== undefined) updateData.emergencyContactNumber = emergencyContactNumber;
      if (emergencyContactRelationship !== undefined) updateData.emergencyContactRelationship = emergencyContactRelationship;
      if (emergencyContactAddress !== undefined) updateData.emergencyContactAddress = emergencyContactAddress;
      // Family Background
      if (spouseName !== undefined) updateData.spouseName = spouseName;
      if (spouseContactNumber !== undefined) updateData.spouseContactNumber = spouseContactNumber;
      if (spouseOccupation !== undefined) updateData.spouseOccupation = spouseOccupation;
      if (spouseAddress !== undefined) updateData.spouseAddress = spouseAddress;
      if (fatherName !== undefined) updateData.fatherName = fatherName;
      if (motherName !== undefined) updateData.motherName = motherName;
      if (children !== undefined) updateData.children = children;
      // Complex sections
      if (education !== undefined) updateData.education = education;
      if (eligibility !== undefined) updateData.eligibility = eligibility;
      if (workExperience !== undefined) updateData.workExperience = workExperience;
      if (communityInvolvement !== undefined) updateData.communityInvolvement = communityInvolvement;
      if (learningAndDevelopment !== undefined) updateData.learningAndDevelopment = learningAndDevelopment;
      if (trainings !== undefined) updateData.trainings = trainings;
      if (otherInformation !== undefined) updateData.otherInformation = otherInformation;
      if (legalResponses !== undefined) updateData.legalResponses = legalResponses;
      if (references !== undefined) updateData.references = references;
      
      await Employee.update(updateData, { where: { id: req.user.id } });
      
      const updatedEmployee = await Employee.findByPk(req.user.id);
      res.json({ message: 'Profile updated successfully', employee: updatedEmployee });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  async uploadDocument(req, res) {
    try {
      console.log('Upload request received:', {
        body: req.body,
        file: req.file,
        user: req.user
      });

      const { type, documentId } = req.body;
      
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      if (!type && !documentId) {
        return res.status(400).json({ message: 'Document type or document ID is required' });
      }

      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const filePath = req.file.path;

      // Check if this is responding to an HR request
      if (documentId) {
        const existingDoc = await Document.findOne({
          where: { 
            id: documentId,
            employeeId: req.user.id,
            isHRRequested: true,
            status: 'Requested'
          }
        });

        if (!existingDoc) {
          return res.status(404).json({ message: 'Document request not found' });
        }

        // Update existing document request with file
        await existingDoc.update({
          filePath,
          status: 'Pending',
          uploadedAt: new Date()
        });

        // Notify HR that document was uploaded
        if (existingDoc.requestedBy) {
          await Notification.create({
            message: `${req.user.fullName || 'Employee'} has uploaded the requested ${existingDoc.type} document.`,
            userId: existingDoc.requestedBy,
          });
        }

        console.log('Document request fulfilled:', existingDoc.toJSON());
        res.json({ message: 'Document uploaded successfully', document: existingDoc });
      } else {
        // Employee-initiated upload
        console.log('Creating document with:', {
          employeeId: req.user.id,
          type,
          filePath,
          status: 'Pending'
        });

        const document = await Document.create({ 
          employeeId: req.user.id, 
          type, 
          filePath,
          status: 'Pending',
          isHRRequested: false
        });

        console.log('Document created successfully:', document.toJSON());
        res.json({ message: 'Document uploaded successfully', document });
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      res.status(500).json({ 
        message: 'Server error', 
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  async getDocuments(req, res) {
    try {
      const documents = await Document.findAll({
        where: { employeeId: req.user.id },
        order: [
          ['createdAt', 'DESC']
        ]
      });
      res.json(documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async requestLeave(req, res) {
    console.log('📥 Leave request received from employee:', req.user.id);
    console.log('📄 Request body:', req.body);
    
    try {
      const { type, startDate, endDate, reason } = req.body;
      
      // Validate required fields
      if (!type || !startDate || !endDate) {
        console.log('❌ Missing required fields');
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      // Calculate days
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      // Determine school year
      const year = start.getFullYear();
      const month = start.getMonth() + 1;
      const schoolYear = month >= 6 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
      
      // Create leave request
      const leave = await Leave.create({ 
        employeeId: req.user.id, 
        type, 
        startDate, 
        endDate, 
        reason,
        schoolYear,
        daysCount,
        status: 'Pending'
      });
      
      // Get employee details
      const employee = await Employee.findByPk(req.user.id, {
        attributes: ['id', 'employeeId', 'fullName', 'email']
      });
      
      // Create notification for HR (role: 'hr')
      const hrUsers = await Employee.findAll({
        where: { role: 'hr' },
        attributes: ['id']
      });
      
      // Create notifications for all HR users
      for (const hr of hrUsers) {
        await Notification.create({
          message: `New leave request from ${employee.fullName} (${type}) for ${daysCount} day(s) from ${start.toLocaleDateString()} to ${end.toLocaleDateString()}.`,
          userId: hr.id,
        });
      }
      
      console.log('✅ Leave request created successfully:', leave.id);
      
      res.json({ 
        message: 'Leave requested successfully', 
        leave: {
          ...leave.toJSON(),
          Employee: employee
        }
      });
    } catch (error) {
      console.error('❌ Error requesting leave:', error);
      console.error('❌ Error stack:', error.stack);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  async getLeaves(req, res) {
    try {
      const leaves = await Leave.findAll({
        where: { employeeId: req.user.id },
        order: [['startDate', 'DESC']],
        include: [{
          model: Employee,
          attributes: ['id', 'employeeId', 'fullName', 'email']
        }]
      });
      
      res.json(leaves);
    } catch (error) {
      console.error('Error fetching leaves:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async getLeaveCredits(req, res) {
    try {
      // Get current school year
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const schoolYear = month >= 6 ? `${year}-${year + 1}` : `${year - 1}-${year}`;

      // Get leave credits for current school year
      let leaveCredit = await LeaveCredit.findOne({
        where: {
          employeeId: req.user.id,
          schoolYear: schoolYear
        }
      });

      // If no leave credit record exists, return default structure
      if (!leaveCredit) {
        const employee = await Employee.findByPk(req.user.id);
        const contract = await Contract.findOne({
          where: { employeeId: req.user.id, status: 'Active' }
        });
        
        // Default credits based on employment type
        const defaultCredits = {
          permanent: 15,
          contractual: 10,
          'job-order': 5,
          'part-time': 7
        };
        
        const employmentType = contract?.contractType || 'permanent';
        const totalCredits = defaultCredits[employmentType] || 10;

        return res.json({
          totalCredits,
          usedCredits: 0,
          remainingCredits: totalCredits,
          carriedOverCredits: 0,
          schoolYear
        });
      }

      res.json({
        totalCredits: parseFloat(leaveCredit.totalCredits),
        usedCredits: parseFloat(leaveCredit.usedCredits),
        remainingCredits: parseFloat(leaveCredit.totalCredits) + parseFloat(leaveCredit.carriedOverCredits) - parseFloat(leaveCredit.usedCredits),
        carriedOverCredits: parseFloat(leaveCredit.carriedOverCredits),
        schoolYear: leaveCredit.schoolYear
      });
    } catch (error) {
      console.error('Error fetching leave credits:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Contract methods
  async getCurrentContract(req, res) {
    try {
      const contract = await Contract.findOne({
        where: { 
          employeeId: req.user.id,
          status: 'Active'
        },
        order: [['startDate', 'DESC']]
      });
      
      if (!contract) {
        return res.status(404).json({ message: 'No active contract found' });
      }
      
      res.json(contract);
    } catch (error) {
      console.error('Error fetching current contract:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async getPastContracts(req, res) {
    try {
      const contracts = await Contract.findAll({
        where: { 
          employeeId: req.user.id,
          status: { [Op.in]: ['Expired', 'Terminated'] }
        },
        order: [['endDate', 'DESC']]
      });
      
      res.json(contracts);
    } catch (error) {
      console.error('Error fetching past contracts:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async getAllContracts(req, res) {
    try {
      const contracts = await Contract.findAll({
        where: { employeeId: req.user.id },
        order: [['startDate', 'DESC']]
      });
      
      res.json(contracts);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async downloadContractFile(req, res) {
    try {
      const { id } = req.params;
      const contract = await Contract.findOne({
        where: { 
          id,
          employeeId: req.user.id 
        }
      });

      if (!contract || !contract.filePath) {
        return res.status(404).json({ message: 'Contract file not found' });
      }

      const path = require('path');
      const fs = require('fs');
      const filePath = path.join(__dirname, '../../', contract.filePath);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File does not exist' });
      }

      res.download(filePath);
    } catch (error) {
      console.error('Error downloading contract:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Certificate methods
  async requestCertificate(req, res) {
    try {
      console.log('Certificate request received:', req.body);
      console.log('User ID:', req.user?.id);
      
      const { certificates } = req.body;
      
      if (!certificates || !Array.isArray(certificates) || certificates.length === 0) {
        return res.status(400).json({ message: 'Please select at least one certificate' });
      }

      const certificateRequests = certificates.map(cert => ({
        employeeId: req.user.id,
        certificateType: cert,
        status: 'Pending',
        requestedAt: new Date()
      }));

      console.log('Creating certificate requests:', certificateRequests);
      
      const created = await Certificate.bulkCreate(certificateRequests);
      
      console.log('Certificates created:', created);
      
      res.json({ 
        message: 'Certificate request(s) submitted successfully',
        requests: created
      });
    } catch (error) {
      console.error('Error requesting certificate:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  async getCertificateRequests(req, res) {
    try {
      const requests = await Certificate.findAll({
        where: { employeeId: req.user.id },
        order: [['requestedAt', 'DESC']]
      });
      
      res.json(requests);
    } catch (error) {
      console.error('Error fetching certificate requests:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async downloadCertificate(req, res) {
    try {
      const { id } = req.params;
      const certificate = await Certificate.findOne({
        where: { 
          id,
          employeeId: req.user.id,
          status: 'Approved'
        }
      });

      if (!certificate || !certificate.filePath) {
        return res.status(404).json({ message: 'Certificate not found or not yet approved' });
      }

      const path = require('path');
      const fs = require('fs');
      const filePath = path.join(__dirname, '../../', certificate.filePath);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File does not exist' });
      }

      res.download(filePath);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async requestProfileChange(req, res) {
    try {
      const { requestedChanges, reason } = req.body;
      
      // Get current employee profile
      const currentEmployee = await Employee.findByPk(req.user.id);
      const currentValues = currentEmployee.toJSON();

      // Determine which fields were changed
      const changedFields = [];
      const changes = {};
      
      Object.keys(requestedChanges).forEach(key => {
        if (JSON.stringify(currentValues[key]) !== JSON.stringify(requestedChanges[key])) {
          changedFields.push(key);
          changes[key] = requestedChanges[key];
        }
      });

      if (changedFields.length === 0) {
        return res.status(400).json({ message: 'No changes detected' });
      }

      // Check if there's already a pending request
      const existingRequest = await ProfileChangeRequest.findOne({
        where: {
          employeeId: req.user.id,
          status: 'pending'
        }
      });

      if (existingRequest) {
        return res.status(400).json({ 
          message: 'You already have a pending profile change request. Please wait for HR review.' 
        });
      }

      // Create change request
      const changeRequest = await ProfileChangeRequest.create({
        employeeId: req.user.id,
        currentValues,
        requestedChanges: changes,
        changedFields,
        reason,
        status: 'pending'
      });

      // Get all HR users
      const hrUsers = await Employee.findAll({
        where: { role: 'hr' },
        attributes: ['id']
      });

      // Create notification for each HR user
      for (const hr of hrUsers) {
        await Notification.create({
          message: `Profile change request from ${currentEmployee.fullName} - ${changedFields.length} field(s) to update`,
          userId: hr.id
        });
      }

      res.json({ 
        message: 'Profile change request submitted successfully. Awaiting HR approval.',
        request: changeRequest 
      });
    } catch (error) {
      console.error('❌ Error requesting profile change:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      res.status(500).json({ message: 'Failed to submit profile change request', error: error.message });
    }
  }

  async getMyChangeRequests(req, res) {
    try {
      const requests = await ProfileChangeRequest.findAll({
        where: { employeeId: req.user.id },
        include: [
          {
            model: Employee,
            as: 'reviewer',
            attributes: ['id', 'fullName']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json(requests);
    } catch (error) {
      console.error('Error fetching change requests:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = new EmployeeController();