import React, { useState, useEffect } from 'react';
import LeaveCalendar from '../../components/LeaveCalendar';
import hrService from '../../services/hrService';
import { RefreshCw, UserCheck, Calendar, Search } from 'lucide-react';

export default function HRLeave() {
  const [schoolYear, setSchoolYear] = useState('');
  const [showEmployeeCredits, setShowEmployeeCredits] = useState(false);
  const [employeeCredits, setEmployeeCredits] = useState([]);
  const [loadingCredits, setLoadingCredits] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const getCurrentSchoolYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    return month >= 6 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  };

  useEffect(() => {
    if (showEmployeeCredits) {
      fetchEmployeeCredits();
    }
  }, [showEmployeeCredits]);

  const fetchEmployeeCredits = async () => {
    setLoadingCredits(true);
    try {
      const response = await hrService.getLeaveCredits(getCurrentSchoolYear());
      setEmployeeCredits(response || []);
    } catch (error) {
      console.error('Error fetching employee credits:', error);
      alert('Failed to load employee leave credits');
    } finally {
      setLoadingCredits(false);
    }
  };

  const handleResetCredits = async () => {
    const sy = schoolYear || prompt('Enter school year (e.g., 2024-2025):', getCurrentSchoolYear());
    
    if (!sy) return;
    
    if (!confirm(`Are you sure you want to reset all employee leave credits for school year ${sy}? This will:\n\n- Allocate new leave credits based on employment type\n- Carry over unused leaves (max 5 days)\n- Mark excess leaves as monetizable\n- Forfeit leaves exceeding the limit\n\nThis action cannot be undone.`)) {
      return;
    }
    
    try {
      const result = await hrService.resetLeaveCredits(sy);
      alert(`Leave credits reset successfully!\n\nSchool Year: ${result.schoolYear}\nEmployees Processed: ${result.employeesProcessed}\n\nCheck the console for details.`);
      console.log('Reset Details:', result.details);
    } catch (error) {
      console.error('Error resetting leave credits:', error);
      alert('Failed to reset leave credits: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleSaveSettings = async () => {
    try {
      // This would be for updating the default credit allocations
      alert('Settings saved successfully!\n\nNote: Credit allocations are:\n- Permanent: 15 days\n- Contractual: 10 days\n- Job Order: 5 days\n- Part-Time: 7 days');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    }
  };

  const filteredCredits = employeeCredits.filter(credit => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return credit.Employee?.fullName?.toLowerCase().includes(query) ||
           credit.Employee?.employeeId?.toLowerCase().includes(query);
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Leave Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content: Calendar View */}
        <div className="lg:col-span-3">
          <LeaveCalendar />
        </div>

        {/* Side Content: Settings */}
        <div className="space-y-6">
          {/* School Year Display */}
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center mb-2">
              <Calendar size={20} className="mr-2" />
              <h3 className="text-lg font-semibold">Current School Year</h3>
            </div>
            <p className="text-3xl font-bold">{getCurrentSchoolYear()}</p>
            <p className="text-sm opacity-90 mt-2">Active Period</p>
          </div>

          {/* Reset Credits */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-4">
              <RefreshCw size={20} className="text-purple-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-700">Reset Credits</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Reset all employee leave credits for the new school year. Unused credits will be carried over (max 5 days).
            </p>
            <button 
              onClick={handleResetCredits}
              className="w-full inline-flex justify-center items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
            >
              Reset Credits Now
            </button>
          </div>

          {/* Auto Credits by Employment Type */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-4">
              <UserCheck size={20} className="text-purple-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-700">Automatic Credits</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Permanent</span>
                <span className="font-bold text-gray-800">15 days</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Contractual</span>
                <span className="font-bold text-gray-800">10 days</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Job Order</span>
                <span className="font-bold text-gray-800">5 days</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Part-Time</span>
                <span className="font-bold text-gray-800">7 days</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4 italic">
              Credits are automatically allocated based on employment type from contracts.
            </p>
          </div>

          {/* Employee Credits */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-4">
              <UserCheck size={20} className="text-purple-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-700">Employee Credits</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              View remaining leave credits for all employees in the current school year.
            </p>
            <button 
              onClick={() => setShowEmployeeCredits(!showEmployeeCredits)}
              className="w-full inline-flex justify-center items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg text-sm"
            >
              <UserCheck size={16} className="mr-2" />
              {showEmployeeCredits ? 'Hide Credits' : 'View Credits'}
            </button>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">Leave Features</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center pb-2 border-b border-white/20">
                <span className="opacity-90">Leave Types</span>
                <span className="font-bold">7</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-white/20">
                <span className="opacity-90">Max Carryover</span>
                <span className="font-bold">5 days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-90">Calendar View</span>
                <span className="text-xs bg-white/20 px-2 py-1 rounded">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Credits Panel */}
      {showEmployeeCredits && (
        <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl shadow-lg p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
            <div className="flex items-center">
              <UserCheck size={20} className="text-blue-600 mr-3" />
              <h2 className="text-lg md:text-xl font-bold text-gray-800">Employee Leave Credits - {getCurrentSchoolYear()}</h2>
            </div>
            <button
              onClick={() => setShowEmployeeCredits(false)}
              className="text-gray-500 hover:text-gray-700 self-end sm:self-auto"
            >
              ✕
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or employee ID..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Credits Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loadingCredits ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-gray-500 mt-4">Loading employee credits...</p>
              </div>
            ) : filteredCredits.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 text-lg">No employee credits found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total Credits</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Used</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Carried Over</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCredits.map((credit) => {
                      const remaining = parseFloat(credit.totalCredits || 0) + parseFloat(credit.carriedOverCredits || 0) - parseFloat(credit.usedCredits || 0);
                      const isLow = remaining < 3;
                      
                      return (
                        <tr key={credit.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {credit.Employee?.employeeId || 'N/A'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                            {credit.Employee?.fullName || 'Unknown'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              credit.employmentType === 'permanent' ? 'bg-green-100 text-green-800' :
                              credit.employmentType === 'contractual' ? 'bg-blue-100 text-blue-800' :
                              credit.employmentType === 'job-order' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {credit.employmentType}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-700">
                            {parseFloat(credit.totalCredits || 0).toFixed(1)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-red-600 font-medium">
                            {parseFloat(credit.usedCredits || 0).toFixed(1)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-blue-600">
                            {parseFloat(credit.carriedOverCredits || 0).toFixed(1)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                            <span className={`font-bold ${isLow ? 'text-red-600' : 'text-green-600'}`}>
                              {remaining.toFixed(1)}
                            </span>
                            {isLow && (
                              <span className="ml-1 text-xs text-red-500">(Low)</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p><strong>Total Employees:</strong> {filteredCredits.length}</p>
            <p className="mt-1 text-xs text-gray-500">* Credits are calculated as: Total + Carried Over - Used</p>
          </div>
        </div>
      )}
    </div>
  );
}
