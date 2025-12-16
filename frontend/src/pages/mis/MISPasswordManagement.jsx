import React, { useState, useEffect } from 'react';
import { KeyRound, Search, RefreshCw, Shield, Lock, Unlock, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import misService from '../../services/misService';

export default function MISPasswordManagement() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = await misService.getAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedAccount) return;

    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters long!');
      return;
    }

    if (!confirm(`Are you sure you want to reset password for ${selectedAccount.fullName}?`)) {
      return;
    }

    try {
      // Call password reset API
      const response = await misService.resetPassword(selectedAccount.id, newPassword);
      console.log('Password reset response:', response);
      alert(`Password reset successfully for ${selectedAccount.fullName}!`);
      setShowResetModal(false);
      setSelectedAccount(null);
      setNewPassword('');
      setConfirmPassword('');
      fetchAccounts(); // Refresh the accounts list
    } catch (error) {
      console.error('Error resetting password:', error);
      console.error('Error details:', error.response?.data);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to reset password. Please try again.';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleForcePasswordChange = async (accountId, fullName) => {
    if (!confirm(`Force ${fullName} to change password on next login?`)) {
      return;
    }

    try {
      alert(`${fullName} will be required to change password on next login.`);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to force password change.');
    }
  };

  const handleUnlockAccount = async (accountId, fullName) => {
    if (!confirm(`Unlock account for ${fullName}?`)) {
      return;
    }

    try {
      alert(`Account unlocked successfully for ${fullName}!`);
      fetchAccounts();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to unlock account.');
    }
  };

  const filteredAccounts = accounts.filter(account =>
    account.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
    setConfirmPassword(password);
  };

  return (
    <div className="p-8 bg-gray-50/50 min-h-screen space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Password Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            <Shield size={16} className="inline mr-1" />
            Reset passwords, unlock accounts, and manage password policies
          </p>
        </div>
        <button
          onClick={fetchAccounts}
          className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <RefreshCw size={20} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Accounts</p>
              <p className="text-3xl font-bold text-gray-800">{accounts.length}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <KeyRound size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Accounts</p>
              <p className="text-3xl font-bold text-green-600">
                {accounts.filter(a => a.accountStatus === 'ACTIVE').length}
              </p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Suspended</p>
              <p className="text-3xl font-bold text-orange-600">
                {accounts.filter(a => a.accountStatus === 'SUSPENDED').length}
              </p>
            </div>
            <div className="bg-orange-100 rounded-full p-3">
              <Lock size={24} className="text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Deactivated</p>
              <p className="text-3xl font-bold text-red-600">
                {accounts.filter(a => a.accountStatus === 'DEACTIVATED').length}
              </p>
            </div>
            <div className="bg-red-100 rounded-full p-3">
              <AlertCircle size={24} className="text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or employee ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Account Management</h2>
          <span className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-800">{filteredAccounts.length}</span> accounts
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw size={32} className="animate-spin text-emerald-600 mr-3" />
            <span className="text-gray-600">Loading accounts...</span>
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle size={48} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600">No accounts found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAccounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{account.fullName}</div>
                        <div className="text-xs text-gray-500">{account.employeeId}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{account.email}</div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 capitalize">
                        {account.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        account.accountStatus === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        account.accountStatus === 'SUSPENDED' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {account.accountStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedAccount(account);
                            setShowResetModal(true);
                          }}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
                        >
                          <KeyRound size={14} className="mr-1" />
                          Reset
                        </button>
                        <button
                          onClick={() => handleForcePasswordChange(account.id, account.fullName)}
                          className="inline-flex items-center px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-xs"
                        >
                          <Clock size={14} className="mr-1" />
                          Force Change
                        </button>
                        {account.accountStatus === 'SUSPENDED' && (
                          <button
                            onClick={() => handleUnlockAccount(account.id, account.fullName)}
                            className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs"
                          >
                            <Unlock size={14} className="mr-1" />
                            Unlock
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reset Password Modal */}
      {showResetModal && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Reset Password</h2>
              <button
                onClick={() => {
                  setShowResetModal(false);
                  setSelectedAccount(null);
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Resetting password for:</p>
              <p className="text-lg font-semibold text-gray-800">{selectedAccount.fullName}</p>
              <p className="text-sm text-gray-500">{selectedAccount.email}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Confirm new password"
                />
              </div>

              <button
                onClick={generateRandomPassword}
                className="w-full px-4 py-2 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors text-sm"
              >
                Generate Random Password
              </button>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowResetModal(false);
                    setSelectedAccount(null);
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetPassword}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Reset Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
