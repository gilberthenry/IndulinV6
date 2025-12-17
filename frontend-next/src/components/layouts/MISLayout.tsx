'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

interface MISLayoutProps {
  children: React.ReactNode;
}

export default function MISLayout({ children }: MISLayoutProps) {
  const pathname = usePathname();
  const isDashboard = pathname === '/mis/dashboard';

  return (
    <div className="flex h-screen">
      <Sidebar role="mis" />
      <div className="flex-1 flex flex-col overflow-auto">
        {isDashboard && <Navbar />}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
