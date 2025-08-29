'use client';

import { useState, useEffect, useRef, useMemo } from 'react';

interface Command {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  shortcut?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

export default function CommandPalette({ isOpen, onClose, onNavigate }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = useMemo(() => [
    { id: 'dashboard', label: 'Go to Dashboard', icon: '📊', action: () => onNavigate('dashboard') },
    { id: 'users', label: 'Manage Users', icon: '👥', action: () => onNavigate('users'), shortcut: 'Ctrl+U' },
    { id: 'competitions', label: 'View Competitions', icon: '🥋', action: () => onNavigate('competitions') },
    { id: 'scoring', label: 'Start Scoring', icon: '✍️', action: () => onNavigate('scoring') },
    { id: 'results', label: 'View Results', icon: '🏆', action: () => onNavigate('results') },
    { id: 'logs', label: 'Activity Logs', icon: '📝', action: () => onNavigate('logs') },
    { id: 'theme', label: 'Toggle Theme', icon: '🌙', action: () => document.documentElement.classList.toggle('dark') },
  ], [onNavigate]);

  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (filteredCommands.length > 0) {
            setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (filteredCommands.length > 0) {
            setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
          }
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            onClose();
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent text-lg outline-none text-gray-900 dark:text-white placeholder-gray-500"
          />
        </div>
        
        <div className="max-h-80 overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No commands found
            </div>
          ) : (
            filteredCommands.map((command, index) => (
              <button
                key={command.id}
                onClick={() => {
                  command.action();
                  onClose();
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  index === selectedIndex ? 'bg-primary-50 dark:bg-primary-900/20 border-r-2 border-primary-500' : ''
                }`}
              >
                <span className="text-xl">{command.icon}</span>
                <span className="flex-1 text-gray-900 dark:text-white">{command.label}</span>
                {command.shortcut && (
                  <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                    {command.shortcut}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
        
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
          <span>↑↓ navigate • ↵ select • esc close</span>
          <span>Ctrl+K to open</span>
        </div>
      </div>
    </div>
  );
}