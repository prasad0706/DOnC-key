import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { DocumentTextIcon, CloudArrowUpIcon, FolderIcon, PlusIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { uploadDocument, getProjects, createProject } from '../utils/api';
import { useNavigate, useSearchParams } from 'react-router-dom';

const UploadDocument = () => {
  const { theme } = useTheme();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Project State
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(searchParams.get('projectId') || '');
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoadingProjects(true);
        const data = await getProjects();
        setProjects(data);
      } catch (err) {
        console.error("Failed to fetch projects", err);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    try {
      const newProject = await createProject({ name: newProjectName });
      setProjects([...projects, newProject]);
      setSelectedProjectId(newProject._id);
      setIsCreatingProject(false);
      setNewProjectName('');
    } catch (err) {
      setError('Failed to create project');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }
    if (!selectedProjectId) {
      setError('Please select a project');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

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

      const result = await uploadDocument(file, selectedProjectId);
      setUploadProgress(100);
      clearInterval(interval);

      console.log('Upload result:', result);

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setFile(null);
        navigate(`/projects/${selectedProjectId}`);
      }, 2000);

    } catch (error) {
      console.error('Upload failed:', error);
      setError(error.message || 'Upload failed');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Back button & Page Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate(-1)}
          className="btn-secondary p-2.5 rounded-xl"
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Upload Document</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Add documents to your custom data projects.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl border text-sm bg-rose-50 text-rose-700 border-rose-200/50 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20">
          {error}
        </div>
      )}

      {/* Main Upload Box */}
      <div className="card-premium-no-hover p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">New Document Pipeline</h2>
          <CloudArrowUpIcon className="h-6 w-6 text-blue-500" />
        </div>

        {/* Project Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Project Association
          </label>

          {!isCreatingProject ? (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <select
                  className="input-premium focus:ring-4 focus:ring-blue-500/10 pr-10 appearance-none"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  disabled={isUploading}
                >
                  <option value="">Select a project...</option>
                  {projects.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <FolderIcon className="h-4 w-4" />
                </div>
              </div>
              <button
                onClick={() => setIsCreatingProject(true)}
                className="btn-secondary py-2.5 px-3.5 rounded-xl flex items-center justify-center"
                title="Create New Project"
                disabled={isUploading}
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="New Project Name"
                className="input-premium"
                autoFocus
              />
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim()}
                className="btn-primary py-2.5 px-5"
              >
                Create
              </button>
              <button
                onClick={() => setIsCreatingProject(false)}
                className="btn-secondary py-2.5 px-4"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Supported formats */}
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
          Supported formats: PDF, DOCX, XLSX, CSV, JPG, PNG, GIF (Max size: 10MB)
        </p>

        {/* File Pick Container */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png,.gif,.docx,.xlsx,.csv"
            className="hidden"
            id="document-upload"
            disabled={isUploading}
          />
          <label
            htmlFor="document-upload"
            className={`flex-1 w-full px-5 py-3 border rounded-xl cursor-pointer text-sm font-semibold transition-all duration-200 text-center truncate ${isUploading
              ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-500'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800/80 dark:hover:text-white'
              }`}
          >
            {file ? file.name : 'Choose File'}
          </label>
          <button
            onClick={handleUpload}
            disabled={!file || isUploading || !selectedProjectId}
            className="w-full sm:w-auto btn-primary py-3 px-8 text-sm"
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>

        {isUploading && (
          <div className="space-y-2">
            <div className="w-full bg-slate-100 rounded-full h-1.5 dark:bg-slate-800">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">{uploadProgress}% complete</p>
          </div>
        )}

        {/* Informative guidelines footer */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800/60 text-xs text-slate-500 dark:text-slate-400 space-y-2.5 font-medium leading-relaxed">
          <h3 className="font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider text-[10px]">Pipeline processing info:</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Your documents are securely classified and parsed using AI.</li>
            <li>Text extraction and entities are mapped against dynamic schemas in parallel.</li>
            <li>Once parsed, access your data instantly using the sandbox or document-scoped API keys.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UploadDocument;