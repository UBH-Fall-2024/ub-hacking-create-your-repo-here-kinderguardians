const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { PythonShell } = require('python-shell');

// Configure multer for audio file uploads
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Audio processing endpoint
router.post('/process', upload.single('audioData'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const audioPath = req.file.path;
    const options = {
      mode: 'json',
      pythonPath: 'python',
      scriptPath: path.join(__dirname, '../services/model'),
      args: [audioPath]
    };

    PythonShell.run('model_service.py', options, (err, results) => {
      if (err) {
        console.error('Python processing error:', err);
        return res.status(500).json({ error: 'Failed to process audio' });
      }

      const result = results[0];

      // Emit alert if red flag detected
      if (result.is_red_flag && req.app.get('io')) {
        req.app.get('io').emit('newAlert', {
          type: 'red_flag',
          message: 'Potentially harmful content detected',
          transcription: result.text,
          confidence: result.confidence,
          timestamp: new Date()
        });
      }

      res.json(result);
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 