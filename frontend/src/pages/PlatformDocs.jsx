import { useTheme } from '../context/ThemeContext';
import { BookOpenIcon, InformationCircleIcon, ShieldCheckIcon, ScaleIcon, CodeBracketIcon } from '@heroicons/react/24/outline';

const PlatformDocs = () => {
  const { theme } = useTheme();

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-display font-semibold text-[var(--ink)]">Platform Documentation</h1>
        <p className="text-sm text-[var(--ink-muted)] mt-1 font-medium">Authentication specifications and API query references.</p>
      </div>

      {/* Overview */}
      <div className="card-static p-6 md:p-8 space-y-4">
        <div className="flex items-center space-x-3 text-[var(--accent-teal)]">
          <BookOpenIcon className="h-6 w-6" />
          <h2 className="text-xl font-display font-semibold text-[var(--ink)]">The Intake Desk Registry API</h2>
        </div>
        <p className="text-sm text-[var(--ink-muted)] font-medium leading-relaxed">
          The DOnC-key platform converts physical and digital paper into typed JSON fields with document-scoped security tokens.
        </p>
        <div className="pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)] mb-2">Core Specifications</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-[var(--ink-muted)] font-medium">
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-teal)] flex-shrink-0"></span>
              <span>Multi-format intake pipeline</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-teal)] flex-shrink-0"></span>
              <span>Gemini schema extraction</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-teal)] flex-shrink-0"></span>
              <span>Timing-safe API key verification</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-teal)] flex-shrink-0"></span>
              <span>Real-time webhook notifications</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-teal)] flex-shrink-0"></span>
              <span>Request latency and audit logging</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Authentication */}
      <div className="card-static p-6 md:p-8 space-y-6">
        <div className="flex items-center space-x-3 text-[var(--accent-teal)]">
          <ShieldCheckIcon className="h-6 w-6" />
          <h2 className="text-xl font-display font-semibold text-[var(--ink)]">Authentication Specs</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[var(--ink)]">Platform Dashboard Token</h3>
            <p className="text-xs text-[var(--ink-muted)] font-medium leading-relaxed">
              Standard Bearer token header used for dashboard session management:
            </p>
            <div className="p-4 bg-[var(--surface-sunken)] rounded border border-[var(--border)] text-xs font-mono text-[var(--accent-teal)] font-bold break-all">
              Authorization: Bearer {'<your_user_token>'}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[var(--ink)]">Document Key Slip</h3>
            <p className="text-xs text-[var(--ink-muted)] font-medium leading-relaxed">
              Document-scoped API keys passed via request headers:
            </p>
            <div className="p-4 bg-[var(--surface-sunken)] rounded border border-[var(--border)] text-xs font-mono text-[var(--accent-teal)] font-bold break-all">
              x-api-key: doc_{'<prefix>'}.{'<secret>'}
            </div>
          </div>
        </div>
      </div>

      {/* Rate Limits */}
      <div className="card-static p-6 md:p-8 space-y-6">
        <div className="flex items-center space-x-3 text-[var(--accent-teal)]">
          <ScaleIcon className="h-6 w-6" />
          <h2 className="text-xl font-display font-semibold text-[var(--ink)]">Registry Rate Limits</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-3 p-4 rounded border border-[var(--border)] bg-[var(--surface-sunken)]">
            <h3 className="font-bold text-[var(--ink)]">Platform API Limits</h3>
            <ul className="space-y-2 text-xs font-mono text-[var(--ink-muted)]">
              <li>• 100 requests / minute per user</li>
              <li>• 1,000 requests / hour per user</li>
              <li>• 10,000 requests / day per user</li>
            </ul>
          </div>

          <div className="space-y-3 p-4 rounded border border-[var(--border)] bg-[var(--surface-sunken)]">
            <h3 className="font-bold text-[var(--ink)]">Document Key Limits</h3>
            <ul className="space-y-2 text-xs font-mono text-[var(--ink-muted)]">
              <li>• 60 requests / minute per key</li>
              <li>• 500 requests / hour per key</li>
              <li>• 5,000 requests / day per key</li>
            </ul>
          </div>
        </div>
      </div>

      {/* API Differences */}
      <div className="card-static p-6 md:p-8 space-y-6">
        <div className="flex items-center space-x-3 text-[var(--accent-teal)]">
          <CodeBracketIcon className="h-6 w-6" />
          <h2 className="text-xl font-display font-semibold text-[var(--ink)]">Endpoint Architecture</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-3">
            <h3 className="font-bold text-[var(--ink)] border-b border-[var(--border)] pb-2">Platform Management API</h3>
            <ul className="space-y-2 text-xs text-[var(--ink-muted)] font-medium">
              <li>• User profile and key management</li>
              <li>• Project case file creation & deletion</li>
              <li>• Usage aggregation metrics</li>
              <li className="font-mono text-xs text-[var(--accent-teal)] font-bold mt-2">BASE: /api/v1/projects</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-[var(--ink)] border-b border-[var(--border)] pb-2">Document Extraction API</h3>
            <ul className="space-y-2 text-xs text-[var(--ink-muted)] font-medium">
              <li>• Document file uploads and background queues</li>
              <li>• Direct structured JSON output extraction</li>
              <li>• Document-scoped AI assistant chat</li>
              <li className="font-mono text-xs text-[var(--accent-teal)] font-bold mt-2">BASE: /api/v1/data</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformDocs;