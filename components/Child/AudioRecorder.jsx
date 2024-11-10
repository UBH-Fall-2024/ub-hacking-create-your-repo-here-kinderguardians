import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import PropTypes from 'prop-types';

const AudioRecorder = ({ userId }) => {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const socket = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    socket.current = io('http://localhost:5000');
    
    socket.current.on('connect', () => {
      console.log('Socket connected');
      socket.current.emit('childConnected', userId);
    });

    socket.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setError('Connection failed');
    });

    socket.current.on('recordingStatus', async (status) => {
      setRecording(status);
      if (status) {
        await startRecording();
      } else {
        stopRecording();
      }
    });

    // Cleanup function
    return () => {
      stopRecording();
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [userId]);

  const startRecording = async () => {
    try {
      // Get audio stream
      streamRef.current = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        echoCancellation: true,
        noiseSuppression: true
      });

      // Create media recorder
      mediaRecorderRef.current = new MediaRecorder(streamRef.current);
      const audioChunks = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          const audioFile = new File([audioBlob], 'audio.webm', { 
            type: 'audio/webm',
            lastModified: Date.now()
          });

          const formData = new FormData();
          formData.append('audioData', audioFile);
          formData.append('userId', userId);

          const response = await axios.post('http://localhost:5000/api/audio', formData, {
            headers: { 
              'Content-Type': 'multipart/form-data'
            },
            timeout: 10000 // 10 second timeout
          });

          console.log('Audio processed:', response.data);
        } catch (error) {
          console.error('Error sending audio:', error);
          setError('Failed to send audio');
        }
      };

      mediaRecorderRef.current.start(1000); // Collect data every second
      setError(null);
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Failed to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    // Stop all audio tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  // Optional: Visual feedback component
  return (
    <div className="audio-recorder">
      {recording && (
        <div className="recording-indicator">
          Recording... 🎤
        </div>
      )}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
};

AudioRecorder.propTypes = {
  userId: PropTypes.string.isRequired
};

export default AudioRecorder; 