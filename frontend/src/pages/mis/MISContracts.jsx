import React, { useState, useEffect } from 'react';
import { FileDown, CalendarClock, History, Settings, RefreshCw, AlertCircle, Filter, Shield, Plus, Trash2, CheckCircle, X } from 'lucide-react';
import misService from '../../services/misService';

export default function MISContracts() {
  const [contracts, setContracts] = useState([]);
  const [expiringContracts, setExpiringContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', contractType: '', department: '' });
  const [showReport, setShowReport] = useState(false);
  const [contractReport, setContractReport] = useState(null);
  const [showRulesConfig, setShowRulesConfig] = useState(false);
  const [contractRules, setContractRules] = useState([
    { id: 1, name: 'Permanent', minDuration: 'Indefinite', maxDuration: 'N/A', requiresApproval: true, autoRenew: false },
    { id: 2, name: 'Contractual', minDuration: '6 months', maxDuration: '3 years', requiresApproval: true, autoRenew: false },
    { id: 3, name: 'Part-Time', minDuration: '3 months', maxDuration: '2 years', requiresApproval: true, autoRenew: false },
    { id: 4, name: 'Job Order', minDuration: '1 month', maxDuration: '1 year', requiresApproval: false, autoRenew: false },
  ]);
  const [newRule, setNewRule] = useState({ name: '', minDuration: '', maxDuration: '', requiresApproval: true, autoRenew: false });
  const [editingRule, setEditingRule] = useState(null);

  useEffect(() => {
    fetchContracts();
    fetchExpiringContracts();
  }, [filter]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const data = await misService.getContracts(filter);
      setContracts(data);
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpiringContracts = async () => {
    try {
      const data = await misService.getExpiringContracts(30);
      setExpiringContracts(data);
    } catch (error) {
      console.error('Error fetching expiring contracts:', error);
    }
  };

  const fetchContractReport = async () => {
    try {
      const data = await misService.getContractReport();
      setContractReport(data);
      setShowReport(true);
    } catch (error) {
      console.error('Error fetching contract report:', error);
    }
  };

  const handleExportExcel = () => {
    const csvContent = [
      ['Employee ID', 'Employee Name', 'Contract Type', 'Position', 'Department', 'Start Date', 'End Date', 'Status'],
      ...contracts.map(c => [
        c.Employee?.employeeId || c.employeeId || 'N/A',
        c.Employee?.fullName || 'N/A',
        c.contractType || 'N/A',
        c.position || 'N/A',
        c.department || 'N/A',
        c.startDate ? new Date(c.startDate).toLocaleDateString() : 'N/A',
        c.endDate ? new Date(c.endDate).toLocaleDateString() : 'N/A',
        c.status || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contracts_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'terminated': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleAddRule = () => {
    if (!newRule.name || !newRule.minDuration || !newRule.maxDuration) {
      alert('Please fill in all fields');
      return;
    }
    setContractRules([...contractRules, { ...newRule, id: Date.now() }]);
    setNewRule({ name: '', minDuration: '', maxDuration: '', requiresApproval: true, autoRenew: false });
    alert('Contract rule added successfully!');
  };

  const handleRemoveRule = (id) => {
    if (confirm('Are you sure you want to remove this contract rule?')) {
      setContractRules(contractRules.filter(rule => rule.id !== id));
      alert('Contract rule removed successfully!');
    }
  };

  const handleUpdateRule = (id, updates) => {
    setContractRules(contractRules.map(rule => 
      rule.id === id ? { ...rule, ...updates } : rule
    ));
  };

  const handleSaveRules = () => {
    // In a real implementation, this would save to the backend
    alert('Contract rules saved successfully!');
    setShowRulesConfig(false);
  };

  return (
    <div className="p-8 bg-gray-50/50 min-h-screen space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Contracts Overview</h1>
          <p className="text-sm text-gray-600 mt-1">
            <Shield size={16} className="inline mr-1" />
            MIS Access: PLUS add/remove contract rules (optional)
          </p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setShowRulesConfig(!showRulesConfig)}
            className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Shield size={20} className="mr-2" />
            {showRulesConfig ? 'Hide Rules' : 'Contract Rules'}
          </button>
          <button 
            onClick={fetchContracts}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw size={20} className="mr-2" />
            Refresh
          </button>
          <button 
            onClick={fetchContractReport}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Settings size={20} className="mr-2" />
            View Report
          </button>
          <button 
            onClick={handleExportExcel}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FileDown size={20} className="mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Contract Rules Configuration (MIS Only) */}
      {showRulesConfig && (
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-300 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Shield size={24} className="text-emerald-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-800">Contract Rules Configuration</h2>
            </div>
          </div>

          {/* Existing Rules */}
          <div className="bg-white rounded-lg p-5 shadow mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Current Contract Rules</h3>
            <div className="space-y-3">
              {contractRules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-200">
                  {editingRule === rule.id ? (
                    <div className="flex-1 grid grid-cols-5 gap-3 items-center">
                      <input
                        type="text"
                        value={rule.name}
                        onChange={(e) => handleUpdateRule(rule.id, { name: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Rule Name"
                      />
                      <input
                        type="text"
                        value={rule.minDuration}
                        onChange={(e) => handleUpdateRule(rule.id, { minDuration: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Min Duration"
                      />
                      <input
                        type="text"
                        value={rule.maxDuration}
                        onChange={(e) => handleUpdateRule(rule.id, { maxDuration: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Max Duration"
                      />
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={rule.requiresApproval}
                          onChange={(e) => handleUpdateRule(rule.id, { requiresApproval: e.target.checked })}
                          className="w-4 h-4 text-emerald-600 rounded"
                        />
                        <span className="text-xs text-gray-600">Approval</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={rule.autoRenew}
                          onChange={(e) => handleUpdateRule(rule.id, { autoRenew: e.target.checked })}
                          className="w-4 h-4 text-emerald-600 rounded"
                        />
                        <span className="text-xs text-gray-600">Auto-Renew</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <span className="font-semibold text-gray-800">{rule.name}</span>
                        <span className="text-sm text-gray-600">
                          Duration: {rule.minDuration} - {rule.maxDuration}
                        </span>
                        {rule.requiresApproval && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Approval Required</span>
                        )}
                        {rule.autoRenew && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Auto-Renew</span>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex space-x-2 ml-4">
                    {editingRule === rule.id ? (
                      <button
                        onClick={() => setEditingRule(null)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Save"
                      >
                        <CheckCircle size={20} />
                      </button>
                    ) : (
                      <button
                        onClick={() => setEditingRule(rule.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Settings size={20} />
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveRule(rule.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add New Rule */}
          <div className="bg-white rounded-lg p-5 shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Add New Contract Rule</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rule Name</label>
                <input
                  type="text"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g., Temporary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Duration</label>
                <input
                  type="text"
                  value={newRule.minDuration}
                  onChange={(e) => setNewRule({ ...newRule, minDuration: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g., 1 month"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Duration</label>
                <input
                  type="text"
                  value={newRule.maxDuration}
                  onChange={(e) => setNewRule({ ...newRule, maxDuration: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g., 6 months"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newRule.requiresApproval}
                      onChange={(e) => setNewRule({ ...newRule, requiresApproval: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded mr-2"
                    />
                    <span className="text-sm text-gray-700">Requires Approval</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newRule.autoRenew}
                      onChange={(e) => setNewRule({ ...newRule, autoRenew: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded mr-2"
                    />
                    <span className="text-sm text-gray-700">Auto-Renew</span>
                  </label>
                </div>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleAddRule}
                  className="w-full flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Plus size={20} className="mr-2" />
                  Add Rule
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => setShowRulesConfig(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveRules}
              className="flex items-center px-6 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-md hover:shadow-lg"
            >
              <CheckCircle size={18} className="mr-2" />
              Save Configuration
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Filter size={20} className="text-gray-500 mr-3" />
            <h2 className="text-lg font-semibold text-gray-700">Filters</h2>
          </div>
          {(filter.status || filter.contractType || filter.department) && (
            <button
              onClick={() => setFilter({ status: '', contractType: '', department: '' })}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contract Type</label>
            <select
              value={filter.contractType}
              onChange={(e) => setFilter({ ...filter, contractType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="permanent">Permanent</option>
              <option value="contractual">Contractual</option>
              <option value="part-time">Part-time</option>
              <option value="job-order">Job Order</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <input
              type="text"
              value={filter.department}
              onChange={(e) => setFilter({ ...filter, department: e.target.value })}
              placeholder="Filter by department"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Expiring Contracts Alert */}
      {expiringContracts.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg shadow-sm p-6">
          <div className="flex items-start">
            <AlertCircle size={24} className="text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-yellow-800 mb-2">
                {expiringContracts.length} Contract(s) Expiring Soon
              </h2>
              <div className="space-y-2">
                {expiringContracts.slice(0, 3).map(contract => (
                  <div key={contract.id} className="text-sm text-yellow-700 bg-yellow-100 rounded p-2">
                    <div className="font-medium">{contract.Employee?.fullName || 'N/A'}</div>
                    <div className="flex flex-wrap gap-2 mt-1 text-xs">
                      <span className="font-medium">Position:</span> {contract.position || contract.type || 'N/A'}
                      {contract.department && (
                        <><span className="mx-1">|</span><span className="font-medium">Dept:</span> {contract.department}</>
                      )}
                      {contract.contractType && (
                        <><span className="mx-1">|</span><span className="font-medium">Type:</span> {contract.contractType.replace('-', ' ')}</>
                      )}
                      <span className="mx-1">|</span><span className="font-medium">Expires:</span> {formatDate(contract.endDate)}
                    </div>
                    {contract.projectDetails && (
                      <div className="text-xs mt-1 italic">{contract.projectDetails}</div>
                    )}
                  </div>
                ))}
                {expiringContracts.length > 3 && (
                  <p className="text-sm text-yellow-600 italic mt-2">
                    +{expiringContracts.length - 3} more contracts expiring soon
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Contracts Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <History size={20} className="text-gray-500 mr-3" />
            <h2 className="text-xl font-semibold text-gray-700">All Contracts</h2>
          </div>
          <span className="text-sm text-gray-600">
            Total: <span className="font-semibold text-gray-800">{contracts.length}</span> contracts
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw size={32} className="animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Loading contracts...</span>
          </div>
        ) : contracts.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle size={48} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600">No contracts found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {contracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{contract.Employee?.fullName || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{contract.Employee?.employeeId || contract.employeeId || ''}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="text-sm text-gray-700 capitalize">
                        {contract.contractType?.replace('-', ' ') || 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{contract.position || 'N/A'}</div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{contract.department || 'N/A'}</div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(contract.startDate)}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(contract.endDate)}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(contract.status)}`}>
                        {contract.status || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Contract Report Modal */}
      {showReport && contractReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Contract Report</h2>
              <button 
                onClick={() => setShowReport(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 font-medium">Total Contracts</p>
                <p className="text-3xl font-bold text-blue-700">{contractReport.totalContracts || 0}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600 font-medium">Active Contracts</p>
                <p className="text-3xl font-bold text-green-700">{contractReport.activeContracts || 0}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-sm text-red-600 font-medium">Expired Contracts</p>
                <p className="text-3xl font-bold text-red-700">{contractReport.expiredContracts || 0}</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-4">
                <p className="text-sm text-amber-600 font-medium">Expiring Soon</p>
                <p className="text-3xl font-bold text-amber-700">{contractReport.expiringSoon || 0}</p>
              </div>
            </div>
            {contractReport.byType && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">By Contract Type</h3>
                <div className="space-y-2">
                  {Object.entries(contractReport.byType).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                      <span className="text-sm font-medium text-gray-700 capitalize">{type.replace('-', ' ')}</span>
                      <span className="text-sm font-bold text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
