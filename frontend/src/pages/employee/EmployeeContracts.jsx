import React, { useEffect, useState } from 'react';
import contractService from '../../services/contractService';
import CurrentContractCard from '../../components/CurrentContractCard';
import PastContractsTable from '../../components/PastContractsTable';
import { useToast } from '../../context/ToastContext';

export default function EmployeeContracts() {
  const [currentContract, setCurrentContract] = useState(null);
  const [pastContracts, setPastContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [currentRes, pastRes] = await Promise.all([
        contractService.getCurrentContract().catch(() => ({ data: null })),
        contractService.getPastContracts().catch(() => ({ data: [] }))
      ]);
      
      setCurrentContract(currentRes.data);
      setPastContracts(pastRes.data);
    } catch (error) {
      console.error('Failed to fetch contract data:', error);
      showToast('Failed to load contract information', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadContract = async (contractId) => {
    try {
      const response = await contractService.downloadContract(contractId);
      
      // Create blob from response
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `contract_${contractId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showToast('Contract downloaded successfully', 'success');
    } catch (error) {
      console.error('Failed to download contract:', error);
      showToast('Failed to download contract', 'error');
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-gray-50/50 min-h-screen">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading contract information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50/50 min-h-screen">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Contracts</h1>
        <p className="text-gray-500 mt-1">
          Manage your employment contracts and request certificates
        </p>
      </div>

      {/* Main Content - Stacked Sections */}
      <div className="space-y-8">
        {/* Current Contract Section */}
        <CurrentContractCard 
          contract={currentContract} 
          onDownload={handleDownloadContract}
        />

        {/* Past Contracts Section */}
        <PastContractsTable 
          contracts={pastContracts}
          onDownload={handleDownloadContract}
        />
      </div>
    </div>
  );
}
