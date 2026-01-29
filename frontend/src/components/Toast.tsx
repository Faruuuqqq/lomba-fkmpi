'use client';

import { useEffect, useState, useRef } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type = 'info', duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      animationTimerRef.current = setTimeout(onClose, 300); // Wait for animation
    }, duration);

    return () => {
      clearTimeout(timer);
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
    };
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const config = {
    success: {
      bg: 'bg-green-500',
      border: 'border-green-700',
      icon: CheckCircle,
      iconColor: 'text-white',
    },
    error: {
      bg: 'bg-bauhaus-red',
      border: 'border-[#121212]',
      icon: AlertCircle,
      iconColor: 'text-white',
    },
    warning: {
      bg: 'bg-bauhaus-yellow',
      border: 'border-[#121212]',
      icon: AlertTriangle,
      iconColor: 'text-black',
    },
    info: {
      bg: 'bg-bauhaus-blue',
      border: 'border-[#121212]',
      icon: Info,
      iconColor: 'text-white',
    },
  };

  const { bg, border, icon: Icon, iconColor } = config[type];
  const textColor = type === 'warning' ? 'text-black' : 'text-white';

  return (
    <div
      className={`fixed top-4 right-4 z-[9999] transition-all duration-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
    >
      <div
        className={`${bg} ${textColor} border-4 ${border} shadow-bauhaus-lg min-w-[320px] max-w-md`}
      >
        <div className="flex items-start gap-3 p-4">
          <Icon className={`w-6 h-6 ${iconColor} flex-shrink-0 mt-0.5`} strokeWidth={3} />
          <p className="flex-1 font-bold text-sm leading-relaxed">{message}</p>
          <button
            onClick={handleClose}
            className={`${iconColor} hover:opacity-70 transition-opacity flex-shrink-0`}
          >
            <X className="w-5 h-5" strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Toast Container Component
interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

let toastId = 0;
const toastListeners: ((toasts: ToastMessage[]) => void)[] = [];
let toasts: ToastMessage[] = [];

function notifyListeners() {
  toastListeners.forEach((listener) => listener([...toasts]));
}

export const toast = {
  success: (message: string) => {
    const id = `toast-${toastId++}`;
    toasts.push({ id, message, type: 'success' });
    notifyListeners();
  },
  error: (message: string) => {
    const id = `toast-${toastId++}`;
    toasts.push({ id, message, type: 'error' });
    notifyListeners();
  },
  warning: (message: string) => {
    const id = `toast-${toastId++}`;
    toasts.push({ id, message, type: 'warning' });
    notifyListeners();
  },
  info: (message: string) => {
    const id = `toast-${toastId++}`;
    toasts.push({ id, message, type: 'info' });
    notifyListeners();
  },
};

export function ToastContainer() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  useEffect(() => {
    toastListeners.push(setMessages);
    return () => {
      const index = toastListeners.indexOf(setMessages);
      if (index > -1) {
        toastListeners.splice(index, 1);
      }
    };
  }, []);

  const removeToast = (id: string) => {
    toasts = toasts.filter((t) => t.id !== id);
    notifyListeners();
  };

  return (
    <div className="fixed top-0 right-0 z-[9999] pointer-events-none">
      <div className="flex flex-col gap-3 p-4 pointer-events-auto">
        {messages.map((toast, index) => (
          <div
            key={toast.id}
            style={{ transform: `translateY(${index * 4}px)` }}
            className="transition-transform"
          >
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
