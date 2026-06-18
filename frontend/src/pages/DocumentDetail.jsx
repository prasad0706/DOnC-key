import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  DocumentTextIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  KeyIcon, 
  ArrowLeftIcon, 
  TableCellsIcon, 
  ChatBubbleLeftRightIcon, 
  XMarkIcon,
  LinkIcon,
  QueueListIcon
} from '@heroicons/react/24/outline';
import { getDocumentDetail, generateApiKey, getApiKeys, revokeApiKey } from '../utils/api';
import StructureTab from '../components/StructureTab';
import ApiDocsTab from '../components/ApiDocsTab';
import TryApiTab from '../components/TryApiTab';
import ChatTab from '../components/ChatTab';
import WebhookSettingsTab from '../components/WebhookSettingsTab';
import ApiLogsTab from '../components/ApiLogsTab';

const DocumentDetail = () => {
  const { id } = useParams();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [generatedKey, setGeneratedKey] = useState(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeys, setApiKeys] = useState([]);
  const [apiKeysLoading, setApiKeysLoading] = useState(false);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const data = await getDocumentDetail(id);
        setDocument(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch document details');
        setLoading(false);
        console.error('Error fetching document:', err);
      }
    };

    fetchDocument();
  }, [id]);

  // Fetch API keys when the API Keys tab is activated
  useEffect(() => {
    if (activeTab === 'api-integration' && id) {
      const fetchKeys = async () => {
        setApiKeysLoading(true);
        try {
          const keys = await getApiKeys(id);
          setApiKeys(keys);
        } catch (err) {
          console.error('Error fetching API keys:', err);
        }
        setApiKeysLoading(false);
      };
      fetchKeys();
    }
  }, [activeTab, id]);

  const handleGenerateApiKey = async () => {
    try {
      const key = await generateApiKey(id);
      setGeneratedKey(key);
      setShowKeyModal(true);
      const keys = await getApiKeys(id);
      setApiKeys(keys);
    } catch (err) {
      console.error('Error generating API key:', err);
    }
  };

  const handleRevokeApiKey = async (keyId) => {
    if (window.confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      try {
        await revokeApiKey(id, keyId);
        const keys = await getApiKeys(id);
        setApiKeys(keys);
      } catch (err) {
        console.error('Error revoking API key:', err);
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'ready':
        return 'badge-status-ready';
      case 'processing':
        return 'badge-status-processing';
      case 'queued':
        return 'badge-status-queued';
      case 'failed':
        return 'badge-status-failed';
      default:
        return 'badge-premium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ready':
        return <CheckCircleIcon className="h-4 w-4 mr-1.5" />;
      case 'processing':
        return <ClockIcon className="h-4 w-4 mr-1.5 animate-pulse" />;
      case 'queued':
        return <ClockIcon className="h-4 w-4 mr-1.5" />;
      case 'failed':
        return <XCircleIcon className="h-4 w-4 mr-1.5" />;
      default:
        return <DocumentTextIcon className="h-4 w-4 mr-1.5" />;
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
      month: 'long',
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
        <div className="p-4 rounded-xl border bg-rose-50 text-rose-700 border-rose-200/50 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20">
          {error}
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="p-6">
        <div className="card-premium-no-hover p-12 text-center flex flex-col items-center justify-center">
          <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h2 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">Document not found</h2>
          <p className="text-slate-500 dark:text-slate-400">The requested document does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="btn-secondary"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-1.5" />
        Back
      </button>

      {/* Document Header Card */}
      <div className="card-premium-no-hover p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/45 text-blue-600 dark:text-blue-400">
              <DocumentTextIcon className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">{document.name}</h1>
              <div className="flex items-center mt-2">
                <span className={getStatusBadgeClass(document.status)}>
                  {getStatusIcon(document.status)}
                  {getStatusText(document.status)}
                </span>
              </div>
            </div>
          </div>
          <div className="text-left sm:text-right text-xs font-semibold text-slate-400 dark:text-slate-500 space-y-1">
            <p>Uploaded: {formatDate(document.uploadedAt)}</p>
            <p>Size: {document.size}</p>
          </div>
        </div>
      </div>

      {/* Modern Tabs Bar */}
      <div className="border-b border-slate-200 dark:border-slate-800/80">
        <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
          {[
            { id: 'overview', name: 'Overview', icon: DocumentTextIcon },
            { id: 'structure', name: 'Structure', icon: TableCellsIcon },
            { id: 'api-integration', name: 'API Integration', icon: KeyIcon },
            { id: 'chat', name: 'AI Chat', icon: ChatBubbleLeftRightIcon },
            { id: 'webhooks', name: 'Webhooks Settings', icon: LinkIcon },
            { id: 'logs', name: 'Request Logs', icon: QueueListIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-semibold text-sm flex items-center gap-2 transition-all duration-200 cursor-pointer ${
                  isActive ? 'tab-button-active' : 'tab-button-inactive'
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="card-premium-no-hover p-6 md:p-8 space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Document Details</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-sm">
              <div className="space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Pipeline Status</p>
                <p className={`font-bold ${document.status === 'ready' ? 'text-green-500' : document.status === 'failed' ? 'text-red-500' : 'text-amber-500'}`}>
                  {getStatusText(document.status)}
                </p>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Upload Date</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {formatDate(document.uploadedAt)}
                </p>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">File Payload Size</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {document.size}
                </p>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Format</p>
                <p className="font-bold text-slate-800 dark:text-slate-200 uppercase">
                  {document.fileType || 'Unknown'}
                </p>
              </div>
            </div>

            {document.status === 'ready' && (
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800/60">
                <button
                  onClick={() => setActiveTab('api-integration')}
                  className="btn-primary"
                >
                  <KeyIcon className="h-4 w-4 mr-2" />
                  Configure API Keys
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'structure' && (
          <StructureTab document={document} />
        )}

        {activeTab === 'api-integration' && (
          <div className="space-y-8">
            {/* API Keys Table Card */}
            <div className="card-premium-no-hover p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">API Credentials</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Generate keys to query structured outputs externally.</p>
                </div>
                {document.status === 'ready' && (
                  <button
                    onClick={handleGenerateApiKey}
                    className="btn-primary"
                  >
                    <KeyIcon className="h-4 w-4 mr-2" />
                    New API Key
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800/40">
                  <thead>
                    <tr>
                      <th scope="col" className="table-header-premium">Key prefix</th>
                      <th scope="col" className="table-header-premium">Status</th>
                      <th scope="col" className="table-header-premium">Created</th>
                      <th scope="col" className="table-header-premium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                    {apiKeysLoading ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-6 text-center text-xs font-semibold text-slate-400 dark:text-slate-500">
                          <div className="flex justify-center items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                            <span>Fetching access profile...</span>
                          </div>
                        </td>
                      </tr>
                    ) : apiKeys && apiKeys.length > 0 ? (
                      apiKeys.map((key) => (
                        <tr key={key.id || key._id} className="table-row-premium">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-900 dark:text-slate-200">
                            {key.keyPrefix ? `${key.keyPrefix}...` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`badge-premium ${
                              key.revoked
                                ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200/50 dark:border-rose-500/20'
                                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20'
                            }`}>
                              {key.revoked ? 'Revoked' : 'Active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-500 dark:text-slate-400">
                            {key.createdAt ? formatDate(key.createdAt) : 'Just now'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            {!key.revoked && (
                              <button
                                onClick={() => handleRevokeApiKey(key.id || key._id)}
                                className="btn-danger p-1 text-xs px-3.5"
                              >
                                Revoke
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-xs font-semibold text-slate-400 dark:text-slate-500">
                          No external keys configured yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* API Docs and Try API side-by-side */}
            {document.status === 'ready' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <ApiDocsTab documentId={document.id || document._id} />
                <TryApiTab documentId={document.id || document._id} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <ChatTab documentId={document.id || document._id} documentStatus={document.status} />
        )}

        {activeTab === 'webhooks' && (
          <WebhookSettingsTab projectId={document.projectId} />
        )}

        {activeTab === 'logs' && (
          <ApiLogsTab documentId={document.id || document._id} />
        )}
      </div>

      {/* Generated Key Modal Portal */}
      {showKeyModal && generatedKey && createPortal(
        <div className="backdrop-glass">
          <div className="modal-theme" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">API Key Generated</h2>
              <button
                onClick={() => setShowKeyModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Here is your secret document API key. Save it now as it will not be shown again.
              </p>
              <div className="p-4 bg-slate-900 dark:bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400 break-all leading-normal">
                {generatedKey.apiKey || generatedKey.key}
              </div>
            </div>

            <div className="flex space-x-3 mt-8">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedKey.apiKey || generatedKey.key);
                }}
                className="flex-1 btn-primary"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={() => setShowKeyModal(false)}
                className="flex-1 btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default DocumentDetail;
