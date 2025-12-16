import React, { useState, useEffect } from 'react';
import { ListChecks, Clock, CheckCircle, XCircle, AlertTriangle, Filter, User, Calendar } from 'lucide-react';
import hrRequestService from '../../services/hrRequestService';
import misService from '../../services/misService';
import { useToast } from '../../context/ToastContext';

export default function MISConfigRequests() {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(''); // 'assign', 'approve', 'reject'
  const [filter, setFilter] = useState({ status: 'pending' });
  const [misUsers, setMisUsers] = useState([]);
  const { showToast } = useToast();

  const [actionForm, setActionForm] = useState({
    assignedTo: '',
    reviewNotes: '',
    rejectionReason: ''
  });

  useEffect(() => {
    fetchRequests();
    fetchStats();
    fetchMISUsers();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await hrRequestService.getAllRequests(filter);
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      showToast('Failed to load requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await hrRequestService.getQueueStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchMISUsers = async () => {
    try {
      const response = await misService.getAccounts();
      const misAccounts = response.filter(acc => acc.role === 'mis');
      setMisUsers(misAccounts);
    } catch (error) {
      console.error('Error fetching MIS users:', error);
    }
  };

  const handleAction = async (request, action) => {
    setSelectedRequest(request);
    setActionType(action);
    setShowActionModal(true);
    setActionForm({ assignedTo: '', reviewNotes: '', rejectionReason: '' });
  };

  const submitAction = async (e) => {
    e.preventDefault();
    
    try {
      switch (actionType) {
        case 'assign':
          if (!actionForm.assignedTo) {
            showToast('Please select a user to assign', 'error');
            return;
          }
          await hrRequestService.assignRequest(selectedRequest.id, actionForm.assignedTo);
          showToast('Request assigned successfully', 'success');
          break;
        
        case 'approve':
          await hrRequestService.approveRequest(selectedRequest.id, actionForm.reviewNotes);
          showToast('Request approved successfully', 'success');
          break;
        
        case 'reject':
          if (!actionForm.rejectionReason) {
            showToast('Rejection reason is required', 'error');
            return;
          }
          await hrRequestService.rejectRequest(selectedRequest.id, actionForm.rejectionReason);
          showToast('Request rejected', 'success');
          break;
      }
      
      setShowActionModal(false);
      fetchRequests();
      fetchStats();
    } catch (error) {
      console.error('Error performing action:', error);
      showToast(error.response?.data?.error || 'Action failed', 'error');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock size={16} /> },
      in_progress: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <AlertTriangle size={16} /> },
      approved: { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle size={16} /> },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: <XCircle size={16} /> },
      completed: { bg: 'bg-gray-100', text: 'text-gray-800', icon: <CheckCircle size={16} /> },
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.icon}
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-blue-100 text-blue-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700 animate-pulse',
    };
    return <span className={`px-2 py-1 rounded text-xs font-medium ${colors[priority]}`}>{priority.toUpperCase()}</span>;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Configuration Requests</h1>
        <p className="text-gray-600 mt-2">Review and process HR configuration requests</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-4">
          <div className="text-sm opacity-90 mb-1">Total Requests</div>
          <div className="text-3xl font-bold">{stats.total || 0}</div>
        </div>
        <div className="bg-yellow-50 rounded-xl shadow-sm border-2 border-yellow-300 p-4">
          <div className="text-sm text-yellow-700 mb-1">Pending</div>
          <div className="text-3xl font-bold text-yellow-800">{stats.pending || 0}</div>
        </div>
        <div className="bg-blue-50 rounded-xl shadow-sm border-2 border-blue-300 p-4">
          <div className="text-sm text-blue-700 mb-1">In Progress</div>
          <div className="text-3xl font-bold text-blue-800">{stats.in_progress || 0}</div>
        </div>
        <div className="bg-green-50 rounded-xl shadow-sm border-2 border-green-300 p-4">
          <div className="text-sm text-green-700 mb-1">Approved</div>
          <div className="text-3xl font-bold text-green-800">{stats.approved || 0}</div>
        </div>
        <div className="bg-red-50 rounded-xl shadow-sm border-2 border-red-300 p-4">
          <div className="text-sm text-red-700 mb-1">Rejected</div>
          <div className="text-3xl font-bold text-red-800">{stats.rejected || 0}</div>
        </div>
        <div className="bg-gray-50 rounded-xl shadow-sm border-2 border-gray-300 p-4">
          <div className="text-sm text-gray-700 mb-1">Completed</div>
          <div className="text-3xl font-bold text-gray-800">{stats.completed || 0}</div>
        </div>
      </div>

      {/* Request Type Statistics */}
      {stats.byType && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {Object.entries(stats.byType).map(([type, count]) => (
            <div key={type} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="text-xs text-gray-500 uppercase mb-1">{type.replace('_', ' ')}</div>
              <div className="text-2xl font-bold text-gray-800">{count}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex items-center gap-4">
          <Filter size={20} className="text-gray-500" />
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <ListChecks size={48} className="mx-auto mb-4 text-gray-400" />
            <p>No requests found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {requests.map(request => (
              <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">{request.title}</h3>
                      {getStatusBadge(request.status)}
                      {getPriorityBadge(request.priority)}
                    </div>
                    <p className="text-gray-600 mb-3">{request.description}</p>
                    <div className="flex items-center gap-6 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <User size={16} />
                        Requested by: {request.Requester?.fullName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={16} />
                        {new Date(request.createdAt).toLocaleString()}
                      </span>
                      <span className="capitalize">{request.requestType.replace('_', ' ')}</span>
                    </div>
                    {request.AssignedMIS && (
                      <div className="text-sm text-blue-600 mb-2">
                        Assigned to: {request.AssignedMIS.fullName}
                      </div>
                    )}
                    {request.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700"><strong>Rejection Reason:</strong> {request.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    {request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAction(request, 'assign')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                        >
                          Assign
                        </button>
                        <button
                          onClick={() => handleAction(request, 'approve')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(request, 'reject')}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {request.status === 'in_progress' && (
                      <>
                        <button
                          onClick={() => handleAction(request, 'approve')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(request, 'reject')}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Modal */}
      {showActionModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold capitalize">{actionType} Request</h2>
              <p className="text-purple-100 text-sm">{selectedRequest.title}</p>
            </div>

            <form onSubmit={submitAction} className="p-6 space-y-4">
              {actionType === 'assign' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign to MIS User <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={actionForm.assignedTo}
                    onChange={(e) => setActionForm({ ...actionForm, assignedTo: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="">Select MIS user</option>
                    {misUsers.map(user => (
                      <option key={user.id} value={user.id}>{user.fullName}</option>
                    ))}
                  </select>
                </div>
              )}

              {actionType === 'approve' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Review Notes (Optional)</label>
                  <textarea
                    value={actionForm.reviewNotes}
                    onChange={(e) => setActionForm({ ...actionForm, reviewNotes: e.target.value })}
                    placeholder="Add any notes about the approval"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    rows="3"
                  />
                </div>
              )}

              {actionType === 'reject' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={actionForm.rejectionReason}
                    onChange={(e) => setActionForm({ ...actionForm, rejectionReason: e.target.value })}
                    placeholder="Explain why this request is being rejected"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    rows="3"
                    required
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowActionModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 px-6 py-3 text-white rounded-lg ${
                    actionType === 'reject' 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
                  }`}
                >
                  Confirm {actionType.charAt(0).toUpperCase() + actionType.slice(1)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
