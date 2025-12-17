import EmployeeLayout from '@/components/layouts/EmployeeLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function EmployeeRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['employee', 'hr', 'mis']}>
      <EmployeeLayout>{children}</EmployeeLayout>
    </ProtectedRoute>
  );
}
