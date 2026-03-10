const express = require('express');
const router = express.Router();
const { detectAnomalies } = require('../controllers/anomalyController');

router.post('/detect', detectAnomalies);

module.exports = router;
