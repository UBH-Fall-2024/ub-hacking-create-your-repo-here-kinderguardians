import React, { useState } from 'react';
import { Box, Container, Typography, Paper, Grid } from '@mui/material';
import Alerts from './Parent/Alerts';
import { TextField, Button } from '@mui/material';

const Dashboard = () => {
  const [text, setText] = useState('');
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAnalyze = async () => {
    setIsProcessing(true);
    try {
      const { data } = await textService.analyzeText(text);
      setAnalysisResults(data);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ flexGrow: 1, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          KinderGuardians Dashboard
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Text Analysis
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                placeholder="Enter text to analyze..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button 
                variant="contained" 
                fullWidth 
                onClick={handleAnalyze}
                disabled={isProcessing || !text.trim()}
              >
                {isProcessing ? 'Processing...' : 'Analyze Text'}
              </Button>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Alert System
              </Typography>
              <Alerts />
            </Paper>
          </Grid>
          
          {analysisResults && (
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Analysis Results
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography>
                    Status: {analysisResults.is_red_flag ? 
                      <span style={{ color: 'red' }}>⚠️ Red Flag</span> : 
                      <span style={{ color: 'green' }}>✅ Safe</span>}
                  </Typography>
                  <Typography>
                    Green Flag Probability: {(analysisResults.green_flag_prob * 100).toFixed(2)}%
                  </Typography>
                  <Typography>
                    Red Flag Probability: {(analysisResults.red_flag_prob * 100).toFixed(2)}%
                  </Typography>
                  <Typography>
                    Confidence: {(analysisResults.confidence * 100).toFixed(2)}%
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard; 