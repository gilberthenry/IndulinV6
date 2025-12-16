import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Calendar, FileCheck, AlertOctagon, Users, Contact } from 'lucide-react';

export default function HRReports() {
  const reports = [
    { name: 'Contract Reports', icon: <FileText />, path: '/hr/reports/contracts' },
    { name: 'Leave Reports', icon: <Calendar />, path: '/hr/reports/leave' },
    { name: 'Document Reports', icon: <FileCheck />, path: '/hr/reports/documents' },
    { name: 'Disciplinary Reports', icon: <AlertOctagon />, path: '/hr/reports/disciplinary' },
    { name: 'Employee List', icon: <Users />, path: '/hr/reports/employee-list' },
    { name: 'ID Directory', icon: <Contact />, path: '/hr/reports/id-directory' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">HR Reports</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report, index) => (
          <Link 
            key={index} 
            to={report.path} 
            className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center hover:shadow-lg hover:bg-purple-50 transition-all duration-300 group"
          >
            <div className="text-purple-600 mb-4 group-hover:scale-110 transition-transform">
              {React.cloneElement(report.icon, { size: 40 })}
            </div>
            <h2 className="text-lg font-semibold text-gray-700">{report.name}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
}
