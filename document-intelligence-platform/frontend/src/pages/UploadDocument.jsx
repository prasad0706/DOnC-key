import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { DocumentTextIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { uploadDocument } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const UploadDocument = () => {
  const { theme } = useTheme();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

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
      clearInterval(interval);

      console.log('Upload result:', result);

      // Navigate back to documents after a short delay
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setFile(null);
        navigate('/documents'); // Navigate back to documents page
      }, 2000);

    } catch (error) {
      console.error('Upload failed:', error);
      setError(error.message || 'Upload failed');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const cardClasses = `p-6 rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`;
  const statTextClasses = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className={`mr-4 p-2 rounded-md ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Upload Document</h1>
      </div>

      {error && (
        <div className={`mb-4 p-3 rounded-md ${theme === 'dark' ? 'bg-red-900/20 text-red-400' : 'bg-red-100 text-red-700'}`}>
          {error}
        </div>
      )}

      <div className={cardClasses}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Upload New Document</h2>
          <CloudArrowUpIcon className="h-6 w-6 text-blue-500" />
        </div>

        <div className="mb-4">
          <p className={statTextClasses}>
            Supported formats: PDF, JPG, JPEG, PNG, GIF (Max size: 10MB)
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png,.gif"
            className="hidden"
            id="document-upload"
            disabled={isUploading}
          />
          <label
            htmlFor="document-upload"
            className={`flex-1 px-4 py-2 border rounded-md cursor-pointer transition-colors ${
              theme === 'dark' 
                ? (isUploading ? 'border-gray-600 bg-gray-700 text-gray-400' : 'border-gray-600 bg-gray-700 text-white hover:bg-gray-600') 
                : (isUploading ? 'border-gray-300 bg-gray-100 text-gray-400' : 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50')
            }`}
          >
            {file ? file.name : 'Choose a file (PDF, JPG, PNG, GIF)'}
          </label>
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md transition-colors ${
              (!file || isUploading) 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-blue-700'
            }`}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>

        {isUploading && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className={`text-sm mt-1 ${statTextClasses}`}>{uploadProgress}% complete</p>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          <h3 className="font-medium mb-2">About document upload:</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Your document will be securely processed in the background</li>
            <li>You can track the processing status on the Documents page</li>
            <li>Once processing is complete, you can generate API keys for the document</li>
            <li>All documents are processed using AI to extract structured data</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UploadDocument;