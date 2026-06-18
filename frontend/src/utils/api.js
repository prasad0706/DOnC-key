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
// Add auth token to requests
export const setupAuthInterceptor = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Document API
// Document API
export const uploadDocument = async (file, projectId = null, modelSelected = 'gemini-2.5-flash', customSchema = null) => {
  const formData = new FormData();
  if (Array.isArray(file)) {
    file.forEach(f => formData.append('document', f));
  } else {
    formData.append('document', file);
  }
  if (projectId) {
    formData.append('projectId', projectId);
  }
  if (modelSelected) {
    formData.append('modelSelected', modelSelected);
  }
  if (customSchema) {
    formData.append('customSchema', typeof customSchema === 'string' ? customSchema : JSON.stringify(customSchema));
  }

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

// Projects API
export const getProjects = async () => {
  try {
    const response = await api.get('/projects');
    return response.data;
  } catch (error) {
    console.error('Get projects error:', error);
    throw error;
  }
};

export const createProject = async (data) => {
  try {
    const response = await api.post('/projects', data);
    return response.data;
  } catch (error) {
    console.error('Create project error:', error);
    throw error;
  }
};

export const getProjectDetail = async (id) => {
  try {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  } catch (error) {
    console.error('Get project detail error:', error);
    throw error;
  }
};

export const deleteProject = async (id) => {
  try {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete project error:', error);
    throw error;
  }
};

// Document Chat API
export const chatWithDocument = async (documentId, question, chatHistory = []) => {
  try {
    const response = await api.post(`/documents/${documentId}/chat`, { question, chatHistory });
    return response.data;
  } catch (error) {
    console.error('Chat error:', error);
    throw error;
  }
};

// Document Search API
export const searchDocuments = async (query, type = 'text') => {
  try {
    const response = await api.get(`/documents/search?q=${encodeURIComponent(query)}&type=${type}`);
    return response.data;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

// Document Export API
export const exportDocument = async (documentId, format = 'json') => {
  try {
    const response = await api.get(`/documents/${documentId}/export?format=${format}`, {
      responseType: format === 'csv' ? 'blob' : 'json'
    });
    return response.data;
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};

// Dashboard Stats API
export const getDashboardStats = async () => {
  try {
    const response = await api.get('/usage/dashboard-stats');
    return response.data;
  } catch (error) {
    console.error('Dashboard stats error:', error);
    throw error;
  }
};

// Usage Analytics API (with time range)
export const getUsageAnalyticsWithRange = async (range = '30d') => {
  try {
    const response = await api.get(`/usage/analytics?range=${range}`);
    return response.data;
  } catch (error) {
    console.error('Usage analytics error:', error);
    throw error;
  }
};

// Webhooks API
export const getWebhooks = async (projectId) => {
  try {
    const response = await api.get(`/webhooks?projectId=${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Get webhooks error:', error);
    throw error;
  }
};

export const createWebhook = async (data) => {
  try {
    const response = await api.post('/webhooks', data);
    return response.data;
  } catch (error) {
    console.error('Create webhook error:', error);
    throw error;
  }
};

export const deleteWebhook = async (id) => {
  try {
    const response = await api.delete(`/webhooks/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete webhook error:', error);
    throw error;
  }
};

export default api;
