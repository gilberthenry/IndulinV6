import React, { createContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import notificationService from '../services/notificationService';
import { AuthContext } from './AuthContext';
import { ToastContext } from './ToastContext';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { user } = React.useContext(AuthContext);
  const { showToast } = React.useContext(ToastContext);

  useEffect(() => {
    if (!user) return;

    // Initial fetch
    async function fetchNotifications() {
      const data = await notificationService.getNotifications(user.id);
      setNotifications(data);
    }
    fetchNotifications();

    // Connect to socket
    const socket = io("http://localhost:5000"); // backend port
    socket.on(`notification:${user.id}`, (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      showToast(notif.message); // trigger toast popup
    });

    return () => socket.disconnect();
  }, [user, showToast]);

  const markAsRead = async (id) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const archiveNotification = async (id) => {
    await notificationService.archiveNotification(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, archived: true, read: true } : n))
    );
  };

  const restoreNotification = async (id) => {
    await notificationService.restoreNotification(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, archived: false } : n))
    );
  };

  const deleteNotification = async (id) => {
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