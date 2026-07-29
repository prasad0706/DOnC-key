import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../context/ThemeContext';
import { PlusIcon, FolderIcon, TrashIcon } from '@heroicons/react/24/outline';
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

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && showModal) {
                setShowModal(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showModal]);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const data = await getProjects();
            setProjects(data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch case file projects');
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
            fetchProjects();
        } catch (err) {
            console.error('Failed to create project:', err);
            alert('Failed to create project');
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteProject = async (id, e) => {
        e.preventDefault();
        if (!window.confirm('Are you sure you want to delete this case file project and all associated document records?')) return;

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
                <h1 className="text-3xl font-display font-semibold text-[var(--ink)] mb-6">Case File Projects</h1>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--border)] border-t-[var(--accent-teal)]"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-display font-semibold tracking-tight text-[var(--ink)]">Case File Projects</h1>
                    <p className="text-sm text-[var(--ink-muted)] mt-1 font-medium">Organize document intake records into project archives.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    New Case File
                </button>
            </div>

            {error && (
                <div className="p-4 mb-4 rounded border bg-red-500/10 text-[var(--accent-red)] border-red-500/20">
                    {error}
                </div>
            )}

            {projects.length === 0 ? (
                <div className="card-static p-12 text-center flex flex-col items-center justify-center">
                    <FolderIcon className="h-12 w-12 mx-auto mb-4 text-[var(--ink-muted)]" />
                    <h2 className="text-lg font-display font-semibold mb-2 text-[var(--ink)]">No case file projects</h2>
                    <p className="text-[var(--ink-muted)] max-w-sm text-sm">Create a case file project to group document intake records.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <Link key={project._id} to={`/projects/${project._id}`} className="card block p-6">
                            <div>
                                <div className="flex justify-between items-start">
                                    <div className="p-2.5 rounded border border-[var(--accent-teal)] text-[var(--accent-teal)] bg-transparent">
                                        <FolderIcon className="h-6 w-6" />
                                    </div>
                                    <button
                                        onClick={(e) => handleDeleteProject(project._id, e)}
                                        className="btn-danger p-1.5"
                                        title="Delete Project"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>

                                <h3 className="mt-4 text-lg font-display font-semibold text-[var(--ink)]">
                                    {project.name}
                                </h3>
                                <p className="mt-1 text-xs text-[var(--ink-muted)] line-clamp-2 h-9">
                                    {project.description || 'No description provided.'}
                                </p>

                                <div className="mt-6 pt-4 border-t border-[var(--border)] flex justify-between items-center font-mono text-xs text-[var(--ink-muted)]">
                                    <span className="px-2 py-0.5 rounded bg-[var(--surface-sunken)] border border-[var(--border)]">
                                        {project.documentCount || 0} RECORDS
                                    </span>
                                    <span>
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
                        role="dialog"
                        aria-modal="true"
                        onClick={e => e.stopPropagation()}
                    >
                        <div>
                            <h3 className="text-xl font-display font-semibold text-[var(--ink)] mb-4">
                                New Case File Project
                            </h3>
                            <form onSubmit={handleCreateProject}>
                                <div className="mb-4">
                                    <label htmlFor="projectName" className="block text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)] mb-1.5">
                                        Case File Name
                                    </label>
                                    <input
                                        type="text"
                                        id="projectName"
                                        value={newProjectName}
                                        onChange={(e) => setNewProjectName(e.target.value)}
                                        className="input"
                                        placeholder="e.g. Q1 Financial Records"
                                        required
                                        autoFocus
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="projectDesc" className="block text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)] mb-1.5">
                                        Description (Optional)
                                    </label>
                                    <textarea
                                        id="projectDesc"
                                        value={newProjectDesc}
                                        onChange={(e) => setNewProjectDesc(e.target.value)}
                                        className="input"
                                        placeholder="Brief description of this case file project..."
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
                                        {creating ? 'Creating...' : 'Create Case File'}
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
