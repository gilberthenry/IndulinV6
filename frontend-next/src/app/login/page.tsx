'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import authService from '@/services/authService';
import { Mail, Lock, LogIn, AlertCircle, CheckCircle } from 'lucide-react';

// Component to handle search params - must be wrapped in Suspense
function LoginMessage({ onMessage }: { onMessage: (msg: string) => void }) {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      onMessage(message);
    }
  }, [searchParams, onMessage]);
  
  return null;
}

function LoginPageContent() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleMessageFromParams = useCallback((msg: string) => {
    setSuccessMessage(msg);
  }, []);

  useEffect(() => {
    // Redirect if already logged in
    if (!loading && user) {
      switch (user.role) {
        case 'employee':
          router.push('/employee/dashboard');
          break;
        case 'hr':
          router.push('/hr/dashboard');
          break;
        case 'mis':
          router.push('/mis/dashboard');
          break;
      }
    }
  }, [user, loading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      const { token, refreshToken, user } = await authService.login({ email, password });
      login(user, token, refreshToken);

      if (user.role === 'employee') router.push('/employee/dashboard');
      else if (user.role === 'hr') router.push('/hr/dashboard');
      else if (user.role === 'mis') router.push('/mis/dashboard');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      setError(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Suspense fallback={null}>
        <LoginMessage onMessage={handleMessageFromParams} />
      </Suspense>
      <div 
      className="h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900"
    >
      <div className="flex items-center justify-center h-screen bg-black bg-opacity-50">
        <div className="bg-black/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-96 border border-white/20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl mx-auto shadow-lg mb-4 bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl">
              ES
            </div>
            <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
            <p className="text-blue-200 text-sm mt-1">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 text-red-200 rounded-xl flex items-center text-sm">
              <AlertCircle size={16} className="mr-2 flex-shrink-0" />
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-3 bg-green-500/20 border border-green-500/50 text-green-200 rounded-xl flex items-center text-sm">
              <CheckCircle size={16} className="mr-2 flex-shrink-0" />
              {successMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 group-focus-within:text-blue-400 transition-colors" size={20} />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full bg-slate-800/50 border border-slate-600 text-white placeholder-slate-400 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 group-focus-within:text-blue-400 transition-colors" size={20} />
              <input
                type="password"
                placeholder="Password"
                className="w-full bg-slate-800/50 border border-slate-600 text-white placeholder-slate-400 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="text-right -mt-2 mb-2">
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-blue-400 hover:text-blue-300"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold py-3 rounded-xl hover:from-blue-500 hover:to-blue-400 transform hover:scale-[1.02] transition-all duration-200 shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2"
            >
              <span>Sign In</span>
              <LogIn size={20} />
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-blue-400 hover:text-blue-300">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
    </>
  );
}

export default function LoginPage() {
  return <LoginPageContent />;
}
