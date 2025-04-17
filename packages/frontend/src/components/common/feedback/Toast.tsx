import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useToast } from '@hooks/useToast';

export const Toast: React.FC = () => {
  const { toasts, removeToast } = useToast();

  // Auto remove toast after timeout
  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        removeToast(toasts[0].id);
      }, toasts[0].duration || 5000);

      return () => clearTimeout(timer);
    }
  }, [toasts, removeToast]);

  if (toasts.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getToastClass = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50';
      case 'error':
        return 'border-l-red-500 bg-red-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'info':
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 w-full max-w-xs">
      <div className="space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start p-4 shadow-md rounded-md border-l-4 ${getToastClass(
              toast.type
            )} transform transition-all duration-300 ease-in-out animate-fade-in`}
            role="alert"
          >
            <div className="flex-shrink-0 mr-3">{getIcon(toast.type)}</div>
            <div className="flex-1 ml-2">
              {toast.title && (
                <h4 className="text-sm font-medium text-gray-900">
                  {toast.title}
                </h4>
              )}
              <div className="text-sm text-gray-700">{toast.message}</div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};