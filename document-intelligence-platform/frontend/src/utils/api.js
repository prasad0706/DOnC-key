import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
export const setupAuthInterceptor = (token) => {
  // No-op function for development without authentication
  console.log('Authentication interceptor setup (not used in dev mode)');
};

// Document API
export const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append('document', file);

  try {
    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

export const getDocuments = async () => {
  try {
    const response = await api.get('/documents');
    // Transform backend data to match frontend expectations
    const transformedData = response.data.map(doc => ({
      ...doc,
      id: doc._id,
      name: doc.fileName || doc._id,
      size: formatFileSize(doc.fileSize),
      uploadedAt: doc.createdAt,
    }));
    return transformedData;
  } catch (error) {
    console.error('Get documents error:', error);
    throw error;
  }
};

// Helper function to format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export const getDocumentDetail = async (documentId) => {
  try {
    const response = await api.get(`/documents/${documentId}`);
    // Transform backend data to match frontend expectations
    const doc = response.data;
    return {
      ...doc,
      id: doc._id,
      name: doc.fileName || doc._id,
      size: formatFileSize(doc.fileSize),
      uploadedAt: doc.createdAt,
    };
  } catch (error) {
    console.error('Get document detail error:', error);
    throw error;
  }
};

// API Key API
export const generateApiKey = async (documentId) => {
  try {
    const response = await api.post(`/documents/${documentId}/api-keys`);
    return response.data;
  } catch (error) {
    console.error('Generate API key error:', error);
    throw error;
  }
};

export const getApiKeys = async (documentId) => {
  try {
    const response = await api.get(`/documents/${documentId}/api-keys`);
    return response.data;
  } catch (error) {
    console.error('Get API keys error:', error);
    throw error;
  }
};

export const revokeApiKey = async (documentId, keyId) => {
  try {
    const response = await api.patch(`/documents/${documentId}/api-keys/${keyId}/revoke`);
    return response.data;
  } catch (error) {
    console.error('Revoke API key error:', error);
    throw error;
  }
};

// Usage Analytics API
export const getUsageAnalytics = async () => {
  try {
    const response = await api.get('/usage/analytics');
    return response.data;
  } catch (error) {
    console.error('Get usage analytics error:', error);
    throw error;
  }
};

// User API
export const getUserProfile = async () => {
  try {
    const response = await api.get('/user/profile');
    return response.data;
  } catch (error) {
    console.error('Get user profile error:', error);
    throw error;
  }
};

export default api;
