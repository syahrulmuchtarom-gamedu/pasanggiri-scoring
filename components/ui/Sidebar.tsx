'use client';

import { useState } from 'react';
import { User } from '@/types';
import ThemeToggle from '@/components/ThemeToggle';

interface SidebarProps {
  user: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

const MENU_ITEMS = {
  SUPER_ADMIN: [
    { id: 'users', label: 'Manajemen User', icon: '👥', shortcut: 'U' },
    { id: 'competitions', label: 'Pertandingan', icon: '🥋', shortcut: 'C' },
    { id: 'details', label: 'Detail Penilaian', icon: '📋', shortcut: 'P' },
    { id: 'logs', label: 'Log Aktivitas', icon: '📝', shortcut: 'L' },
    { id: 'system', label: 'Sistem', icon: '⚙️', shortcut: 'S' }
  ],
  ADMIN: [
    { id: 'overview', label: 'Dashboard', icon: '📊', shortcut: 'D' },
    { id: 'competitions', label: 'Ranking', icon: '🥋', shortcut: 'C' },
    { id: 'details', label: 'Detail Penilaian', icon: '📋', shortcut: 'P' },
    { id: 'users', label: 'User', icon: '👥', shortcut: 'U' },
    { id: 'logs', label: 'Log Aktivitas', icon: '📝', shortcut: 'L' }
  ],
  KOORDINATOR: [
    { id: 'overview', label: 'Dashboard', icon: '📊', shortcut: 'D' },
    { id: 'competitions', label: 'Supervisi Sesi', icon: '🥋', shortcut: 'C' },
    { id: 'results', label: 'Ranking', icon: '🏆', shortcut: 'R' },
    { id: 'details', label: 'Detail Penilaian', icon: '📋', shortcut: 'P' }
  ],
  SIRKULATOR: [
    { id: 'control', label: 'Kontrol Sesi', icon: '🥋', shortcut: 'C' },
    { id: 'results', label: 'Hasil', icon: '🏆', shortcut: 'R' }
  ],
  JURI: [
    { id: 'scoring', label: 'Penilaian', icon: '✍️', shortcut: 'S' },
    { id: 'history', label: 'Riwayat', icon: '📚', shortcut: 'H' }
  ],
  VIEWER: [
    { id: 'results', label: 'Hasil', icon: '🏆', shortcut: 'R' },
    { id: 'ranking', label: 'Ranking', icon: '🥇', shortcut: 'K' }
  ]
};

export default function Sidebar({ user, activeTab, onTabChange, onLogout }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const getRoleKey = (role: string) => {
    if (role.includes('KOORDINATOR')) return 'KOORDINATOR';
    if (role.includes('SIRKULATOR')) return 'SIRKULATOR';
    if (role.includes('JURI')) return 'JURI';
    return role;
  };
  
  const roleKey = getRoleKey(user.role);
  
  const menuItems = MENU_ITEMS[roleKey as keyof typeof MENU_ITEMS] || [];

  return (
    <div className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 flex items-center justify-center">
              <img 
                src="/images/logo.png" 
                alt="Logo" 
                className="h-8 w-8" 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'block';
                }}
              />
              <span className="text-2xl hidden">🥋</span>
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-900 dark:text-white">PASANGGIRI</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user.username}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
              activeTab === item.id
                ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {!isCollapsed && (
              <>
                <span className="font-medium flex-1 text-left">{item.label}</span>
                <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.shortcut}
                </span>
              </>
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <div className="flex items-center justify-between">
          <ThemeToggle />
          {!isCollapsed && (
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <span>🚪</span>
              <span className="text-sm font-medium">Keluar</span>
            </button>
          )}
        </div>
        
        {!isCollapsed && (
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            <div className="flex items-center justify-center space-x-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span>Online</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}