import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { PlayIcon, ClipboardIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const TryApiTab = ({ documentId }) => {
  const { theme } = useTheme();
  const [activeEndpoint, setActiveEndpoint] = useState('query');
  const [apiKey, setApiKey] = useState('');
  const [requestBody, setRequestBody] = useState('{\n  "query": "invoice amount",\n  "fields": ["amount", "currency"]\n}');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cardClasses = `p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`;
  const sectionTitleClasses = `text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`;
  const textClasses = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const codeClasses = `p-3 rounded-md break-all ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} text-sm font-mono`;

  const baseUrl = `https://api.docintel.com/v1/documents/${documentId}`;

  const handleExecute = async () => {
    if (!apiKey) {
      setError('API key is required');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock response based on endpoint
      if (activeEndpoint === 'query') {
        const mockResponse = {
          success: true,
          data: {
            results: [
              { amount: 1000, currency: "USD", source: "page 1" },
              { amount: 2500, currency: "EUR", source: "page 3" }
            ],
            total: 2,
            page: 1,
            limit: 10
          },
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substr(2, 9)}`
        };
        setResponse(mockResponse);
      } else if (activeEndpoint === 'info') {
        const mockResponse = {
          success: true,
          data: {
            documentId: documentId,
            name: "Invoice_2023_Q4.pdf",
            status: "ready",
            uploadedAt: "2023-12-15T10:30:00Z",
            processedAt: "2023-12-15T10:35:00Z",
            size: "2.4 MB",
            pages: 12,
            entities: ["Company Name", "Invoice Number", "Date", "Amount"],
            schema: {
              fields: {
                amount: { type: "number", description: "Invoice amount" },
                currency: { type: "string", description: "Currency code" },
                date: { type: "string", format: "date", description: "Invoice date" }
              }
            }
          },
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substr(2, 9)}`
        };
        setResponse(mockResponse);
      }
    } catch (err) {
      setError('Failed to execute API request. Please check your API key and request body.');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
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

      {/* Endpoint Selector */}
      <div className={cardClasses}>
        <h2 className={sectionTitleClasses}>Endpoint</h2>

        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setActiveEndpoint('query')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${activeEndpoint === 'query' ? 'bg-blue-600 text-white' : theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            POST /query
          </button>
          <button
            onClick={() => setActiveEndpoint('info')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${activeEndpoint === 'info' ? 'bg-blue-600 text-white' : theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            GET /info
          </button>
        </div>

        <div className="mb-4">
          <h3 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Endpoint URL</h3>
          <div className="flex items-center justify-between">
            <div className={codeClasses + ' flex-1'}>
              {baseUrl}/{activeEndpoint}
            </div>
            <button
              onClick={() => copyToClipboard(`${baseUrl}/${activeEndpoint}`)}
              className={`p-2 rounded-md ml-2 ${theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
              title="Copy to clipboard"
            >
              <ClipboardIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Request Body */}
      {activeEndpoint === 'query' && (
        <div className={cardClasses}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={sectionTitleClasses}>Request Body</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setRequestBody('{\n  "query": "invoice amount",\n  "fields": ["amount", "currency"]\n}')}
                className={`px-3 py-1 rounded-md text-sm ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Reset
              </button>
              <button
                onClick={() => copyToClipboard(requestBody)}
                className={`p-2 rounded-md ${theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                title="Copy to clipboard"
              >
                <ClipboardIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <textarea
            value={requestBody}
            onChange={(e) => setRequestBody(e.target.value)}
            className={`w-full p-3 rounded-md border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} font-mono text-sm`}
            rows={8}
            placeholder="Enter JSON request body"
          />
        </div>
      )}

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
              onClick={() => copyToClipboard(JSON.stringify(response, null, 2))}
              className={`p-2 rounded-md ${theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
              title="Copy to clipboard"
            >
              <ClipboardIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-4">
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${response.success ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
              {response.success ? 'Success' : 'Error'}
            </div>
          </div>

          <div className={codeClasses}>
            <pre>{JSON.stringify(response, null, 2)}</pre>
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