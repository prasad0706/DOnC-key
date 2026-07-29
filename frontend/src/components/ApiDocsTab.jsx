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
      <div className="card-static p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider">Base URL</h2>
          <button
            onClick={() => copyToClipboard(baseUrl, 'base')}
            className="p-2 rounded border border-[var(--border)] text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-sunken)] transition-colors"
            title="Copy to clipboard"
          >
            {copiedSection === 'base' ? (
              <CheckIcon className="h-4 w-4 text-[var(--accent-teal)]" />
            ) : (
              <ClipboardIcon className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="p-4 bg-[var(--surface-sunken)] rounded border border-[var(--border)] text-xs font-mono text-[var(--accent-teal)] font-bold break-all">
          {baseUrl}
        </div>

        <p className="text-xs text-[var(--ink-muted)] font-medium">
          All document endpoints are relative to this base URL.
        </p>
      </div>

      {/* Authentication Section */}
      <div className="card-static p-6 space-y-4">
        <h2 className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider">Authentication Header</h2>

        <p className="text-xs text-[var(--ink-muted)] font-medium leading-relaxed">
          Supply your document API key in the custom <code>x-api-key</code> request header:
        </p>

        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">Header Parameter</span>
          <button
            onClick={() => copyToClipboard('x-api-key: doc_xxxx...', 'auth')}
            className="p-2 rounded border border-[var(--border)] text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-sunken)] transition-colors"
            title="Copy to clipboard"
          >
            {copiedSection === 'auth' ? (
              <CheckIcon className="h-4 w-4 text-[var(--accent-teal)]" />
            ) : (
              <ClipboardIcon className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="p-4 bg-[var(--surface-sunken)] rounded border border-[var(--border)] text-xs font-mono text-[var(--accent-teal)] font-bold break-all">
          x-api-key: YOUR_DOCUMENT_API_KEY
        </div>
      </div>

      {/* Endpoints Section */}
      <div className="card-static p-6 space-y-6">
        <h2 className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider">Extraction Endpoints</h2>

        <div className="space-y-4">
          <div className="flex items-center space-x-2.5">
            <span className="px-2 py-0.5 bg-[var(--accent-teal)] text-white text-[10px] font-bold font-mono rounded uppercase">
              GET
            </span>
            <span className="font-mono text-sm font-bold text-[var(--ink)]">/data</span>
          </div>

          <p className="text-xs text-[var(--ink-muted)] font-medium leading-relaxed">
            Retrieve parsed metadata, entities, sentiments, and key-points from the structured document.
          </p>

          <div className="space-y-2.5">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">Response payload schema</h4>
            <div className="p-4 bg-[var(--surface-sunken)] rounded border border-[var(--border)] text-xs font-mono text-[var(--ink)] overflow-x-auto whitespace-pre">
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
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">cURL Example</span>
              <button
                onClick={() => copyToClipboard(`curl -X GET ${baseUrl}/data \\\n  -H "x-api-key: YOUR_API_KEY"`, 'curl')}
                className="p-2 rounded border border-[var(--border)] text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-sunken)] transition-colors"
                title="Copy to clipboard"
              >
                {copiedSection === 'curl' ? (
                  <CheckIcon className="h-4 w-4 text-[var(--accent-teal)]" />
                ) : (
                  <ClipboardIcon className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="p-4 bg-[var(--surface-sunken)] rounded border border-[var(--border)] text-xs font-mono text-[var(--accent-teal)] overflow-x-auto whitespace-pre leading-normal">
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