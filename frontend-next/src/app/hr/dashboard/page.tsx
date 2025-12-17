'use client';

import React, { useEffect, useState } from 'react';
import hrService from '@/services/hrService';
import { 
  Users, 
  FileText, 
  CalendarDays, 
  Award,
  TrendingUp,
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

export default function HRDashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeContracts: 0,
    pendingLeaves: 0,
    pendingCertificates: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const dashboardStats = await hrService.getDashboardStats();
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Employees" 
          value={stats.totalEmployees} 
          subtext="Active workforce"
          icon={<Users size={24} />}
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <StatCard 
          title="Active Contracts" 
          value={stats.activeContracts} 
          subtext="Currently active"
          icon={<FileText size={24} />}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard 
          title="Pending Leaves" 
          value={stats.pendingLeaves} 
          subtext="Awaiting approval"
          icon={<CalendarDays size={24} />}
          gradient="bg-gradient-to-br from-amber-500 to-amber-600"
        />
        <StatCard 
          title="Certificate Requests" 
          value={stats.pendingCertificates} 
          subtext="Pending review"
          icon={<Award size={24} />}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
            <TrendingUp className="h-5 w-5 text-purple-500" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-sm text-gray-600">New employee registrations</span>
              </div>
              <span className="font-semibold text-gray-900">+3 this week</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm text-gray-600">Contracts expiring soon</span>
              </div>
              <span className="font-semibold text-amber-600">2 in 30 days</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Pending Actions</h3>
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <CalendarDays className="h-4 w-4 text-amber-600" />
                </div>
                <span className="text-sm text-gray-700">Leave requests awaiting</span>
              </div>
              <span className="font-semibold text-amber-600">{stats.pendingLeaves}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Award className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm text-gray-700">Certificate requests</span>
              </div>
              <span className="font-semibold text-blue-600">{stats.pendingCertificates}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
