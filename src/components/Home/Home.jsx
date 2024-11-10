import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Typography, Box } from '@mui/material';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          KinderGuardians
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Protecting children in the digital age
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            Go to Dashboard
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Home; 