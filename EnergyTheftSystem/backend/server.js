const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
const PORT = process.env.PORT || 5000;
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

console.log(`Backend initialized. PORT: ${PORT}, ML_SERVICE_URL: ${ML_SERVICE_URL}`);
app.use(cors());
app.use(express.json());

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// GET model-info
app.get('/model-info', (req, res) => {
  try {
    const configPath = path.join(__dirname, '../models/model_config.json');
    if (fs.existsSync(configPath)) {
      const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      res.json(configData);
    } else {
      res.status(404).json({ error: 'Model config not found' });
    }
  } catch (error) {
    console.error('Error reading model config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST predict
app.post('/predict', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No CSV file uploaded' });
  }

  try {
    // Read the uploaded file
    const filePath = req.file.path;
    const fileContent = fs.readFileSync(filePath);
    
    // Create form data to send to ML service
    const form = new FormData();
    form.append('file', fileContent, req.file.originalname);
    
    // Call Python ML service
    console.log(`Sending file to ML service at ${ML_SERVICE_URL}/predict`);
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, form, {
      headers: {
        ...form.getHeaders()
      }
    });
    
    // Clean up temporary file
    fs.unlinkSync(filePath);
    
    // Return predictions
    res.json(mlResponse.data);
  } catch (error) {
    console.error('Error during prediction:', error.message);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    if (error.response && error.response.data) {
       return res.status(error.response.status || 500).json(error.response.data);
    }
    res.status(500).json({ error: 'Failed to communicate with ML service' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
