import React, { useState, useEffect, useContext } from 'react';
import { Bell, AlertTriangle, Database, Activity, CheckCircle, Clock, Shield, Filter, Trash2, Archive, RefreshCw } from 'lucide-react';
import { io } from 'socket.io-client';
import { AuthContext } from '../../context/AuthContext';
import notificationService from '../../services/notificationService';
import misService from '../../services/misService';

export default function MISNotifications() {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    if (!user) return;

    // Fetch initial notifications
    fetchNotifications();

    // Connect to socket for real-time updates
    const socket = io("http://localhost:5000");
    
    // Listen for system-level notifications (MIS only)
    socket.on(`mis:notification`, (notif) => {
      const formattedNotif = {
        id: notif.id || Date.now(),
        type: notif.type || 'info',
        category: notif.category || 'system',
        title: notif.title || 'System Notification',
        message: notif.message,
        timestamp: notif.timestamp || new Date().toISOString(),
        read: false,
        priority: notif.priority || 'medium'
      };
      setNotifications((prev) => [formattedNotif, ...prev]);
    });

    // Listen for backup notifications
    socket.on(`backup:complete`, (data) => {
      const backupNotif = {
        id: Date.now(),
        type: 'backup',
        category: 'backup',
        title: 'Backup Completed',
        message: `System backup completed successfully. Size: ${data.size || 'N/A'}`,
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'medium'
      };
      setNotifications((prev) => [backupNotif, ...prev]);
    });

    // Listen for critical system alerts
    socket.on(`system:critical`, (data) => {
      const criticalNotif = {
        id: Date.now(),
        type: 'critical',
        category: 'system',
        title: 'Critical System Alert',
        message: data.message,
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'high'
      };
      setNotifications((prev) => [criticalNotif, ...prev]);
    });

    // Listen for log alerts
    socket.on(`logs:alert`, (data) => {
      const logNotif = {
        id: Date.now(),
        type: 'alert',
        category: 'logs',
        title: data.title || 'Log Alert',
        message: data.message,
        timestamp: new Date().toISOString(),
        read: false,
        priority: data.priority || 'medium'
      };
      setNotifications((prev) => [logNotif, ...prev]);
    });

    return () => socket.disconnect();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // Fetch user notifications
      const userNotifs = await notificationService.getNotifications(user.id);
      
      // Transform user notifications to system format
      const systemNotifs = userNotifs.map(notif => ({
        id: notif.id,
        type: determineType(notif.message),
        category: determineCategory(notif.message),
        title: extractTitle(notif.message),
        message: notif.message,
        timestamp: notif.createdAt || new Date().toISOString(),
        read: notif.read || false,
        priority: determinePriority(notif.message)
      }));
      
      setNotifications(systemNotifs);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Set sample data if fetch fails
      setSampleNotifications();
    } finally {
      setLoading(false);
    }
  };

  const setSampleNotifications = () => {
    setNotifications([
      {
        id: 1,
        type: 'critical',
        category: 'system',
        title: 'Critical System Issue Detected',
        message: 'Database connection pool exhausted. Immediate attention required.',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        read: false,
        priority: 'high'
      },
      {
        id: 2,
        type: 'backup',
        category: 'backup',
        title: 'Daily Backup Completed',
        message: 'System backup completed successfully. Size: 2.4 GB',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        read: false,
        priority: 'medium'
      },
      {
        id: 3,
        type: 'alert',
        category: 'logs',
        title: 'Unusual Log Activity',
        message: 'High volume of error logs detected in the past hour.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        read: true,
        priority: 'high'
      }
    ]);
  };

  const determineType = (message) => {
    if (message.toLowerCase().includes('critical') || message.toLowerCase().includes('error')) return 'critical';
    if (message.toLowerCase().includes('backup')) return 'backup';
    if (message.toLowerCase().includes('warning') || message.toLowerCase().includes('alert')) return 'warning';
    if (message.toLowerCase().includes('log')) return 'alert';
    return 'info';
  };

  const determineCategory = (message) => {
    if (message.toLowerCase().includes('backup')) return 'backup';
    if (message.toLowerCase().includes('log')) return 'logs';
    return 'system';
  };

  const determinePriority = (message) => {
    if (message.toLowerCase().includes('critical') || message.toLowerCase().includes('urgent')) return 'high';
    if (message.toLowerCase().includes('warning') || message.toLowerCase().includes('alert')) return 'medium';
    return 'low';
  };

  const extractTitle = (message) => {
    if (message.length > 50) {
      return message.substring(0, 47) + '...';
    }
    return message;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle size={24} className="text-red-500" />;
      case 'backup':
        return <Database size={24} className="text-blue-500" />;
      case 'alert':
      case 'warning':
        return <Activity size={24} className="text-orange-500" />;
      case 'info':
        return <Bell size={24} className="text-green-500" />;
      default:
        return <Bell size={24} className="text-gray-500" />;
    }
  };

  const getNotificationBg = (type, read) => {
    const baseClasses = read ? 'bg-gray-50' : 'bg-white border-l-4';
    switch (type) {
      case 'critical':
        return `${baseClasses} border-red-500`;
      case 'backup':
        return `${baseClasses} border-blue-500`;
      case 'alert':
      case 'warning':
        return `${baseClasses} border-orange-500`;
      case 'info':
        return `${baseClasses} border-green-500`;
      default:
        return baseClasses;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">High Priority</span>;
      case 'medium':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Medium</span>;
      case 'low':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Low</span>;
      default:
        return null;
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (days < 7) {
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Update locally anyway
      setNotifications(notifications.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      ));
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Mark all unread notifications as read
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      await Promise.all(unreadIds.map(id => notificationService.markAsRead(id).catch(() => {})));
      setNotifications(notifications.map(notif => ({ ...notif, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
      setNotifications(notifications.map(notif => ({ ...notif, read: true })));
    }
  };

  const handleDeleteNotification = (id) => {
    if (confirm('Are you sure you want to delete this notification?')) {
      setNotifications(notifications.filter(notif => notif.id !== id));
    }
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all read notifications?')) {
      setNotifications(notifications.filter(notif => !notif.read));
    }
  };

  const handleRefresh = () => {
    fetchNotifications();
  };

  const filteredNotifications = notifications.filter(notif => {
    const statusMatch = filter === 'all' || 
                       (filter === 'unread' && !notif.read) || 
                       (filter === 'read' && notif.read);
    const categoryMatch = categoryFilter === 'all' || notif.category === categoryFilter;
    return statusMatch && categoryMatch;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const criticalCount = notifications.filter(n => n.type === 'critical' && !n.read).length;

  return (
    <div className="p-8 bg-gray-50/50 min-h-screen space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">System Notifications</h1>
          <p className="text-sm text-gray-600 mt-1 flex items-center">
            <Shield size={16} className="inline mr-1" />
            Receives system-level alerts, critical system issue notifications, backup and log alerts
            <span className="ml-3 flex items-center text-green-600">
              <Activity size={14} className="mr-1 animate-pulse" />
              Live
            </span>
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={loading}
          >
            <RefreshCw size={20} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <CheckCircle size={20} className="mr-2" />
              Mark All Read
            </button>
          )}
          <button
            onClick={handleClearAll}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Archive size={20} className="mr-2" />
            Clear Read
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Notifications</p>
              <p className="text-3xl font-bold text-gray-800">{notifications.length}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Bell size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Unread</p>
              <p className="text-3xl font-bold text-orange-600">{unreadCount}</p>
            </div>
            <div className="bg-orange-100 rounded-full p-3">
              <Activity size={24} className="text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Critical Alerts</p>
              <p className="text-3xl font-bold text-red-600">{criticalCount}</p>
            </div>
            <div className="bg-red-100 rounded-full p-3">
              <AlertTriangle size={24} className="text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Backup Alerts</p>
              <p className="text-3xl font-bold text-blue-600">
                {notifications.filter(n => n.category === 'backup').length}
              </p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Database size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Filter size={20} className="text-gray-500 mr-3" />
            <h2 className="text-lg font-semibold text-gray-700">Filters</h2>
          </div>
          {(filter !== 'all' || categoryFilter !== 'all') && (
            <button
              onClick={() => {
                setFilter('all');
                setCategoryFilter('all');
              }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Categories</option>
              <option value="system">System Alerts</option>
              <option value="backup">Backup Alerts</option>
              <option value="logs">Log Alerts</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Notification Feed</h2>
          <span className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-800">{filteredNotifications.length}</span> notifications
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw size={32} className="animate-spin text-emerald-600 mr-3" />
            <span className="text-gray-600">Loading notifications...</span>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell size={48} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600">No notifications found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`${getNotificationBg(notification.type, notification.read)} rounded-xl shadow-sm p-6 transition-all hover:shadow-lg hover:-translate-y-0.5 duration-200`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="bg-white rounded-xl p-3 shadow-sm">
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className={`text-lg font-semibold ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}>
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                              New
                            </span>
                          )}
                        </div>
                        <p className={`text-sm leading-relaxed ${notification.read ? 'text-gray-500' : 'text-gray-700'}`}>
                          {notification.message}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {getPriorityBadge(notification.priority)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center text-xs text-gray-500 space-x-3">
                        <span className="flex items-center">
                          <Clock size={14} className="mr-1.5" />
                          {formatTimestamp(notification.timestamp)}
                        </span>
                        <span className="flex items-center px-2.5 py-1 bg-gray-100 rounded-full text-gray-700 font-medium capitalize">
                          {notification.category}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="inline-flex items-center px-3 py-1.5 text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium transition-colors"
                          >
                            <CheckCircle size={14} className="mr-1" />
                            Mark Read
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteNotification(notification.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
