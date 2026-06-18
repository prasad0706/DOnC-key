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
      setError('Failed to connect to the API. Ensure the backend server and MongoDB are running.');
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
      {/* API Key Input */}
      <div className="card-premium-no-hover p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-md font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">Sandbox Authentication</h2>
          <div className="flex items-center text-xs font-semibold text-slate-400 dark:text-slate-500">
            <InformationCircleIcon className="h-4 w-4 mr-1.5 text-blue-500" />
            <span>Document API key required</span>
          </div>
        </div>

        <div className="space-y-1">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your secret API key (doc_xxxx...)"
            className="input-premium"
          />
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            Paste the API key generated for this document. It is verified using secure prefix matching.
          </p>
        </div>
      </div>

      {/* Endpoint Selector & Request Config */}
      <div className="card-premium-no-hover p-6 space-y-4">
        <h2 className="text-md font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">Request Playground</h2>
        
        {/* Endpoint Selector */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Target Endpoint</label>
          <div className="relative">
            <select
              value={selectedEndpoint}
              onChange={(e) => {
                setSelectedEndpoint(e.target.value);
                setResponse(null);
                setError(null);
              }}
              className="input-premium focus:ring-4 focus:ring-blue-500/10 pr-10 appearance-none font-medium"
            >
              <option value="data">GET /api/v1/data (Standard Extraction Wrapper)</option>
              <option value="extract">GET /api/v1/extract/:documentId (Direct Extracted Object)</option>
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <ChevronDownIcon className="h-4.5 w-4.5" />
            </div>
          </div>
        </div>

        {/* Live URL bar */}
        <div className="flex items-center space-x-2.5 font-mono text-xs border border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl select-all">
          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20 text-[9px] font-bold rounded">GET</span>
          <span className="text-slate-600 dark:text-slate-400 truncate">{getEndpointUrl()}</span>
        </div>

        {/* Headers Preview */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Headers</label>
          <div className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-xl space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Content-Type</span>
              <span className="text-slate-800 dark:text-slate-200">application/json</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">x-api-key</span>
              <span className="text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
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
          {loading ? 'Executing sandbox query...' : 'Send Request'}
        </button>
      </div>

      {/* Response Display */}
      {response && (
        <div className="card-premium-no-hover p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-md font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">Response Panel</h2>
            <button
              onClick={() => copyToClipboard(JSON.stringify(response.data, null, 2))}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              title="Copy response body"
            >
              {copiedResponse ? (
                <CheckIcon className="h-4 w-4 text-emerald-500" />
              ) : (
                <ClipboardIcon className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold ${
              response.status >= 200 && response.status < 300 
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20' 
                : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200/50 dark:border-rose-500/20'
            }`}>
              Status: {response.status} {response.statusText}
            </span>
            {latency !== null && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200/50 dark:border-blue-500/20">
                Latency: {latency} ms
              </span>
            )}
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
              Type: {response.headers['content-type']}
            </span>
          </div>

          <div className="p-4 bg-slate-900 dark:bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 overflow-auto max-h-96">
            <pre className="leading-normal">{JSON.stringify(response.data, null, 2)}</pre>
          </div>
        </div>
      )}

      {/* Error Card */}
      {error && (
        <div className="p-4 rounded-xl border text-sm bg-rose-50 text-rose-700 border-rose-200/50 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 flex items-start space-x-2.5">
          <ExclamationTriangleIcon className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-xs uppercase tracking-wider text-rose-800 dark:text-rose-400">Execution Failed</p>
            <p className="text-xs text-rose-600 dark:text-rose-400/90 leading-relaxed font-medium">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TryApiTab;