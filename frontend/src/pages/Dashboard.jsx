import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { DocumentTextIcon, KeyIcon, ChartBarIcon, CloudArrowUpIcon, PlusIcon } from '@heroicons/react/24/outline';
import { uploadDocument, getProjects, createProject, getDashboardStats } from '../utils/api';

const Dashboard = () => {
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

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

  // Escape key handler for Modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showProjectModal) {
        setShowProjectModal(false);
        setIsCreatingProject(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showProjectModal]);

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

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
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
        <h1 className="text-3xl font-display font-semibold tracking-tight text-[var(--ink)]">The Intake Desk</h1>
        <p className="text-sm text-[var(--ink-muted)] mt-1 font-medium">Overview of document intake records & data status.</p>
      </div>

      {/* Upload Drop Zone Card */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`card p-8 transition-colors ${
          isDragging
            ? 'border-2 border-solid border-[var(--accent-teal)] bg-[var(--surface-sunken)]'
            : 'border-2 border-dashed border-[var(--border)] bg-[var(--surface)]'
        }`}
      >
        <div className="flex flex-col items-center justify-center text-center max-w-lg mx-auto">
          <div className="p-4 rounded-full mb-4 border border-[var(--border)] bg-[var(--surface-sunken)] text-[var(--accent-teal)]">
            <CloudArrowUpIcon className="h-8 w-8" />
          </div>

          <h2 className="text-xl font-display font-semibold text-[var(--ink)] mb-2">
            Intake Document
          </h2>
          <p className="text-sm text-[var(--ink-muted)] mb-6 font-medium leading-relaxed">
            Drag & drop or browse to submit files to the registry. Formats: PDF, DOCX, XLSX, CSV, JPG, PNG. (Max 10MB)
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
              className="flex-1 w-full px-4 py-2.5 rounded cursor-pointer font-semibold transition-all text-center text-sm border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--surface-sunken)] truncate"
            >
              {file ? file.name : 'Select File'}
            </label>
            <button
              onClick={handleInitiateUpload}
              disabled={!file || isUploading}
              className="w-full sm:w-auto btn-primary py-2.5 px-8 text-sm"
            >
              {isUploading ? 'Uploading...' : 'Submit to Registry'}
            </button>
          </div>

          {isUploading && (
            <div className="mt-6 w-full">
              <div className="w-full rounded-full h-2 bg-[var(--surface-sunken)] border border-[var(--border)] overflow-hidden">
                <div
                  className="bg-[var(--accent-teal)] h-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs mt-2 font-mono font-semibold text-[var(--accent-teal)]">
                {uploadProgress}% Processing Intake...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Documents */}
        <div className="card p-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">Total Documents</p>
            <p className="text-3xl font-display font-semibold text-[var(--ink)]">
              {stats.totalDocuments}
            </p>
          </div>
          <div className="p-3.5 rounded-full border border-[var(--border)] bg-[var(--surface-sunken)] text-[var(--accent-teal)]">
            <DocumentTextIcon className="h-6 w-6" />
          </div>
        </div>

        {/* Processing Status */}
        <div className="card p-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">Processing</p>
            <p className="text-3xl font-display font-semibold text-[var(--ink)]">
              {stats.processingDocuments}
            </p>
          </div>
          <div className="p-3.5 rounded-full border border-[var(--border)] bg-[var(--surface-sunken)] text-[var(--accent-ochre)]">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-ochre)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[var(--accent-ochre)]"></span>
            </span>
          </div>
        </div>

        {/* API Keys */}
        <div className="card p-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">API Keys</p>
            <p className="text-3xl font-display font-semibold text-[var(--ink)]">
              {stats.apiKeys}
            </p>
          </div>
          <div className="p-3.5 rounded-full border border-[var(--border)] bg-[var(--surface-sunken)] text-[var(--accent-teal)]">
            <KeyIcon className="h-6 w-6" />
          </div>
        </div>

        {/* Total API Calls */}
        <div className="card p-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">API Calls</p>
            <p className="text-3xl font-display font-semibold text-[var(--ink)]">
              {stats.totalApiCalls}
            </p>
          </div>
          <div className="p-3.5 rounded-full border border-[var(--border)] bg-[var(--surface-sunken)] text-[var(--accent-graphite)]">
            <ChartBarIcon className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Select Project Modal Portal */}
      {showProjectModal && createPortal(
        <div className="backdrop-glass" onClick={() => { setShowProjectModal(false); setIsCreatingProject(false); }}>
          <div
            className="modal-theme"
            role="dialog"
            aria-modal="true"
            onClick={e => e.stopPropagation()}
          >
            <div>
              <h3 className="text-xl font-display font-semibold text-[var(--ink)] mb-2">
                Assign Case File Project
              </h3>
              <p className="mb-6 text-sm text-[var(--ink-muted)] font-medium">
                Choose a project folder for this document intake record, or create a new case file.
              </p>

              {!isCreatingProject ? (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)] mb-1.5">
                      Existing Case Files
                    </label>
                    <select
                      className="input"
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
                    <div className="flex-grow border-t border-[var(--border)]"></div>
                    <span className="px-3 text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">OR</span>
                    <div className="flex-grow border-t border-[var(--border)]"></div>
                  </div>

                  <button
                    onClick={() => setIsCreatingProject(true)}
                    className="w-full py-3 px-4 rounded border border-dashed border-[var(--border)] text-[var(--ink)] hover:bg-[var(--surface-sunken)] transition-colors flex items-center justify-center gap-2 text-sm font-semibold cursor-pointer"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Create New Case File
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)] mb-1.5">
                      Case File Name
                    </label>
                    <input
                      type="text"
                      autoFocus
                      value={newProjectName}
                      onChange={e => setNewProjectName(e.target.value)}
                      placeholder="e.g. Invoices 2026"
                      className="input"
                    />
                    <button
                      onClick={() => setIsCreatingProject(false)}
                      className="text-xs font-bold text-[var(--accent-teal)] hover:underline mt-2 inline-block"
                    >
                      &larr; Back to existing case files
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
                  {isCreatingProject ? 'Create & Process' : 'Process Intake'}
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
