import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UploadCloud, Filter, Search, Eye, UserX, UserCheck, AlertCircle, UserPlus, Download, ChevronDown, User } from 'lucide-react';
import hrService from '../../services/hrService';
import { useToast } from '../../context/ToastContext';
import EmployeeProfileModal from '../../components/hr/EmployeeProfileModal';

const API_BASE_URL = 'http://localhost:5000';

export default function HREmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    role: '',
    search: ''
  });
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDownloadMenu && !event.target.closest('.relative')) {
        setShowDownloadMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDownloadMenu]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await hrService.getEmployees();
      
      // Log if any incomplete records are detected (for development debugging)
      const incompleteCount = data.filter(emp => 
        !emp.employeeId || !emp.fullName || !emp.email ||
        emp.employeeId.trim() === '' || emp.fullName.trim() === '' || emp.email.trim() === ''
      ).length;
      
      if (incompleteCount > 0) {
        console.warn(`⚠️ ${incompleteCount} incomplete employee record(s) detected and will be filtered out`);
      }
      
      setEmployees(data);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to fetch employees', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering for immediate response
  const filteredEmployees = employees.filter(emp => {
    // Exclude incomplete records - skip if any required field is missing
    if (!emp.employeeId || !emp.fullName || !emp.email) {
      return false;
    }
    
    // Additional validation - skip if all required fields are empty strings
    if (emp.employeeId.trim() === '' || emp.fullName.trim() === '' || emp.email.trim() === '') {
      return false;
    }

    // Status filter
    if (filters.status) {
      const empStatus = emp.isSuspended ? 'Suspended' : emp.status;
      if (empStatus?.toLowerCase() !== filters.status.toLowerCase()) {
        return false;
      }
    }

    // Role filter
    if (filters.role && emp.role?.toLowerCase() !== filters.role.toLowerCase()) {
      return false;
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesId = emp.employeeId?.toLowerCase().includes(searchLower);
      const matchesName = emp.fullName?.toLowerCase().includes(searchLower);
      const matchesEmail = emp.email?.toLowerCase().includes(searchLower);
      
      if (!matchesId && !matchesName && !matchesEmail) {
        return false;
      }
    }

    return true;
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleViewEmployee = (id) => {
    setSelectedEmployeeId(id);
    setIsModalOpen(true);
  };

  const prepareEmployeeData = () => {
    return filteredEmployees.map(emp => ({
      employeeId: emp.employeeId || '',
      fullName: emp.fullName || '',
      email: emp.email || '',
      contactNumber: emp.contactNumber || '',
      role: emp.role || '',
      department: emp.Contracts && emp.Contracts.length > 0 ? emp.Contracts[0].department || '' : '',
      position: emp.Contracts && emp.Contracts.length > 0 ? emp.Contracts[0].position || '' : '',
      dateJoined: emp.createdAt ? new Date(emp.createdAt).toLocaleDateString('en-US') : '',
      contractType: emp.Contracts && emp.Contracts.length > 0 ? emp.Contracts[0].contractType || '' : '',
      status: emp.isSuspended ? 'Suspended' : emp.status || ''
    }));
  };

  const handleDownloadCSV = () => {
    try {
      const data = prepareEmployeeData();
      const headers = [
        'Employee ID',
        'Full Name',
        'Email',
        'Contact Number',
        'Role',
        'Department',
        'Position',
        'Date Joined',
        'Contract Type',
        'Status'
      ];

      const rows = data.map(emp => [
        emp.employeeId,
        emp.fullName,
        emp.email,
        emp.contactNumber,
        emp.role,
        emp.department,
        emp.position,
        emp.dateJoined,
        emp.contractType,
        emp.status
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `employees_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast('Employee list downloaded as CSV', 'success');
      setShowDownloadMenu(false);
    } catch (err) {
      showToast('Failed to download CSV file', 'error');
    }
  };

  const handleDownloadExcel = () => {
    try {
      const data = prepareEmployeeData();
      const headers = [
        'Employee ID',
        'Full Name',
        'Email',
        'Contact Number',
        'Role',
        'Department',
        'Position',
        'Date Joined',
        'Contract Type',
        'Status'
      ];

      // Create Excel-compatible XML format
      let excelContent = '<?xml version="1.0"?>\n';
      excelContent += '<?mso-application progid="Excel.Sheet"?>\n';
      excelContent += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n';
      excelContent += ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n';
      excelContent += ' <Worksheet ss:Name="Employees">\n';
      excelContent += '  <Table>\n';
      
      // Add headers
      excelContent += '   <Row>\n';
      headers.forEach(header => {
        excelContent += `    <Cell><Data ss:Type="String">${header}</Data></Cell>\n`;
      });
      excelContent += '   </Row>\n';
      
      // Add data rows
      data.forEach(emp => {
        excelContent += '   <Row>\n';
        excelContent += `    <Cell><Data ss:Type="String">${emp.employeeId}</Data></Cell>\n`;
        excelContent += `    <Cell><Data ss:Type="String">${emp.fullName}</Data></Cell>\n`;
        excelContent += `    <Cell><Data ss:Type="String">${emp.email}</Data></Cell>\n`;
        excelContent += `    <Cell><Data ss:Type="String">${emp.contactNumber}</Data></Cell>\n`;
        excelContent += `    <Cell><Data ss:Type="String">${emp.role}</Data></Cell>\n`;
        excelContent += `    <Cell><Data ss:Type="String">${emp.department}</Data></Cell>\n`;
        excelContent += `    <Cell><Data ss:Type="String">${emp.position}</Data></Cell>\n`;
        excelContent += `    <Cell><Data ss:Type="String">${emp.dateJoined}</Data></Cell>\n`;
        excelContent += `    <Cell><Data ss:Type="String">${emp.contractType}</Data></Cell>\n`;
        excelContent += `    <Cell><Data ss:Type="String">${emp.status}</Data></Cell>\n`;
        excelContent += '   </Row>\n';
      });
      
      excelContent += '  </Table>\n';
      excelContent += ' </Worksheet>\n';
      excelContent += '</Workbook>';

      const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `employees_${new Date().toISOString().split('T')[0]}.xls`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast('Employee list downloaded as Excel', 'success');
      setShowDownloadMenu(false);
    } catch (err) {
      showToast('Failed to download Excel file', 'error');
    }
  };

  const handleDownloadPDF = () => {
    try {
      const data = prepareEmployeeData();
      
      // Create a simple HTML table for PDF
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f3f4f6; padding: 12px; text-align: left; border: 1px solid #ddd; font-weight: 600; }
            td { padding: 10px; border: 1px solid #ddd; }
            tr:nth-child(even) { background-color: #f9fafb; }
          </style>
        </head>
        <body>
          <h1>Employee List</h1>
          <p>Generated on: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <table>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Department</th>
                <th>Position</th>
                <th>Date Joined</th>
                <th>Contract Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
      `;
      
      data.forEach(emp => {
        htmlContent += `
          <tr>
            <td>${emp.employeeId}</td>
            <td>${emp.fullName}</td>
            <td>${emp.email}</td>
            <td>${emp.contactNumber}</td>
            <td>${emp.role}</td>
            <td>${emp.department}</td>
            <td>${emp.position}</td>
            <td>${emp.dateJoined}</td>
            <td>${emp.contractType}</td>
            <td>${emp.status}</td>
          </tr>
        `;
      });
      
      htmlContent += `
            </tbody>
          </table>
        </body>
        </html>
      `;

      // Create a new window to print
      const printWindow = window.open('', '', 'width=800,height=600');
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load then trigger print dialog
      printWindow.onload = () => {
        printWindow.print();
      };

      showToast('Opening print dialog for PDF export', 'success');
      setShowDownloadMenu(false);
    } catch (err) {
      showToast('Failed to generate PDF', 'error');
    }
  };

  const getStatusBadge = (status, isSuspended) => {
    if (isSuspended) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Suspended</span>;
    }
    
    const statusColors = {
      Active: 'bg-green-100 text-green-700',
      Inactive: 'bg-slate-100 text-slate-700',
      Terminated: 'bg-gray-100 text-gray-700',
      'On Leave': 'bg-yellow-100 text-yellow-700',
      Resigned: 'bg-orange-100 text-orange-700',
      Retired: 'bg-purple-100 text-purple-700'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status] || 'bg-slate-100 text-slate-700'}`}>
        {status || 'Unknown'}
      </span>
    );
  };

  const getContractTypeBadge = (contractType) => {
    if (!contractType) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">
          None
        </span>
      );
    }
    
    const typeColors = {
      permanent: 'bg-emerald-100 text-emerald-700',
      contractual: 'bg-indigo-100 text-indigo-700',
      'part-time': 'bg-yellow-100 text-yellow-700',
      'job-order': 'bg-orange-100 text-orange-700'
    };
    
    // Normalize the contract type for display
    const normalizedType = contractType.toLowerCase();
    const displayText = contractType
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${typeColors[normalizedType] || 'bg-slate-100 text-slate-700'}`}>
        {displayText}
      </span>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Employees</h1>
        <div className="flex space-x-4">
          <div className="relative">
            <button
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              disabled={filteredEmployees.length === 0}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
              title="Download Employee List"
            >
              <Download size={20} className="mr-2" />
              Download
              <ChevronDown size={16} className="ml-2" />
            </button>
            
            {showDownloadMenu && filteredEmployees.length > 0 && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <button
                  onClick={handleDownloadCSV}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center"
                >
                  <Download size={16} className="mr-3 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Download as CSV</span>
                </button>
                <button
                  onClick={handleDownloadExcel}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center border-t border-gray-100"
                >
                  <Download size={16} className="mr-3 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Download as Excel</span>
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center border-t border-gray-100 rounded-b-lg"
                >
                  <Download size={16} className="mr-3 text-red-600" />
                  <span className="text-sm font-medium text-gray-700">Download as PDF</span>
                </button>
              </div>
            )}
          </div>
          <Link
            to="/hr/employees/add"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300"
          >
            <UserPlus size={20} className="mr-2" />
            Add Employee
          </Link>
          <Link
            to="/hr/bulk-upload"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-300"
          >
            <UploadCloud size={20} className="mr-2" />
            Bulk Upload
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center mb-4">
          <Filter size={20} className="text-gray-500 mr-2" />
          <h2 className="text-xl font-semibold text-gray-700">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="ID, Name, or Email..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
              <option value="Terminated">Terminated</option>
              <option value="On Leave">On Leave</option>
              <option value="Resigned">Resigned</option>
              <option value="Retired">Retired</option>
            </select>
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Roles</option>
              <option value="employee">Employee</option>
              <option value="hr">HR</option>
              <option value="mis">MIS</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ status: '', role: '', search: '' })}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Employee List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle size={48} className="text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">
              {filters.search || filters.status || filters.role 
                ? 'No employees match the current filters' 
                : 'No employees found'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contract Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {employee.profileImage ? (
                            <img
                              src={`${API_BASE_URL}${employee.profileImage}`}
                              alt={employee.fullName}
                              className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-200"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                                e.target.nextElementSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold"
                            style={{ display: employee.profileImage ? 'none' : 'flex' }}
                          >
                            <User size={20} />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {employee.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {employee.employeeId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {employee.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {employee.contactNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="capitalize">{employee.role}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {employee.Contracts && employee.Contracts.length > 0 && employee.Contracts[0].department
                        ? employee.Contracts[0].department
                        : <span className="text-gray-400">N/A</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {employee.createdAt ? new Date(employee.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      }) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {employee.Contracts && employee.Contracts.length > 0
                        ? getContractTypeBadge(employee.Contracts[0].contractType)
                        : getContractTypeBadge(null)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getStatusBadge(employee.status, employee.isSuspended)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleViewEmployee(employee.id)}
                        className="text-purple-600 hover:text-purple-900 mr-3"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
