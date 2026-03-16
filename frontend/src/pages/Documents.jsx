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
        // Real API call to fetch documents
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
        <h1 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Documents</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Documents</h1>
        <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-red-900/20 text-red-400' : 'bg-red-100 text-red-700'}`}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Documents</h1>
        <Link
          to="/documents/upload"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <DocumentTextIcon className="h-5 w-5 mr-2" />
          Upload Document
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
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
            className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark'
              ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
              : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setSearchResults(null); }}
              className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`}
            >
              Clear
            </button>
          )}
        </div>
        {isSearching && (
          <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Searching...</p>
        )}
        {searchResults && (
          <div className="mt-3">
            <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Found {searchResults.total} result{searchResults.total !== 1 ? 's' : ''} for "{searchResults.query}"
            </p>
            {searchResults.results.map((r) => (
              <Link key={r.documentId} to={`/documents/${r.documentId}`}
                className={`block p-3 mb-2 rounded-lg border transition-colors ${theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 hover:border-blue-500'
                  : 'bg-white border-gray-200 hover:border-blue-400'
                }`}>
                <div className="flex items-center justify-between">
                  <span className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{r.fileName}</span>
                  {r.category && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>{r.category}</span>
                  )}
                </div>
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{r.summary}</p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {documents.length === 0 ? (
        <div className={`p-8 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
          <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h2 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>No documents found</h2>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Upload your first document to get started</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}>
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
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={theme === 'dark' ? 'bg-gray-800 divide-y divide-gray-700' : 'bg-white divide-y divide-gray-200'}>
              {documents.map((doc) => (
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
  );
};

export default Documents;
