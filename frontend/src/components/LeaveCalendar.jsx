import React, { useState, useEffect } from 'react';
import hrService from '../services/hrService';
import LeaveCreditsSummary from './LeaveCreditsSummary';
import { 
  Calendar, 
  List, 
  BarChart3,
  CreditCard,
  ChevronLeft, 
  ChevronRight, 
  Filter,
  X,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Trash2
} from 'lucide-react';

export default function LeaveCalendar() {
  const [view, setView] = useState('calendar'); // 'calendar', 'list', 'summary', 'credits'
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({
    employeeId: '',
    type: '',
    status: ''
  });
  const [loading, setLoading] = useState(false);

  const getCurrentSchoolYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    return month >= 6 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
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

  const leaveStatuses = ['Pending', 'Approved', 'Rejected'];

  const leaveColors = {
    'Sick Leave': 'bg-red-100 text-red-800 border-red-300',
    'Vacation Leave': 'bg-blue-100 text-blue-800 border-blue-300',
    'Emergency Leave': 'bg-orange-100 text-orange-800 border-orange-300',
    'Maternity Leave': 'bg-pink-100 text-pink-800 border-pink-300',
    'Paternity Leave': 'bg-purple-100 text-purple-800 border-purple-300',
    'Bereavement Leave': 'bg-gray-100 text-gray-800 border-gray-300',
    'Study Leave': 'bg-green-100 text-green-800 border-green-300'
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds to check for new leave requests
    const intervalId = setInterval(() => {
      fetchData();
    }, 30000);
    
    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [currentDate, filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leavesData, employeesData] = await Promise.all([
        hrService.getLeaveCalendar(
          currentDate.getMonth() + 1,
          currentDate.getFullYear()
        ),
        hrService.getEmployees()
      ]);
      
      let filteredLeaves = leavesData.leaves || [];
      
      // Apply filters
      if (filters.employeeId) {
        filteredLeaves = filteredLeaves.filter(l => l.employeeId === parseInt(filters.employeeId));
      }
      if (filters.type) {
        filteredLeaves = filteredLeaves.filter(l => l.type === filters.type);
      }
      if (filters.status) {
        filteredLeaves = filteredLeaves.filter(l => l.status === filters.status);
      }
      
      setLeaves(filteredLeaves);
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getLeavesForDate = (date) => {
    return leaves.filter(leave => {
      const leaveStart = new Date(leave.startDate);
      const leaveEnd = new Date(leave.endDate);
      const checkDate = new Date(date);
      
      leaveStart.setHours(0, 0, 0, 0);
      leaveEnd.setHours(23, 59, 59, 999);
      checkDate.setHours(12, 0, 0, 0);
      
      return checkDate >= leaveStart && checkDate <= leaveEnd;
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'Rejected':
        return <XCircle size={16} className="text-red-600" />;
      case 'Pending':
        return <Clock size={16} className="text-yellow-600" />;
      default:
        return null;
    }
  };

  const handleApprove = async (leaveId) => {
    try {
      await hrService.approveLeave(leaveId);
      await fetchData();
    } catch (error) {
      console.error('Error approving leave:', error);
      alert('Failed to approve leave');
    }
  };

  const handleReject = async (leaveId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    
    try {
      await hrService.rejectLeave(leaveId, reason);
      await fetchData();
    } catch (error) {
      console.error('Error rejecting leave:', error);
      alert('Failed to reject leave');
    }
  };

  const handleDelete = async (leaveId) => {
    const confirmed = window.confirm('Are you sure you want to permanently delete this rejected leave request?');
    if (!confirmed) return;
    
    try {
      await hrService.deleteLeave(leaveId);
      await fetchData();
      alert('Leave deleted successfully');
    } catch (error) {
      console.error('Error deleting leave:', error);
      console.error('Error response:', error.response);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to delete leave';
      alert(`Failed to delete leave: ${errorMsg}`);
    }
  };

  const CreateLeaveModal = () => {
    const [formData, setFormData] = useState({
      employeeId: '',
      type: '',
      startDate: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
      endDate: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
      reason: ''
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await hrService.createLeave(formData);
        setShowCreateModal(false);
        setFormData({ employeeId: '', type: '', startDate: '', endDate: '', reason: '' });
        await fetchData();
      } catch (error) {
        console.error('Error creating leave:', error);
        alert('Failed to create leave');
      }
    };

    if (!showCreateModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl md:text-2xl font-bold text-gray-800">Create Leave</h3>
            <button
              onClick={() => setShowCreateModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee
              </label>
              <select
                required
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} ({emp.employeeId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leave Type
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select Type</option>
                {leaveTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason (Optional)
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter reason for leave..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Create Leave
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const CalendarView = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
    const weeks = [];
    let days = [];

    // Empty cells for days before the first day of month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 border border-gray-100"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayLeaves = getLeavesForDate(date);
      const isToday = 
        date.getDate() === new Date().getDate() &&
        date.getMonth() === new Date().getMonth() &&
        date.getFullYear() === new Date().getFullYear();

      days.push(
        <div
          key={day}
          onClick={() => {
            setSelectedDate(date);
            setShowCreateModal(true);
          }}
          className={`min-h-[80px] md:min-h-[100px] p-1 md:p-2 border border-gray-100 hover:bg-purple-50 cursor-pointer transition-colors ${
            isToday ? 'bg-purple-100 ring-2 ring-purple-500' : 'bg-white'
          }`}
        >
          <div className={`text-xs md:text-sm font-semibold mb-1 ${isToday ? 'text-purple-700' : 'text-gray-700'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayLeaves.slice(0, 3).map((leave, idx) => (
              <div
                key={idx}
                className={`text-xs px-1 md:px-2 py-0.5 md:py-1 rounded border ${leaveColors[leave.type] || 'bg-gray-100 text-gray-800'}`}
                title={`${leave.Employee?.fullName} - ${leave.type}`}
              >
                <div className="flex items-center gap-1 truncate">
                  <span className="hidden md:inline">{getStatusIcon(leave.status)}</span>
                  <span className="truncate text-xs">{leave.Employee?.fullName}</span>
                </div>
              </div>
            ))}
            {dayLeaves.length > 3 && (
              <div className="text-xs text-gray-500 px-1 md:px-2">
                +{dayLeaves.length - 3} more
              </div>
            )}
          </div>
        </div>
      );

      if (days.length === 7) {
        weeks.push(
          <div key={weeks.length} className="grid grid-cols-7">
            {days}
          </div>
        );
        days = [];
      }
    }

    // Add remaining days to last week
    if (days.length > 0) {
      while (days.length < 7) {
        days.push(
          <div key={`empty-end-${days.length}`} className="p-2 border border-gray-100"></div>
        );
      }
      weeks.push(
        <div key={weeks.length} className="grid grid-cols-7">
          {days}
        </div>
      );
    }

    return (
      <div className="space-y-2 overflow-x-auto">
        <div className="grid grid-cols-7 bg-gray-50 rounded-lg min-w-[600px]">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 md:p-3 text-center font-semibold text-gray-600 text-xs md:text-sm">
              {day}
            </div>
          ))}
        </div>
        <div className="min-w-[600px]">
          {weeks}
        </div>
      </div>
    );
  };

  const ListView = () => {
    return (
      <div className="space-y-3">
        {leaves.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No leaves found for the selected period
          </div>
        ) : (
          leaves.map((leave) => (
            <div
              key={leave.id}
              className={`bg-white border rounded-xl p-4 hover:shadow-md transition-shadow ${
                leave.status === 'Pending' 
                  ? 'border-yellow-300 bg-yellow-50/30 ring-2 ring-yellow-200' 
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {leave.status === 'Pending' && (
                      <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded uppercase animate-pulse">
                        New
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <span className="font-semibold text-gray-800">
                        {leave.Employee?.fullName}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      ({leave.Employee?.employeeId})
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <span className={`px-3 py-1 rounded-full font-medium ${
                      leaveColors[leave.type] || 'bg-gray-100 text-gray-800'
                    }`}>
                      {leave.type}
                    </span>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(leave.status)}
                      <span className={`font-medium ${
                        leave.status === 'Approved' ? 'text-green-600' :
                        leave.status === 'Rejected' ? 'text-red-600' :
                        'text-yellow-600'
                      }`}>
                        {leave.status}
                      </span>
                    </span>
                  </div>

                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Period:</span>{' '}
                    {new Date(leave.startDate).toLocaleDateString()} -{' '}
                    {new Date(leave.endDate).toLocaleDateString()}
                  </div>

                  {leave.reason && (
                    <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      <span className="font-medium">Reason:</span> {leave.reason}
                    </div>
                  )}
                </div>

                {leave.status === 'Pending' && (
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleApprove(leave.id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Approve"
                    >
                      <CheckCircle size={20} />
                    </button>
                    <button
                      onClick={() => handleReject(leave.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Reject"
                    >
                      <XCircle size={20} />
                    </button>
                  </div>
                )}
                
                {leave.status === 'Rejected' && (
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleDelete(leave.id)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const SummaryView = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get employees on leave today
    const onLeaveToday = leaves.filter(leave => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return today >= start && today <= end && leave.status === 'Approved';
    });

    // Count by leave type
    const leaveTypeCounts = {};
    leaves.forEach(leave => {
      leaveTypeCounts[leave.type] = (leaveTypeCounts[leave.type] || 0) + 1;
    });

    // Count by status
    const statusCounts = {
      Pending: leaves.filter(l => l.status === 'Pending').length,
      Approved: leaves.filter(l => l.status === 'Approved').length,
      Rejected: leaves.filter(l => l.status === 'Rejected').length
    };

    return (
      <div className="space-y-4 md:space-y-6">
        {/* Employees on Leave Today */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-4 md:p-6 shadow-lg">
          <h3 className="text-base md:text-lg font-bold mb-4 flex items-center gap-2">
            <Calendar size={20} />
            Employees on Leave Today
          </h3>
          {onLeaveToday.length === 0 ? (
            <p className="text-purple-100 text-sm md:text-base">No employees on leave today</p>
          ) : (
            <div className="space-y-2">
              {onLeaveToday.map(leave => (
                <div key={leave.id} className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                  <div className="font-semibold text-sm md:text-base">{leave.Employee?.fullName}</div>
                  <div className="text-xs md:text-sm text-purple-100">
                    {leave.type} • Until {new Date(leave.endDate).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="text-2xl md:text-3xl font-bold text-yellow-600">{statusCounts.Pending}</div>
            <div className="text-xs md:text-sm text-yellow-700 font-medium">Pending Requests</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="text-2xl md:text-3xl font-bold text-green-600">{statusCounts.Approved}</div>
            <div className="text-xs md:text-sm text-green-700 font-medium">Approved Leaves</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="text-2xl md:text-3xl font-bold text-red-600">{statusCounts.Rejected}</div>
            <div className="text-xs md:text-sm text-red-700 font-medium">Rejected Requests</div>
          </div>
        </div>

        {/* Leave Type Breakdown */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6">
          <h3 className="text-base md:text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 size={20} />
            Leave Type Distribution
          </h3>
          <div className="space-y-3">
            {Object.entries(leaveTypeCounts).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  leaveColors[type] || 'bg-gray-100 text-gray-800'
                }`}>
                  {type}
                </span>
                <span className="text-2xl font-bold text-gray-700">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
        {/* Pending Requests Alert */}
        {leaves.filter(l => l.status === 'Pending').length > 0 && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 md:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-shrink-0">
              <Clock size={24} className="text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-yellow-800">
                {leaves.filter(l => l.status === 'Pending').length} Pending Leave Request{leaves.filter(l => l.status === 'Pending').length > 1 ? 's' : ''}
              </p>
              <p className="text-sm text-yellow-700">
                Review and approve/reject employee leave requests
              </p>
            </div>
            <button
              onClick={() => setView('list')}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium whitespace-nowrap"
            >
              Review Now
            </button>
          </div>
        )}
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* View Toggles */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setView('calendar')}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg font-medium transition-all text-sm md:text-base ${
                view === 'calendar'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Calendar size={18} />
              <span className="hidden sm:inline">Calendar</span>
            </button>
            <button
              onClick={() => setView('list')}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg font-medium transition-all relative text-sm md:text-base ${
                view === 'list'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <List size={18} />
              <span className="hidden sm:inline">List</span>
              {leaves.filter(l => l.status === 'Pending').length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {leaves.filter(l => l.status === 'Pending').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setView('summary')}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg font-medium transition-all text-sm md:text-base ${
                view === 'summary'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <BarChart3 size={18} />
              <span className="hidden sm:inline">Summary</span>
            </button>
            <button
              onClick={() => setView('credits')}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg font-medium transition-all text-sm md:text-base ${
                view === 'credits'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <CreditCard size={18} />
              <span className="hidden sm:inline">Credits</span>
            </button>
          </div>

          {/* Month Navigation & Create Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={previousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="font-semibold text-gray-800 min-w-[150px] text-center text-sm md:text-base">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <button
              onClick={() => {
                setSelectedDate(new Date());
                setShowCreateModal(true);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md text-sm md:text-base whitespace-nowrap"
            >
              <Plus size={18} />
              Create Leave
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter size={14} className="inline mr-1" />
              Employee
            </label>
            <select
              value={filters.employeeId}
              onChange={(e) => setFilters({ ...filters, employeeId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Employees</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter size={14} className="inline mr-1" />
              Leave Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              {leaveTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter size={14} className="inline mr-1" />
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              {leaveStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading...</p>
          </div>
        ) : (
          <>
            {view === 'calendar' && <CalendarView />}
            {view === 'list' && <ListView />}
            {view === 'summary' && <SummaryView />}
            {view === 'credits' && <LeaveCreditsSummary schoolYear={getCurrentSchoolYear()} />}
          </>
        )}
      </div>

      {/* Create Leave Modal */}
      <CreateLeaveModal />
    </div>
  );
}
