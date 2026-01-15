import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { PlayIcon, ClipboardIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const TryApiTab = ({ documentId }) => {
  const { theme } = useTheme();
  const [apiKey, setApiKey] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cardClasses = `p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`;
  const sectionTitleClasses = `text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`;
  const textClasses = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const codeClasses = `p-3 rounded-md break-all ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} text-sm font-mono`;

  // Backend URL
  const backendURL = process.env.VITE_API_BASE_URL || 'http://localhost:5000';
  const baseUrl = `${backendURL}/api/v1`;

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
  };

  return (
    <div className="space-y-6">
      {/* API Key Input */}
      <div className={cardClasses}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={sectionTitleClasses}>API Key</h2>
          <div className="flex items-center">
            <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2" />
            <span className={`text-sm ${textClasses}`}>Document-scoped key</span>
          </div>
        </div>

        <div className="flex space-x-2">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your document API key"
            className={`flex-1 px-4 py-2 rounded-md border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          />
          <button
            onClick={() => copyToClipboard(apiKey)}
            disabled={!apiKey}
            className={`p-2 rounded-md ${!apiKey ? 'opacity-50 cursor-not-allowed' : ''} ${theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
            title="Copy to clipboard"
          >
            <ClipboardIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Endpoint Info */}
      <div className={cardClasses}>
        <h2 className={sectionTitleClasses}>Endpoint</h2>
        <div className="flex items-center space-x-2 mb-4">
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded">GET</span>
          <span className={`font-mono text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{baseUrl}/data</span>
        </div>
      </div>

      {/* Execute Button */}
      <div className={cardClasses}>
        <button
          onClick={handleExecute}
          disabled={loading}
          className={`w-full flex items-center justify-center px-6 py-3 rounded-md text-white font-medium ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          <PlayIcon className="h-5 w-5 mr-2" />
          {loading ? 'Executing...' : 'Execute Request'}
        </button>
      </div>

      {/* Response */}
      {response && (
        <div className={cardClasses}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={sectionTitleClasses}>Response</h2>
            <button
              onClick={() => copyToClipboard(JSON.stringify(response.data, null, 2))}
              className={`p-2 rounded-md ${theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
              title="Copy to clipboard"
            >
              <ClipboardIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-4">
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${response.status >= 200 && response.status < 300 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
              {response.status} {response.statusText}
            </div>
          </div>

          <div className={codeClasses + ' overflow-auto max-h-96'}>
            <pre>{JSON.stringify(response.data, null, 2)}</pre>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className={cardClasses}>
          <div className="flex items-center mb-4">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-2" />
            <h2 className={sectionTitleClasses}>Error</h2>
          </div>

          <div className={`p-3 rounded-md ${theme === 'dark' ? 'bg-red-900/20 text-red-400' : 'bg-red-100 text-red-700'}`}>
            {error}
          </div>
        </div>
      )}
    </div>
  );
};

export default TryApiTab;