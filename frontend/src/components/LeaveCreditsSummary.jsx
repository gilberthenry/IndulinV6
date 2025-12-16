import React, { useState, useEffect } from 'react';
import hrService from '../services/hrService';
import { TrendingUp, TrendingDown, Award, AlertCircle } from 'lucide-react';

export default function LeaveCreditsSummary({ schoolYear }) {
  const [credits, setCredits] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchData();
  }, [schoolYear]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [creditsData, summaryData] = await Promise.all([
        hrService.getLeaveCredits(schoolYear),
        hrService.getCreditSummary(schoolYear)
      ]);
      setCredits(creditsData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error fetching leave credits:', error);
    }
    setLoading(false);
  };

  const getStatusColor = (remaining) => {
    if (remaining >= 10) return 'text-green-600 bg-green-50 border-green-200';
    if (remaining >= 5) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(summary).map(([type, data]) => {
            const usagePercent = data.totalCredits > 0 
              ? ((data.usedCredits / data.totalCredits) * 100).toFixed(1)
              : 0;
            
            return (
              <div key={type} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="text-sm font-medium text-gray-500 mb-2 capitalize">
                  {type.replace('-', ' ')}
                </div>
                <div className="flex items-baseline justify-between mb-2">
                  <div className="text-2xl font-bold text-gray-800">{data.count}</div>
                  <div className="text-sm text-gray-500">employees</div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Used: {data.usedCredits.toFixed(1)}/{data.totalCredits.toFixed(1)}</span>
                  <span className={`font-semibold ${usagePercent > 75 ? 'text-red-600' : 'text-green-600'}`}>
                    {usagePercent}%
                  </span>
                </div>
                <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${usagePercent > 75 ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(usagePercent, 100)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Credits Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Employee Leave Credits</h3>
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              {showAll ? 'Show Less' : 'Show All'}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Used
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Carried
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remaining
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monetizable
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Forfeited
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(showAll ? credits : credits.slice(0, 10)).map((credit) => {
                const remaining = parseFloat(credit.totalCredits) + 
                                parseFloat(credit.carriedOverCredits) - 
                                parseFloat(credit.usedCredits);
                
                return (
                  <tr key={credit.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {credit.Employee?.fullName || 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {credit.Employee?.employeeId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                        {credit.employmentType?.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 font-medium">
                      {parseFloat(credit.totalCredits).toFixed(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm text-red-600 font-medium">
                        {parseFloat(credit.usedCredits).toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {parseFloat(credit.carriedOverCredits) > 0 ? (
                        <span className="text-sm text-green-600 font-medium flex items-center justify-center gap-1">
                          <TrendingUp size={14} />
                          {parseFloat(credit.carriedOverCredits).toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-sm font-bold rounded-lg border ${getStatusColor(remaining)}`}>
                        {remaining.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {parseFloat(credit.monetizableCredits) > 0 ? (
                        <span className="text-sm text-green-600 font-medium flex items-center justify-center gap-1">
                          <Award size={14} />
                          {parseFloat(credit.monetizableCredits).toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {parseFloat(credit.forfeitedCredits) > 0 ? (
                        <span className="text-sm text-orange-600 font-medium flex items-center justify-center gap-1">
                          <AlertCircle size={14} />
                          {parseFloat(credit.forfeitedCredits).toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {credits.length > 10 && !showAll && (
          <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
            <button
              onClick={() => setShowAll(true)}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              View {credits.length - 10} more employees
            </button>
          </div>
        )}

        {credits.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No leave credits data available for this school year.
          </div>
        )}
      </div>
    </div>
  );
}
