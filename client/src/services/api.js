import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const textService = {
  analyzeText: (text) => {
    return api.post('/analyze/text', { text });
  }
};

export default api; 