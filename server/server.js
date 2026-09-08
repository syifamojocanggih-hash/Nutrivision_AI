/**
 * ============================================================================
 * NutriVision AI — Production-Grade REST API Backend Server
 * GAYATAMA 5 — International Web Technology Competition
 * Architecture: Node.js (v20+) + Express + MySQL Pool (mysql2)
 * ============================================================================
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Database initialization
const db = require('./database/connection');

// Import Routes
const authRoutes = require('./routes/auth.routes');
const mealsRoutes = require('./routes/meals.routes');
const foodsRoutes = require('./routes/foods.routes');
const cvRoutes = require('./routes/cv.routes');
const caregiverRoutes = require('./routes/caregiver.routes');
const communityRoutes = require('./routes/community.routes');
const telemetryRoutes = require('./routes/telemetry.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all local dev & remote origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Also optionally serve the frontend client directly from parent folder
app.use(express.static(path.join(__dirname, '..')));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api/')) {
      console.log(`[API] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'NutriVision AI Clinical Telehealth API',
    version: '1.0.0',
    port: PORT,
    database: 'MySQL (mysql2 connection pool)',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime())
  });
});

// Register API Routers
app.use('/api/auth', authRoutes);
app.use('/api/meals', mealsRoutes);
app.use('/api/foods', foodsRoutes);
app.use('/api/cv', cvRoutes);
app.use('/api/caregiver', caregiverRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/telemetry', telemetryRoutes);

// 404 for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint API tidak ditemukan: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan internal pada server backend.'
  });
});

// Start listening
app.listen(PORT, () => {
  console.log('============================================================');
  console.log(`🚀 NutriVision AI Backend Server Running!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📁 Database: MySQL (${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME || 'nutrivision_ai'})`);
  console.log('============================================================');
});

module.exports = app;
