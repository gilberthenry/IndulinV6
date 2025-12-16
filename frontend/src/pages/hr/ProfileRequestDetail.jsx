import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import hrService from '../../services/hrService';
import { ArrowLeft, CheckCircle, XCircle, User, Loader, Calendar } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000';

export default function ProfileRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    try {
      setLoading(true);
      const data = await hrService.getProfileChangeRequestById(id);
      setRequest(data);
    } catch (error) {
      console.error('Error fetching request:', error);
      setError('Failed to load request details');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setProcessing(true);
      await hrService.approveProfileChange(id, reviewNotes);
      navigate('/hr/profile-requests');
    } catch (error) {
      console.error('Error approving request:', error);
      setError('Failed to approve request');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!reviewNotes.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }
    try {
      setProcessing(true);
      await hrService.rejectProfileChange(id, reviewNotes);
      navigate('/hr/profile-requests');
    } catch (error) {
      console.error('Error rejecting request:', error);
      setError('Failed to reject request');
    } finally {
      setProcessing(false);
    }
  };

  const renderFieldComparison = (field, label) => {
    if (!request.changedFields?.includes(field)) return null;

    const currentValue = request.currentValues?.[field];
    const newValue = request.requestedChanges?.[field];

    // Handle arrays and objects
    const formatValue = (value) => {
      if (value === null || value === undefined) return 'Not set';
      if (Array.isArray(value)) return `${value.length} items`;
      if (typeof value === 'object') return JSON.stringify(value, null, 2);
      if (typeof value === 'boolean') return value ? 'Yes' : 'No';
      return String(value);
    };

    return (
      <div className="bg-gray-50 rounded-lg p-4 mb-3">
        <p className="text-sm font-semibold text-gray-700 mb-3">{label}</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Current Value</p>
            <p className="text-gray-800 font-medium bg-red-50 p-2 rounded border border-red-200">
              {formatValue(currentValue)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Requested Value</p>
            <p className="text-gray-800 font-medium bg-green-50 p-2 rounded border border-green-200">
              {formatValue(newValue)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size={48} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-8">
        <p className="text-red-600">Request not found</p>
        <button onClick={() => navigate('/hr/profile-requests')} className="mt-4 text-blue-600">
          Back to Requests
        </button>
      </div>
    );
  }

  const isPending = request.status === 'pending';

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate('/hr/profile-requests')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft size={20} />
          Back to Requests
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg border">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  {request.employee?.profileImage ? (
                    <img
                      src={`${API_BASE_URL}${request.employee.profileImage}`}
                      alt={request.employee.fullName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User size={32} className="text-blue-600" />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{request.employee?.fullName}</h1>
                  <p className="text-gray-600">{request.employee?.employeeId} • {request.employee?.email}</p>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                    <Calendar size={16} />
                    <span>Submitted: {new Date(request.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                request.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                request.status === 'approved' ? 'bg-green-100 text-green-700' :
                'bg-red-100 text-red-700'
              }`}>
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Reason */}
          <div className="p-6 bg-blue-50 border-b">
            <p className="text-sm font-semibold text-gray-700 mb-2">Employee's Reason:</p>
            <p className="text-gray-800">{request.reason || 'No reason provided'}</p>
          </div>

          {/* Changes */}
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Requested Changes ({request.changedFields?.length || 0} fields)
            </h2>
            <div className="space-y-2">
              {renderFieldComparison('fullName', 'Full Name')}
              {renderFieldComparison('surname', 'Surname')}
              {renderFieldComparison('firstName', 'First Name')}
              {renderFieldComparison('middleName', 'Middle Name')}
              {renderFieldComparison('email', 'Email')}
              {renderFieldComparison('contactNumber', 'Contact Number')}
              {renderFieldComparison('dateOfBirth', 'Date of Birth')}
              {renderFieldComparison('placeOfBirth', 'Place of Birth')}
              {renderFieldComparison('sex', 'Sex')}
              {renderFieldComparison('civilStatus', 'Civil Status')}
              {renderFieldComparison('citizenship', 'Citizenship')}
              {renderFieldComparison('age', 'Age')}
              {renderFieldComparison('religion', 'Religion')}
              {renderFieldComparison('bloodType', 'Blood Type')}
              {renderFieldComparison('residentialAddress', 'Residential Address')}
              {renderFieldComparison('permanentAddress', 'Permanent Address')}
              {renderFieldComparison('emergencyContactName', 'Emergency Contact Name')}
              {renderFieldComparison('emergencyContactNumber', 'Emergency Contact Number')}
              {renderFieldComparison('spouseName', 'Spouse Name')}
              {renderFieldComparison('fatherName', 'Father Name')}
              {renderFieldComparison('motherName', 'Mother Name')}
              {renderFieldComparison('children', 'Children')}
              {renderFieldComparison('education', 'Education')}
              {renderFieldComparison('workExperience', 'Work Experience')}
            </div>
          </div>

          {/* Review Section */}
          {isPending && (
            <div className="p-6 bg-gray-50 border-t">
              <h3 className="font-semibold text-gray-800 mb-3">HR Review</h3>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add notes (optional for approval, required for rejection)..."
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows="3"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleApprove}
                  disabled={processing}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {processing ? <Loader size={20} className="animate-spin" /> : <CheckCircle size={20} />}
                  Approve Changes
                </button>
                <button
                  onClick={handleReject}
                  disabled={processing}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {processing ? <Loader size={20} className="animate-spin" /> : <XCircle size={20} />}
                  Reject Request
                </button>
              </div>
            </div>
          )}

          {!isPending && (
            <div className="p-6 bg-gray-50 border-t">
              <p className="text-sm text-gray-600">
                {request.status === 'approved' ? 'Approved' : 'Rejected'} by{' '}
                <span className="font-semibold">{request.reviewer?.fullName}</span> on{' '}
                {new Date(request.reviewedAt).toLocaleString()}
              </p>
              {request.reviewNotes && (
                <div className="mt-3 bg-white p-3 rounded border">
                  <p className="text-sm font-semibold text-gray-700">Review Notes:</p>
                  <p className="text-gray-800 mt-1">{request.reviewNotes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
