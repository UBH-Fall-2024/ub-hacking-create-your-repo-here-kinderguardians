import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';
import io from 'socket.io-client';
import PropTypes from 'prop-types';

const Alerts = ({ parentId }) => {
  const [alerts, setAlerts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io('http://localhost:5000');

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    socket.on('alert', (newAlert) => {
      setAlerts(prev => [newAlert, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1">
          Status: {isConnected ? 'Connected' : 'Disconnected'}
        </Typography>
      </Box>

      <List>
        {alerts.map((alert) => (
          <ListItem key={alert.id || `${alert.type}-${alert.transcription}`} divider>
            <ListItemText
              primary={alert.type === 'red_flag' ? 'Harmful Content Detected!' : 'Alert'}
              secondary={`${alert.transcription} (Confidence: ${(alert.confidence * 100).toFixed(1)}%)`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

Alerts.propTypes = {
  parentId: PropTypes.string.isRequired,
};

export default Alerts; 