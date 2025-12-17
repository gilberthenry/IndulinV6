'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import NotificationBell from './NotificationBell';
import { LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const dashboardRoutes = [
    '/employee/dashboard',
    '/hr/dashboard',
    '/mis/dashboard',
  ];
  const isDashboardPage = dashboardRoutes.includes(pathname);

  // Helper to get page title from path
  const getPageTitle = () => {
    const path = pathname.split('/').pop();
    if (path === 'dashboard') {
      const role = pathname.split('/')[1];
      return `${role.toUpperCase()} Dashboard`;
    }
    return path
      ? path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ')
      : 'Dashboard';
  };

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30 px-8 py-4">
      <div className="flex justify-between items-center">
        {/* Page Title / Breadcrumb */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{getPageTitle()}</h2>
          {isDashboardPage && (
            <p className="text-sm text-gray-500">
              Welcome back, {user?.fullName?.split(' ')[0]}
            </p>
          )}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-6">
          <NotificationBell />

          <div className="h-8 w-px bg-gray-200"></div>

          {user && (
            <div className="flex items-center space-x-4" key={user.profileImage || user.id}>
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-gray-700">
                  {user.fullName}
                </p>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  {user.role}
                </p>
              </div>

              <div className="relative group">
                {user.profileImage && (
                  <img
                    src={`${backendUrl}${user.profileImage}`}
                    alt={user.fullName}
                    className="w-10 h-10 rounded-full object-cover shadow-md ring-2 ring-white"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      const sibling = (e.target as HTMLImageElement).nextElementSibling;
                      if (sibling) (sibling as HTMLElement).style.display = 'flex';
                    }}
                  />
                )}
                <button 
                  className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 text-white font-bold items-center justify-center shadow-md ring-2 ring-white"
                  style={{ display: user.profileImage ? 'none' : 'flex' }}
                >
                  {user.fullName?.charAt(0) || 'U'}
                </button>
                
                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center"
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
