import React, { useEffect, useState, useContext } from 'react';
import { ShieldCheck, ShieldOff, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import misService from '../../services/misService';
import { ToastContext } from '../../context/ToastContext';

export default function MISAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const { showToast } = useContext(ToastContext);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      console.log('Fetching accounts...');
      const data = await misService.getAccounts();
      console.log('Accounts fetched:', data);
      setAccounts(data || []);
    } catch (err) {
      console.error('Error fetching accounts:', err);
      showToast('Failed to fetch accounts: ' + err.message, 'error');
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDisableAccount = async () => {
    if (!selectedAccount) return;

    try {
      const response = await misService.disableAccount(selectedAccount.id);
      showToast('Account disabled successfully', 'success');
      
      // Update the account in the list
      setAccounts(accounts.map(acc => 
        acc.id === selectedAccount.id 
          ? { ...acc, isSuspended: true, status: 'terminated', accountStatus: 'DEACTIVATED' }
          : acc
      ));
      
      setShowConfirmModal(false);
      setSelectedAccount(null);
    } catch (err) {
      showToast('Failed to disable account: ' + err.message, 'error');
    }
  };

  const handleReactivateAccount = async (account) => {
    try {
      const response = await misService.reactivateAccount(account.id);
      showToast('Account reactivated successfully', 'success');
      
      // Update the account in the list
      setAccounts(accounts.map(acc => 
        acc.id === account.id 
          ? { ...acc, isSuspended: false, status: 'active', accountStatus: 'ACTIVE' }
          : acc
      ));
    } catch (err) {
      showToast('Failed to reactivate account: ' + err.message, 'error');
    }
  };

  const openConfirmModal = (account) => {
    setSelectedAccount(account);
    setShowConfirmModal(true);
  };

  const getStatusBadge = (accountStatus) => {
    const statusConfig = {
      ACTIVE: { 
        color: 'bg-green-100 text-green-800 border border-green-200', 
        icon: <CheckCircle size={16} className="mr-1" /> 
      },
      SUSPENDED: { 
        color: 'bg-yellow-100 text-yellow-800 border border-yellow-200', 
        icon: <AlertCircle size={16} className="mr-1" /> 
      },
      DEACTIVATED: { 
        color: 'bg-red-100 text-red-800 border border-red-200', 
        icon: <XCircle size={16} className="mr-1" /> 
      },
    };

    const config = statusConfig[accountStatus] || statusConfig.SUSPENDED;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        {config.icon}
        {accountStatus}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      employee: 'bg-blue-100 text-blue-800',
      hr: 'bg-purple-100 text-purple-800',
      mis: 'bg-emerald-100 text-emerald-800',
    };

    // Handle null or undefined roles
    if (!role) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
          NO ROLE
        </span>
      );
    }

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${roleConfig[role] || 'bg-gray-100 text-gray-800'}`}>
        {role.toUpperCase()}
      </span>
    );
  };

  console.log('MISAccounts render - loading:', loading, 'accounts:', accounts.length, 'data:', accounts.slice(0, 2));

  if (loading) {
    return (
      <div style={{ padding: '2rem', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
          Loading Accounts...
        </h1>
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 0' }}>
            <div style={{ width: '3rem', height: '3rem', border: '3px solid #10b981', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937' }}>Accounts Management</h1>
          <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>Manage employee accounts and access controls</p>
        </div>
        <div style={{ fontSize: '0.875rem', color: '#6b7280', backgroundColor: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
          Total Accounts: <span style={{ fontWeight: '600', color: '#10b981' }}>{accounts.length}</span>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'linear-gradient(to right, #059669, #047857)', color: 'white' }}>
              <tr>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>Employee ID</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>Name</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>Email</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>Role</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: 'white' }}>
              {accounts.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
                    No accounts found
                  </td>
                </tr>
              ) : (
                accounts.map((account) => (
                  <tr key={account.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#111827', fontWeight: '500' }}>
                      {account.employeeId}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#111827' }}>
                      {account.fullName}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                      {account.email}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>
                      {getRoleBadge(account.role)}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>
                      {getStatusBadge(account.accountStatus)}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                        {account.accountStatus === 'DEACTIVATED' ? (
                          <button
                            onClick={() => handleReactivateAccount(account)}
                            style={{ display: 'inline-flex', alignItems: 'center', padding: '0.5rem 1rem', backgroundColor: '#16a34a', color: 'white', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500' }}
                          >
                            <CheckCircle size={16} style={{ marginRight: '0.25rem' }} />
                            Reactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => openConfirmModal(account)}
                            style={{ display: 'inline-flex', alignItems: 'center', padding: '0.5rem 1rem', backgroundColor: '#dc2626', color: 'white', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500' }}
                          >
                            <ShieldOff size={16} style={{ marginRight: '0.25rem' }} />
                            Disable
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <AlertCircle className="text-red-600" size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
              Disable Account
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to disable the account for{' '}
              <span className="font-semibold text-gray-900">{selectedAccount?.fullName}</span>?
              <br />
              <span className="text-sm">This user will no longer be able to access the system.</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedAccount(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDisableAccount}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Disable Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

