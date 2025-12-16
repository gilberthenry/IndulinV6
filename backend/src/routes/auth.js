const express = require('express');
const AuthController = require('../controllers/AuthController');
const { validateRegistration } = require('../utils/validators');

const router = express.Router();

router.post('/login', AuthController.login);
router.post('/register', validateRegistration, AuthController.register);
router.post('/reset-password', AuthController.resetPassword);
router.post('/refresh', AuthController.refresh);

module.exports = router;