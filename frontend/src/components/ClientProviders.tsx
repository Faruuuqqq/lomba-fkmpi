'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext'
import { PWAProvider } from '@/contexts/PWAContext';
import { ToastProvider } from '@/components/ToastProvider';
import { GamificationProvider } from '@/contexts/GamificationContext';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <PWAProvider>
        <AuthProvider>
          <GamificationProvider>
            <ToastProvider />
            {children}
          </GamificationProvider>
        </AuthProvider>
      </PWAProvider>
    </ThemeProvider>
  );
}