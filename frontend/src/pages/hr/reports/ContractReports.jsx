import React, { useState, useEffect } from 'react';
import hrService from '../../../services/hrService';

export default function ContractReports() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [departments, setDepartments] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    expiring: 0,
    terminated: 0,
    byType: {},
    byDepartment: {}
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
        .bg-gradient-to-br {
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
        
        /* Hide the flex container with icons */
        .stats-grid > div > .flex {
          display: block !important;
        }
        
        /* Hide icons/decorative elements */
        .stats-grid svg,
        .stats-grid .bg-blue-200,
        .stats-grid .bg-green-200,
        .stats-grid .bg-yellow-200,
        .stats-grid .bg-red-200,
        .stats-grid .bg-gray-200,
        .stats-grid .rounded-lg:has(svg) {
          display: none !important;
        }
        
        .stats-grid p,
        .stats-grid div > div > p {
          margin: 0 !important;
          line-height: 1.3 !important;
          display: block !important;
          visibility: visible !important;
          color: #000 !important;
        }
        
        .stats-grid p:first-of-type,
        .stats-grid div > div > p:first-of-type {
          font-size: 8pt !important;
          font-weight: 600 !important;
          color: #000 !important;
          margin-bottom: 0.03in !important;
        }
        
        .stats-grid p:last-of-type,
        .stats-grid div > div > p:last-of-type {
          font-size: 18pt !important;
          font-weight: bold !important;
          color: #000 !important;
        }
        
        /* Summary sections */
        .page-break-avoid:has(.grid) {
          margin: 0.15in 0 !important;
          page-break-inside: avoid !important;
        }
        
        .grid.lg\\:grid-cols-2 {
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 0.12in !important;
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
        
        /* Contract type cards */
        .grid.lg\\:grid-cols-2 > div:first-child .grid {
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 0.06in !important;
        }
        
        .grid.lg\\:grid-cols-2 > div:first-child .grid > div {
          padding: 0.06in !important;
          border: 1px solid #ccc !important;
          border-radius: 2px !important;
          background: #f9f9f9 !important;
        }
        
        .grid.lg\\:grid-cols-2 > div:first-child .grid p {
          margin: 0 !important;
          font-size: 8pt !important;
          line-height: 1.4 !important;
        }
        
        .grid.lg\\:grid-cols-2 > div:first-child .grid p:nth-child(2) {
          font-size: 14pt !important;
          font-weight: bold !important;
          margin: 0.02in 0 !important;
        }
        
        /* Department list */
        .grid.lg\\:grid-cols-2 > div:last-child .space-y-3 {
          max-height: none !important;
          overflow: visible !important;
        }
        
        .grid.lg\\:grid-cols-2 > div:last-child .space-y-3 > div {
          padding: 0.04in 0.06in !important;
          margin-bottom: 0.03in !important;
          border: 1px solid #ddd !important;
          border-radius: 2px !important;
          background: #f9f9f9 !important;
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
        }
        
        .grid.lg\\:grid-cols-2 > div:last-child .space-y-3 span {
          font-size: 8pt !important;
        }
        
        .grid.lg\\:grid-cols-2 > div:last-child .space-y-3 span:last-child {
          font-weight: bold !important;
          background: white !important;
          border: 1px solid #999 !important;
          padding: 2px 6px !important;
          border-radius: 3px !important;
        }
        
        /* Table section */
        .bg-white.rounded-xl:has(table) {
          margin-top: 0.15in !important;
          border: 1.5px solid #333 !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          background: white !important;
          page-break-inside: auto !important;
        }
        
        /* Table header */
        .px-6.py-4.border-b.bg-gray-50 {
          padding: 0.08in !important;
          background: #e8e8e8 !important;
          border-bottom: 2px solid #333 !important;
        }
        
        .px-6.py-4.border-b h2 {
          font-size: 12pt !important;
          margin: 0 !important;
        }
        
        .px-6.py-4.border-b span {
          font-size: 9pt !important;
        }
        
        /* Table */
        .overflow-x-auto {
          overflow: visible !important;
        }
        
        table {
          width: 100% !important;
          border-collapse: collapse !important;
          font-size: 8.5pt !important;
        }
        
        table thead {
          background: #e0e0e0 !important;
        }
        
        table thead tr {
          border-bottom: 2px solid #333 !important;
        }
        
        table th {
          padding: 0.06in !important;
          text-align: left !important;
          font-weight: bold !important;
          font-size: 8.5pt !important;
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
        
        table tbody tr:hover {
          background: inherit !important;
        }
        
        table td {
          padding: 0.05in !important;
          font-size: 8.5pt !important;
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
        
        /* Days left badges */
        table td:last-child span[class*="bg-red"],
        table td:last-child span[class*="bg-yellow"] {
          background: white !important;
          color: #000 !important;
          border: 1px solid #999 !important;
          padding: 2px 6px !important;
          font-weight: bold !important;
        }
        
        /* Remove all transitions and hover effects */
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
        
        /* Spacing adjustments */
        .space-y-6 > * + * {
          margin-top: 0.15in !important;
        }
        
        /* Hide empty state messages */
        table td[colspan] .flex.flex-col {
          display: none !important;
        }
        
        /* Ensure text is black */
        .text-gray-600,
        .text-gray-700,
        .text-gray-900,
        .text-blue-600,
        .text-green-600,
        .text-red-600,
        .text-yellow-600 {
          color: #000 !important;
        }
        
        /* Page breaks */
        .page-break-avoid {
          page-break-inside: avoid !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    fetchContracts();
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const data = await hrService.getDepartments('Active');
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const data = await hrService.getContractReport();
      setContracts(data);
      calculateStats(data);
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (contractsData) => {
    const today = new Date();
    const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const stats = {
      total: contractsData.length,
      active: contractsData.filter(c => c.status === 'Active').length,
      expired: contractsData.filter(c => c.status === 'Expired').length,
      expiring: contractsData.filter(c => {
        if (c.status === 'Active' && c.endDate) {
          const endDate = new Date(c.endDate);
          return endDate >= today && endDate <= in30Days;
        }
        return false;
      }).length,
      terminated: contractsData.filter(c => c.status === 'Terminated').length,
      byType: {},
      byDepartment: {}
    };

    // Group by contract type
    contractsData.forEach(contract => {
      stats.byType[contract.contractType] = (stats.byType[contract.contractType] || 0) + 1;
      stats.byDepartment[contract.department] = (stats.byDepartment[contract.department] || 0) + 1;
    });

    setStats(stats);
  };

  const getFilteredContracts = () => {
    let filtered = contracts;

    // Apply status filter
    if (filter === 'active') {
      filtered = filtered.filter(c => c.status === 'Active');
    } else if (filter === 'expired') {
      filtered = filtered.filter(c => c.status === 'Expired');
    } else if (filter === 'expiring') {
      const today = new Date();
      const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(c => {
        if (c.status === 'Active' && c.endDate) {
          const endDate = new Date(c.endDate);
          return endDate >= today && endDate <= in30Days;
        }
        return false;
      });
    } else if (filter === 'terminated') {
      filtered = filtered.filter(c => c.status === 'Terminated');
    }

    // Apply department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(c => c.department === departmentFilter);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(c => 
        (c.Employee?.employeeId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.Employee?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.position || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.department || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.contractType || '').toLowerCase().includes(searchQuery.toLowerCase())
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

  const getSortedContracts = (contractsList) => {
    if (!sortConfig.key) return contractsList;

    return [...contractsList].sort((a, b) => {
      let aVal, bVal;

      if (sortConfig.key === 'employeeId') {
        aVal = a.Employee?.employeeId || '';
        bVal = b.Employee?.employeeId || '';
      } else if (sortConfig.key === 'employeeName') {
        aVal = a.Employee?.fullName || '';
        bVal = b.Employee?.fullName || '';
      } else if (sortConfig.key === 'daysUntilExpiry') {
        if (!a.endDate || a.status !== 'Active') aVal = 999999;
        else {
          const diffTime = new Date(a.endDate) - new Date();
          aVal = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
        if (!b.endDate || b.status !== 'Active') bVal = 999999;
        else {
          const diffTime = new Date(b.endDate) - new Date();
          bVal = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
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

  const getDaysUntilExpiry = (contract) => {
    if (!contract.endDate || contract.status !== 'Active') return null;
    const today = new Date();
    const endDate = new Date(contract.endDate);
    const diffTime = endDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredContracts = getSortedContracts(getFilteredContracts());

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading contract reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="print-container space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 page-break-avoid">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contract Reports</h1>
          <p className="text-gray-600 mt-1">Overview of all employee contracts and their status</p>
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
            onClick={fetchContracts}
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
              <p className="text-sm font-medium text-blue-600">Total Contracts</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{stats.total}</p>
            </div>
            <div className="bg-blue-200 p-3 rounded-lg">
              <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
        
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl shadow-sm border border-yellow-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Expiring Soon</p>
              <p className="text-3xl font-bold text-yellow-900 mt-2">{stats.expiring}</p>
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
              <p className="text-sm font-medium text-red-600">Expired</p>
              <p className="text-3xl font-bold text-red-900 mt-2">{stats.expired}</p>
            </div>
            <div className="bg-red-200 p-3 rounded-lg">
              <svg className="w-6 h-6 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Terminated</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.terminated}</p>
            </div>
            <div className="bg-gray-200 p-3 rounded-lg">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Types and Department Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 page-break-avoid">
        {/* Contract Types */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 page-break-avoid">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Contract Types Distribution
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(stats.byType).map(([type, count]) => (
              <div key={type} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                <p className="text-sm text-gray-600 capitalize font-medium">{type}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {((count / stats.total) * 100).toFixed(1)}% of total
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Department Summary */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 page-break-avoid">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Top Departments
          </h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {Object.entries(stats.byDepartment)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 8)
              .map(([dept, count]) => (
                <div key={dept} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                  <span className="text-sm font-medium text-gray-700 truncate flex-1" title={dept}>{dept}</span>
                  <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">{count}</span>
                </div>
              ))}
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
                placeholder="Search by name, ID, position..."
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
              <option value="all">All Contracts</option>
              <option value="active">Active</option>
              <option value="expiring">Expiring Soon (30 days)</option>
              <option value="expired">Expired</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.name}>{dept.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              {filter === 'all' ? 'All Contracts' :
               filter === 'active' ? 'Active Contracts' :
               filter === 'expiring' ? 'Expiring Soon (Next 30 Days)' :
               filter === 'expired' ? 'Expired Contracts' :
               'Terminated Contracts'}
            </h2>
            <span className="text-sm text-gray-600 bg-gray-200 px-3 py-1 rounded-full font-medium">
              {filteredContracts.length} {filteredContracts.length === 1 ? 'record' : 'records'}
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
                  onClick={() => handleSort('contractType')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    Type
                    {sortConfig.key === 'contractType' && (
                      <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('position')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    Position
                    {sortConfig.key === 'position' && (
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
                  onClick={() => handleSort('daysUntilExpiry')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    Days Left
                    {sortConfig.key === 'daysUntilExpiry' && (
                      <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-lg font-medium">No contracts found</p>
                      <p className="text-sm mt-1">Try adjusting your filters or search query</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredContracts.map((contract) => {
                  const daysLeft = getDaysUntilExpiry(contract);
                  return (
                    <tr key={contract.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {contract.Employee?.fullName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {contract.Employee?.employeeId || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <span className="capitalize">{contract.contractType}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {contract.position}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {contract.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {new Date(contract.startDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {contract.endDate ? new Date(contract.endDate).toLocaleDateString() : (
                          <span className="text-blue-600 font-medium">Permanent</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          contract.status === 'Active' ? 'bg-green-100 text-green-800 border border-green-200' :
                          contract.status === 'Expired' ? 'bg-red-100 text-red-800 border border-red-200' :
                          contract.status === 'Terminated' ? 'bg-gray-100 text-gray-800 border border-gray-200' :
                          'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        }`}>
                          {contract.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {daysLeft === null ? (
                          <span className="text-gray-400">-</span>
                        ) : daysLeft < 0 ? (
                          <span className="text-red-600 font-semibold">Expired</span>
                        ) : daysLeft <= 7 ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
                            {daysLeft} days
                          </span>
                        ) : daysLeft <= 30 ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300">
                            {daysLeft} days
                          </span>
                        ) : (
                          <span className="text-gray-600">{daysLeft} days</span>
                        )}
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
