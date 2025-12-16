import React, { useEffect, useState } from 'react';
import hrService from '../../services/hrService';

export default function EmployeeProfileModal({ employeeId, isOpen, onClose }) {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!employeeId) return setEmployee(null);
      setLoading(true);
      try {
        const data = await hrService.getEmployeeById(employeeId);
        if (mounted) setEmployee(data);
      } catch (err) {
        if (mounted) setEmployee(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [employeeId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 p-6">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-semibold">Employee Profile</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        {loading ? (
          <div className="py-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : employee ? (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                {employee.profileImage ? (
                  <img src={employee.profileImage} alt={employee.fullName} className="h-20 w-20 rounded-full object-cover" />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center text-lg font-semibold text-gray-700">{(employee.fullName || ' ')[0]}</div>
                )}
                <div>
                  <div className="text-lg font-bold">{employee.fullName}</div>
                  <div className="text-sm text-gray-500">ID: {employee.employeeId}</div>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600">Email</div>
                <div className="font-medium">{employee.email || 'N/A'}</div>
              </div>

              <div>
                <div className="text-sm text-gray-600">Contact</div>
                <div className="font-medium">{employee.contactNumber || 'N/A'}</div>
              </div>

              <div>
                <div className="text-sm text-gray-600">Role</div>
                <div className="font-medium capitalize">{employee.role || 'N/A'}</div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600">Department</div>
                <div className="font-medium">{employee.Department?.name || 'Unassigned'}</div>
              </div>

              <div>
                <div className="text-sm text-gray-600">Designation</div>
                <div className="font-medium">{employee.Designation?.title || 'Unassigned'}</div>
              </div>

              <div>
                <div className="text-sm text-gray-600">Status</div>
                <div className="font-medium">{employee.status || 'Unknown'}</div>
              </div>

              <div>
                <div className="text-sm text-gray-600">Date Joined</div>
                <div className="font-medium">{employee.createdAt ? new Date(employee.createdAt).toLocaleDateString() : 'N/A'}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-gray-500">Employee not found</div>
        )}

        <div className="mt-6 text-right">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Close</button>
        </div>
      </div>
    </div>
  );
}
