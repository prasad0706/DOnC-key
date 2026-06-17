import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { DocumentTextIcon, ClockIcon, CheckCircleIcon, XCircleIcon, ArrowTopRightOnSquareIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { getDocuments, searchDocuments } from '../utils/api';

const Documents = () => {
  const { theme } = useTheme();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const data = await getDocuments();
        setDocuments(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch documents');
        setLoading(false);
        console.error('Error fetching documents:', err);
      }
    };

    fetchDocuments();
  }, []);

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
        return <ClockIcon className="h-4 w-4 mr-1.5" />;
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">Documents</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">Documents</h1>
        <div className="p-4 rounded-xl border bg-rose-50 text-rose-700 border-rose-200/50 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Documents</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Manage and query your structured documents.</p>
        </div>
        <Link
          to="/documents/upload"
          className="btn-primary"
        >
          <DocumentTextIcon className="h-5 w-5 mr-2" />
          Upload Document
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={async (e) => {
            if (e.key === 'Enter' && searchQuery.trim()) {
              setIsSearching(true);
              try {
                const data = await searchDocuments(searchQuery);
                setSearchResults(data);
              } catch (err) {
                console.error('Search error:', err);
              }
              setIsSearching(false);
            }
          }}
          placeholder="Search documents by content... (press Enter)"
          className="input-premium pl-12 pr-12 py-3.5 focus:ring-4 focus:ring-blue-500/10"
        />
        {searchQuery && (
          <button
            onClick={() => { setSearchQuery(''); setSearchResults(null); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200"
          >
            Clear
          </button>
        )}
      </div>

      {isSearching && (
        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 animate-pulse">Searching content databases...</p>
      )}

      {searchResults && (
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Found {searchResults.total} result{searchResults.total !== 1 ? 's' : ''} for "{searchResults.query}"
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchResults.results.map((r) => (
              <Link key={r.documentId} to={`/documents/${r.documentId}`}
                className="card-premium block p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-[70%]">{r.fileName}</span>
                  {r.category && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 uppercase tracking-wider">
                      {r.category}
                    </span>
                  )}
                </div>
                <p className="text-xs mt-2.5 text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{r.summary}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Documents Table */}
      {documents.length === 0 ? (
        <div className="card-premium-no-hover p-12 text-center flex flex-col items-center justify-center">
          <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-slate-400 dark:text-slate-500" />
          <h2 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">No documents found</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6">Upload your first document to get started structuring data.</p>
          <Link to="/documents/upload" className="btn-secondary">
            Upload File
          </Link>
        </div>
      ) : (
        <div className="card-premium-no-hover overflow-hidden border border-slate-100 dark:border-slate-800/40">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800/40">
              <thead>
                <tr>
                  <th scope="col" className="table-header-premium">
                    Document Name
                  </th>
                  <th scope="col" className="table-header-premium">
                    Status
                  </th>
                  <th scope="col" className="table-header-premium">
                    Uploaded
                  </th>
                  <th scope="col" className="table-header-premium">
                    Size
                  </th>
                  <th scope="col" className="table-header-premium text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {documents.map((doc) => (
                  <tr key={doc.id} className="table-row-premium">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                        <span className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-xs">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadgeClass(doc.status)}>
                        {getStatusIcon(doc.status)}
                        {getStatusText(doc.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{formatDate(doc.uploadedAt)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{doc.size}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/documents/${doc.id}`}
                        className="btn-primary py-1.5 px-3.5 text-xs shadow-none hover:shadow-none"
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
        </div>
      )}
    </div>
  );
};

export default Documents;
