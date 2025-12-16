import React, { useState, useEffect } from 'react';
import hrService from '../../../services/hrService';
import EmployeeProfileModal from '../../../components/hr/EmployeeProfileModal';

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    byDepartment: {},
    byDesignation: {}
  });

  // Add print styles
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        @page {
          size: landscape;
          margin: 0.75in 0.5in;
        }
        
        aside, nav, .sidebar, [role="navigation"], 
        header[class*="fixed"], .no-print {
          display: none !important;
        }
        
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        body {
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
          color: #000 !important;
          font-family: Arial, sans-serif !important;
        }
        
        .print-container {
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
        }
        
        .bg-gray-50, .bg-blue-50, .bg-green-50, 
        .bg-yellow-50, .bg-red-50, .bg-purple-50, .bg-gray-100,
        .bg-gradient-to-br {
          background: white !important;
          background-image: none !important;
        }
        
        h1 {
          font-size: 22pt !important;
          font-weight: bold !important;
          margin: 0 0 0.05in 0 !important;
          color: #000 !important;
        }
        
        h1 + p {
          font-size: 10pt !important;
          margin: 0 !important;
          color: #333 !important;
        }
        
        h2 {
          font-size: 12pt !important;
          font-weight: bold !important;
          margin: 0 0 0.1in 0 !important;
          color: #000 !important;
        }
        
        .stats-grid {
          display: flex !important;
          justify-content: space-between !important;
          gap: 0.08in !important;
          margin: 0.15in 0 !important;
          page-break-inside: avoid !important;
        }
        
        .stats-grid > div {
          flex: 1 !important;
          min-width: 0 !important;
          padding: 0.08in 0.1in !important;
          border: 1.5px solid #333 !important;
          border-radius: 3px !important;
          background: white !important;
          box-shadow: none !important;
          text-align: center !important;
        }
        
        .stats-grid svg,
        .stats-grid .bg-blue-200,
        .stats-grid .bg-green-200,
        .stats-grid .bg-red-200,
        .stats-grid .rounded-lg:has(svg) {
          display: none !important;
        }
        
        .stats-grid p {
          margin: 0 !important;
          line-height: 1.3 !important;
          color: #000 !important;
        }
        
        .stats-grid p:first-of-type {
          font-size: 8pt !important;
          font-weight: 600 !important;
          margin-bottom: 0.03in !important;
        }
        
        .stats-grid p:last-of-type {
          font-size: 18pt !important;
          font-weight: bold !important;
        }
        
        .page-break-avoid {
          page-break-inside: avoid !important;
        }
        
        .bg-white.rounded-xl:has(table) {
          margin-top: 0.15in !important;
          border: 1.5px solid #333 !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          background: white !important;
        }
        
        .px-6.py-4.border-b {
          padding: 0.08in !important;
          background: #e8e8e8 !important;
          border-bottom: 2px solid #333 !important;
        }
        
        table {
          width: 100% !important;
          border-collapse: collapse !important;
          font-size: 8pt !important;
        }
        
        table thead {
          background: #e0e0e0 !important;
        }
        
        table th {
          padding: 0.05in !important;
          text-align: left !important;
          font-weight: bold !important;
          font-size: 8pt !important;
          color: #000 !important;
          border: 1px solid #666 !important;
          background: #e0e0e0 !important;
          white-space: nowrap !important;
        }
        
        table tbody tr {
          page-break-inside: avoid !important;
        }
        
        table tbody tr:nth-child(even) {
          background: #f8f8f8 !important;
        }
        
        table td {
          padding: 0.04in !important;
          font-size: 8pt !important;
          color: #000 !important;
          border: 1px solid #999 !important;
          vertical-align: middle !important;
        }
        
        table span[class*="rounded-full"] {
          display: inline-block !important;
          padding: 2px 8px !important;
          font-size: 7.5pt !important;
          font-weight: 600 !important;
          border: 1px solid #666 !important;
          border-radius: 3px !important;
          background: white !important;
          color: #000 !important;
        }
        
        * {
          transition: none !important;
        }
        
        .space-y-6 > * + * {
          margin-top: 0.15in !important;
        }
        
        .text-gray-600,
        .text-gray-700,
        .text-gray-900,
        .text-blue-600,
        .text-green-600,
        .text-red-600 {
          color: #000 !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const employeesData = await hrService.getEmployees({});
      setEmployees(employeesData);
      
      // Extract unique departments
      const uniqueDepts = [...new Set(employeesData.map(e => e.Department?.name).filter(Boolean))];
      setDepartments(uniqueDepts);
      
      calculateStats(employeesData);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (employeesData) => {
    const byDept = {};
    const byDesig = {};
    let active = 0;
    let inactive = 0;

    employeesData.forEach(emp => {
      // Count by status
      if (emp.status === 'Active') active++;
      else inactive++;

      // Count by department
      const dept = emp.Department?.name || 'Unassigned';
      byDept[dept] = (byDept[dept] || 0) + 1;

      // Count by designation
      const desig = emp.Designation?.title || 'Unassigned';
      byDesig[desig] = (byDesig[desig] || 0) + 1;
    });

    setStats({
      total: employeesData.length,
      active,
      inactive,
      byDepartment: byDept,
      byDesignation: byDesig
    });
  };

  const getFilteredEmployees = () => {
    let filtered = [...employees];

    // Filter by department
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(e => e.Department?.name === selectedDepartment);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(e =>
        (e.employeeId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.Department?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.Designation?.title || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedEmployees = (employeesList) => {
    if (!sortConfig.key) return employeesList;

    return [...employeesList].sort((a, b) => {
      let aVal, bVal;

      if (sortConfig.key === 'employeeId') {
        aVal = a.employeeId || '';
        bVal = b.employeeId || '';
      } else if (sortConfig.key === 'fullName') {
        aVal = a.fullName || '';
        bVal = b.fullName || '';
      } else if (sortConfig.key === 'email') {
        aVal = a.email || '';
        bVal = b.email || '';
      } else if (sortConfig.key === 'department') {
        aVal = a.Department?.name || '';
        bVal = b.Department?.name || '';
      } else if (sortConfig.key === 'designation') {
        aVal = a.Designation?.title || '';
        bVal = b.Designation?.title || '';
      } else if (sortConfig.key === 'status') {
        aVal = a.status || '';
        bVal = b.status || '';
      } else {
        aVal = a[sortConfig.key] || '';
        bVal = b[sortConfig.key] || '';
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const filteredEmployees = getSortedEmployees(getFilteredEmployees());

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading employee list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="print-container space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 page-break-avoid">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee List</h1>
          <p className="text-gray-600 mt-1">Complete list of all employees with department information</p>
        </div>
        <div className="flex gap-3 no-print">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid grid grid-cols-1 md:grid-cols-3 gap-4 page-break-avoid">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm border border-blue-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Employees</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{stats.total}</p>
            </div>
            <div className="bg-blue-200 p-3 rounded-lg">
              <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm border border-green-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Active</p>
              <p className="text-3xl font-bold text-green-900 mt-2">{stats.active}</p>
            </div>
            <div className="bg-green-200 p-3 rounded-lg">
              <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl shadow-sm border border-red-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Inactive</p>
              <p className="text-3xl font-bold text-red-900 mt-2">{stats.inactive}</p>
            </div>
            <div className="bg-red-200 p-3 rounded-lg">
              <svg className="w-6 h-6 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Department Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 page-break-avoid">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Employees by Department
          </h2>
          <div className="space-y-3">
            {Object.entries(stats.byDepartment).sort((a, b) => b[1] - a[1]).map(([dept, count]) => (
              <div key={dept} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{dept}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${(count / stats.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-gray-900 w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Top Designations
          </h2>
          <div className="space-y-3">
            {Object.entries(stats.byDesignation).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([desig, count]) => (
              <div key={desig} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{desig}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${(count / stats.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-gray-900 w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 no-print">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, ID, email, department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedDepartment === 'all' ? 'All Employees' : `${selectedDepartment} Department`}
            </h2>
            <span className="text-sm text-gray-600 bg-gray-200 px-3 py-1 rounded-full font-medium">
              {filteredEmployees.length} {filteredEmployees.length === 1 ? 'employee' : 'employees'}
            </span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  onClick={() => handleSort('fullName')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    Employee Name
                    {sortConfig.key === 'fullName' && (
                      <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('employeeId')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    Employee ID
                    {sortConfig.key === 'employeeId' && (
                      <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('email')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    Email
                    {sortConfig.key === 'email' && (
                      <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('department')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    Department
                    {sortConfig.key === 'department' && (
                      <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('designation')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    Designation
                    {sortConfig.key === 'designation' && (
                      <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('status')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    Status
                    {sortConfig.key === 'status' && (
                      <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider no-print">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <p className="text-lg font-medium">No employees found</p>
                      <p className="text-sm mt-1">Try adjusting your filters or search query</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {employee.fullName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.employeeId || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {employee.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.Department?.name || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.Designation?.title || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        employee.status?.toLowerCase() === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : employee.status?.toLowerCase() === 'terminated'
                          ? 'bg-gray-100 text-gray-800'
                          : employee.status?.toLowerCase() === 'inactive'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {employee.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap no-print">
                      <button
                        onClick={() => {
                          setSelectedEmployeeId(employee.id);
                          setIsModalOpen(true);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Profile Modal */}
      <EmployeeProfileModal
        employeeId={selectedEmployeeId}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEmployeeId(null);
        }}
      />
    </div>
  );
}
