import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { DocumentTextIcon, FolderIcon, ArrowLeftIcon, ArrowTopRightOnSquareIcon, PlusIcon, LinkIcon } from '@heroicons/react/24/outline';
import { getProjectDetail } from '../utils/api';
import StatusStamp from '../components/StatusStamp';
import DotLeaderRow from '../components/DotLeaderRow';
import WebhookSettingsTab from '../components/WebhookSettingsTab';

const ProjectDetail = () => {
    const { id } = useParams();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('documents');

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
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--border)] border-t-[var(--accent-teal)]"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="p-4 rounded border bg-red-500/10 text-[var(--accent-red)] border-red-500/20">
                    {error}
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="p-6">
                <div className="card-static p-12 text-center flex flex-col items-center justify-center">
                    <FolderIcon className="h-12 w-12 mx-auto mb-4 text-[var(--ink-muted)]" />
                    <h2 className="text-lg font-display font-semibold mb-2 text-[var(--ink)]">Case File Not Found</h2>
                    <p className="text-[var(--ink-muted)] text-sm">The requested case file project does not exist.</p>
                </div>
            </div>
        );
    }

    const documents = project.documents || [];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Back button */}
            <Link
                to="/projects"
                className="btn-secondary text-xs"
            >
                <ArrowLeftIcon className="h-3.5 w-3.5 mr-1 inline" />
                Case Files Index
            </Link>

            {/* Case File Header Card */}
            <div className="card-static p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 rounded border border-[var(--accent-teal)] text-[var(--accent-teal)] bg-transparent">
                            <FolderIcon className="h-7 w-7" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-display font-semibold text-[var(--ink)]">{project.name}</h1>
                            <p className="text-xs font-mono text-[var(--ink-muted)] mt-1">CREATED: {formatDate(project.createdAt)}</p>
                            {project.description && (
                                <p className="mt-2 text-sm text-[var(--ink-muted)]">{project.description}</p>
                            )}
                        </div>
                    </div>
                    <div>
                        <Link
                            to={`/dashboard`}
                            className="btn-primary"
                        >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Intake Document
                        </Link>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--border)] max-w-lg">
                    <DotLeaderRow label="total_documents" value={documents.length} />
                    <DotLeaderRow label="project_id" value={project._id} />
                </div>
            </div>

            {/* Case File Folder Tab Navigation Bar */}
            <div className="border-b border-[var(--border)]">
                <nav className="flex space-x-1 overflow-x-auto" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('documents')}
                        className={`folder-tab ${activeTab === 'documents' ? 'active' : ''}`}
                    >
                        <DocumentTextIcon className="h-4 w-4" />
                        <span>Document Records ({documents.length})</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('webhooks')}
                        className={`folder-tab ${activeTab === 'webhooks' ? 'active' : ''}`}
                    >
                        <LinkIcon className="h-4 w-4" />
                        <span>Webhook Settings</span>
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
                {activeTab === 'documents' && (
                    <div className="card-static p-6">
                        <h2 className="text-lg font-display font-semibold text-[var(--ink)] mb-4">Case File Document Records</h2>

                        {documents.length === 0 ? (
                            <div className="p-8 text-center rounded border border-[var(--border)] bg-[var(--surface-sunken)]">
                                <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-[var(--ink-muted)]" />
                                <h3 className="text-lg font-display font-semibold text-[var(--ink)] mb-2">No documents in this case file</h3>
                                <p className="text-xs text-[var(--ink-muted)]">Submit your first document intake record to get started.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr>
                                            <th scope="col" className="table-header-premium">Document Name</th>
                                            <th scope="col" className="table-header-premium">Status Stamp</th>
                                            <th scope="col" className="table-header-premium">Intake Date</th>
                                            <th scope="col" className="table-header-premium">Size</th>
                                            <th scope="col" className="table-header-premium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {documents.map((doc) => (
                                            <tr key={doc._id || doc.id} className="table-row-premium">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <DocumentTextIcon className="h-5 w-5 text-[var(--accent-teal)] mr-3 flex-shrink-0" />
                                                        <span className="text-sm font-semibold text-[var(--ink)] truncate max-w-xs">{doc.fileName || doc.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <StatusStamp status={doc.status} />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-[var(--ink-muted)]">
                                                    {formatDate(doc.createdAt || doc.uploadedAt)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-[var(--ink-muted)]">
                                                    {doc.fileSize ? (doc.fileSize / 1024 / 1024).toFixed(2) + ' MB' : doc.size}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Link
                                                        to={`/documents/${doc._id || doc.id}`}
                                                        className="btn-secondary py-1 px-3 text-xs"
                                                    >
                                                        <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-1 inline" />
                                                        Inspect
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'webhooks' && (
                    <WebhookSettingsTab projectId={project._id} />
                )}
            </div>
        </div>
    );
};

export default ProjectDetail;
