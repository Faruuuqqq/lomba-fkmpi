import { useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  description: string;
  action: () => void;
  condition?: () => boolean;
  enabled?: boolean;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    for (const shortcut of shortcuts) {
      const { key, condition, action, enabled = true } = shortcut;
      
      if (enabled && (!condition || condition()) && event.key === key && !event.ctrlKey && !event.altKey && !event.metaKey) {
        event.preventDefault();
        action();
      }
    }
  }, [shortcuts]);

  return { handleKeyDown };
}