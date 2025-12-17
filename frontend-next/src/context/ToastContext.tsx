'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';
import Toast from '@/components/Toast';

interface ToastItem {
  id: number;
  message: string;
  time: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

interface ToastContextType {
  showToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning') => void;
}

export const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const id = Date.now();
    const time = new Date().toLocaleTimeString();
    setToasts(prev => [...prev, { id, message, time, type }]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map((t) => (
        <Toast
          key={t.id}
          message={t.message}
          time={t.time}
          type={t.type}
          onClose={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
        />
      ))}
    </ToastContext.Provider>
  );
};
