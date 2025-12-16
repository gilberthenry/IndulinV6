import React, { useState, useEffect } from 'react';
import { Plus, Edit, Archive, ArchiveRestore, Briefcase, Users, X, Building2 } from 'lucide-react';
import departmentService from '../../services/departmentService';
import { useToast } from '../../context/ToastContext';

export default function HRDepartments() {
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showDesigModal, setShowDesigModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [editingDesig, setEditingDesig] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [activeTab, setActiveTab] = useState('departments');
  const { showToast } = useToast();

  const [deptForm, setDeptForm] = useState({
    name: '',
    code: '',
    description: ''
  });

  const [desigForm, setDesigForm] = useState({
    title: '',
    departmentId: '',
    description: ''
  });

  useEffect(() => {
    loadData();
  }, [showArchived]);

  const loadData = async () => {
    try {
      setLoading(true);
      const status = showArchived ? null : 'Active';
      const [depts, desigs] = await Promise.all([
        departmentService.getDepartments(status),
        departmentService.getDesignations(status)
      ]);
      setDepartments(depts);
      setDesignations(desigs);
    } catch (error) {
      showToast('Error loading data', 'error');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Department handlers
  const handleCreateDept = () => {
    setEditingDept(null);
    setDeptForm({ name: '', code: '', description: '' });
    setShowDeptModal(true);
  };

  const handleEditDept = (dept) => {
    setEditingDept(dept);
    setDeptForm({
      name: dept.name,
      code: dept.code || '',
      description: dept.description || ''
    });
    setShowDeptModal(true);
  };

  const handleSaveDept = async (e) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await departmentService.updateDepartment(editingDept.id, deptForm);
        showToast('Department updated successfully', 'success');
      } else {
        await departmentService.createDepartment(deptForm);
        showToast('Department created successfully', 'success');
      }
      setShowDeptModal(false);
      loadData();
    } catch (error) {
      showToast(error.response?.data?.error || 'Error saving department', 'error');
    }
  };

  const handleArchiveDept = async (id) => {
    if (!confirm('Are you sure you want to archive this department? All designations under it will also be archived.')) return;
    try {
      await departmentService.archiveDepartment(id);
      showToast('Department archived successfully', 'success');
      loadData();
    } catch (error) {
      showToast('Error archiving department', 'error');
    }
  };

  const handleUnarchiveDept = async (id) => {
    try {
      await departmentService.unarchiveDepartment(id);
      showToast('Department unarchived successfully', 'success');
      loadData();
    } catch (error) {
      showToast('Error unarchiving department', 'error');
    }
  };

  // Designation handlers
  const handleCreateDesig = () => {
    setEditingDesig(null);
    setDesigForm({ title: '', departmentId: '', description: '' });
    setShowDesigModal(true);
  };

  const handleEditDesig = (desig) => {
    setEditingDesig(desig);
    setDesigForm({
      title: desig.title,
      departmentId: desig.departmentId || '',
      description: desig.description || ''
    });
    setShowDesigModal(true);
  };

  const handleSaveDesig = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...desigForm,
        departmentId: desigForm.departmentId || null
      };
      
      if (editingDesig) {
        await departmentService.updateDesignation(editingDesig.id, data);
        showToast('Designation updated successfully', 'success');
      } else {
        await departmentService.createDesignation(data);
        showToast('Designation created successfully', 'success');
      }
      setShowDesigModal(false);
      loadData();
    } catch (error) {
      showToast(error.response?.data?.error || 'Error saving designation', 'error');
    }
  };

  const handleArchiveDesig = async (id) => {
    if (!confirm('Are you sure you want to archive this designation?')) return;
    try {
      await departmentService.archiveDesignation(id);
      showToast('Designation archived successfully', 'success');
      loadData();
    } catch (error) {
      showToast('Error archiving designation', 'error');
    }
  };

  const handleUnarchiveDesig = async (id) => {
    try {
      await departmentService.unarchiveDesignation(id);
      showToast('Designation unarchived successfully', 'success');
      loadData();
    } catch (error) {
      showToast('Error unarchiving designation', 'error');
    }
  };

  const getDesignationCount = (deptId) => {
    return designations.filter(d => d.departmentId === deptId && d.status === 'Active').length;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="text-xl font-semibold text-gray-500">Loading data...</div>
    </div>;
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Departments & Designations</h1>
            <p className="text-gray-600 mt-1">Manage your organization's structure.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                showArchived
                  ? 'bg-gray-700 text-white hover:bg-gray-800'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              {showArchived ? 'Show Active' : 'Show Archived'}
            </button>
          </div>
        </div>

        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('departments')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'departments'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Departments
            </button>
            <button
              onClick={() => setActiveTab('designations')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'designations'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Designations
            </button>
          </nav>
        </div>

        <div>
          {activeTab === 'departments' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 flex justify-between items-center">
                <div className="flex items-center">
                  <Building2 size={22} className="text-purple-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-800">Manage Departments</h2>
                </div>
                <button
                  onClick={handleCreateDept}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  <Plus size={16} className="mr-2" />
                  Add Department
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                      <th className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Designations</th>
                      <th className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {departments.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-gray-500">
                          No departments found.
                        </td>
                      </tr>
                    ) : (
                      departments.map(dept => (
                        <tr key={dept.id} className="hover:bg-gray-50">
                          <td className="py-4 px-6 font-medium text-gray-900">{dept.name}</td>
                          <td className="py-4 px-6 text-gray-600">{dept.code || '-'}</td>
                          <td className="py-4 px-6 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-semibold text-sm">
                              {getDesignationCount(dept.id)}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              dept.status === 'Active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {dept.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right space-x-2">
                            <button
                              onClick={() => handleEditDept(dept)}
                              className="p-2 text-gray-400 hover:text-purple-600 rounded-md transition-colors"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>
                            {dept.status === 'Active' ? (
                              <button
                                onClick={() => handleArchiveDept(dept.id)}
                                className="p-2 text-gray-400 hover:text-red-600 rounded-md transition-colors"
                                title="Archive"
                              >
                                <Archive size={18} />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUnarchiveDept(dept.id)}
                                className="p-2 text-gray-400 hover:text-green-600 rounded-md transition-colors"
                                title="Unarchive"
                              >
                                <ArchiveRestore size={18} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'designations' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 flex justify-between items-center">
                <div className="flex items-center">
                  <Briefcase size={22} className="text-purple-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-800">Manage Designations</h2>
                </div>
                <button
                  onClick={handleCreateDesig}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  <Plus size={16} className="mr-2" />
                  Add Designation
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {designations.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="py-8 text-center text-gray-500">
                          No designations found.
                        </td>
                      </tr>
                    ) : (
                      designations.map(desig => (
                        <tr key={desig.id} className="hover:bg-gray-50">
                          <td className="py-4 px-6 font-medium text-gray-900">{desig.title}</td>
                          <td className="py-4 px-6 text-gray-600">
                            {desig.Department?.name || <span className="text-gray-400">General</span>}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              desig.status === 'Active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {desig.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right space-x-2">
                            <button
                              onClick={() => handleEditDesig(desig)}
                              className="p-2 text-gray-400 hover:text-purple-600 rounded-md transition-colors"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>
                            {desig.status === 'Active' ? (
                              <button
                                onClick={() => handleArchiveDesig(desig.id)}
                                className="p-2 text-gray-400 hover:text-red-600 rounded-md transition-colors"
                                title="Archive"
                              >
                                <Archive size={18} />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUnarchiveDesig(desig.id)}
                                className="p-2 text-gray-400 hover:text-green-600 rounded-md transition-colors"
                                title="Unarchive"
                              >
                                <ArchiveRestore size={18} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Department Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                {editingDept ? 'Edit Department' : 'Add New Department'}
              </h3>
              <button onClick={() => setShowDeptModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSaveDept}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={deptForm.name}
                    onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="e.g., Human Resources"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department Code
                  </label>
                  <input
                    type="text"
                    value={deptForm.code}
                    onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="e.g., HR"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={deptForm.description}
                    onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    rows="3"
                    placeholder="A brief description of the department's role."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowDeptModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
                >
                  {editingDept ? 'Save Changes' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Designation Modal */}
      {showDesigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                {editingDesig ? 'Edit Designation' : 'Add New Designation'}
              </h3>
              <button onClick={() => setShowDesigModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSaveDesig}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Designation Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={desigForm.title}
                    onChange={(e) => setDesigForm({ ...desigForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="e.g., Senior Manager"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <select
                    value={desigForm.departmentId}
                    onChange={(e) => setDesigForm({ ...desigForm, departmentId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                  >
                    <option value="">General (No Department)</option>
                    {departments
                      .filter(d => d.status === 'Active')
                      .map(dept => (
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
                    value={desigForm.description}
                    onChange={(e) => setDesigForm({ ...desigForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    rows="3"
                    placeholder="A brief description of the designation's role."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowDesigModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
                >
                  {editingDesig ? 'Save Changes' : 'Create Designation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
