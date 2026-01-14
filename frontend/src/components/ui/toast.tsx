import { createContext, useContext, useCallback } from 'react';
import { CheckCircle, X, AlertCircle } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  isVisible: boolean;
}

interface ToastContextType {
  toast: Toast | null;
  showToast: (toast: Toast) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = useCallback((toast: Toast) => {
    setToast(toast);
    // Auto-hide after duration
    if (toast.duration) {
      setTimeout(() => {
        setToast(null);
      }, toast.duration);
    }
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const value = {
    toast,
    showToast,
    hideToast
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function Toast({ id, type, title, message, duration = 5000 }: Omit<Toast> & {
  isVisible?: boolean;
} & Toast) {
  const { toast, showToast } = useToast();

  useEffect(() => {
    if (isVisible !== false) {
      showToast({ id, type, title, message, duration });
    }
  }, [toast, isVisible, showToast, id, type, title, message, duration]);

  if (!toast) {
    return null;
  }

  const getIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <X className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div
      id={id}
      role="alert"
      aria-live={toast?.isVisible ? 'assertive' : 'polite'}
      aria-atomic="true"
      aria-label={title}
      className={cn(
        "fixed bottom-4 right-4 z-50 max-w-sm bg-white",
        "border border-border rounded-lg shadow-lg",
        "p-4",
        "mb-4",
        "transform transition-all duration-300 ease-in-out",
        toast?.isVisible ? "translate-y-0" : "translate-y-full",
        !toast?.isVisible && "translate-y-full"
      )}
    >
      <div className="flex items-start gap-3">
        {getIcon(type)}
        <div className="flex-1">
          <h4 className="text-sm font-medium">{title}</h4>
          <p className="text-xs text-muted-foreground">{message}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={toast?.hideToast}
          aria-label="Dismiss notification"
          className="h-6 w-6"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      </div>
    </div>
  );
}