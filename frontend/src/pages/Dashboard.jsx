import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { DocumentTextIcon, KeyIcon, ChartBarIcon, CloudArrowUpIcon, FolderIcon, PlusIcon } from '@heroicons/react/24/outline';
import { uploadDocument, getProjects, createProject, getDashboardStats } from '../utils/api';

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

  // Stats State
  const [stats, setStats] = useState({
    totalDocuments: 0,
    processingDocuments: 0,
    apiKeys: 0,
    totalApiCalls: 0,
    readyDocuments: 0
  });

  // Load stats from API
  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
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
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      const result = await uploadDocument(file, projectId);
      setUploadProgress(100);

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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Overview of your document intelligence status.</p>
      </div>

      {/* Upload Section Card */}
      <div className="card-premium-no-hover p-8 relative overflow-hidden backdrop-blur-md bg-white/50 dark:bg-[#0f172a]/40">
        <div className="flex flex-col items-center justify-center text-center max-w-lg mx-auto">
          <div className="p-4 rounded-2xl mb-5 bg-blue-50 dark:bg-blue-950/35 text-blue-600 dark:text-blue-400 shadow-inner">
            <CloudArrowUpIcon className="h-8 w-8" />
          </div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Upload Document
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium leading-relaxed">
            Drag & drop or browse to process your file. Supported formats: PDF, DOCX, XLSX, CSV, JPG, PNG, GIF. (Max 10MB)
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.docx,.xlsx,.csv,.jpg,.jpeg,.png,.gif"
              className="hidden"
              id="document-upload"
            />
            <label
              htmlFor="document-upload"
              className="flex-1 w-full px-5 py-3 rounded-xl cursor-pointer font-semibold transition-all duration-200 text-center text-sm border bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800/80 dark:hover:text-white truncate"
            >
              {file ? file.name : 'Choose File'}
            </label>
            <button
              onClick={handleInitiateUpload}
              disabled={!file || isUploading}
              className="w-full sm:w-auto btn-primary py-3 px-8 text-sm"
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>

          {isUploading && (
            <div className="mt-8 w-full">
              <div className="w-full rounded-full h-1.5 bg-slate-100 dark:bg-slate-800">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs mt-3 font-semibold text-blue-600 dark:text-blue-400">
                {uploadProgress}% Uploading...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Documents */}
        <div className="card-premium p-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Documents</p>
            <p className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {stats.totalDocuments}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/45 text-blue-600 dark:text-blue-400">
            <DocumentTextIcon className="h-6 w-6" />
          </div>
        </div>

        {/* Processing Status */}
        <div className="card-premium p-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Processing</p>
            <p className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {stats.processingDocuments}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/45 text-amber-600 dark:text-amber-400">
            <div className="flex items-center justify-center h-6 w-6">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
              </span>
            </div>
          </div>
        </div>

        {/* API Keys */}
        <div className="card-premium p-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">API Keys</p>
            <p className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {stats.apiKeys}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/45 text-purple-600 dark:text-purple-400">
            <KeyIcon className="h-6 w-6" />
          </div>
        </div>

        {/* Total API Calls */}
        <div className="card-premium p-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">API Calls</p>
            <p className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {stats.totalApiCalls}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/45 text-emerald-600 dark:text-emerald-400">
            <ChartBarIcon className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Select Project Modal Portal */}
      {showProjectModal && createPortal(
        <div className="backdrop-glass" onClick={() => { setShowProjectModal(false); setIsCreatingProject(false); }}>
          <div className="modal-theme" onClick={e => e.stopPropagation()}>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Select Project
              </h3>
              <p className="mb-6 text-sm text-slate-500 dark:text-slate-400 font-medium">
                Choose a project to add this document to, or create a new one.
              </p>

              {!isCreatingProject ? (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Existing Projects
                    </label>
                    <select
                      className="input-premium focus:ring-4 focus:ring-blue-500/10"
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
                    <div className="flex-grow border-t border-slate-100 dark:border-slate-800/60"></div>
                    <span className="px-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">OR</span>
                    <div className="flex-grow border-t border-slate-100 dark:border-slate-800/60"></div>
                  </div>

                  <button
                    onClick={() => setIsCreatingProject(true)}
                    className="w-full py-3 px-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-center gap-2 text-sm font-semibold cursor-pointer"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Create New Project
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      New Project Name
                    </label>
                    <input
                      type="text"
                      autoFocus
                      value={newProjectName}
                      onChange={e => setNewProjectName(e.target.value)}
                      placeholder="e.g. Q1 Financials"
                      className="input-premium"
                    />
                    <button
                      onClick={() => setIsCreatingProject(false)}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block"
                    >
                      &larr; Back to select existing
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => setShowProjectModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => isCreatingProject ? handleCreateProjectAndUpload() : executeUpload(selectedProjectId)}
                  disabled={isCreatingProject ? !newProjectName.trim() : !selectedProjectId}
                  className="btn-primary"
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
