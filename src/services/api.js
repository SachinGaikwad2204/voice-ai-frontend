import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/voice';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const voiceApi = {
  sendMessage: async (message, sessionId = null, language = 'en') => {
    try {
      console.log('Sending message:', { message, sessionId, language });
      const response = await api.post('/chat', {
        message,
        sessionId: sessionId || undefined,
        language: language
      });
      console.log('API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error.response?.data || error.message;
    }
  },
  getHistory: async (sessionId) => {
    try {
      const response = await api.get(`/history/${sessionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  getIntents: async () => {
    try {
      const response = await api.get('/intents');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  trainModel: async () => {
    try {
      const response = await api.post('/train/auto');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  healthCheck: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  getTrainingStatus: async () => {
    try {
      const response = await api.get('/train/status');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default api;
