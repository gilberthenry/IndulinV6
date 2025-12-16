import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function MISLayout({ children }) {
  const location = useLocation();
  const isDashboard = location.pathname === '/mis/dashboard';

  return (
    <div className="flex h-screen">
      <Sidebar role="mis" />
      <div className="flex-1 flex flex-col overflow-auto">
        {isDashboard && <Navbar />}
        <main>{children}</main>
      </div>
    </div>
  );
}