/**
 * Centralized Storage Utility
 * Provides type-safe localStorage operations for tokens and auth data
 */

const STORAGE_KEYS = {
  TOKEN: 'token',
  THEME: 'theme',
  OFFLINE_QUEUE: 'offline-queue',
} as const;

export const storage = {
  // Token Management
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  setToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  },

  removeToken: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  },

  // Theme Management
  getTheme: (): 'light' | 'dark' | null => {
    if (typeof window === 'undefined') return null;
    const theme = localStorage.getItem(STORAGE_KEYS.THEME);
    return theme === 'light' || theme === 'dark' ? theme : null;
  },

  setTheme: (theme: 'light' | 'dark'): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },

  // Offline Queue Management
  getOfflineQueue: (): any[] => {
    if (typeof window === 'undefined') return [];
    const queue = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
    return queue ? JSON.parse(queue) : [];
  },

  setOfflineQueue: (queue: any[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
  },

  clearOfflineQueue: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
  },

  // Generic Operations
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(key);
  },

  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, value);
  },

  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },

  clearAll: (): void => {
    if (typeof window === 'undefined') return;
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  },
};
