import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import './Alerts.css';
import PropTypes from 'prop-types';

const Alerts = ({ parentId }) => {
  const [alerts, setAlerts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const socket = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    socket.current = io('http://localhost:5000');

    // Connection handlers
    socket.current.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      setError(null);
      socket.current.emit('parentConnected', parentId);
    });

    socket.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
      setError('Failed to connect to server');
    });

    // Alert handler
    socket.current.on('newAlert', (alert) => {
      setAlerts((prevAlerts) => {
        const newAlert = {
          ...alert,
          id: Date.now(),
          timestamp: new Date().toLocaleString(),
          read: false
        };
        return [newAlert, ...prevAlerts];
      });
      
      // Play notification sound
      playNotificationSound();
    });

    // Cleanup
    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [parentId]);

  // Notification sound function
  const playNotificationSound = () => {
    const audio = new Audio('/notification.mp3');
    audio.play().catch(error => console.error('Failed to play sound:', error));
  };

  // Mark alert as read
  const markAsRead = (alertId) => {
    setAlerts(prevAlerts =>
      prevAlerts.map(alert =>
        alert.id === alertId ? { ...alert, read: true } : alert
      )
    );
  };

  // Clear all alerts
  const clearAlerts = () => {
    setAlerts([]);
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="alerts-container">
      <div className="alerts-header">
        <h2>Alerts Dashboard</h2>
        {isConnected ? (
          <span className="connection-status connected">Connected</span>
        ) : (
          <span className="connection-status disconnected">Disconnected</span>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {alerts.length > 0 && (
        <div className="alerts-actions">
          <button onClick={clearAlerts} className="clear-button">
            Clear All Alerts
          </button>
          <span className="alert-count">
            {alerts.length} Alert{alerts.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      <div className="alerts-list">
        {alerts.length === 0 ? (
          <div className="no-alerts">No alerts to display</div>
        ) : (
          alerts.map((alert) => (
            <button 
              key={alert.id} 
              className={`alert-item ${alert.read ? 'read' : 'unread'}`}
              onClick={() => markAsRead(alert.id)}
              type="button"
              aria-pressed={alert.read}
            >
              <div className="alert-header">
                <span className="alert-timestamp">{formatTimestamp(alert.timestamp)}</span>
                {!alert.read && <span className="unread-badge">New</span>}
              </div>
              <div className="alert-message">{alert.message}</div>
              <div className="alert-transcription">{alert.transcription}</div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

Alerts.propTypes = {
  parentId: PropTypes.string.isRequired
};

export default Alerts; 