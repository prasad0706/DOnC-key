import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { DocumentTextIcon, KeyIcon, ClockIcon, CheckCircleIcon, XCircleIcon, ArrowLeftIcon, ArrowTopRightOnSquareIcon, PlusIcon } from '@heroicons/react/24/outline';

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
                // Mock data - in a real app, this would be the API call
                const mockProjects = {
                    'proj_001': {
                        id: 'proj_001',
                        name: 'Financial Reports',
                        createdAt: '2023-12-15T10:30:00Z',
                        documents: [
                            {
                                id: 'doc_001',
                                name: 'Invoice_2023_Q4.pdf',
                                status: 'ready',
                                uploadedAt: '2023-12-15T10:30:00Z',
                                size: '2.4 MB',
                                apiKey: 'docintel_sk_live_abc123def456'
                            },
                            {
                                id: 'doc_002',
                                name: 'Financial_Report.pdf',
                                status: 'processing',
                                uploadedAt: '2023-12-14T14:15:00Z',
                                size: '1.8 MB',
                                apiKey: 'docintel_sk_live_ghi789jkl012'
                            }
                        ]
                    },
                    'proj_002': {
                        id: 'proj_002',
                        name: 'Legal Documents',
                        createdAt: '2023-12-10T09:45:00Z',
                        documents: [
                            {
                                id: 'doc_003',
                                name: 'Contract_Agreement.docx',
                                status: 'ready',
                                uploadedAt: '2023-12-10T09:45:00Z',
                                size: '5.6 MB',
                                apiKey: 'docintel_sk_live_mno345pqr678'
                            }
                        ]
                    },
                    'proj_003': {
                        id: 'proj_003',
                        name: 'Product Catalogs',
                        createdAt: '2023-12-05T16:20:00Z',
                        documents: [
                            {
                                id: 'doc_004',
                                name: 'Product_Catalog.pdf',
                                status: 'queued',
                                uploadedAt: '2023-12-05T16:20:00Z',
                                size: '3.2 MB',
                                apiKey: 'docintel_sk_live_stu901vwx234'
                            },
                            {
                                id: 'doc_005',
                                name: 'User_Manual.pdf',
                                status: 'failed',
                                uploadedAt: '2023-12-03T11:10:00Z',
                                size: '8.1 MB',
                                apiKey: 'docintel_sk_live_yza567bcd890'
                            }
                        ]
                    }
                };

                const foundProject = mockProjects[id];
                if (foundProject) {
                    setProject(foundProject);
                } else {
                    setError('Project not found');
                }
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

    return (
        <div className="p-6">
            {/* Back button */}
            <Link
                to="/projects"
                className={`inline-flex items-center mb-4 px-3 py-1 rounded-md ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Back to Projects
            </Link>

            {/* Project Header */}
            <div className={`p-6 rounded-lg mb-6 ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <DocumentTextIcon className="h-8 w-8 text-blue-500 mr-4" />
                        <div>
                            <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{project.name}</h1>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Created: {formatDate(project.createdAt)}</p>
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <Link
                            to={`/upload`}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Add Document
                        </Link>
                    </div>
                </div>
            </div>

            {/* Project Documents */}
            <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Documents in this Project</h2>

                {project.documents.length === 0 ? (
                    <div className={`p-8 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>No documents in this project</h3>
                        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Add your first document to get started</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Document Name
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Uploaded
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Size
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        API Key
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className={theme === 'dark' ? 'bg-gray-800 divide-y divide-gray-700' : 'bg-white divide-y divide-gray-200'}>
                                {project.documents.map((doc) => (
                                    <tr key={doc.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <DocumentTextIcon className="h-5 w-5 text-blue-500 mr-3" />
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{doc.name}</div>
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
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(doc.uploadedAt)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{doc.size}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-mono text-gray-500 dark:text-gray-400 truncate max-w-xs">{doc.apiKey}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link
                                                to={`/documents/${doc.id}`}
                                                className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
