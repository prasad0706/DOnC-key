import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { ClipboardIcon } from '@heroicons/react/24/outline';

const ApiDocsTab = ({ documentId }) => {
  const { theme } = useTheme();

  const cardClasses = `p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`;
  const sectionTitleClasses = `text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`;
  const textClasses = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const codeClasses = `p-3 rounded-md break-all ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} text-sm font-mono`;

  // Determine base URL dynamically or hardcode for now
  const baseUrl = `http://localhost:5000/api/v1`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <div className="space-y-6">
      {/* Base URL Section */}
      <div className={cardClasses}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={sectionTitleClasses}>Base URL</h2>
          <button
            onClick={() => copyToClipboard(baseUrl)}
            className={`p-2 rounded-md hover:bg-blue-500 hover:text-white ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
            title="Copy to clipboard"
          >
            <ClipboardIcon className="h-4 w-4" />
          </button>
        </div>

        <div className={codeClasses}>
          {baseUrl}
        </div>

        <p className={`text-sm mt-2 ${textClasses}`}>
          All document API endpoints are relative to this base URL.
        </p>
      </div>

      {/* Authentication Section */}
      <div className={cardClasses}>
        <h2 className={sectionTitleClasses}>Authentication</h2>

        <p className={textClasses + ' mb-4'}>
          All requests must include your document API key in the <code>x-api-key</code> header.
        </p>

        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-sm">Header Example</span>
          <button
            onClick={() => copyToClipboard('x-api-key: your_document_api_key')}
            className={`p-2 rounded-md hover:bg-blue-500 hover:text-white ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
            title="Copy to clipboard"
          >
            <ClipboardIcon className="h-4 w-4" />
          </button>
        </div>

        <div className={codeClasses}>
          x-api-key: {'your_document_api_key'}
        </div>
      </div>

      {/* Endpoints Section */}
      <div className={cardClasses}>
        <h2 className={sectionTitleClasses}>Available Endpoints</h2>

        <div>
          <div className="flex items-center mb-2">
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded mr-2">GET</span>
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>/data</h3>
          </div>

          <p className={textClasses + ' mb-4'}>Retrieve the structured data extracted from your document.</p>

          <div className="mb-4">
            <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Response Schema</h4>
            <div className={codeClasses}>
              {`{
  "documentId": "string",
  "data": {
    "summary": "string",
    "keyPoints": ["string"],
    "entities": ["string"],
    "sentiment": "string"
  }
}`}
            </div>
          </div>

          <div className="mb-4">
            <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Example Request</h4>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">cURL</span>
              <button
                onClick={() => copyToClipboard(`curl -X GET ${baseUrl}/data \\
  -H "x-api-key: YOUR_API_KEY"`)}
                className={`p-2 rounded-md hover:bg-blue-500 hover:text-white ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                title="Copy to clipboard"
              >
                <ClipboardIcon className="h-4 w-4" />
              </button>
            </div>
            <div className={codeClasses}>
              {`curl -X GET ${baseUrl}/data \\
  -H "x-api-key: YOUR_API_KEY"`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDocsTab;