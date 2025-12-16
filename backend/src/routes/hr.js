const express = require('express');
const router = express.Router();
const HRController = require('../controllers/HRController');
const HRRequestController = require('../controllers/HRRequestController');
const { authenticateToken, authorizeRoles } = require('../middleware/AuthMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Dashboard
router.get('/dashboard/stats', authenticateToken, authorizeRoles('hr', 'mis'), HRController.getDashboardStats);

// Employee management
router.get('/employees', authenticateToken, authorizeRoles('hr', 'mis'), HRController.getEmployees);
router.post('/employees', authenticateToken, authorizeRoles('hr', 'mis'), HRController.createEmployee);
router.get('/employees/:id', authenticateToken, authorizeRoles('hr', 'mis'), HRController.getEmployeeById);
router.put('/employees/:id', authenticateToken, authorizeRoles('hr', 'mis'), HRController.updateEmployee);

// Bulk upload employees
router.post('/employees/bulk-upload', authenticateToken, authorizeRoles('hr', 'mis'), upload.single('file'), HRController.bulkUpload);
router.post('/employees/bulk-upload/preview', authenticateToken, authorizeRoles('hr', 'mis'), upload.single('file'), HRController.previewBulkUpload);
router.post('/employees/bulk-upload/confirm', authenticateToken, authorizeRoles('hr', 'mis'), upload.single('file'), HRController.confirmBulkUpload);
router.get('/employees/template/download', authenticateToken, authorizeRoles('hr', 'mis'), HRController.downloadEmployeeTemplate);

// Contract management
router.get('/contracts', authenticateToken, authorizeRoles('hr', 'mis'), HRController.listContracts);
router.post('/contracts', authenticateToken, authorizeRoles('hr', 'mis'), HRController.createContract);
router.put('/contracts/:id', authenticateToken, authorizeRoles('hr', 'mis'), HRController.updateContract);
router.post('/contracts/:id/renew', authenticateToken, authorizeRoles('hr', 'mis'), HRController.renewContract);
router.post('/contracts/:id/terminate', authenticateToken, authorizeRoles('hr', 'mis'), HRController.terminateContract);
router.get('/contracts/expiring', authenticateToken, authorizeRoles('hr', 'mis'), HRController.getExpiringContracts);

// Reports
router.get('/reports/contracts', authenticateToken, authorizeRoles('hr', 'mis'), HRController.contractReport);
router.get('/reports/leaves', authenticateToken, authorizeRoles('hr', 'mis'), HRController.leaveReport);
router.get('/reports/documents', authenticateToken, authorizeRoles('hr', 'mis'), HRController.documentReport);

// Profile change requests
router.get('/profile-requests', authenticateToken, authorizeRoles('hr', 'mis'), HRController.getProfileChangeRequests);
router.get('/profile-requests/:id', authenticateToken, authorizeRoles('hr', 'mis'), HRController.getProfileChangeRequestById);
router.put('/profile-requests/:id/approve', authenticateToken, authorizeRoles('hr', 'mis'), HRController.approveProfileChange);
router.put('/profile-requests/:id/reject', authenticateToken, authorizeRoles('hr', 'mis'), HRController.rejectProfileChange);

// Certificate management
router.get('/certificates/requests', authenticateToken, authorizeRoles('hr', 'mis'), HRController.getCertificateRequests);
router.put('/certificates/:id/approve', authenticateToken, authorizeRoles('hr', 'mis'), HRController.approveCertificate);
router.put('/certificates/:id/reject', authenticateToken, authorizeRoles('hr', 'mis'), HRController.rejectCertificate);
router.post('/certificates/:id/upload', authenticateToken, authorizeRoles('hr', 'mis'), upload.single('file'), HRController.uploadCertificateFile);

// Document management
router.get('/documents', authenticateToken, authorizeRoles('hr', 'mis'), HRController.getDocuments);
router.get('/documents/:id/view', authenticateToken, authorizeRoles('hr', 'mis'), HRController.viewDocument);
router.put('/documents/:id/approve', authenticateToken, authorizeRoles('hr', 'mis'), HRController.approveDocument);
router.put('/documents/:id/reject', authenticateToken, authorizeRoles('hr', 'mis'), HRController.rejectDocument);
router.post('/documents/request', authenticateToken, authorizeRoles('hr', 'mis'), HRController.requestDocument);

// Leave management
router.get('/leaves', authenticateToken, authorizeRoles('hr', 'mis'), HRController.getLeaves);
router.get('/leaves/calendar', authenticateToken, authorizeRoles('hr', 'mis'), HRController.getLeaveCalendar);
router.post('/leaves', authenticateToken, authorizeRoles('hr', 'mis'), HRController.createLeave);
router.put('/leaves/:id/approve', authenticateToken, authorizeRoles('hr', 'mis'), HRController.approveLeave);
router.put('/leaves/:id/reject', authenticateToken, authorizeRoles('hr', 'mis'), HRController.rejectLeave);
router.delete('/leaves/:id', authenticateToken, authorizeRoles('hr', 'mis'), HRController.deleteLeave);

// Leave Credits management (HR can view only, MIS can modify)
router.get('/leave-credits', authenticateToken, authorizeRoles('hr', 'mis'), HRController.getLeaveCredits);
router.get('/leave-credits/summary', authenticateToken, authorizeRoles('hr', 'mis'), HRController.getCreditSummary);
router.get('/leave-credits/:employeeId', authenticateToken, authorizeRoles('hr', 'mis'), HRController.getEmployeeLeaveCredits);
router.post('/leave-credits/reset', authenticateToken, authorizeRoles('mis'), HRController.resetLeaveCredits);
router.put('/leave-credits/:employeeId', authenticateToken, authorizeRoles('mis'), HRController.updateEmployeeCredits);

// Department management
router.get('/departments', authenticateToken, authorizeRoles('hr', 'mis'), HRController.getDepartments);
router.get('/departments/:id', authenticateToken, authorizeRoles('hr', 'mis'), HRController.getDepartmentById);
router.post('/departments', authenticateToken, authorizeRoles('hr', 'mis'), HRController.createDepartment);
router.put('/departments/:id', authenticateToken, authorizeRoles('hr', 'mis'), HRController.updateDepartment);
router.put('/departments/:id/archive', authenticateToken, authorizeRoles('hr', 'mis'), HRController.archiveDepartment);
router.put('/departments/:id/unarchive', authenticateToken, authorizeRoles('hr', 'mis'), HRController.unarchiveDepartment);

// Designation management
router.get('/designations', authenticateToken, authorizeRoles('hr', 'mis'), HRController.getDesignations);
router.get('/designations/:id', authenticateToken, authorizeRoles('hr', 'mis'), HRController.getDesignationById);
router.post('/designations', authenticateToken, authorizeRoles('hr', 'mis'), HRController.createDesignation);
router.put('/designations/:id', authenticateToken, authorizeRoles('hr', 'mis'), HRController.updateDesignation);
router.put('/designations/:id/archive', authenticateToken, authorizeRoles('hr', 'mis'), HRController.archiveDesignation);
router.put('/designations/:id/unarchive', authenticateToken, authorizeRoles('hr', 'mis'), HRController.unarchiveDesignation);

// Configuration Requests (HR can only submit)
router.post('/config-requests', authenticateToken, authorizeRoles('hr'), HRRequestController.createRequest);
router.get('/config-requests', authenticateToken, authorizeRoles('hr'), HRRequestController.getMyRequests);
router.get('/config-requests/stats', authenticateToken, authorizeRoles('hr'), HRRequestController.getMyStats);
router.get('/config-requests/:id', authenticateToken, authorizeRoles('hr'), HRRequestController.getRequestById);

module.exports = router;