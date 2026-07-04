require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Route Imports
const authRoutes = require('./routes/auth');
const resumeRoutes = require('./routes/resume');
const careerRoutes = require('./routes/career');
const roadmapRoutes = require('./routes/roadmap');
const interviewRoutes = require('./routes/interview');
const dashboardRoutes = require('./routes/dashboard');

// Express App Initialization
const app = express();

// Connect to MongoDB Database
connectDB();

// Global Middleware
app.use(cors({ origin: '*' })); // Enable CORS for development
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mounting API Routes
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to SkillForge AI Backend API Service' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'An internal server error occurred.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
