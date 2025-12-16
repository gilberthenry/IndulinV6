import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function HRLayout({ children }) {
  const location = useLocation();
  const isDashboard = location.pathname === '/hr/dashboard';

  return (
    <div className="flex h-screen">
      <Sidebar role="hr" />
      <div className="flex-1 flex flex-col overflow-auto">
        {isDashboard && <Navbar />}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}