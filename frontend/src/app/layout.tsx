import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext'
import { PWAProvider } from '@/contexts/PWAContext';
import { useEffect, useState } from 'react';

'use client';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MITRA AI - Academic Writing Assistant',
  description: 'AI-powered academic writing platform that encourages critical thinking',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isInstallBannerVisible, setIsInstallBannerVisible] = useState(false);

  useEffect(() => {
    // Check if PWA is installable and not dismissed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInstalled = localStorage.getItem('pwa-installed') === 'true';
    const wasDismissed = localStorage.getItem('pwa-install-dismissed') === 'true';
    const isInstallable = 'serviceWorker' in navigator && !isStandalone && !isInstalled;

    setIsInstallBannerVisible(isInstallable && !wasDismissed);
  }, []);

  const dismissInstallBanner = () => {
    setIsInstallBannerVisible(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#6366f1" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/icons/icon-76x76.png" />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <PWAProvider>
            <AuthProvider>
              {/* PWA Install Banner */}
              {isInstallBannerVisible && (
                <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white">
                  <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold">Install MITRA AI</h3>
                      <p className="text-xs opacity-90 mt-1">
                        Get the full experience on your device
                      </p>
                    </div>
                    <button
                      onClick={dismissInstallBanner}
                      className="text-white hover:bg-blue-700 px-3 py-1 text-xs rounded transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                  <div className="max-w-md mx-auto px-4 pb-3">
                    <button
                      onClick={() => {
                        // Trigger PWA install prompt
                        const event = new CustomEvent('pwa-install');
                        window.dispatchEvent(event);
                      }}
                      className="bg-white text-blue-600 hover:bg-blue-50 px-3 py-1 text-xs font-medium rounded transition-colors"
                    >
                      Install App
                    </button>
                  </div>
                </div>
              )}
              
              {children}
            </AuthProvider>
          </PWAProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}