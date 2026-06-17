import { useTheme } from '../context/ThemeContext';
import { BookOpenIcon, InformationCircleIcon, ShieldCheckIcon, ScaleIcon, CodeBracketIcon } from '@heroicons/react/24/outline';

const PlatformDocs = () => {
  const { theme } = useTheme();

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Platform Documentation</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Learn how to authenticate and query DOnC-key APIs.</p>
      </div>

      {/* Overview */}
      <div className="card-premium-no-hover p-6 md:p-8 space-y-4">
        <div className="flex items-center space-x-3 text-blue-600 dark:text-blue-400">
          <BookOpenIcon className="h-6 w-6" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Platform Overview</h2>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
          Welcome to the Document Intelligence Platform. This platform provides comprehensive document processing and API access capabilities.
        </p>
        <div className="pt-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">Key Features</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></span>
              <span>Document upload and processing</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></span>
              <span>Structured data extraction</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></span>
              <span>Document-scoped API access</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></span>
              <span>Comprehensive usage tracking</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></span>
              <span>Secure authentication</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Authentication */}
      <div className="card-premium-no-hover p-6 md:p-8 space-y-6">
        <div className="flex items-center space-x-3 text-blue-600 dark:text-blue-400">
          <ShieldCheckIcon className="h-6 w-6" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Authentication</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-md font-bold text-slate-900 dark:text-white">Platform API Authentication</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              The platform dashboard uses JWT-based authentication for user access. Include user token in authorization header:
            </p>
            <div className="p-4 bg-slate-900 dark:bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-blue-400 break-all leading-normal">
              Authorization: Bearer {'your_user_token'}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-md font-bold text-slate-900 dark:text-white">Document API Authentication</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Each document exposes its own API endpoints secured by unique keys. Include the key header:
            </p>
            <div className="p-4 bg-slate-900 dark:bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-blue-400 break-all leading-normal">
              X-Document-API-Key: {'your_document_api_key'}
            </div>
          </div>
        </div>
      </div>

      {/* Rate Limits */}
      <div className="card-premium-no-hover p-6 md:p-8 space-y-6">
        <div className="flex items-center space-x-3 text-blue-600 dark:text-blue-400">
          <ScaleIcon className="h-6 w-6" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Rate Limits</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-3 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30">
            <h3 className="font-bold text-slate-900 dark:text-white">Platform API Rate Limits</h3>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400 font-medium">
              <li>100 requests per minute per user</li>
              <li>1,000 requests per hour per user</li>
              <li>10,000 requests per day per user</li>
            </ul>
          </div>

          <div className="space-y-3 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30">
            <h3 className="font-bold text-slate-900 dark:text-white">Document API Rate Limits</h3>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400 font-medium">
              <li>60 requests per minute per document</li>
              <li>500 requests per hour per document</li>
              <li>5,000 requests per day per document</li>
            </ul>
          </div>
        </div>
      </div>

      {/* API Differences */}
      <div className="card-premium-no-hover p-6 md:p-8 space-y-6">
        <div className="flex items-center space-x-3 text-blue-600 dark:text-blue-400">
          <CodeBracketIcon className="h-6 w-6" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Platform API vs Document API</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800/60 pb-2">Platform API</h3>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400 font-medium">
              <li>User-level accounts & setups</li>
              <li>Document management (create, delete, lists)</li>
              <li>Account usage metrics & analytics</li>
              <li className="font-mono text-xs text-blue-500 mt-2">Base URL: /api/v1/platform</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800/60 pb-2">Document API</h3>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400 font-medium">
              <li>Document-specific operations</li>
              <li>Structured data payload query sandbox</li>
              <li>Document content schema and keys</li>
              <li className="font-mono text-xs text-blue-500 mt-2">Base URL: /api/v1/documents/:id</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Usage Guidelines */}
      <div className="card-premium-no-hover p-6 md:p-8 space-y-6">
        <div className="flex items-center space-x-3 text-blue-600 dark:text-blue-400">
          <InformationCircleIcon className="h-6 w-6" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Usage Guidelines</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white">Best Practices</h3>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400 font-medium">
              <li>Cache API responses locally when possible.</li>
              <li>Use pagination for large document listings.</li>
              <li>Implement proper fallback error handling.</li>
              <li>Respect rate limits to avoid getting throttled.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white">API Response Codes</h3>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400 font-medium">
              <li><strong className="text-slate-700 dark:text-slate-300 font-semibold">400</strong> - Bad request parameters</li>
              <li><strong className="text-slate-700 dark:text-slate-300 font-semibold">401</strong> - Invalid credentials</li>
              <li><strong className="text-slate-700 dark:text-slate-300 font-semibold">429</strong> - Rate limit exceeded</li>
              <li><strong className="text-slate-700 dark:text-slate-300 font-semibold">500</strong> - Server processing error</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformDocs;