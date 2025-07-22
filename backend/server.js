const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const dashboardRoutes = require('./routes/dashboard');
const { connectToDatabase } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:5175',
    'https://scantovitec.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Test database connection
  try {
    await connectToDatabase();
    console.log('Database connection successful');
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
});