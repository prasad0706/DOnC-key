import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { DocumentTextIcon, ArrowTopRightOnSquareIcon, MagnifyingGlassIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { getDocuments, searchDocuments, deleteDocument } from '../utils/api';
import StatusStamp from '../components/StatusStamp';

const Documents = () => {
  const { theme } = useTheme();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchType, setSearchType] = useState('text'); // 'text' or 'semantic'

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await getDocuments();
      setDocuments(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch document intake records');
      setLoading(false);
      console.error('Error fetching documents:', err);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document intake record?')) return;
    try {
      await deleteDocument(docId);
      setDocuments(prev => prev.filter(d => d.id !== docId));
    } catch (err) {
      console.error('Failed to delete document:', err);
      alert('Failed to delete document');
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
        <h1 className="text-3xl font-display font-semibold text-[var(--ink)] mb-6">Document Registry</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--border)] border-t-[var(--accent-teal)]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-display font-semibold text-[var(--ink)] mb-6">Document Registry</h1>
        <div className="p-4 rounded border bg-red-500/10 text-[var(--accent-red)] border-red-500/20">
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
          <h1 className="text-3xl font-display font-semibold tracking-tight text-[var(--ink)]">Document Registry</h1>
          <p className="text-sm text-[var(--ink-muted)] mt-1 font-medium">Manage and query your structured record documents.</p>
        </div>
        <Link
          to="/dashboard"
          className="btn-primary"
        >
          <DocumentTextIcon className="h-5 w-5 mr-2" />
          Intake Document
        </Link>
      </div>

      {/* Search Bar & Mode Selector */}
      <div className="space-y-3">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--ink-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={async (e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                setIsSearching(true);
                try {
                  const data = await searchDocuments(searchQuery, searchType);
                  setSearchResults(data);
                } catch (err) {
                  console.error('Search error:', err);
                }
                setIsSearching(false);
              }
            }}
            placeholder="Search document registry... (press Enter)"
            className="input pl-12 pr-12 py-3"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setSearchResults(null); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--ink-muted)] hover:text-[var(--ink)]"
            >
              Clear
            </button>
          )}
        </div>

        {/* Search Type Button Group */}
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)] mr-2">Search Mode:</span>
          <button
            onClick={() => setSearchType('text')}
            className={`px-3 py-1 rounded text-xs font-semibold border transition-all ${
              searchType === 'text'
                ? 'bg-[var(--accent-teal)] border-[var(--accent-teal)] text-white'
                : 'bg-[var(--surface)] border-[var(--border)] text-[var(--ink-muted)]'
            }`}
          >
            Full-Text Keywords
          </button>
          <button
            onClick={() => setSearchType('semantic')}
            className={`px-3 py-1 rounded text-xs font-semibold border transition-all ${
              searchType === 'semantic'
                ? 'bg-[var(--accent-teal)] border-[var(--accent-teal)] text-white'
                : 'bg-[var(--surface)] border-[var(--border)] text-[var(--ink-muted)]'
            }`}
          >
            Semantic Vector
          </button>
        </div>
      </div>

      {isSearching && (
        <p className="text-xs font-mono text-[var(--accent-teal)] animate-pulse">Searching vector catalog...</p>
      )}

      {searchResults && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">
              Found {searchResults.total} record{searchResults.total !== 1 ? 's' : ''} for "{searchResults.query}"
            </p>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--surface-sunken)] text-[var(--accent-teal)] border border-[var(--border)] uppercase">
              {searchResults.searchMethod === 'semantic' ? 'Semantic Match' : 'Keyword Match'}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchResults.results.map((r) => (
              <Link key={r.documentId} to={`/documents/${r.documentId}`}
                className="card block p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[var(--ink)] truncate max-w-[70%]">{r.fileName}</span>
                  {r.category && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-[var(--border)] bg-[var(--surface-sunken)] text-[var(--accent-teal)] uppercase">
                      {r.category}
                    </span>
                  )}
                </div>
                <p className="text-xs mt-2.5 text-[var(--ink-muted)] line-clamp-2 leading-relaxed">{r.summary}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Documents Table */}
      {documents.length === 0 ? (
        <div className="card-static p-12 text-center flex flex-col items-center justify-center">
          <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-[var(--ink-muted)]" />
          <h2 className="text-lg font-display font-semibold mb-2 text-[var(--ink)]">No record documents found</h2>
          <p className="text-[var(--ink-muted)] max-w-sm mb-6 text-sm">Upload your first document to begin registry intake.</p>
          <Link to="/dashboard" className="btn-secondary">
            Intake File
          </Link>
        </div>
      ) : (
        <div className="card-static overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th scope="col" className="table-header-premium">
                    Document File
                  </th>
                  <th scope="col" className="table-header-premium">
                    Ink Status Stamp
                  </th>
                  <th scope="col" className="table-header-premium">
                    Intake Date
                  </th>
                  <th scope="col" className="table-header-premium">
                    File Size
                  </th>
                  <th scope="col" className="table-header-premium text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="table-row-premium">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-5 w-5 text-[var(--accent-teal)] mr-3 flex-shrink-0" />
                        <span className="text-sm font-semibold text-[var(--ink)] truncate max-w-xs">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusStamp status={doc.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-[var(--ink-muted)]">
                      {formatDate(doc.uploadedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-[var(--ink-muted)]">
                      {doc.size}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Link
                        to={`/documents/${doc.id}`}
                        className="btn-secondary py-1 px-3 text-xs"
                      >
                        <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-1 inline" />
                        Inspect
                      </Link>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="btn-danger p-1.5"
                        title="Delete Document"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
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
