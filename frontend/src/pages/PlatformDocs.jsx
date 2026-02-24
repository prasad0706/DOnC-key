import { useTheme } from '../context/ThemeContext';
import { BookOpenIcon, InformationCircleIcon, ShieldCheckIcon, ScaleIcon, CodeBracketIcon } from '@heroicons/react/24/outline';

const PlatformDocs = () => {
  const { theme } = useTheme();

  const cardClasses = `p-6 rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`;
  const sectionTitleClasses = `text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`;
  const sectionSubtitleClasses = `text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`;
  const textClasses = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';

  return (
    <div className="p-6">
      <h1 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Platform Documentation</h1>

      {/* Overview */}
      <div className={cardClasses + ' mb-6'}>
        <div className="flex items-center mb-4">
          <BookOpenIcon className="h-6 w-6 text-blue-500 mr-2" />
          <h2 className={sectionTitleClasses}>Platform Overview</h2>
        </div>

        <p className={textClasses + ' mb-4'}>
          Welcome to the Document Intelligence Platform. This platform provides comprehensive document processing and API access capabilities.
        </p>

        <div className="mb-4">
          <h3 className={sectionSubtitleClasses}>Key Features</h3>
          <ul className={`list-disc pl-5 space-y-2 ${textClasses}`}>
            <li>Document upload and processing</li>
            <li>Structured data extraction</li>
            <li>Document-scoped API access</li>
            <li>Comprehensive usage tracking</li>
            <li>Secure authentication and authorization</li>
          </ul>
        </div>
      </div>

      {/* Authentication */}
      <div className={cardClasses + ' mb-6'}>
        <div className="flex items-center mb-4">
          <ShieldCheckIcon className="h-6 w-6 text-blue-500 mr-2" />
          <h2 className={sectionTitleClasses}>Authentication</h2>
        </div>

        <div className="mb-4">
          <h3 className={sectionSubtitleClasses}>Platform Authentication</h3>
          <p className={textClasses + ' mb-2'}>
            The platform uses JWT-based authentication for user access. All API requests must include an Authorization header:
          </p>
          <div className={`p-3 rounded-md break-all ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            Authorization: Bearer {'your_user_token'}
          </div>
        </div>

        <div className="mb-4">
          <h3 className={sectionSubtitleClasses}>Document API Authentication</h3>
          <p className={textClasses + ' mb-2'}>
            Each document has its own API key for document-specific operations:
          </p>
          <div className={`p-3 rounded-md break-all ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            X-Document-API-Key: {'your_document_api_key'}
          </div>
        </div>
      </div>

      {/* Rate Limits */}
      <div className={cardClasses + ' mb-6'}>
        <div className="flex items-center mb-4">
          <ScaleIcon className="h-6 w-6 text-blue-500 mr-2" />
          <h2 className={sectionTitleClasses}>Rate Limits</h2>
        </div>

        <div className="mb-4">
          <h3 className={sectionSubtitleClasses}>Platform API Rate Limits</h3>
          <ul className={`list-disc pl-5 space-y-2 ${textClasses}`}>
            <li>100 requests per minute per user</li>
            <li>1000 requests per hour per user</li>
            <li>10,000 requests per day per user</li>
          </ul>
        </div>

        <div className="mb-4">
          <h3 className={sectionSubtitleClasses}>Document API Rate Limits</h3>
          <ul className={`list-disc pl-5 space-y-2 ${textClasses}`}>
            <li>60 requests per minute per document</li>
            <li>500 requests per hour per document</li>
            <li>5,000 requests per day per document</li>
          </ul>
        </div>
      </div>

      {/* API Differences */}
      <div className={cardClasses + ' mb-6'}>
        <div className="flex items-center mb-4">
          <CodeBracketIcon className="h-6 w-6 text-blue-500 mr-2" />
          <h2 className={sectionTitleClasses}>Platform API vs Document API</h2>
        </div>

        <div className="mb-4">
          <h3 className={sectionSubtitleClasses}>Platform API</h3>
          <ul className={`list-disc pl-5 space-y-2 ${textClasses}`}>
            <li>User-level operations</li>
            <li>Document management</li>
            <li>Account management</li>
            <li>Usage tracking</li>
            <li>Base URL: /api/v1/platform</li>
          </ul>
        </div>

        <div className="mb-4">
          <h3 className={sectionSubtitleClasses}>Document API</h3>
          <ul className={`list-disc pl-5 space-y-2 ${textClasses}`}>
            <li>Document-specific operations</li>
            <li>Data extraction and querying</li>
            <li>Document metadata access</li>
            <li>Structured data retrieval</li>
            <li>Base URL: /api/v1/documents/{'document_id'}</li>
          </ul>
        </div>
      </div>

      {/* Usage Guidelines */}
      <div className={cardClasses}>
        <div className="flex items-center mb-4">
          <InformationCircleIcon className="h-6 w-6 text-blue-500 mr-2" />
          <h2 className={sectionTitleClasses}>Usage Guidelines</h2>
        </div>

        <div className="mb-4">
          <h3 className={sectionSubtitleClasses}>Best Practices</h3>
          <ul className={`list-disc pl-5 space-y-2 ${textClasses}`}>
            <li>Cache API responses when possible</li>
            <li>Use pagination for large datasets</li>
            <li>Implement proper error handling</li>
            <li>Respect rate limits to avoid throttling</li>
            <li>Keep API keys secure and rotate them regularly</li>
          </ul>
        </div>

        <div className="mb-4">
          <h3 className={sectionSubtitleClasses}>Error Handling</h3>
          <p className={textClasses + ' mb-2'}>
            The API uses standard HTTP status codes. Common error responses include:
          </p>
          <ul className={`list-disc pl-5 space-y-2 ${textClasses}`}>
            <li>400 Bad Request - Invalid parameters</li>
            <li>401 Unauthorized - Authentication failed</li>
            <li>403 Forbidden - Insufficient permissions</li>
            <li>404 Not Found - Resource not found</li>
            <li>429 Too Many Requests - Rate limit exceeded</li>
            <li>500 Internal Server Error - Server-side error</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PlatformDocs;