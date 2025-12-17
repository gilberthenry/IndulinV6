'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useNotifications } from '@/context/NotificationContext';
import employeeService from '@/services/employeeService';
import { 
  FileText, 
  CalendarDays, 
  FolderOpen, 
  Bell, 
  AlertTriangle, 
  ArrowRight 
} from 'lucide-react';

interface Contract {
  id: number;
  status: string;
  endDate: string;
}

interface Leave {
  id: number;
  leaveType: string;
  used?: number;
}

interface Document {
  id: number;
  status: string;
  isHRRequested?: boolean;
  documentType?: string;
}

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

export default function EmployeeDashboard() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const { notifications } = useNotifications();
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const [contractsData, leavesData, documentsData] = await Promise.all([
          employeeService.getContracts(),
          employeeService.getLeaves(),
          employeeService.getDocuments(),
        ]);
        setContracts(contractsData || []);
        setLeaves(leavesData || []);
        setDocuments(documentsData || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Calculate stats
  const activeContract = contracts.find(c => c.status === 'active');
  const daysUntilExpiry = activeContract 
    ? Math.ceil((new Date(activeContract.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) 
    : 0;
  
  const leaveCredits = {
    vacation: leaves.filter(l => l.leaveType === 'vacation').reduce((sum, l) => sum + (l.used || 0), 0),
    sick: leaves.filter(l => l.leaveType === 'sick').reduce((sum, l) => sum + (l.used || 0), 0),
    emergency: leaves.filter(l => l.leaveType === 'emergency').reduce((sum, l) => sum + (l.used || 0), 0),
  };
  
  const maxLeave = 15;
  const totalUsedLeaves = Object.values(leaveCredits).reduce((a, b) => a + b, 0);
  const verifiedDocs = documents.filter(d => d.status === 'verified' || d.status === 'Approved').length;
  const pendingDocs = documents.filter(d => d.status === 'pending' || d.status === 'Pending').length;
  const unreadNotifications = notifications.filter(n => !n.read).length;
  
  const requestedDocuments = documents.filter(doc => doc.isHRRequested && doc.status === 'Requested');
  const hasDocumentRequests = requestedDocuments.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Contract Status" 
          value={activeContract ? 'Active' : 'No Active'} 
          subtext={activeContract ? `${daysUntilExpiry} days remaining` : 'Contact HR'}
          icon={<FileText size={24} />}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard 
          title="Leave Credits" 
          value={`${maxLeave - totalUsedLeaves} Left`} 
          subtext={`${totalUsedLeaves} days used this year`}
          icon={<CalendarDays size={24} />}
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <StatCard 
          title="Documents" 
          value={verifiedDocs} 
          subtext={`${pendingDocs} pending verification`}
          icon={<FolderOpen size={24} />}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
        />
        <StatCard 
          title="Notifications" 
          value={unreadNotifications} 
          subtext="Unread messages"
          icon={<Bell size={24} />}
          gradient="bg-gradient-to-br from-orange-500 to-orange-600"
        />
      </div>

      {/* Pending Actions Alert */}
      {hasDocumentRequests && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
                <AlertTriangle size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">Action Required!</h2>
                <p className="text-orange-50">
                  HR has requested {requestedDocuments.length} document{requestedDocuments.length > 1 ? 's' : ''} from you
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/employee/documents')}
              className="px-6 py-3 bg-white text-orange-600 rounded-xl font-bold hover:bg-orange-50 transition-colors shadow-lg flex items-center space-x-2"
            >
              <span>View Now</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/employee/profile"
          className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-500 transition-colors">
              <FileText className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">View Profile</h3>
              <p className="text-sm text-gray-500">Update your information</p>
            </div>
          </div>
        </Link>
        
        <Link
          href="/employee/leaves"
          className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-500 transition-colors">
              <CalendarDays className="h-6 w-6 text-purple-600 group-hover:text-white transition-colors" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Request Leave</h3>
              <p className="text-sm text-gray-500">Apply for time off</p>
            </div>
          </div>
        </Link>
        
        <Link
          href="/employee/documents"
          className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-emerald-100 rounded-xl group-hover:bg-emerald-500 transition-colors">
              <FolderOpen className="h-6 w-6 text-emerald-600 group-hover:text-white transition-colors" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">My Documents</h3>
              <p className="text-sm text-gray-500">Manage your files</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
