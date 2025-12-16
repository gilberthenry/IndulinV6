const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');

async function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    console.log('No token provided');
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      console.log('Token verification failed:', err.message);
      return res.sendStatus(403);
    }
    
    // Check if the user's account is still active and not suspended
    try {
      const employee = await Employee.findByPk(user.id);
      if (!employee) {
        console.log('User not found in database');
        return res.status(401).json({ message: 'User not found' });
      }
      
      if (employee.isSuspended) {
        console.log('Account is suspended:', user.id);
        return res.status(403).json({ 
          message: 'Your account has been disabled. Please contact the administrator.' 
        });
      }
      
      console.log('Authenticated user:', user);
      req.user = user;
      next();
    } catch (dbError) {
      console.error('Database error during authentication:', dbError);
      return res.status(500).json({ message: 'Authentication error' });
    }
  });
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    console.log('Checking role:', req.user?.role, 'against allowed roles:', roles);
    if (!roles.includes(req.user.role)) {
      console.log('Role check failed');
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
    console.log('Role check passed');
    next();
  };
}

module.exports = { authenticateToken, authorizeRoles };