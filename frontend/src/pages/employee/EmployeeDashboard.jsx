import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import employeeService from '../../services/employeeService';
import { NotificationContext } from '../../context/NotificationContext';
import DataTable from '../../components/DataTable';
import { FileText, CalendarDays, FolderOpen, Bell, User, PlusCircle, Upload, AlertTriangle, ArrowRight } from 'lucide-react';

export default function EmployeeDashboard() {
  const [profile, setProfile] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [documents, setDocuments] = useState([]);
  const { notifications } = useContext(NotificationContext);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      setProfile(await employeeService.getProfile());
      setContracts(await employeeService.getAllContracts());
      setLeaves(await employeeService.getLeaves());
      setDocuments(await employeeService.getDocuments());
    }
    fetchData();
  }, []);

  // Calculate stats
  const activeContract = contracts.find(c => c.status === 'active');
  const daysUntilExpiry = activeContract ? Math.ceil((new Date(activeContract.endDate) - new Date()) / (1000 * 60 * 60 * 24)) : 0;
  
  const leaveCredits = {
    vacation: leaves.filter(l => l.leaveType === 'vacation').reduce((sum, l) => sum + (l.used || 0), 0),
    sick: leaves.filter(l => l.leaveType === 'sick').reduce((sum, l) => sum + (l.used || 0), 0),
    emergency: leaves.filter(l => l.leaveType === 'emergency').reduce((sum, l) => sum + (l.used || 0), 0),
  };
  
  const maxLeave = 15; // Assuming 15 days max for calculation
  const totalUsedLeaves = Object.values(leaveCredits).reduce((a, b) => a + b, 0);
  const verifiedDocs = documents.filter(d => d.status === 'verified' || d.status === 'Approved').length;
  const pendingDocs = documents.filter(d => d.status === 'pending' || d.status === 'Pending').length;
  const unreadNotifications = notifications.filter(n => !n.read).length;
  
  // HR Document Requests
  const requestedDocuments = documents.filter(doc => doc.isHRRequested && doc.status === 'Requested');
  const hasDocumentRequests = requestedDocuments.length > 0;
  
  // Helper to format document type
  const formatDocumentType = (type) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

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

      {/* Pending Actions Alert (if HR requests documents) */}
      {hasDocumentRequests && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-2xl p-6 text-white animate-pulse">
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
              onClick={() => navigate('/employee/documents')}
              className="px-6 py-3 bg-white text-orange-600 rounded-xl font-bold hover:bg-orange-50 transition-colors shadow-lg flex items-center space-x-2"
            >
              <span>View Now</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Pending Actions Card */}
          {hasDocumentRequests && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-orange-200 rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Pending Actions</h3>
                    <p className="text-sm text-gray-600">Document requests from HR</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-orange-600 text-white rounded-full text-sm font-bold">
                  {requestedDocuments.length} Pending
                </span>
              </div>
              <div className="space-y-3">
                {requestedDocuments.slice(0, 3).map((doc) => (
                  <div key={doc.id} className="bg-white rounded-lg p-4 border border-orange-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-orange-600" />
                        <div>
                          <p className="font-semibold text-gray-800">{formatDocumentType(doc.type)}</p>
                          {doc.requestReason && (
                            <p className="text-sm text-gray-600 mt-1">{doc.requestReason}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => navigate('/employee/documents')}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Upload
                      </button>
                    </div>
                  </div>
                ))}
                {requestedDocuments.length > 3 && (
                  <button
                    onClick={() => navigate('/employee/documents')}
                    className="w-full py-2 text-center text-orange-600 hover:text-orange-700 font-medium text-sm"
                  >
                    View all {requestedDocuments.length} requests →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Recent Leaves */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">Recent Leave Requests</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
            </div>
            <div className="overflow-hidden">
              <DataTable 
                columns={[
                  { header: 'Type', accessor: 'leaveType' },
                  { header: 'Start Date', accessor: 'startDate' },
                  { header: 'End Date', accessor: 'endDate' },
                  { header: 'Status', accessor: 'status' },
                ]}
                data={leaves.slice(0, 5)}
              />
              {leaves.length === 0 && (
                <div className="text-center py-8 text-gray-400">No recent leave requests found.</div>
              )}
            </div>
          </div>

          {/* Documents Status */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Document Status</h3>
            <div className="space-y-4">
              {documents.slice(0, 3).map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-xl"><FileText size={20} className="text-blue-500" /></div>
                    <div>
                      <p className="font-medium text-gray-800">{doc.documentType}</p>
                      <p className="text-xs text-gray-500">Uploaded on {new Date(doc.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    doc.status === 'verified' ? 'bg-green-100 text-green-700' :
                    doc.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                  </span>
                </div>
              ))}
              {documents.length === 0 && (
                <div className="text-center py-8 text-gray-400">No documents uploaded yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1/3 width) */}
        <div className="space-y-8">
          {/* Profile Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-500 to-purple-600"></div>
            <div className="relative mt-8">
              <div className="w-20 h-20 mx-auto bg-white rounded-full p-1 shadow-lg">
                <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-2xl text-gray-500">
                  <User size={40} />
                </div>
              </div>
              <h3 className="mt-4 text-xl font-bold text-gray-800">{profile?.fullName || 'Loading...'}</h3>
              <p className="text-gray-500">{profile?.role || 'Employee'}</p>
              
              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-6">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Department</p>
                  <p className="font-semibold text-gray-700">{profile?.department || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Joined</p>
                  <p className="font-semibold text-gray-700">{profile?.createdAt ? new Date(profile.createdAt).getFullYear() : 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full py-3 px-4 bg-blue-50 text-blue-600 rounded-xl font-medium hover:bg-blue-100 transition-colors flex items-center justify-center">
                <span className="mr-2"><PlusCircle size={18} /></span> File Leave Request
              </button>
              <button className="w-full py-3 px-4 bg-purple-50 text-purple-600 rounded-xl font-medium hover:bg-purple-100 transition-colors flex items-center justify-center">
                <span className="mr-2"><Upload size={18} /></span> Upload Document
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}