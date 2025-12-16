import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Archive, ArchiveRestore, Building2, Briefcase, X, Search } from 'lucide-react';
import hrService from '../../services/hrService';
import { useToast } from '../../context/ToastContext';

export default function DepartmentDesignation() {
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showDesigModal, setShowDesigModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [editingDesig, setEditingDesig] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('departments');
  const { showToast } = useToast();

  const [deptFormData, setDeptFormData] = useState({
    name: '',
    code: '',
    description: ''
  });

  const [desigFormData, setDesigFormData] = useState({
    title: '',
    departmentId: '',
    description: ''
  });

  useEffect(() => {
    fetchDepartments();
    fetchDesignations();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const data = await hrService.getDepartments();
      setDepartments(data);
    } catch (error) {
      showToast('Failed to fetch departments', 'error');
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDesignations = async () => {
    try {
      const data = await hrService.getDesignations();
      setDesignations(data);
    } catch (error) {
      showToast('Failed to fetch designations', 'error');
      console.error('Error fetching designations:', error);
    }
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await hrService.updateDepartment(editingDept.id, deptFormData);
        showToast('Department updated successfully', 'success');
      } else {
        await hrService.createDepartment(deptFormData);
        showToast('Department created successfully', 'success');
      }
      setShowDeptModal(false);
      resetDeptForm();
      fetchDepartments();
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to save department', 'error');
    }
  };

  const handleCreateDesignation = async (e) => {
    e.preventDefault();
    try {
      if (editingDesig) {
        await hrService.updateDesignation(editingDesig.id, desigFormData);
        showToast('Designation updated successfully', 'success');
      } else {
        await hrService.createDesignation(desigFormData);
        showToast('Designation created successfully', 'success');
      }
      setShowDesigModal(false);
      resetDesigForm();
      fetchDesignations();
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to save designation', 'error');
    }
  };

  const handleArchiveDepartment = async (id) => {
    if (!confirm('Are you sure you want to archive this department?')) return;
    try {
      await hrService.archiveDepartment(id);
      showToast('Department archived successfully', 'success');
      fetchDepartments();
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to archive department', 'error');
    }
  };

  const handleUnarchiveDepartment = async (id) => {
    try {
      await hrService.unarchiveDepartment(id);
      showToast('Department restored successfully', 'success');
      fetchDepartments();
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to restore department', 'error');
    }
  };

  const handleArchiveDesignation = async (id) => {
    if (!confirm('Are you sure you want to archive this designation?')) return;
    try {
      await hrService.archiveDesignation(id);
      showToast('Designation archived successfully', 'success');
      fetchDesignations();
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to archive designation', 'error');
    }
  };

  const handleUnarchiveDesignation = async (id) => {
    try {
      await hrService.unarchiveDesignation(id);
      showToast('Designation restored successfully', 'success');
      fetchDesignations();
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to restore designation', 'error');
    }
  };

  const handleEditDepartment = (dept) => {
    setEditingDept(dept);
    setDeptFormData({
      name: dept.name,
      code: dept.code || '',
      description: dept.description || ''
    });
    setShowDeptModal(true);
  };

  const handleEditDesignation = (desig) => {
    setEditingDesig(desig);
    setDesigFormData({
      title: desig.title,
      departmentId: desig.departmentId || '',
      description: desig.description || ''
    });
    setShowDesigModal(true);
  };

  const resetDeptForm = () => {
    setDeptFormData({ name: '', code: '', description: '' });
    setEditingDept(null);
  };

  const resetDesigForm = () => {
    setDesigFormData({ title: '', departmentId: '', description: '' });
    setEditingDesig(null);
  };

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dept.code && dept.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredDesignations = designations.filter(desig =>
    desig.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeDepartments = filteredDepartments.filter(d => d.status === 'Active');
  const archivedDepartments = filteredDepartments.filter(d => d.status === 'Archived');
  const activeDesignations = filteredDesignations.filter(d => d.status === 'Active');
  const archivedDesignations = filteredDesignations.filter(d => d.status === 'Archived');

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Departments & Designations</h1>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('departments')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'departments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Building2 className="inline-block mr-2" size={18} />
            Departments
          </button>
          <button
            onClick={() => setActiveTab('designations')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'designations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Briefcase className="inline-block mr-2" size={18} />
            Designations
          </button>
        </nav>
      </div>

      {/* Search and Add Button */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => {
            if (activeTab === 'departments') {
              resetDeptForm();
              setShowDeptModal(true);
            } else {
              resetDesigForm();
              setShowDesigModal(true);
            }
          }}
          className="ml-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
        >
          <Plus size={20} className="mr-2" />
          Add {activeTab === 'departments' ? 'Department' : 'Designation'}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      ) : (
        <>
          {activeTab === 'departments' ? (
            <div className="space-y-6">
              {/* Active Departments */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800">Active Departments ({activeDepartments.length})</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designations</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {activeDepartments.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                            No active departments found
                          </td>
                        </tr>
                      ) : (
                        activeDepartments.map((dept) => (
                          <tr key={dept.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{dept.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{dept.code || '-'}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-500 max-w-xs truncate">{dept.description || '-'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-500">
                                {dept.Designations?.length || 0} designation(s)
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleEditDepartment(dept)}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                                title="Edit"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleArchiveDepartment(dept.id)}
                                className="text-gray-600 hover:text-gray-900"
                                title="Archive"
                              >
                                <Archive size={18} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Archived Departments */}
              {archivedDepartments.length > 0 && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-600">Archived Departments ({archivedDepartments.length})</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {archivedDepartments.map((dept) => (
                          <tr key={dept.id} className="hover:bg-gray-50 opacity-60">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{dept.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{dept.code || '-'}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-500 max-w-xs truncate">{dept.description || '-'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleUnarchiveDepartment(dept.id)}
                                className="text-green-600 hover:text-green-900"
                                title="Restore"
                              >
                                <ArchiveRestore size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Active Designations */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800">Active Designations ({activeDesignations.length})</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {activeDesignations.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                            No active designations found
                          </td>
                        </tr>
                      ) : (
                        activeDesignations.map((desig) => (
                          <tr key={desig.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{desig.title}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {desig.Department?.name || 'Not Assigned'}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-500 max-w-xs truncate">{desig.description || '-'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleEditDesignation(desig)}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                                title="Edit"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleArchiveDesignation(desig.id)}
                                className="text-gray-600 hover:text-gray-900"
                                title="Archive"
                              >
                                <Archive size={18} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Archived Designations */}
              {archivedDesignations.length > 0 && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-600">Archived Designations ({archivedDesignations.length})</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {archivedDesignations.map((desig) => (
                          <tr key={desig.id} className="hover:bg-gray-50 opacity-60">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{desig.title}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {desig.Department?.name || 'Not Assigned'}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-500 max-w-xs truncate">{desig.description || '-'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleUnarchiveDesignation(desig.id)}
                                className="text-green-600 hover:text-green-900"
                                title="Restore"
                              >
                                <ArchiveRestore size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Department Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingDept ? 'Edit Department' : 'Add New Department'}
              </h2>
              <button
                onClick={() => {
                  setShowDeptModal(false);
                  resetDeptForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateDepartment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department Name *
                </label>
                <input
                  type="text"
                  required
                  value={deptFormData.name}
                  onChange={(e) => setDeptFormData({ ...deptFormData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., TTED, CIT, ADMIN"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department Code
                </label>
                <input
                  type="text"
                  value={deptFormData.code}
                  onChange={(e) => setDeptFormData({ ...deptFormData, code: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., TTED, CIT"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={deptFormData.description}
                  onChange={(e) => setDeptFormData({ ...deptFormData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of the department"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeptModal(false);
                    resetDeptForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                >
                  {editingDept ? 'Update Department' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Designation Modal */}
      {showDesigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingDesig ? 'Edit Designation' : 'Add New Designation'}
              </h2>
              <button
                onClick={() => {
                  setShowDesigModal(false);
                  resetDesigForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateDesignation} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Designation Title *
                </label>
                <input
                  type="text"
                  required
                  value={desigFormData.title}
                  onChange={(e) => setDesigFormData({ ...desigFormData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Professor, Instructor"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  value={desigFormData.departmentId}
                  onChange={(e) => setDesigFormData({ ...desigFormData, departmentId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Not Assigned</option>
                  {activeDepartments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={desigFormData.description}
                  onChange={(e) => setDesigFormData({ ...desigFormData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of the designation"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowDesigModal(false);
                    resetDesigForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                >
                  {editingDesig ? 'Update Designation' : 'Create Designation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
