const express = require('express');
const router = express.Router();
const { PythonShell } = require('python-shell');
const path = require('path');

router.post('/text', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }

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

      const result = results[0];
      res.json(result);
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 