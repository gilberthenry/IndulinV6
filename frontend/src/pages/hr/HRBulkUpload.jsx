import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Download, FileText, CheckCircle, AlertCircle, X, ArrowLeft } from 'lucide-react';
import hrService from '../../services/hrService';
import { useToast } from '../../context/ToastContext';

export default function HRBulkUpload() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoCreateContracts, setAutoCreateContracts] = useState(true);
  const [uploadStep, setUploadStep] = useState('upload'); // 'upload', 'preview', 'processing', 'complete'
  const [errors, setErrors] = useState([]);
  const [successCount, setSuccessCount] = useState(0);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      
      if (fileExtension !== 'csv') {
        showToast('Please upload a CSV file', 'error');
        return;
      }
      
      setSelectedFile(file);
      setPreviewData(null);
      setErrors([]);
    }
  };

  const handleUploadAndPreview = async () => {
    if (!selectedFile) {
      showToast('Please select a file first', 'warning');
      return;
    }

    try {
      setLoading(true);
      const result = await hrService.previewBulkUpload(selectedFile);
      
      if (result.errors && result.errors.length > 0) {
        setErrors(result.errors);
        showToast(`File has ${result.errors.length} validation errors`, 'warning');
      } else {
        showToast('File validated successfully', 'success');
      }
      
      setPreviewData(result.data);
      setUploadStep('preview');
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to preview file', 'error');
      setErrors(error.response?.data?.errors || []);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    try {
      setLoading(true);
      setUploadStep('processing');
      
      const result = await hrService.confirmBulkUpload(selectedFile, autoCreateContracts);
      
      setSuccessCount(result.successCount);
      setErrors(result.errors || []);
      setUploadStep('complete');
      
      if (result.errors && result.errors.length > 0) {
        showToast(`Imported ${result.successCount} employees with ${result.errors.length} errors`, 'warning');
      } else {
        showToast(`Successfully imported ${result.successCount} employees`, 'success');
      }
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to import employees', 'error');
      setUploadStep('preview');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await hrService.downloadEmployeeTemplate();
      showToast('Template downloaded successfully', 'success');
    } catch (error) {
      showToast('Failed to download template', 'error');
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewData(null);
    setErrors([]);
    setUploadStep('upload');
    setSuccessCount(0);
  };

  const handleGoToEmployees = () => {
    navigate('/hr/employees');
  };

  const templateFields = [
    { category: 'Personal Information', fields: ['fullName', 'dateOfBirth', 'gender', 'civilStatus'] },
    { category: 'Contact Details', fields: ['email', 'contactNumber', 'emergencyContact'] },
    { category: 'Address Information', fields: ['address', 'city', 'province', 'zipCode'] },
    { category: 'Government IDs', fields: ['sss', 'philhealth', 'pagibig', 'tin'] },
    { category: 'Employment Details', fields: ['employeeId', 'role', 'department', 'position', 'dateHired'] },
    { category: 'Contract Information', fields: ['contractType', 'contractStartDate', 'contractEndDate', 'salary'] }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30 p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/hr/employees')}
          className="flex items-center text-gray-600 hover:text-purple-600 mb-4 transition-all hover:gap-2 gap-1 font-medium"
        >
          <ArrowLeft size={20} />
          Back to Employees
        </button>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bulk Upload Employees</h1>
            <p className="text-gray-600 mt-1">Import multiple employee records at once using a CSV file</p>
          </div>
        </div>
      </div>

      {uploadStep === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Upload Form */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 hover:shadow-2xl transition-shadow">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Upload size={24} className="text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Upload Employee Data</h2>
            </div>
            
            {/* Instructions */}
            <div className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-purple-600 rounded"></div>
                Step-by-Step Instructions
              </h3>
              <ol className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-semibold text-sm mr-3 flex-shrink-0">1</span>
                  <span>Download the Excel template below</span>
                </li>
                <li className="flex items-start">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-semibold text-sm mr-3 flex-shrink-0">2</span>
                  <span>Fill in employee information (one employee per row)</span>
                </li>
                <li className="flex items-start">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-semibold text-sm mr-3 flex-shrink-0">3</span>
                  <span>Save the file and upload it here</span>
                </li>
                <li className="flex items-start">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-semibold text-sm mr-3 flex-shrink-0">4</span>
                  <span>Review the preview before importing</span>
                </li>
              </ol>
            </div>

            {/* File Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FileText size={16} />
                Select File
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-500 hover:bg-purple-50/50 transition-all cursor-pointer group">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  {selectedFile ? (
                    <div className="space-y-3">
                      <div className="p-4 bg-green-100 rounded-full w-fit mx-auto">
                        <CheckCircle size={32} className="text-green-600" />
                      </div>
                      <div className="flex items-center justify-center text-green-600 gap-2">
                        <FileText size={20} />
                        <span className="font-semibold text-lg">{selectedFile.name}</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4 group-hover:bg-purple-100 transition-colors">
                        <Upload size={40} className="text-gray-400 group-hover:text-purple-600 transition-colors" />
                      </div>
                      <p className="text-gray-700 font-semibold mb-2 text-lg">
                        Click to browse or drag and drop
                      </p>
                      <p className="text-gray-500 text-sm">CSV files only • Max 10MB</p>
                    </div>
                  )}
                </label>
              </div>
              
              {/* Format Note */}
              <div className="mt-3 flex items-start text-sm text-gray-600">
                <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0 text-blue-500" />
                <span>
                  <strong>Supported format:</strong> CSV (.csv) – Excel support coming soon
                </span>
              </div>
            </div>

            {/* Auto-create Contracts Checkbox */}
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <label className="flex items-start cursor-pointer group">
                <input
                  type="checkbox"
                  checked={autoCreateContracts}
                  onChange={(e) => setAutoCreateContracts(e.target.checked)}
                  className="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                />
                <div className="ml-3">
                  <span className="text-gray-900 font-medium block mb-1 group-hover:text-purple-600 transition-colors">
                    Automatically create contracts
                  </span>
                  <span className="text-gray-600 text-sm">
                    Based on contract type and start date from CSV
                  </span>
                </div>
              </label>
            </div>

            {/* Upload Button */}
            <button
              onClick={handleUploadAndPreview}
              disabled={!selectedFile || loading}
              className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Upload size={20} className="mr-2" />
                  Upload and Preview
                </>
              )}
            </button>
          </div>

          {/* Right Panel - Template Download */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 hover:shadow-2xl transition-shadow">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Download size={24} className="text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Download Template</h2>
            </div>
            
            {/* Download Button */}
            <button
              onClick={handleDownloadTemplate}
              className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mb-6"
            >
              <Download size={20} className="mr-2" />
              Download CSV Template
            </button>

            <div className="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-200">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700 leading-relaxed">
                  Download the CSV template with all required fields and sample data. 
                  The template includes proper formatting and examples to help you fill in employee information correctly.
                </p>
              </div>
            </div>

            {/* Template Fields List */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-blue-600 rounded"></div>
                Template Includes
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {templateFields.map((section, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-xl p-4 bg-gradient-to-r from-gray-50 to-white hover:border-blue-300 transition-colors">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <CheckCircle size={18} className="mr-2 text-green-600 flex-shrink-0" />
                      {section.category}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {section.fields.map((field, fieldIdx) => (
                        <span
                          key={fieldIdx}
                          className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-700 font-medium hover:border-blue-400 hover:bg-blue-50 transition-colors"
                        >
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {uploadStep === 'preview' && previewData && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Preview Employee Data</h2>
              <p className="text-gray-600 mt-1">
                Review the data before importing. {previewData.length} employee(s) found.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <X size={20} className="mr-1" />
              Cancel
            </button>
          </div>

          {/* Errors Display */}
          {errors.length > 0 && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-900 mb-2 flex items-center">
                <AlertCircle size={20} className="mr-2" />
                Validation Errors ({errors.length})
              </h3>
              <ul className="list-disc list-inside space-y-1 text-red-700 text-sm max-h-40 overflow-y-auto">
                {errors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview Table */}
          <div className="overflow-x-auto mb-6 border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Row</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Full Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {previewData.slice(0, 10).map((employee, idx) => (
                  <tr key={idx} className={employee.hasError ? 'bg-red-50' : 'hover:bg-gray-50'}>
                    <td className="px-4 py-3 text-sm text-gray-600">{idx + 1}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{employee.fullName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{employee.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{employee.employeeId}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{employee.department}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{employee.position}</td>
                    <td className="px-4 py-3">
                      {employee.hasError ? (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                          Error
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          Valid
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {previewData.length > 10 && (
              <div className="bg-gray-50 px-4 py-3 text-sm text-gray-600 text-center border-t border-gray-200">
                Showing 10 of {previewData.length} employees
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmImport}
              disabled={errors.length > 0 || loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? 'Importing...' : `Import ${previewData.length} Employee(s)`}
            </button>
          </div>
        </div>
      )}

      {uploadStep === 'processing' && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Import...</h2>
            <p className="text-gray-600">Please wait while we import the employee data</p>
          </div>
        </div>
      )}

      {uploadStep === 'complete' && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
              <CheckCircle size={48} className="text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Import Complete!</h2>
            <p className="text-gray-600 text-lg">
              Successfully imported {successCount} employee{successCount !== 1 ? 's' : ''}
            </p>
          </div>

          {errors.length > 0 && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2 flex items-center">
                <AlertCircle size={20} className="mr-2" />
                Some Records Had Issues ({errors.length})
              </h3>
              <ul className="list-disc list-inside space-y-1 text-yellow-700 text-sm max-h-40 overflow-y-auto">
                {errors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-center gap-4">
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              Import More
            </button>
            <button
              onClick={handleGoToEmployees}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              Go to Employees
            </button>
          </div>
        </div>
      )}
    </div>
  );


  const handleUpload = async () => {
    if (!selectedFile) {
      showToast('Please select a file first', 'error');
      return;
    }

    try {
      setUploading(true);
      const result = await hrService.bulkUpload(selectedFile);
      
      setUploadResult({
        success: true,
        message: result.message,
        count: result.count
      });
      
      showToast(`Successfully uploaded ${result.count} employees`, 'success');
      
      // Reset after successful upload
      setTimeout(() => {
        setSelectedFile(null);
        setPreviewData([]);
        setShowPreview(false);
      }, 3000);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadResult({
        success: false,
        message: error.response?.data?.error || 'Failed to upload file'
      });
      showToast(error.response?.data?.error || 'Failed to upload file', 'error');
    } finally {
      setUploading(false);
    }
  };


  const handleClearFile = () => {
    setSelectedFile(null);
    setPreviewData([]);
    setShowPreview(false);
    setUploadResult(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Users size={32} className="text-purple-600" />
          Bulk Upload Employees
        </h1>
        <p className="text-gray-600 mt-2">
          Upload multiple employees at once using CSV or Excel files
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side - Upload Section */}
        <div className="space-y-6">
          {/* Instructions Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle size={24} className="text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Quick Steps</h3>
                <ol className="text-blue-800 text-sm space-y-1 list-decimal list-inside">
                  <li>Download template from right panel</li>
                  <li>Fill in employee data (CSV/Excel)</li>
                  <li>Select your completed file below</li>
                  <li>Preview and upload to system</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Upload Card */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="font-bold text-gray-800 text-lg mb-4">Upload Employee Data</h3>
            {/* File Selection Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
              <FileSpreadsheet size={48} className="mx-auto text-gray-400 mb-4" />
              
              {!selectedFile ? (
                <>
                  <p className="text-gray-600 mb-4">
                    Select a CSV or Excel file to upload
                  </p>
                  <label className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    <Upload size={20} />
                    Select File
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3 text-green-600">
                    <CheckCircle size={24} />
                    <span className="font-semibold text-lg">{selectedFile.name}</span>
                    <button
                      onClick={handleClearFile}
                      className="text-red-500 hover:text-red-700"
                      title="Remove file"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <p className="text-gray-500 text-sm">
                    Size: {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-center gap-4 mt-6">
                    <button
                      onClick={handlePreview}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye size={20} />
                      Preview
                    </button>
                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload size={20} />
                          Upload
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Upload Result */}
            {uploadResult && (
              <div className={`mt-6 p-4 rounded-lg ${
                uploadResult.success 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                <div className="flex items-center gap-2">
                  {uploadResult.success ? (
                    <CheckCircle size={20} />
                  ) : (
                    <AlertCircle size={20} />
                  )}
                  <p className="font-semibold">{uploadResult.message}</p>
                </div>
                {uploadResult.success && uploadResult.count && (
                  <p className="mt-2 text-sm">
                    {uploadResult.count} employee(s) have been added to the system.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Download Template Section */}
        <div className="space-y-6">
          {/* Download Template Card */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center gap-3 mb-4">
              <Download size={28} className="text-green-600" />
              <h3 className="font-bold text-gray-800 text-lg">Download Template</h3>
            </div>
            <p className="text-gray-600 text-sm mb-6">
              Download the CSV template file with the correct format to fill in your employee data.
            </p>
            <button
              onClick={handleDownloadTemplate}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md font-semibold text-lg"
            >
              <Download size={24} />
              Download Template
            </button>
          </div>

          {/* Template Format Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-bold text-gray-800 text-lg mb-4">Template Format</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-3 text-sm">Required Fields:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• <strong>Name</strong><br/>
                    <span className="text-xs text-gray-500">LASTNAME, FIRSTNAME MIDDLENAME</span>
                  </li>
                  <li>• <strong>Student Number</strong><br/>
                    <span className="text-xs text-gray-500">YYYY-MM-XXXX or 12-digit</span>
                  </li>
                  <li>• <strong>Department</strong><br/>
                    <span className="text-xs text-gray-500">CIT, CABM, CCJE, etc.</span>
                  </li>
                  <li>• <strong>Gender</strong><br/>
                    <span className="text-xs text-gray-500">MALE or FEMALE (uppercase)</span>
                  </li>
                  <li>• <strong>Birthday</strong><br/>
                    <span className="text-xs text-gray-500">YYYY-MM-DD format</span>
                  </li>
                  <li>• <strong>Contact Number</strong><br/>
                    <span className="text-xs text-gray-500">9-digit mobile number</span>
                  </li>
                  <li>• <strong>Email</strong><br/>
                    <span className="text-xs text-gray-500">Valid email address</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-2 text-sm">Example:</h4>
                <div className="text-xs font-mono text-gray-600 space-y-1">
                  <p>DELA CRUZ, JUAN PEDRO</p>
                  <p>2023-01-0001</p>
                  <p>CIT</p>
                  <p>MALE</p>
                  <p>2003-01-15</p>
                  <p>912345678</p>
                  <p>juan.delacruz@kcp.edu.ph</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Section - Full Width */}
      {showPreview && previewData.rows && (
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Data Preview</h2>
            <span className="text-sm text-gray-600">
              Showing first {previewData.rows.length} rows
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  {previewData.headers.map((header, index) => (
                    <th
                      key={index}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {previewData.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">{rowIndex + 1}</td>
                    {previewData.headers.map((header, colIndex) => (
                      <td
                        key={colIndex}
                        className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap"
                      >
                        {row[header] || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
