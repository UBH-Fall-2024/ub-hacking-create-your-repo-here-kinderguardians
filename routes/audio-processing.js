const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { PythonShell } = require('python-shell');

// Configure multer for audio file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Audio processing endpoint
router.post('/process', upload.single('audio'), async (req, res) => {
  console.log('Received audio processing request');
  
  if (!req.file) {
    console.log('No file uploaded');
    return res.status(400).json({ error: 'No audio file uploaded' });
  }

  console.log('File uploaded:', req.file.path);

  try {
    const options = {
      mode: 'text',
      pythonPath: 'python',
      scriptPath: path.join(__dirname, '../services/model'),
      args: [path.resolve(req.file.path)]
    };

    console.log('Running Python script with options:', {
      scriptPath: options.scriptPath,
      args: options.args
    });

    PythonShell.run('process_audio.py', options, (err, results) => {
      if (err) {
        console.error('Python processing error:', err);
        return res.status(500).json({ error: 'Failed to process audio' });
      }

      console.log('Python script results:', results);

      try {
        const result = JSON.parse(results[0]);
        
        // Emit alert if red flag detected
        if (result.is_red_flag && req.app.get('io')) {
          req.app.get('io').emit('alert', {
            type: 'red_flag',
            confidence: result.confidence,
            transcription: result.text,
            timestamp: new Date()
          });
        }

        res.json(result);
      } catch (parseError) {
        console.error('Error parsing Python output:', parseError);
        res.status(500).json({ error: 'Error processing audio results' });
      }
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ 
    status: 'success',
    message: 'Audio processing API is working' 
  });
});

module.exports = router; 