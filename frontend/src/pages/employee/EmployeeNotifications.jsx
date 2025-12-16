import React, { useContext, useState } from 'react';
import { NotificationContext } from '../../context/NotificationContext';
import { AuthContext } from '../../context/AuthContext';
import { Bell, Clock, CheckCircle2, AlertCircle, Info, Check, Archive, Filter, Trash2, RefreshCw } from 'lucide-react';

export default function EmployeeNotifications() {
  const { notifications, markAsRead, archiveNotification, restoreNotification, deleteNotification } = useContext(NotificationContext);
  const { user } = useContext(AuthContext);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read', 'archived'
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all', 'leave', 'document', 'certificate', 'password'
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const getNotificationIcon = (message) => {
    const msg = message.toLowerCase();
    if (msg.includes('rejected') || msg.includes('error') || msg.includes('failed')) {
      return <AlertCircle size={24} className="text-red-500 flex-shrink-0" />;
    }
    if (msg.includes('approved') || msg.includes('success') || msg.includes('completed')) {
      return <CheckCircle2 size={24} className="text-green-500 flex-shrink-0" />;
    }
    if (msg.includes('password')) {
      return <AlertCircle size={24} className="text-orange-500 flex-shrink-0" />;
    }
    return <Info size={24} className="text-blue-500 flex-shrink-0" />;
  };

  const getNotificationCategory = (message) => {
    const msg = message.toLowerCase();
    if (msg.includes('leave')) return 'leave';
    if (msg.includes('document')) return 'document';
    if (msg.includes('certificate')) return 'certificate';
    if (msg.includes('password')) return 'password';
    return 'general';
  };

  const formatTime = (time) => {
    if (!time) return 'Just now';
    const date = new Date(time);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minute${Math.floor(diff / 60) > 1 ? 's' : ''} ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) > 1 ? 's' : ''} ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatFullDate = (time) => {
    if (!time) return 'Unknown date';
    const date = new Date(time);
    return date.toLocaleString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getCategoryBadge = (category) => {
    const styles = {
      leave: 'bg-purple-100 text-purple-700 border-purple-200',
      document: 'bg-blue-100 text-blue-700 border-blue-200',
      certificate: 'bg-green-100 text-green-700 border-green-200',
      password: 'bg-orange-100 text-orange-700 border-orange-200',
      general: 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[category]}`}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </span>
    );
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread' && (n.read || n.archived)) return false;
    if (filter === 'read' && (!n.read || n.archived)) return false;
    if (filter === 'archived' && !n.archived) return false;
    if (filter === 'all' && n.archived) return false; // Don't show archived in 'all'
    
    if (categoryFilter !== 'all') {
      const category = getNotificationCategory(n.message);
      if (category !== categoryFilter) return false;
    }
    
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read && !n.archived).length;
  const archivedCount = notifications.filter(n => n.archived).length;

  const markAllAsRead = () => {
    notifications.filter(n => !n.read && !n.archived).forEach(n => markAsRead(n.id));
  };

  const handleDelete = async (id) => {
    await deleteNotification(id);
    setShowDeleteConfirm(null);
  };

  const handleArchive = async (id) => {
    await archiveNotification(id);
  };

  const handleRestore = async (id) => {
    await restoreNotification(id);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Check size={18} />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          {/* Status Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
            <div className="flex gap-2">
              {['all', 'unread', 'read', 'archived'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === f
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                  {f === 'archived' && archivedCount > 0 && (
                    <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                      {archivedCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
            <div className="flex gap-2 flex-wrap">
              {['all', 'leave', 'document', 'certificate', 'password'].map(c => (
                <button
                  key={c}
                  onClick={() => setCategoryFilter(c)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    categoryFilter === c
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Bell size={36} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No notifications</h3>
            <p className="text-gray-500">
              {filter === 'unread' 
                ? "You don't have any unread notifications" 
                : categoryFilter !== 'all'
                ? `No ${categoryFilter} notifications found`
                : "You don't have any notifications yet"}
            </p>
          </div>
        ) : (
          filteredNotifications.map((n) => (
            <div
              key={n.id}
              className={`bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md ${
                !n.read 
                  ? 'border-l-4 border-l-blue-500 border-y border-r border-gray-200' 
                  : 'border border-gray-200'
              }`}
            >
              <div className="p-5">
                <div className="flex gap-4">
                  <div className="mt-1">
                    {getNotificationIcon(n.message)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        {getCategoryBadge(getNotificationCategory(n.message))}
                      </div>
                      <div className="flex items-center gap-2">
                        {!n.read && !n.archived && (
                          <span className="inline-block w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></span>
                        )}
                        {n.archived ? (
                          <button
                            onClick={() => handleRestore(n.id)}
                            className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
                          >
                            Restore
                          </button>
                        ) : (
                          <button
                            onClick={() => markAsRead(n.id)}
                            className={`text-sm font-medium transition-colors ${
                              !n.read 
                                ? 'text-blue-600 hover:text-blue-700' 
                                : 'text-gray-400 cursor-default'
                            }`}
                            disabled={n.read}
                          >
                            {n.read ? 'Read' : 'Mark as read'}
                          </button>
                        )}
                      </div>
                    </div>
                    <p className={`text-base leading-relaxed mb-3 ${
                      !n.read ? 'text-gray-900 font-medium' : 'text-gray-600'
                    }`}>
                      {n.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} />
                          <span>{formatTime(n.time || n.createdAt)}</span>
                        </div>
                        <span className="text-gray-300">•</span>
                        <span>{formatFullDate(n.time || n.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {!n.archived && (
                          <button
                            onClick={() => handleArchive(n.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Archive notification"
                          >
                            <Archive size={16} />
                            Archive
                          </button>
                        )}
                        <button
                          onClick={() => setShowDeleteConfirm(n.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete notification"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delete Confirmation Modal */}
              {showDeleteConfirm === n.id && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-red-100 rounded-full p-3">
                        <AlertCircle size={24} className="text-red-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Delete Notification</h3>
                    </div>
                    <p className="text-gray-600 mb-6">
                      Are you sure you want to delete this notification? This action cannot be undone.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(n.id)}
                        className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Statistics Footer */}
      {notifications.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-5 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{unreadCount}</p>
              <p className="text-sm text-gray-600">Unread</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {notifications.filter(n => n.read && !n.archived).length}
              </p>
              <p className="text-sm text-gray-600">Read</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{archivedCount}</p>
              <p className="text-sm text-gray-600">Archived</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {notifications.filter(n => getNotificationCategory(n.message) === 'leave').length}
              </p>
              <p className="text-sm text-gray-600">Leave Related</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
