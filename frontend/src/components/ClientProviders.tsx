'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext'
import { PWAProvider } from '@/contexts/PWAContext';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <PWAProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </PWAProvider>
    </ThemeProvider>
  );
}