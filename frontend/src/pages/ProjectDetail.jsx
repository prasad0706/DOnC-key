import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { DocumentTextIcon, KeyIcon, ClockIcon, FolderIcon , CheckCircleIcon, XCircleIcon, ArrowLeftIcon, ArrowTopRightOnSquareIcon, PlusIcon } from '@heroicons/react/24/outline';
import { getProjectDetail } from '../utils/api';

const ProjectDetail = () => {
    const { id } = useParams();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                setLoading(true);
                const data = await getProjectDetail(id);
                setProject(data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch project details');
                setLoading(false);
                console.error('Error fetching project:', err);
            }
        };

        fetchProject();
    }, [id]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'ready':
                return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
            case 'processing':
                return <ClockIcon className="h-5 w-5 text-yellow-500" />;
            case 'queued':
                return <ClockIcon className="h-5 w-5 text-blue-500" />;
            case 'failed':
                return <XCircleIcon className="h-5 w-5 text-red-500" />;
            default:
                return <DocumentTextIcon className="h-5 w-5 text-gray-400" />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'ready':
                return 'Ready';
            case 'processing':
                return 'Processing';
            case 'queued':
                return 'Queued';
            case 'failed':
                return 'Failed';
            default:
                return 'Unknown';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-red-900/20 text-red-400' : 'bg-red-100 text-red-700'}`}>
                    {error}
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="p-6">
                <div className={`p-8 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
                    <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h2 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Project not found</h2>
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>The requested project does not exist</p>
                </div>
            </div>
        );
    }

    // Ensure documents array exists
    const documents = project.documents || [];

    return (
        <div className="p-6">
            {/* Back button */}
            <Link
                to="/projects"
                className="btn-secondary mb-4"
            >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Back to Projects
            </Link>

            {/* Project Header */}
            <div className="card-premium-no-hover p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <FolderIcon className="h-10 w-10 text-blue-500 mr-4" />
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{project.name}</h1>
                            <p className="text-xs text-slate-400 dark:text-slate-500">Created: {formatDate(project.createdAt)}</p>
                            {project.description && (
                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{project.description}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <Link
                            to={`/documents/upload?projectId=${project._id}`} // Pass projectId to Upload page
                            className="btn-primary"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Add Document
                        </Link>
                    </div>
                </div>
            </div>

            {/* Project Documents */}
            <div className="card-premium-no-hover p-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Documents in this Project</h2>

                {documents.length === 0 ? (
                    <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/40">
                        <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-slate-400 dark:text-slate-500" />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No documents in this project</h3>
                        <p className="text-slate-500 dark:text-slate-400">Add your first document to get started</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800/60">
                            <thead className="bg-slate-50 dark:bg-slate-900/60">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Document Name
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Uploaded
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Size
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        API Key
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                                {documents.map((doc) => (
                                    <tr key={doc._id || doc.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/40 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <DocumentTextIcon className="h-5 w-5 text-blue-500 mr-3" />
                                                <div className="text-sm font-semibold text-slate-900 dark:text-white">{doc.fileName || doc.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {getStatusIcon(doc.status)}
                                                <span className={`ml-2 text-sm ${doc.status === 'ready' ? 'text-green-500' : doc.status === 'failed' ? 'text-red-500' : 'text-yellow-500'}`}>
                                                    {getStatusText(doc.status)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-500 dark:text-slate-400">{formatDate(doc.createdAt || doc.uploadedAt)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-500 dark:text-slate-400">{doc.fileSize ? (doc.fileSize / 1024 / 1024).toFixed(2) + ' MB' : doc.size}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-mono text-slate-500 dark:text-slate-400 truncate max-w-xs">{doc.apiKey || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link
                                                to={`/documents/${doc._id || doc.id}`}
                                                className="btn-primary py-1.5 px-3.5"
                                            >
                                                <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-1" />
                                                Open
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectDetail;
