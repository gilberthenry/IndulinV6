import React, { useState, useEffect } from 'react';
import hrService from '../../services/hrService';
import { Clock, CheckCircle, XCircle, Eye, User, Calendar, MessageSquare, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000';

export default function ProfileRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await hrService.getProfileChangeRequests(null);
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', icon: Clock },
      approved: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: XCircle },
    };
    const config = badges[status] || badges.pending;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        <Icon className="h-4 w-4" />
        <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 bg-gray-50/50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Profile Change Requests</h1>
        <p className="text-gray-600 mt-2">Review and approve employee profile update requests</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex space-x-2 border-b border-gray-200">
        {[
          { value: 'all', label: 'All' },
          { value: 'pending', label: 'Pending' },
          { value: 'approved', label: 'Approved' },
          { value: 'rejected', label: 'Rejected' }
        ].map((tab) => {
          const count = tab.value === 'all' 
            ? requests.length 
            : requests.filter(r => r.status === tab.value).length;
          return (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-6 py-3 font-medium capitalize transition-colors ${
                filter === tab.value
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Requests List */}
      {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader size={48} className="animate-spin text-blue-600" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-12 text-center">
              <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Requests Found</h3>
              <p className="text-gray-500">
                {filter === 'all' 
                  ? 'No profile change requests have been submitted yet.'
                  : `No ${filter} profile requests.`
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        {request.employee?.profileImage ? (
                          <img
                            src={`${API_BASE_URL}${request.employee.profileImage}`}
                            alt={request.employee.fullName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User size={24} className="text-blue-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-800">
                          {request.employee?.fullName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {request.employee?.employeeId} • {request.employee?.email}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-600 mb-2 font-semibold">Reason:</p>
                    <p className="text-gray-800">{request.reason || 'No reason provided'}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        <span>Submitted: {formatDate(request.createdAt)}</span>
                      </div>
                      <div>
                        <span className="font-semibold">{request.changedFields?.length || 0}</span> fields changed
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/hr/profile-requests/${request.id}`)}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-lg transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Review</span>
                    </button>
                  </div>

                  {request.status !== 'pending' && (
                    <div className="mt-4 pt-4 border-t text-sm text-gray-600">
                      <p>
                        {request.status === 'approved' ? 'Approved' : 'Rejected'} by{' '}
                        <span className="font-semibold">{request.reviewer?.fullName || 'HR'}</span> on{' '}
                        {formatDate(request.reviewedAt)}
                      </p>
                      {request.reviewNotes && (
                        <p className="mt-1 text-gray-700">Note: {request.reviewNotes}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
