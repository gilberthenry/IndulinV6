import HRLayout from '@/components/layouts/HRLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function HRRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['hr', 'mis']}>
      <HRLayout>{children}</HRLayout>
    </ProtectedRoute>
  );
}
