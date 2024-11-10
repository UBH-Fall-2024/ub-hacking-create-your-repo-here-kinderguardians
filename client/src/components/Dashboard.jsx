import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  TextField, 
  Button,
  Alert,
  CircularProgress,
  Divider 
} from '@mui/material';
import Alerts from './Parent/Alerts';
import { textService } from '../services/api';

const Dashboard = () => {
  const [text, setText] = useState('');
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      console.log('Sending text for analysis:', text);
      const { data } = await textService.analyzeText(text);
      console.log('Received analysis results:', data);
      setAnalysisResults(data);
    } catch (error) {
      console.error('Analysis failed:', error);
      setError('Failed to analyze text. Please try again.');
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
          {/* Input Section */}
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
                {isProcessing ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} color="inherit" />
                    <span>Processing...</span>
                  </Box>
                ) : (
                  'Analyze Text'
                )}
              </Button>

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
            </Paper>
          </Grid>

          {/* Alerts Section */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Alert System
              </Typography>
              <Alerts />
            </Paper>
          </Grid>

          {/* Analysis Results Section */}
          {analysisResults && (
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Analysis Results
                </Typography>
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={2}>
                  {/* Status */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1" component="span">
                        Status:
                      </Typography>
                      {analysisResults.is_red_flag ? (
                        <Alert severity="error" sx={{ flex: 1 }}>
                          ⚠️ Red Flag Detected
                        </Alert>
                      ) : (
                        <Alert severity="success" sx={{ flex: 1 }}>
                          ✅ Content Appears Safe
                        </Alert>
                      )}
                    </Box>
                  </Grid>

                  {/* Confidence Scores */}
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Safe Content Probability
                      </Typography>
                      <Typography variant="h4" color="success.main">
                        {(analysisResults.green_flag_prob * 100).toFixed(1)}%
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Risk Probability
                      </Typography>
                      <Typography variant="h4" color="error.main">
                        {(analysisResults.red_flag_prob * 100).toFixed(1)}%
                      </Typography>
                    </Paper>
                  </Grid>

                  {/* Analyzed Text */}
                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Analyzed Text
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          bgcolor: 'grey.100', 
                          p: 2, 
                          borderRadius: 1,
                          whiteSpace: 'pre-wrap'
                        }}
                      >
                        {analysisResults.text}
                      </Typography>
                    </Paper>
                  </Grid>

                  {/* Overall Confidence */}
                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Model Confidence
                      </Typography>
                      <Typography variant="h5">
                        {(analysisResults.confidence * 100).toFixed(1)}%
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;