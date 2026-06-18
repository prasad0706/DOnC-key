import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  DocumentTextIcon, 
  CloudArrowUpIcon, 
  FolderIcon, 
  PlusIcon, 
  ArrowLeftIcon, 
  TrashIcon, 
  SparklesIcon, 
  ChevronDownIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { uploadDocument, getProjects, createProject } from '../utils/api';
import { useNavigate, useSearchParams } from 'react-router-dom';

const UploadDocument = () => {
  const { theme } = useTheme();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Project State
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(searchParams.get('projectId') || '');
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  // AI Configuration State
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [useCustomSchema, setUseCustomSchema] = useState(false);
  const [schemaFields, setSchemaFields] = useState([
    { name: 'document_title', type: 'string', description: 'The title or name of the document', required: true }
  ]);

  // Drag and Drop State
  const [dragActive, setDragActive] = useState(false);

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

  // Handle Drag & Drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selectedFiles = Array.from(e.dataTransfer.files);
      // Validate file extension / size
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const handleRemoveFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Create Project
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

  // Schema Editor Handlers
  const handleAddField = () => {
    setSchemaFields(prev => [...prev, { name: '', type: 'string', description: '', required: true }]);
  };

  const handleRemoveField = (index) => {
    setSchemaFields(prev => prev.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index, key, value) => {
    setSchemaFields(prev => prev.map((f, i) => i === index ? { ...f, [key]: value } : f));
  };

  // Upload Call
  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select or drop files first');
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

      // Call updated API with files array, selected model, and optional schema fields
      const result = await uploadDocument(
        files, 
        selectedProjectId, 
        selectedModel, 
        useCustomSchema ? schemaFields : null
      );
      
      setUploadProgress(100);
      clearInterval(interval);

      console.log('Upload result:', result);

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setFiles([]);
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
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Back button & Page Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate(-1)}
          className="btn-secondary p-2.5 rounded-xl"
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Upload Documents</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Add documents to your custom data projects.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl border text-sm bg-rose-50 text-rose-700 border-rose-200/50 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Side: Upload Box & Files (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="card-premium-no-hover p-6 space-y-6">
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

            {/* Drag & Drop Zone */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50/20 dark:bg-blue-950/10' 
                  : 'border-slate-200 hover:border-blue-400/80 dark:border-slate-800 dark:hover:border-slate-700'
              }`}
            >
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.gif,.docx,.xlsx,.csv"
                className="hidden"
                id="document-upload"
                disabled={isUploading}
              />
              <label htmlFor="document-upload" className="cursor-pointer flex flex-col items-center">
                <CloudArrowUpIcon className="h-10 w-10 text-slate-400 mb-3" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Drag and drop files here, or <span className="text-blue-500">browse</span>
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 font-medium">
                  PDF, DOCX, XLSX, CSV, JPG, PNG, GIF up to 10MB each
                </p>
              </label>
            </div>

            {/* Chosen Files List */}
            {files.length > 0 && (
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Files to Upload ({files.length})
                </h3>
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-2">
                  {files.map((f, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 rounded-xl"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <DocumentTextIcon className="h-5 w-5 text-blue-500 shrink-0" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[200px]">
                          {f.name}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 shrink-0">
                          ({(f.size / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                      </div>
                      <button 
                        onClick={() => handleRemoveFile(index)}
                        disabled={isUploading}
                        className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors p-1"
                      >
                        <TrashIcon className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button & Progress */}
            <div className="space-y-4">
              <button
                onClick={handleUpload}
                disabled={files.length === 0 || isUploading || !selectedProjectId}
                className="w-full btn-primary py-3 px-8 text-sm flex items-center justify-center space-x-2"
              >
                <span>{isUploading ? 'Processing Pipeline...' : `Upload ${files.length} Document${files.length !== 1 ? 's' : ''}`}</span>
              </button>

              {isUploading && (
                <div className="space-y-2">
                  <div className="w-full bg-slate-100 rounded-full h-1.5 dark:bg-slate-800">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 text-center">{uploadProgress}% complete</p>
                </div>
              )}
            </div>

            {/* Info guidelines */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 text-xs text-slate-500 dark:text-slate-400 space-y-2 font-medium leading-relaxed">
              <h4 className="font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider text-[10px]">Processing Details:</h4>
              <ul className="list-disc pl-5 space-y-0.5">
                <li>Local fallback storage automatically triggers if Firebase billing limits are exceeded.</li>
                <li>Documents are uploaded, classified, and analyzed in parallel using BullMQ worker threads.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Side: AI Configuration Panel (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-premium-no-hover p-6 space-y-6">
            <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
              <SparklesIcon className="h-5.5 w-5.5" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">AI Config (Resume Feature)</h2>
            </div>

            {/* Model Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Gemini Model Select
              </label>
              <div className="relative">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="input-premium focus:ring-4 focus:ring-blue-500/10 pr-10 appearance-none"
                  disabled={isUploading}
                >
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fast / OCR-focused)</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep Reasoning / Contracts)</option>
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <ChevronDownIcon className="h-4.5 w-4.5" />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                Flash is optimized for OCR & speed. Pro is recommended for structural reasoning on complex document text.
              </p>
            </div>

            {/* Custom Schema Builder toggle */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Custom Extraction Schema
                  </label>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                    Define JSON structure keys returned by Gemini.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setUseCustomSchema(!useCustomSchema)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    useCustomSchema ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      useCustomSchema ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Dynamic schema builder interface */}
              {useCustomSchema && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Schema Attributes</span>
                    <button
                      type="button"
                      onClick={handleAddField}
                      className="inline-flex items-center text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline"
                    >
                      <PlusIcon className="h-3 w-3 mr-1" /> Add Attribute
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                    {schemaFields.map((field, index) => (
                      <div 
                        key={index}
                        className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-xl space-y-2.5 relative"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            placeholder="attribute_name"
                            value={field.name}
                            onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                            className="w-full bg-transparent border-b border-slate-200 dark:border-slate-800 text-xs font-mono font-bold py-1 focus:border-blue-500 outline-none text-slate-900 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveField(index)}
                            className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 p-1"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <select
                              value={field.type}
                              onChange={(e) => handleFieldChange(index, 'type', e.target.value)}
                              className="w-full bg-transparent border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 outline-none font-semibold text-slate-700 dark:text-slate-300"
                            >
                              <option value="string">String</option>
                              <option value="number">Number</option>
                              <option value="boolean">Boolean</option>
                              <option value="array">Array</option>
                            </select>
                          </div>
                          <div>
                            <input
                              type="text"
                              placeholder="Description..."
                              value={field.description}
                              onChange={(e) => handleFieldChange(index, 'description', e.target.value)}
                              className="w-full bg-transparent border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 outline-none text-slate-700 dark:text-slate-300"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadDocument;