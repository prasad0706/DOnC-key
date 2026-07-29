import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  DocumentTextIcon, 
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
import StatusStamp from '../components/StatusStamp';
import DotLeaderRow from '../components/DotLeaderRow';

const DocumentDetail = () => {
  const { id } = useParams();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('structure');
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showKeyModal) {
        setShowKeyModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showKeyModal]);

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

  if (!document) {
    return (
      <div className="p-6">
        <div className="card-static p-12 text-center flex flex-col items-center justify-center">
          <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-[var(--ink-muted)]" />
          <h2 className="text-lg font-display font-semibold mb-2 text-[var(--ink)]">Record Not Found</h2>
          <p className="text-[var(--ink-muted)] text-sm">The requested document file does not exist in registry.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb Command Bar */}
      <div className="flex items-center justify-between text-xs font-mono text-[var(--ink-muted)] pb-2 border-b border-[var(--border)]">
        <div className="flex items-center space-x-2">
          <Link to="/documents" className="hover:text-[var(--accent-teal)] transition-colors">
            DOCUMENTS
          </Link>
          <span>/</span>
          <span className="text-[var(--ink)] font-semibold truncate max-w-md">{document.name}</span>
        </div>
        <button
          onClick={() => navigate('/documents')}
          className="btn-secondary py-1 px-3 text-xs"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5 mr-1 inline" />
          Registry Index
        </button>
      </div>

      {/* Document Case Header Card */}
      <div className="card-static p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded border border-[var(--border)] bg-[var(--surface-sunken)] text-[var(--accent-teal)]">
              <DocumentTextIcon className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-semibold text-[var(--ink)] leading-tight">{document.name}</h1>
              <div className="mt-2">
                <StatusStamp status={document.status} />
              </div>
            </div>
          </div>
          <div className="text-left sm:text-right font-mono text-xs text-[var(--ink-muted)] space-y-1">
            <p>INTAKE: {formatDate(document.uploadedAt)}</p>
            <p>PAYLOAD SIZE: {document.size}</p>
          </div>
        </div>
      </div>

      {/* Case File Folder Tab Navigation Bar */}
      <div className="border-b border-[var(--border)]">
        <nav className="flex space-x-1 overflow-x-auto" aria-label="Tabs">
          {[
            { id: 'structure', name: 'Structure Data', icon: TableCellsIcon },
            { id: 'overview', name: 'Overview', icon: DocumentTextIcon },
            { id: 'api-integration', name: 'API Integration', icon: KeyIcon },
            { id: 'chat', name: 'AI Chat', icon: ChatBubbleLeftRightIcon },
            { id: 'webhooks', name: 'Webhooks', icon: LinkIcon },
            { id: 'logs', name: 'API Logs', icon: QueueListIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`folder-tab ${isActive ? 'active' : ''}`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="card-static p-6 md:p-8 space-y-6">
            <h2 className="text-xl font-display font-semibold text-[var(--ink)]">Record Metadata Overview</h2>

            <div className="max-w-xl space-y-2 border-t border-[var(--border)] pt-4">
              <DotLeaderRow label="pipeline_status" value={document.status?.toUpperCase()} />
              <DotLeaderRow label="intake_timestamp" value={formatDate(document.uploadedAt)} />
              <DotLeaderRow label="file_size" value={document.size} />
              <DotLeaderRow label="file_format" value={(document.fileType || 'pdf').toUpperCase()} />
              <DotLeaderRow label="document_id" value={document.id || document._id} />
            </div>

            {document.status === 'ready' && (
              <div className="pt-4 border-t border-[var(--border)]">
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
            <div className="card-static p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-display font-semibold text-[var(--ink)]">API Key Credentials</h2>
                  <p className="text-xs text-[var(--ink-muted)] mt-1 font-medium">Generate timing-safe API keys for external endpoints.</p>
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
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th scope="col" className="table-header-premium">Key Prefix</th>
                      <th scope="col" className="table-header-premium">Status Stamp</th>
                      <th scope="col" className="table-header-premium">Created</th>
                      <th scope="col" className="table-header-premium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiKeysLoading ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-6 text-center text-xs font-mono text-[var(--ink-muted)]">
                          <div className="flex justify-center items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-[var(--border)] border-t-[var(--accent-teal)]"></div>
                            <span>Fetching credentials...</span>
                          </div>
                        </td>
                      </tr>
                    ) : apiKeys && apiKeys.length > 0 ? (
                      apiKeys.map((key) => (
                        <tr key={key.id || key._id} className="table-row-premium">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-[var(--ink)]">
                            {key.keyPrefix ? `${key.keyPrefix}...` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusStamp status={key.revoked ? 'failed' : 'ready'} label={key.revoked ? 'REVOKED' : 'ACTIVE'} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-[var(--ink-muted)]">
                            {key.createdAt ? formatDate(key.createdAt) : 'Just now'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            {!key.revoked && (
                              <button
                                onClick={() => handleRevokeApiKey(key.id || key._id)}
                                className="btn-danger p-1 text-xs px-3"
                              >
                                Revoke
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-xs font-mono text-[var(--ink-muted)]">
                          No external keys configured yet for this document file.
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
        <div className="backdrop-glass" onClick={() => setShowKeyModal(false)}>
          <div
            className="modal-theme"
            role="dialog"
            aria-modal="true"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-display font-semibold text-[var(--ink)]">API Key Issued</h2>
              <button
                onClick={() => setShowKeyModal(false)}
                className="p-1 rounded text-[var(--ink-muted)] hover:text-[var(--ink)]"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-[var(--ink-muted)] leading-relaxed font-medium">
                Tear off this secret document API key slip and store it in your environment variables. It will not be shown again.
              </p>
              {/* Perforated tear-off slip border */}
              <div className="p-4 bg-[var(--surface-sunken)] rounded border-2 border-dashed border-[var(--border)] text-xs font-mono text-[var(--accent-teal)] font-bold break-all leading-normal">
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
                Copy Key Slip
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
