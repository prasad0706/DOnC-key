import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { DocumentTextIcon, KeyIcon, ChartBarIcon, CloudArrowUpIcon, FolderIcon, PlusIcon } from '@heroicons/react/24/outline';
import { uploadDocument, getDocuments, getProjects, createProject } from '../utils/api';

const Dashboard = () => {
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState(null);

  // Project Selection State
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [projectLoading, setProjectLoading] = useState(false);

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

  const fetchProjects = async () => {
    try {
      setProjectLoading(true);
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    } finally {
      setProjectLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleInitiateUpload = async () => {
    if (!file) return;
    await fetchProjects();
    setShowProjectModal(true);
  };

  const handleCreateProjectAndUpload = async () => {
    if (!newProjectName.trim()) return;
    try {
      const newProject = await createProject({ name: newProjectName });
      executeUpload(newProject._id);
    } catch (error) {
      console.error("Failed to create project", error);
    }
  };

  const executeUpload = async (projectId) => {
    if (!file || !projectId) return;

    setShowProjectModal(false);
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
      const result = await uploadDocument(file, projectId);

      // Complete progress
      setUploadProgress(100);

      // Reset after 2 seconds
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setFile(null);
        setSelectedProjectId('');
        setNewProjectName('');
        setIsCreatingProject(false);
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
              onClick={handleInitiateUpload}
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
      {showProjectModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => {
            setShowProjectModal(false);
            setIsCreatingProject(false);
          }}>
          <div className={`w-full max-w-md rounded-xl shadow-2xl overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
            onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Select Project
              </h3>
              <p className={`mb-6 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Choose a project to add this document to, or create a new one.
              </p>

              {!isCreatingProject ? (
                <>
                  <div className="mb-4">
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Existing Projects
                    </label>
                    <select
                      className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                    >
                      <option value="">Select a project...</option>
                      {projects.map(p => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center my-4">
                    <div className={`flex-grow border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}></div>
                    <span className={`px-3 text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>OR</span>
                    <div className={`flex-grow border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}></div>
                  </div>

                  <button
                    onClick={() => setIsCreatingProject(true)}
                    className={`w-full py-2 px-4 rounded-lg border border-dashed flex items-center justify-center gap-2 transition-colors ${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                  >
                    <PlusIcon className="h-5 w-5" />
                    Create New Project
                  </button>
                </>
              ) : (
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    New Project Name
                  </label>
                  <input
                    type="text"
                    autoFocus
                    value={newProjectName}
                    onChange={e => setNewProjectName(e.target.value)}
                    placeholder="e.g. Q1 Financials"
                    className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                  />
                  <button
                    onClick={() => setIsCreatingProject(false)}
                    className={`text-sm mt-2 ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                  >
                    &larr; Back to select existing
                  </button>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => setShowProjectModal(false)}
                  className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => isCreatingProject ? handleCreateProjectAndUpload() : executeUpload(selectedProjectId)}
                  disabled={isCreatingProject ? !newProjectName.trim() : !selectedProjectId}
                  className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isCreatingProject ? 'Create & Upload' : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Dashboard;
