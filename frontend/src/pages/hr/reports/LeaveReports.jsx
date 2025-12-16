import React, { useState, useEffect } from 'react';
import hrService from '../../../services/hrService';

export default function LeaveReports() {
  const [leaves, setLeaves] = useState([]);
  const [leaveCredits, setLeaveCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [schoolYear, setSchoolYear] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    totalDays: 0,
    byType: {},
    byMonth: {}
  });

  // Add print styles
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        /* Page setup */
        @page {
          size: landscape;
          margin: 0.75in 0.5in;
        }
        
        /* Hide navigation elements */
        aside, nav, .sidebar, [role="navigation"], 
        header[class*="fixed"], .no-print {
          display: none !important;
        }
        
        /* Reset body */
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
        
        /* Main container */
        .print-container {
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
        }
        
        /* Remove all background colors and gradients */
        .bg-gray-50, .bg-blue-50, .bg-green-50, 
        .bg-yellow-50, .bg-red-50, .bg-gray-100,
        .bg-purple-50, .bg-gradient-to-br {
          background: white !important;
          background-image: none !important;
        }
        
        /* Header section */
        .print-container > div:first-child {
          margin-bottom: 0.2in !important;
          padding-bottom: 0.1in !important;
          border-bottom: 2px solid #000 !important;
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
        
        /* Statistics cards - single row, compact */
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
        
        /* Hide icons/decorative elements */
        .stats-grid svg,
        .stats-grid .bg-blue-200,
        .stats-grid .bg-green-200,
        .stats-grid .bg-yellow-200,
        .stats-grid .bg-red-200,
        .stats-grid .bg-purple-200,
        .stats-grid .rounded-lg:has(svg) {
          display: none !important;
        }
        
        .stats-grid p {
          margin: 0 !important;
          line-height: 1.3 !important;
          display: block !important;
          visibility: visible !important;
          color: #000 !important;
        }
        
        .stats-grid p:first-of-type {
          font-size: 8pt !important;
          font-weight: 600 !important;
          color: #000 !important;
          margin-bottom: 0.03in !important;
        }
        
        .stats-grid p:last-of-type {
          font-size: 18pt !important;
          font-weight: bold !important;
          color: #000 !important;
        }
        
        /* Summary sections */
        .page-break-avoid {
          page-break-inside: avoid !important;
        }
        
        .grid.lg\\:grid-cols-2 {
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 0.12in !important;
          margin: 0.15in 0 !important;
        }
        
        .grid.lg\\:grid-cols-2 > div {
          padding: 0.1in !important;
          border: 1px solid #666 !important;
          border-radius: 3px !important;
          background: white !important;
          box-shadow: none !important;
        }
        
        .grid.lg\\:grid-cols-2 h2 {
          font-size: 11pt !important;
          margin-bottom: 0.08in !important;
          padding-bottom: 0.05in !important;
          border-bottom: 1px solid #ccc !important;
        }
        
        .grid.lg\\:grid-cols-2 svg {
          display: none !important;
        }
        
        /* Leave type distribution */
        .grid.grid-cols-2 {
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 0.06in !important;
        }
        
        .grid.grid-cols-2 > div,
        .grid.md\\:grid-cols-4 > div {
          padding: 0.06in !important;
          border: 1px solid #ccc !important;
          border-radius: 2px !important;
          background: #f9f9f9 !important;
        }
        
        .grid.grid-cols-2 p,
        .grid.md\\:grid-cols-4 p {
          margin: 0 !important;
          font-size: 8pt !important;
          line-height: 1.4 !important;
        }
        
        .grid.grid-cols-2 p:nth-child(2),
        .grid.md\\:grid-cols-4 p:nth-child(2) {
          font-size: 14pt !important;
          font-weight: bold !important;
          margin: 0.02in 0 !important;
        }
        
        /* Monthly distribution */
        .grid.grid-cols-3 {
          display: grid !important;
          grid-template-columns: repeat(6, 1fr) !important;
          gap: 0.04in !important;
        }
        
        .grid.grid-cols-3 > div,
        .grid.md\\:grid-cols-6 > div {
          padding: 0.04in !important;
          border: 1px solid #ccc !important;
          border-radius: 2px !important;
          background: #f9f9f9 !important;
          text-align: center !important;
        }
        
        /* Table section */
        .bg-white.rounded-xl:has(table),
        .bg-white.rounded-lg:has(table) {
          margin-top: 0.15in !important;
          border: 1.5px solid #333 !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          background: white !important;
          page-break-inside: auto !important;
        }
        
        /* Table header */
        .px-6.py-4.border-b,
        .p-4.border-b {
          padding: 0.08in !important;
          background: #e8e8e8 !important;
          border-bottom: 2px solid #333 !important;
        }
        
        .px-6.py-4.border-b h2,
        .p-4.border-b h2 {
          font-size: 12pt !important;
          margin: 0 !important;
        }
        
        /* Table */
        .overflow-x-auto {
          overflow: visible !important;
        }
        
        table {
          width: 100% !important;
          border-collapse: collapse !important;
          font-size: 8pt !important;
        }
        
        table thead {
          background: #e0e0e0 !important;
        }
        
        table thead tr {
          border-bottom: 2px solid #333 !important;
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
        
        table th > div {
          display: flex !important;
          align-items: center !important;
          gap: 3px !important;
        }
        
        table th svg {
          display: none !important;
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
        
        /* Status badges */
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
        
        /* Remove hover effects */
        * {
          transition: none !important;
        }
        
        .hover\\:bg-gray-50,
        .hover\\:bg-gray-100,
        .hover\\:bg-blue-50,
        .hover\\:shadow-md {
          background: inherit !important;
          box-shadow: none !important;
        }
        
        /* Spacing */
        .space-y-6 > * + * {
          margin-top: 0.15in !important;
        }
        
        /* Text colors */
        .text-gray-600,
        .text-gray-700,
        .text-gray-900,
        .text-blue-600,
        .text-green-600,
        .text-red-600,
        .text-yellow-600 {
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
    // Set default school year
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const defaultSY = month >= 6 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
    setSchoolYear(defaultSY);
    
    fetchLeaves();
  }, []);

  useEffect(() => {
    if (schoolYear) {
      fetchLeaveCredits();
    }
  }, [schoolYear]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const data = await hrService.getLeaveReport();
      setLeaves(data);
      calculateStats(data);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveCredits = async () => {
    try {
      const data = await hrService.getLeaveCredits(schoolYear);
      setLeaveCredits(data);
    } catch (error) {
      console.error('Error fetching leave credits:', error);
    }
  };

  const calculateStats = (leavesData) => {
    const stats = {
      total: leavesData.length,
      approved: leavesData.filter(l => l.status === 'Approved').length,
      pending: leavesData.filter(l => l.status === 'Pending').length,
      rejected: leavesData.filter(l => l.status === 'Rejected').length,
      totalDays: leavesData
        .filter(l => l.status === 'Approved')
        .reduce((sum, l) => sum + (l.daysCount || 0), 0),
      byType: {},
      byMonth: {}
    };

    // Group by leave type
    leavesData.forEach(leave => {
      if (leave.status === 'Approved') {
        stats.byType[leave.type] = (stats.byType[leave.type] || 0) + 1;
        
        // Group by month
        const month = new Date(leave.startDate).toLocaleString('default', { month: 'short' });
        stats.byMonth[month] = (stats.byMonth[month] || 0) + (leave.daysCount || 0);
      }
    });

    setStats(stats);
  };

  const getFilteredLeaves = () => {
    let filtered = leaves;

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(l => l.status === filter);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(l => l.type === typeFilter);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(l => 
        (l.Employee?.employeeId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.Employee?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.type || '').toLowerCase().includes(searchQuery.toLowerCase())
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

  const getSortedLeaves = (leavesList) => {
    if (!sortConfig.key) return leavesList;

    return [...leavesList].sort((a, b) => {
      let aVal, bVal;

      if (sortConfig.key === 'employeeId') {
        aVal = a.Employee?.employeeId || '';
        bVal = b.Employee?.employeeId || '';
      } else if (sortConfig.key === 'employeeName') {
        aVal = a.Employee?.fullName || '';
        bVal = b.Employee?.fullName || '';
      } else if (sortConfig.key === 'startDate' || sortConfig.key === 'endDate') {
        aVal = new Date(a[sortConfig.key]);
        bVal = new Date(b[sortConfig.key]);
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      } else {
        aVal = a[sortConfig.key] || '';
        bVal = b[sortConfig.key] || '';
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const leaveTypes = [...new Set(leaves.map(l => l.type))];
  const filteredLeaves = getSortedLeaves(getFilteredLeaves());

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading leave reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="print-container space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 page-break-avoid">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leave Reports</h1>
          <p className="text-gray-600 mt-1">Comprehensive overview of employee leave requests and credits</p>
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
            onClick={fetchLeaves}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid grid grid-cols-1 md:grid-cols-5 gap-4 page-break-avoid">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm border border-blue-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Requests</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{stats.total}</p>
            </div>
            <div className="bg-blue-200 p-3 rounded-lg">
              <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm border border-green-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Approved</p>
              <p className="text-3xl font-bold text-green-900 mt-2">{stats.approved}</p>
            </div>
            <div className="bg-green-200 p-3 rounded-lg">
              <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl shadow-sm border border-yellow-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-900 mt-2">{stats.pending}</p>
            </div>
            <div className="bg-yellow-200 p-3 rounded-lg">
              <svg className="w-6 h-6 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl shadow-sm border border-red-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Rejected</p>
              <p className="text-3xl font-bold text-red-900 mt-2">{stats.rejected}</p>
            </div>
            <div className="bg-red-200 p-3 rounded-lg">
              <svg className="w-6 h-6 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-sm border border-purple-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total Days Used</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">{stats.totalDays}</p>
            </div>
            <div className="bg-purple-200 p-3 rounded-lg">
              <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Types and Monthly Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 page-break-avoid">
        {/* Leave Types Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Leave Types Distribution (Approved)
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(stats.byType).map(([type, count]) => (
              <div key={type} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                <p className="text-sm text-gray-600 font-medium">{type}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.approved > 0 ? ((count / stats.approved) * 100).toFixed(1) : 0}% of approved
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Leave Days by Month
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {Object.entries(stats.byMonth).length > 0 ? (
              Object.entries(stats.byMonth).map(([month, days]) => (
                <div key={month} className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center hover:bg-blue-50 transition-colors">
                  <p className="text-xs text-gray-600 font-medium">{month}</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{days}</p>
                  <p className="text-xs text-gray-500">days</p>
                </div>
              ))
            ) : (
              <div className="col-span-6 text-center text-gray-500 py-4">No monthly data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 no-print">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, ID, leave type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              {leaveTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              {filter === 'all' ? 'All Leave Requests' :
               filter === 'Approved' ? 'Approved Leave Requests' :
               filter === 'Pending' ? 'Pending Leave Requests' :
               'Rejected Leave Requests'}
            </h2>
            <span className="text-sm text-gray-600 bg-gray-200 px-3 py-1 rounded-full font-medium">
              {filteredLeaves.length} {filteredLeaves.length === 1 ? 'record' : 'records'}
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
                  onClick={() => handleSort('type')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    Leave Type
                    {sortConfig.key === 'type' && (
                      <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('startDate')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    Start Date
                    {sortConfig.key === 'startDate' && (
                      <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('endDate')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    End Date
                    {sortConfig.key === 'endDate' && (
                      <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('daysCount')}
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center justify-center gap-1">
                    Days
                    {sortConfig.key === 'daysCount' && (
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
                <th 
                  onClick={() => handleSort('schoolYear')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    School Year
                    {sortConfig.key === 'schoolYear' && (
                      <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-lg font-medium">No leave requests found</p>
                      <p className="text-sm mt-1">Try adjusting your filters or search query</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {leave.Employee?.fullName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {leave.Employee?.employeeId || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {leave.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(leave.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(leave.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-gray-900">
                      {leave.daysCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        leave.status === 'Approved' ? 'bg-green-100 text-green-800 border border-green-200' :
                        leave.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                        'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {leave.schoolYear || 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Credits Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Leave Credits Summary</h2>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">School Year:</label>
              <input
                type="text"
                value={schoolYear}
                onChange={(e) => setSchoolYear(e.target.value)}
                placeholder="e.g., 2024-2025"
                className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employment Type
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vacation Leave
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sick Leave
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Special Leave
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Remaining
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaveCredits.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-lg font-medium">No leave credits data available</p>
                      <p className="text-sm mt-1">for the selected school year</p>
                    </div>
                  </td>
                </tr>
              ) : (
                leaveCredits.map((credit) => {
                  const remaining = 
                    (credit.vacationLeaveTotal - credit.vacationLeaveUsed) +
                    (credit.sickLeaveTotal - credit.sickLeaveUsed) +
                    (credit.specialLeaveTotal - credit.specialLeaveUsed);
                  return (
                    <tr key={credit.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {credit.Employee?.fullName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {credit.Employee?.employeeId || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {credit.employmentType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                        <span className="font-semibold">{credit.vacationLeaveUsed}</span>
                        <span className="text-gray-500"> / {credit.vacationLeaveTotal}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                        <span className="font-semibold">{credit.sickLeaveUsed}</span>
                        <span className="text-gray-500"> / {credit.sickLeaveTotal}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                        <span className="font-semibold">{credit.specialLeaveUsed}</span>
                        <span className="text-gray-500"> / {credit.specialLeaveTotal}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full font-bold ${
                          remaining <= 5 ? 'bg-red-100 text-red-800 border border-red-300' : 
                          remaining <= 10 ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : 
                          'bg-green-100 text-green-800 border border-green-300'
                        }`}>
                          {remaining} days
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
