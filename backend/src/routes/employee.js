const express = require('express');
const router = express.Router();
const EmployeeController = require('../controllers/EmployeeController');
const { authenticateToken, authorizeRoles } = require('../middleware/AuthMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for better file handling
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `profile-${req.user.id}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const documentUpload = multer({ dest: 'uploads/' });

// Employee profile
router.get('/profile', authenticateToken, authorizeRoles('employee', 'hr', 'mis'), EmployeeController.getProfile);
router.put('/profile', authenticateToken, authorizeRoles('employee'), EmployeeController.updateProfile);
router.post('/profile/image', authenticateToken, authorizeRoles('employee'), upload.single('profileImage'), EmployeeController.uploadProfileImage);

// Profile change requests
router.post('/profile/request-change', authenticateToken, authorizeRoles('employee'), EmployeeController.requestProfileChange);
router.get('/profile/change-requests', authenticateToken, authorizeRoles('employee'), EmployeeController.getMyChangeRequests);

// Document upload and management
router.get('/documents', authenticateToken, authorizeRoles('employee'), EmployeeController.getDocuments);
router.post('/documents', authenticateToken, authorizeRoles('employee'), documentUpload.single('file'), EmployeeController.uploadDocument);

// Leave requests
router.post('/leave', authenticateToken, authorizeRoles('employee'), EmployeeController.requestLeave);
router.get('/leaves', authenticateToken, authorizeRoles('employee'), EmployeeController.getLeaves);
router.get('/leave-credits', authenticateToken, authorizeRoles('employee'), EmployeeController.getLeaveCredits);

// Contract routes
router.get('/contracts/current', authenticateToken, authorizeRoles('employee'), EmployeeController.getCurrentContract);
router.get('/contracts/past', authenticateToken, authorizeRoles('employee'), EmployeeController.getPastContracts);
router.get('/contracts', authenticateToken, authorizeRoles('employee'), EmployeeController.getAllContracts);
router.get('/contracts/:id/download', authenticateToken, authorizeRoles('employee'), EmployeeController.downloadContractFile);

// Certificate requests
router.post('/certificates/request', authenticateToken, authorizeRoles('employee'), EmployeeController.requestCertificate);
router.get('/certificates/requests', authenticateToken, authorizeRoles('employee'), EmployeeController.getCertificateRequests);
router.get('/certificates/:id/download', authenticateToken, authorizeRoles('employee'), EmployeeController.downloadCertificate);

module.exports = router;