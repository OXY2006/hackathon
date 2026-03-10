const express = require('express');
const cors = require('cors');
const path = require('path');
const uploadRoutes = require('./routes/upload');
const anomalyRoutes = require('./routes/anomaly');
const reportRoutes = require('./routes/report');
const modelResultsRoutes = require('./routes/modelResults');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ extended: true, limit: '200mb' }));

// In-memory store for analysis results
global.analysisStore = {};
global.meterDataStore = {};

// Routes
app.use('/api', uploadRoutes);
app.use('/api', anomalyRoutes);
app.use('/api', reportRoutes);
app.use('/api', modelResultsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'energy-theft-backend' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
