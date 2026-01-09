import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'error';
  duration?: number;
}

interface NotificationToastProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const getColors = () => {
    switch(toast.type) {
      case 'success':
        return {
          bg: 'bg-emerald-500',
          border: 'border-emerald-600',
          text: 'text-white',
          icon: CheckCircle2
        };
      case 'warning':
        return {
          bg: 'bg-amber-500',
          border: 'border-amber-600',
          text: 'text-white',
          icon: AlertCircle
        };
      case 'error':
        return {
          bg: 'bg-red-500',
          border: 'border-red-600',
          text: 'text-white',
          icon: AlertCircle
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-500',
          border: 'border-blue-600',
          text: 'text-white',
          icon: Info
        };
    }
  };

  const colors = getColors();
  const Icon = colors.icon;

  return (
    <div
      className={`
        ${colors.bg} ${colors.text} rounded-lg shadow-lg p-4 min-w-80 
        border ${colors.border} pointer-events-auto
        transform transition-all duration-300
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
      `}
    >
      <div className="flex gap-3 items-start">
        <Icon size={20} className="flex-shrink-0 mt-0.5" />
        
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm">{toast.title}</p>
          {toast.message && (
            <p className="text-sm opacity-90 mt-1">{toast.message}</p>
          )}
        </div>

        <button
          onClick={() => {
            setIsExiting(true);
            setTimeout(() => onRemove(toast.id), 300);
          }}
          className="flex-shrink-0 hover:opacity-75 transition-opacity"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;
