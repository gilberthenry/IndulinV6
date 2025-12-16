const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');
const env = require('../config/env');
const { generateTokens } = require('../utils/tokenUtils');
const { createAuditLog } = require('../middleware/AuditMiddleware');

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const employee = await Employee.findOne({ where: { email } });
      if (!employee) return res.status(401).json({ message: 'Invalid credentials' });

      // Check if account is suspended/disabled
      if (employee.isSuspended) {
        return res.status(403).json({ 
          message: 'Your account has been disabled. Please contact the administrator.' 
        });
      }

      const isValid = await bcrypt.compare(password, employee.password);
      if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

      const { accessToken, refreshToken } = generateTokens(employee);
      const user = { 
        id: employee.id, 
        role: employee.role, 
        email: employee.email, 
        fullName: employee.fullName,
        profileImage: employee.profileImage 
      };
      
      // Log successful login
      await createAuditLog(employee.id, employee.role, `User logged in: ${employee.email}`);
      
      res.json({ token: accessToken, refreshToken, user });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  async register(req, res) {
    try {
      const { name, email, password } = req.body;

      // Check if user already exists
      const existingEmployee = await Employee.findOne({ where: { email } });
      if (existingEmployee) {
        return res.status(400).json({ message: 'An account with this email already exists.' });
      }

      const employeeId = 'EMP' + Date.now();
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create new employee with default 'employee' role
      const newEmployee = await Employee.create({
        employeeId,
        fullName: name,
        email,
        password: hashedPassword,
        role: 'employee', // Default role
      });

      // Generate tokens and send response
      const { accessToken, refreshToken } = generateTokens(newEmployee);
      const user = { 
        id: newEmployee.id, 
        role: newEmployee.role, 
        email: newEmployee.email, 
        fullName: newEmployee.fullName,
        profileImage: newEmployee.profileImage 
      };
      
      // Log new registration
      await createAuditLog(newEmployee.id, newEmployee.role, `New user registered: ${newEmployee.email}`);
      
      res.status(201).json({ token: accessToken, refreshToken, user });
    } catch (error) {
      console.error('Registration Error:', error);
      res.status(500).json({ message: 'Server error during registration' });
    }
  }

  async resetPassword(req, res) {
    // Implement password reset logic
    res.json({ message: 'Password reset not implemented' });
  }

  async refresh(req, res) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) return res.status(401).json({ error: 'No refresh token' });

      jwt.verify(refreshToken, env.JWT_REFRESH_SECRET, async (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid refresh token' });

        // Get user role from database
        const employee = await Employee.findByPk(decoded.id);
        if (!employee) return res.status(404).json({ error: 'User not found' });

        // Check if account is suspended/disabled
        if (employee.isSuspended) {
          return res.status(403).json({ 
            error: 'Your account has been disabled. Please contact the administrator.' 
          });
        }

        const accessToken = jwt.sign(
          { id: decoded.id, role: employee.role },
          env.JWT_SECRET,
          { expiresIn: '15m' }
        );

        res.json({ accessToken });
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = new AuthController();