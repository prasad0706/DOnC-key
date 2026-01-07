import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { CodeBracketIcon, DocumentDuplicateIcon, ClipboardIcon } from '@heroicons/react/24/outline';

const ApiDocsTab = ({ documentId }) => {
  const { theme } = useTheme();
  const [activeEndpoint, setActiveEndpoint] = useState('query');

  const cardClasses = `p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`;
  const sectionTitleClasses = `text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`;
  const textClasses = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const codeClasses = `p-3 rounded-md break-all ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} text-sm`;

  const baseUrl = `https://api.docintel.com/v1/documents/${documentId}`;

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
          All requests must include your document API key in the X-Document-API-Key header.
        </p>

        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-sm">Header Example</span>
          <button
            onClick={() => copyToClipboard('X-Document-API-Key: your_document_api_key')}
            className={`p-2 rounded-md hover:bg-blue-500 hover:text-white ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
            title="Copy to clipboard"
          >
            <ClipboardIcon className="h-4 w-4" />
          </button>
        </div>

        <div className={codeClasses}>
          X-Document-API-Key: {'your_document_api_key'}
        </div>
      </div>

      {/* Endpoints Section */}
      <div className={cardClasses}>
        <h2 className={sectionTitleClasses}>Available Endpoints</h2>

        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setActiveEndpoint('query')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${activeEndpoint === 'query' ? 'bg-blue-600 text-white' : theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            /query
          </button>
          <button
            onClick={() => setActiveEndpoint('info')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${activeEndpoint === 'info' ? 'bg-blue-600 text-white' : theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            /info
          </button>
        </div>

        {activeEndpoint === 'query' && (
          <div>
            <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>POST /query</h3>
            <p className={textClasses + ' mb-4'}>Query structured data from the document.</p>

            <div className="mb-4">
              <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Request Schema</h4>
              <div className={codeClasses}>
                {`{
  "query": "string (required) - The query to execute",
  "fields": ["array of strings (optional) - Specific fields to return"],
  "limit": number (optional, default: 10) - Maximum results to return
}`}
              </div>
            </div>

            <div className="mb-4">
              <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Response Schema</h4>
              <div className={codeClasses}>
                {`{
  "success": boolean,
  "data": {
    "results": array,
    "total": number,
    "page": number,
    "limit": number
  },
  "timestamp": string,
  "requestId": string
}`}
              </div>
            </div>

            <div className="mb-4">
              <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Example Request</h4>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">cURL</span>
                <button
                  onClick={() => copyToClipboard(`curl -X POST ${baseUrl}/query \\
  -H "Content-Type: application/json" \\
  -H "X-Document-API-Key: {'your_document_api_key'}" \\
  -d '{"query": "invoice amount", "fields": ["amount", "currency"]}'`)}
                  className={`p-2 rounded-md hover:bg-blue-500 hover:text-white ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                  title="Copy to clipboard"
                >
                  <ClipboardIcon className="h-4 w-4" />
                </button>
              </div>
              <div className={codeClasses}>
                {`curl -X POST ${baseUrl}/query \\
  -H "Content-Type: application/json" \\
  -H "X-Document-API-Key: {'your_document_api_key'}" \\
  -d '{"query": "invoice amount", "fields": ["amount", "currency"]}'`}
              </div>
            </div>

            <div className="mb-4">
              <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Example Success Response</h4>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">JSON</span>
                <button
                  onClick={() => copyToClipboard(`{
  "success": true,
  "data": {
    "results": [
      {"amount": 1000, "currency": "USD"},
      {"amount": 2500, "currency": "EUR"}
    ],
    "total": 2,
    "page": 1,
    "limit": 10
  },
  "timestamp": "2023-12-15T10:30:00Z",
  "requestId": "req_abc123"
}`)}
                  className={`p-2 rounded-md hover:bg-blue-500 hover:text-white ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                  title="Copy to clipboard"
                >
                  <ClipboardIcon className="h-4 w-4" />
                </button>
              </div>
              <div className={codeClasses}>
                {`{
  "success": true,
  "data": {
    "results": [
      {"amount": 1000, "currency": "USD"},
      {"amount": 2500, "currency": "EUR"}
    ],
    "total": 2,
    "page": 1,
    "limit": 10
  },
  "timestamp": "2023-12-15T10:30:00Z",
  "requestId": "req_abc123"
}`}
              </div>
            </div>

            <div className="mb-4">
              <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Example Error Response</h4>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">JSON</span>
                <button
                  onClick={() => copyToClipboard(`{
  "success": false,
  "error": {
    "code": "INVALID_QUERY",
    "message": "Query parameter is required",
    "details": "The query field cannot be empty"
  },
  "timestamp": "2023-12-15T10:30:00Z",
  "requestId": "req_abc123"
}`)}
                  className={`p-2 rounded-md hover:bg-blue-500 hover:text-white ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                  title="Copy to clipboard"
                >
                  <ClipboardIcon className="h-4 w-4" />
                </button>
              </div>
              <div className={codeClasses}>
                {`{
  "success": false,
  "error": {
    "code": "INVALID_QUERY",
    "message": "Query parameter is required",
    "details": "The query field cannot be empty"
  },
  "timestamp": "2023-12-15T10:30:00Z",
  "requestId": "req_abc123"
}`}
              </div>
            </div>
          </div>
        )}

        {activeEndpoint === 'info' && (
          <div>
            <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>GET /info</h3>
            <p className={textClasses + ' mb-4'}>Get document metadata and processing information.</p>

            <div className="mb-4">
              <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Request</h4>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">cURL</span>
                <button
                  onClick={() => copyToClipboard(`curl -X GET ${baseUrl}/info \\
  -H "X-Document-API-Key: {'your_document_api_key'}"`)}
                  className={`p-2 rounded-md hover:bg-blue-500 hover:text-white ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                  title="Copy to clipboard"
                >
                  <ClipboardIcon className="h-4 w-4" />
                </button>
              </div>
              <div className={codeClasses}>
                {`curl -X GET ${baseUrl}/info \\
  -H "X-Document-API-Key: {'your_document_api_key'}"`}
              </div>
            </div>

            <div className="mb-4">
              <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Response Schema</h4>
              <div className={codeClasses}>
                {`{
  "success": boolean,
  "data": {
    "documentId": string,
    "name": string,
    "status": string,
    "uploadedAt": string,
    "processedAt": string,
    "size": string,
    "pages": number,
    "entities": array,
    "schema": object
  },
  "timestamp": string,
  "requestId": string
}`}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiDocsTab;