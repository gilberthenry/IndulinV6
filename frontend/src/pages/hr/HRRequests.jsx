import React, { useState, useEffect } from 'react';
import { Send, Plus, Filter, Clock, CheckCircle, XCircle, AlertCircle, FileText, User, CalendarClock, KeyRound, Settings } from 'lucide-react';
import hrRequestService from '../../services/hrRequestService';
import hrService from '../../services/hrService';
import { useToast } from '../../context/ToastContext';

export default function HRRequests() {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState({ status: '', requestType: '' });
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    requestType: '',
    targetEmployeeId: '',
    title: '',
    description: '',
    priority: 'medium',
    requestData: {}
  });

  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetchRequests();
    fetchStats();
    fetchEmployees();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await hrRequestService.getMyRequests(filter);
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
      const data = await hrRequestService.getMyStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await hrService.getEmployees();
      setEmployees(response.data || response);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const requestTypes = [
    { value: 'profile_change', label: 'Profile Change', icon: <User size={18} />, requiresEmployee: true },
    { value: 'contract_adjustment', label: 'Contract Adjustment', icon: <FileText size={18} />, requiresEmployee: true },
    { value: 'leave_configuration', label: 'Leave Configuration', icon: <CalendarClock size={18} />, requiresEmployee: false },
    { value: 'reset_password', label: 'Reset Password', icon: <KeyRound size={18} />, requiresEmployee: true },
    { value: 'system_update', label: 'System Update', icon: <Settings size={18} />, requiresEmployee: false },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.requestType || !formData.title || !formData.description) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    const selectedType = requestTypes.find(t => t.value === formData.requestType);
    if (selectedType?.requiresEmployee && !formData.targetEmployeeId) {
      showToast('Please select a target employee', 'error');
      return;
    }

    try {
      await hrRequestService.createRequest(formData);
      showToast('Request submitted successfully!', 'success');
      setShowModal(false);
      resetForm();
      fetchRequests();
      fetchStats();
    } catch (error) {
      console.error('Error creating request:', error);
      showToast(error.response?.data?.error || 'Failed to create request', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      requestType: '',
      targetEmployeeId: '',
      title: '',
      description: '',
      priority: 'medium',
      requestData: {}
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock size={16} /> },
      in_progress: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <AlertCircle size={16} /> },
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
      urgent: 'bg-red-100 text-red-700',
    };
    return <span className={`px-2 py-1 rounded text-xs font-medium ${colors[priority]}`}>{priority.toUpperCase()}</span>;
  };

  const selectedType = requestTypes.find(t => t.value === formData.requestType);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Configuration Requests</h1>
          <p className="text-gray-600 mt-2">Submit requests for profile changes, contract adjustments, and system configurations</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          New Request
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="text-sm text-gray-600 mb-1">Total</div>
          <div className="text-2xl font-bold text-gray-800">{stats.total || 0}</div>
        </div>
        <div className="bg-yellow-50 rounded-xl shadow-sm border border-yellow-200 p-4">
          <div className="text-sm text-yellow-700 mb-1">Pending</div>
          <div className="text-2xl font-bold text-yellow-800">{stats.pending || 0}</div>
        </div>
        <div className="bg-blue-50 rounded-xl shadow-sm border border-blue-200 p-4">
          <div className="text-sm text-blue-700 mb-1">In Progress</div>
          <div className="text-2xl font-bold text-blue-800">{stats.in_progress || 0}</div>
        </div>
        <div className="bg-green-50 rounded-xl shadow-sm border border-green-200 p-4">
          <div className="text-sm text-green-700 mb-1">Approved</div>
          <div className="text-2xl font-bold text-green-800">{stats.approved || 0}</div>
        </div>
        <div className="bg-red-50 rounded-xl shadow-sm border border-red-200 p-4">
          <div className="text-sm text-red-700 mb-1">Rejected</div>
          <div className="text-2xl font-bold text-red-800">{stats.rejected || 0}</div>
        </div>
        <div className="bg-gray-50 rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-700 mb-1">Completed</div>
          <div className="text-2xl font-bold text-gray-800">{stats.completed || 0}</div>
        </div>
      </div>

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
          <select
            value={filter.requestType}
            onChange={(e) => setFilter({ ...filter, requestType: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Types</option>
            {requestTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Send size={48} className="mx-auto mb-4 text-gray-400" />
            <p>No requests found</p>
            <p className="text-sm mt-2">Submit your first configuration request!</p>
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
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        {requestTypes.find(t => t.value === request.requestType)?.icon}
                        {requestTypes.find(t => t.value === request.requestType)?.label}
                      </span>
                      <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                      {request.AssignedMIS && (
                        <span>Assigned to: {request.AssignedMIS.fullName}</span>
                      )}
                    </div>
                    {request.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700"><strong>Rejection Reason:</strong> {request.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-t-2xl flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Submit Configuration Request</h2>
                <p className="text-purple-100 text-sm">Request will be routed to MIS for review</p>
              </div>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="p-2 hover:bg-white/20 rounded-lg">
                <XCircle size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Request Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Request Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {requestTypes.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, requestType: type.value, targetEmployeeId: '' })}
                      className={`p-4 border-2 rounded-xl text-left transition-all ${
                        formData.requestType === type.value
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {type.icon}
                        <span className="font-semibold">{type.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Employee (conditional) */}
              {selectedType?.requiresEmployee && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Employee <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.targetEmployeeId}
                    onChange={(e) => setFormData({ ...formData, targetEmployeeId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="">Select employee</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.fullName} ({emp.employeeId})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Request Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Brief summary of your request"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide detailed information about your request"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  rows="4"
                  required
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <div className="flex gap-2">
                  {['low', 'medium', 'high', 'urgent'].map(priority => (
                    <button
                      key={priority}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        formData.priority === priority
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
