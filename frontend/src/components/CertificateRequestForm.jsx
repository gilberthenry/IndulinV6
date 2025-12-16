import React, { useState } from 'react';
import { Send, FileCheck } from 'lucide-react';

const AVAILABLE_CERTIFICATES = [
  {
    id: 'service_record',
    label: 'Service Record',
    description: 'Complete record of service history and positions held'
  },
  {
    id: 'certificate_of_good_moral_character',
    label: 'Certificate of Good Moral Character',
    description: 'Certifies good moral standing and conduct'
  },
  {
    id: 'certificate_of_employment',
    label: 'Certificate of Employment',
    description: 'Certifies current or past employment with the organization'
  },
  {
    id: 'certificate_of_performance_rating',
    label: 'Certificate of Performance Rating',
    description: 'Statement of work performance and evaluation ratings'
  }
];

const CertificateRequestForm = ({ onSubmit, loading }) => {
  const [selectedCertificates, setSelectedCertificates] = useState([]);

  const handleToggleCertificate = (certId) => {
    setSelectedCertificates(prev => {
      if (prev.includes(certId)) {
        return prev.filter(id => id !== certId);
      } else {
        return [...prev, certId];
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedCertificates.length === 0) {
      alert('Please select at least one certificate to request');
      return;
    }
    onSubmit(selectedCertificates);
    setSelectedCertificates([]); // Reset after submission
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-50 p-2.5 rounded-lg">
            <FileCheck className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Request Certificates</h2>
            <p className="text-gray-500 text-sm mt-1">Select the certificates you need</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-8">
        <div className="space-y-4 mb-6">
          {AVAILABLE_CERTIFICATES.map((cert) => (
            <label
              key={cert.id}
              className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all ${
                selectedCertificates.includes(cert.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedCertificates.includes(cert.id)}
                onChange={() => handleToggleCertificate(cert.id)}
                className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div className="ml-4 flex-1">
                <div className="font-semibold text-gray-800">{cert.label}</div>
                <div className="text-sm text-gray-500 mt-1">{cert.description}</div>
              </div>
            </label>
          ))}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || selectedCertificates.length === 0}
          className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
            loading || selectedCertificates.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
          }`}
        >
          <Send className="h-5 w-5" />
          <span>
            {loading 
              ? 'Submitting...' 
              : `Submit Request${selectedCertificates.length > 1 ? 's' : ''} (${selectedCertificates.length})`
            }
          </span>
        </button>

        {selectedCertificates.length > 0 && (
          <p className="text-sm text-gray-500 text-center mt-4">
            You have selected {selectedCertificates.length} certificate{selectedCertificates.length > 1 ? 's' : ''}
          </p>
        )}
      </form>
    </div>
  );
};

export default CertificateRequestForm;
