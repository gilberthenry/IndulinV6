import React from 'react';
import { Clock, CheckCircle, XCircle, Download, FileText } from 'lucide-react';

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Helper function to format certificate type
const formatCertificateType = (type) => {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const CertificateStatus = ({ requests, onDownload }) => {
  if (!requests || requests.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center py-12">
          <FileText className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Certificate Requests</h3>
          <p className="text-gray-500">You haven't requested any certificates yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800">Certificate Request Status</h2>
        <p className="text-gray-500 text-sm mt-1">Track your certificate requests</p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Certificate Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Requested Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Processed Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {requests.map((request) => {
              const statusConfig = {
                Pending: {
                  icon: <Clock className="h-4 w-4" />,
                  className: 'bg-yellow-100 text-yellow-700 border-yellow-200'
                },
                Approved: {
                  icon: <CheckCircle className="h-4 w-4" />,
                  className: 'bg-green-100 text-green-700 border-green-200'
                },
                Rejected: {
                  icon: <XCircle className="h-4 w-4" />,
                  className: 'bg-red-100 text-red-700 border-red-200'
                }
              };

              const currentStatus = statusConfig[request.status] || statusConfig.Pending;

              return (
                <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-800">
                      {formatCertificateType(request.certificateType)}
                    </div>
                    {request.remarks && (
                      <div className="text-sm text-gray-500 mt-1">{request.remarks}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {formatDate(request.requestedAt)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium border ${currentStatus.className}`}>
                      {currentStatus.icon}
                      <span>{request.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {request.processedAt ? formatDate(request.processedAt) : '-'}
                  </td>
                  <td className="px-6 py-4">
                    {request.status === 'Approved' && request.filePath && onDownload ? (
                      <button
                        onClick={() => onDownload(request.id)}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        title="Download certificate"
                      >
                        <Download className="h-4 w-4" />
                        <span className="text-sm">Download</span>
                      </button>
                    ) : request.status === 'Pending' ? (
                      <span className="text-sm text-gray-400">Processing</span>
                    ) : request.status === 'Rejected' ? (
                      <span className="text-sm text-red-500">Denied</span>
                    ) : (
                      <span className="text-sm text-gray-400">No file</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CertificateStatus;
