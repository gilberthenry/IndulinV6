import React, { useEffect, useState } from 'react';
import { FileText, CheckCircle, XCircle, Clock, Download, Upload, Eye } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import hrService from '../../services/hrService';

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

// Helper function to format certificate type
const formatCertificateType = (type) => {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function HRCertificates() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingRequest, setUploadingRequest] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingRequest, setViewingRequest] = useState(null);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reasonRequest, setReasonRequest] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await hrService.getCertificateRequests();
      setRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch certificate requests:', error);
      showToast('Failed to load certificate requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      setActionLoading(true);
      await hrService.approveCertificate(requestId);
      showToast('Certificate request approved', 'success');
      fetchRequests();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to approve certificate:', error);
      showToast('Failed to approve certificate', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (requestId, remarks) => {
    try {
      setActionLoading(true);
      await hrService.rejectCertificate(requestId, remarks);
      showToast('Certificate request rejected', 'success');
      fetchRequests();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to reject certificate:', error);
      showToast('Failed to reject certificate', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUploadCertificate = async () => {
    if (!selectedFile || !uploadingRequest) {
      showToast('Please select a file', 'error');
      return;
    }

    try {
      setActionLoading(true);
      await hrService.uploadCertificateFile(uploadingRequest.id, selectedFile);
      showToast('Certificate file uploaded successfully', 'success');
      fetchRequests();
      setShowUploadModal(false);
      setSelectedFile(null);
      setUploadingRequest(null);
    } catch (error) {
      console.error('Failed to upload certificate:', error);
      showToast('Failed to upload certificate file', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type (PDF only)
      if (file.type !== 'application/pdf') {
        showToast('Please select a PDF file', 'error');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast('File size must be less than 5MB', 'error');
        return;
      }
      setSelectedFile(file);
    }
  };

  const filteredRequests = requests.filter(req => {
    if (filterStatus === 'all') return true;
    return req.status.toLowerCase() === filterStatus.toLowerCase();
  });

  const statusCounts = {
    all: requests.length,
    pending: requests.filter(r => r.status.toLowerCase() === 'pending').length,
    approved: requests.filter(r => r.status.toLowerCase() === 'approved').length,
    rejected: requests.filter(r => r.status.toLowerCase() === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="p-8 bg-gray-50/50 min-h-screen">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading certificate requests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50/50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Certificate Requests</h1>
        <p className="text-gray-600 mt-2">
          Review and process employee certificate requests
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex space-x-2 border-b border-gray-200">
        {['all', 'pending', 'approved', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-6 py-3 font-medium capitalize transition-colors ${
              filterStatus === status
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100">
              {statusCounts[status]}
            </span>
          </button>
        ))}
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Requests Found</h3>
            <p className="text-gray-500">
              {filterStatus === 'all' 
                ? "No certificate requests have been submitted yet."
                : `No ${filterStatus} certificate requests.`
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Employee
                  </th>
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRequests.map((request) => {
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
                          {request.Employee?.fullName || 'Unknown Employee'}
                        </div>
                        <div className="text-sm text-gray-500">ID: {request.employeeId}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-700">
                          {formatCertificateType(request.certificateType)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700 text-sm">
                        {formatDate(request.requestedAt)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${currentStatus.className}`}>
                          {currentStatus.icon}
                          <span>{request.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700 text-sm">
                        {request.processedAt ? formatDate(request.processedAt) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          {request.status === 'Pending' && (
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowModal(true);
                              }}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-lg transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                              <span>Review</span>
                            </button>
                          )}
                          {request.status === 'Approved' && !request.filePath && (
                            <button
                              onClick={() => {
                                setUploadingRequest(request);
                                setShowUploadModal(true);
                              }}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
                            >
                              <Upload className="h-4 w-4" />
                              <span>Upload</span>
                            </button>
                          )}
                          {request.status === 'Approved' && request.filePath && (
                            <button
                              onClick={() => {
                                setViewingRequest(request);
                                setShowViewModal(true);
                              }}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                              <span>View</span>
                            </button>
                          )}
                          {request.status === 'Rejected' && (
                            <button
                              onClick={() => {
                                setReasonRequest(request);
                                setShowReasonModal(true);
                              }}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded-lg transition-colors border border-red-200"
                            >
                              <Eye className="h-4 w-4" />
                              <span>View Reason</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showModal && selectedRequest && (
        <ReviewModal
          request={selectedRequest}
          onClose={() => {
            setShowModal(false);
            setSelectedRequest(null);
          }}
          onApprove={handleApprove}
          onReject={handleReject}
          loading={actionLoading}
        />
      )}

      {/* Upload Modal */}
      {showUploadModal && uploadingRequest && (
        <UploadModal
          request={uploadingRequest}
          selectedFile={selectedFile}
          onFileChange={handleFileChange}
          onClose={() => {
            setShowUploadModal(false);
            setUploadingRequest(null);
            setSelectedFile(null);
          }}
          onUpload={handleUploadCertificate}
          loading={actionLoading}
        />
      )}

      {/* View Certificate Modal */}
      {showViewModal && viewingRequest && (
        <ViewCertificateModal
          request={viewingRequest}
          onClose={() => {
            setShowViewModal(false);
            setViewingRequest(null);
          }}
        />
      )}

      {/* View Rejection Reason Modal */}
      {showReasonModal && reasonRequest && (
        <ViewReasonModal
          request={reasonRequest}
          onClose={() => {
            setShowReasonModal(false);
            setReasonRequest(null);
          }}
        />
      )}
    </div>
  );
}

// Upload Modal Component
function UploadModal({ request, selectedFile, onFileChange, onClose, onUpload, loading }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-8 py-6 text-white">
          <h2 className="text-2xl font-bold">Upload Certificate File</h2>
          <p className="text-purple-100 text-sm mt-1">Upload the generated certificate for the employee</p>
        </div>

        {/* Modal Body */}
        <div className="p-8 space-y-6">
          {/* Request Details */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Employee:</span>
              <span className="font-semibold text-gray-800">{request.Employee?.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Certificate Type:</span>
              <span className="font-semibold text-gray-800">{formatCertificateType(request.certificateType)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Request Date:</span>
              <span className="font-semibold text-gray-800">{formatDate(request.requestedAt)}</span>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Certificate File (PDF only, max 5MB)
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".pdf"
                onChange={onFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 file:cursor-pointer cursor-pointer border-2 border-dashed border-gray-300 rounded-xl p-4"
              />
            </div>
            {selectedFile && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
                <FileText className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">{selectedFile.name}</p>
                  <p className="text-xs text-green-600">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              <strong>Instructions:</strong>
            </p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
              <li>Generate the certificate document using the appropriate template</li>
              <li>Save the certificate as a PDF file</li>
              <li>Upload the PDF file here (max 5MB)</li>
              <li>The employee will be able to download it once uploaded</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onUpload}
            disabled={loading || !selectedFile}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>{loading ? 'Uploading...' : 'Upload Certificate'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// View Certificate Modal Component
function ViewCertificateModal({ request, onClose }) {
  const handleDownload = async () => {
    try {
      // Construct the download URL
      const downloadUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api${request.filePath}`;
      
      // Open in new tab for preview/download
      window.open(downloadUrl, '_blank');
    } catch (error) {
      console.error('Failed to download certificate:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6 text-white">
          <h2 className="text-2xl font-bold">View Certificate</h2>
          <p className="text-blue-100 text-sm mt-1">Certificate details and download</p>
        </div>

        {/* Modal Body */}
        <div className="p-8 space-y-6">
          {/* Certificate Details */}
          <div className="bg-gray-50 rounded-xl p-6 space-y-4">
            <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                {request.Employee?.fullName?.charAt(0) || 'U'}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {request.Employee?.fullName || 'Unknown Employee'}
                </h3>
                <p className="text-sm text-gray-500">ID: {request.employeeId}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Certificate Type</label>
                <p className="font-semibold text-gray-800 mt-1">
                  {formatCertificateType(request.certificateType)}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Request Date</label>
                <p className="font-semibold text-gray-800 mt-1">{formatDate(request.requestedAt)}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Approved Date</label>
                <p className="font-semibold text-gray-800 mt-1">{formatDate(request.processedAt)}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Status</label>
                <p className="mt-1">
                  <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                    <CheckCircle className="h-3 w-3" />
                    <span>Approved</span>
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* File Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900">Certificate File Available</p>
                <p className="text-sm text-blue-700 mt-1">
                  The certificate has been generated and is ready for download.
                </p>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors shadow-md hover:shadow-lg"
          >
            <Download className="h-5 w-5" />
            <span>Download Certificate</span>
          </button>
        </div>

        {/* Modal Footer */}
        <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// View Rejection Reason Modal Component
function ViewReasonModal({ request, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-8 py-6 text-white">
          <h2 className="text-2xl font-bold">Rejection Details</h2>
          <p className="text-red-100 text-sm mt-1">Certificate request was not approved</p>
        </div>

        {/* Modal Body */}
        <div className="p-8 space-y-6">
          {/* Request Details */}
          <div className="bg-gray-50 rounded-xl p-6 space-y-4">
            <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white text-2xl font-bold">
                {request.Employee?.fullName?.charAt(0) || 'U'}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {request.Employee?.fullName || 'Unknown Employee'}
                </h3>
                <p className="text-sm text-gray-500">ID: {request.employeeId}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Certificate Type</label>
                <p className="font-semibold text-gray-800 mt-1">
                  {formatCertificateType(request.certificateType)}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Request Date</label>
                <p className="font-semibold text-gray-800 mt-1">{formatDate(request.requestedAt)}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Rejected Date</label>
                <p className="font-semibold text-gray-800 mt-1">
                  {request.processedAt ? formatDate(request.processedAt) : 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Status</label>
                <p className="mt-1">
                  <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                    <XCircle className="h-3 w-3" />
                    <span>Rejected</span>
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Rejection Reason */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-3 block">
              Reason for Rejection
            </label>
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <p className="text-gray-800 leading-relaxed">
                {request.remarks || 'No specific reason provided.'}
              </p>
            </div>
          </div>

          {/* Information Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> The employee has been notified about this rejection. 
              They may submit a new request after addressing the issues mentioned above.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Review Modal Component
function ReviewModal({ request, onClose, onApprove, onReject, loading }) {
  const [remarks, setRemarks] = useState('');
  const [action, setAction] = useState(null);

  const handleSubmit = () => {
    if (action === 'approve') {
      onApprove(request.id);
    } else if (action === 'reject') {
      if (!remarks.trim()) {
        alert('Please provide a reason for rejection');
        return;
      }
      onReject(request.id, remarks);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-violet-500 to-violet-600 px-8 py-6 text-white">
          <h2 className="text-2xl font-bold">Review Certificate Request</h2>
          <p className="text-violet-100 text-sm mt-1">Evaluate and process this request</p>
        </div>

        {/* Modal Body */}
        <div className="p-8 space-y-6">
          {/* Request Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">Employee</label>
              <p className="font-semibold text-gray-800">
                {request.Employee?.fullName || 'Unknown Employee'}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Employee ID</label>
              <p className="font-semibold text-gray-800">{request.employeeId}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Certificate Type</label>
              <p className="font-semibold text-gray-800">
                {formatCertificateType(request.certificateType)}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Requested Date</label>
              <p className="font-semibold text-gray-800">{formatDate(request.requestedAt)}</p>
            </div>
          </div>

          {/* Action Selection */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-3 block">
              Select Action
            </label>
            <div className="flex space-x-4">
              <button
                onClick={() => setAction('approve')}
                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 rounded-xl border-2 transition-all ${
                  action === 'approve'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">Approve</span>
              </button>
              <button
                onClick={() => setAction('reject')}
                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 rounded-xl border-2 transition-all ${
                  action === 'reject'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-red-300'
                }`}
              >
                <XCircle className="h-5 w-5" />
                <span className="font-semibold">Reject</span>
              </button>
            </div>
          </div>

          {/* Remarks (shown for rejection) */}
          {action === 'reject' && (
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Reason for Rejection *
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows="4"
                placeholder="Provide a reason for rejecting this request..."
              />
            </div>
          )}

          {/* Note for Approval */}
          {action === 'approve' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> After approval, you'll need to generate and upload the certificate file 
                for the employee to download. You can do this from the approved requests list.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !action}
            className={`px-6 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              action === 'approve'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : action === 'reject'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-300 text-gray-500'
            }`}
          >
            {loading ? 'Processing...' : action === 'approve' ? 'Approve Request' : action === 'reject' ? 'Reject Request' : 'Select Action'}
          </button>
        </div>
      </div>
    </div>
  );
}
