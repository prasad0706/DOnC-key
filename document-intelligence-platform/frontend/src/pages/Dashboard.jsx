import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { DocumentTextIcon, KeyIcon, ChartBarIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { uploadDocument } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState(null);

  // Mock data for dashboard cards
  const [stats, setStats] = useState({
    totalDocuments: 0,
    processingDocuments: 0,
    apiKeys: 0,
    totalApiCalls: 0,
    readyDocuments: 0
  });

  // Mock data loading
  useEffect(() => {
    // In a real app, this would be an API call
    const mockStats = {
      totalDocuments: 12,
      processingDocuments: 2,
      apiKeys: 5,
      totalApiCalls: 47,
      readyDocuments: 10
    };
    setStats(mockStats);
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      // Actual upload
      const result = await uploadDocument(file);

      // Complete progress
      setUploadProgress(100);

      // Reset after 2 seconds
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setFile(null);
      }, 2000);

      console.log('Upload result:', result);
    } catch (error) {
      console.error('Upload failed:', error);
      setIsUploading(false);
    }
  };

  const cardClasses = `p-6 rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`;
  const statTextClasses = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';

  return (
    <div className="p-6">
      <h1 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Dashboard</h1>

      {/* Upload Section */}
      <div className={cardClasses + ' mb-6'}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Upload Document</h2>
          <CloudArrowUpIcon className="h-6 w-6 text-blue-500" />
        </div>

        <div className="flex items-center space-x-4">
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png,.gif"
            className="hidden"
            id="document-upload"
          />
          <label
            htmlFor="document-upload"
            className={`flex-1 px-4 py-2 border rounded-md cursor-pointer ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
          >
            {file ? file.name : 'Choose a file (PDF, JPG, PNG, GIF)'}
          </label>
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${(!file || isUploading) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>

        {isUploading && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className={`text-sm mt-1 ${statTextClasses}`}>{uploadProgress}% complete</p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Documents */}
        <div className={cardClasses}>
          <div className="flex items-center justify-between">
            <div>
              <p className={statTextClasses}>Total Documents</p>
              <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalDocuments}
              </p>
            </div>
            <DocumentTextIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        {/* Processing Status */}
        <div className={cardClasses}>
          <div className="flex items-center justify-between">
            <div>
              <p className={statTextClasses}>Processing</p>
              <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {stats.processingDocuments}
              </p>
            </div>
            <div className="flex items-center">
              <span className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></span>
              <span className="text-sm text-gray-400">Queued</span>
            </div>
          </div>
        </div>

        {/* API Keys */}
        <div className={cardClasses}>
          <div className="flex items-center justify-between">
            <div>
              <p className={statTextClasses}>API Keys</p>
              <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {stats.apiKeys}
              </p>
            </div>
            <KeyIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        {/* Total API Calls */}
        <div className={cardClasses}>
          <div className="flex items-center justify-between">
            <div>
              <p className={statTextClasses}>API Calls</p>
              <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalApiCalls}
              </p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
