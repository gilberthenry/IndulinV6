'use client';

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import notificationService, { Notification } from '@/services/notificationService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface NotificationContextType {
  notifications: Notification[];
  markAsRead: (id: number) => Promise<void>;
  archiveNotification: (id: number) => Promise<void>;
  restoreNotification: (id: number) => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  markAsRead: async () => {},
  archiveNotification: async () => {},
  restoreNotification: async () => {},
  deleteNotification: async () => {},
});

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (!user) return;

    let socket: Socket | null = null;

    // Initial fetch
    async function fetchNotifications() {
      try {
        const data = await notificationService.getNotifications(user!.id);
        setNotifications(data);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    }
    fetchNotifications();

    // Connect to socket
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    socket = io(socketUrl);
    
    socket.on(`notification:${user.id}`, (notif: Notification) => {
      setNotifications((prev) => [notif, ...prev]);
      showToast(notif.message);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user, showToast]);

  const markAsRead = async (id: number) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const archiveNotification = async (id: number) => {
    await notificationService.archiveNotification(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, archived: true, read: true } : n))
    );
  };

  const restoreNotification = async (id: number) => {
    await notificationService.restoreNotification(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, archived: false } : n))
    );
  };

  const deleteNotification = async (id: number) => {
    await notificationService.deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      markAsRead, 
      archiveNotification, 
      restoreNotification, 
      deleteNotification 
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
