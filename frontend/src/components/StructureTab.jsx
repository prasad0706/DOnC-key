import { useTheme } from '../context/ThemeContext';
import { TableCellsIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const StructureTab = ({ document }) => {
  const { theme } = useTheme();

  const schema = {
    fields: [
      { name: 'summary', type: 'string', description: 'Comprehensive summary of the document', required: true },
      { name: 'keyPoints', type: 'array<string>', description: 'List of key takeaways', required: true },
      { name: 'entities', type: 'array<string>', description: 'Important people, organizations, or dates', required: true },
      { name: 'sentiment', type: 'string', description: 'Overall sentiment (Neutral, Positive, Negative)', required: true },
      { name: 'category', type: 'string', description: 'Document category classification', required: true }
    ]
  };

  const realOutput = document?.processingResult || { message: "Document not yet processed or no data available." };

  return (
    <div className="space-y-6">
      {/* Schema Overview */}
      <div className="card-premium-no-hover p-6">
        <div className="flex items-center space-x-3 text-blue-600 dark:text-blue-400 mb-4">
          <TableCellsIcon className="h-6 w-6" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Document Schema</h2>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium leading-relaxed">
          This schema defines the structured data model extracted from your document.
        </p>

        {/* Fields Table */}
        <div className="overflow-hidden border border-slate-100 dark:border-slate-800/40 rounded-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800/40">
              <thead>
                <tr>
                  <th scope="col" className="table-header-premium">Field Name</th>
                  <th scope="col" className="table-header-premium">Data Type</th>
                  <th scope="col" className="table-header-premium">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {schema.fields.map((field) => (
                  <tr key={field.name} className="table-row-premium">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900 dark:text-white">
                      {field.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-500 dark:text-slate-400">
                      {field.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      {field.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Actual Output */}
      <div className="card-premium-no-hover p-6">
        <div className="flex items-center space-x-3 text-blue-600 dark:text-blue-400 mb-4">
          <InformationCircleIcon className="h-6 w-6" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Extracted Data</h2>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium leading-relaxed">
          The following JSON payload contains the actual attributes extracted by the document analyzer.
        </p>

        <div className="p-5 bg-slate-900 dark:bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-blue-400 overflow-auto max-h-96">
          <pre className="text-slate-300 leading-normal">{JSON.stringify(realOutput, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
};

export default StructureTab;