import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { PlayIcon, ClipboardIcon, CheckIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const TryApiTab = ({ documentId }) => {
  const { theme } = useTheme();
  const [apiKey, setApiKey] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedResponse, setCopiedResponse] = useState(false);

  const baseUrl = `http://localhost:5000/api/v1`;

  const handleExecute = async () => {
    if (!apiKey) {
      setError('API key is required');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch(`${baseUrl}/data`, {
        method: 'GET',
        headers: {
          'x-api-key': apiKey
        }
      });

      const data = await res.json();

      setResponse({
        status: res.status,
        statusText: res.statusText,
        data: data
      });

      if (!res.ok) {
        setError(`Request failed with status: ${res.status}`);
      }

    } catch (err) {
      setError('Failed to connect to the API. Ensure the backend is running.');
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
            <span>Document-scoped key</span>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your document API key"
            className="input-premium"
          />
        </div>
      </div>

      {/* Endpoint Info & Trigger */}
      <div className="card-premium-no-hover p-6 space-y-4">
        <h2 className="text-md font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">Interactive Request</h2>
        <div className="flex items-center space-x-2.5 font-mono text-sm border border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl">
          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20 text-[10px] font-bold rounded">GET</span>
          <span className="text-xs text-slate-600 dark:text-slate-400 truncate">{baseUrl}/data</span>
        </div>

        <button
          onClick={handleExecute}
          disabled={loading || !apiKey}
          className="w-full btn-primary py-3 flex items-center justify-center gap-2"
        >
          <PlayIcon className="h-4 w-4" />
          {loading ? 'Executing sandbox query...' : 'Execute Request'}
        </button>
      </div>

      {/* Response Display */}
      {response && (
        <div className="card-premium-no-hover p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-md font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">API Response</h2>
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

          <div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
              response.status >= 200 && response.status < 300 
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20' 
                : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200/50 dark:border-rose-500/20'
            }`}>
              {response.status} {response.statusText}
            </span>
          </div>

          <div className="p-4 bg-slate-900 dark:bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 overflow-auto max-h-80">
            <pre className="leading-normal">{JSON.stringify(response.data, null, 2)}</pre>
          </div>
        </div>
      )}

      {/* Error Card */}
      {error && (
        <div className="p-4 rounded-xl border text-sm bg-rose-50 text-rose-700 border-rose-200/50 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 flex items-start space-x-2.5">
          <ExclamationTriangleIcon className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Execution Failed</p>
            <p className="text-xs text-rose-600 dark:text-rose-400/90 leading-relaxed font-medium">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TryApiTab;