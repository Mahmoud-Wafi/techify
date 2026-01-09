import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { api } from '../api/client';
import { Notification } from '../types';

interface NotificationCenterProps {
  lang: 'en' | 'ar';
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ lang }) => {
  const isEn = lang === 'en';
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await api.notifications.list();
      setNotifications(Array.isArray(data) ? data : data?.results || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Mark notification as read
  const markAsRead = async (id: number) => {
    try {
      await api.notifications.markRead(id);
      setNotifications(n => n.map(notif => 
        notif.id === id ? { ...notif, is_read: true } : notif
      ));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications(n => n.map(notif => ({ ...notif, is_read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  // Get icon based on notification type
  const getIcon = (type: string) => {
    switch(type) {
      case 'success': return <CheckCircle2 size={18} className="text-emerald-500" />;
      case 'warning': return <AlertCircle size={18} className="text-amber-500" />;
      case 'info': return <Info size={18} className="text-blue-500" />;
      default: return <Bell size={18} className="text-slate-500" />;
    }
  };

  // Get badge color based on type
  const getBgColor = (type: string) => {
    switch(type) {
      case 'success': return 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30';
      case 'warning': return 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30';
      case 'info': return 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30';
      default: return 'bg-slate-50 dark:bg-slate-500/10 border-slate-200 dark:border-slate-500/30';
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} className="text-slate-600 dark:text-slate-400" />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-white/10 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 dark:text-white">
              {isEn ? 'Notifications' : 'الإشعارات'}
            </h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-500/30 transition-colors"
                >
                  {isEn ? 'Mark All' : 'تحديد الكل'}
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-slate-500">
                {isEn ? 'Loading...' : 'جاري التحميل...'}
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer ${getBgColor(notification.type)} border border-slate-200 dark:border-white/10 m-2 rounded-lg`}
                  onClick={() => !notification.is_read && markAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${notification.is_read ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    {!notification.is_read && (
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2" />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500">
                {isEn ? 'No notifications' : 'لا توجد إشعارات'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
