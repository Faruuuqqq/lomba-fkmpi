'use client';

import { createContext, useContext, React } from 'react';

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  swRegistration: ServiceWorkerRegistration | null;
  isOnline: boolean;
  offlineQueue: any[];
}

const PWAContext = createContext<PWAState | null>(null);

interface PWAProviderProps {
  children: React.ReactNode;
}

export function PWAProvider({ children }: PWAProviderProps) {
  const [isInstallable, setIsInstallable] = React.useState(false);
  const [isInstalled, setIsInstalled] = React.useState(false);
  const [isOnline, setIsOnline] = React.useState(true);
  const [swRegistration, setSwRegistration] = React.useState<ServiceWorkerRegistration | null>(null);
  const [offlineQueue, setOfflineQueue] = React.useState<any[]>([]);

  // Check if PWA is installable
  React.useEffect(() => {
    setIsInstallable(
      'serviceWorker' in navigator && 
      'PushManager' in (window as any).serviceWorker &&
      window.matchMedia('(display-mode: standalone)').matches === false
    );
  }, []);

  // Check if PWA is installed
  React.useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    const isInstalled = isStandalone || isInWebAppiOS;
    setIsInstalled(isInstalled);
  }, []);

  // Network status
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Service Worker registration
  React.useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        setSwRegistration(registration);
      console.log('Service Worker registered:', registration);
      });

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        navigator.serviceWorker.ready.then((registration) => {
          setSwRegistration(registration);
        });
      });
    }
  }, []);

  // Offline queue management
  React.useEffect(() => {
    const savedQueue = localStorage.getItem('offlineQueue');
    if (savedQueue) {
      setOfflineQueue(JSON.parse(savedQueue));
    }
  }, []);

  const value = {
    isInstallable,
    isInstalled,
    isOnline,
    swRegistration,
    isOnline,
    offlineQueue
  };

  return (
    <PWAContext.Provider value={value}>
      {children}
    </PWAContext.Provider>
  );
}

export function usePWA() {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
}