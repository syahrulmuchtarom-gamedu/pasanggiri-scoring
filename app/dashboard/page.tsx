'use client';

import { useState, useEffect, useMemo } from 'react';
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
  const getDefaultTab = (userRole: string) => {
    if (!userRole) return 'users';
    if (userRole === 'SUPER_ADMIN') return 'users';
    if (userRole === 'ADMIN') return 'overview';
    if (userRole.includes('KOORDINATOR')) return 'overview';
    if (userRole.includes('SIRKULATOR')) return 'control';
    if (userRole.includes('JURI')) return 'scoring';
    if (userRole === 'VIEWER') return 'results';
    return 'users';
  };
  
  const [activeTab, setActiveTab] = useState('users'); // Will be updated when user loads
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
      setActiveTab(getDefaultTab(parsedUser.role));
    } catch (error) {
      console.error('Error parsing user data:', error);
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
      action: () => setActiveTab('users'),
      description: 'Go to users'
    },
    {
      key: 'u',
      action: () => setActiveTab('users'),
      description: 'Manage users'
    }
  ]);

  // FAB actions based on user role (memoized)
  const getFABActions = useMemo(() => {
    if (user?.role.includes('JURI')) {
      return [
        { id: 'score', label: 'Quick Score', icon: '✍️', action: () => setActiveTab('scoring') },
        { id: 'history', label: 'History', icon: '📚', action: () => setActiveTab('history') }
      ];
    }
    if (user?.role.includes('SIRKULATOR')) {
      return [
        { id: 'create', label: 'New Session', icon: '➕', action: () => setActiveTab('control') },
        { id: 'results', label: 'Results', icon: '🏆', action: () => setActiveTab('results') }
      ];
    }
    return [
      { id: 'refresh', label: 'Refresh', icon: '🔄', action: () => window.location.reload() },
      { id: 'help', label: 'Help', icon: '❓', action: () => setCommandPaletteOpen(true) }
    ];
  }, [user?.role]);

  // Render dashboard component based on user role (DRY principle)
  const renderDashboard = () => {
    if (user.role === 'SUPER_ADMIN') return <SuperAdminDashboard user={user} activeTab={activeTab} />;
    if (user.role === 'ADMIN') return <AdminDashboard user={user} activeTab={activeTab} />;
    if (user.role === 'KOORDINATOR_PUTRA' || user.role === 'KOORDINATOR_PUTRI') {
      return <KoordinatorDashboard user={user} activeTab={activeTab} />;
    }
    if (user.role === 'SIRKULATOR_PUTRA' || user.role === 'SIRKULATOR_PUTRI') {
      return <SirkulatorDashboard user={user} activeTab={activeTab} />;
    }
    if (user.role === 'JURI_PUTRA' || user.role === 'JURI_PUTRI') {
      return <JuriDashboard user={user} activeTab={activeTab} />;
    }
    if (user.role === 'VIEWER') return <ViewerDashboard user={user} activeTab={activeTab} />;
    return null;
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
            {renderDashboard()}
          </main>
        </div>
      </div>

      {/* Mobile: Header + Content + FAB */}
      <div className="lg:hidden">
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 sticky top-0 z-40">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-xl">☰</span>
                </button>
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
          {renderDashboard()}
        </main>
        
        <FloatingActionButton actions={getFABActions} />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-64">
            <Sidebar 
              user={user} 
              activeTab={activeTab} 
              onTabChange={(tab) => {
                setActiveTab(tab);
                setSidebarOpen(false);
              }} 
              onLogout={handleLogout} 
            />
          </div>
        </div>
      )}

      {/* Command Palette */}
      <CommandPalette 
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={setActiveTab}
      />
    </div>
  );
}