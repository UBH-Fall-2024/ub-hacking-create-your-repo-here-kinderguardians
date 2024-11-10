const express = require('express');
const router = express.Router();
const path = require('path');
const { PythonShell } = require('python-shell');

router.post('/analyze', async (req, res) => {
  const { text } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: 'No text provided' });
  }

  try {
    const options = {
      mode: 'text',
      pythonPath: 'python',
      scriptPath: path.join(__dirname, '../services/model'),
      args: [text]
    };

    PythonShell.run('classify_text.py', options, (err, results) => {
      if (err) {
        console.error('Python processing error:', err);
        return res.status(500).json({ error: 'Failed to analyze text' });
      }

      try {
        const result = JSON.parse(results[0]);
        
        if (result.is_red_flag && req.app.get('io')) {
          req.app.get('io').emit('alert', {
            type: 'red_flag',
            confidence: result.confidence,
            transcription: text,
            timestamp: new Date()
          });
        }

        res.json(result);
      } catch (parseError) {
        console.error('Error parsing Python output:', parseError);
        res.status(500).json({ error: 'Error processing results' });
      }
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 