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
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Projects</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    New Project
                </button>
            </div>

            {error && (
                <div className={`p-4 mb-4 rounded-md ${theme === 'dark' ? 'bg-red-900/20 text-red-400' : 'bg-red-100 text-red-700'}`}>
                    {error}
                </div>
            )}

            {projects.length === 0 ? (
                <div className={`p-8 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
                    <FolderIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h2 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>No projects found</h2>
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Create your first project to get started</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <Link key={project._id} to={`/projects/${project._id}`} className={`block rounded-lg overflow-hidden transition-shadow hover:shadow-md ${theme === 'dark' ? 'bg-gray-800 border border-gray-700 hover:border-blue-500/50' : 'bg-white border border-gray-200 hover:border-blue-300'}`}>
                            <div className="p-6">
                                <div className="flex justify-between items-start">
                                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                        <FolderIcon className="h-6 w-6" />
                                    </div>
                                    <button
                                        onClick={(e) => handleDeleteProject(project._id, e)}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>

                                <h3 className={`mt-4 text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {project.name}
                                </h3>
                                <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} line-clamp-2`}>
                                    {project.description || 'No description'}
                                </p>

                                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                        {project.documentCount || 0} Documents
                                    </span>
                                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
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
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className={`relative w-full max-w-lg rounded-lg shadow-2xl overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <h3 className={`text-xl leading-6 font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
                                Create New Project
                            </h3>
                            <form onSubmit={handleCreateProject}>
                                <div className="mb-4">
                                    <label htmlFor="projectName" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                        Project Name
                                    </label>
                                    <input
                                        type="text"
                                        id="projectName"
                                        value={newProjectName}
                                        onChange={(e) => setNewProjectName(e.target.value)}
                                        className={`w-full px-3 py-2 rounded-md border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        placeholder="e.g., Financial Reports 2024"
                                        required
                                        autoFocus
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="projectDesc" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                        Description (Optional)
                                    </label>
                                    <textarea
                                        id="projectDesc"
                                        value={newProjectDesc}
                                        onChange={(e) => setNewProjectDesc(e.target.value)}
                                        className={`w-full px-3 py-2 rounded-md border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        placeholder="Brief description of this project..."
                                        rows="3"
                                    />
                                </div>
                                <div className="flex justify-end space-x-3 mt-8">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className={`px-4 py-2 rounded-md border ${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={creating}
                                        className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium shadow-sm transition-colors`}
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
