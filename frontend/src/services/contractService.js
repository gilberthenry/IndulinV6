import api from './api';

const getCurrentContract = () => {
  return api.get('/employee/contracts/current');
};

const getPastContracts = () => {
  return api.get('/employee/contracts/past');
};

const getAllContracts = () => {
  return api.get('/employee/contracts');
};

const downloadContract = (contractId) => {
  return api.get(`/employee/contracts/${contractId}/download`, {
    responseType: 'blob'
  });
};

const requestCertificates = (certificates) => {
  return api.post('/employee/certificates/request', { certificates });
};

const getCertificateRequests = () => {
  return api.get('/employee/certificates/requests');
};

const downloadCertificate = (certificateId) => {
  return api.get(`/employee/certificates/${certificateId}/download`, {
    responseType: 'blob'
  });
};

const contractService = {
  getCurrentContract,
  getPastContracts,
  getAllContracts,
  downloadContract,
  requestCertificates,
  getCertificateRequests,
  downloadCertificate,
};

export default contractService;
