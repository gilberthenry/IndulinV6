import React, { useState, useEffect } from 'react';
import employeeService from '../../services/employeeService';
import { Calendar, Clock, CheckCircle, XCircle, Plus, AlertCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function EmployeeLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [leaveCredits, setLeaveCredits] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newLeave, setNewLeave] = useState({ 
    type: 'Sick Leave', 
    startDate: '', 
    endDate: '', 
    reason: '' 
  });
  const { showToast } = useToast();

  useEffect(() => {
    fetchLeaves();
    fetchLeaveCredits();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getLeaves();
      setLeaves(data);
    } catch (error) {
      console.error('Error fetching leaves:', error);
      showToast('Failed to load leaves', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveCredits = async () => {
    try {
      const data = await employeeService.getLeaveCredits();
      console.log('Leave credits data:', data);
      setLeaveCredits(data);
    } catch (error) {
      console.error('Error fetching leave credits:', error);
      console.error('Error details:', error.response?.data || error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newLeave.type || !newLeave.startDate || !newLeave.endDate) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      setLoading(true);
      await employeeService.requestLeave(newLeave);
      showToast('Leave request submitted successfully!', 'success');
      setShowForm(false);
      setNewLeave({ type: 'Sick Leave', startDate: '', endDate: '', reason: '' });
      await fetchLeaves();
    } catch (error) {
      console.error('Error requesting leave:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit leave request';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const leaveTypes = [
    'Sick Leave',
    'Vacation Leave',
    'Emergency Leave',
    'Maternity Leave',
    'Paternity Leave',
    'Bereavement Leave',
    'Study Leave'
  ];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const StatusCell = ({ status }) => {
    const statusConfig = {
      'Pending': { text: 'Pending', icon: <Clock size={14} />, className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
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

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Leaves</h1>
        <p className="text-gray-600 mt-2">Track and manage your leave requests</p>
      </div>

      {/* Leave Credits Summary */}
      {leaveCredits && leaveCredits.schoolYear && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-blue-100 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Calendar className="h-6 w-6 mr-2 text-blue-600" />
            Leave Credits Summary
            <span className="ml-3 text-sm font-normal text-gray-600">
              (School Year: {leaveCredits.schoolYear})
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-blue-100">
              <div className="text-sm text-gray-600 mb-1">Total Credits</div>
              <div className="text-2xl font-bold text-blue-600">
                {leaveCredits.totalCredits || 0}
              </div>
              <div className="text-xs text-gray-500 mt-1">days allocated</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-orange-100">
              <div className="text-sm text-gray-600 mb-1">Used Credits</div>
              <div className="text-2xl font-bold text-orange-600">
                {leaveCredits.usedCredits || 0}
              </div>
              <div className="text-xs text-gray-500 mt-1">days taken</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-green-100">
              <div className="text-sm text-gray-600 mb-1">Remaining Credits</div>
              <div className="text-2xl font-bold text-green-600">
                {leaveCredits.remainingCredits || 0}
              </div>
              <div className="text-xs text-gray-500 mt-1">days available</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-purple-100">
              <div className="text-sm text-gray-600 mb-1">Carried Over</div>
              <div className="text-2xl font-bold text-purple-600">
                {leaveCredits.carriedOverCredits || 0}
              </div>
              <div className="text-xs text-gray-500 mt-1">from previous year</div>
            </div>
          </div>
        </div>
      )}

      {/* Leave Application Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <Calendar className="h-6 w-6 mr-2 text-blue-600" />
            Apply for Leave
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Leave Type *
                </label>
                <select 
                  required
                  value={newLeave.type}
                  onChange={e => setNewLeave({...newLeave, type: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  disabled={loading}
                >
                  {leaveTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Start Date *
                </label>
                <input 
                  required
                  type="date"
                  value={newLeave.startDate}
                  onChange={e => setNewLeave({...newLeave, startDate: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  End Date *
                </label>
                <input 
                  required
                  type="date"
                  value={newLeave.endDate}
                  onChange={e => setNewLeave({...newLeave, endDate: e.target.value})}
                  min={newLeave.startDate}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Reason for Leave
                </label>
                <textarea
                  value={newLeave.reason}
                  onChange={e => setNewLeave({...newLeave, reason: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                  rows="3"
                  placeholder="Brief explanation for your leave request..."
                  disabled={loading}
                ></textarea>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setShowForm(false)} 
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 px-6 rounded-xl font-medium flex items-center justify-center transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Plus size={18} className="mr-2" />
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Apply for Leave Button (when form is hidden) */}
      {!showForm && (
        <div className="mb-8">
          <button 
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Apply for Leave
          </button>
        </div>
      )}

      {/* Leaves Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Leave History</h2>
          <p className="text-sm text-gray-500 mt-1">View the status of your leave requests</p>
        </div>
        
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading leaves...</p>
          </div>
        ) : leaves.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No leave requests yet</p>
            <p className="text-gray-400 text-sm mt-2">Apply for your first leave using the button above</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Leave Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    REASONS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="font-medium text-gray-800">
                          {leave.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700 text-sm">
                      {formatDate(leave.startDate)}
                    </td>
                    <td className="px-6 py-4 text-gray-700 text-sm">
                      {formatDate(leave.endDate)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusCell status={leave.status} />
                    </td>
                    <td className="px-6 py-4">
                      {leave.status === 'Rejected' && leave.rejectionReason ? (
                        <div className="flex items-start space-x-2">
                          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-red-600">{leave.rejectionReason}</span>
                        </div>
                      ) : leave.status === 'Approved' ? (
                        <span className="text-sm text-green-600">
                          {leave.reason || 'Leave approved'}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">
                          {leave.reason || 'Pending review'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
