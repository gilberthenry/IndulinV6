import MISLayout from '@/components/layouts/MISLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function MISRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['mis']}>
      <MISLayout>{children}</MISLayout>
    </ProtectedRoute>
  );
}
