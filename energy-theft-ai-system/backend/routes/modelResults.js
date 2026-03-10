const express = require('express');
const router = express.Router();
const { getModelResults } = require('../controllers/modelResultsController');

router.get('/model-results', getModelResults);

module.exports = router;
