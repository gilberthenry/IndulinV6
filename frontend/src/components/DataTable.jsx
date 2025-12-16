import React, { useState } from 'react';
import { Search, ChevronUp, ChevronDown, Filter } from 'lucide-react';

export default function DataTable({ data, fields, columns }) {
  const [sortField, setSortField] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [filter, setFilter] = useState('');

  if (!data || data.length === 0) return (
    <div className="p-12 text-center flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
      <Filter size={48} className="mb-4 opacity-20" />
      <p>No data available</p>
    </div>
  );

  // Normalize columns/fields
  const tableColumns = columns || fields.map(f => ({ header: f.charAt(0).toUpperCase() + f.slice(1), accessor: f }));

  // Sorting logic
  const sortedData = [...data].sort((a, b) => {
    if (!sortField) return 0;
    const valA = a[sortField]?.toString().toLowerCase() || '';
    const valB = b[sortField]?.toString().toLowerCase() || '';
    return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });

  // Filtering logic
  const filteredData = sortedData.filter((row) =>
    tableColumns.some((col) => {
      const val = row[col.accessor];
      return val?.toString().toLowerCase().includes(filter.toLowerCase());
    })
  );

  const handleSort = (field) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const renderCell = (row, col) => {
    const value = row[col.accessor];
    if (['status', 'contractStatus', 'docStatus'].includes(col.accessor)) {
      const statusColors = {
        active: 'bg-green-100 text-green-700 border-green-200',
        verified: 'bg-green-100 text-green-700 border-green-200',
        pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        expired: 'bg-red-100 text-red-700 border-red-200',
        rejected: 'bg-red-100 text-red-700 border-red-200',
        disabled: 'bg-gray-100 text-gray-700 border-gray-200',
      };
      return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[value?.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
          {value}
        </span>
      );
    }
    return <span className="text-gray-700 text-sm">{value}</span>;
  };

  return (
    <div className="w-full">
      <div className="mb-4 relative group">
        <input
          type="text"
          placeholder="Search..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm group-hover:bg-white"
        />
        <Search className="absolute left-3 top-2.5 text-gray-400 group-hover:text-blue-500 transition-colors" size={18} />
      </div>
      
      <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50/50">
            <tr>
              {tableColumns.map((col) => (
                <th
                  key={col.accessor}
                  onClick={() => handleSort(col.accessor)}
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center space-x-2">
                    <span>{col.header}</span>
                    <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                      {sortField === col.accessor ? (
                        sortAsc ? <ChevronUp size={14} className="text-blue-500 opacity-100" /> : <ChevronDown size={14} className="text-blue-500 opacity-100" />
                      ) : (
                        <div className="h-3 w-3" />
                      )}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.map((row, i) => (
              <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                {tableColumns.map((col) => (
                  <td key={col.accessor} className="px-6 py-4 whitespace-nowrap">
                    {renderCell(row, col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 text-xs text-gray-400 text-right">
        Showing {filteredData.length} entries
      </div>
    </div>
  );
}