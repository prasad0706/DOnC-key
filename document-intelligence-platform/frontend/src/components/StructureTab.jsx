import { useTheme } from '../context/ThemeContext';
import { TableCellsIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const StructureTab = ({ document }) => {
  const { theme } = useTheme();

  const cardClasses = `p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`;
  const sectionTitleClasses = `text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`;
  const textClasses = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';

  // Real schema based on Gemini prompt
  const schema = {
    fields: [
      { name: 'summary', type: 'string', description: 'Comprehensive summary of the document', required: true },
      { name: 'keyPoints', type: 'array<string>', description: 'List of key takeaways', required: true },
      { name: 'entities', type: 'array<string>', description: 'Important people, organizations, or dates', required: true },
      { name: 'sentiment', type: 'string', description: 'Overall sentiment (Neutral, Positive, Negative)', required: true },
      { name: 'category', type: 'string', description: 'Document category classification', required: true }
    ]
  };

  // Real output from document
  const realOutput = document?.processingResult || { message: "Document not yet processed or no data available." };

  return (
    <div className="space-y-6">
      {/* Schema Overview */}
      <div className={cardClasses}>
        <div className="flex items-center mb-4">
          <TableCellsIcon className="h-6 w-6 text-blue-500 mr-2" />
          <h2 className={sectionTitleClasses}>Document Schema</h2>
        </div>

        <p className={textClasses + ' mb-4'}>
          This schema defines the structured data extracted from your document by the AI.
        </p>

        {/* Fields Table */}
        <div className="overflow-x-auto mb-6">
          <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Fields</h3>
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className={theme === 'dark' ? 'bg-gray-800 divide-y divide-gray-700' : 'bg-white divide-y divide-gray-200'}>
              {schema.fields.map((field) => (
                <tr key={field.name}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{field.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">{field.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">{field.description}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actual Output */}
      <div className={cardClasses}>
        <div className="flex items-center mb-4">
          <InformationCircleIcon className="h-6 w-6 text-blue-500 mr-2" />
          <h2 className={sectionTitleClasses}>Extracted Data</h2>
        </div>

        <p className={textClasses + ' mb-4'}>
          This is the actual structured data extracted from your document.
        </p>

        <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} text-sm font-mono overflow-auto max-h-96`}>
          <pre>{JSON.stringify(realOutput, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
};

export default StructureTab;