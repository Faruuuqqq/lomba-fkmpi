'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext'
import { PWAProvider } from '@/contexts/PWAContext';
import { ToastProvider } from '@/components/ToastProvider';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <PWAProvider>
        <AuthProvider>
          <ToastProvider />
          {children}
        </AuthProvider>
      </PWAProvider>
    </ThemeProvider>
  );
}