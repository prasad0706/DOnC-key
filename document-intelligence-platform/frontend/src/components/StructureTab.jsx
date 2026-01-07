import { useTheme } from '../context/ThemeContext';
import { TableCellsIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const StructureTab = () => {
  const { theme } = useTheme();

  const cardClasses = `p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`;
  const sectionTitleClasses = `text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`;
  const textClasses = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';

  // Mock schema data
  const schema = {
    fields: [
      { name: 'invoiceNumber', type: 'string', description: 'Unique invoice identifier', required: true },
      { name: 'date', type: 'date', description: 'Invoice issue date', required: true },
      { name: 'dueDate', type: 'date', description: 'Payment due date', required: false },
      { name: 'amount', type: 'number', description: 'Total invoice amount', required: true },
      { name: 'currency', type: 'string', description: 'Currency code (ISO 4217)', required: true },
      { name: 'vendor', type: 'object', description: 'Vendor information', required: true },
      { name: 'customer', type: 'object', description: 'Customer information', required: true },
      { name: 'items', type: 'array', description: 'Line items', required: true },
      { name: 'tax', type: 'number', description: 'Total tax amount', required: false },
      { name: 'status', type: 'string', description: 'Payment status', required: false }
    ],
    entities: [
      { name: 'Vendor', fields: ['name', 'address', 'taxId'] },
      { name: 'Customer', fields: ['name', 'address', 'accountNumber'] },
      { name: 'Item', fields: ['description', 'quantity', 'unitPrice', 'total'] }
    ]
  };

  // Mock example output
  const exampleOutput = {
    invoiceNumber: "INV-2023-0042",
    date: "2023-12-15",
    dueDate: "2024-01-14",
    amount: 3500.00,
    currency: "USD",
    vendor: {
      name: "Tech Solutions Inc.",
      address: "123 Business Ave, San Francisco, CA 94105",
      taxId: "12-3456789"
    },
    customer: {
      name: "Acme Corporation",
      address: "456 Industrial Blvd, New York, NY 10001",
      accountNumber: "ACME-789"
    },
    items: [
      {
        description: "Software License - Enterprise Edition",
        quantity: 10,
        unitPrice: 250.00,
        total: 2500.00
      },
      {
        description: "Premium Support Package",
        quantity: 1,
        unitPrice: 1000.00,
        total: 1000.00
      }
    ],
    tax: 350.00,
    status: "paid"
  };

  return (
    <div className="space-y-6">
      {/* Schema Overview */}
      <div className={cardClasses}>
        <div className="flex items-center mb-4">
          <TableCellsIcon className="h-6 w-6 text-blue-500 mr-2" />
          <h2 className={sectionTitleClasses}>Document Schema</h2>
        </div>

        <p className={textClasses + ' mb-4'}>
          This schema defines the structured data extracted from your document. All fields are read-only and represent the processed document content.
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Required
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${field.required ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
                      {field.required ? 'Yes' : 'No'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Entities Table */}
        <div className="overflow-x-auto">
          <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Entities</h3>
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Entity Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Fields
                </th>
              </tr>
            </thead>
            <tbody className={theme === 'dark' ? 'bg-gray-800 divide-y divide-gray-700' : 'bg-white divide-y divide-gray-200'}>
              {schema.entities.map((entity) => (
                <tr key={entity.name}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{entity.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">{entity.fields.join(', ')}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Example Output */}
      <div className={cardClasses}>
        <div className="flex items-center mb-4">
          <InformationCircleIcon className="h-6 w-6 text-blue-500 mr-2" />
          <h2 className={sectionTitleClasses}>Example Structured Output</h2>
        </div>

        <p className={textClasses + ' mb-4'}>
          This is an example of the structured JSON output you would receive from the document API.
        </p>

        <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} text-sm font-mono`}>
          <pre>{JSON.stringify(exampleOutput, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
};

export default StructureTab;