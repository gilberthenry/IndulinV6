import React, { useState, useEffect } from 'react';
import hrService from '../../services/hrService';
import DataTable from '../../components/DataTable';
import { 
  FileText, 
  CalendarDays, 
  FolderOpen, 
  Users, 
  UserPlus, 
  BarChart3, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Building2,
  Award
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

export default function HRDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const dashboardStats = await hrService.getDashboardStats();
      console.log('Dashboard stats received:', dashboardStats);
      setStats(dashboardStats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-500">Failed to load dashboard data</div>
      </div>
    );
  }

  const StatCard = ({ title, value, subtext, icon, gradient, trend }) => (
    <div className={`rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-300 ${gradient}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium opacity-90 mb-1">{title}</p>
          <h3 className="text-3xl font-bold mb-2">{value}</h3>
          <p className="text-xs opacity-75 bg-white/20 inline-block px-2 py-1 rounded-lg">{subtext}</p>
          {trend && (
            <div className="flex items-center mt-2 text-xs">
              <TrendingUp size={14} className="mr-1" />
              <span>{trend}</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
          {icon}
        </div>
      </div>
    </div>
  );

  // Chart colors
  const COLORS = ['#8b5cf6', '#3b82f6', '#ec4899', '#6366f1', '#06b6d4'];

  const ContractTypeChart = ({ data }) => {
    if (!data || data.length === 0) return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        No contract data available
      </div>
    );
    
    const chartData = data.map((item) => ({
      name: item.contractType.charAt(0).toUpperCase() + item.contractType.slice(1),
      value: parseInt(item.count)
    }));
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const LeaveStatusChart = ({ data }) => {
    const chartData = [
      { name: 'Pending', value: data.pending, color: '#3b82f6' },
      { name: 'Approved', value: data.approved, color: '#10b981' },
      { name: 'Rejected', value: data.rejected, color: '#ef4444' }
    ];

    return (
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const DepartmentChart = ({ data }) => {
    if (!data || data.length === 0) return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        No department data available
      </div>
    );

    const chartData = data.slice(0, 5).map((dept) => ({
      name: dept.department || 'Unassigned',
      employees: parseInt(dept.count)
    }));

    return (
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" width={100} />
          <Tooltip />
          <Bar dataKey="employees" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const ActivityItem = ({ icon, title, subtitle, time, status }) => (
    <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className={`p-2 rounded-lg ${
        status === 'success' ? 'bg-green-100 text-green-600' :
        status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
        status === 'pending' ? 'bg-blue-100 text-blue-600' :
        'bg-gray-100 text-gray-600'
      }`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
        <p className="text-xs text-gray-500 truncate">{subtitle}</p>
        <p className="text-xs text-gray-400 mt-1">{time}</p>
      </div>
    </div>
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              Human Resources Overview
              <span className="ml-3 text-sm font-normal px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                Live
              </span>
            </h1>
            <p className="text-gray-600 mt-2">Good to see you again. Everything you need is right here.</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={fetchData}
              disabled={refreshing}
              className={`flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <TrendingUp size={18} className={refreshing ? 'animate-spin' : ''} />
              <span className="font-medium text-sm">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            <div className="hidden lg:block text-right">
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="text-lg font-semibold text-gray-900">{new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-6">
        <StatCard 
          title="Total Employees" 
          value={stats.employees.total} 
          subtext={`${stats.employees.active} Active • ${stats.employees.suspended} Suspended`}
          trend={`+${stats.employees.newThisMonth} this month`}
          icon={<Users size={24} />}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard 
          title="Active Contracts" 
          value={stats.contracts.active} 
          subtext={`${stats.contracts.expiring} expiring soon`}
          icon={<FileText size={24} />}
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <StatCard 
          title="Leave Requests" 
          value={stats.leaves.pending} 
          subtext={`${stats.leaves.total} total • ${stats.leaves.thisMonth} this month`}
          icon={<CalendarDays size={24} />}
          gradient="bg-gradient-to-br from-pink-500 to-pink-600"
        />
        <StatCard 
          title="Pending Actions" 
          value={stats.documents.pending + stats.certificates.pending} 
          subtext={`${stats.documents.pending} docs • ${stats.certificates.pending} certs`}
          icon={<AlertCircle size={24} />}
          gradient="bg-gradient-to-br from-orange-500 to-orange-600"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-6">
        {/* Left Column - Charts (60% width) */}
        <div className="xl:col-span-7 space-y-6">
          {/* Contract Distribution Chart */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Contract Distribution</h2>
                <p className="text-sm text-gray-500 mt-1">Active contracts breakdown by type</p>
              </div>
              <div className="px-4 py-2 bg-purple-50 rounded-lg">
                <span className="text-2xl font-bold text-purple-600">{stats.contracts.total}</span>
                <p className="text-xs text-gray-600">Total</p>
              </div>
            </div>
            <ContractTypeChart data={stats.contracts.byType} />
          </div>

          {/* Leave Status Chart */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">Leave Status Overview</h2>
              <p className="text-sm text-gray-500 mt-1">Current leave requests status</p>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <Clock size={20} className="mx-auto text-blue-600 mb-1" />
                <p className="text-2xl font-bold text-gray-900">{stats.leaves.pending}</p>
                <p className="text-xs text-gray-600 mt-1">Pending</p>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                <CheckCircle size={20} className="mx-auto text-green-600 mb-1" />
                <p className="text-2xl font-bold text-gray-900">{stats.leaves.approved}</p>
                <p className="text-xs text-gray-600 mt-1">Approved</p>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200">
                <AlertCircle size={20} className="mx-auto text-red-600 mb-1" />
                <p className="text-2xl font-bold text-gray-900">{stats.leaves.rejected}</p>
                <p className="text-xs text-gray-600 mt-1">Rejected</p>
              </div>
            </div>
            <LeaveStatusChart data={stats.leaves} />
          </div>
        </div>

        {/* Middle Column - Department & System Stats (40% width) */}
        <div className="xl:col-span-5 space-y-6">
          {/* Department Distribution */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Department Distribution</h2>
                <p className="text-sm text-gray-500 mt-1">Top departments by employee count</p>
              </div>
              <Building2 size={24} className="text-gray-400" />
            </div>
            <DepartmentChart data={stats.departments.byDepartment} />
          </div>

          {/* System Quick Stats */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <BarChart3 size={24} className="mr-2" />
              System Overview
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white/10 backdrop-blur rounded-lg">
                <div className="flex items-center">
                  <Building2 size={18} className="mr-2" />
                  <span className="text-sm font-medium">Departments</span>
                </div>
                <span className="font-bold text-lg">{stats.departments.total}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/10 backdrop-blur rounded-lg">
                <div className="flex items-center">
                  <FolderOpen size={18} className="mr-2" />
                  <span className="text-sm font-medium">Documents</span>
                </div>
                <span className="font-bold text-lg">{stats.documents.verified}/{stats.documents.total}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/10 backdrop-blur rounded-lg">
                <div className="flex items-center">
                  <Award size={18} className="mr-2" />
                  <span className="text-sm font-medium">Certificates</span>
                </div>
                <span className="font-bold text-lg">{stats.certificates.total}</span>
              </div>
            </div>
          </div>

          {/* Expiring Contracts Alert */}
          {stats.recentActivities.expiringContracts.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border-l-4 border-orange-500 p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-orange-100 rounded-lg mr-3">
                  <AlertCircle size={20} className="text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Contracts Expiring Soon</h3>
                  <p className="text-sm text-gray-500">Within next 30 days</p>
                </div>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {stats.recentActivities.expiringContracts.slice(0, 5).map((contract) => (
                  <ActivityItem
                    key={contract.id}
                    icon={<FileText size={16} />}
                    title={contract.Employee?.fullName || 'Unknown'}
                    subtitle={`${contract.contractType} • ${contract.position}`}
                    time={`Expires: ${new Date(contract.endDate).toLocaleDateString()}`}
                    status="warning"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activities Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Employees */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <UserPlus size={20} className="text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Recent Employees</h3>
                <p className="text-sm text-gray-500">Latest additions to the team</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">{stats.recentActivities.employees.length} total</span>
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {stats.recentActivities.employees.slice(0, 5).map((employee) => (
              <ActivityItem
                key={employee.id}
                icon={<Users size={16} />}
                title={employee.fullName}
                subtitle={employee.email}
                time={formatDate(employee.createdAt)}
                status="success"
              />
            ))}
          </div>
        </div>

        {/* Recent Leave Requests */}
        {stats.recentActivities.leaveRequests.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <CalendarDays size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Latest Leave Requests</h3>
                  <p className="text-sm text-gray-500">Pending and recent approvals</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">{stats.recentActivities.leaveRequests.length} total</span>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {stats.recentActivities.leaveRequests.slice(0, 5).map((leave) => (
                <ActivityItem
                  key={leave.id}
                  icon={<CalendarDays size={16} />}
                  title={leave.Employee?.fullName || 'Unknown'}
                  subtitle={`${leave.leaveType} • ${leave.days} day(s)`}
                  time={formatDate(leave.createdAt)}
                  status={leave.status === 'Pending' ? 'pending' : 'success'}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button className="group p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-400 hover:shadow-xl transition-all text-left relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <div className="p-3 bg-purple-100 rounded-lg w-fit mb-3 group-hover:scale-110 transition-transform">
              <UserPlus size={24} className="text-purple-600" />
            </div>
            <h4 className="font-bold text-gray-900 text-lg mb-1">Add Employee</h4>
            <p className="text-sm text-gray-600">Create new employee profile</p>
          </div>
        </button>
        
        <button className="group p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-xl transition-all text-left relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <div className="p-3 bg-blue-100 rounded-lg w-fit mb-3 group-hover:scale-110 transition-transform">
              <FileText size={24} className="text-blue-600" />
            </div>
            <h4 className="font-bold text-gray-900 text-lg mb-1">New Contract</h4>
            <p className="text-sm text-gray-600">Generate employment contract</p>
          </div>
        </button>
        
        <button className="group p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-indigo-400 hover:shadow-xl transition-all text-left relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <div className="p-3 bg-indigo-100 rounded-lg w-fit mb-3 group-hover:scale-110 transition-transform">
              <BarChart3 size={24} className="text-indigo-600" />
            </div>
            <h4 className="font-bold text-gray-900 text-lg mb-1">Generate Report</h4>
            <p className="text-sm text-gray-600">Create HR analytics report</p>
          </div>
        </button>
        
        <button className="group p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-pink-400 hover:shadow-xl transition-all text-left relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <div className="p-3 bg-pink-100 rounded-lg w-fit mb-3 group-hover:scale-110 transition-transform">
              <CalendarDays size={24} className="text-pink-600" />
            </div>
            <h4 className="font-bold text-gray-900 text-lg mb-1">Leave Calendar</h4>
            <p className="text-sm text-gray-600">View leave schedule</p>
          </div>
        </button>
      </div>
    </div>
  );
}