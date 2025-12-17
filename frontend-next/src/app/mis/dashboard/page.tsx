'use client';

import React, { useEffect, useState } from 'react';
import misService from '@/services/misService';
import { 
  Users, 
  Database, 
  Activity, 
  Shield,
  Server,
  Clock
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon: React.ReactNode;
  gradient: string;
}

const StatCard = ({ title, value, subtext, icon, gradient }: StatCardProps) => (
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

export default function MISDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBackups: 0,
    auditLogCount: 0,
    systemHealth: 'Good',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const dashboardStats = await misService.getDashboardStats();
        setStats(dashboardStats);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers} 
          subtext="System accounts"
          icon={<Users size={24} />}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
        />
        <StatCard 
          title="Backups" 
          value={stats.totalBackups} 
          subtext="Available backups"
          icon={<Database size={24} />}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard 
          title="Audit Logs" 
          value={stats.auditLogCount} 
          subtext="Total entries"
          icon={<Activity size={24} />}
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <StatCard 
          title="System Health" 
          value={stats.systemHealth} 
          subtext="All systems operational"
          icon={<Shield size={24} />}
          gradient="bg-gradient-to-br from-green-500 to-green-600"
        />
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">System Status</h3>
            <Server className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-700">Database Connection</span>
              </div>
              <span className="font-semibold text-emerald-600">Connected</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-700">API Server</span>
              </div>
              <span className="font-semibold text-emerald-600">Running</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-700">Socket.IO</span>
              </div>
              <span className="font-semibold text-emerald-600">Active</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Recent Actions</h3>
            <Clock className="h-5 w-5 text-blue-500" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Database className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm text-gray-600">Last backup created</span>
              </div>
              <span className="text-sm text-gray-500">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Activity className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-sm text-gray-600">System audit completed</span>
              </div>
              <span className="text-sm text-gray-500">1 day ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
