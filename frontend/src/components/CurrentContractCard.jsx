import React from 'react';
import { FileText, Calendar, Clock, Download, Briefcase, Building2 } from 'lucide-react';

// Helper function to calculate days remaining
const calculateDaysRemaining = (endDate) => {
  if (!endDate) return null;
  const now = new Date();
  const end = new Date(endDate);
  if (end < now) return 0;
  return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
};

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const CurrentContractCard = ({ contract, onDownload }) => {
  if (!contract) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center py-12">
          <FileText className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Active Contract</h3>
          <p className="text-gray-500">You currently don't have an active contract on record.</p>
        </div>
      </div>
    );
  }

  const daysRemaining = calculateDaysRemaining(contract.endDate);
  const isExpiringSoon = daysRemaining !== null && daysRemaining <= 30 && daysRemaining > 0;
  const isExpired = daysRemaining === 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Current Contract</h2>
              <p className="text-blue-100 text-sm mt-1">Active Employment Agreement</p>
            </div>
          </div>
          
          {/* Countdown Badge */}
          {daysRemaining !== null && (
            <div className={`px-4 py-2 rounded-xl backdrop-blur-sm font-semibold flex items-center space-x-2 ${
              isExpired 
                ? 'bg-red-500/20 text-red-100 border border-red-300/30' 
                : isExpiringSoon 
                ? 'bg-yellow-500/20 text-yellow-100 border border-yellow-300/30'
                : 'bg-white/20 text-white border border-white/30'
            }`}>
              <Clock className="h-4 w-4" />
              <span>
                {isExpired 
                  ? 'Expired' 
                  : daysRemaining === 1
                  ? 'Expires tomorrow'
                  : `${daysRemaining} days left`
                }
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Position */}
          {contract.position && (
            <div className="flex items-start space-x-3">
              <div className="bg-blue-50 p-2.5 rounded-lg">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Position</p>
                <p className="font-semibold text-gray-800">{contract.position}</p>
              </div>
            </div>
          )}

          {/* Department */}
          {contract.department && (
            <div className="flex items-start space-x-3">
              <div className="bg-purple-50 p-2.5 rounded-lg">
                <Building2 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Department</p>
                <p className="font-semibold text-gray-800">{contract.department}</p>
              </div>
            </div>
          )}

          {/* Start Date */}
          <div className="flex items-start space-x-3">
            <div className="bg-green-50 p-2.5 rounded-lg">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Start Date</p>
              <p className="font-semibold text-gray-800">{formatDate(contract.startDate)}</p>
            </div>
          </div>

          {/* End Date */}
          <div className="flex items-start space-x-3">
            <div className="bg-orange-50 p-2.5 rounded-lg">
              <Calendar className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">End Date</p>
              <p className="font-semibold text-gray-800">{formatDate(contract.endDate)}</p>
            </div>
          </div>

          {/* Contract Type */}
          <div className="flex items-start space-x-3">
            <div className="bg-indigo-50 p-2.5 rounded-lg">
              <FileText className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Contract Type</p>
              <p className="font-semibold text-gray-800">{contract.type || 'Full-time'}</p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-start space-x-3">
            <div className={`p-2.5 rounded-lg ${
              contract.status === 'Active' ? 'bg-green-50' : 'bg-gray-50'
            }`}>
              <div className={`h-5 w-5 rounded-full ${
                contract.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'
              }`} />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Status</p>
              <p className="font-semibold text-gray-800">{contract.status}</p>
            </div>
          </div>
        </div>

        {/* Download Button */}
        {contract.filePath && onDownload && (
          <div className="pt-6 border-t border-gray-100">
            <button
              onClick={() => onDownload(contract.id)}
              className="w-full md:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              <Download className="h-5 w-5" />
              <span>Download Contract (PDF)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrentContractCard;
