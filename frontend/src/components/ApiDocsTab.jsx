import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';

const ApiDocsTab = ({ documentId }) => {
  const { theme } = useTheme();
  const [copiedSection, setCopiedSection] = useState(null);

  const baseUrl = `http://localhost:5000/api/v1`;

  const copyToClipboard = (text, sectionId) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Base URL Section */}
      <div className="card-premium-no-hover p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-md font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">Base URL</h2>
          <button
            onClick={() => copyToClipboard(baseUrl, 'base')}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            title="Copy to clipboard"
          >
            {copiedSection === 'base' ? (
              <CheckIcon className="h-4 w-4 text-emerald-500 animate-scale" />
            ) : (
              <ClipboardIcon className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="p-4 bg-slate-900 dark:bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-blue-400 break-all leading-normal">
          {baseUrl}
        </div>

        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
          All document API endpoints are relative to this base URL.
        </p>
      </div>

      {/* Authentication Section */}
      <div className="card-premium-no-hover p-6 space-y-4">
        <h2 className="text-md font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">Authentication</h2>

        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
          Authenticate requests by supplying your document API key in the custom <code>x-api-key</code> request header:
        </p>

        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Header Parameter</span>
          <button
            onClick={() => copyToClipboard('x-api-key: your_document_api_key', 'auth')}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            title="Copy to clipboard"
          >
            {copiedSection === 'auth' ? (
              <CheckIcon className="h-4 w-4 text-emerald-500 animate-scale" />
            ) : (
              <ClipboardIcon className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="p-4 bg-slate-900 dark:bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-blue-400 break-all leading-normal">
          x-api-key: YOUR_DOCUMENT_API_KEY
        </div>
      </div>

      {/* Endpoints Section */}
      <div className="card-premium-no-hover p-6 space-y-6">
        <h2 className="text-md font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">Endpoints</h2>

        <div className="space-y-4">
          <div className="flex items-center space-x-2.5">
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20 text-[10px] font-bold rounded uppercase tracking-wider">
              GET
            </span>
            <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">/data</span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            Retrieve parsed metadata, entities, sentiments, and key-points from the structured document.
          </p>

          <div className="space-y-2.5">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Response payload schema</h4>
            <div className="p-4 bg-slate-900 dark:bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre">
{`{
  "documentId": "string",
  "data": {
    "summary": "string",
    "sentiment": "string",
    "entities": ["string"],
    "keyPoints": ["string"],
    "category": "string"
  }
}`}
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">cURL Example</span>
              <button
                onClick={() => copyToClipboard(`curl -X GET ${baseUrl}/data \\\n  -H "x-api-key: YOUR_API_KEY"`, 'curl')}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                title="Copy to clipboard"
              >
                {copiedSection === 'curl' ? (
                  <CheckIcon className="h-4 w-4 text-emerald-500 animate-scale" />
                ) : (
                  <ClipboardIcon className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="p-4 bg-slate-900 dark:bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-blue-400 overflow-x-auto whitespace-pre leading-normal">
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