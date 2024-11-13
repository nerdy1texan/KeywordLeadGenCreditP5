import { useState, useEffect } from 'react';

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, toast.duration || 3000);

      return () => clearTimeout(timer);
    }
  }, [toast]);

  return {
    toast: (message: string, type: ToastState['type'] = 'info', duration?: number) => {
      setToast({ message, type, duration });
    },
    dismiss: () => setToast(null),
  };
}
