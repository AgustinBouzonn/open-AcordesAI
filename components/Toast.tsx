import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  variant: ToastVariant;
  text: string;
  ttl: number;
}

interface ToastContextValue {
  showToast: (text: string, variant?: ToastVariant, ttlMs?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) return { showToast: () => undefined };
  return ctx;
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((text: string, variant: ToastVariant = 'info', ttlMs = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, variant, text, ttl: ttlMs }]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[1100] flex flex-col gap-2 pointer-events-none w-full max-w-md px-4">
        {toasts.map((t) => <ToastItem key={t.id} toast={t} onDismiss={dismiss} />)}
      </div>
    </ToastContext.Provider>
  );
};

const VARIANT_STYLES: Record<ToastVariant, { bg: string; border: string; icon: React.ReactNode }> = {
  success: { bg: 'bg-emerald-950/90', border: 'border-emerald-700', icon: <CheckCircle2 size={18} className="text-emerald-400 shrink-0" /> },
  error:   { bg: 'bg-red-950/90',     border: 'border-red-700',     icon: <AlertTriangle size={18} className="text-red-400 shrink-0" /> },
  info:    { bg: 'bg-dark-800',       border: 'border-dark-600',    icon: <Info size={18} className="text-brand shrink-0" /> },
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: number) => void }> = ({ toast, onDismiss }) => {
  const styles = VARIANT_STYLES[toast.variant];
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), toast.ttl);
    return () => window.clearTimeout(timer);
  }, [toast.id, toast.ttl, onDismiss]);

  return (
    <div className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-xl text-sm text-white animate-in slide-in-from-top-2 fade-in duration-200 ${styles.bg} ${styles.border}`}>
      {styles.icon}
      <span className="flex-1">{toast.text}</span>
      <button onClick={() => onDismiss(toast.id)} className="text-gray-400 hover:text-white shrink-0" aria-label="Cerrar">
        <X size={16} />
      </button>
    </div>
  );
};
