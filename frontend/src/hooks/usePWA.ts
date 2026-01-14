import { useState, useEffect } from 'react';

export interface BeforeInstallPromptEvent {
  prompt: () => Promise<void>;
  userChoice: Promise<'accepted' | 'dismissed'>;
}

export interface PWAInstallPrompt {
  isInstallable: boolean;
  prompt: () => Promise<void>;
  isInstalled: boolean;
}

export function usePWA(): PWAInstallPrompt {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      localStorage.setItem('pwa-installed', 'true');
    };

    // Check if already installed
    const isAlreadyInstalled = localStorage.getItem('pwa-installed') === 'true';
    if (isAlreadyInstalled) {
      setIsInstalled(true);
      return;
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) {
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        localStorage.setItem('pwa-installed', 'true');
      }
    } catch (error) {
      console.error('PWA installation failed:', error);
      setDeferredPrompt(null);
    }
  };

  return {
    isInstallable: !!deferredPrompt && !isInstalled,
    prompt: installPWA,
    isInstalled
  };
}