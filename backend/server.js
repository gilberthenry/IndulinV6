const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const sequelize = require('./src/config/db');
const models = require('./src/models');
const ContractService = require('./src/services/ContractService');

// Import routes
const authRoutes = require('./src/routes/auth');
const employeeRoutes = require('./src/routes/employee');
const hrRoutes = require('./src/routes/hr');
const misRoutes = require('./src/routes/mis');
const notificationRoutes = require('./src/routes/notifications');
const certificateRoutes = require('./src/routes/certificate');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/mis', misRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/certificates', certificateRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Database connection and server start
const PORT = process.env.PORT || 5000;

sequelize.sync()
  .then(() => {
    console.log('Database connected successfully');
    
    // Start server
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Schedule contract expiration check (runs daily at midnight)
    const scheduleContractCheck = () => {
      const now = new Date();
      const night = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1, // tomorrow
        0, 0, 0 // midnight
      );
      const msToMidnight = night.getTime() - now.getTime();

      setTimeout(() => {
        ContractService.checkExpiredContracts()
          .then(result => {
            console.log('Contract expiration check:', result);
          })
          .catch(err => {
            console.error('Error in contract expiration check:', err);
          });
        
        // Schedule next check (every 24 hours)
        setInterval(() => {
          ContractService.checkExpiredContracts()
            .then(result => {
              console.log('Contract expiration check:', result);
            })
            .catch(err => {
              console.error('Error in contract expiration check:', err);
            });
        }, 24 * 60 * 60 * 1000); // 24 hours
      }, msToMidnight);
    };

    // Run contract check on startup and schedule daily checks
    ContractService.checkExpiredContracts()
      .then(result => {
        console.log('Initial contract expiration check:', result);
        scheduleContractCheck();
      })
      .catch(err => {
        console.error('Error in initial contract expiration check:', err);
        scheduleContractCheck();
      });
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  });

module.exports = { app, io };
