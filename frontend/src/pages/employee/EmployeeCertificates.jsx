import React, { useEffect, useState } from 'react';
import contractService from '../../services/contractService';
import CertificateRequestForm from '../../components/CertificateRequestForm';
import CertificateStatus from '../../components/CertificateStatus';
import { useToast } from '../../context/ToastContext';
import { Award } from 'lucide-react';

export default function EmployeeCertificates() {
  const [certificateRequests, setCertificateRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchCertificateRequests();
  }, []);

  const fetchCertificateRequests = async () => {
    try {
      setLoading(true);
      const certRes = await contractService.getCertificateRequests().catch(() => ({ data: [] }));
      setCertificateRequests(certRes.data);
    } catch (error) {
      console.error('Failed to fetch certificate requests:', error);
      showToast('Failed to load certificate requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCertificates = async (selectedCertificates) => {
    try {
      setSubmitting(true);
      await contractService.requestCertificates(selectedCertificates);
      showToast('Certificate request(s) submitted successfully', 'success');
      
      // Refresh certificate requests
      const certRes = await contractService.getCertificateRequests();
      setCertificateRequests(certRes.data);
    } catch (error) {
      console.error('Failed to request certificates:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || 'Failed to submit certificate request';
      showToast(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadCertificate = async (certificateId) => {
    try {
      const response = await contractService.downloadCertificate(certificateId);
      
      // Create blob from response
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate_${certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showToast('Certificate downloaded successfully', 'success');
    } catch (error) {
      console.error('Failed to download certificate:', error);
      showToast('Failed to download certificate', 'error');
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-gray-50/50 min-h-screen">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading certificate information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50/50 min-h-screen">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-100 p-2.5 rounded-lg">
            <Award className="h-7 w-7 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Certificates</h1>
            <p className="text-gray-500 mt-1">
              Request and manage your employment certificates
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - Stacked Sections */}
      <div className="space-y-8">
        {/* Certificate Request Section */}
        <CertificateRequestForm 
          onSubmit={handleRequestCertificates}
          loading={submitting}
        />

        {/* Certificate Status Section */}
        <CertificateStatus 
          requests={certificateRequests}
          onDownload={handleDownloadCertificate}
        />
      </div>
    </div>
  );
}
