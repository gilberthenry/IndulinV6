import React, { useState, useEffect } from 'react';
import hrService from '../../../services/hrService';

export default function IdDirectory() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [departments, setDepartments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    withSSS: 0,
    withPagibig: 0,
    withPhilHealth: 0,
    withTIN: 0,
    complete: 0,
    incomplete: 0
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
        .bg-yellow-50, .bg-purple-50, .bg-indigo-50, .bg-gray-100,
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
        .stats-grid .bg-yellow-200,
        .stats-grid .bg-purple-200,
        .stats-grid .bg-indigo-200,
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
          font-size: 7pt !important;
        }
        
        table thead {
          background: #e0e0e0 !important;
        }
        
        table th {
          padding: 0.04in !important;
          text-align: left !important;
          font-weight: bold !important;
          font-size: 7pt !important;
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
          padding: 0.03in !important;
          font-size: 7pt !important;
          color: #000 !important;
          border: 1px solid #999 !important;
          vertical-align: middle !important;
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
        .text-yellow-600,
        .text-purple-600,
        .text-indigo-600 {
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
    let withSSS = 0;
    let withPagibig = 0;
    let withPhilHealth = 0;
    let withTIN = 0;
    let complete = 0;
    let incomplete = 0;

    employeesData.forEach(emp => {
      if (emp.sssNumber) withSSS++;
      if (emp.pagibigNumber) withPagibig++;
      if (emp.philhealthNumber) withPhilHealth++;
      if (emp.tinNumber) withTIN++;

      // Complete if all 4 IDs are present
      if (emp.sssNumber && emp.pagibigNumber && emp.philhealthNumber && emp.tinNumber) {
        complete++;
      } else {
        incomplete++;
      }
    });

    setStats({
      total: employeesData.length,
      withSSS,
      withPagibig,
      withPhilHealth,
      withTIN,
      complete,
      incomplete
    });
  };

  const getFilteredEmployees = () => {
    let filtered = [...employees];

    // Filter by department
    if (filterDepartment !== 'all') {
      filtered = filtered.filter(e => e.Department?.name === filterDepartment);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(e =>
        (e.employeeId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.sssNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.pagibigNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.philhealthNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.tinNumber || '').toLowerCase().includes(searchQuery.toLowerCase())
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

      if (sortConfig.key === 'employeeName') {
        aVal = a.fullName || '';
        bVal = b.fullName || '';
      } else if (sortConfig.key === 'employeeId') {
        aVal = a.employeeId || '';
        bVal = b.employeeId || '';
      } else if (sortConfig.key === 'department') {
        aVal = a.Department?.name || '';
        bVal = b.Department?.name || '';
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
          <p className="mt-4 text-gray-600 font-medium">Loading ID directory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="print-container space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 page-break-avoid">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ID Number Directory</h1>
          <p className="text-gray-600 mt-1">Complete directory of employee government ID numbers (SSS, Pag-IBIG, PhilHealth, TIN)</p>
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
      <div className="stats-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 page-break-avoid">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm border border-blue-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">With SSS</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{stats.withSSS}</p>
            </div>
            <div className="bg-blue-200 p-3 rounded-lg">
              <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm border border-green-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">With Pag-IBIG</p>
              <p className="text-3xl font-bold text-green-900 mt-2">{stats.withPagibig}</p>
            </div>
            <div className="bg-green-200 p-3 rounded-lg">
              <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl shadow-sm border border-yellow-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">With PhilHealth</p>
              <p className="text-3xl font-bold text-yellow-900 mt-2">{stats.withPhilHealth}</p>
            </div>
            <div className="bg-yellow-200 p-3 rounded-lg">
              <svg className="w-6 h-6 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-sm border border-purple-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">With TIN</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">{stats.withTIN}</p>
            </div>
            <div className="bg-purple-200 p-3 rounded-lg">
              <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl shadow-sm border border-indigo-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-600">Complete</p>
              <p className="text-3xl font-bold text-indigo-900 mt-2">{stats.complete}</p>
            </div>
            <div className="bg-indigo-200 p-3 rounded-lg">
              <svg className="w-6 h-6 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Alert for Incomplete IDs */}
      {stats.incomplete > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg no-print">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-yellow-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-yellow-800">Incomplete Records</h3>
              <p className="text-sm text-yellow-700 mt-1">
                <strong>{stats.incomplete}</strong> employee(s) have missing ID numbers. Please update their records.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 no-print">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, employee ID, or ID numbers..."
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
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
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

      {/* ID Directory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">ID Number Directory</h2>
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
                  onClick={() => handleSort('employeeName')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    Employee Name
                    {sortConfig.key === 'employeeName' && (
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SSS Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pag-IBIG Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PhilHealth Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TIN
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.Department?.name || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {employee.sssNumber || <span className="text-red-400 italic">Not provided</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {employee.pagibigNumber || <span className="text-red-400 italic">Not provided</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {employee.philhealthNumber || <span className="text-red-400 italic">Not provided</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {employee.tinNumber || <span className="text-red-400 italic">Not provided</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
