import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { KeyIcon, PlusIcon, TrashIcon, ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';
import { getApiKeys, revokeApiKey, generateApiKey } from '../utils/api';

const ApiKeys = () => {
  const { theme } = useTheme();
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generatedKey, setGeneratedKey] = useState(null);
  const [copiedKeyId, setCopiedKeyId] = useState(null);

  useEffect(() => {
    const fetchApiKeys = async () => {
      try {
        // Mock data - in a real app, this would be the API call
        const mockKeys = [
          {
            id: 'key_abc123',
            name: 'Production Key',
            createdAt: '2023-12-01T10:30:00Z',
            lastUsed: '2023-12-15T14:25:00Z',
            status: 'active',
            usageCount: 47
          },
          {
            id: 'key_def456',
            name: 'Development Key',
            createdAt: '2023-11-15T09:15:00Z',
            lastUsed: '2023-12-10T11:40:00Z',
            status: 'active',
            usageCount: 12
          },
          {
            id: 'key_ghi789',
            name: 'Test Key',
            createdAt: '2023-10-20T14:20:00Z',
            lastUsed: null,
            status: 'revoked',
            usageCount: 3
          }
        ];

        setApiKeys(mockKeys);
        setLoading(false);

        // Real API call would be:
        // const data = await getApiKeys();
        // setApiKeys(data);
      } catch (err) {
        setError('Failed to fetch API keys');
        setLoading(false);
        console.error('Error fetching API keys:', err);
      }
    };

    fetchApiKeys();
  }, []);

  const handleGenerateKey = async () => {
    try {
      // Mock key generation
      const mockKey = {
        id: 'key_new123',
        key: 'docintel_sk_live_newkey123456789abcdef',
        name: 'New API Key',
        createdAt: new Date().toISOString(),
        status: 'active',
        usageCount: 0
      };

      setGeneratedKey(mockKey);
      setShowGenerateModal(true);

      // Real API call would be:
      // const key = await generateApiKey();
      // setGeneratedKey(key);
      // setShowGenerateModal(true);
    } catch (err) {
      console.error('Error generating API key:', err);
      // Handle error
    }
  };

  const handleRevokeKey = async (keyId) => {
    try {
      // Mock revoke
      setApiKeys(apiKeys.map(key =>
        key.id === keyId ? { ...key, status: 'revoked' } : key
      ));

      // Real API call would be:
      // await revokeApiKey(keyId);
      // setApiKeys(apiKeys.map(key =>
      //   key.id === keyId ? { ...key, status: 'revoked' } : key
      // ));
    } catch (err) {
      console.error('Error revoking API key:', err);
      // Handle error
    }
  };

  const handleCopyKey = (keyId) => {
    // In a real app, you would copy the actual key
    // For this mock, we'll just show the copied state
    setCopiedKeyId(keyId);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>API Keys</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>API Keys</h1>
        <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-red-900/20 text-red-400' : 'bg-red-100 text-red-700'}`}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>API Keys</h1>
        <button
          onClick={handleGenerateKey}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Generate New Key
        </button>
      </div>

      {apiKeys.length === 0 ? (
        <div className={`p-8 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
          <KeyIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h2 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>No API keys found</h2>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Generate your first API key to get started</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Key ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Used
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Usage
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={theme === 'dark' ? 'bg-gray-800 divide-y divide-gray-700' : 'bg-white divide-y divide-gray-200'}>
              {apiKeys.map((key) => (
                <tr key={key.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{key.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">{key.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${key.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
                      {key.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(key.createdAt)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(key.lastUsed)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">{key.usageCount} calls</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {key.status === 'active' && (
                      <button
                        onClick={() => handleCopyKey(key.id)}
                        className="inline-flex items-center px-2 py-1 text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                      >
                        {copiedKeyId === key.id ? (
                          <CheckIcon className="h-4 w-4 mr-1" />
                        ) : (
                          <ClipboardIcon className="h-4 w-4 mr-1" />
                        )}
                        {copiedKeyId === key.id ? 'Copied' : 'Copy ID'}
                      </button>
                    )}
                    <button
                      onClick={() => handleRevokeKey(key.id)}
                      disabled={key.status === 'revoked'}
                      className={`inline-flex items-center px-2 py-1 ${key.status === 'revoked' ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' : 'text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300'}`}
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      {key.status === 'revoked' ? 'Revoked' : 'Revoke'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Generate Key Modal */}
      {showGenerateModal && generatedKey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg max-w-md w-full mx-4 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-semibold">API Key Generated</h2>
              <button
                onClick={() => setShowGenerateModal(false)}
                className={theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                This is your new API key. Copy it now as it will not be shown again.
              </p>
              <div className={`p-3 rounded-md break-all ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                {generatedKey.key}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedKey.key);
                  // Show some feedback that it was copied
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <ClipboardIcon className="h-5 w-5 inline-block mr-2" />
                Copy to Clipboard
              </button>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiKeys;
