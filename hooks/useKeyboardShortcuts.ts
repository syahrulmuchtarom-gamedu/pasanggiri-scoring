import { useEffect } from 'react';

interface Shortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[], enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      const isInputField = target.tagName === 'INPUT' || 
                          target.tagName === 'TEXTAREA' || 
                          target.isContentEditable;
      
      if (isInputField) return;

      const shortcut = shortcuts.find(s => 
        s.key.toLowerCase() === event.key.toLowerCase() &&
        !!s.ctrlKey === event.ctrlKey &&
        !!s.altKey === event.altKey &&
        !!s.shiftKey === event.shiftKey
      );

      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}

export const COMMON_SHORTCUTS = {
  COMMAND_PALETTE: { key: 'k', ctrlKey: true, description: 'Open command palette' },
  SEARCH: { key: 'f', ctrlKey: true, description: 'Search' },
  SAVE: { key: 's', ctrlKey: true, description: 'Save' },
  REFRESH: { key: 'r', ctrlKey: true, description: 'Refresh' },
  HELP: { key: '?', description: 'Show help' },
  ESCAPE: { key: 'Escape', description: 'Close modal/cancel' }
};