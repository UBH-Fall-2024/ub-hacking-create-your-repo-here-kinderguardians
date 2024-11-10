const express = require('express');
const router = express.Router();
const path = require('path');
const { PythonShell } = require('python-shell');

// Text processing endpoint
router.post('/process', async (req, res) => {
  console.log('Received text processing request');
  
  const { text } = req.body;
  if (!text) {
    console.log('No text provided');
    return res.status(400).json({ error: 'No text provided' });
  }

  console.log('Text received:', text);

  try {
    const options = {
      mode: 'text',
      pythonPath: 'python',
      scriptPath: path.join(__dirname, '../services/model'),
      args: [text]
    };

    console.log('Running Python script with options:', {
      scriptPath: options.scriptPath,
      args: options.args
    });

    PythonShell.run('classify_text.py', options, (err, results) => {
      if (err) {
        console.error('Python processing error:', err);
        return res.status(500).json({ error: 'Failed to process text' });
      }

      console.log('Python script completed successfully');
      return res.status(200).json({ results });
    });
  } catch (error) {
    console.error('Error processing text:', error);
    return res.status(500).json({ error: 'Failed to process text' });
  }
}); 