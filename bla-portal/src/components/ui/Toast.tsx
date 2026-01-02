'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    // Auto remove after duration
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Toast[];
  removeToast: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

const toastConfig: Record<ToastType, { icon: ReactNode; className: string }> = {
  success: {
    icon: <CheckCircle className="w-5 h-5" />,
    className: 'bg-success/10 border-success/20 text-success',
  },
  error: {
    icon: <AlertCircle className="w-5 h-5" />,
    className: 'bg-error/10 border-error/20 text-error',
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5" />,
    className: 'bg-warning/10 border-warning/20 text-warning',
  },
  info: {
    icon: <Info className="w-5 h-5" />,
    className: 'bg-accent/10 border-accent/20 text-accent',
  },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const config = toastConfig[toast.type];

  return (
    <div
      className={cn(
        'pointer-events-auto flex items-start gap-3 p-4 rounded-[8px] border bg-white shadow-md',
        'animate-slide-in-right'
      )}
      role="alert"
    >
      <div className={cn('flex-shrink-0', config.className.split(' ').pop())}>
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-primary">{toast.title}</p>
        {toast.message && (
          <p className="text-sm text-text-secondary mt-0.5">{toast.message}</p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="flex-shrink-0 p-1 text-text-muted hover:text-primary transition-colors rounded"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// Offline banner component
export function OfflineBanner() {
  return (
    <div className="bg-warning text-primary px-4 py-2 text-center text-sm font-medium">
      <span className="inline-flex items-center gap-2">
        <AlertTriangle className="w-4 h-4" />
        You are currently offline. Some features may be unavailable.
      </span>
    </div>
  );
}
