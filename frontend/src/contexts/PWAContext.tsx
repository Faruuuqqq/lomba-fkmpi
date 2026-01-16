'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  swRegistration: ServiceWorkerRegistration | null;
  offlineQueue: any[];
}

interface PWAContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  swRegistration: ServiceWorkerRegistration | null;
  offlineQueue: any[];
  addToOfflineQueue: (action: any) => void;
  clearOfflineQueue: () => void;
}

const PWAContext = createContext<PWAContextType | null>(null);

export function usePWA(): PWAContextType {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
}

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);

  useEffect(() => {
    // Check if app is installable
    if ('beforeinstallprompt' in window) {
      setIsInstallable(true);
    }

    // Check if app is installed
    const isStandalone = (window.navigator as any).standalone || 
                        window.matchMedia('(display-mode: standalone)').matches;
    setIsInstalled(isStandalone);

    // Check online status
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    
    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          setSwRegistration(registration);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  useEffect(() => {
    // Handle beforeinstallprompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    // Sync offline queue when online
    if (isOnline && offlineQueue.length > 0) {
      const queue = [...offlineQueue];
      setOfflineQueue([]);
      
      queue.forEach(item => {
        // Process queued items
        console.log('Processing offline queue item:', item);
      });
    }
  }, [isOnline, offlineQueue]);

  const addToOfflineQueue = (action: any) => {
    setOfflineQueue(prev => [...prev, action]);
  };

  const clearOfflineQueue = () => {
    setOfflineQueue([]);
  };

  const value: PWAContextType = {
    isInstallable,
    isInstalled,
    isOnline,
    swRegistration,
    offlineQueue,
    addToOfflineQueue,
    clearOfflineQueue,
  };

  return (
    <PWAContext.Provider value={value}>
      {children}
    </PWAContext.Provider>
  );
}