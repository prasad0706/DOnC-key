import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { DocumentTextIcon, KeyIcon, ChartBarIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { uploadDocument, getDocuments } from '../utils/api';

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

  // Load real stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const documents = await getDocuments();

        const totalDocuments = documents.length;
        const processingDocuments = documents.filter(doc => doc.status === 'processing' || doc.status === 'queued').length;
        const readyDocuments = documents.filter(doc => doc.status === 'ready').length;

        // For now, using mock values for apiKeys and totalApiCalls since we don't have that API yet
        const stats = {
          totalDocuments,
          processingDocuments,
          apiKeys: 0, // Will need API to fetch this
          totalApiCalls: 0, // Will need API to fetch this
          readyDocuments
        };

        setStats(stats);
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
        // Fallback to mock data if API fails
        const mockStats = {
          totalDocuments: 0,
          processingDocuments: 0,
          apiKeys: 0,
          totalApiCalls: 0,
          readyDocuments: 0
        };
        setStats(mockStats);
      }
    };

    loadStats();
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

  const cardClasses = `p-6 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${theme === 'dark'
      ? 'bg-gray-800 border border-gray-700/50 hover:border-gray-600'
      : 'bg-white border border-gray-100 hover:border-blue-100'
    }`;
  const statTextClasses = theme === 'dark' ? 'text-gray-400 font-medium' : 'text-gray-500 font-medium';

  return (
    <div className="p-6">
      <h1 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Dashboard</h1>

      {/* Upload Section */}
      <div className={`p-8 rounded-2xl mb-8 border-2 border-dashed transition-colors ${theme === 'dark'
          ? 'bg-gray-800/50 border-gray-700 hover:border-blue-500/50 hover:bg-gray-800'
          : 'bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50/30'
        }`}>
        <div className="flex flex-col items-center justify-center text-center">
          <div className={`p-4 rounded-full mb-4 ${theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
            <CloudArrowUpIcon className="h-10 w-10 text-blue-500" />
          </div>

          <h2 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Upload Document
          </h2>
          <p className={`mb-6 max-w-md ${statTextClasses}`}>
            Drag and drop your files here, or click to browse. Supported formats: PDF, JPG, PNG, GIF.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.gif"
              className="hidden"
              id="document-upload"
            />
            <label
              htmlFor="document-upload"
              className={`flex-1 w-full px-6 py-3 rounded-xl cursor-pointer font-medium transition-colors text-center ${theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600'
                  : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm'
                }`}
            >
              {file ? file.name : 'Choose File'}
            </label>
            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className={`w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-blue-500/40 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${(!file || isUploading) ? 'opacity-50 cursor-not-allowed shadow-none' : ''}`}
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>

          {isUploading && (
            <div className="mt-8 w-full max-w-md">
              <div className={`w-full rounded-full h-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className={`text-sm mt-3 font-medium ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                {uploadProgress}% complete
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Documents */}
        <div className={cardClasses}>
          <div className="flex items-center justify-between">
            <div>
              <p className={statTextClasses}>Total Documents</p>
              <p className={`text-4xl font-bold mt-2 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalDocuments}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
              <DocumentTextIcon className="h-8 w-8" />
            </div>
          </div>
        </div>

        {/* Processing Status */}
        <div className={cardClasses}>
          <div className="flex items-center justify-between">
            <div>
              <p className={statTextClasses}>Processing</p>
              <p className={`text-4xl font-bold mt-2 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {stats.processingDocuments}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-50 text-yellow-600'}`}>
              <div className="flex items-center justify-center h-8 w-8">
                <div className="h-3 w-3 rounded-full bg-current animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* API Keys */}
        <div className={cardClasses}>
          <div className="flex items-center justify-between">
            <div>
              <p className={statTextClasses}>API Keys</p>
              <p className={`text-4xl font-bold mt-2 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {stats.apiKeys}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
              <KeyIcon className="h-8 w-8" />
            </div>
          </div>
        </div>

        {/* Total API Calls */}
        <div className={cardClasses}>
          <div className="flex items-center justify-between">
            <div>
              <p className={statTextClasses}>API Calls</p>
              <p className={`text-4xl font-bold mt-2 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalApiCalls}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-600'}`}>
              <ChartBarIcon className="h-8 w-8" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
