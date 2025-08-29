'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import SirkulatorDashboard from '@/components/SirkulatorDashboard';
import JuriDashboard from '@/components/JuriDashboard';
import SuperAdminDashboard from '@/components/SuperAdminDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import KoordinatorDashboard from '@/components/KoordinatorDashboard';
import ViewerDashboard from '@/components/ViewerDashboard';
import { Sidebar, CommandPalette, FloatingActionButton, LoadingSpinner } from '@/components/ui';
import { useKeyboardShortcuts, COMMON_SHORTCUTS } from '@/hooks/useKeyboardShortcuts';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/auth/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } catch (error) {
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      ...COMMON_SHORTCUTS.COMMAND_PALETTE,
      action: () => setCommandPaletteOpen(true)
    },
    {
      key: 'd',
      action: () => setActiveTab('dashboard'),
      description: 'Go to dashboard'
    },
    {
      key: 'u',
      action: () => setActiveTab('users'),
      description: 'Manage users'
    }
  ]);

  // FAB actions based on user role
  const getFABActions = () => {
    if (user?.role.includes('JURI')) {
      return [
        { id: 'score', label: 'Quick Score', icon: '✍️', action: () => setActiveTab('scoring') },
        { id: 'history', label: 'History', icon: '📚', action: () => setActiveTab('history') }
      ];
    }
    if (user?.role.includes('SIRKULATOR')) {
      return [
        { id: 'create', label: 'New Session', icon: '➕', action: () => setActiveTab('competitions') },
        { id: 'results', label: 'Results', icon: '🏆', action: () => setActiveTab('results') }
      ];
    }
    return [
      { id: 'refresh', label: 'Refresh', icon: '🔄', action: () => window.location.reload() },
      { id: 'help', label: 'Help', icon: '❓', action: () => setCommandPaletteOpen(true) }
    ];
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Memuat dashboard..." />;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop: Sidebar + Content */}
      <div className="hidden lg:flex">
        <Sidebar 
          user={user} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          onLogout={handleLogout} 
        />
        <div className="flex-1 ml-64">
          <main className="p-6">
            {user.role === 'SUPER_ADMIN' && <SuperAdminDashboard user={user} />}
            {user.role === 'ADMIN' && <AdminDashboard user={user} />}
            {(user.role === 'KOORDINATOR_PUTRA' || user.role === 'KOORDINATOR_PUTRI') && (
              <KoordinatorDashboard user={user} />
            )}
            {(user.role === 'SIRKULATOR_PUTRA' || user.role === 'SIRKULATOR_PUTRI') && (
              <SirkulatorDashboard user={user} />
            )}
            {(user.role === 'JURI_PUTRA' || user.role === 'JURI_PUTRI') && <JuriDashboard user={user} />}
            {user.role === 'VIEWER' && <ViewerDashboard user={user} />}
          </main>
        </div>
      </div>

      {/* Mobile: Header + Content + FAB */}
      <div className="lg:hidden">
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 sticky top-0 z-40">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img src="/images/logo.png" alt="Logo" className="h-8 w-8" />
                <div>
                  <h1 className="font-bold text-lg text-gray-900 dark:text-white">PASANGGIRI</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.username} - {user.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-red-600 dark:text-red-400 text-sm font-medium"
              >
                Keluar
              </button>
            </div>
          </div>
        </header>
        
        <main className="p-4">
          {user.role === 'SUPER_ADMIN' && <SuperAdminDashboard user={user} />}
          {user.role === 'ADMIN' && <AdminDashboard user={user} />}
          {(user.role === 'KOORDINATOR_PUTRA' || user.role === 'KOORDINATOR_PUTRI') && (
            <KoordinatorDashboard user={user} />
          )}
          {(user.role === 'SIRKULATOR_PUTRA' || user.role === 'SIRKULATOR_PUTRI') && (
            <SirkulatorDashboard user={user} />
          )}
          {(user.role === 'JURI_PUTRA' || user.role === 'JURI_PUTRI') && <JuriDashboard user={user} />}
          {user.role === 'VIEWER' && <ViewerDashboard user={user} />}
        </main>
        
        <FloatingActionButton actions={getFABActions()} />
      </div>

      {/* Command Palette */}
      <CommandPalette 
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={setActiveTab}
      />
    </div>
  );
}