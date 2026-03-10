const express = require('express');
const router = express.Router();
const { getReport } = require('../controllers/reportController');

router.get('/report/:meter_id', getReport);

module.exports = router;
