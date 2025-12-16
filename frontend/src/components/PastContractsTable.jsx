import React from 'react';
import { Download, FileText } from 'lucide-react';

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const PastContractsTable = ({ contracts, onDownload }) => {
  if (!contracts || contracts.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center py-12">
          <FileText className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Past Contracts</h3>
          <p className="text-gray-500">You don't have any past contracts on record.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800">Past Contracts</h2>
        <p className="text-gray-500 text-sm mt-1">History of previous employment agreements</p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Position
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Date From
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Date To
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {contracts.map((contract) => (
              <tr key={contract.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-800">
                    {contract.position || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500">{contract.type}</div>
                </td>
                <td className="px-6 py-4 text-gray-700">
                  {contract.department || 'N/A'}
                </td>
                <td className="px-6 py-4 text-gray-700">
                  {formatDate(contract.startDate)}
                </td>
                <td className="px-6 py-4 text-gray-700">
                  {formatDate(contract.endDate)}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    contract.status === 'Expired' 
                      ? 'bg-gray-100 text-gray-700 border border-gray-200'
                      : 'bg-red-100 text-red-700 border border-red-200'
                  }`}>
                    {contract.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {contract.filePath && onDownload ? (
                    <button
                      onClick={() => onDownload(contract.id)}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                      title="Download contract"
                    >
                      <Download className="h-4 w-4" />
                      <span className="text-sm">Download</span>
                    </button>
                  ) : (
                    <span className="text-sm text-gray-400">No file</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PastContractsTable;
