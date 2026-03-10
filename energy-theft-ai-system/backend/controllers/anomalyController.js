const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const detectAnomalies = async (req, res) => {
  try {
    const { data } = req.body;
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ error: 'No meter data provided' });
    }

    console.log(`Sending ${data.length} readings to AI service for analysis...`);

    // Forward to AI microservice
    const response = await axios.post(`${AI_SERVICE_URL}/analyze`, {
      meter_data: data
    }, {
      timeout: 300000, // 5 min timeout for large datasets
      maxContentLength: 200 * 1024 * 1024,
      maxBodyLength: 200 * 1024 * 1024,
    });

    const results = response.data;

    // Cache results
    if (results.meters) {
      results.meters.forEach(meter => {
        global.analysisStore[meter.meter_id] = meter;
      });
    }

    console.log(`Analysis complete: ${results.meters?.length || 0} meters analyzed`);

    res.json(results);
  } catch (err) {
    console.error('AI service error:', err.message);
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        error: 'AI service is not running. Start it with: cd ai-service && uvicorn main:app --port 8000' 
      });
    }
    res.status(500).json({ error: 'Anomaly detection failed: ' + err.message });
  }
};

module.exports = { detectAnomalies };
