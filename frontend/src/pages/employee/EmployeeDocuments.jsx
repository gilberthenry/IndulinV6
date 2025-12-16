import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import employeeService from '../../services/employeeService';
import api from '../../services/api';

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

const StatusCell = ({ status }) => {
  const statusConfig = {
    'Requested': { text: 'Requested by HR', icon: <Clock size={14} />, className: 'bg-blue-100 text-blue-700 border-blue-200' },
    'Pending': { text: 'Pending Review', icon: <Clock size={14} />, className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    'Approved': { text: 'Approved', icon: <CheckCircle size={14} />, className: 'bg-green-100 text-green-700 border-green-200' },
    'Rejected': { text: 'Rejected', icon: <XCircle size={14} />, className: 'bg-red-100 text-red-700 border-red-200' },
  };
  const currentStatus = statusConfig[status] || statusConfig['Pending'];
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${currentStatus.className}`}>
      {currentStatus.icon}
      <span className="ml-2">{currentStatus.text}</span>
    </span>
  );
};

export default function EmployeeDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'requested', 'uploaded'
  const { showToast } = useToast();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const documents = await employeeService.getDocuments();
      setDocuments(documents || []);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      showToast('Failed to load documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        showToast('File size must be less than 10MB', 'error');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentType) {
      showToast('Please select a file and document type', 'error');
      return;
    }

    try {
      setUploading(true);
      console.log('Uploading document:', {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        documentType: documentType
      });

      await employeeService.uploadDocument(selectedFile, documentType);
      showToast('Document uploaded successfully', 'success');
      
      // Reset form
      setSelectedFile(null);
      setDocumentType('');
      
      // Refresh documents list
      fetchDocuments();
    } catch (error) {
      console.error('Failed to upload document:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to upload document';
      showToast(errorMessage, 'error');
      
      // Show additional error details in console for debugging
      if (error.response?.data?.details) {
        console.error('Error details:', error.response.data.details);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleUploadForRequest = async (file) => {
    if (!file || !selectedRequest) {
      showToast('Please select a file', 'error');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentId', selectedRequest.id);
      formData.append('type', selectedRequest.type);

      const response = await api.post('/employee/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      showToast('Document uploaded successfully', 'success');
      setShowUploadModal(false);
      setSelectedRequest(null);
      fetchDocuments();
    } catch (error) {
      console.error('Failed to upload document:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upload document';
      showToast(errorMessage, 'error');
    } finally {
      setUploading(false);
    }
  };

  // Get requested documents count
  const requestedDocuments = documents.filter(doc => doc.isHRRequested && doc.status === 'Requested');
  const hasRequestedDocuments = requestedDocuments.length > 0;

  // Filter documents based on selected tab
  const getFilteredDocuments = () => {
    if (filterTab === 'requested') {
      return documents.filter(doc => doc.isHRRequested && doc.status === 'Requested');
    } else if (filterTab === 'uploaded') {
      return documents.filter(doc => doc.status !== 'Requested');
    }
    return documents;
  };

  const filteredDocuments = getFilteredDocuments();

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Documents</h1>
        <p className="text-gray-600 mt-2">Upload and manage your personal and employment documents</p>
      </div>

      {/* Prominent Alert Banner for HR Requests */}
      {hasRequestedDocuments && (
        <div className="mb-6 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-l-4 border-orange-500 rounded-xl shadow-lg p-6 animate-pulse">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="p-3 bg-orange-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Action Required: HR Document Request{requestedDocuments.length > 1 ? 's' : ''}
                </h3>
                <p className="text-gray-700 mb-3">
                  HR has requested {requestedDocuments.length} document{requestedDocuments.length > 1 ? 's' : ''} from you. 
                  Please upload {requestedDocuments.length > 1 ? 'them' : 'it'} as soon as possible.
                </p>
                <div className="flex flex-wrap gap-2">
                  {requestedDocuments.map((doc) => (
                    <span key={doc.id} className="inline-flex items-center px-3 py-1 bg-white border border-orange-200 rounded-full text-sm font-medium text-gray-700">
                      <FileText size={14} className="mr-1.5 text-orange-500" />
                      {formatDocumentType(doc.type)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => setFilterTab('requested')}
              className="flex-shrink-0 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2 shadow-md"
            >
              <Upload size={16} />
              <span>View Requests</span>
            </button>
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <Upload className="h-6 w-6 mr-2 text-blue-600" />
          Upload New Document
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* File Upload Area */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Document File (PDF, PNG, JPG - Max 10MB)
            </label>
            <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-blue-400 transition-colors">
              <input
                id="file-upload"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploading}
              />
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                {selectedFile ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-800">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Document Type Selection */}
          <div>
            <label htmlFor="doc-type" className="block text-sm font-semibold text-gray-700 mb-3">
              Document Type *
            </label>
            <select
              id="doc-type"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              disabled={uploading}
            >
              <option value="">Select type...</option>
              <option value="birth_certificate">Birth Certificate</option>
              <option value="nbi_clearance">NBI Clearance</option>
              <option value="police_clearance">Police Clearance</option>
              <option value="medical_certificate">Medical Certificate</option>
              <option value="sss_id">SSS ID</option>
              <option value="philhealth_id">PhilHealth ID</option>
              <option value="pagibig_id">Pag-IBIG ID</option>
              <option value="tin_id">TIN ID</option>
              <option value="diploma">Diploma</option>
              <option value="transcript_of_records">Transcript of Records</option>
              <option value="other">Other</option>
            </select>
            
            <button
              onClick={handleUpload}
              disabled={uploading || !selectedFile || !documentType}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center transition-colors"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={18} className="mr-2" />
                  Upload Document
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 flex space-x-2 border-b border-gray-200">
        <button
          onClick={() => setFilterTab('all')}
          className={`px-6 py-3 font-medium transition-colors relative ${
            filterTab === 'all'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          All Documents
          <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
            {documents.length}
          </span>
        </button>
        <button
          onClick={() => setFilterTab('requested')}
          className={`px-6 py-3 font-medium transition-colors relative ${
            filterTab === 'requested'
              ? 'text-orange-600 border-b-2 border-orange-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span>Requested by HR</span>
            {requestedDocuments.length > 0 && (
              <span className="px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded-full font-bold animate-pulse">
                {requestedDocuments.length}
              </span>
            )}
          </div>
        </button>
        <button
          onClick={() => setFilterTab('uploaded')}
          className={`px-6 py-3 font-medium transition-colors relative ${
            filterTab === 'uploaded'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          My Uploads
          <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
            {documents.filter(doc => doc.status !== 'Requested').length}
          </span>
        </button>
      </div>

      {/* HR Requested Documents Section (when filtered) */}
      {filterTab === 'requested' && requestedDocuments.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-blue-900 flex items-center">
                <AlertTriangle className="h-6 w-6 mr-2 text-blue-600" />
                Document Requests from HR
              </h2>
              <p className="text-sm text-blue-700 mt-1">Please upload the following requested documents</p>
            </div>
          </div>
          <div className="space-y-3">
            {requestedDocuments.map((doc) => (
              <div key={doc.id} className="bg-white rounded-xl p-5 shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">{formatDocumentType(doc.type)}</h3>
                        {doc.requestReason && (
                          <div className="mt-2 p-2 bg-amber-50 border-l-2 border-amber-400 rounded">
                            <p className="text-sm text-gray-700">
                              <span className="font-semibold text-amber-800">Reason:</span> {doc.requestReason}
                            </p>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-2 flex items-center">
                          <Clock size={12} className="mr-1" />
                          Requested on {formatDate(doc.requestedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedRequest(doc);
                      setShowUploadModal(true);
                    }}
                    className="flex items-center space-x-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
                  >
                    <Upload size={18} />
                    <span>Upload Now</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Uploaded Documents</h2>
          <p className="text-sm text-gray-500 mt-1">View the status of your submitted documents</p>
        </div>
        
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading documents...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {filterTab === 'requested' ? 'No pending document requests' : 'No documents found'}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {filterTab === 'requested' 
                ? 'HR has not requested any documents from you' 
                : 'Upload your first document using the form above'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Document Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {filterTab === 'requested' ? 'Requested Date' : 'Upload Date'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Remarks
                  </th>
                  {filterTab === 'requested' && (
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Action
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <span className="font-medium text-gray-800">
                            {formatDocumentType(doc.type)}
                          </span>
                          {doc.isHRRequested && doc.status === 'Requested' && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded-full font-semibold">
                              <AlertTriangle size={10} className="mr-1" />
                              HR Request
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700 text-sm">
                      {formatDate(doc.status === 'Requested' ? doc.requestedAt : doc.uploadedAt)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusCell status={doc.status} />
                    </td>
                    <td className="px-6 py-4">
                      {doc.status === 'Requested' && doc.requestReason ? (
                        <div className="flex items-start space-x-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{doc.requestReason}</span>
                        </div>
                      ) : doc.status === 'Rejected' && doc.rejectionReason ? (
                        <div className="flex items-start space-x-2">
                          <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-red-600">{doc.rejectionReason}</span>
                        </div>
                      ) : doc.status === 'Approved' ? (
                        <span className="text-sm text-green-600">Document verified</span>
                      ) : doc.status === 'Pending' ? (
                        <span className="text-sm text-gray-500">Under review</span>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    {filterTab === 'requested' && (
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedRequest(doc);
                            setShowUploadModal(true);
                          }}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <Upload size={14} className="mr-1" />
                          Upload
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal for HR Requests */}
      {showUploadModal && selectedRequest && (
        <UploadRequestModal
          request={selectedRequest}
          onClose={() => {
            setShowUploadModal(false);
            setSelectedRequest(null);
          }}
          onUpload={handleUploadForRequest}
          loading={uploading}
        />
      )}
    </div>
  );
}

// Upload Request Modal Component
function UploadRequestModal({ request, onClose, onUpload, loading }) {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = () => {
    if (!file) {
      alert('Please select a file');
      return;
    }
    onUpload(file);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6 text-white">
          <h2 className="text-2xl font-bold">Upload Requested Document</h2>
          <p className="text-blue-100 text-sm mt-1">Upload the document requested by HR</p>
        </div>

        {/* Modal Body */}
        <div className="p-8 space-y-6">
          {/* Request Details */}
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-blue-700 font-medium">Document Type:</span>
                <span className="font-semibold text-blue-900">{formatDocumentType(request.type)}</span>
              </div>
              {request.requestReason && (
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700 font-medium">Reason:</span>
                  <span className="text-sm text-blue-900">{request.requestReason}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-blue-700 font-medium">Requested on:</span>
                <span className="text-sm text-blue-900">{formatDate(request.requestedAt)}</span>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Document File (PDF, PNG, JPG - Max 10MB)
            </label>
            <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={loading}
              />
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                {file ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-800">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Information Note */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> Make sure the document is clear and legible. 
              Once uploaded, HR will review and verify your document.
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
            disabled={loading || !file}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Upload size={16} />
            <span>{loading ? 'Uploading...' : 'Upload Document'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
