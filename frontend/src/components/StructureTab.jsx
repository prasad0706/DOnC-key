import { useTheme } from '../context/ThemeContext';
import { TableCellsIcon, InformationCircleIcon, DocumentIcon } from '@heroicons/react/24/outline';

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
  const fileUrl = document?.fileUrl;
  
  // Check if image or PDF
  const isImage = document?.fileType?.startsWith('image/') || 
                  /\.(jpg|jpeg|png|gif|webp)$/i.test(document?.fileName || '');
  const isPdf = document?.fileType === 'application/pdf' || 
                /\.(pdf)$/i.test(document?.fileName || '');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
      {/* Left Column: Visual File Preview */}
      <div className="card-premium-no-hover p-6 flex flex-col space-y-4">
        <div className="flex items-center space-x-3 text-blue-600 dark:text-blue-400">
          <DocumentIcon className="h-6 w-6" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Document Source Viewer</h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Review the uploaded original source file side-by-side with extraction data.
        </p>
        
        <div className="flex-1 min-h-[500px] border border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center relative">
          {fileUrl ? (
            isImage ? (
              <img 
                src={fileUrl} 
                alt="Source document" 
                className="max-w-full max-h-[550px] object-contain p-2 shadow-sm rounded-lg"
              />
            ) : isPdf ? (
              <iframe 
                src={`${fileUrl}#toolbar=0&navpanes=0`} 
                title="Source PDF"
                className="w-full h-full min-h-[550px] border-0"
              />
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs font-semibold">
                Preview not supported for type: <span className="uppercase text-blue-500">{document?.fileType || 'Unknown'}</span>
                <div className="mt-4">
                  <a 
                    href={fileUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="btn-secondary text-[11px] px-3.5 py-1.5"
                  >
                    Download Source File
                  </a>
                </div>
              </div>
            )
          ) : (
            <div className="text-xs font-semibold text-slate-400 dark:text-slate-500">
              No document source URL available.
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Extracted Data / Schema */}
      <div className="space-y-6 flex flex-col justify-between">
        {/* Extracted Output */}
        <div className="card-premium-no-hover p-6 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-blue-600 dark:text-blue-400">
              <InformationCircleIcon className="h-6 w-6" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Extracted Metadata JSON</h2>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              The structured attributes parsed from this file using Gemini's response schema.
            </p>

            <div className="p-4 bg-slate-900 dark:bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-blue-400 overflow-auto max-h-[350px]">
              <pre className="text-slate-300 leading-normal">{JSON.stringify(realOutput, null, 2)}</pre>
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/40 mt-4 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
            Format: {document?.fileType || 'unknown'} | Storage: {document?.storageProvider || 'default'}
          </div>
        </div>

        {/* Schema Attributes Summary */}
        <div className="card-premium-no-hover p-6">
          <div className="flex items-center space-x-3 text-blue-600 dark:text-blue-400 mb-3">
            <TableCellsIcon className="h-5.5 w-5.5" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">Extraction Schema Definitions</h2>
          </div>
          <div className="max-h-36 overflow-y-auto border border-slate-100 dark:border-slate-800/60 rounded-xl">
            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800/40 text-[11px]">
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {(document?.customSchema || schema.fields).map((field) => (
                  <tr key={field.name} className="table-row-premium">
                    <td className="px-4 py-2 font-mono font-bold text-slate-900 dark:text-white">{field.name}</td>
                    <td className="px-4 py-2 font-semibold text-blue-600 dark:text-blue-400 uppercase">{field.type}</td>
                    <td className="px-4 py-2 text-slate-500 dark:text-slate-400 truncate max-w-[150px]">{field.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StructureTab;