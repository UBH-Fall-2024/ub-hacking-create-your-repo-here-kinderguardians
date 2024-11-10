import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (passcode) => api.post('/auth/login', { passcode }),
  createAccount: (userData) => api.post('/auth/register', userData),
};

export const parentService = {
  getFlaggedSpeech: () => api.get('/parent/flagged-speech'),
  getChildLocation: (childId) => api.get(`/parent/child-location/${childId}`),
  getVoiceClip: (clipId) => api.get(`/parent/voice-clip/${clipId}`),
};

export const audioService = {
  processAudio: (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    
    return api.post('/audio/process', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
};

export const textService = {
  analyzeText: (text) => {
    return api.post('/analyze/text', { text });
  }
};

export default api; 