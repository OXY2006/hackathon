const express = require('express');
const router = express.Router();
const multer = require('multer');
const { handleUpload } = require('../controllers/uploadController');

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

router.post('/upload', upload.single('file'), handleUpload);

module.exports = router;
