'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

interface EmployeeLayoutProps {
  children: React.ReactNode;
}

export default function EmployeeLayout({ children }: EmployeeLayoutProps) {
  const pathname = usePathname();
  const isDashboard = pathname === '/employee/dashboard';

  return (
    <div className="flex h-screen">
      <Sidebar role="employee" />
      <div className="flex-1 flex flex-col overflow-auto">
        {isDashboard && <Navbar />}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
