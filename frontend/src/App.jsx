import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import { AuthContext } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Employee Pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import EmployeeProfile from './pages/employee/EmployeeProfile';
import EmployeeContracts from './pages/employee/EmployeeContracts';
import EmployeeCertificates from './pages/employee/EmployeeCertificates';
import EmployeeLeaves from './pages/employee/EmployeeLeaves';
import EmployeeDocuments from './pages/employee/EmployeeDocuments';
import EmployeeNotifications from './pages/employee/EmployeeNotifications';

// HR Pages
import HRDashboard from './pages/hr/HRDashboard';
import HREmployees from './pages/hr/HREmployees';
import HRAddEmployee from './pages/hr/HRAddEmployee';
import HRContracts from './pages/hr/HRContracts';
import HRCertificates from './pages/hr/HRCertificates';
import HRReports from './pages/hr/HRReports';
import HRBulkUpload from './pages/hr/HRBulkUpload';
import HRDocuments from './pages/hr/HRDocuments';
import HRLeave from './pages/hr/HRLeave';
import HRDepartments from './pages/hr/HRDepartments';
import HRResetPasswords from './pages/hr/HRResetPasswords';
import HRExportTool from './pages/hr/HRExportTool';
import HRManageStatuses from './pages/hr/HRManageStatuses';
import HRRequests from './pages/hr/HRRequests';
import ProfileRequests from './pages/hr/ProfileRequests';
import ProfileRequestDetail from './pages/hr/ProfileRequestDetail';

// HR Report Pages
import ContractReports from './pages/hr/reports/ContractReports';
import LeaveReports from './pages/hr/reports/LeaveReports';
import DocumentReports from './pages/hr/reports/DocumentReports';
import DisciplinaryReports from './pages/hr/reports/DisciplinaryReports';
import EmployeeList from './pages/hr/reports/EmployeeList';
import IdDirectory from './pages/hr/reports/IdDirectory';

// MIS Pages
import MISDashboard from './pages/mis/MISDashboard';
import MISAuditLogs from './pages/mis/MISAuditLogs';
import MISDocuments from './pages/mis/MISDocuments';
import MISContracts from './pages/mis/MISContracts';
import MISBackups from './pages/mis/MISBackups';
import MISAccounts from './pages/mis/MISAccounts';
import MISSystemReports from './pages/mis/MISSystemReports';
import MISCertificatesLogs from './pages/mis/MISCertificatesLogs';
import MISCertificatesDownload from './pages/mis/MISCertificatesDownload';
import MISLeaveManagement from './pages/mis/MISLeaveManagement';
import MISNotifications from './pages/mis/MISNotifications';
import MISPasswordManagement from './pages/mis/MISPasswordManagement';
import MISConfigRequests from './pages/mis/MISConfigRequests';

// Layouts
import EmployeeLayout from './layouts/EmployeeLayout';
import HRLayout from './layouts/HRLayout';
import MISLayout from './layouts/MISLayout';

// Components
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <NotificationProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />

              {/* Employee Routes */}
              <Route
                path="/employee/*"
                element={
                  <ProtectedRoute allowedRoles={['employee', 'hr', 'mis']}>
                    <EmployeeRoutes />
                  </ProtectedRoute>
                }
              />

              {/* HR Routes */}
              <Route
                path="/hr/*"
                element={
                  <ProtectedRoute allowedRoles={['hr', 'mis']}>
                    <HRRoutes />
                  </ProtectedRoute>
                }
              />

              {/* MIS Routes */}
              <Route
                path="/mis/*"
                element={
                  <ProtectedRoute allowedRoles={['mis']}>
                    <MISRoutes />
                  </ProtectedRoute>
                }
              />

              <Route path="/" element={<Root />} />
            </Routes>
          </Router>
        </NotificationProvider>
      </ToastProvider>
    </AuthProvider>
  );
};

const Root = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" />;
  }

  switch (user.role) {
    case 'employee':
      return <Navigate to="/employee/dashboard" />;
    case 'hr':
      return <Navigate to="/hr/dashboard" />;
    case 'mis':
      return <Navigate to="/mis/dashboard" />;
    default:
      return <Navigate to="/login" />;
  }
};

const EmployeeRoutes = () => (
  <EmployeeLayout>
    <Routes>
      <Route path="dashboard" element={<EmployeeDashboard />} />
      <Route path="profile" element={<EmployeeProfile />} />
      <Route path="contracts" element={<EmployeeContracts />} />
      <Route path="certificates" element={<EmployeeCertificates />} />
      <Route path="leaves" element={<EmployeeLeaves />} />
      <Route path="documents" element={<EmployeeDocuments />} />
      <Route path="notifications" element={<EmployeeNotifications />} />
    </Routes>
  </EmployeeLayout>
);

const HRRoutes = () => (
  <HRLayout>
    <Routes>
      <Route path="dashboard" element={<HRDashboard />} />
      <Route path="employees" element={<HREmployees />} />
      <Route path="employees/add" element={<HRAddEmployee />} />
      <Route path="config-requests" element={<HRRequests />} />
      <Route path="profile-requests" element={<ProfileRequests />} />
      <Route path="profile-requests/:id" element={<ProfileRequestDetail />} />
      <Route path="contracts" element={<HRContracts />} />
      <Route path="certificates" element={<HRCertificates />} />
      <Route path="reports" element={<HRReports />} />
      <Route path="bulk-upload" element={<HRBulkUpload />} />
      <Route path="documents" element={<HRDocuments />} />
      <Route path="leave" element={<HRLeave />} />
      <Route path="departments" element={<HRDepartments />} />
      <Route path="reset-passwords" element={<HRResetPasswords />} />
      <Route path="export-tool" element={<HRExportTool />} />
      <Route path="manage-statuses" element={<HRManageStatuses />} />
      <Route path="reports/contracts" element={<ContractReports />} />
      <Route path="reports/leave" element={<LeaveReports />} />
      <Route path="reports/documents" element={<DocumentReports />} />
      <Route path="reports/disciplinary" element={<DisciplinaryReports />} />
      <Route path="reports/employee-list" element={<EmployeeList />} />
      <Route path="reports/id-directory" element={<IdDirectory />} />
    </Routes>
  </HRLayout>
);

const MISRoutes = () => (
  <MISLayout>
    <Routes>
      <Route path="dashboard" element={<MISDashboard />} />
      <Route path="config-requests" element={<MISConfigRequests />} />
      <Route path="audit-logs" element={<MISAuditLogs />} />
      <Route path="documents" element={<MISDocuments />} />
      <Route path="contracts" element={<MISContracts />} />
      <Route path="leave-management" element={<MISLeaveManagement />} />
      <Route path="notifications" element={<MISNotifications />} />
      <Route path="backups" element={<MISBackups />} />
      <Route path="accounts" element={<MISAccounts />} />
      <Route path="accounts/password-management" element={<MISPasswordManagement />} />
      <Route path="system-reports" element={<MISSystemReports />} />
      <Route path="certificates/logs" element={<MISCertificatesLogs />} />
      <Route path="certificates/download" element={<MISCertificatesDownload />} />
    </Routes>
  </MISLayout>
);

export default App;