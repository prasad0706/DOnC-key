import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  PlayIcon, 
  ClipboardIcon, 
  CheckIcon, 
  InformationCircleIcon, 
  ExclamationTriangleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import StatusStamp from './StatusStamp';

const TryApiTab = ({ documentId }) => {
  const { theme } = useTheme();
  const [apiKey, setApiKey] = useState('');
  const [selectedEndpoint, setSelectedEndpoint] = useState('data'); // 'data' or 'extract'
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [latency, setLatency] = useState(null);

  const baseUrl = `http://localhost:5000/api/v1`;

  const getEndpointUrl = () => {
    if (selectedEndpoint === 'data') {
      return `${baseUrl}/data`;
    }
    return `${baseUrl}/extract/${documentId}`;
  };

  const handleExecute = async () => {
    if (!apiKey) {
      setError('API key is required. Generate one in the API Integration tab above.');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);
    setLatency(null);

    const startTime = performance.now();
    const url = getEndpointUrl();

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'x-api-key': apiKey
        }
      });

      const endTime = performance.now();
      setLatency(Math.round(endTime - startTime));

      const data = await res.json();

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: {
          'content-type': res.headers.get('content-type')
        },
        data: data
      });

      if (!res.ok) {
        setError(`Request failed: ${data.error || res.statusText}`);
      }

    } catch (err) {
      setError('Failed to connect to the API. Ensure backend server and MongoDB are running.');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* API Key Input Card */}
      <div className="card-static p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider">Sandbox Authentication</h2>
          <div className="flex items-center text-xs font-mono text-[var(--ink-muted)]">
            <InformationCircleIcon className="h-4 w-4 mr-1.5 text-[var(--accent-teal)]" />
            <span>Document API Key Required</span>
          </div>
        </div>

        <div className="space-y-1">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter secret API key slip (doc_xxxx...)"
            className="input font-mono"
          />
          <p className="text-[10px] text-[var(--ink-muted)] font-medium">
            Paste the API key generated for this document. It is verified using timing-safe prefix comparison.
          </p>
        </div>
      </div>

      {/* Endpoint Selector & Request Config */}
      <div className="card-static p-6 space-y-4">
        <h2 className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider">Request Playground</h2>
        
        {/* Endpoint Selector */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">Target Endpoint</label>
          <div className="relative">
            <select
              value={selectedEndpoint}
              onChange={(e) => {
                setSelectedEndpoint(e.target.value);
                setResponse(null);
                setError(null);
              }}
              className="input pr-10 appearance-none font-mono text-xs"
            >
              <option value="data">GET /api/v1/data (Standard Extraction Wrapper)</option>
              <option value="extract">GET /api/v1/extract/:documentId (Direct Extracted Object)</option>
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-[var(--ink-muted)]">
              <ChevronDownIcon className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Live URL bar */}
        <div className="flex items-center space-x-2.5 font-mono text-xs border border-[var(--border)] bg-[var(--surface-sunken)] p-3 rounded select-all">
          <span className="px-2 py-0.5 bg-[var(--accent-teal)] text-white text-[9px] font-bold rounded">GET</span>
          <span className="text-[var(--ink-muted)] truncate">{getEndpointUrl()}</span>
        </div>

        {/* Headers Preview */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">Headers</label>
          <div className="p-3 bg-[var(--surface-sunken)] border border-[var(--border)] rounded space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-[var(--ink-muted)]">Content-Type</span>
              <span className="text-[var(--ink)]">application/json</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--ink-muted)]">x-api-key</span>
              <span className="text-[var(--ink)] truncate max-w-[200px]">
                {apiKey ? `${apiKey.substring(0, 15)}...` : '<your-secret-api-key>'}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleExecute}
          disabled={loading}
          className="w-full btn-primary py-3 flex items-center justify-center gap-2"
        >
          <PlayIcon className="h-4 w-4" />
          {loading ? 'Executing Query...' : 'Send Request'}
        </button>
      </div>

      {/* Response Display */}
      {response && (
        <div className="card-static p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider">Response Panel</h2>
            <button
              onClick={() => copyToClipboard(JSON.stringify(response.data, null, 2))}
              className="p-2 rounded border border-[var(--border)] text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-sunken)] transition-colors"
              title="Copy response body"
            >
              {copiedResponse ? (
                <CheckIcon className="h-4 w-4 text-[var(--accent-teal)]" />
              ) : (
                <ClipboardIcon className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <StatusStamp
              status={response.status === 200 ? 'ready' : 'failed'}
              label={`${response.status} ${response.statusText}`}
            />
            {latency !== null && (
              <span className="font-mono text-xs text-[var(--ink-muted)]">
                LATENCY: {latency}ms
              </span>
            )}
            <span className="font-mono text-xs text-[var(--ink-muted)]">
              TYPE: {response.headers['content-type']}
            </span>
          </div>

          <div className="p-4 bg-[var(--surface-sunken)] rounded border border-[var(--border)] text-xs font-mono text-[var(--ink)] overflow-auto max-h-96">
            <pre className="whitespace-pre">{JSON.stringify(response.data, null, 2)}</pre>
          </div>
        </div>
      )}

      {/* Error Card */}
      {error && (
        <div className="p-4 rounded border text-sm bg-red-500/10 text-[var(--accent-red)] border-red-500/20 flex items-start space-x-2.5">
          <ExclamationTriangleIcon className="h-5 w-5 text-[var(--accent-red)] flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-xs uppercase tracking-wider text-[var(--accent-red)]">Execution Failed</p>
            <p className="text-xs text-[var(--accent-red)] leading-relaxed font-medium">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TryApiTab;