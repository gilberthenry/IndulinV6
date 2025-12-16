import React, { useState, useEffect } from 'react';
import misService from '../../services/misService';
import DataTable from '../../components/DataTable';
import { Users, UserCog, ClipboardList, Server, Database, ShieldCheck, Save } from 'lucide-react';

export default function MISDashboard() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [systemReport, setSystemReport] = useState({});
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    async function fetchData() {
      setAuditLogs(await misService.getAuditLogs());
      setSystemReport(await misService.getSystemReport());
      setAccounts(await misService.getAccounts());
    }
    fetchData();
  }, []);

  const handleBackup = async () => {
    await misService.createBackup();
    alert("Backup completed successfully!");
  };

  const handleUpdateAccount = async (id, updates) => {
    await misService.updateAccount(id, updates);
    alert("Account updated!");
  };

  // Calculate stats
  const totalAccounts = accounts.length;
  const activeAccounts = accounts.filter(a => a.status === 'active').length;
  const disabledAccounts = accounts.filter(a => a.status === 'disabled').length;
  const recentAuditLogs = auditLogs.slice(0, 10).length;
  const totalEmployees = systemReport.totalEmployees || 0;
  const activeEmployees = systemReport.activeEmployees || 0;

  const StatCard = ({ title, value, subtext, icon, gradient }) => (
    <div className={`rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-300 ${gradient}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium opacity-90 mb-1">{title}</p>
          <h3 className="text-3xl font-bold">{value}</h3>
          <p className="text-xs mt-2 opacity-75 bg-white/20 inline-block px-2 py-1 rounded-lg">{subtext}</p>
        </div>
        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8 bg-gray-50/50 min-h-screen space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Employees" 
          value={totalEmployees} 
          subtext={`${activeEmployees} Active Users`}
          icon={<Users size={24} />}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
        />
        <StatCard 
          title="User Accounts" 
          value={totalAccounts} 
          subtext={`${disabledAccounts} Disabled Accounts`}
          icon={<UserCog size={24} />}
          gradient="bg-gradient-to-br from-teal-500 to-teal-600"
        />
        <StatCard 
          title="Audit Logs" 
          value={auditLogs.length} 
          subtext={`${recentAuditLogs} Recent Events`}
          icon={<ClipboardList size={24} />}
          gradient="bg-gradient-to-br from-cyan-500 to-cyan-600"
        />
        <StatCard 
          title="System Status" 
          value="Healthy" 
          subtext="All services operational"
          icon={<Server size={24} />}
          gradient="bg-gradient-to-br from-green-500 to-green-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* System Backup */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-800">System Backup</h2>
                <p className="text-sm text-gray-500 mt-1">Create a full backup of the database and system files.</p>
              </div>
              <button
                onClick={handleBackup}
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium transition-colors flex items-center space-x-2 shadow-lg shadow-emerald-200"
              >
                <Save size={20} />
                <span>Run Backup Now</span>
              </button>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800">Recent Audit Logs</h2>
              <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">View All</button>
            </div>
            <DataTable data={auditLogs.slice(0, 10)} fields={['id', 'userId', 'role', 'action', 'timestamp']} />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* System Health */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">System Health</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">Database</span>
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">ONLINE</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">API Server</span>
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">ONLINE</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">File Storage</span>
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">ONLINE</span>
              </div>
            </div>
          </div>

          {/* Account Management */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Account Actions</h3>
            <div className="space-y-3">
              {accounts.slice(0, 3).map(acc => (
                <div key={acc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{acc.fullName}</p>
                    <p className="text-xs text-gray-500">{acc.role}</p>
                  </div>
                  <button
                    onClick={() => handleUpdateAccount(acc.id, { status: 'disabled' })}
                    className="text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                  >
                    Disable
                  </button>
                </div>
              ))}
              <button className="w-full py-2 text-sm text-center text-gray-500 hover:text-gray-700">View All Accounts</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}