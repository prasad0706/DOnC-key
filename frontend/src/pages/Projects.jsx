import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../context/ThemeContext';
import { DocumentTextIcon, PlusIcon, FolderIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { getProjects, createProject, deleteProject } from '../utils/api';

const Projects = () => {
    const { theme } = useTheme();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectDesc, setNewProjectDesc] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const data = await getProjects();
            setProjects(data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch projects');
            setLoading(false);
            console.error('Error fetching projects:', err);
        }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        if (!newProjectName.trim()) return;

        try {
            setCreating(true);
            await createProject({ name: newProjectName, description: newProjectDesc });
            setNewProjectName('');
            setNewProjectDesc('');
            setShowModal(false);
            fetchProjects(); // Refresh list
        } catch (err) {
            console.error('Failed to create project:', err);
            alert('Failed to create project');
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteProject = async (id, e) => {
        e.preventDefault(); // Prevent navigation
        if (!window.confirm('Are you sure you want to delete this project and all its documents?')) return;

        try {
            await deleteProject(id);
            setProjects(projects.filter(p => p._id !== id));
        } catch (err) {
            console.error('Failed to delete project:', err);
            alert('Failed to delete project');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="p-6">
                <h1 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Projects</h1>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Projects</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    New Project
                </button>
            </div>

            {error && (
                <div className={`p-4 mb-4 rounded-xl ${theme === 'dark' ? 'bg-red-950/20 text-red-400 border border-red-900/30' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    {error}
                </div>
            )}

            {projects.length === 0 ? (
                <div className="card-premium-no-hover p-12 text-center flex flex-col items-center justify-center">
                    <FolderIcon className="h-12 w-12 mx-auto mb-4 text-slate-500 dark:text-slate-400" />
                    <h2 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">No projects found</h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm">Create your first project to get started organizing your documents.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <Link key={project._id} to={`/projects/${project._id}`} className="card-premium block p-6">
                            <div>
                                <div className="flex justify-between items-start">
                                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                                        <FolderIcon className="h-6 w-6" />
                                    </div>
                                    <button
                                        onClick={(e) => handleDeleteProject(project._id, e)}
                                        className="text-slate-400 hover:text-red-500 transition-colors p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>

                                <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                                    {project.name}
                                </h3>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2 h-10">
                                    {project.description || 'No description'}
                                </p>

                                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex justify-between items-center">
                                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                        {project.documentCount || 0} Documents
                                    </span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                        {formatDate(project.createdAt)}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Create Project Modal */}
            {showModal && createPortal(
                <div
                    className="backdrop-glass"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="modal-theme"
                        onClick={e => e.stopPropagation()}
                    >
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                                Create New Project
                            </h3>
                            <form onSubmit={handleCreateProject}>
                                <div className="mb-4">
                                    <label htmlFor="projectName" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Project Name
                                    </label>
                                    <input
                                        type="text"
                                        id="projectName"
                                        value={newProjectName}
                                        onChange={(e) => setNewProjectName(e.target.value)}
                                        className="input-premium"
                                        placeholder="e.g., Financial Reports 2024"
                                        required
                                        autoFocus
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="projectDesc" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Description (Optional)
                                    </label>
                                    <textarea
                                        id="projectDesc"
                                        value={newProjectDesc}
                                        onChange={(e) => setNewProjectDesc(e.target.value)}
                                        className="input-premium"
                                        placeholder="Brief description of this project..."
                                        rows="3"
                                    />
                                </div>
                                <div className="flex justify-end space-x-3 mt-8">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={creating}
                                        className="btn-primary"
                                    >
                                        {creating ? 'Creating...' : 'Create Project'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default Projects;
