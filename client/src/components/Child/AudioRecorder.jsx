import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Button, Box, CircularProgress, Typography } from '@mui/material';

const AudioRecorder = ({ userId }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      setErrorMessage('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.wav');
          formData.append('userId', userId);

          setStatus('processing');
          
          const response = await fetch('http://localhost:5000/api/audio/process', {
            method: 'POST',
            body: formData,
            headers: {
              'Accept': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          setStatus(result.is_red_flag ? 'red-flag' : 'green-flag');
          setTimeout(() => setStatus('idle'), 3000);
        } catch (error) {
          console.error('Error processing audio:', error);
          setErrorMessage(error.message || 'Error processing audio');
          setStatus('error');
        } finally {
          // Clean up the media stream
          stream.getTracks().forEach(track => track.stop());
        }
      };

      // Start recording with a time slice of 1 second
      mediaRecorderRef.current.start(1000);
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setErrorMessage('Error accessing microphone. Please ensure microphone permissions are granted.');
      setStatus('error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <Button
        variant="contained"
        color={isRecording ? 'secondary' : 'primary'}
        onClick={isRecording ? stopRecording : startRecording}
        disabled={status === 'processing'}
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </Button>

      {status === 'processing' && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={20} />
          <Typography>Processing audio...</Typography>
        </Box>
      )}

      {status === 'red-flag' && (
        <Typography color="error">Alert: Potentially harmful content detected!</Typography>
      )}

      {status === 'green-flag' && (
        <Typography color="success.main">All clear - No issues detected</Typography>
      )}

      {status === 'error' && (
        <Typography color="error">{errorMessage}</Typography>
      )}
    </Box>
  );
};

AudioRecorder.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default AudioRecorder; 