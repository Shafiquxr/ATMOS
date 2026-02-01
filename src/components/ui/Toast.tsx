import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastProps extends Toast {
  onClose: (id: string) => void;
  duration?: number;
}

export function ToastItem({ id, type, title, message, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle
  };

  const colors = {
    success: 'bg-green-50 border-green-600 text-green-900',
    error: 'bg-red-50 border-red-600 text-red-900',
    info: 'bg-blue-50 border-blue-600 text-blue-900',
    warning: 'bg-amber-50 border-amber-600 text-amber-900'
  };

  const iconColors = {
    success: 'text-green-600',
    error: 'text-red-600',
    info: 'text-blue-600',
    warning: 'text-amber-600'
  };

  const Icon = icons[type];

  return (
    <div className={`flex items-start gap-3 p-4 border-2 shadow-retro-sm ${colors[type]} min-w-[300px] max-w-md`}>
      <Icon className={`flex-shrink-0 ${iconColors[type]}`} size={20} />
      <div className="flex-1 min-w-0">
        <p className="font-medium">{title}</p>
        {message && <p className="text-sm mt-1 opacity-90">{message}</p>}
      </div>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 p-0.5 hover:bg-black hover:bg-opacity-10 transition-colors"
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  );
}
