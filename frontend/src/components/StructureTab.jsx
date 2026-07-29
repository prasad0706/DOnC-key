import { useTheme } from '../context/ThemeContext';
import { TableCellsIcon, InformationCircleIcon, DocumentIcon } from '@heroicons/react/24/outline';
import DotLeaderRow from './DotLeaderRow';

const StructureTab = ({ document }) => {
  const { theme } = useTheme();

  const defaultFields = [
    { name: 'summary', type: 'string', description: 'Comprehensive summary of the document' },
    { name: 'keyPoints', type: 'array<string>', description: 'List of key takeaways' },
    { name: 'entities', type: 'array<string>', description: 'Important people, organizations, or dates' },
    { name: 'sentiment', type: 'string', description: 'Overall sentiment (Neutral, Positive, Negative)' },
    { name: 'category', type: 'string', description: 'Document category classification' }
  ];

  const realOutput = document?.processingResult || { message: "Document pending intake processing." };
  const fileUrl = document?.fileUrl;

  const isImage = document?.fileType?.startsWith('image/') || 
                  /\.(jpg|jpeg|png|gif|webp)$/i.test(document?.fileName || '');
  const isPdf = document?.fileType === 'application/pdf' || 
                /\.(pdf)$/i.test(document?.fileName || '');

  // Extract key-value entries from processing result
  const outputEntries = typeof realOutput === 'object' && realOutput !== null
    ? Object.entries(realOutput)
    : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
      {/* Left Column: Visual File Source Viewer */}
      <div className="card-static p-6 flex flex-col space-y-4">
        <div className="flex items-center space-x-3 text-[var(--accent-teal)]">
          <DocumentIcon className="h-6 w-6" />
          <h2 className="text-lg font-display font-semibold text-[var(--ink)]">Source Document File</h2>
        </div>
        <p className="text-xs text-[var(--ink-muted)] font-medium">
          Original file catalog record reviewed alongside intake extraction outputs.
        </p>
        
        <div className="flex-1 min-h-[500px] border border-[var(--border)] bg-[var(--surface-sunken)] rounded overflow-hidden flex items-center justify-center relative">
          {fileUrl ? (
            isImage ? (
              <img 
                src={fileUrl} 
                alt="Source document" 
                className="max-w-full max-h-[550px] object-contain p-2 rounded"
              />
            ) : isPdf ? (
              <iframe 
                src={`${fileUrl}#toolbar=0&navpanes=0`} 
                title="Source PDF"
                className="w-full h-full min-h-[550px] border-0"
              />
            ) : (
              <div className="p-8 text-center text-[var(--ink-muted)] text-xs font-semibold">
                Preview not available for format: <span className="uppercase font-mono text-[var(--accent-teal)]">{document?.fileType || 'Unknown'}</span>
                <div className="mt-4">
                  <a 
                    href={fileUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="btn-secondary text-xs px-3.5 py-1.5"
                  >
                    Download Source File
                  </a>
                </div>
              </div>
            )
          ) : (
            <div className="text-xs font-mono text-[var(--ink-muted)]">
              No document source URL present in intake payload.
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Structured Dot-Leader Rows */}
      <div className="space-y-6 flex flex-col justify-between">
        {/* Extracted Fields Catalog (Dot-Leader Rows) */}
        <div className="card-static p-6 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-[var(--accent-teal)]">
              <InformationCircleIcon className="h-6 w-6" />
              <h2 className="text-lg font-display font-semibold text-[var(--ink)]">Extracted Catalog Fields</h2>
            </div>

            <p className="text-xs text-[var(--ink-muted)] font-medium">
              Structured catalog fields extracted directly from paper source into record data.
            </p>

            <div className="p-4 bg-[var(--surface-sunken)] rounded border border-[var(--border)] max-h-[380px] overflow-y-auto space-y-1">
              {outputEntries.length > 0 ? (
                outputEntries.map(([key, val]) => (
                  <DotLeaderRow key={key} label={key} value={val} />
                ))
              ) : (
                <div className="p-4 font-mono text-xs text-[var(--ink-muted)]">
                  {JSON.stringify(realOutput, null, 2)}
                </div>
              )}
            </div>
          </div>
          
          <div className="pt-4 border-t border-[var(--border)] mt-4 text-[10px] font-mono text-[var(--ink-muted)] uppercase tracking-wider flex justify-between">
            <span>TYPE: {document?.fileType || 'PDF'}</span>
            <span>PROVIDER: {document?.storageProvider || 'DESK_STORAGE'}</span>
          </div>
        </div>

        {/* Extraction Schema Attributes */}
        <div className="card-static p-6">
          <div className="flex items-center space-x-3 text-[var(--accent-teal)] mb-3">
            <TableCellsIcon className="h-5 w-5" />
            <h2 className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider">Schema Type Registry</h2>
          </div>
          <div className="max-h-40 overflow-y-auto p-3 bg-[var(--surface-sunken)] rounded border border-[var(--border)] space-y-1">
            {(document?.customSchema || defaultFields).map((field) => (
              <DotLeaderRow
                key={field.name}
                label={field.name}
                type={field.type}
                value={field.description || field.type}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StructureTab;