import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Check, X, MessageSquare, Eye, FileText, Download, Clock, Upload as UploadIcon } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import hrService from '../../services/hrService';

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

// Helper function to format document type
const formatDocumentType = (type) => {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function HRDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectedDocument, setRejectedDocument] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const { showToast } = useToast();

  useEffect(() => {
    fetchDocuments();
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await hrService.getEmployees();
      setEmployees(response.data || response);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const documents = await hrService.getDocuments();
      setDocuments(documents);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      showToast('Failed to load documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = async (document) => {
    setSelectedDocument(document);
    setShowViewModal(true);
  };

  const handleReviewDocument = (document) => {
    setSelectedDocument(document);
    setShowReviewModal(true);
  };

  const handleApprove = async (docId) => {
    try {
      setActionLoading(true);
      await hrService.approveDocument(docId);
      showToast('Document approved successfully', 'success');
      fetchDocuments();
      setShowReviewModal(false);
      setSelectedDocument(null);
    } catch (error) {
      console.error('Failed to approve document:', error);
      showToast('Failed to approve document', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (docId, reason) => {
    if (!reason || !reason.trim()) {
      showToast('Please provide a reason for rejection', 'error');
      return;
    }

    try {
      setActionLoading(true);
      await hrService.rejectDocument(docId, reason);
      showToast('Document rejected', 'success');
      fetchDocuments();
      setShowReviewModal(false);
      setSelectedDocument(null);
    } catch (error) {
      console.error('Failed to reject document:', error);
      showToast('Failed to reject document', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestDocument = async (employeeId, documentType, reason) => {
    try {
      setActionLoading(true);
      await hrService.requestDocument(employeeId, documentType, reason);
      showToast('Document request sent successfully', 'success');
      fetchDocuments();
      setShowRequestModal(false);
    } catch (error) {
      console.error('Failed to request document:', error);
      showToast('Failed to send document request', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusPill = (status, isHRRequested) => {
    const statusConfig = {
      'Requested': { className: 'bg-blue-100 text-blue-800 border-blue-200', icon: <Clock className="h-4 w-4" />, text: 'Requested by HR' },
      'Pending': { className: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: <AlertTriangle className="h-4 w-4" />, text: 'Pending Review' },
      'Approved': { className: 'bg-green-100 text-green-800 border-green-200', icon: <CheckCircle className="h-4 w-4" />, text: 'Approved' },
      'Rejected': { className: 'bg-red-100 text-red-800 border-red-200', icon: <XCircle className="h-4 w-4" />, text: 'Rejected' }
    };
    
    const config = statusConfig[status] || statusConfig['Pending'];
    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${config.className}`}>
        {config.icon}
        <span>{config.text}</span>
      </span>
    );
  };

  const filteredDocuments = documents.filter(doc => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'requested') return doc.status === 'Requested';
    return doc.status.toLowerCase() === filterStatus;
  });

  return (
    <div className="p-6 bg-gray-50/50 min-h-screen">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Document Verification</h1>
          <p className="text-gray-600 mt-2">Review employee documents and request new submissions</p>
        </div>
        <button
          onClick={() => setShowRequestModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors shadow-md hover:shadow-lg"
        >
          <FileText className="h-5 w-5" />
          <span>Request Document</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex space-x-2 border-b border-gray-200">
        {['all', 'requested', 'pending', 'approved', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-6 py-3 font-medium capitalize transition-colors ${
              filterStatus === status
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {status}
            {status !== 'all' && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100">
                {documents.filter(d => {
                  if (status === 'requested') return d.status === 'Requested';
                  return d.status.toLowerCase() === status;
                }).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading documents...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No documents found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Document Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Upload Date
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
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">
                        {doc.Employee?.fullName || 'Unknown Employee'}
                      </div>
                      <div className="text-sm text-gray-500">ID: {doc.employeeId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-700">
                        {formatDocumentType(doc.type)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700 text-sm">
                      {formatDate(doc.uploadedAt)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusPill(doc.status, doc.isHRRequested)}
                    </td>
                    <td className="px-6 py-4 text-gray-700 text-sm">
                      {doc.processedAt ? formatDate(doc.processedAt) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        {doc.status === 'Requested' ? (
                          <span className="text-sm text-blue-600 font-medium flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>Waiting for employee</span>
                          </span>
                        ) : doc.status === 'Rejected' ? (
                          /* Rejected Documents - Show specific actions */
                          <>
                            {doc.rejectionReason && (
                              <button
                                onClick={() => {
                                  setRejectedDocument(doc);
                                  setShowRejectModal(true);
                                }}
                                className="flex items-center space-x-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded-lg transition-colors border border-red-200"
                              >
                                <MessageSquare className="h-4 w-4" />
                                <span>View Reason</span>
                              </button>
                            )}
                            {doc.filePath && (
                              <button
                                onClick={() => handleViewDocument(doc)}
                                className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition-colors border border-gray-300"
                              >
                                <FileText className="h-4 w-4" />
                                <span>View File</span>
                              </button>
                            )}
                          </>
                        ) : (
                          /* Approved, Pending, and other statuses */
                          <>
                            {doc.filePath && (
                              <button
                                onClick={() => handleViewDocument(doc)}
                                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                              >
                                <Eye className="h-4 w-4" />
                                <span>View</span>
                              </button>
                            )}
                            {doc.status === 'Pending' && (
                              <button
                                onClick={() => handleReviewDocument(doc)}
                                className="flex items-center space-x-1 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-lg transition-colors"
                              >
                                <MessageSquare className="h-4 w-4" />
                                <span>Review</span>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Document Modal */}
      {showViewModal && selectedDocument && (
        <ViewDocumentModal
          document={selectedDocument}
          onClose={() => {
            setShowViewModal(false);
            setSelectedDocument(null);
          }}
        />
      )}

      {/* Review Modal */}
      {showReviewModal && selectedDocument && (
        <ReviewModal
          document={selectedDocument}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedDocument(null);
          }}
          onApprove={handleApprove}
          onReject={handleReject}
          loading={actionLoading}
        />
      )}

      {/* Request Document Modal */}
      {showRequestModal && (
        <RequestDocumentModal
          employees={employees}
          onClose={() => setShowRequestModal(false)}
          onSubmit={handleRequestDocument}
          loading={actionLoading}
        />
      )}

      {/* Rejection Reason Modal */}
      {showRejectModal && rejectedDocument && (
        <RejectionReasonModal
          document={rejectedDocument}
          onClose={() => {
            setShowRejectModal(false);
            setRejectedDocument(null);
          }}
        />
      )}
    </div>
  );
}

// View Document Modal Component
function ViewDocumentModal({ document, onClose }) {
  const [documentUrl, setDocumentUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fileType, setFileType] = useState(null);
  const [canPreview, setCanPreview] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const loadDocument = async () => {
      try {
        setLoading(true);
        const response = await hrService.viewDocument(document.id);
        // response.data is already a Blob when responseType: 'blob' is set
        const blob = response.data;
        const url = window.URL.createObjectURL(blob);
        setDocumentUrl(url);
        
        // Determine file type from blob type or filename
        const blobType = blob.type;
        setFileType(blobType);
        
        // Check if file can be previewed in browser
        const previewableTypes = [
          'application/pdf',
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'image/webp'
        ];
        setCanPreview(previewableTypes.includes(blobType));
      } catch (error) {
        console.error('Failed to load document:', error);
        console.error('Error details:', error.response || error);
        showToast('Failed to load document', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadDocument();

    return () => {
      if (documentUrl) {
        window.URL.revokeObjectURL(documentUrl);
      }
    };
  }, [document.id]);

  const handleDownload = () => {
    if (documentUrl) {
      const link = document.createElement('a');
      link.href = documentUrl;
      // Get file extension from document type or default to pdf
      const ext = document.filePath ? document.filePath.split('.').pop() : 'pdf';
      link.download = `${document.type}_${document.Employee?.fullName || 'document'}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const renderDocumentPreview = () => {
    if (!documentUrl) return null;

    // For images, use img tag
    if (fileType?.startsWith('image/')) {
      return (
        <img
          src={documentUrl}
          alt={document.type}
          className="max-w-full max-h-full object-contain mx-auto"
        />
      );
    }

    // For PDFs, use iframe
    if (fileType === 'application/pdf') {
      return (
        <iframe
          src={documentUrl}
          className="w-full h-full rounded-lg bg-white"
          title="Document Preview"
        />
      );
    }

    // For non-previewable files, show message
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <FileText className="h-20 w-20 text-gray-400" />
        <p className="text-gray-600 text-center">
          This file type cannot be previewed in the browser.
        </p>
        <p className="text-gray-500 text-sm">
          File type: {fileType || 'Unknown'}
        </p>
        <button
          onClick={handleDownload}
          className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <Download className="h-5 w-5" />
          <span>Download to View</span>
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-white flex justify-between items-center rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold">View Document</h2>
            <p className="text-blue-100 text-sm">{formatDocumentType(document.type)} - {document.Employee?.fullName}</p>
          </div>
          <div className="flex space-x-2">
            {/* Show download button in header only if file can be previewed */}
            {canPreview && (
              <button
                onClick={handleDownload}
                disabled={!documentUrl}
                className="p-2 hover:bg-green-600 rounded-lg transition-colors disabled:opacity-50"
                title="Download"
              >
                <Download className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-blue-600 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Document Viewer */}
        <div className="flex-1 p-4 bg-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading document...</p>
              </div>
            </div>
          ) : documentUrl ? (
            renderDocumentPreview()
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Failed to load document</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Review Modal Component
function ReviewModal({ document, onClose, onApprove, onReject, loading }) {
  const [action, setAction] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleSubmit = () => {
    if (action === 'approve') {
      onApprove(document.id);
    } else if (action === 'reject') {
      onReject(document.id, rejectionReason);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-violet-500 to-violet-600 px-8 py-6 text-white">
          <h2 className="text-2xl font-bold">Review Document</h2>
          <p className="text-violet-100 text-sm mt-1">Approve or reject this document submission</p>
        </div>

        {/* Modal Body */}
        <div className="p-8 space-y-6">
          {/* Document Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">Employee</label>
              <p className="font-semibold text-gray-800">
                {document.Employee?.fullName || 'Unknown Employee'}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Employee ID</label>
              <p className="font-semibold text-gray-800">{document.employeeId}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Document Type</label>
              <p className="font-semibold text-gray-800">
                {formatDocumentType(document.type)}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Upload Date</label>
              <p className="font-semibold text-gray-800">{formatDate(document.uploadedAt)}</p>
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

          {/* Rejection Reason */}
          {action === 'reject' && (
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Reason for Rejection *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows="4"
                placeholder="Provide a reason for rejecting this document..."
              />
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
            {loading ? 'Processing...' : action === 'approve' ? 'Approve Document' : action === 'reject' ? 'Reject Document' : 'Select Action'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Request Document Modal Component
function RequestDocumentModal({ employees, onClose, onSubmit, loading }) {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [reason, setReason] = useState('');

  const documentTypes = [
    'Medical_Certificate',
    'NBI_Clearance',
    'Police_Clearance',
    'Birth_Certificate',
    'Marriage_Certificate',
    'Transcript_of_Records',
    'Diploma',
    'Tax_Identification_Number',
    'SSS_ID',
    'PhilHealth_ID',
    'Pag-IBIG_ID',
    'Valid_Government_ID',
    'Barangay_Clearance',
    'Certificate_of_Employment',
    'Other_Document'
  ];

  const handleSubmit = () => {
    if (!selectedEmployee || !documentType) {
      alert('Please select employee and document type');
      return;
    }
    onSubmit(parseInt(selectedEmployee), documentType, reason);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6 text-white">
          <h2 className="text-2xl font-bold">Request Document from Employee</h2>
          <p className="text-blue-100 text-sm mt-1">Send a document request to an employee</p>
        </div>

        {/* Modal Body */}
        <div className="p-8 space-y-6">
          {/* Employee Selection */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-3 block">
              Select Employee *
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose an employee...</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} (ID: {emp.employeeId})
                </option>
              ))}
            </select>
          </div>

          {/* Document Type Selection */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-3 block">
              Document Type *
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose document type...</option>
              {documentTypes.map((type) => (
                <option key={type} value={type}>
                  {formatDocumentType(type)}
                </option>
              ))}
            </select>
          </div>

          {/* Reason/Purpose */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-3 block">
              Reason/Purpose (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="4"
              placeholder="Provide a reason or purpose for this document request..."
            />
          </div>

          {/* Information Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> The employee will be notified of this request and can upload the document from their dashboard. 
              Once uploaded, you'll be able to review and approve it.
            </p>
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
            onClick={handleSubmit}
            disabled={loading || !selectedEmployee || !documentType}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <UploadIcon className="h-4 w-4" />
            <span>{loading ? 'Sending...' : 'Send Request'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Rejection Reason Modal Component
function RejectionReasonModal({ document, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-8 py-6 text-white">
          <h2 className="text-2xl font-bold">Rejection Details</h2>
          <p className="text-red-100 text-sm mt-1">Document was not approved</p>
        </div>

        {/* Modal Body */}
        <div className="p-8 space-y-6">
          {/* Document Details */}
          <div className="bg-gray-50 rounded-xl p-6 space-y-4">
            <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                <FileText className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">
                  {document.Employee?.fullName || 'Unknown Employee'}
                </h3>
                <p className="text-sm text-gray-500">ID: {document.Employee?.employeeId || document.employeeId}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Document Type</label>
                <p className="font-semibold text-gray-800 mt-1">
                  {formatDocumentType(document.type)}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Uploaded Date</label>
                <p className="font-semibold text-gray-800 mt-1">{formatDate(document.uploadedAt)}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Rejected Date</label>
                <p className="font-semibold text-gray-800 mt-1">
                  {document.processedAt ? formatDate(document.processedAt) : 'N/A'}
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
                {document.rejectionReason || 'No specific reason provided.'}
              </p>
            </div>
          </div>

          {/* Reviewer Info */}
          {document.Processor && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                <strong>Reviewed by:</strong> {document.Processor.fullName} ({document.Processor.role?.toUpperCase() || 'HR'})
              </p>
            </div>
          )}

          {/* Information Note */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> The employee has been notified about this rejection. 
              They may upload a corrected document after addressing the issues mentioned above.
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
