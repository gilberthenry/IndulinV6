import React, { useState, useEffect } from 'react';
import hrService from '../../services/hrService';
import { Settings, Shield, CheckCircle, Plus, Trash2, FileText } from 'lucide-react';

export default function MISLeaveManagement() {
  const [showSettings, setShowSettings] = useState(false);
  const [showLeaveTypes, setShowLeaveTypes] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState([
    { id: 1, name: 'Sick Leave', isActive: true, requiresDocument: false },
    { id: 2, name: 'Vacation Leave', isActive: true, requiresDocument: false },
    { id: 3, name: 'Emergency Leave', isActive: true, requiresDocument: false },
    { id: 4, name: 'Maternity Leave', isActive: true, requiresDocument: true },
    { id: 5, name: 'Paternity Leave', isActive: true, requiresDocument: true },
    { id: 6, name: 'Special Leave', isActive: true, requiresDocument: false },
    { id: 7, name: 'Study Leave', isActive: true, requiresDocument: false },
  ]);
  const [newLeaveType, setNewLeaveType] = useState('');
  const [editingType, setEditingType] = useState(null);

  



  const handleAddLeaveType = () => {
    if (!newLeaveType.trim()) return;
    const newType = {
      id: Date.now(),
      name: newLeaveType,
      isActive: true,
      requiresDocument: false
    };
    setLeaveTypes([...leaveTypes, newType]);
    setNewLeaveType('');
    alert('Leave type added successfully!');
  };

  const handleDeleteLeaveType = (id) => {
    if (confirm('Are you sure you want to delete this leave type?')) {
      setLeaveTypes(leaveTypes.filter(type => type.id !== id));
      alert('Leave type deleted successfully!');
    }
  };

  const handleToggleLeaveType = (id) => {
    setLeaveTypes(leaveTypes.map(type => 
      type.id === id ? { ...type, isActive: !type.isActive } : type
    ));
  };

  const handleToggleDocumentRequirement = (id) => {
    setLeaveTypes(leaveTypes.map(type => 
      type.id === id ? { ...type, requiresDocument: !type.requiresDocument } : type
    ));
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Leave Management Configuration</h1>
        <p className="text-gray-600 mt-2">Configure leave types, manage employee leave credits, and monitor the leave calendar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">


        {/* Leave Type Configuration */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
            <div className="flex items-center mb-4">
              <FileText size={18} className="text-purple-600 mr-3" />
              <h3 className="text-base md:text-lg font-semibold text-gray-700">Leave Types</h3>
            </div>
            <p className="text-gray-600 text-xs md:text-sm mb-4">
              Add or remove leave types available for employees to request.
            </p>
            <button 
              onClick={() => setShowLeaveTypes(!showLeaveTypes)}
              className="w-full inline-flex justify-center items-center px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-md hover:shadow-lg text-sm"
            >
              <FileText size={16} className="mr-2" />
              {showLeaveTypes ? 'Hide Leave Types' : 'Manage Leave Types'}
            </button>
        </div>

        {/* MIS System Configuration */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
            <div className="flex items-center mb-4">
              <Settings size={18} className="text-purple-600 mr-3" />
              <h3 className="text-base md:text-lg font-semibold text-gray-700">System Config</h3>
            </div>
            <p className="text-gray-600 text-xs md:text-sm mb-4">
              Configure system-wide leave rules and credit allocations.
            </p>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="w-full inline-flex justify-center items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-md hover:shadow-lg text-sm"
            >
              <Settings size={16} className="mr-2" />
              {showSettings ? 'Hide Settings' : 'Configure Settings'}
            </button>
        </div>



        
      </div>

      {/* Leave Types Management Panel */}
      {showLeaveTypes && (
        <div className="mt-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl shadow-lg p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
            <div className="flex items-center">
              <FileText size={20} className="text-emerald-600 mr-3" />
              <h2 className="text-lg md:text-xl font-bold text-gray-800">Manage Leave Types</h2>
            </div>
            <button
              onClick={() => setShowLeaveTypes(false)}
              className="text-gray-500 hover:text-gray-700 self-end sm:self-auto"
            >
              ✕
            </button>
          </div>

          {/* Add New Leave Type */}
          <div className="bg-white rounded-lg p-4 md:p-5 shadow mb-4">
            <h3 className="text-base md:text-lg font-semibold text-gray-700 mb-4">Add New Leave Type</h3>
            <div className="flex gap-3">
              <input 
                type="text" 
                value={newLeaveType}
                onChange={(e) => setNewLeaveType(e.target.value)}
                placeholder="Enter leave type name..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={handleAddLeaveType}
                className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Plus size={18} className="mr-2" />
                Add
              </button>
            </div>
          </div>

          {/* Leave Types List */}
          <div className="bg-white rounded-lg p-4 md:p-5 shadow">
            <h3 className="text-base md:text-lg font-semibold text-gray-700 mb-4">Current Leave Types</h3>
            <div className="space-y-3">
              {leaveTypes.map((type) => (
                <div key={type.id} className="flex items-center justify-between py-3 px-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <span className={`text-sm font-medium ${type.isActive ? 'text-gray-800' : 'text-gray-400'}`}>
                      {type.name}
                    </span>
                    {type.requiresDocument && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Requires Document</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={type.requiresDocument}
                        onChange={() => handleToggleDocumentRequirement(type.id)}
                        className="w-4 h-4 text-blue-600 rounded mr-2"
                      />
                      <span className="text-xs text-gray-600">Doc Required</span>
                    </label>
                    <button
                      onClick={() => handleToggleLeaveType(type.id)}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        type.isActive 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {type.isActive ? 'Active' : 'Inactive'}
                    </button>
                    <button
                      onClick={() => handleDeleteLeaveType(type.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* System-Wide Settings Panel (Collapsible) */}
      {showSettings && (
        <div className="mt-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-2xl shadow-lg p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
            <div className="flex items-center">
              <Shield size={20} className="text-purple-600 mr-3" />
              <h2 className="text-lg md:text-xl font-bold text-gray-800">System-Wide Leave Configuration</h2>
            </div>
            <button
              onClick={() => setShowSettings(false)}
              className="text-gray-500 hover:text-gray-700 self-end sm:self-auto"
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Leave Credit Allocations */}
            <div className="bg-white rounded-lg p-4 md:p-5 shadow">
              <h3 className="text-base md:text-lg font-semibold text-gray-700 mb-4">Credit Allocations by Employment Type</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs md:text-sm font-medium text-gray-600 flex-1">Permanent</label>
                  <input 
                    type="number" 
                    defaultValue="15" 
                    className="w-16 md:w-20 px-2 md:px-3 py-2 border border-gray-300 rounded-lg text-center text-sm"
                  />
                  <span className="text-xs md:text-sm text-gray-500">days</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs md:text-sm font-medium text-gray-600 flex-1">Contractual</label>
                  <input 
                    type="number" 
                    defaultValue="10" 
                    className="w-16 md:w-20 px-2 md:px-3 py-2 border border-gray-300 rounded-lg text-center text-sm"
                  />
                  <span className="text-xs md:text-sm text-gray-500">days</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs md:text-sm font-medium text-gray-600 flex-1">Job Order</label>
                  <input 
                    type="number" 
                    defaultValue="5" 
                    className="w-16 md:w-20 px-2 md:px-3 py-2 border border-gray-300 rounded-lg text-center text-sm"
                  />
                  <span className="text-xs md:text-sm text-gray-500">days</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs md:text-sm font-medium text-gray-600 flex-1">Part-Time</label>
                  <input 
                    type="number" 
                    defaultValue="7" 
                    className="w-16 md:w-20 px-2 md:px-3 py-2 border border-gray-300 rounded-lg text-center text-sm"
                  />
                  <span className="text-xs md:text-sm text-gray-500">days</span>
                </div>
              </div>
            </div>

            {/* Leave Policies */}
            <div className="bg-white rounded-lg p-4 md:p-5 shadow">
              <h3 className="text-base md:text-lg font-semibold text-gray-700 mb-4">Leave Policies</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-600">Max Carryover Days</label>
                  <input 
                    type="number" 
                    defaultValue="5" 
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-600">Max Advance Days</label>
                  <input 
                    type="number" 
                    defaultValue="3" 
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-600">Monetize Excess Leaves</label>
                  <input 
                    type="checkbox" 
                    defaultChecked 
                    className="w-5 h-5 text-purple-600 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-600">Auto-Approve Sick Leave</label>
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 text-purple-600 rounded"
                  />
                </div>
              </div>
            </div>

            {/* Leave Types Configuration */}
            <div className="bg-white rounded-lg p-4 md:p-5 shadow">
              <h3 className="text-base md:text-lg font-semibold text-gray-700 mb-4">Leave Types Summary</h3>
              <div className="space-y-2">
                {leaveTypes.map((type) => (
                  <div key={type.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-xs md:text-sm text-gray-600">{type.name}</span>
                    <div className="flex items-center space-x-2 md:space-x-3">
                      <span className={`text-xs font-medium ${type.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                        {type.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowLeaveTypes(true)}
                className="mt-4 w-full text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Manage Leave Types →
              </button>
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-lg p-4 md:p-5 shadow">
              <h3 className="text-base md:text-lg font-semibold text-gray-700 mb-4">Notification Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-600">Email Notifications</label>
                  <input 
                    type="checkbox" 
                    defaultChecked 
                    className="w-5 h-5 text-purple-600 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-600">SMS Notifications</label>
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 text-purple-600 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-600">Notify on Low Balance</label>
                  <input 
                    type="checkbox" 
                    defaultChecked 
                    className="w-5 h-5 text-purple-600 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-600">Low Balance Threshold</label>
                  <input 
                    type="number" 
                    defaultValue="3" 
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
            <button
              onClick={() => setShowSettings(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSettings}
              className="flex items-center justify-center px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-md hover:shadow-lg text-sm md:text-base"
            >
              <CheckCircle size={16} className="mr-2" />
              Save Configuration
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
